/**
 * The unified review queue, ported from Drizzle+Postgres to the store.
 *
 * `ReviewItemRecord` (db/model.ts) already carries a `summary` string set by
 * whichever code created the item, so this lane no longer joins out to the
 * escalation/export/alert/intake it refers to just to describe it - the old
 * Postgres version's `loadContext` join is gone; the item is self-describing.
 *
 * Answering a chat_amber item and approving an export request each raise a
 * Record entry (see `lib/raiseEntry.ts`) the moment the item leaves the
 * queue, inside the same `mutateOrg` as the state change itself.
 */

import type { ReviewItemType } from "@maximus/shared";
import type { ChatMessageRecord, OrgDoc, ReviewItemRecord } from "../db/model.ts";
import { exportKey, listOrgIds, mutateOrg, newId, readOrg, writeExportBlob } from "../db/store.ts";
import { writeAudit } from "./audit.ts";
import { generateDefenceFile } from "./defenceFile.ts";
import { latestApprovedPolicies } from "./policies.ts";
import { raiseExportEntry, raiseGuideEntry } from "./raiseEntry.ts";

export class ReviewError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export interface PendingReviewItem {
  id: string;
  type: ReviewItemType;
  refId: string;
  summary: string;
  createdAt: string;
  /**
   * What the review queue needs to show about the thing being reviewed. The
   * Postgres build joined this out of four tables; the store holds them on the
   * organisation document, so it is assembled here. It is always an object,
   * never absent: the queue renders from it, and an absent context used to
   * take the whole admin workspace down the moment a first item arrived.
   */
  context: Record<string, unknown>;
}

/**
 * Find which organisation a review item (or, by their id, an escalation)
 * belongs to. Review items and escalations live inside a per-org document
 * (no global table any more), so a route that only carries the item's own id
 * - as the original API contract does - scans the small, beta-scale set of
 * organisations rather than requiring a new query parameter.
 */
export async function findReviewItemOrgId(reviewItemId: string): Promise<string | null> {
  for (const orgId of await listOrgIds()) {
    const doc = await readOrg(orgId);
    if (doc?.review.some((r) => r.id === reviewItemId)) return orgId;
  }
  return null;
}

export async function findEscalationOrgId(escalationId: string): Promise<string | null> {
  for (const orgId of await listOrgIds()) {
    const doc = await readOrg(orgId);
    if (doc?.escalations.some((e) => e.id === escalationId)) return orgId;
  }
  return null;
}

/** Pending items for an organisation, oldest first, optional type filter. */
export async function pendingReviewItems(
  orgId: string,
  typeFilter?: ReviewItemType,
): Promise<PendingReviewItem[]> {
  const doc = await readOrg(orgId);
  if (!doc) return [];
  return doc.review
    .filter((item) => item.state === "pending" && (!typeFilter || item.type === typeFilter))
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
    .map((item) => ({
      id: item.id,
      type: item.type as ReviewItemType,
      refId: item.refId,
      summary: item.summary,
      createdAt: item.createdAt,
      context: reviewContext(doc, item),
    }));
}

/** The detail the queue shows for one item, by its type. */
function reviewContext(doc: OrgDoc, item: ReviewItemRecord): Record<string, unknown> {
  if (item.type === "chat_amber") {
    const escalation = doc.escalations.find((e) => e.id === item.refId);
    const reply = escalation
      ? doc.messages
          .filter((m) => m.threadId === escalation.threadId && m.sender === "guide")
          .slice(-1)[0]
      : undefined;
    return {
      question: escalation?.question ?? item.summary,
      guideReply: reply?.body ?? "The Guide did not answer and raised this for you.",
    };
  }
  if (item.type === "export_request") {
    const record = doc.exports.find((e) => e.id === item.refId);
    return {
      exportState: record?.state ?? "requested",
      requestedBy: record?.requestedByName ?? "",
    };
  }
  if (item.type === "alert") {
    const alert = doc.alerts.find((a) => a.id === item.refId);
    return {
      summary: alert?.summary ?? item.summary,
      kind: alert?.kind ?? "",
      severity: alert?.severity ?? "",
      isDemo: alert?.demo ?? true,
    };
  }
  if (item.type === "intake") {
    const intake = doc.intakes.find((i) => i.id === item.refId);
    return {
      intakeType: intake?.type === "breach" ? "Reported concern" : "Data request",
      source: intake?.source ?? "manual",
      summary: intake?.summary ?? item.summary,
    };
  }
  return { summary: item.summary };
}

/** Spec §5.1: answering posts the officer's reply into the client's thread. */
export async function answerChatAmber(
  orgId: string,
  reviewItemId: string,
  officerId: string,
  officerName: string,
  reply: string,
): Promise<ChatMessageRecord> {
  const message = await mutateOrg(orgId, (doc) => {
    const item = doc.review.find((r) => r.id === reviewItemId && r.state === "pending" && r.type === "chat_amber");
    if (!item) throw new ReviewError("Review item not found or already decided.", 404);
    const escalation = doc.escalations.find((e) => e.id === item.refId);
    if (!escalation || escalation.state !== "open") {
      throw new ReviewError("This escalation has already been answered.", 409);
    }

    const now = new Date().toISOString();
    const created: ChatMessageRecord = {
      id: newId(),
      threadId: escalation.threadId!,
      sender: "officer",
      body: reply,
      citations: [],
      escalated: false,
      createdAt: now,
    };
    doc.messages.push(created);

    escalation.state = "answered";
    escalation.answer = reply;
    escalation.answeredBy = officerId;
    escalation.answeredAt = now;

    item.state = "approved";
    item.decidedBy = officerId;
    item.decidedAt = now;

    raiseGuideEntry(doc, { refId: escalation.id, reviewer: officerName, decisionNote: reply });

    return created;
  });

  await writeAudit({
    orgId,
    actorId: officerId,
    actorName: officerName,
    action: "review.answer",
    detail: `type=chat_amber messageId=${message.id}`,
  });

  return message;
}

/** Approve an export request: generates the defence file and stores it. */
export async function approveExportRequest(
  orgId: string,
  reviewItemId: string,
  officerId: string,
  officerName: string,
): Promise<string> {
  const exportId = await mutateOrg(orgId, async (doc) => {
    const item = doc.review.find((r) => r.id === reviewItemId && r.state === "pending" && r.type === "export_request");
    if (!item) throw new ReviewError("Review item not found or already decided.", 404);
    const row = doc.exports.find((e) => e.id === item.refId);
    if (!row) throw new ReviewError("Export not found.", 404);
    if (row.state === "generated") throw new ReviewError("Export already generated.", 409);

    const bytes = await generateDefenceFile(doc);
    await writeExportBlob(row.id, bytes);

    const now = new Date().toISOString();
    row.state = "generated";
    row.approvedBy = officerId;
    row.approvedAt = now;
    row.generatedAt = now;
    row.contents = latestApprovedPolicies(doc).map((p) => `${p.code} v${p.version}`);
    row.blobKey = exportKey(row.id);

    const entry = raiseExportEntry(doc, { exportId: row.id, reviewer: officerName });
    row.entryId = entry.id;

    item.state = "approved";
    item.decidedBy = officerId;
    item.decidedAt = now;

    return row.id;
  });

  await writeAudit({
    orgId,
    actorId: officerId,
    actorName: officerName,
    action: "export.generate",
    detail: `exportId=${exportId}`,
  });
  await writeAudit({
    orgId,
    actorId: officerId,
    actorName: officerName,
    action: "review.approve",
    detail: `type=export_request exportId=${exportId}`,
  });

  return exportId;
}

/** Approve an alert or intake review item - no entry, no side effect beyond the decision. */
export async function approveReviewItem(
  orgId: string,
  reviewItemId: string,
  officerId: string,
  officerName: string,
  type: "alert" | "intake",
): Promise<void> {
  await mutateOrg(orgId, (doc) => {
    const item = doc.review.find((r) => r.id === reviewItemId && r.state === "pending" && r.type === type);
    if (!item) throw new ReviewError("Review item not found or already decided.", 404);
    item.state = "approved";
    item.decidedBy = officerId;
    item.decidedAt = new Date().toISOString();
  });

  await writeAudit({
    orgId,
    actorId: officerId,
    actorName: officerName,
    action: "review.approve",
    detail: `type=${type}`,
  });
}

export async function rejectReviewItem(
  orgId: string,
  reviewItemId: string,
  officerId: string,
  officerName: string,
  note?: string,
): Promise<void> {
  const type = await mutateOrg(orgId, (doc) => {
    const item = doc.review.find((r) => r.id === reviewItemId && r.state === "pending");
    if (!item) throw new ReviewError("Review item not found or already decided.", 404);

    if (item.type === "export_request") {
      const i = doc.exports.findIndex((e) => e.id === item.refId);
      if (i !== -1) doc.exports.splice(i, 1);
    }

    item.state = "rejected";
    item.decidedBy = officerId;
    item.decidedAt = new Date().toISOString();
    return item.type;
  });

  await writeAudit({
    orgId,
    actorId: officerId,
    actorName: officerName,
    action: "review.reject",
    detail: `type=${type}${note ? ` note=${note}` : ""}`,
  });
}

/** Resolve a pending review item by ref when the action happens outside the queue. */
export async function resolveReviewByRef(
  orgId: string,
  type: ReviewItemType,
  refId: string,
  state: "approved" | "rejected",
  officerId: string,
): Promise<void> {
  await mutateOrg(orgId, (doc) => {
    const item = doc.review.find((r) => r.type === type && r.refId === refId && r.state === "pending");
    if (!item) return;
    item.state = state;
    item.decidedBy = officerId;
    item.decidedAt = new Date().toISOString();
  });
}

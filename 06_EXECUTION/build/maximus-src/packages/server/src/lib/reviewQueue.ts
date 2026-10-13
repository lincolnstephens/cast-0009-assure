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
import type { ChatMessageRecord, OrgDoc, ReviewItemRecord, TaskRecord } from "../db/model.ts";
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
  /** v1.7. Working days (Monday to Friday) the item has waited. */
  workingDaysWaiting: number;
  /** v1.7 (FRAGO 07 3.1). Unreviewed for 5 working days or more: the amber flag. */
  overdue: boolean;
  /** v1.7. Raised by a test seat. */
  test: boolean;
}

/** v1.7. The system that asks the client for things must answer her: 5 working days, then amber. */
export const REVIEW_AMBER_WORKING_DAYS = 5;

/** Whole working days (Monday to Friday, UTC) from `fromIso` to `now`. Bank holidays are not excluded. */
export function workingDaysBetween(fromIso: string, now: Date = new Date()): number {
  const start = new Date(fromIso);
  if (Number.isNaN(start.getTime()) || start >= now) return 0;
  let days = 0;
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  while (cursor < end) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const dow = cursor.getUTCDay();
    if (dow !== 0 && dow !== 6) days += 1;
  }
  return days;
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
      workingDaysWaiting: workingDaysBetween(item.createdAt),
      overdue: workingDaysBetween(item.createdAt) >= REVIEW_AMBER_WORKING_DAYS,
      test: Boolean(item.test),
    }));
}

/** The detail the queue shows for one item, by its type. */
function reviewContext(doc: OrgDoc, item: ReviewItemRecord): Record<string, unknown> {
  if (item.type === "chat_amber") {
    const escalation = doc.escalations.find((e) => e.id === item.refId);
    // The reply that belongs to this escalation is the Guide message at or
    // just after it was raised, not simply the latest one in the thread: a
    // later question would otherwise be shown against an earlier escalation.
    const reply = escalation
      ? doc.messages
          .filter(
            (m) =>
              m.threadId === escalation.threadId &&
              m.sender === "guide" &&
              m.createdAt >= escalation.createdAt,
          )
          .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))[0]
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
      source:
        intake?.source === "chat"
          ? "the Policy Guide"
          : "the client portal",
      summary: intake?.summary ?? item.summary,
    };
  }
  if (item.type === "document_submission") {
    const d = doc.documents.find((x) => x.id === item.refId);
    const earlier = d?.supersedes ? doc.documents.find((x) => x.id === d.supersedes) : undefined;
    return {
      title: d?.title ?? item.summary,
      area: d?.area ?? null,
      note: d?.submission?.note ?? "",
      kind: d?.kind ?? "file",
      fileName: d?.fileName ?? "",
      sizeBytes: d?.sizeBytes ?? 0,
      url: d?.kind === "link" ? (d?.url ?? "") : "",
      documentId: d?.id ?? null,
      supersedesTitle: earlier?.title ?? null,
      supersedesSection: earlier?.section ?? null,
      searchable: d?.searchable ?? null,
      submittedBy: d?.submission?.submittedByName ?? "",
    };
  }
  return { summary: item.summary };
}

/**
 * v1.7 (FRAGO 07 3.1). Accepting a client submission: the operator chooses
 * the section, and only now is the document published. A new version
 * supersedes the earlier one, which is kept with its history and marked.
 */
export async function acceptDocumentSubmission(
  orgId: string,
  reviewItemId: string,
  officerId: string,
  officerName: string,
  input: { section: "policies" | "procedures" | "trackers"; area?: number },
): Promise<{ documentId: string; superseded: string | null }> {
  const result = await mutateOrg(orgId, (doc) => {
    const item = doc.review.find(
      (r) => r.id === reviewItemId && r.state === "pending" && r.type === "document_submission",
    );
    if (!item) throw new ReviewError("Review item not found or already decided.", 404);
    const d = doc.documents.find((x) => x.id === item.refId);
    if (!d || !d.submission) throw new ReviewError("The document this submission belongs to is gone.", 404);
    const now = new Date().toISOString();
    d.section = input.section;
    if (input.area) d.area = input.area;
    d.published = true;
    d.submission.state = "accepted";
    d.submission.decidedById = officerId;
    d.submission.decidedByName = officerName;
    d.submission.decidedAt = now;
    d.updatedAt = now;
    d.updatedBy = officerName;
    let superseded: string | null = null;
    if (d.supersedes) {
      const earlier = doc.documents.find((x) => x.id === d.supersedes);
      if (earlier && !earlier.supersededBy && !d.test) {
        earlier.supersededBy = d.id;
        earlier.updatedAt = now;
        earlier.updatedBy = officerName;
        superseded = earlier.id;
      }
    }
    item.state = "approved";
    item.decidedBy = officerId;
    item.decidedAt = now;
    return { documentId: d.id, superseded, title: d.title, test: Boolean(d.test) };
  });

  await writeAudit({
    orgId,
    actorId: officerId,
    actorName: officerName,
    action: "document.accept",
    detail: `Document ${result.documentId} ("${result.title}") accepted under ${input.section} and published${result.test ? " (test seat: shown to no client)" : ""}${result.superseded ? `; supersedes ${result.superseded}, which is kept` : ""}.`,
  });
  return { documentId: result.documentId, superseded: result.superseded };
}

/** v1.7. Returning a client submission with a one-line reason the client sees. Nothing is published. */
export async function returnDocumentSubmission(
  orgId: string,
  reviewItemId: string,
  officerId: string,
  officerName: string,
  reason: string,
): Promise<void> {
  const title = await mutateOrg(orgId, (doc) => {
    const item = doc.review.find(
      (r) => r.id === reviewItemId && r.state === "pending" && r.type === "document_submission",
    );
    if (!item) throw new ReviewError("Review item not found or already decided.", 404);
    const d = doc.documents.find((x) => x.id === item.refId);
    if (!d || !d.submission) throw new ReviewError("The document this submission belongs to is gone.", 404);
    const now = new Date().toISOString();
    d.published = false;
    d.submission.state = "returned";
    d.submission.returnReason = reason;
    d.submission.decidedById = officerId;
    d.submission.decidedByName = officerName;
    d.submission.decidedAt = now;
    item.state = "rejected";
    item.decidedBy = officerId;
    item.decidedAt = now;
    return d.title;
  });

  await writeAudit({
    orgId,
    actorId: officerId,
    actorName: officerName,
    action: "document.return",
    detail: `Document submission "${title}" returned to the client with a reason.`,
  });
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

    // v1.7: a test seat's question books nothing on the Record.
    if (!escalation.test) raiseGuideEntry(doc, { refId: escalation.id, reviewer: officerName, decisionNote: reply });

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

/**
 * The operator's answer to a client confirmation.
 *
 * A client saying a task is done is not a status change; it is a claim waiting
 * on MITMARK. Accepting it closes the task, which books the work on the Record
 * exactly as closing it from the workplan does. Reopening clears the claim and
 * leaves the task where it was, so the client sees the confirm control again
 * and nothing false reaches the record.
 */
export async function decideTaskConfirmation(
  orgId: string,
  reviewItemId: string,
  officerId: string,
  officerName: string,
  accept: boolean,
  closeTask: (doc: OrgDoc, task: TaskRecord, officerName: string) => void,
): Promise<void> {
  await mutateOrg(orgId, (doc) => {
    const item = doc.review.find(
      (r) => r.id === reviewItemId && r.state === "pending" && r.type === "task_confirmation",
    );
    if (!item) throw new ReviewError("Review item not found or already decided.", 404);
    const task = doc.tasks.find((t) => t.id === item.refId);
    if (!task) throw new ReviewError("The task this confirmation belongs to is gone.", 404);

    // v1.7: a test seat's confirmation is decided, and the real task is left
    // exactly as it was. Nothing moves, nothing is booked.
    if (item.test) {
      // no change to the task
    } else if (accept) {
      closeTask(doc, task, officerName);
    } else {
      task.clientConfirmedAt = null;
      task.clientConfirmedBy = null;
      task.updatedBy = officerName;
      task.updatedAt = new Date().toISOString();
    }

    item.state = accept ? "approved" : "rejected";
    item.decidedBy = officerId;
    item.decidedAt = new Date().toISOString();
  });

  await writeAudit({
    orgId,
    actorId: officerId,
    actorName: officerName,
    action: accept ? "review.task_confirmation.accept" : "review.task_confirmation.reopen",
    detail: `item=${reviewItemId}`,
  });
}

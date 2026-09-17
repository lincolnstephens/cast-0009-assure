import { Hono } from "hono";
import {
  AREA_IDS,
  AREA_OBLIGATIONS,
  JURISDICTION_LABEL,
  JURISDICTION_REGULATION,
  RAG_LABEL,
  TASK_STATUS_LABEL,
  areaName,
  taskConfirmSchema,
  type AreaId,
} from "@maximus/shared";
import type { EntryRecord } from "../db/model.ts";
import { mutateOrg, newId, readOrg } from "../db/store.ts";
import { writeAudit } from "../lib/audit.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";
import {
  areaSummaries,
  forYou,
  isOpen,
  kpis,
  overallStatus,
  ownerLabel,
  phaseSummaries,
  taskRag,
  today,
  worstRag,
} from "../lib/tracker.ts";
import { policyForArea } from "../lib/workplan.ts";

/**
 * The client's side of the Compliance Tracker. Scoped throughout to
 * `user.clientAccountId` - a client can never read or write another
 * tenant's workplan. `POST /tasks/:id/confirm` is the only write on this
 * router: the workplan is MITMARK's workplan for the client (see
 * V11_BRIEF.md, "the one rule"), so nothing here creates, edits,
 * reprioritises or closes a task.
 */
export const trackerRoutes = new Hono<AppEnv>();
trackerRoutes.use("*", requireAuth, requireRole("client"));

/** Ascending compare with nulls last - the "soonest due first" ordering. */
function ascNullsLast(a: string | null, b: string | null): number {
  if (a && b) return a < b ? -1 : a > b ? 1 : 0;
  if (a) return -1;
  if (b) return 1;
  return 0;
}

const AREA_STATUS_BASIS =
  "The worst RAG among this area's open tasks; grey when there is nothing open to do.";

trackerRoutes.get("/home", async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);
  const doc = await readOrg(user.clientAccountId);
  if (!doc) return c.json({ error: "No organisation" }, 404);

  const now = new Date();

  // The as-at timestamp is the most recent operator update across every
  // task. With no task yet, there is nothing to date, so the current time
  // stands in and the basis says so rather than implying a real update.
  const lastUpdated = doc.tasks.reduce<string | null>(
    (latest, t) => (!latest || t.updatedAt > latest ? t.updatedAt : latest),
    null,
  );
  const asAt = lastUpdated ?? now.toISOString();
  const asAtBasis = lastUpdated
    ? "The most recent update MITMARK made to any task in the workplan."
    : "No task has been updated yet; showing the time the page was generated.";

  const openMitmarkCount = doc.tasks.filter((t) => t.ownerType === "mitmark" && isOpen(t)).length;

  return c.json({
    header: {
      clientName: doc.settings.clientName,
      title: "Compliance Tracker",
      jurisdiction: JURISDICTION_LABEL[doc.settings.jurisdiction],
      regulation: JURISDICTION_REGULATION[doc.settings.jurisdiction],
      asAt,
      asAtBasis,
    },
    empty: doc.tasks.length === 0,
    emptyMessage: "MITMARK is preparing your workplan",
    emptyTargetDate: doc.settings.workplanTargetDate,
    overall: overallStatus(doc, now),
    phases: phaseSummaries(doc, now),
    kpis: kpis(doc, now),
    areas: areaSummaries(doc, now),
    forYou: forYou(doc, now),
    forYouEmptyMessage: `Nothing needs your action. MITMARK is working ${openMitmarkCount} items.`,
  });
});

trackerRoutes.get("/areas/:area", async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);

  const areaParam = Number(c.req.param("area"));
  if (!AREA_IDS.includes(areaParam as AreaId)) {
    return c.json({ error: "Not one of the eight areas." }, 404);
  }
  const area = areaParam as AreaId;

  const doc = await readOrg(user.clientAccountId);
  if (!doc) return c.json({ error: "No organisation" }, 404);

  const now = new Date();
  const asAt = today(now);

  const areaTasks = doc.tasks.filter((t) => t.area === area);
  const open = areaTasks.filter(isOpen).sort((a, b) => ascNullsLast(a.dueAt, b.dueAt));
  // Closed tasks read newest-closed first, so the most recent evidence of
  // work sits at the top of the table's closed block.
  const closed = areaTasks.filter((t) => !isOpen(t)).sort((a, b) => -ascNullsLast(a.closedAt, b.closedAt));

  const tasks = [...open, ...closed].map((t) => {
    const rag = taskRag(t, asAt);
    return {
      ...t,
      rag,
      ragLabel: RAG_LABEL[rag],
      statusLabel: TASK_STATUS_LABEL[t.status],
      ownerLabel: ownerLabel(t),
    };
  });

  const policy = policyForArea(doc, area);
  const procedure = doc.procedures.find((p) => p.orgId === doc.id && p.area === area) ?? null;
  const procedurePending = !procedure || procedure.publishedAt === null;

  const taskHistory = closed.map((t) => ({
    at: t.closedAt ?? t.updatedAt,
    kind: "task" as const,
    title: t.title,
    detail: `Closed as ${TASK_STATUS_LABEL[t.status]}.`,
    reviewer: t.updatedBy,
  }));

  const entryHistory = areaTasks
    .filter((t): t is typeof t & { recordEntryId: string } => t.recordEntryId !== null)
    .map((t) => doc.entries.find((e) => e.id === t.recordEntryId))
    .filter((e): e is EntryRecord => Boolean(e))
    .map((e) => ({
      at: e.createdAt,
      kind: "record" as const,
      title: e.what,
      detail: e.outcome,
      reviewer: e.reviewer,
    }));

  const history = [...taskHistory, ...entryHistory].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));

  const { obligation, citation } = AREA_OBLIGATIONS[area];
  const areaRag = worstRag(areaTasks, asAt);

  return c.json({
    area,
    name: areaName(area),
    obligation,
    citation,
    status: {
      rag: areaRag,
      ragLabel: RAG_LABEL[areaRag],
      basis: AREA_STATUS_BASIS,
      asAt,
    },
    tasks,
    howWeDoIt: {
      policyTitle: policy?.title ?? null,
      policyCode: policy?.code ?? null,
      // The policy pack stores one body per code, not a per-area section
      // reference, so there is no section number to cite honestly yet.
      policySection: null,
      procedure,
      procedurePending,
      procedureTargetDate: procedurePending ? (procedure?.targetDate ?? null) : null,
    },
    history,
  });
});

trackerRoutes.post("/tasks/:id/confirm", async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);
  const orgId = user.clientAccountId;
  const id = c.req.param("id");

  const parsed = taskConfirmSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) return c.json({ error: "Check the confirmation." }, 400);

  const result = await mutateOrg(orgId, (doc) => {
    const task = doc.tasks.find((t) => t.id === id);
    if (!task) return { code: "not_found" as const };
    // The one rule: the client can confirm only a task assigned to them.
    // MITMARK's own work is never closable from the client side.
    if (task.ownerType !== "client") return { code: "forbidden" as const };

    const already = task.clientConfirmedAt !== null;
    const now = new Date().toISOString();

    // Confirming is a fact about what the client did, not a status change:
    // status, progress and closedAt are untouched here. Confirming twice is
    // idempotent - the timestamp and note move on, but no second review
    // item is raised for the same underlying confirmation.
    task.clientConfirmedAt = now;
    task.clientConfirmedBy = user.displayName;
    const evidence = parsed.data.evidence.trim();
    if (evidence && !task.evidence.includes(evidence)) task.evidence.push(evidence);

    if (!already) {
      doc.review.push({
        id: newId(),
        orgId,
        type: "task_confirmation",
        refId: task.id,
        summary: `Client confirmed "${task.title}".${parsed.data.note ? ` ${parsed.data.note}` : ""}`,
        state: "pending",
        decidedBy: null,
        decidedAt: null,
        createdAt: now,
      });
    }

    return { code: "ok" as const, title: task.title, already };
  });

  if (result.code === "not_found") return c.json({ error: "Task not found." }, 404);
  if (result.code === "forbidden") {
    return c.json({ error: "This task belongs to MITMARK; only MITMARK can close it." }, 403);
  }

  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "task.confirm",
    detail: result.already
      ? `Task ${id} ("${result.title}") reconfirmed by the client.`
      : `Task ${id} ("${result.title}") confirmed by the client.`,
  });

  return c.json({ ok: true });
});

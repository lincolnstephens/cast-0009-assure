import { Hono } from "hono";
import {
  AREA_IDS,
  JOB_GROUP_LABEL,
  LIBRARY_TASKS,
  RAG_LABEL,
  TASK_STATUS_LABEL,
  applyLibrarySchema,
  areaName,
  expandLibrary,
  jobGroupOf,
  procedureInputSchema,
  taskInputSchema,
  taskStatusSchema,
  type JobGroup,
} from "@maximus/shared";
import type { OrgDoc, ProcedureRecord, TaskRecord } from "../db/model.ts";
import { mutateOrg, newId, readOrg } from "../db/store.ts";
import { writeAudit } from "../lib/audit.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";
import { raiseEntry } from "../lib/raiseEntry.ts";
import { overallStatus, ownerLabel, taskRag, today } from "../lib/tracker.ts";
import { AREA_LINE, applyLibraryToDoc, hoursForTask } from "../lib/workplan.ts";

/**
 * The admin's side of the workplan: create, edit and remove tasks by hand;
 * apply the seeded task library to an organisation; publish procedures. The
 * operator owns the workplan (see V11_BRIEF.md, "the one rule") - every
 * write here is theirs, and every one leaves an audit row.
 */
export const adminWorkplanRoutes = new Hono<AppEnv>();
adminWorkplanRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

/** An admin acts on an organisation named in the query, defaulting to demo - the house pattern (adminRecord.ts). */
function orgIdOf(c: { req: { query: (k: string) => string | undefined } }): string {
  return c.req.query("org") || "demo";
}

const LIBRARY_HOURS_BY_ID = new Map(LIBRARY_TASKS.map((t) => [t.id, t.defaultHours] as const));
const LIBRARY_BY_ID = new Map(LIBRARY_TASKS.map((t) => [t.id, t] as const));

/**
 * Closing a task as done creates a Record entry with the area's default
 * hours, as v1.0 does for clocks (adminClocks.ts). Shared by the create and
 * edit routes so a task that arrives already "done" and one that is moved
 * to "done" later are priced and worded the same way. Only fires the first
 * time `closedAt` moves off null - moving a task out of done again does not
 * delete the entry it already raised, and does not raise a second one on a
 * later close.
 */
export function closeTaskAndRaiseEntry(
  doc: OrgDoc,
  task: TaskRecord,
  input: { reviewer: string; outcome: string },
): void {
  if (task.status !== "done" || task.closedAt !== null) return;
  task.closedAt = new Date().toISOString();
  const entry = raiseEntry(doc, {
    line: AREA_LINE[task.area as keyof typeof AREA_LINE],
    what: `Closed: ${task.title}`,
    outcome: input.outcome,
    hours: hoursForTask(task, LIBRARY_HOURS_BY_ID),
    deadline: "",
    reviewer: input.reviewer,
    source: "manual",
    sourceRef: task.id,
  });
  task.recordEntryId = entry.id;
}

// ---------------------------------------------------------------------------
// Workplan: list, create, edit, remove
// ---------------------------------------------------------------------------

adminWorkplanRoutes.get("/workplan", async (c) => {
  const orgId = orgIdOf(c);
  const doc = await readOrg(orgId);
  if (!doc) return c.json({ error: "Organisation not found" }, 404);

  const areaParam = c.req.query("area");
  const statusParam = c.req.query("status");
  const area = areaParam ? Number(areaParam) : undefined;
  const statusCheck = statusParam ? taskStatusSchema.safeParse(statusParam) : null;

  let tasks = doc.tasks;
  if (area !== undefined && AREA_IDS.includes(area as (typeof AREA_IDS)[number])) {
    tasks = tasks.filter((t) => t.area === area);
  }
  if (statusCheck && statusCheck.success) {
    tasks = tasks.filter((t) => t.status === statusCheck.data);
  }

  return c.json({ tasks });
});

adminWorkplanRoutes.post("/workplan", async (c) => {
  const orgId = orgIdOf(c);
  const user = c.get("user");
  const parsed = taskInputSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Check the task: area, phase, title and owner are needed." }, 400);
  const input = parsed.data;

  const task = await mutateOrg(orgId, (doc) => {
    const now = new Date().toISOString();
    const created: TaskRecord = {
      id: newId(),
      orgId,
      area: input.area,
      phase: input.phase,
      title: input.title,
      how: input.how,
      howLink: input.howLink,
      ownerType: input.ownerType,
      ownerRole: input.ownerRole,
      dueAt: input.dueAt,
      recurrence: input.recurrence,
      status: input.status,
      progress: input.progress,
      evidence: input.evidence,
      notes: input.notes,
      source: "manual",
      recordEntryId: null,
      closedAt: null,
      clientConfirmedAt: null,
      clientConfirmedBy: null,
      createdBy: user.displayName,
      updatedBy: user.displayName,
      updatedAt: now,
    };
    doc.tasks.push(created);
    // A task created already "done" still books the Record hours a closure
    // would, so the work is on the record from the moment it exists.
    closeTaskAndRaiseEntry(doc, created, {
      reviewer: user.displayName,
      outcome: "Task recorded as already done when it was added to the workplan.",
    });
    return created;
  });

  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "workplan.create",
    detail: `Task ${task.id} ("${task.title}") created for area ${task.area}.`,
  });
  return c.json(task, 201);
});

adminWorkplanRoutes.patch("/workplan/:id", async (c) => {
  const orgId = orgIdOf(c);
  const user = c.get("user");
  const id = c.req.param("id");
  const parsed = taskInputSchema.partial().safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Check the task." }, 400);
  const p = parsed.data;

  const result = await mutateOrg(orgId, (doc) => {
    const task = doc.tasks.find((t) => t.id === id);
    if (!task) return null;

    if (p.area !== undefined) task.area = p.area;
    if (p.phase !== undefined) task.phase = p.phase;
    if (p.title !== undefined) task.title = p.title;
    if (p.how !== undefined) task.how = p.how;
    if (p.howLink !== undefined) task.howLink = p.howLink;
    if (p.ownerType !== undefined) task.ownerType = p.ownerType;
    if (p.ownerRole !== undefined) task.ownerRole = p.ownerRole;
    if (p.dueAt !== undefined) task.dueAt = p.dueAt;
    if (p.recurrence !== undefined) task.recurrence = p.recurrence;
    if (p.progress !== undefined) task.progress = p.progress;
    if (p.evidence !== undefined) task.evidence = p.evidence;
    if (p.notes !== undefined) task.notes = p.notes;

    const hadEntry = task.recordEntryId !== null;
    if (p.status !== undefined) {
      task.status = p.status;
      // Moving a task out of done again does not delete the entry it
      // already raised - the work it recorded still happened - and moving
      // it back to done later does not raise a second one, since
      // closeTaskAndRaiseEntry only fires while closedAt is still null.
      closeTaskAndRaiseEntry(doc, task, {
        reviewer: user.displayName,
        outcome: "Task closed as done.",
      });
    }
    const entryCreated = !hadEntry && task.recordEntryId !== null;

    task.updatedBy = user.displayName;
    task.updatedAt = new Date().toISOString();
    return { task, entryCreated };
  });

  if (!result) return c.json({ error: "Task not found" }, 404);

  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "workplan.edit",
    detail: result.entryCreated
      ? `Task ${id} edited and closed; Record entry ${result.task.recordEntryId} created.`
      : `Task ${id} edited.`,
  });
  return c.json(result.task);
});

adminWorkplanRoutes.delete("/workplan/:id", async (c) => {
  const orgId = orgIdOf(c);
  const user = c.get("user");
  const id = c.req.param("id");
  const removed = await mutateOrg(orgId, (doc) => {
    const i = doc.tasks.findIndex((t) => t.id === id);
    if (i === -1) return false;
    doc.tasks.splice(i, 1);
    return true;
  });
  if (!removed) return c.json({ error: "Task not found" }, 404);
  await writeAudit({ orgId, actorId: user.id, actorName: user.displayName, action: "workplan.remove", detail: `Task ${id} removed.` });
  return c.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Library apply: additive only, never overwrites an edit
// ---------------------------------------------------------------------------

adminWorkplanRoutes.post("/workplan/apply-library", async (c) => {
  const orgId = orgIdOf(c);
  const user = c.get("user");
  const parsed = applyLibrarySchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Give a start date." }, 400);

  // One implementation, shared with the seed, so a freshly seeded organisation
  // and a re-applied one cannot drift apart. See lib/workplan.ts.
  const result = await mutateOrg(orgId, (doc) =>
    applyLibraryToDoc(doc, parsed.data.startDate, user.displayName),
  );

  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "workplan.apply_library",
    detail: `Library applied from ${parsed.data.startDate}: ${result.created} task(s) created, ${result.skipped} already present and left untouched.`,
  });

  return c.json({ created: result.created, skipped: result.skipped, total: result.total });
});

// ---------------------------------------------------------------------------
// Procedures
// ---------------------------------------------------------------------------

adminWorkplanRoutes.get("/procedures", async (c) => {
  const orgId = orgIdOf(c);
  const doc = await readOrg(orgId);
  if (!doc) return c.json({ error: "Organisation not found" }, 404);

  const procedures = AREA_IDS.map((area) => {
    const existing = doc.procedures.find((p) => p.orgId === doc.id && p.area === area);
    if (existing) return existing;
    // No procedure saved for this area yet - an unsaved shell the admin UI can
    // still address by area, never presented to the client as a real record.
    const unsaved: ProcedureRecord = {
      id: `unsaved-${area}`,
      orgId: doc.id,
      area,
      title: "",
      body: "",
      link: "",
      processMapLink: "",
      publishedAt: null,
      targetDate: null,
    };
    return unsaved;
  });

  return c.json({ procedures });
});

adminWorkplanRoutes.put("/procedures/:area", async (c) => {
  const orgId = orgIdOf(c);
  const user = c.get("user");
  const areaParam = Number(c.req.param("area"));
  if (!AREA_IDS.includes(areaParam as (typeof AREA_IDS)[number])) {
    return c.json({ error: "Not one of the eight areas." }, 400);
  }
  const parsed = procedureInputSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Check the procedure." }, 400);
  const input = parsed.data;

  const procedure = await mutateOrg(orgId, (doc) => {
    let record = doc.procedures.find((p) => p.orgId === doc.id && p.area === areaParam);
    if (!record) {
      record = {
        id: newId(),
        orgId: doc.id,
        area: areaParam,
        title: "",
        body: "",
        link: "",
        processMapLink: "",
        publishedAt: null,
        targetDate: null,
      };
      doc.procedures.push(record);
    }
    record.title = input.title;
    record.body = input.body;
    record.link = input.link;
    record.processMapLink = input.processMapLink;
    record.targetDate = input.targetDate;
    record.publishedAt = input.published ? new Date().toISOString() : null;
    return record;
  });

  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "procedure.update",
    detail: `Procedure for area ${areaParam} (${areaName(areaParam)}) updated${input.published ? " and published" : ""}.`,
  });

  return c.json(procedure);
});

// ---------------------------------------------------------------------------
// Jobs: the operator's mirror of the client's Jobs page (FRAGO §5). Unlike
// the client's view, a not applicable task is not hidden - it is the
// operator's working view, so it is listed under `notApplicable` rather
// than folded into a count only.
// ---------------------------------------------------------------------------

const JOB_GROUP_ORDER: JobGroup[] = ["not_started", "in_progress", "completed"];

function jobTaskOf(t: TaskRecord, asAt: string) {
  const rag = taskRag(t, asAt);
  return {
    ...t,
    rag,
    ragLabel: RAG_LABEL[rag],
    statusLabel: TASK_STATUS_LABEL[t.status],
    ownerLabel: ownerLabel(t),
    areaName: areaName(t.area),
    blocked: t.status === "blocked",
    forYou: t.ownerType === "client",
  };
}

adminWorkplanRoutes.get("/jobs", async (c) => {
  const orgId = orgIdOf(c);
  const doc = await readOrg(orgId);
  if (!doc) return c.json({ error: "Organisation not found" }, 404);

  const asAt = today(new Date());
  const all = doc.tasks;

  const modules = AREA_IDS.filter((id) => all.some((t) => t.area === id)).map((id) => ({
    id,
    name: areaName(id),
  }));
  const owners = Array.from(new Set(all.map((t) => ownerLabel(t)))).sort();

  const groups = JOB_GROUP_ORDER.map((id) => ({
    id,
    name: JOB_GROUP_LABEL[id],
    tasks: all
      .filter((t) => jobGroupOf(t.status) === id)
      .map((t) => jobTaskOf(t, asAt)),
  }));

  const notApplicable = all.filter((t) => t.status === "not_applicable").map((t) => jobTaskOf(t, asAt));

  return c.json({
    groups,
    notApplicable,
    notApplicableCount: notApplicable.length,
    modules,
    owners,
    /**
     * The operator's own reading of where the client stands, counted the way
     * they have chosen in settings. The client's figure is always the overdue
     * count and is unaffected by this; see lib/tracker.ts.
     */
    overall: overallStatus(doc, new Date(), doc.settings.denominatorMode ?? "overdue"),
    clientOverall: overallStatus(doc, new Date(), "overdue"),
  });
});

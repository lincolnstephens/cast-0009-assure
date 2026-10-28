import { Hono } from "hono";
import {
  AREA_IDS,
  AREA_OBLIGATIONS,
  DEFAULT_MODULE_INTRODUCTIONS,
  JOB_GROUP_LABEL,
  JURISDICTION_LABEL,
  JURISDICTION_REGULATION,
  RAG_LABEL,
  TASK_STATUS_LABEL,
  areaName,
  clientDocumentSubmitSchema,
  SUBMISSION_CATEGORY_LABEL,
  jobGroupOf,
  taskConfirmSchema,
  type AreaId,
  type JobGroup,
} from "@maximus/shared";
import type { DocumentRecord, EntryRecord, TaskRecord } from "../db/model.ts";
import { mutateOrg, newId, readDocumentBlob, readOrg, writeDocumentBlob } from "../db/store.ts";
import { writeAudit } from "../lib/audit.ts";
import {
  EFFECTIVE_UPLOAD_MAX_BYTES,
  EFFECTIVE_UPLOAD_MAX_MB,
  buildDocumentsResponse,
  isLiveDocument,
  replaceableFor,
  submissionsFor,
} from "../lib/documents.ts";
import { buildCorpusFor } from "../lib/documentCorpus.ts";
import { fileResponse } from "./adminDocuments.ts";
import { requireAuth, requireClientSeat, type AppEnv } from "../lib/middleware.ts";
import {
  areaSummaries,
  forYou,
  isOpen,
  journey,
  kpis,
  overallStatus,
  ownerLabel,
  phaseSummaries,
  taskRag,
  today,
  upcoming,
  worstRag,
} from "../lib/tracker.ts";
import { policyForArea } from "../lib/workplan.ts";
import { counters, milestones, moduleScore, moduleTiles, overallScore } from "../lib/modulePage.ts";

/**
 * The client's side of the Compliance Tracker. Scoped throughout to
 * `user.clientAccountId` - a client can never read or write another
 * tenant's workplan. `POST /tasks/:id/confirm` is the only write on this
 * router: the workplan is MITMARK's workplan for the client (see
 * V11_BRIEF.md, "the one rule"), so nothing here creates, edits,
 * reprioritises or closes a task.
 */
export const trackerRoutes = new Hono<AppEnv>();
trackerRoutes.use("*", requireAuth, requireClientSeat);

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
      regulation: doc.settings.regulationLabel?.trim() || JURISDICTION_REGULATION[doc.settings.jurisdiction],
      asAt,
      asAtBasis,
    },
    empty: doc.tasks.length === 0,
    emptyMessage: "MITMARK is preparing your workplan",
    emptyTargetDate: doc.settings.workplanTargetDate,
    // v1.6 (FRAGO 06 3.6): the headline and each tile's colour are the score.
    overall: { ...overallStatus(doc, now), score: overallScore(doc, now) },
    phases: phaseSummaries(doc, now),
    kpis: kpis(doc, now),
    areas: areaSummaries(doc, now).map((a) => ({ ...a, score: moduleScore(doc, a.area, now) })),
    forYou: forYou(doc, now),
    forYouEmptyMessage: `Nothing needs your action. MITMARK is working ${openMitmarkCount} items.`,
    journey: journey(doc),
    upcoming: upcoming(doc, now),
    // v1.10 (FRAGO 11 3.3): empty for an organisation that lists none, and then no tile.
    coverage: doc.settings.jurisdictions ?? [],
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

  // The same counting as the module's tile on the tracker: not applicable is
  // outside the count, done is met.
  const counted = areaTasks.filter((t) => t.status !== "not_applicable");
  const done = counted.filter((t) => t.status === "done").length;
  const total = counted.length;

  // Only what the client can actually open: the current approved version of a
  // policy (its history stays on Compliance Documents) and anything published.
  // A register not yet filed is not listed here; the module says "None filed
  // yet" rather than offering a link that goes nowhere.
  const documents = buildDocumentsResponse(doc)
    .sections.flatMap((section) => section.items)
    .filter((d) => d.area === area && d.published)
    .filter((d) => !(d.kind === "policy" && d.title.endsWith("(earlier version)")))
    .map((d) => ({ id: d.id, title: d.title, section: d.section, kind: d.kind, url: d.url }));

  const introduction =
    doc.settings.moduleIntroductions?.[String(area)]?.trim() || DEFAULT_MODULE_INTRODUCTIONS[area];

  return c.json({
    area,
    name: areaName(area),
    introduction,
    documents,
    progress: { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) },
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
    tiles: moduleTiles(doc, area),
    score: moduleScore(doc, area, now),
    milestones: milestones(doc, area, now),
    counters: counters(doc, area, now),
    // v1.10: module 1 (DPO registration) carries the registrations table.
    registrations: area === 1 ? (doc.settings.jurisdictions ?? []) : [],
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

    const now = new Date().toISOString();

    // v1.7: a test seat's confirmation raises a test item for the operator
    // and leaves the real task exactly as it is.
    if (user.testSeat) {
      const pending = doc.review.some(
        (r) => r.type === "task_confirmation" && r.refId === task.id && r.state === "pending" && r.test,
      );
      if (!pending) {
        doc.review.push({
          id: newId(),
          orgId,
          type: "task_confirmation",
          refId: task.id,
          summary: `TEST SEAT. Confirmed "${task.title}".${parsed.data.note ? ` ${parsed.data.note}` : ""}`,
          state: "pending",
          decidedBy: null,
          decidedAt: null,
          createdAt: now,
          test: true,
        });
      }
      return { code: "ok" as const, title: task.title, already: pending };
    }

    const already = task.clientConfirmedAt !== null;

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

// ---------------------------------------------------------------------------
// Jobs: every task across all eight modules in one list, grouped the way
// the operator speaks about them (JOB_GROUP_LABEL). Not applicable tasks are never
// shown to the client - only counted - because this is a to-do list, not the
// workplan itself.
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
    // Blocked is a status of its own internally, but it reads as "In
    // progress" to the client with a flag, because "blocked" is the word
    // that gets it unblocked.
    blocked: t.status === "blocked",
    forYou: t.ownerType === "client",
    // v1.9 (FRAGO 09 3.1): MITMARK's note on the client's confirmation, as the client reads it.
    mitmarkNote:
      t.confirmationNote && t.confirmationNoteAt ? { text: t.confirmationNote, at: t.confirmationNoteAt } : null,
  };
}

trackerRoutes.get("/jobs", async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);
  const doc = await readOrg(user.clientAccountId);
  if (!doc) return c.json({ error: "No organisation" }, 404);

  const asAt = today(new Date());

  const moduleParam = c.req.query("module");
  const ownerParam = c.req.query("owner");
  const dueParam = c.req.query("due");
  const moduleFilter = moduleParam ? Number(moduleParam) : null;

  // Tasks marked not applicable are not a client-facing job; they are
  // excluded here and counted instead, never hidden silently.
  const notApplicableCount = doc.tasks.filter((t) => t.status === "not_applicable").length;
  const visible = doc.tasks.filter((t) => t.status !== "not_applicable");

  // The filter controls list every value actually present before any filter
  // narrows the list, so picking one filter never removes another's options.
  const modules = AREA_IDS.filter((id) => visible.some((t) => t.area === id)).map((id) => ({
    id,
    name: areaName(id),
  }));
  const owners = Array.from(new Set(visible.map((t) => ownerLabel(t)))).sort();

  let filtered = visible;
  if (moduleFilter !== null && AREA_IDS.includes(moduleFilter as AreaId)) {
    filtered = filtered.filter((t) => t.area === moduleFilter);
  }
  if (ownerParam) {
    filtered = filtered.filter((t) => ownerLabel(t) === ownerParam);
  }
  if (dueParam === "month") {
    // "Due this month" means the literal current calendar month, not a
    // rolling 30 days.
    const monthPrefix = asAt.slice(0, 7);
    filtered = filtered.filter((t) => t.dueAt !== null && t.dueAt.slice(0, 7) === monthPrefix);
  }

  filtered = filtered.slice().sort((a, b) => ascNullsLast(a.dueAt, b.dueAt));

  const groups = JOB_GROUP_ORDER.map((id) => ({
    id,
    name: JOB_GROUP_LABEL[id],
    tasks: filtered.filter((t) => jobGroupOf(t.status) === id).map((t) => jobTaskOf(t, asAt)),
  }));

  const openMitmarkCount = doc.tasks.filter((t) => t.ownerType === "mitmark" && isOpen(t)).length;
  const forYouEmptyMessage = `Nothing needs your action. MITMARK is working ${openMitmarkCount} items.`;

  return c.json({ groups, notApplicableCount, modules, owners, forYouEmptyMessage });
});

// ---------------------------------------------------------------------------
// Compliance Documents. The client reads and downloads what is published.
// v1.7 (FRAGO 07 3.1): she may also offer a document, which lands in the
// operator's review queue and is published only when the operator accepts
// it. She never edits, replaces or deletes anything already submitted or
// published; a new version is a new submission. See lib/documents.ts for how
// the three sections are built and for the one rule (isLiveDocument) every
// client-facing reader goes through.
// ---------------------------------------------------------------------------

trackerRoutes.get("/documents", async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);
  const doc = await readOrg(user.clientAccountId);
  if (!doc) return c.json({ error: "No organisation" }, 404);

  return c.json({
    ...buildDocumentsResponse(doc),
    submissions: submissionsFor(doc, user.testSeat === true),
    replaceable: replaceableFor(doc),
    uploadMaxMb: EFFECTIVE_UPLOAD_MAX_MB,
    testSeat: user.testSeat === true,
  });
});

trackerRoutes.post("/documents", async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);
  const orgId = user.clientAccountId;
  const body = await c.req.json().catch(() => null);
  // v1.9 (FRAGO 09 3.2): the client never sets a document's module or section.
  // A body that tries is refused outright rather than silently stripped.
  if (body && typeof body === "object" && ("area" in body || "section" in body)) {
    return c.json({ error: "The module is set by MITMARK when the document is accepted." }, 400);
  }
  const parsed = clientDocumentSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Give the document a title, its category and one line of what it is." }, 400);
  }
  const input = parsed.data;
  const doc = await readOrg(orgId);
  if (!doc) return c.json({ error: "No organisation" }, 404);

  if (input.supersedes) {
    const earlier = doc.documents.find((d) => d.id === input.supersedes);
    if (!earlier || !isLiveDocument(earlier)) {
      return c.json({ error: "That document is not one you can send a new version of." }, 400);
    }
  }

  const id = newId();
  const now = new Date().toISOString();
  const test = user.testSeat === true;
  const record: DocumentRecord = {
    id,
    orgId,
    // The operator chooses the section and the module on acceptance. Until
    // then it is held under procedures, unpublished, with no module, and
    // appears in no section at all.
    section: "procedures",
    area: null,
    category: input.category,
    title: input.title,
    version: "",
    asAt: now.slice(0, 10),
    owner: "Client",
    kind: input.kind,
    blobKey: null,
    fileName: "",
    contentType: "",
    sizeBytes: 0,
    url: "",
    published: false,
    updatedAt: now,
    updatedBy: user.displayName,
    description: input.note,
    status: "",
    submission: {
      state: "submitted",
      submittedById: user.id,
      submittedByName: user.displayName,
      submittedAt: now,
      note: input.note,
      decidedById: null,
      decidedByName: null,
      decidedAt: null,
      returnReason: "",
    },
    supersedes: input.supersedes,
    ...(test ? { test: true } : {}),
  };

  if (input.kind === "file") {
    if (!input.fileBase64) return c.json({ error: "Choose a file, or switch to a link." }, 400);
    let bytes: Uint8Array;
    try {
      bytes = new Uint8Array(Buffer.from(input.fileBase64, "base64"));
    } catch {
      return c.json({ error: "That file could not be read." }, 400);
    }
    if (bytes.byteLength === 0) return c.json({ error: "That file is empty." }, 400);
    if (bytes.byteLength > EFFECTIVE_UPLOAD_MAX_BYTES) {
      return c.json(
        { error: `Files up to ${EFFECTIVE_UPLOAD_MAX_MB} MB can be uploaded here; this one is larger. Send it as a link instead.` },
        413,
      );
    }
    await writeDocumentBlob(orgId, id, bytes);
    record.blobKey = id;
    record.fileName = input.fileName || input.title;
    record.contentType = input.contentType || "application/octet-stream";
    record.sizeBytes = bytes.byteLength;
    const corpus = await buildCorpusFor(orgId, record, bytes);
    if (corpus) {
      record.searchable = corpus.searchable;
      record.searchNote = corpus.searchNote;
    }
  } else {
    if (!/^https?:\/\//i.test(input.url)) return c.json({ error: "Give a link starting with https://." }, 400);
    record.url = input.url;
  }

  await mutateOrg(orgId, (d) => {
    d.documents.push(record);
    d.review.push({
      id: newId(),
      orgId,
      type: "document_submission",
      refId: id,
      summary: `${test ? "TEST SEAT. " : ""}Client submitted "${input.title}" as a ${SUBMISSION_CATEGORY_LABEL[input.category]}${input.supersedes ? " (a new version)" : ""}.`,
      state: "pending",
      decidedBy: null,
      decidedAt: null,
      createdAt: now,
      ...(test ? { test: true } : {}),
    });
  });

  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "document.submit",
    detail: `Document ${id} ("${input.title}") submitted by the ${test ? "test seat (test)" : "client"} for review; not published.`,
  });

  return c.json({ id, state: "submitted", stateLabel: "Submitted, awaiting MITMARK review" }, 201);
});

trackerRoutes.get("/documents/:id/download", async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);
  const doc = await readOrg(user.clientAccountId);
  if (!doc) return c.json({ error: "No organisation" }, 404);

  const id = c.req.param("id");
  // Unpublished stays invisible even to a client who has guessed an id -
  // the same rule a draft policy already follows (routes/policies.ts). v1.7:
  // so does a submission not yet accepted, and a superseded version.
  const record = doc.documents.find((d) => d.id === id && isLiveDocument(d));
  if (!record) return c.json({ error: "Not found" }, 404);
  if (!c.get("preview")) {
    await writeAudit({
      orgId: doc.id,
      actorId: user.id,
      actorName: user.displayName,
      action: "document.download",
      detail: `Document ${record.id} ("${record.title}") downloaded by the client.`,
    });
  }

  if (record.kind === "link") {
    if (!record.url) return c.json({ error: "Not found" }, 404);
    return c.redirect(record.url, 302);
  }

  if (record.kind === "file") {
    const bytes = await readDocumentBlob(doc.id, record.id);
    if (!bytes) return c.json({ error: "This file is not available." }, 404);
    return fileResponse(bytes, record.fileName || "document", record.contentType);
  }

  return c.json({ error: "Not found" }, 404);
});

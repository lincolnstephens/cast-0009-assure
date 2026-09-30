import { randomBytes } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import { jurisdictionSchema } from "@maximus/shared";
import { emptyOrgDoc, type DocumentRecord, type OrgDoc, type TaskRecord } from "../db/model.ts";
import { listOrgIds, mutateOrg, newId, readOrg, readUsers, writeOrg } from "../db/store.ts";
import { writeSystemAudit } from "../lib/audit.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";
import { RETENTION_AREA, seedManifestSchema, tasksCreatedBy, type SeedManifest } from "../lib/seedManifest.ts";

/**
 * Organisations (FRAGO 05 3.4 and 3.5). Managers only. Creating an
 * organisation writes its empty document and nothing else; the task library
 * and the seed are separate, deliberate steps. There is no delete.
 */
export const adminOrganisationRoutes = new Hono<AppEnv>();
adminOrganisationRoutes.use("/organisations", requireAuth, requireRole("mitmark_admin"));
adminOrganisationRoutes.use("/organisations/*", requireAuth, requireRole("mitmark_admin"));

const createOrgSchema = z.object({
  name: z.string().trim().min(1).max(200),
  jurisdiction: jurisdictionSchema.default("UK"),
  regulationLabel: z.string().trim().max(200).default(""),
});

adminOrganisationRoutes.get("/organisations", async (c) => {
  const { users } = await readUsers();
  const docs = (await Promise.all((await listOrgIds()).map((id) => readOrg(id)))).filter(
    (d): d is NonNullable<typeof d> => d !== null,
  );
  const organisations = docs
    .map((d) => ({
      id: d.id,
      name: d.branding.displayName || d.name,
      jurisdiction: d.settings.jurisdiction,
      regulationLabel: d.settings.regulationLabel ?? "",
      userCount: users.filter((u) => u.orgId === d.id).length,
      taskCount: d.tasks.length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return c.json({ organisations });
});

adminOrganisationRoutes.post("/organisations", async (c) => {
  const actor = c.get("user");
  const parsed = createOrgSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Give the organisation a name." }, 400);

  // Random, not derived from the name: an id travels in URLs and logs, and a
  // client's name must not.
  const id = `org-${randomBytes(5).toString("hex")}`;
  const doc = emptyOrgDoc(id, parsed.data.name);
  doc.settings.jurisdiction = parsed.data.jurisdiction;
  doc.settings.regulationLabel = parsed.data.regulationLabel;
  doc.settings.showIllustrative = false;
  await writeOrg(doc);

  await writeSystemAudit({
    orgId: id,
    actorId: actor.id,
    actorName: actor.displayName,
    action: "organisation.create",
    detail: `Created organisation ${id}; no tasks applied.`,
  });

  return c.json(
    {
      organisation: {
        id,
        name: parsed.data.name,
        jurisdiction: parsed.data.jurisdiction,
        regulationLabel: parsed.data.regulationLabel,
        userCount: 0,
        taskCount: 0,
      },
    },
    201,
  );
});

// ---------------------------------------------------------------------------
// The seed (FRAGO 05 3.5). Tasks and settings are written here; the files are
// uploaded one by one through the Documents route by the seed command, which
// reads them from disk. A dry run writes nothing.
// ---------------------------------------------------------------------------

const seedRequestSchema = z.object({
  manifest: seedManifestSchema,
  replace: z.boolean().default(false),
  dryRun: z.boolean().default(false),
  /**
   * v1.6 (FRAGO 06). Apply only what a manifest adds beyond tasks and files:
   * its links and its retention schedule. Tasks, documents and every other
   * setting are left exactly as they are, so it runs against an organisation
   * that is already seeded, with no replace.
   */
  additionsOnly: z.boolean().default(false),
});

/** Links not yet filed against the organisation; a link already there (same title and address) is skipped. */
function newLinks(doc: OrgDoc, m: SeedManifest) {
  const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
  return m.links.filter(
    (l) => !doc.documents.some((d) => d.kind === "link" && same(d.title, l.title) && same(d.url, l.url)),
  );
}

/** Files the manifest's new links and sets its retention schedule. Mutates `doc`. */
function applyAdditions(doc: OrgDoc, m: SeedManifest, actor: string, now: string) {
  const links = newLinks(doc, m);
  for (const l of links) {
    const record: DocumentRecord = {
      id: newId(),
      orgId: doc.id,
      section: l.section,
      area: l.area,
      title: l.title,
      version: "",
      asAt: "",
      owner: "MITMARK",
      kind: "link",
      blobKey: null,
      fileName: "",
      contentType: "",
      sizeBytes: 0,
      url: l.url,
      published: true,
      updatedAt: now,
      updatedBy: actor,
      description: l.description,
      status: "published",
    };
    doc.documents.push(record);
  }
  const schedule = m.organisation.settings.retentionSchedule;
  if (schedule !== undefined) {
    doc.settings.retentionSchedule ??= {};
    doc.settings.retentionSchedule[String(RETENTION_AREA)] = schedule.map((r) => ({ ...r }));
  }
  return { links: links.length, retentionRows: schedule?.length ?? 0 };
}

function taskFromManifest(
  orgId: string,
  t: SeedManifest["tasks"][number],
  m: SeedManifest,
  actor: string,
  now: string,
): TaskRecord {
  const done = t.status === "done";
  const notes = t.notes ?? (t.dueAt === null && !done ? (m.defaults.notesUndated ?? "") : "");
  return {
    id: newId(),
    orgId,
    area: t.area,
    phase: t.phase,
    title: t.title,
    how: t.how,
    howLink: null,
    ownerType: t.ownerType,
    ownerRole: t.ownerRole,
    dueAt: t.dueAt,
    recurrence: t.recurrence,
    status: t.status,
    progress: done ? 100 : 0,
    evidence: [],
    notes,
    // The manifest's reference travels with the task, so a seeded task can
    // always be traced back to the line of the plan it came from.
    source: `${t.source ?? m.defaults.source ?? "seed"}:${t.ref}`,
    recordEntryId: null,
    closedAt: done ? now : null,
    clientConfirmedAt: null,
    clientConfirmedBy: null,
    createdBy: actor,
    updatedBy: actor,
    updatedAt: now,
  };
}

/**
 * The manifest's clocks, applied to the tasks just built. A clock dates the
 * task it names and adds its note. When that task is already done (a renewal
 * made in March), the clock is the next occurrence, so it becomes one open
 * task with the clock's date; otherwise a completed task would carry a future
 * date and the obligation would never show as due. Nothing becomes a
 * statutory clock: those are reserved for data requests and breaches.
 */
function applyClocks(tasks: TaskRecord[], m: SeedManifest, orgId: string, actor: string, now: string): TaskRecord[] {
  const byRef = new Map<string, TaskRecord>();
  m.tasks.forEach((t, i) => byRef.set(t.ref, tasks[i]));
  const extra: TaskRecord[] = [];
  for (const clock of m.clocks) {
    const task = byRef.get(clock.taskRef);
    if (!task) continue;
    const note = clock.note ? `${clock.note}` : "";
    if (task.status === "done") {
      extra.push({
        ...task,
        id: newId(),
        status: "not_started",
        progress: 0,
        closedAt: null,
        dueAt: clock.dueAt,
        notes: note,
        source: `clock:${clock.ref}`,
        createdBy: actor,
        updatedBy: actor,
        updatedAt: now,
        orgId,
      });
    } else {
      task.dueAt = clock.dueAt;
      if (note && !task.notes.includes(note)) task.notes = task.notes ? `${task.notes} ${note}` : note;
    }
  }
  return extra;
}

adminOrganisationRoutes.post("/organisations/:id/seed", async (c) => {
  const actor = c.get("user");
  const orgId = c.req.param("id");
  const parsed = seedRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return c.json({ error: `The manifest does not read: ${issue?.path.join(".") ?? ""} ${issue?.message ?? ""}`.trim() }, 400);
  }
  const { manifest, replace, dryRun, additionsOnly } = parsed.data;

  const current = await readOrg(orgId);
  if (!current) return c.json({ error: "No such organisation." }, 404);
  const before = { tasks: current.tasks.length, documents: current.documents.length };

  if (additionsOnly) {
    const wouldAdd = {
      links: newLinks(current, manifest).length,
      linksAlreadyFiled: manifest.links.length - newLinks(current, manifest).length,
      retentionRows: manifest.organisation.settings.retentionSchedule?.length ?? 0,
    };
    if (dryRun) return c.json({ dryRun: true, additionsOnly: true, before, after: before, wouldAdd });
    const now = new Date().toISOString();
    const result = await mutateOrg(orgId, (doc) => {
      const added = applyAdditions(doc, manifest, actor.displayName, now);
      return { added, after: { tasks: doc.tasks.length, documents: doc.documents.length } };
    });
    await writeSystemAudit({
      orgId,
      actorId: actor.id,
      actorName: actor.displayName,
      action: "organisation.seed",
      detail: `Seed additions: ${result.added.links} link(s) filed, retention schedule of ${result.added.retentionRows} row(s) set; tasks and documents untouched.`,
    });
    return c.json({ dryRun: false, additionsOnly: true, before, after: result.after, wouldAdd, added: result.added });
  }
  const alreadySeeded = Boolean(current.settings.seededAt) || current.tasks.length > 0;
  if (alreadySeeded && !replace) {
    return c.json(
      { error: "This organisation already has tasks. Run again with replace to start it over.", before },
      409,
    );
  }

  const wouldCreate = { tasks: tasksCreatedBy(manifest), documents: manifest.documents.length };
  if (dryRun) {
    return c.json({ dryRun: true, before, after: before, wouldCreate, created: { tasks: 0 } });
  }

  const now = new Date().toISOString();
  const after = await mutateOrg(orgId, (doc) => {
    if (replace) doc.tasks = [];
    const built = manifest.tasks.map((t) => taskFromManifest(orgId, t, manifest, actor.displayName, now));
    const extra = applyClocks(built, manifest, orgId, actor.displayName, now);
    doc.tasks.push(...built, ...extra);

    const o = manifest.organisation;
    if (o.displayName) {
      doc.name = o.displayName;
      doc.branding.displayName = o.displayName;
      doc.settings.clientName = o.displayName;
    }
    if (o.jurisdiction) doc.settings.jurisdiction = o.jurisdiction;
    if (o.regulation !== undefined) doc.settings.regulationLabel = o.regulation;
    if (o.settings.journeyPhase !== undefined) doc.settings.journeyPhase = o.settings.journeyPhase ?? null;
    if (o.settings.journeyNote !== undefined) doc.settings.journeyNote = o.settings.journeyNote;
    applyAdditions(doc, manifest, actor.displayName, now);
    doc.settings.seededAt = now;
    return { tasks: doc.tasks.length, documents: doc.documents.length };
  });

  await writeSystemAudit({
    orgId,
    actorId: actor.id,
    actorName: actor.displayName,
    action: "organisation.seed",
    detail: `Seeded ${wouldCreate.tasks} task(s)${replace ? ", replacing the workplan" : ""}; tasks ${before.tasks} before, ${after.tasks} after.`,
  });

  return c.json({ dryRun: false, before, after, wouldCreate, created: { tasks: wouldCreate.tasks } });
});

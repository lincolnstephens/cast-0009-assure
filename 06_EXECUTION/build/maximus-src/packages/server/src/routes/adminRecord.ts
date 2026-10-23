import { Hono } from "hono";
import {
  entryInputSchema,
  orgSettingsSchema,
  v01ImportSchema,
  type LineStatus,
} from "@maximus/shared";
import { moduleOfLine } from "@maximus/shared";
import { mutateOrg, newId, readOrg } from "../db/store.ts";
import type { EntryRecord, DeadlineLabel } from "../db/model.ts";
import {
  applyFilter,
  statementOutlook,
  periodsOf,
  moduleViews,
  statementOf,
  totalsOf,
} from "../lib/record.ts";
import { writeAudit } from "../lib/audit.ts";
import { requireAuth, requireRole, type AppEnv, adminOrgOf } from "../lib/middleware.ts";

/**
 * The operator's side of the Record. The MITMARK contract lead keeps this.
 * The Information Officer never sees it and enters nothing here.
 */
export const adminRecordRoutes = new Hono<AppEnv>();
adminRecordRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

/** An admin acts on an organisation named in the query, defaulting to demo. */
// v1.5: no default organisation; see adminOrgOf.
const orgIdOf = adminOrgOf;

adminRecordRoutes.get("/record", async (c) => {
  const orgId = orgIdOf(c);
  const doc = await readOrg(orgId);
  if (!doc) return c.json({ error: "Organisation not found" }, 404);

  const period = c.req.query("period") && c.req.query("period") !== "all"
    ? (c.req.query("period") as string)
    : "";
  const entries = applyFilter(doc.entries, { period });

  return c.json({
    entries,
    totals: totalsOf(entries, doc.settings),
    periods: periodsOf(doc.entries),
    period: period || "all periods",
    settings: doc.settings,
    modules: moduleViews(doc),
    showingIllustrative: doc.settings.showIllustrative,
  });
});

adminRecordRoutes.get("/record/statement", async (c) => {
  const orgId = orgIdOf(c);
  const doc = await readOrg(orgId);
  if (!doc) return c.json({ error: "Organisation not found" }, 404);
  const period = c.req.query("period") && c.req.query("period") !== "all"
    ? (c.req.query("period") as string)
    : "";
  const visible = doc.entries.filter(
    (e) => e.reviewed && (doc.settings.showIllustrative || !e.ill),
  );
  return c.json(
    statementOf(
      applyFilter(visible, { period }),
      doc.settings,
      period || "all periods",
      new Date(),
      statementOutlook(doc),
    ),
  );
});

adminRecordRoutes.post("/record", async (c) => {
  const orgId = orgIdOf(c);
  const user = c.get("user");
  const parsed = entryInputSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Check the entry: a date, a module, hours and a reviewer are needed." }, 400);
  }
  const input = parsed.data;

  const entry = await mutateOrg(orgId, (doc) => {
    const created: EntryRecord = {
      id: newId(),
      orgId,
      date: input.date,
      area: input.area,
      what: input.what,
      outcome: input.outcome,
      hours: input.hours,
      deadline: input.deadline as DeadlineLabel,
      reviewer: input.reviewer,
      ill: input.ill,
      reviewed: input.reviewed,
      source: "manual",
      sourceRef: null,
      createdAt: new Date().toISOString(),
    };
    doc.entries.push(created);
    return created;
  });

  await writeAudit({ orgId, actorId: user.id, actorName: user.displayName, action: "record.add", detail: `Entry added for module ${entry.area}.` });
  return c.json(entry, 201);
});

adminRecordRoutes.patch("/record/:id", async (c) => {
  const orgId = orgIdOf(c);
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = entryInputSchema.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: "Check the entry." }, 400);

  const updated = await mutateOrg(orgId, (doc) => {
    const e = doc.entries.find((x) => x.id === id);
    if (!e) return null;
    const p = parsed.data;
    if (p.date !== undefined) e.date = p.date;
    if (p.area !== undefined) e.area = p.area;
    if (p.what !== undefined) e.what = p.what;
    if (p.outcome !== undefined) e.outcome = p.outcome;
    if (p.hours !== undefined) e.hours = p.hours;
    if (p.deadline !== undefined) e.deadline = p.deadline as DeadlineLabel;
    if (p.reviewer !== undefined) e.reviewer = p.reviewer;
    if (p.ill !== undefined) e.ill = p.ill;
    if (p.reviewed !== undefined) e.reviewed = p.reviewed;
    return e;
  });

  if (!updated) return c.json({ error: "Entry not found" }, 404);
  await writeAudit({ orgId, actorId: user.id, actorName: user.displayName, action: "record.edit", detail: `Entry ${id} edited.` });
  return c.json(updated);
});

adminRecordRoutes.delete("/record/:id", async (c) => {
  const orgId = orgIdOf(c);
  const user = c.get("user");
  const id = c.req.param("id");
  const removed = await mutateOrg(orgId, (doc) => {
    const i = doc.entries.findIndex((x) => x.id === id);
    if (i === -1) return false;
    doc.entries.splice(i, 1);
    return true;
  });
  if (!removed) return c.json({ error: "Entry not found" }, 404);
  await writeAudit({ orgId, actorId: user.id, actorName: user.displayName, action: "record.remove", detail: `Entry ${id} removed.` });
  return c.json({ ok: true });
});

/** Import a Tessera Assure v0.1 export file. The format is unchanged. */
adminRecordRoutes.post("/record/import", async (c) => {
  const orgId = orgIdOf(c);
  const user = c.get("user");
  const parsed = v01ImportSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Not a Tessera Assure record file." }, 400);

  const DEADLINES: DeadlineLabel[] = [
    "",
    "DSAR one month",
    "Breach 72 hours",
    "DPA before go-live",
    "Board or audit date",
  ];
  const STATUSES: LineStatus[] = ["Live", "Available", "Recommended", "Not in scope"];
  const problems: string[] = [];
  let imported = 0;
  let skipped = 0;

  await mutateOrg(orgId, (doc) => {
    const raw = parsed.data;

    for (const [k, v] of Object.entries(raw.status ?? {})) {
      const id = Number(k);
      // A v0.1 file states twelve line statuses. v1.7 keeps them as history
      // only; the module statuses are the operator's, set in Settings.
      if (id >= 1 && id <= 12 && STATUSES.includes(v as LineStatus)) {
        doc.settings.lineStatus = { ...(doc.settings.lineStatus ?? {}), [String(id)]: v as LineStatus };
      } else {
        problems.push(`Status not recognised for archive line ${k}.`);
      }
    }

    const s = raw.settings ?? {};
    const num = (v: unknown): number | null => {
      if (v === "" || v === null || v === undefined) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    if (typeof s.clientName === "string" && s.clientName) doc.settings.clientName = s.clientName;
    if (typeof s.ioName === "string" && s.ioName) doc.settings.ioName = s.ioName;
    if (typeof s.lead === "string" && s.lead) doc.settings.lead = s.lead;
    const ioRate = num(s.ioRate);
    if (ioRate !== null) doc.settings.ioRate = ioRate;
    const dayRate = num(s.dayRate);
    if (dayRate !== null) doc.settings.dayRate = dayRate;
    const retainer = num(s.retainer);
    doc.settings.retainer = retainer === null ? "" : retainer;

    raw.entries.forEach((e, i) => {
      const date = e.date;
      const line = Number(e.line);
      const hours = Number(e.hours);
      if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        problems.push(`Entry ${i + 1} skipped: no valid date.`);
        skipped += 1;
        return;
      }
      if (!(line >= 1 && line <= 12)) {
        problems.push(`Entry ${i + 1} skipped: archive line ${String(e.line)} is not recognised.`);
        skipped += 1;
        return;
      }
      if (!Number.isFinite(hours)) {
        problems.push(`Entry ${i + 1} skipped: hours could not be read.`);
        skipped += 1;
        return;
      }
      const reviewer = typeof e.reviewer === "string" ? e.reviewer.trim() : "";
      const rawDeadline = typeof e.deadline === "string" ? e.deadline : "";
      const deadline = (DEADLINES as string[]).includes(rawDeadline)
        ? (rawDeadline as DeadlineLabel)
        : "";
      if (rawDeadline && !deadline) {
        problems.push(`Entry ${i + 1}: deadline "${rawDeadline}" not recognised, imported without one.`);
      }
      doc.entries.push({
        id: newId(),
        orgId,
        date,
        // v1.7: a v0.1 file speaks in archive lines; each lands in its module.
        area: moduleOfLine(line),
        line,
        what: typeof e.what === "string" ? e.what : "",
        outcome: typeof e.outcome === "string" ? e.outcome : "",
        hours,
        deadline,
        reviewer: reviewer || "not recorded",
        ill: e.ill === true,
        reviewed: Boolean(reviewer),
        source: "import",
        sourceRef: null,
        createdAt: new Date().toISOString(),
      });
      imported += 1;
    });
  });

  const unreviewed = problems.length;
  if (imported > 0) {
    await writeAudit({ orgId, actorId: user.id, actorName: user.displayName, action: "record.import", detail: `${imported} entries imported from a v0.1 export file.` });
  }
  void unreviewed;

  return c.json({ imported, skipped, problems });
});

/** Operator settings: rates, retainer fee, names, line statuses, demo switch. */
adminRecordRoutes.get("/settings", async (c) => {
  const doc = await readOrg(orgIdOf(c));
  if (!doc) return c.json({ error: "Organisation not found" }, 404);
  return c.json({ settings: doc.settings, branding: doc.branding, name: doc.name });
});

adminRecordRoutes.put("/settings", async (c) => {
  const orgId = orgIdOf(c);
  const user = c.get("user");
  const parsed = orgSettingsSchema.partial().safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Check the settings." }, 400);

  const settings = await mutateOrg(orgId, (doc) => {
    const { moduleStatus, ...rest } = parsed.data;
    Object.assign(doc.settings, rest);
    // Module status merges by module, so saving one module never resets another.
    if (moduleStatus) doc.settings.moduleStatus = { ...doc.settings.moduleStatus, ...moduleStatus };
    if (parsed.data.clientName) doc.branding.displayName = parsed.data.clientName;
    return doc.settings;
  });

  await writeAudit({ orgId, actorId: user.id, actorName: user.displayName, action: "settings.update", detail: "Operator settings updated." });
  return c.json({ settings });
});

/** The client portal's accent, set by the operator or left to the house tokens. */
adminRecordRoutes.put("/branding", async (c) => {
  const orgId = orgIdOf(c);
  const user = c.get("user");
  const body = (await c.req.json().catch(() => null)) as { accent?: unknown } | null;
  const accent = typeof body?.accent === "string" ? body.accent.trim() : "";
  if (accent && !/^#[0-9a-fA-F]{6}$/.test(accent)) {
    return c.json({ error: "Give a colour as a six-digit hex value, or leave it empty." }, 400);
  }
  const branding = await mutateOrg(orgId, (doc) => {
    doc.branding.accent = accent;
    return doc.branding;
  });
  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "branding.update",
    detail: accent ? "Client accent set." : "Client accent cleared.",
  });
  return c.json({ branding });
});

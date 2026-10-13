import { Hono } from "hono";
import { AREA_IDS, moduleOfLine } from "@maximus/shared";
import type { OrgDoc } from "../db/model.ts";
import { listOrgIds, migrateOrg, mutateOrg, readOrgRaw } from "../db/store.ts";
import { writeAudit } from "../lib/audit.ts";
import { buildCorpusFor } from "../lib/documentCorpus.ts";
import { clientVisible, totalsOf } from "../lib/record.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";

/**
 * v1.7 (FRAGO 07 3.4 and 3.5). The two one-off migrations, run against every
 * organisation, one organisation per request so no request runs long:
 *
 *   modules  every Record entry carries its module (from its line, by the
 *            table in packages/shared/src/lines.ts), and the organisation
 *            gets its module statuses. Counts and hours either side must be
 *            equal; the response carries both so the build report can say so.
 *   corpus   every filed file not yet read has its text extracted for Quick
 *            questions, or is marked not searchable with the reason.
 *
 * `dryRun` reports what would change and writes nothing. Both are idempotent:
 * a second run changes nothing and says so.
 */
export const adminMigrationRoutes = new Hono<AppEnv>();
adminMigrationRoutes.use("/migrations/*", requireAuth, requireRole("mitmark_admin"));

function recordCounts(doc: OrgDoc) {
  const all = totalsOf(doc.entries, doc.settings);
  const visible = totalsOf(clientVisible(doc), doc.settings);
  return {
    entries: doc.entries.length,
    hours: all.hours,
    clientVisibleItems: visible.items,
    clientVisibleHours: visible.hours,
    withModule: doc.entries.filter((e) => typeof e.area === "number").length,
    byModule: Object.fromEntries(
      AREA_IDS.map((a) => [String(a), doc.entries.filter((e) => e.area === a).length]).filter(([, n]) => n !== 0),
    ),
    byLine: Object.fromEntries(
      [...new Set(doc.entries.map((e) => e.line).filter((l): l is number => typeof l === "number"))]
        .sort((a, b) => a - b)
        .map((l) => [String(l), doc.entries.filter((e) => e.line === l).length]),
    ),
  };
}

adminMigrationRoutes.get("/migrations/v1-7/organisations", async (c) => {
  return c.json({ organisations: await listOrgIds() });
});

adminMigrationRoutes.post("/migrations/v1-7/modules", async (c) => {
  const orgId = (c.req.query("org") ?? "").trim();
  const dryRun = c.req.query("dryRun") === "1";
  if (!orgId) return c.json({ error: "Name the organisation with ?org=." }, 400);
  const raw = await readOrgRaw(orgId);
  if (!raw) return c.json({ error: "Organisation not found" }, 404);
  const user = c.get("user");

  // Before: the stored document as written, entries counted as they are.
  const rawEntries = (raw.entries ?? []).map((e) => ({ ...e }));
  const needArea = rawEntries.filter((e) => typeof e.area !== "number").length;
  const needStatus = !raw.settings?.moduleStatus;
  const before = {
    entries: rawEntries.length,
    hours: rawEntries.reduce((a, e) => a + Number(e.hours), 0),
    withModule: rawEntries.length - needArea,
    byLine: Object.fromEntries(
      [...new Set(rawEntries.map((e) => e.line).filter((l): l is number => typeof l === "number"))]
        .sort((a, b) => a - b)
        .map((l) => [String(l), rawEntries.filter((e) => e.line === l).length]),
    ),
    moduleStatusSet: !needStatus,
  };

  // After: the same document through the migration, which is what every read
  // already applies; writing it makes it permanent.
  const migrated = migrateOrg(JSON.parse(JSON.stringify(raw)) as OrgDoc);
  const after = { ...recordCounts(migrated), moduleStatus: migrated.settings.moduleStatus };
  const mapping = Object.fromEntries(
    Object.keys(before.byLine).map((l) => [l, moduleOfLine(Number(l))]),
  );
  const equal = before.entries === after.entries && Math.abs(before.hours - after.hours) < 1e-9;

  if (!equal) {
    return c.json({ orgId, dryRun, before, after, mapping, equal, written: false, error: "Counts differ; nothing written." }, 409);
  }

  let written = false;
  if (!dryRun && (needArea > 0 || needStatus)) {
    await mutateOrg(orgId, () => {
      // readOrg inside mutateOrg has already applied migrateOrg; the write
      // persists it.
    });
    written = true;
    await writeAudit({
      orgId,
      actorId: user.id,
      actorName: user.displayName,
      action: "migration.v1_7.modules",
      detail: `Line-to-module migration: ${needArea} of ${before.entries} entries given a module; ${before.hours} hours before and ${after.hours} after; module status ${needStatus ? "set" : "unchanged"}.`,
    });
  }

  return c.json({ orgId, dryRun, before, after, mapping, equal, written, entriesMigrated: needArea, moduleStatusSet: needStatus });
});

adminMigrationRoutes.post("/migrations/v1-7/corpus", async (c) => {
  const orgId = (c.req.query("org") ?? "").trim();
  const dryRun = c.req.query("dryRun") === "1";
  if (!orgId) return c.json({ error: "Name the organisation with ?org=." }, 400);
  const raw = await readOrgRaw(orgId);
  if (!raw) return c.json({ error: "Organisation not found" }, 404);
  const user = c.get("user");
  const docs = raw.documents ?? [];

  const files = docs.filter((d) => d.kind === "file");
  const before = {
    documents: docs.length,
    files: files.length,
    links: docs.filter((d) => d.kind === "link").length,
    searchable: files.filter((d) => d.searchable === "yes").length,
    notSearchable: files.filter((d) => d.searchable === "no").length,
    notYetRead: files.filter((d) => !d.searchable).length,
  };

  // `force=1` reads every file again, for when the extractor improves.
  const force = c.req.query("force") === "1";
  const toRead = files.filter((d) => force || !d.searchable);
  const outcomes: { id: string; title: string; searchable: "yes" | "no"; sections: number; note: string }[] = [];
  if (!dryRun) {
    for (const d of toRead) {
      const out = await buildCorpusFor(orgId, d);
      if (out) outcomes.push({ id: d.id, title: d.title, searchable: out.searchable, sections: out.sections, note: out.searchNote });
    }
    if (outcomes.length) {
      await mutateOrg(orgId, (doc) => {
        for (const o of outcomes) {
          const r = doc.documents.find((x) => x.id === o.id);
          if (r) {
            r.searchable = o.searchable;
            r.searchNote = o.note;
          }
        }
      });
      await writeAudit({
        orgId,
        actorId: user.id,
        actorName: user.displayName,
        action: "migration.v1_7.corpus",
        detail: `Document corpus migration: ${outcomes.filter((o) => o.searchable === "yes").length} of ${outcomes.length} files made searchable; ${outcomes.filter((o) => o.searchable === "no").length} marked not searchable.`,
      });
    }
  }

  let after = null;
  if (!dryRun) {
    const now = ((await readOrgRaw(orgId))?.documents ?? []).filter((d) => d.kind === "file");
    after = {
      documents: before.documents,
      files: now.length,
      links: before.links,
      searchable: now.filter((d) => d.searchable === "yes").length,
      notSearchable: now.filter((d) => d.searchable === "no").length,
      notYetRead: now.filter((d) => !d.searchable).length,
    };
  }

  return c.json({ orgId, dryRun, before, after, wouldRead: toRead.length, outcomes });
});

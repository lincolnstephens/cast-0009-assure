import { Hono } from "hono";
import type { AuditRecord } from "../db/model.ts";
import { readOrg } from "../db/store.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";

export const adminAuditRoutes = new Hono<AppEnv>();
adminAuditRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

/**
 * `entity` / `entityId` no longer exist on `AuditRecord` (db/model.ts) — that
 * information is folded into `action` and/or `detail` text by the writer
 * (see `lib/audit.ts`). Filtering here is by `action` only; an `entity` query
 * parameter, if still sent by an older client, is accepted and ignored
 * rather than erroring.
 */
function filterRows(rows: AuditRecord[], action: string | undefined): AuditRecord[] {
  return action ? rows.filter((r) => r.action === action) : rows;
}

/** Filterable audit log for the selected client account (newest first). */
adminAuditRoutes.get("/audit", async (c) => {
  const accountId = c.req.query("accountId");
  if (!accountId) return c.json({ error: "accountId is required" }, 400);

  const doc = await readOrg(accountId);
  if (!doc) return c.json({ error: "Organisation not found" }, 404);

  const rows = filterRows([...doc.audit].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), c.req.query("action")).slice(0, 500);

  return c.json({
    entries: rows.map((r) => ({
      id: r.id,
      action: r.action,
      detail: r.detail,
      createdAt: r.createdAt,
      actorId: r.actorId,
      actorName: r.actorName,
    })),
  });
});

/** CSV export of the filtered audit log (read-only). */
adminAuditRoutes.get("/audit/export.csv", async (c) => {
  const accountId = c.req.query("accountId");
  if (!accountId) return c.json({ error: "accountId is required" }, 400);

  const doc = await readOrg(accountId);
  if (!doc) return c.json({ error: "Organisation not found" }, 404);

  const rows = filterRows([...doc.audit].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), c.req.query("action")).slice(0, 5000);

  const header = "timestamp,action,actor,detail\n";
  const lines = rows.map((r) =>
    [r.createdAt, r.action, r.actorName, r.detail].map(csvEscape).join(","),
  );

  return new Response(header + lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="audit-log.csv"',
    },
  });
});

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

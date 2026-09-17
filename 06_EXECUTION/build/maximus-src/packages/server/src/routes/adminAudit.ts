import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { getDb } from "../db/index.ts";
import { auditLog, users } from "../db/schema.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";

export const adminAuditRoutes = new Hono<AppEnv>();
adminAuditRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

function auditFilters(c: { req: { query: (k: string) => string | undefined } }, accountId: string) {
  const action = c.req.query("action")?.trim();
  const entity = c.req.query("entity")?.trim();
  const conditions = [eq(auditLog.clientAccountId, accountId)];
  if (action) conditions.push(eq(auditLog.action, action));
  if (entity) conditions.push(eq(auditLog.entity, entity));
  return conditions;
}

/** Filterable audit log for the selected client account (newest first). */
adminAuditRoutes.get("/audit", async (c) => {
  const accountId = c.req.query("accountId");
  if (!accountId) return c.json({ error: "accountId is required" }, 400);

  const db = getDb();
  const rows = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      detail: auditLog.detail,
      createdAt: auditLog.createdAt,
      actorId: auditLog.actorId,
      actorName: users.displayName,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.actorId, users.id))
    .where(and(...auditFilters(c, accountId)))
    .orderBy(desc(auditLog.createdAt))
    .limit(500);

  return c.json({
    entries: rows.map((r) => ({
      id: r.id,
      action: r.action,
      entity: r.entity,
      entityId: r.entityId,
      detail: r.detail,
      createdAt: r.createdAt.toISOString(),
      actorId: r.actorId,
      actorName: r.actorName,
    })),
  });
});

/** CSV export of the filtered audit log (read-only). */
adminAuditRoutes.get("/audit/export.csv", async (c) => {
  const accountId = c.req.query("accountId");
  if (!accountId) return c.json({ error: "accountId is required" }, 400);

  const db = getDb();
  const rows = await db
    .select({
      createdAt: auditLog.createdAt,
      action: auditLog.action,
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      actorName: users.displayName,
      detail: auditLog.detail,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.actorId, users.id))
    .where(and(...auditFilters(c, accountId)))
    .orderBy(desc(auditLog.createdAt))
    .limit(5000);

  const header = "timestamp,action,entity,entity_id,actor,detail_json\n";
  const lines = rows.map((r) => {
    const cols = [
      r.createdAt.toISOString(),
      r.action,
      r.entity,
      r.entityId ?? "",
      r.actorName ?? "",
      JSON.stringify(r.detail ?? null),
    ];
    return cols.map(csvEscape).join(",");
  });

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

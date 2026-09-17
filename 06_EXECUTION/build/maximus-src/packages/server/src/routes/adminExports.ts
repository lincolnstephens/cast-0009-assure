import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { getDb } from "../db/index.ts";
import { exports as exportsTable } from "../db/schema.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";

export const adminExportRoutes = new Hono<AppEnv>();
adminExportRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

adminExportRoutes.get("/exports", async (c) => {
  const accountId = c.req.query("accountId");
  if (!accountId) return c.json({ error: "accountId is required" }, 400);

  const rows = await dbExports(getDb(), accountId);
  return c.json({ exports: rows });
});

async function dbExports(db: ReturnType<typeof getDb>, accountId: string) {
  const rows = await db
    .select()
    .from(exportsTable)
    .where(eq(exportsTable.clientAccountId, accountId))
    .orderBy(desc(exportsTable.createdAt));

  return rows.map((r) => ({
    id: r.id,
    state: r.state,
    createdAt: r.createdAt.toISOString(),
    generatedAt: r.generatedAt?.toISOString() ?? null,
    downloadable: r.state === "generated",
  }));
}

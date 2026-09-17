import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { getDb } from "../db/index.ts";
import { exports as exportsTable, reviewItems } from "../db/schema.ts";
import { writeAudit } from "../lib/audit.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";

export const exportRoutes = new Hono<AppEnv>();
exportRoutes.use("*", requireAuth);

async function findExportForUser(
  db: ReturnType<typeof getDb>,
  id: string,
  user: { role: string; clientAccountId: string | null },
) {
  const [row] = await db.select().from(exportsTable).where(eq(exportsTable.id, id)).limit(1);
  if (!row) return { row: null, forbidden: false };
  if (user.role === "client" && row.clientAccountId !== user.clientAccountId) {
    return { row: null, forbidden: true };
  }
  return { row, forbidden: false };
}

/** Client's export requests for their account. */
exportRoutes.get("/", requireRole("client"), async (c) => {
  const db = getDb();
  const user = c.get("user");
  const rows = await db
    .select()
    .from(exportsTable)
    .where(eq(exportsTable.clientAccountId, user.clientAccountId!))
    .orderBy(exportsTable.createdAt);

  return c.json({
    exports: rows.map((r) => ({
      id: r.id,
      state: r.state,
      createdAt: r.createdAt.toISOString(),
      generatedAt: r.generatedAt?.toISOString() ?? null,
      downloadable: r.state === "generated",
    })),
  });
});

/** Request a defence-file export — creates review item for officer approval. */
exportRoutes.post("/", requireRole("client"), async (c) => {
  const db = getDb();
  const user = c.get("user");

  const [existing] = await db
    .select({ id: exportsTable.id })
    .from(exportsTable)
    .where(
      and(
        eq(exportsTable.clientAccountId, user.clientAccountId!),
        eq(exportsTable.state, "requested"),
      ),
    )
    .limit(1);
  if (existing) {
    return c.json({ error: "You already have an export awaiting approval." }, 409);
  }

  const [row] = await db
    .insert(exportsTable)
    .values({
      clientAccountId: user.clientAccountId!,
      requestedBy: user.id,
      state: "requested",
    })
    .returning();

  await db.insert(reviewItems).values({
    clientAccountId: user.clientAccountId!,
    type: "export_request",
    refId: row.id,
    state: "pending",
  });

  await writeAudit(db, {
    clientAccountId: user.clientAccountId!,
    actorId: user.id,
    action: "export.request",
    entity: "export",
    entityId: row.id,
    detail: {},
  });

  return c.json({ id: row.id }, 201);
});

/** Download a generated defence file — tenant-scoped, authenticated only. */
exportRoutes.get("/:id/download", async (c) => {
  const db = getDb();
  const user = c.get("user");
  const { row, forbidden } = await findExportForUser(db, c.req.param("id"), user);
  if (forbidden) return c.json({ error: "Forbidden" }, 403);
  if (!row) return c.json({ error: "Not found" }, 404);
  if (row.state !== "generated" || !row.fileData) {
    return c.json({ error: "This export is not ready to download yet." }, 404);
  }

  const filename = `defence-file-${row.id.slice(0, 8)}.zip`;
  return new Response(row.fileData, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});

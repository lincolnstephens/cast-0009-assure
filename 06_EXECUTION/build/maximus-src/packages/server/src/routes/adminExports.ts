import { Hono } from "hono";
import { readOrg } from "../db/store.ts";
import { requireAuth, requireRole, type AppEnv, ADMIN_ORG_HEADER } from "../lib/middleware.ts";

export const adminExportRoutes = new Hono<AppEnv>();
adminExportRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

adminExportRoutes.get("/exports", async (c) => {
  const accountId = c.req.query("accountId") || c.req.header(ADMIN_ORG_HEADER);
  if (!accountId) return c.json({ error: "accountId is required" }, 400);

  const doc = await readOrg(accountId);
  if (!doc) return c.json({ error: "Organisation not found" }, 404);

  return c.json({
    exports: doc.exports.map((r) => ({
      id: r.id,
      state: r.state,
      generatedAt: r.generatedAt,
      downloadable: r.state === "generated",
    })),
  });
});

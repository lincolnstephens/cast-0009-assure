import { Hono } from "hono";
import { readOrg } from "../db/store.ts";
import { domainsForOrg, historyForDomain } from "../lib/posture.ts";
import { requireAuth, requireClientSeat, type AppEnv } from "../lib/middleware.ts";

export const postureRoutes = new Hono<AppEnv>();
postureRoutes.use("*", requireAuth, requireClientSeat);

/** Read-only posture dashboard for the signed-in client's organisation. */
postureRoutes.get("/", async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ domains: [] });
  const doc = await readOrg(user.clientAccountId);
  if (!doc) return c.json({ domains: [] });

  return c.json({
    domains: domainsForOrg(doc).map((d) => ({
      id: d.id,
      domain: d.domain,
      label: d.label,
      status: d.rag,
      note: d.note,
      updatedAt: d.setAt,
      verifiedBy: d.setBy,
      history: historyForDomain(doc, d).map((h) => ({ status: h.rag, recordedAt: h.weekOf })),
    })),
  });
});

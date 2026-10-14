import { Hono } from "hono";
import { readBrandingLogo, readOrg } from "../db/store.ts";
import { logoResponse } from "../lib/logo.ts";
import { requireAuth, requireClientSeat, type AppEnv } from "../lib/middleware.ts";

/**
 * v1.8 (FRAGO 08 3.2). The client portal's logo, for the signed-in seat's own
 * organisation only. An operator reaches it in "View as client", through the
 * same guard as every other client read, for the organisation being viewed.
 * There is no route that takes an organisation id from a client.
 */
export const brandingRoutes = new Hono<AppEnv>();
brandingRoutes.use("*", requireAuth, requireClientSeat);

brandingRoutes.get("/logo", async (c) => {
  const orgId = c.get("user").clientAccountId;
  if (!orgId) return c.json({ error: "No logo" }, 404);
  const doc = await readOrg(orgId);
  const logo = doc?.branding.logo;
  if (!logo) return c.json({ error: "No logo" }, 404);
  const bytes = await readBrandingLogo(orgId);
  if (!bytes) return c.json({ error: "No logo" }, 404);
  return logoResponse(bytes, logo.contentType);
});

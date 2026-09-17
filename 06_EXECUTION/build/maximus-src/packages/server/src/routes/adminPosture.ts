import { updatePostureSchema } from "@maximus/shared";
import { Hono } from "hono";
import { mutateOrg, readOrg } from "../db/store.ts";
import { writeAudit } from "../lib/audit.ts";
import { domainsForOrg, findPostureDomainGlobally, historyForDomain, recordPostureChange } from "../lib/posture.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";

export const adminPostureRoutes = new Hono<AppEnv>();
adminPostureRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

adminPostureRoutes.get("/posture", async (c) => {
  const accountId = c.req.query("accountId");
  if (!accountId) return c.json({ error: "accountId is required" }, 400);
  const doc = await readOrg(accountId);
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

/** Officer-only: status change requires a note; writes weekly history + audit. */
adminPostureRoutes.put("/posture/:id", async (c) => {
  const parsed = updatePostureSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Set a status and write a short note explaining the change." }, 400);
  }

  const user = c.get("user");
  const found = await findPostureDomainGlobally(c.req.param("id"));
  if (!found) return c.json({ error: "Not found" }, 404);

  const orgId = found.doc.id;
  const ok = await mutateOrg(orgId, (doc) => {
    const domain = doc.posture.find((d) => d.id === found.domain.id);
    if (!domain) return false;
    recordPostureChange(doc, {
      domain,
      rag: parsed.data.status,
      note: parsed.data.note,
      setByName: user.displayName,
    });
    return true;
  });
  if (!ok) return c.json({ error: "Not found" }, 404);

  await writeAudit({
    orgId: orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "posture.update",
    detail: `Posture domain ${found.domain.domain} set to ${parsed.data.status}.`,
  });

  return c.json({ ok: true });
});

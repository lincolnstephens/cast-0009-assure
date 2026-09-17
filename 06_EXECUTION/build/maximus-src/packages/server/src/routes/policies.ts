import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { getDb } from "../db/index.ts";
import { policies } from "../db/schema.ts";
import { latestApprovedPolicies, sectionsFor } from "../lib/policies.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";

export const policyRoutes = new Hono<AppEnv>();
policyRoutes.use("*", requireAuth, requireRole("client"));

/** Latest approved version of each policy — the client's whole policy pack. */
policyRoutes.get("/", async (c) => {
  const db = getDb();
  const user = c.get("user");
  const latest = await latestApprovedPolicies(db, user.clientAccountId!);
  return c.json({
    policies: latest.map((p) => ({
      id: p.id,
      code: p.code,
      title: p.title,
      version: p.version,
      approvedAt: p.approvedAt?.toISOString() ?? null,
    })),
  });
});

/** One approved policy with its sections (side-panel view). */
policyRoutes.get("/:id", async (c) => {
  const db = getDb();
  const user = c.get("user");

  const [policy] = await db
    .select()
    .from(policies)
    .where(eq(policies.id, c.req.param("id")))
    .limit(1);
  if (!policy) return c.json({ error: "Not found" }, 404);
  if (policy.clientAccountId !== user.clientAccountId) {
    return c.json({ error: "Forbidden" }, 403);
  }
  // Drafts are invisible to clients. Superseded APPROVED versions stay
  // openable by id: chat citation chips must resolve to the version that
  // served the answer, even after a newer version is approved.
  if (policy.status !== "approved") {
    return c.json({ error: "Not found" }, 404);
  }

  const sections = await sectionsFor(db, [policy.id]);
  return c.json({
    id: policy.id,
    code: policy.code,
    title: policy.title,
    version: policy.version,
    bodyMarkdown: policy.bodyMarkdown,
    approvedAt: policy.approvedAt?.toISOString() ?? null,
    sections: sections.map((s) => ({
      id: s.id,
      sectionRef: s.sectionRef,
      heading: s.heading,
      bodyMarkdown: s.bodyMarkdown,
    })),
  });
});

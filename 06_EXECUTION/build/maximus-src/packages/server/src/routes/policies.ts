import { Hono } from "hono";
import { readOrg } from "../db/store.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";
import { findPolicyAnywhere, latestApprovedPolicies, parsePolicyDocument } from "../lib/policies.ts";

export const policyRoutes = new Hono<AppEnv>();
policyRoutes.use("*", requireAuth, requireRole("client"));

/** Latest approved version of each policy — the client's whole policy pack. */
policyRoutes.get("/", async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);
  const doc = await readOrg(user.clientAccountId);
  if (!doc) return c.json({ error: "No organisation" }, 404);

  const latest = latestApprovedPolicies(doc);
  return c.json({
    policies: latest.map((p) => ({
      id: p.id,
      code: p.code,
      title: p.title,
      version: p.version,
      approvedAt: p.approvedAt,
    })),
  });
});

/** One approved policy with its sections (side-panel view). */
policyRoutes.get("/:id", async (c) => {
  const user = c.get("user");
  const found = await findPolicyAnywhere(c.req.param("id"));
  if (!found) return c.json({ error: "Not found" }, 404);
  if (found.orgId !== user.clientAccountId) {
    return c.json({ error: "Forbidden" }, 403);
  }
  const { policy } = found;
  // Drafts are invisible to clients. Superseded APPROVED versions stay
  // openable by id: chat citation chips must resolve to the version that
  // served the answer, even after a newer version is approved.
  if (policy.status !== "approved") {
    return c.json({ error: "Not found" }, 404);
  }

  const { preamble, sections } = parsePolicyDocument(policy.id, policy.bodyMarkdown);
  return c.json({
    id: policy.id,
    code: policy.code,
    title: policy.title,
    version: policy.version,
    bodyMarkdown: preamble,
    approvedAt: policy.approvedAt,
    sections: sections.map((s) => ({
      id: s.id,
      sectionRef: s.sectionRef,
      heading: s.heading,
      bodyMarkdown: s.bodyMarkdown,
    })),
  });
});

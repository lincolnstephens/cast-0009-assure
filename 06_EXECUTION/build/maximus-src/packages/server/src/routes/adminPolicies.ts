import { createPolicySchema, updatePolicySchema } from "@maximus/shared";
import { Hono } from "hono";
import type { PolicyRecord } from "../db/model.ts";
import { mutateOrg, newId, readOrg } from "../db/store.ts";
import { writeAudit } from "../lib/audit.ts";
import { requireAuth, requireRole, type AppEnv, ADMIN_ORG_HEADER } from "../lib/middleware.ts";
import { createDraftFrom, findPolicyAnywhere, parsePolicyDocument } from "../lib/policies.ts";
import { raisePolicyEntry } from "../lib/raiseEntry.ts";

export const adminPolicyRoutes = new Hono<AppEnv>();
adminPolicyRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

function detailOf(policy: PolicyRecord) {
  const { preamble, sections } = parsePolicyDocument(policy.id, policy.bodyMarkdown);
  return {
    id: policy.id,
    code: policy.code,
    title: policy.title,
    version: policy.version,
    status: policy.status,
    bodyMarkdown: preamble,
    approvedAt: policy.approvedAt,
    sections: sections.map((s) => ({
      id: s.id,
      sectionRef: s.sectionRef,
      heading: s.heading,
      bodyMarkdown: s.bodyMarkdown,
    })),
  };
}

/** All policy versions for an account, newest version first per code. */
adminPolicyRoutes.get("/policies", async (c) => {
  const accountId = c.req.query("accountId") || c.req.header(ADMIN_ORG_HEADER);
  if (!accountId) return c.json({ error: "accountId is required" }, 400);
  const doc = await readOrg(accountId);
  if (!doc) return c.json({ error: "Organisation not found" }, 404);

  const rows = [...doc.policies].sort(
    (a, b) => a.code.localeCompare(b.code) || b.version - a.version,
  );
  return c.json({
    policies: rows.map((p) => ({
      id: p.id,
      code: p.code,
      title: p.title,
      version: p.version,
      status: p.status,
      approvedAt: p.approvedAt,
    })),
  });
});

/** One policy version with sections (any status - this is the admin view). */
adminPolicyRoutes.get("/policies/:id", async (c) => {
  const found = await findPolicyAnywhere(c.req.param("id"));
  if (!found) return c.json({ error: "Not found" }, 404);
  return c.json(detailOf(found.policy));
});

/** Create a new policy (version 1, draft). */
adminPolicyRoutes.post("/policies", async (c) => {
  const parsed = createPolicySchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Enter a code like DP-01 and a title." }, 400);
  }
  const user = c.get("user");
  const { clientAccountId, code, title, bodyMarkdown } = parsed.data;

  const doc = await readOrg(clientAccountId);
  if (!doc) return c.json({ error: "Organisation not found" }, 404);

  let conflict = false;
  const policy = await mutateOrg(clientAccountId, (d) => {
    if (d.policies.some((p) => p.code === code)) {
      conflict = true;
      return null;
    }
    const created: PolicyRecord = {
      id: newId(),
      orgId: clientAccountId,
      code,
      title,
      version: 1,
      status: "draft",
      bodyMarkdown: bodyMarkdown ?? "",
      approvedBy: null,
      approvedAt: null,
      createdAt: new Date().toISOString(),
    };
    d.policies.push(created);
    return created;
  });

  if (conflict || !policy) {
    return c.json({ error: "That code already exists for this account." }, 409);
  }

  await writeAudit({
    orgId: clientAccountId,
    actorId: user.id,
    actorName: user.displayName,
    action: "policy.create",
    detail: `code=${code} version=1`,
  });

  return c.json({ id: policy.id }, 201);
});

/** Explicitly snapshot an approved policy into a new draft version. */
adminPolicyRoutes.post("/policies/:id/draft", async (c) => {
  const user = c.get("user");
  const found = await findPolicyAnywhere(c.req.param("id"));
  if (!found) return c.json({ error: "Not found" }, 404);
  if (found.policy.status !== "approved") {
    return c.json({ error: "Only approved policies can be drafted from." }, 409);
  }

  const draft = await mutateOrg(found.orgId, (doc) => {
    const source = doc.policies.find((p) => p.id === found.policy.id)!;
    return createDraftFrom(doc, source);
  });

  await writeAudit({
    orgId: found.orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "policy.draft_create",
    detail: `code=${found.policy.code} fromVersion=${found.policy.version} version=${draft.version}`,
  });

  return c.json({ id: draft.id, version: draft.version }, 201);
});

/** Edit a DRAFT policy's title/body. Approved versions are immutable. */
adminPolicyRoutes.put("/policies/:id", async (c) => {
  const parsed = updatePolicySchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Nothing valid to update." }, 400);

  const user = c.get("user");
  const found = await findPolicyAnywhere(c.req.param("id"));
  if (!found) return c.json({ error: "Not found" }, 404);
  if (found.policy.status !== "draft") {
    return c.json(
      { error: "Approved versions are immutable. Create a new draft first." },
      409,
    );
  }

  await mutateOrg(found.orgId, (doc) => {
    const policy = doc.policies.find((p) => p.id === found.policy.id)!;
    if (parsed.data.title !== undefined) policy.title = parsed.data.title;
    if (parsed.data.bodyMarkdown !== undefined) policy.bodyMarkdown = parsed.data.bodyMarkdown;
  });

  await writeAudit({
    orgId: found.orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "policy.update",
    detail: `code=${found.policy.code} version=${found.policy.version}`,
  });

  return c.json({ ok: true });
});

/** Delete a DRAFT version. Approved versions are retained forever. */
adminPolicyRoutes.delete("/policies/:id", async (c) => {
  const user = c.get("user");
  const found = await findPolicyAnywhere(c.req.param("id"));
  if (!found) return c.json({ error: "Not found" }, 404);
  if (found.policy.status !== "draft") {
    return c.json({ error: "Approved versions cannot be deleted." }, 409);
  }

  await mutateOrg(found.orgId, (doc) => {
    const i = doc.policies.findIndex((p) => p.id === found.policy.id);
    if (i !== -1) doc.policies.splice(i, 1);
  });

  await writeAudit({
    orgId: found.orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "policy.delete_draft",
    detail: `code=${found.policy.code} version=${found.policy.version}`,
  });

  return c.json({ ok: true });
});

/**
 * Approve a draft: records approver + timestamp; it becomes the live
 * version, and raises a Record entry (line 3) for the approving admin.
 */
adminPolicyRoutes.post("/policies/:id/approve", async (c) => {
  const user = c.get("user");
  const found = await findPolicyAnywhere(c.req.param("id"));
  if (!found) return c.json({ error: "Not found" }, 404);
  if (found.policy.status !== "draft") {
    return c.json({ error: "Only drafts can be approved." }, 409);
  }

  await mutateOrg(found.orgId, (doc) => {
    const policy = doc.policies.find((p) => p.id === found.policy.id)!;
    const approvedAt = new Date().toISOString();
    policy.status = "approved";
    policy.approvedBy = user.id;
    policy.approvedAt = approvedAt;

    raisePolicyEntry(doc, {
      policyId: policy.id,
      title: policy.title,
      version: policy.version,
      reviewer: user.displayName,
    });
  });

  await writeAudit({
    orgId: found.orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "policy.approve",
    detail: `code=${found.policy.code} version=${found.policy.version}`,
  });

  return c.json({ ok: true });
});

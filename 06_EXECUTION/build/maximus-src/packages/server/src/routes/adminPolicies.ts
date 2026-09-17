import {
  createPolicySchema,
  updatePolicySchema,
  upsertSectionSchema,
} from "@maximus/shared";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { getDb } from "../db/index.ts";
import { policies, policySections } from "../db/schema.ts";
import { writeAudit } from "../lib/audit.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";
import { createDraftFrom, sectionsFor } from "../lib/policies.ts";

export const adminPolicyRoutes = new Hono<AppEnv>();
adminPolicyRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

/** All policy versions for an account, newest version first per code. */
adminPolicyRoutes.get("/policies", async (c) => {
  const db = getDb();
  const accountId = c.req.query("accountId");
  if (!accountId) return c.json({ error: "accountId is required" }, 400);

  const rows = await db
    .select()
    .from(policies)
    .where(eq(policies.clientAccountId, accountId))
    .orderBy(policies.code, desc(policies.version));

  return c.json({
    policies: rows.map((p) => ({
      id: p.id,
      code: p.code,
      title: p.title,
      version: p.version,
      status: p.status,
      approvedAt: p.approvedAt?.toISOString() ?? null,
    })),
  });
});

/** One policy version with sections (any status — this is the admin view). */
adminPolicyRoutes.get("/policies/:id", async (c) => {
  const db = getDb();
  const [policy] = await db
    .select()
    .from(policies)
    .where(eq(policies.id, c.req.param("id")))
    .limit(1);
  if (!policy) return c.json({ error: "Not found" }, 404);

  const sections = await sectionsFor(db, [policy.id]);
  return c.json({
    id: policy.id,
    code: policy.code,
    title: policy.title,
    version: policy.version,
    status: policy.status,
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

/** Create a new policy (version 1, draft). */
adminPolicyRoutes.post("/policies", async (c) => {
  const parsed = createPolicySchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Enter a code like DP-01 and a title." }, 400);
  }
  const db = getDb();
  const user = c.get("user");

  const [existing] = await db
    .select({ id: policies.id })
    .from(policies)
    .where(
      and(
        eq(policies.clientAccountId, parsed.data.clientAccountId),
        eq(policies.code, parsed.data.code),
      ),
    )
    .limit(1);
  if (existing) {
    return c.json({ error: "That code already exists for this account." }, 409);
  }

  const [policy] = await db
    .insert(policies)
    .values({
      clientAccountId: parsed.data.clientAccountId,
      code: parsed.data.code,
      title: parsed.data.title,
      bodyMarkdown: parsed.data.bodyMarkdown,
      version: 1,
      status: "draft",
    })
    .returning();

  await writeAudit(db, {
    clientAccountId: policy.clientAccountId,
    actorId: user.id,
    action: "policy.create",
    entity: "policy",
    entityId: policy.id,
    detail: { code: policy.code, version: 1 },
  });

  return c.json({ id: policy.id }, 201);
});

/** Explicitly snapshot an approved policy into a new draft version. */
adminPolicyRoutes.post("/policies/:id/draft", async (c) => {
  const db = getDb();
  const user = c.get("user");
  const policy = await findPolicy(db, c.req.param("id"));
  if (!policy) return c.json({ error: "Not found" }, 404);
  if (policy.status !== "approved") {
    return c.json({ error: "Only approved policies can be drafted from." }, 409);
  }
  const draft = await createDraftFrom(db, policy, user.id);
  return c.json({ id: draft.id, version: draft.version }, 201);
});

/** Edit a DRAFT policy's title/body. Approved versions are immutable. */
adminPolicyRoutes.put("/policies/:id", async (c) => {
  const parsed = updatePolicySchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Nothing valid to update." }, 400);

  const db = getDb();
  const user = c.get("user");
  const policy = await findPolicy(db, c.req.param("id"));
  if (!policy) return c.json({ error: "Not found" }, 404);
  if (policy.status !== "draft") {
    return c.json(
      { error: "Approved versions are immutable. Create a new draft first." },
      409,
    );
  }

  await db
    .update(policies)
    .set({
      ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
      ...(parsed.data.bodyMarkdown !== undefined
        ? { bodyMarkdown: parsed.data.bodyMarkdown }
        : {}),
    })
    .where(eq(policies.id, policy.id));

  await writeAudit(db, {
    clientAccountId: policy.clientAccountId,
    actorId: user.id,
    action: "policy.update",
    entity: "policy",
    entityId: policy.id,
    detail: { code: policy.code, version: policy.version },
  });

  return c.json({ ok: true });
});

/** Delete a DRAFT version. Approved versions are retained forever. */
adminPolicyRoutes.delete("/policies/:id", async (c) => {
  const db = getDb();
  const user = c.get("user");
  const policy = await findPolicy(db, c.req.param("id"));
  if (!policy) return c.json({ error: "Not found" }, 404);
  if (policy.status !== "draft") {
    return c.json({ error: "Approved versions cannot be deleted." }, 409);
  }

  await db.delete(policySections).where(eq(policySections.policyId, policy.id));
  await db.delete(policies).where(eq(policies.id, policy.id));

  await writeAudit(db, {
    clientAccountId: policy.clientAccountId,
    actorId: user.id,
    action: "policy.delete_draft",
    entity: "policy",
    entityId: policy.id,
    detail: { code: policy.code, version: policy.version },
  });

  return c.json({ ok: true });
});

/** Approve a draft: records approver + timestamp; it becomes the live version. */
adminPolicyRoutes.post("/policies/:id/approve", async (c) => {
  const db = getDb();
  const user = c.get("user");
  const policy = await findPolicy(db, c.req.param("id"));
  if (!policy) return c.json({ error: "Not found" }, 404);
  if (policy.status !== "draft") {
    return c.json({ error: "Only drafts can be approved." }, 409);
  }

  const approvedAt = new Date();
  await db
    .update(policies)
    .set({ status: "approved", approvedBy: user.id, approvedAt })
    .where(eq(policies.id, policy.id));

  await writeAudit(db, {
    clientAccountId: policy.clientAccountId,
    actorId: user.id,
    action: "policy.approve",
    entity: "policy",
    entityId: policy.id,
    detail: { code: policy.code, version: policy.version },
  });

  return c.json({ ok: true });
});

/** Add a section to a draft. */
adminPolicyRoutes.post("/policies/:id/sections", async (c) => {
  const parsed = upsertSectionSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Enter a section ref (e.g. 4.2), heading and body." }, 400);
  }
  const db = getDb();
  const user = c.get("user");
  const policy = await findPolicy(db, c.req.param("id"));
  if (!policy) return c.json({ error: "Not found" }, 404);
  if (policy.status !== "draft") {
    return c.json(
      { error: "Approved versions are immutable. Create a new draft first." },
      409,
    );
  }

  const [section] = await db
    .insert(policySections)
    .values({
      policyId: policy.id,
      sectionRef: parsed.data.sectionRef,
      heading: parsed.data.heading,
      bodyMarkdown: parsed.data.bodyMarkdown,
    })
    .returning();

  await writeAudit(db, {
    clientAccountId: policy.clientAccountId,
    actorId: user.id,
    action: "policy.section_add",
    entity: "policy_section",
    entityId: section.id,
    detail: { code: policy.code, version: policy.version, sectionRef: section.sectionRef },
  });

  return c.json({ id: section.id }, 201);
});

/** Edit a section of a draft. */
adminPolicyRoutes.put("/sections/:id", async (c) => {
  const parsed = upsertSectionSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Enter a section ref (e.g. 4.2), heading and body." }, 400);
  }
  const db = getDb();
  const user = c.get("user");
  const found = await findSection(db, c.req.param("id"));
  if (!found) return c.json({ error: "Not found" }, 404);
  if (found.policy.status !== "draft") {
    return c.json(
      { error: "Approved versions are immutable. Create a new draft first." },
      409,
    );
  }

  await db
    .update(policySections)
    .set(parsed.data)
    .where(eq(policySections.id, found.section.id));

  await writeAudit(db, {
    clientAccountId: found.policy.clientAccountId,
    actorId: user.id,
    action: "policy.section_update",
    entity: "policy_section",
    entityId: found.section.id,
    detail: {
      code: found.policy.code,
      version: found.policy.version,
      sectionRef: parsed.data.sectionRef,
    },
  });

  return c.json({ ok: true });
});

/** Remove a section from a draft. */
adminPolicyRoutes.delete("/sections/:id", async (c) => {
  const db = getDb();
  const user = c.get("user");
  const found = await findSection(db, c.req.param("id"));
  if (!found) return c.json({ error: "Not found" }, 404);
  if (found.policy.status !== "draft") {
    return c.json(
      { error: "Approved versions are immutable. Create a new draft first." },
      409,
    );
  }

  await db.delete(policySections).where(eq(policySections.id, found.section.id));

  await writeAudit(db, {
    clientAccountId: found.policy.clientAccountId,
    actorId: user.id,
    action: "policy.section_delete",
    entity: "policy_section",
    entityId: found.section.id,
    detail: {
      code: found.policy.code,
      version: found.policy.version,
      sectionRef: found.section.sectionRef,
    },
  });

  return c.json({ ok: true });
});

async function findPolicy(db: ReturnType<typeof getDb>, id: string) {
  const [policy] = await db.select().from(policies).where(eq(policies.id, id)).limit(1);
  return policy ?? null;
}

async function findSection(db: ReturnType<typeof getDb>, id: string) {
  const [section] = await db
    .select()
    .from(policySections)
    .where(eq(policySections.id, id))
    .limit(1);
  if (!section) return null;
  const policy = await findPolicy(db, section.policyId);
  if (!policy) return null;
  return { section, policy };
}

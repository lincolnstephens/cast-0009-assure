import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import { getDb } from "../src/db";
import { auditLog, clientAccounts, policies, users } from "../src/db/schema";
import {
  prepareTestDatabase,
  resetTables,
  seedTestUsers,
  sessionCookieOf,
  type TestFixtures,
} from "./helpers";

let fixtures: TestFixtures;
let clientCookie: string;
let adminCookie: string;

beforeAll(async () => {
  await prepareTestDatabase();
});

beforeEach(async () => {
  await resetTables();
  fixtures = await seedTestUsers();
  clientCookie = sessionCookieOf(await login("ea@pemberton.example"));
  adminCookie = sessionCookieOf(await login("officer@mitmark.example"));
});

async function login(email: string) {
  return app.request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: "correct-horse" }),
  });
}

function req(cookie: string, method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { cookie, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

async function createDraftPolicy(): Promise<string> {
  const res = await app.request(
    "/api/admin/policies",
    req(adminCookie, "POST", {
      clientAccountId: fixtures.accountId,
      code: "DP-01",
      title: "Data Protection Policy",
      bodyMarkdown: "How we handle personal data.",
    }),
  );
  expect(res.status).toBe(201);
  const { id } = await res.json();
  const sec = await app.request(
    `/api/admin/policies/${id}/sections`,
    req(adminCookie, "POST", {
      sectionRef: "1",
      heading: "Purpose",
      bodyMarkdown: "This policy explains how we look after personal data.",
    }),
  );
  expect(sec.status).toBe(201);
  return id;
}

async function approve(id: string): Promise<Response> {
  return app.request(`/api/admin/policies/${id}/approve`, req(adminCookie, "POST", {}));
}

describe("policy lifecycle", () => {
  it("creates v1 as draft with an audit row", async () => {
    await createDraftPolicy();
    const db = getDb();
    const [policy] = await db.select().from(policies);
    expect(policy.version).toBe(1);
    expect(policy.status).toBe("draft");
    const audits = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.action, "policy.create"));
    expect(audits).toHaveLength(1);
  });

  it("approves a draft, recording approver and timestamp, with audit", async () => {
    const id = await createDraftPolicy();
    const res = await approve(id);
    expect(res.status).toBe(200);

    const db = getDb();
    const [policy] = await db.select().from(policies).where(eq(policies.id, id));
    expect(policy.status).toBe("approved");
    expect(policy.approvedBy).toBe(fixtures.adminUserId);
    expect(policy.approvedAt).not.toBeNull();

    const audits = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.action, "policy.approve"));
    expect(audits).toHaveLength(1);
  });

  it("approved versions are immutable: edits, section changes and deletes → 409", async () => {
    const id = await createDraftPolicy();
    await approve(id);

    expect(
      (await app.request(`/api/admin/policies/${id}`, req(adminCookie, "PUT", { title: "x" })))
        .status,
    ).toBe(409);
    expect(
      (
        await app.request(
          `/api/admin/policies/${id}/sections`,
          req(adminCookie, "POST", { sectionRef: "2", heading: "x", bodyMarkdown: "y" }),
        )
      ).status,
    ).toBe(409);
    expect(
      (await app.request(`/api/admin/policies/${id}`, req(adminCookie, "DELETE"))).status,
    ).toBe(409);
  });

  it("drafting from an approved policy snapshots it as version+1 with copied sections", async () => {
    const id = await createDraftPolicy();
    await approve(id);

    const res = await app.request(
      `/api/admin/policies/${id}/draft`,
      req(adminCookie, "POST", {}),
    );
    expect(res.status).toBe(201);
    const { id: draftId, version } = await res.json();
    expect(version).toBe(2);

    const detail = await (
      await app.request(`/api/admin/policies/${draftId}`, req(adminCookie, "GET"))
    ).json();
    expect(detail.status).toBe("draft");
    expect(detail.sections).toHaveLength(1);
    expect(detail.sections[0].heading).toBe("Purpose");
  });
});

describe("client visibility", () => {
  it("clients see nothing until a policy is approved", async () => {
    await createDraftPolicy();
    const res = await app.request("/api/policies", { headers: { cookie: clientCookie } });
    expect((await res.json()).policies).toHaveLength(0);
  });

  it("clients see only the latest approved version; new drafts stay invisible", async () => {
    const v1 = await createDraftPolicy();
    await approve(v1);

    // Draft v2 with an edit — client must keep seeing v1.
    const draftRes = await app.request(
      `/api/admin/policies/${v1}/draft`,
      req(adminCookie, "POST", {}),
    );
    const { id: v2 } = await draftRes.json();
    await app.request(
      `/api/admin/policies/${v2}`,
      req(adminCookie, "PUT", { title: "Data Protection Policy (revised)" }),
    );

    let list = (
      await (await app.request("/api/policies", { headers: { cookie: clientCookie } })).json()
    ).policies;
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(v1);
    expect(list[0].version).toBe(1);

    // Direct fetch of the draft id must 404 for the client.
    const direct = await app.request(`/api/policies/${v2}`, {
      headers: { cookie: clientCookie },
    });
    expect(direct.status).toBe(404);

    // After approving v2, the client sees v2 and v1 disappears from the pack.
    await approve(v2);
    list = (
      await (await app.request("/api/policies", { headers: { cookie: clientCookie } })).json()
    ).policies;
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(v2);
    expect(list[0].version).toBe(2);

    // v1 (superseded but approved) stays openable by id — chat citation
    // chips must resolve to the version that served the answer (Phase 4).
    const stale = await app.request(`/api/policies/${v1}`, {
      headers: { cookie: clientCookie },
    });
    expect(stale.status).toBe(200);
    expect((await stale.json()).version).toBe(1);
  });

  it("cross-tenant policy access returns 403", async () => {
    const id = await createDraftPolicy();
    await approve(id);

    const db = getDb();
    const [otherAccount] = await db
      .insert(clientAccounts)
      .values({ name: "Halloway Logistics Ltd" })
      .returning();
    await db.insert(users).values({
      email: "ops@halloway.example",
      passwordHash: await bcrypt.hash("correct-horse", 10),
      role: "client",
      displayName: "Other Tenant User",
      clientAccountId: otherAccount.id,
    });
    const otherCookie = sessionCookieOf(await login("ops@halloway.example"));

    const res = await app.request(`/api/policies/${id}`, {
      headers: { cookie: otherCookie },
    });
    expect(res.status).toBe(403);
  });

  it("admin policy routes reject client users", async () => {
    const res = await app.request(
      `/api/admin/policies?accountId=${fixtures.accountId}`,
      { headers: { cookie: clientCookie } },
    );
    expect(res.status).toBe(403);
  });
});

describe("draft editing", () => {
  it("edits draft sections and writes audit rows; duplicate codes rejected", async () => {
    const id = await createDraftPolicy();
    const detail = await (
      await app.request(`/api/admin/policies/${id}`, req(adminCookie, "GET"))
    ).json();
    const sectionId = detail.sections[0].id;

    const upd = await app.request(
      `/api/admin/sections/${sectionId}`,
      req(adminCookie, "PUT", {
        sectionRef: "1.1",
        heading: "Purpose and scope",
        bodyMarkdown: "Updated body.",
      }),
    );
    expect(upd.status).toBe(200);

    const db = getDb();
    const audits = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.action, "policy.section_update"));
    expect(audits).toHaveLength(1);

    const dup = await app.request(
      "/api/admin/policies",
      req(adminCookie, "POST", {
        clientAccountId: fixtures.accountId,
        code: "DP-01",
        title: "Duplicate",
      }),
    );
    expect(dup.status).toBe(409);
  });

  it("deletes a draft (sections included) with an audit row", async () => {
    const id = await createDraftPolicy();
    const res = await app.request(`/api/admin/policies/${id}`, req(adminCookie, "DELETE"));
    expect(res.status).toBe(200);

    const db = getDb();
    expect(await db.select().from(policies)).toHaveLength(0);
    const audits = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.action, "policy.delete_draft"));
    expect(audits).toHaveLength(1);
  });
});

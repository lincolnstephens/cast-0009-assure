import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { ensureOrg, mutateUsers, newId, readOrg } from "../src/db/store.ts";
import type { AppEnv } from "../src/lib/middleware.ts";
import { adminPolicyRoutes } from "../src/routes/adminPolicies.ts";
import { authRoutes } from "../src/routes/auth.ts";
import { policyRoutes } from "../src/routes/policies.ts";
import {
  freshStore,
  sessionCookieOf,
  TEST_ADMIN_EMAIL,
  TEST_CLIENT_EMAIL,
  TEST_PASSWORD,
  type TestFixtures,
} from "./helpers.ts";

/**
 * `createPolicySchema` (packages/shared/src/policies.ts) still validates
 * `clientAccountId` as `z.string().uuid()`, left over from Postgres UUID
 * primary keys. The store's organisation ids are plain strings (`ensureOrg`
 * takes any id - `test/helpers.ts` uses the slug "test-org", `adminRecord.ts`
 * defaults to "demo") - not necessarily UUIDs. `seedTestUsers()`'s "test-org"
 * therefore fails that schema on the one route in this suite that validates
 * against it (`POST /admin/policies`). This is a shared-schema/store
 * mismatch outside this lane's owned files (report: `createPolicySchema`
 * needs to accept any non-empty org id, not just a UUID) - worked around
 * here by seeding this suite's own fixtures with a UUID-shaped org id rather
 * than editing the shared schema or `test/helpers.ts`.
 */
async function seedFixtures(): Promise<TestFixtures> {
  const org = await ensureOrg(newId(), "Test Organisation");
  const hash = await bcrypt.hash(TEST_PASSWORD, 10);
  const { clientUserId, adminUserId } = await mutateUsers((doc) => {
    const clientUser = {
      id: newId(),
      orgId: org.id,
      email: TEST_CLIENT_EMAIL,
      passwordHash: hash,
      role: "client" as const,
      displayName: "Test Client User",
      createdAt: new Date().toISOString(),
    };
    const adminUser = {
      id: newId(),
      orgId: null,
      email: TEST_ADMIN_EMAIL,
      passwordHash: hash,
      role: "mitmark_admin" as const,
      displayName: "Test Admin User",
      createdAt: new Date().toISOString(),
    };
    doc.users.push(clientUser, adminUser);
    return { clientUserId: clientUser.id, adminUserId: adminUser.id };
  });
  return { accountId: org.id, clientUserId, adminUserId };
}

// A minimal app carrying only the routes this lane owns, so this suite never
// depends on whether another lane's route files have finished porting.
const app = new Hono<AppEnv>()
  .basePath("/api")
  .route("/auth", authRoutes)
  .route("/policies", policyRoutes)
  .route("/admin", adminPolicyRoutes);

let fixtures: TestFixtures;
let clientCookie: string;
let adminCookie: string;

beforeEach(async () => {
  freshStore();
  fixtures = await seedFixtures();
  clientCookie = sessionCookieOf(await login(TEST_CLIENT_EMAIL));
  adminCookie = sessionCookieOf(await login(TEST_ADMIN_EMAIL));
});

async function login(email: string) {
  return app.request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: TEST_PASSWORD }),
  });
}

function req(cookie: string, method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { cookie, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

/**
 * `PolicyRecord` (db/model.ts) has one `bodyMarkdown` field, not a separate
 * `policySections` table - there is no `POST .../sections` route any more
 * (see routes/adminPolicies.ts). A numbered section is written as a
 * `## <ref> <heading>` markdown heading inside that one field and parsed back
 * out on read (lib/policies.ts, `parsePolicyDocument`).
 */
async function createDraftPolicy(): Promise<string> {
  const res = await app.request(
    "/api/admin/policies",
    req(adminCookie, "POST", {
      clientAccountId: fixtures.accountId,
      code: "DP-01",
      title: "Data Protection Policy",
      bodyMarkdown:
        "How we handle personal data.\n\n## 1 Purpose\n\nThis policy explains how we look after personal data.",
    }),
  );
  expect(res.status).toBe(201);
  const { id } = await res.json();
  return id;
}

async function approve(id: string): Promise<Response> {
  return app.request(`/api/admin/policies/${id}/approve`, req(adminCookie, "POST", {}));
}

describe("policy lifecycle", () => {
  it("creates v1 as draft with an audit row", async () => {
    const id = await createDraftPolicy();
    const org = await readOrg(fixtures.accountId);
    const policy = org!.policies.find((p) => p.id === id)!;
    expect(policy.version).toBe(1);
    expect(policy.status).toBe("draft");
    expect(org!.audit.filter((a) => a.action === "policy.create")).toHaveLength(1);
  });

  it("approves a draft, recording approver and timestamp, with audit", async () => {
    const id = await createDraftPolicy();
    const res = await approve(id);
    expect(res.status).toBe(200);

    const org = await readOrg(fixtures.accountId);
    const policy = org!.policies.find((p) => p.id === id)!;
    expect(policy.status).toBe("approved");
    expect(policy.approvedBy).toBe(fixtures.adminUserId);
    expect(policy.approvedAt).not.toBeNull();

    expect(org!.audit.filter((a) => a.action === "policy.approve")).toHaveLength(1);
  });

  it("approving a policy version creates exactly one Record entry, module 4, reviewed by the approver", async () => {
    const id = await createDraftPolicy();
    await approve(id);

    const org = await readOrg(fixtures.accountId);
    const entries = org!.entries.filter((e) => e.source === "policy" && e.sourceRef === id);
    expect(entries).toHaveLength(1);
    const [entry] = entries;
    expect(entry.area).toBe(4);
    expect(entry.what).toContain("version 1");
    expect(entry.outcome).toBe("Approved version issued and recorded");
    expect(entry.hours).toBe(10);
    expect(entry.deadline).toBe("");
    expect(entry.reviewer).toBe("Test Admin User");
    expect(entry.ill).toBe(false);
    expect(entry.reviewed).toBe(true);
  });

  it("approved versions are immutable: edit, delete and re-approve all → 409", async () => {
    const id = await createDraftPolicy();
    await approve(id);

    expect(
      (await app.request(`/api/admin/policies/${id}`, req(adminCookie, "PUT", { title: "x" })))
        .status,
    ).toBe(409);
    expect(
      (await app.request(`/api/admin/policies/${id}`, req(adminCookie, "DELETE"))).status,
    ).toBe(409);
    expect(
      (await app.request(`/api/admin/policies/${id}/approve`, req(adminCookie, "POST", {})))
        .status,
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

    // Draft v2 with an edit - client must keep seeing v1.
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

    // v1 (superseded but approved) stays openable by id - chat citation
    // chips must resolve to the version that served the answer.
    const stale = await app.request(`/api/policies/${v1}`, {
      headers: { cookie: clientCookie },
    });
    expect(stale.status).toBe(200);
    expect((await stale.json()).version).toBe(1);
  });

  it("cross-tenant policy access returns 403", async () => {
    const id = await createDraftPolicy();
    await approve(id);

    const otherOrg = await ensureOrg("other-org", "Other Organisation");
    const hash = await bcrypt.hash(TEST_PASSWORD, 10);
    await mutateUsers((doc) => {
      doc.users.push({
        id: newId(),
        orgId: otherOrg.id,
        email: "other@test.example",
        passwordHash: hash,
        role: "client",
        displayName: "Other Tenant User",
        createdAt: new Date().toISOString(),
      });
    });
    const otherCookie = sessionCookieOf(await login("other@test.example"));

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
  it("edits a draft's document and writes an audit row; duplicate codes rejected", async () => {
    const id = await createDraftPolicy();

    const upd = await app.request(
      `/api/admin/policies/${id}`,
      req(adminCookie, "PUT", {
        bodyMarkdown:
          "Updated preamble.\n\n## 1 Purpose and scope\n\nUpdated body.",
      }),
    );
    expect(upd.status).toBe(200);

    const detail = await (
      await app.request(`/api/admin/policies/${id}`, req(adminCookie, "GET"))
    ).json();
    expect(detail.sections[0].heading).toBe("Purpose and scope");

    const org = await readOrg(fixtures.accountId);
    expect(org!.audit.filter((a) => a.action === "policy.update")).toHaveLength(1);

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

  it("deletes a draft with an audit row", async () => {
    const id = await createDraftPolicy();
    const res = await app.request(`/api/admin/policies/${id}`, req(adminCookie, "DELETE"));
    expect(res.status).toBe(200);

    const org = await readOrg(fixtures.accountId);
    expect(org!.policies).toHaveLength(0);
    expect(org!.audit.filter((a) => a.action === "policy.delete_draft")).toHaveLength(1);
  });
});

import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { seedPolicyPack } from "../scripts/policyPack.ts";
import { mutateOrg, newId, readOrg } from "../src/db/store.ts";
import type { AppEnv } from "../src/lib/middleware.ts";
import { adminEscalationRoutes } from "../src/routes/adminEscalations.ts";
import { authRoutes } from "../src/routes/auth.ts";
import { chatRoutes } from "../src/routes/chat.ts";
import { policyRoutes } from "../src/routes/policies.ts";
import {
  freshStore,
  seedTestUsers,
  sessionCookieOf,
  TEST_ADMIN_EMAIL,
  TEST_CLIENT_EMAIL,
  TEST_PASSWORD,
  type TestFixtures,
} from "./helpers.ts";

// A minimal app carrying only the routes this lane owns, so this suite never
// depends on whether another lane's route files have finished porting.
const app = new Hono<AppEnv>()
  .basePath("/api")
  .route("/auth", authRoutes)
  .route("/chat", chatRoutes)
  .route("/policies", policyRoutes)
  .route("/admin", adminEscalationRoutes);

let fixtures: TestFixtures;
let clientCookie: string;
let adminCookie: string;

beforeEach(async () => {
  // Stub mode is the test-mode contract; the suite must fail loudly if a key
  // leaks into the test environment.
  delete process.env.ANTHROPIC_API_KEY;
  freshStore();
  fixtures = await seedTestUsers();
  await mutateOrg(fixtures.accountId, (doc) => {
    seedPolicyPack(doc, fixtures.adminUserId);
  });
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

async function ask(body: string) {
  const res = await app.request("/api/chat/messages", {
    method: "POST",
    headers: { cookie: clientCookie, "content-type": "application/json" },
    body: JSON.stringify({ body }),
  });
  return res;
}

describe("Policy Guide chat (stub mode)", () => {
  it("demo question 1 → green with a DP-01 citation pinned to the approved version", async () => {
    const res = await ask("Can I share the tenant contact list with our letting agent?");
    expect(res.status).toBe(200);
    const { messages } = await res.json();
    const guide = messages[1];
    expect(guide.sender).toBe("guide");
    expect(guide.status).toBe("green");
    expect(guide.citations).toHaveLength(1);
    expect(guide.citations[0]).toMatchObject({
      policyCode: "DP-01",
      sectionRef: "5",
      policyVersion: 1,
    });

    // The cited policy id resolves for the client (side-panel route).
    const panel = await app.request(`/api/policies/${guide.citations[0].policyId}`, {
      headers: { cookie: clientCookie },
    });
    expect(panel.status).toBe(200);

    // State-changing chat route wrote an audit row (metadata only).
    const org = await readOrg(fixtures.accountId);
    const audits = org!.audit.filter((a) => a.action === "chat.message");
    expect(audits).toHaveLength(1);
    expect(audits[0].detail).not.toContain("tenant contact list");
  });

  it("demo question 2 → amber with escalation + pending review item", async () => {
    const res = await ask(
      "A tenant wants to put their own camera in the communal hallway - is that allowed?",
    );
    const { messages } = await res.json();
    const guide = messages[1];
    expect(guide.status).toBe("amber");
    expect(guide.body).toContain("judgement call");
    expect(guide.body).toContain("Test Admin User");
    expect(guide.citations).toHaveLength(0);

    const org = await readOrg(fixtures.accountId);
    expect(org!.escalations).toHaveLength(1);
    expect(org!.escalations[0].state).toBe("open");
    const items = org!.review.filter((r) => r.type === "chat_amber" && r.state === "pending");
    expect(items).toHaveLength(1);
  });

  it("demo question 3 → red, SAR intake + clock via the shared requests plumbing", async () => {
    const res = await ask("A former employee has emailed asking for everything we hold on them");
    const { messages } = await res.json();
    const guide = messages[1];
    expect(guide.status).toBe("red");
    expect(guide.body).toContain("formal data request");
    expect(guide.body).toContain("statutory process");

    const org = await readOrg(fixtures.accountId);
    expect(org!.intakes).toHaveLength(1);
    expect(org!.intakes[0].type).toBe("sar");
    expect(org!.intakes[0].source).toBe("chat");
    expect(org!.clocks).toHaveLength(1);
    expect(org!.clocks[0].kind).toBe("sar_1_month");
  });

  it("citation chips keep opening the cited version after a newer one is approved", async () => {
    const res = await ask("Can I share the tenant contact list with our letting agent?");
    const { messages } = await res.json();
    const citation = messages[1].citations[0];

    // Officer snapshots DP-01 to v2 and approves it directly on the store
    // (this suite does not mount the admin policy routes - another lane's).
    const v2Id = await mutateOrg(fixtures.accountId, (doc) => {
      const v1 = doc.policies.find((p) => p.id === citation.policyId)!;
      const v2 = {
        ...v1,
        id: newId(),
        version: 2,
        status: "approved" as const,
        approvedBy: fixtures.adminUserId,
        approvedAt: new Date().toISOString(),
      };
      doc.policies.push(v2);
      return v2.id;
    });

    const list = await (
      await app.request("/api/policies", { headers: { cookie: clientCookie } })
    ).json();
    expect(list.policies.find((p: { code: string }) => p.code === "DP-01").version).toBe(2);

    const pinned = await app.request(`/api/policies/${citation.policyId}`, {
      headers: { cookie: clientCookie },
    });
    expect(pinned.status).toBe(200);
    expect((await pinned.json()).version).toBe(1);

    const newVersion = await app.request(`/api/policies/${v2Id}`, {
      headers: { cookie: clientCookie },
    });
    expect((await newVersion.json()).version).toBe(2);
  });

  it("rate limits at 10 messages per minute per user", async () => {
    await mutateOrg(fixtures.accountId, (doc) => {
      const thread = { id: newId(), orgId: doc.id, userId: fixtures.clientUserId, title: "Policy questions", createdAt: new Date().toISOString() };
      doc.threads.push(thread);
      for (let i = 0; i < 10; i++) {
        doc.messages.push({
          id: newId(),
          threadId: thread.id,
          sender: "user",
          body: `q${i}`,
          citations: [],
          escalated: false,
          createdAt: new Date().toISOString(),
        });
      }
    });
    const res = await ask("One more question?");
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).not.toMatch(/error|stack|exception/i);
  });

  it("officer reply loop: answer posts into the thread, resolves the review item", async () => {
    await ask("A tenant wants to put their own camera in the communal hallway - is that allowed?");

    const listRes = await app.request(
      `/api/admin/escalations?accountId=${fixtures.accountId}`,
      { headers: { cookie: adminCookie } },
    );
    const { escalations: list } = await listRes.json();
    expect(list).toHaveLength(1);
    expect(list[0].state).toBe("open");
    expect(list[0].question).toContain("camera");

    const answerRes = await app.request(`/api/admin/escalations/${list[0].id}/answer`, {
      method: "POST",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      body: JSON.stringify({ reply: "Private cameras in communal areas are not permitted - I'll send the tenant letter template." }),
    });
    expect(answerRes.status).toBe(200);

    // Reply is visible in the client's thread as an officer message.
    const threadRes = await app.request("/api/chat/thread", {
      headers: { cookie: clientCookie },
    });
    const { messages } = await threadRes.json();
    const officerMsg = messages[messages.length - 1];
    expect(officerMsg.sender).toBe("officer");
    expect(officerMsg.body).toContain("not permitted");

    const org = await readOrg(fixtures.accountId);
    expect(org!.escalations[0].state).toBe("answered");
    expect(org!.escalations[0].answeredBy).toBe(fixtures.adminUserId);
    expect(org!.review[0].state).toBe("approved");
    expect(org!.audit.filter((a) => a.action === "escalation.answer")).toHaveLength(1);

    // The answer raised a Record entry (line 12), reviewed by the officer.
    const guideEntries = org!.entries.filter((e) => e.source === "guide");
    expect(guideEntries).toHaveLength(1);
    expect(guideEntries[0].line).toBe(12);
    expect(guideEntries[0].reviewer).toBe("Test Admin User");
    expect(guideEntries[0].reviewed).toBe(true);
    expect(guideEntries[0].ill).toBe(false);

    // Double answer → 409.
    const again = await app.request(`/api/admin/escalations/${list[0].id}/answer`, {
      method: "POST",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      body: JSON.stringify({ reply: "again" }),
    });
    expect(again.status).toBe(409);
  });

  it("empty approved corpus → amber fixed copy, no escalation", async () => {
    await mutateOrg(fixtures.accountId, (doc) => {
      doc.policies = [];
    });

    const res = await ask("Can I share the tenant contact list with our letting agent?");
    expect(res.status).toBe(200);
    const { messages } = await res.json();
    const guide = messages[1];
    expect(guide.status).toBe("amber");
    expect(guide.body).toContain("policy pack is being prepared");
    expect(guide.citations).toHaveLength(0);

    const org = await readOrg(fixtures.accountId);
    expect(org!.escalations).toHaveLength(0);
    expect(org!.review.filter((r) => r.type === "chat_amber")).toHaveLength(0);
  });

  it("chat routes reject admins and unauthenticated users", async () => {
    expect(
      (await app.request("/api/chat/thread", { headers: { cookie: adminCookie } })).status,
    ).toBe(403);
    expect((await app.request("/api/chat/thread")).status).toBe(401);
  });
});

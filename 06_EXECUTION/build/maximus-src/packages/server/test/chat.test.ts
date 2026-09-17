import { and, eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { policyPack } from "../scripts/policyPack";
import { app } from "../src/app";
import { getDb } from "../src/db";
import {
  auditLog,
  chatMessages,
  chatThreads,
  clocks,
  escalations,
  intakes,
  policies,
  policySections,
  reviewItems,
} from "../src/db/schema";
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
  // Stub mode is the test-mode contract; the suite must fail loudly if a key
  // leaks into the test environment.
  delete process.env.ANTHROPIC_API_KEY;
  await resetTables();
  fixtures = await seedTestUsers();
  await seedApprovedCorpus();
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

/** The real six-policy pack, approved, so the stub answers from real text. */
async function seedApprovedCorpus() {
  const db = getDb();
  for (const seedPolicy of policyPack) {
    const [policy] = await db
      .insert(policies)
      .values({
        clientAccountId: fixtures.accountId,
        code: seedPolicy.code,
        title: seedPolicy.title,
        bodyMarkdown: seedPolicy.bodyMarkdown,
        version: 1,
        status: "approved",
        approvedBy: fixtures.adminUserId,
        approvedAt: new Date(),
      })
      .returning();
    for (const section of seedPolicy.sections) {
      await db.insert(policySections).values({
        policyId: policy.id,
        sectionRef: section.sectionRef,
        heading: section.heading,
        bodyMarkdown: section.bodyMarkdown,
      });
    }
  }
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
    const db = getDb();
    const audits = await db.select().from(auditLog).where(eq(auditLog.action, "chat.message"));
    expect(audits).toHaveLength(1);
    expect(JSON.stringify(audits[0].detail)).not.toContain("tenant contact list");
  });

  it("demo question 2 → amber with escalation + pending review item", async () => {
    const res = await ask(
      "A tenant wants to put their own camera in the communal hallway — is that allowed?",
    );
    const { messages } = await res.json();
    const guide = messages[1];
    expect(guide.status).toBe("amber");
    expect(guide.body).toContain("judgement call");
    expect(guide.body).toContain("Marcus Holt");
    expect(guide.citations).toHaveLength(0);

    const db = getDb();
    const escs = await db.select().from(escalations);
    expect(escs).toHaveLength(1);
    expect(escs[0].state).toBe("open");
    const items = await db
      .select()
      .from(reviewItems)
      .where(and(eq(reviewItems.type, "chat_amber"), eq(reviewItems.state, "pending")));
    expect(items).toHaveLength(1);
  });

  it("demo question 3 → red, SAR intake + clock via the shared requests plumbing", async () => {
    const res = await ask("A former employee has emailed asking for everything we hold on them");
    const { messages } = await res.json();
    const guide = messages[1];
    expect(guide.status).toBe("red");
    expect(guide.body).toContain("formal data request");
    expect(guide.body).toContain("statutory process");

    const db = getDb();
    const [intake] = await db.select().from(intakes);
    expect(intake.type).toBe("sar");
    expect(intake.source).toBe("chat");
    const [clock] = await db.select().from(clocks);
    expect(clock.kind).toBe("sar_1_month");

    // The clock appears on the client's Clocks page immediately.
    const clocksRes = await app.request("/api/clocks", { headers: { cookie: clientCookie } });
    const { active } = await clocksRes.json();
    expect(active).toHaveLength(1);
    expect(active[0].kind).toBe("sar_1_month");
  });

  it("citation chips keep opening the cited version after a newer one is approved", async () => {
    const res = await ask("Can I share the tenant contact list with our letting agent?");
    const { messages } = await res.json();
    const citation = messages[1].citations[0];

    // Officer snapshots DP-01 to v2 and approves it.
    const draftRes = await app.request(`/api/admin/policies/${citation.policyId}/draft`, {
      method: "POST",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const { id: v2 } = await draftRes.json();
    await app.request(`/api/admin/policies/${v2}/approve`, {
      method: "POST",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    // The pack lists v2, but the stored citation still opens v1.
    const list = await (
      await app.request("/api/policies", { headers: { cookie: clientCookie } })
    ).json();
    expect(list.policies.find((p: { code: string }) => p.code === "DP-01").version).toBe(2);

    const pinned = await app.request(`/api/policies/${citation.policyId}`, {
      headers: { cookie: clientCookie },
    });
    expect(pinned.status).toBe(200);
    expect((await pinned.json()).version).toBe(1);
  });

  it("rate limits at 10 messages per minute per user", async () => {
    const db = getDb();
    const [thread] = await db
      .insert(chatThreads)
      .values({ userId: fixtures.clientUserId, clientAccountId: fixtures.accountId })
      .returning();
    for (let i = 0; i < 10; i++) {
      await db.insert(chatMessages).values({
        threadId: thread.id,
        sender: "client",
        body: `q${i}`,
      });
    }
    const res = await ask("One more question?");
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).not.toMatch(/error|stack|exception/i);
  });

  it("officer reply loop: answer posts into the thread, resolves the review item", async () => {
    await ask("A tenant wants to put their own camera in the communal hallway — is that allowed?");

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
      body: JSON.stringify({ reply: "Private cameras in communal areas are not permitted — I'll send the tenant letter template." }),
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

    const db = getDb();
    const [esc] = await db.select().from(escalations);
    expect(esc.state).toBe("answered");
    expect(esc.officerId).toBe(fixtures.adminUserId);
    const items = await db.select().from(reviewItems);
    expect(items[0].state).toBe("approved");
    const audits = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.action, "escalation.answer"));
    expect(audits).toHaveLength(1);

    // Double answer → 409.
    const again = await app.request(`/api/admin/escalations/${list[0].id}/answer`, {
      method: "POST",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      body: JSON.stringify({ reply: "again" }),
    });
    expect(again.status).toBe(409);
  });

  it("empty approved corpus → amber fixed copy, no escalation", async () => {
    const db = getDb();
    await db.delete(policySections);
    await db.delete(policies);

    const res = await ask("Can I share the tenant contact list with our letting agent?");
    expect(res.status).toBe(200);
    const { messages } = await res.json();
    const guide = messages[1];
    expect(guide.status).toBe("amber");
    expect(guide.body).toContain("policy pack is being prepared");
    expect(guide.citations).toHaveLength(0);

    const escs = await db.select().from(escalations);
    expect(escs).toHaveLength(0);
    const items = await db.select().from(reviewItems);
    expect(items.filter((i) => i.type === "chat_amber")).toHaveLength(0);
  });

  it("chat routes reject admins and unauthenticated users", async () => {
    expect(
      (await app.request("/api/chat/thread", { headers: { cookie: adminCookie } })).status,
    ).toBe(403);
    expect((await app.request("/api/chat/thread")).status).toBe(401);
  });
});

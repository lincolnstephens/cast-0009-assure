import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { policyPack } from "../scripts/policyPack";
import { app } from "../src/app";
import { getDb } from "../src/db";
import {
  auditLog,
  chatMessages,
  chatThreads,
  clientAccounts,
  escalations,
  exports as exportsTable,
  policies,
  policySections,
  reviewItems,
} from "../src/db/schema";
import { createIntakeWithClock } from "../src/lib/intakes";
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
  await seedApprovedPolicy();
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

async function seedApprovedPolicy() {
  const db = getDb();
  const seedPolicy = policyPack[0];
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

describe("value snapshot", () => {
  it("returns live counters — zeros render as zero", async () => {
    const res = await app.request("/api/value", { headers: { cookie: clientCookie } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.counters.questionsAnswered).toBe(0);
    expect(body.counters.sarsInsideStatute).toBe(0);
    expect(body.counters.sarsTotal).toBe(0);
    expect(body.monthlyQuestions).toEqual([]);
  });

  it("SAR inside-statute counter reads the explicit close flag", async () => {
    const db = getDb();
    const { clock } = await createIntakeWithClock(db, {
      clientAccountId: fixtures.accountId,
      type: "sar",
      source: "manual",
      summary: "Quarter SAR",
      actorId: fixtures.adminUserId,
    });

    const close = await app.request(`/api/admin/clocks/${clock.id}/close`, {
      method: "POST",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      body: JSON.stringify({ outcome: "Responded within statute.", insideStatute: true }),
    });
    expect(close.status).toBe(200);

    const res = await app.request("/api/value", { headers: { cookie: clientCookie } });
    const body = await res.json();
    expect(body.counters.sarsTotal).toBe(1);
    expect(body.counters.sarsInsideStatute).toBe(1);
  });

  it("rejects admin and unauthenticated callers", async () => {
    expect((await app.request("/api/value", { headers: { cookie: adminCookie } })).status).toBe(
      403,
    );
    expect((await app.request("/api/value")).status).toBe(401);
  });
});

describe("defence-file export lifecycle", () => {
  it("request → review item → approve → downloadable zip in Postgres", async () => {
    const req = await app.request("/api/exports", {
      method: "POST",
      headers: { cookie: clientCookie, "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(req.status).toBe(201);
    const { id: exportId } = await req.json();

    const queue = await app.request(
      `/api/admin/review?accountId=${fixtures.accountId}&type=export_request`,
      { headers: { cookie: adminCookie } },
    );
    const { items } = await queue.json();
    expect(items).toHaveLength(1);

    const approve = await app.request(`/api/admin/review/${items[0].id}/approve`, {
      method: "POST",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(approve.status).toBe(200);

    const db = getDb();
    const [row] = await db.select().from(exportsTable).where(eq(exportsTable.id, exportId));
    expect(row.state).toBe("generated");
    expect(row.fileData).toBeTruthy();
    expect((row.fileData as Buffer).length).toBeGreaterThan(100);

    const clientDl = await app.request(`/api/exports/${exportId}/download`, {
      headers: { cookie: clientCookie },
    });
    expect(clientDl.status).toBe(200);
    expect(clientDl.headers.get("content-type")).toBe("application/zip");

    const adminDl = await app.request(`/api/exports/${exportId}/download`, {
      headers: { cookie: adminCookie },
    });
    expect(adminDl.status).toBe(200);

    const cleared = await app.request(`/api/admin/review?accountId=${fixtures.accountId}`, {
      headers: { cookie: adminCookie },
    });
    const clearedBody = await cleared.json();
    expect(clearedBody.items.filter((i: { type: string }) => i.type === "export_request")).toHaveLength(
      0,
    );
  });

  it("cross-tenant download returns 403", async () => {
    const db = getDb();
    const [otherAccount] = await db
      .insert(clientAccounts)
      .values({ name: "Other Ltd" })
      .returning();
    const [otherExport] = await db
      .insert(exportsTable)
      .values({
        clientAccountId: otherAccount.id,
        requestedBy: fixtures.clientUserId,
        state: "generated",
        fileData: Buffer.from("PK\x03\x04"),
        generatedAt: new Date(),
      })
      .returning();

    const denied = await app.request(`/api/exports/${otherExport.id}/download`, {
      headers: { cookie: clientCookie },
    });
    expect(denied.status).toBe(403);
  });

  it("client cannot list another tenant's exports via download", async () => {
    expect((await app.request("/api/exports", { headers: { cookie: adminCookie } })).status).toBe(
      403,
    );
  });
});

describe("unified review queue", () => {
  it("lists pending items oldest first with type filter", async () => {
    const db = getDb();
    await createIntakeWithClock(db, {
      clientAccountId: fixtures.accountId,
      type: "sar",
      source: "manual",
      summary: "First intake",
      actorId: fixtures.adminUserId,
    });
    await app.request("/api/exports", {
      method: "POST",
      headers: { cookie: clientCookie, "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    const all = await app.request(`/api/admin/review?accountId=${fixtures.accountId}`, {
      headers: { cookie: adminCookie },
    });
    const allBody = await all.json();
    expect(allBody.items.length).toBeGreaterThanOrEqual(2);
    const times = allBody.items.map((i: { createdAt: string }) => new Date(i.createdAt).getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));

    const exportsOnly = await app.request(
      `/api/admin/review?accountId=${fixtures.accountId}&type=export_request`,
      { headers: { cookie: adminCookie } },
    );
    const exportsBody = await exportsOnly.json();
    expect(exportsBody.items.every((i: { type: string }) => i.type === "export_request")).toBe(true);
  });

  it("answering amber escalation clears pending in the same cycle", async () => {
    const db = getDb();
    const [thread] = await db
      .insert(chatThreads)
      .values({ clientAccountId: fixtures.accountId, userId: fixtures.clientUserId })
      .returning();
    const [msg] = await db
      .insert(chatMessages)
      .values({ threadId: thread.id, sender: "guide", body: "Unclear.", status: "amber" })
      .returning();
    const [esc] = await db
      .insert(escalations)
      .values({ threadId: thread.id, messageId: msg.id, state: "open" })
      .returning();
    await db.insert(reviewItems).values({
      clientAccountId: fixtures.accountId,
      type: "chat_amber",
      refId: esc.id,
      state: "pending",
    });

    const list = await app.request(`/api/admin/review?accountId=${fixtures.accountId}`, {
      headers: { cookie: adminCookie },
    });
    const { items } = await list.json();
    const item = items.find((i: { type: string }) => i.type === "chat_amber");
    expect(item).toBeTruthy();

    const answer = await app.request(`/api/admin/review/${item.id}/answer`, {
      method: "POST",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      body: JSON.stringify({ reply: "Officer guidance here." }),
    });
    expect(answer.status).toBe(200);

    const after = await app.request(`/api/admin/review?accountId=${fixtures.accountId}`, {
      headers: { cookie: adminCookie },
    });
    const afterBody = await after.json();
    expect(afterBody.items.some((i: { id: string }) => i.id === item.id)).toBe(false);

    const [resolved] = await db
      .select()
      .from(reviewItems)
      .where(and(eq(reviewItems.id, item.id), eq(reviewItems.state, "approved")));
    expect(resolved.officerId).toBe(fixtures.adminUserId);
  });

  it("reject deletes the exports row but persists review_item decision and audit with officer as actor", async () => {
    const req = await app.request("/api/exports", {
      method: "POST",
      headers: { cookie: clientCookie, "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const { id: exportId } = await req.json();
    const list = await app.request(
      `/api/admin/review?accountId=${fixtures.accountId}&type=export_request`,
      { headers: { cookie: adminCookie } },
    );
    const { items } = await list.json();
    const reviewItemId = items[0].id;

    const reject = await app.request(`/api/admin/review/${reviewItemId}/reject`, {
      method: "POST",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      body: JSON.stringify({ note: "Not yet." }),
    });
    expect(reject.status).toBe(200);

    const db = getDb();
    const exportRows = await db.select().from(exportsTable).where(eq(exportsTable.id, exportId));
    expect(exportRows).toHaveLength(0);

    const [item] = await db.select().from(reviewItems).where(eq(reviewItems.id, reviewItemId));
    expect(item.state).toBe("rejected");
    expect(item.officerId).toBe(fixtures.adminUserId);
    expect(item.decidedAt).toBeTruthy();

    const audits = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.action, "review.reject"));
    expect(audits).toHaveLength(1);
    expect(audits[0].actorId).toBe(fixtures.adminUserId);
    expect(audits[0].entityId).toBe(reviewItemId);
  });
});

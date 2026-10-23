import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { seedPolicyPack } from "../scripts/policyPack.ts";
import { ensureOrg, mutateOrg, newId, readExportBlob, readOrg } from "../src/db/store.ts";
import { createIntakeWithClock } from "../src/lib/intakes.ts";
import type { AppEnv } from "../src/lib/middleware.ts";
import { adminExportRoutes } from "../src/routes/adminExports.ts";
import { adminReviewRoutes } from "../src/routes/adminReview.ts";
import { authRoutes } from "../src/routes/auth.ts";
import { exportRoutes } from "../src/routes/exports.ts";
import {
  freshStore,
  seedTestUsers,
  sessionCookieOf,
  TEST_ADMIN_EMAIL,
  TEST_CLIENT_EMAIL,
  TEST_PASSWORD,
  type TestFixtures,
} from "./helpers.ts";

// A minimal app carrying only the routes this lane owns (plus auth, to sign
// in), so this suite never depends on whether another lane's route files
// have finished porting.
const app = new Hono<AppEnv>()
  .basePath("/api")
  .route("/auth", authRoutes)
  .route("/exports", exportRoutes)
  .route("/admin", adminExportRoutes)
  .route("/admin", adminReviewRoutes);

let fixtures: TestFixtures;
let clientCookie: string;
let adminCookie: string;

beforeEach(async () => {
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

describe("defence-file export lifecycle", () => {
  it("request → review item → approve → downloadable zip, with a Record entry", async () => {
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

    const org = await readOrg(fixtures.accountId);
    const row = org!.exports.find((e) => e.id === exportId)!;
    expect(row.state).toBe("generated");
    expect(row.blobKey).toBeTruthy();

    const bytes = await readExportBlob(exportId);
    expect(bytes).toBeTruthy();
    expect(bytes!.length).toBeGreaterThan(100);

    // Completing the export raised a Record entry (line 11), reviewed by the
    // approving admin, and the export remembers which entry it created.
    expect(row.entryId).toBeTruthy();
    const entry = org!.entries.find((e) => e.id === row.entryId)!;
    expect(entry).toBeTruthy();
    expect(entry.source).toBe("export");
    expect(entry.sourceRef).toBe(exportId);
    expect(entry.area).toBe(4); // v1.7: the policy pack, module 4
    expect(entry.what).toContain("defence file");
    expect(entry.outcome).toBe("Defence file generated and released");
    expect(entry.hours).toBe(12);
    expect(entry.deadline).toBe("Board or audit date");
    expect(entry.reviewer).toBe("Test Admin User");
    expect(entry.ill).toBe(false);
    expect(entry.reviewed).toBe(true);

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
    expect(
      clearedBody.items.filter((i: { type: string }) => i.type === "export_request"),
    ).toHaveLength(0);
  });

  it("cross-tenant download returns 403", async () => {
    const otherOrg = await ensureOrg("other-org", "Other Organisation");
    const otherExport = await mutateOrg(otherOrg.id, (doc) => {
      const row = {
        id: newId(),
        orgId: otherOrg.id,
        requestedBy: fixtures.clientUserId,
        requestedByName: "Someone else",
        state: "generated" as const,
        approvedBy: null,
        approvedAt: null,
        generatedAt: new Date().toISOString(),
        contents: [],
        blobKey: "exports/x.zip",
        entryId: null,
      };
      doc.exports.push(row);
      return row;
    });

    const denied = await app.request(`/api/exports/${otherExport.id}/download`, {
      headers: { cookie: clientCookie },
    });
    expect(denied.status).toBe(403);
  });

  it("client cannot list another tenant's exports via the admin route", async () => {
    expect(
      (await app.request("/api/exports", { headers: { cookie: adminCookie } })).status,
    ).toBe(403);
  });
});

describe("unified review queue", () => {
  it("lists pending items oldest first with type filter", async () => {
    await mutateOrg(fixtures.accountId, (doc) => {
      createIntakeWithClock(doc, {
        type: "sar",
        source: "manual",
        summary: "First intake",
        raisedBy: fixtures.adminUserId,
      });
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

  it("answering an amber escalation clears it from the queue and raises a Record entry", async () => {
    const escalationId = await mutateOrg(fixtures.accountId, (doc) => {
      const thread = {
        id: newId(),
        orgId: doc.id,
        userId: fixtures.clientUserId,
        title: "Policy questions",
        createdAt: new Date().toISOString(),
      };
      doc.threads.push(thread);
      const escalation = {
        id: newId(),
        orgId: doc.id,
        threadId: thread.id,
        question: "Unclear question.",
        state: "open" as const,
        answer: null,
        answeredBy: null,
        answeredAt: null,
        createdAt: new Date().toISOString(),
      };
      doc.escalations.push(escalation);
      doc.review.push({
        id: newId(),
        orgId: doc.id,
        type: "chat_amber",
        refId: escalation.id,
        summary: "Amber policy question.",
        state: "pending",
        decidedBy: null,
        decidedAt: null,
        createdAt: new Date().toISOString(),
      });
      return escalation.id;
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

    const org = await readOrg(fixtures.accountId);
    const resolved = org!.review.find((r) => r.id === item.id)!;
    expect(resolved.state).toBe("approved");
    expect(resolved.decidedBy).toBe(fixtures.adminUserId);

    const guideEntries = org!.entries.filter((e) => e.source === "guide" && e.sourceRef === escalationId);
    expect(guideEntries).toHaveLength(1);
    expect(guideEntries[0].area).toBe(1);
    expect(guideEntries[0].outcome).toBe("Officer guidance here.");
    expect(guideEntries[0].reviewer).toBe("Test Admin User");
  });

  it("reject deletes the export but keeps the review decision and an audit row with the officer as actor", async () => {
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

    const org = await readOrg(fixtures.accountId);
    expect(org!.exports.find((e) => e.id === exportId)).toBeUndefined();

    const item = org!.review.find((r) => r.id === reviewItemId)!;
    expect(item.state).toBe("rejected");
    expect(item.decidedBy).toBe(fixtures.adminUserId);
    expect(item.decidedAt).toBeTruthy();

    const audits = org!.audit.filter((a) => a.action === "review.reject");
    expect(audits).toHaveLength(1);
    expect(audits[0].actorId).toBe(fixtures.adminUserId);
  });
});

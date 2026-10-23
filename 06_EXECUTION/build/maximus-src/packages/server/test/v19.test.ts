import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { mutateOrg, readOrg } from "../src/db/store.ts";
import type { AppEnv } from "../src/lib/middleware.ts";
import { adminReviewRoutes } from "../src/routes/adminReview.ts";
import { adminUserRoutes } from "../src/routes/adminUsers.ts";
import { authRoutes } from "../src/routes/auth.ts";
import { clockRoutes, requestRoutes } from "../src/routes/clocks.ts";
import { trackerRoutes } from "../src/routes/tracker.ts";
import {
  freshStore,
  seedTestUsers,
  sessionCookieOf,
  TEST_ADMIN_EMAIL,
  TEST_CLIENT_EMAIL,
  TEST_PASSWORD,
  type TestFixtures,
} from "./helpers.ts";

// v1.9 (FRAGO 09): decision notes on Approve and Reject (3.1), and the
// client's Category on an upload with the module set by MITMARK (3.2).
const app = new Hono<AppEnv>()
  .basePath("/api")
  .route("/auth", authRoutes)
  .route("/clocks", clockRoutes)
  .route("/requests", requestRoutes)
  .route("/tracker", trackerRoutes)
  .route("/admin", adminReviewRoutes)
  .route("/admin", adminUserRoutes);

let fx: TestFixtures;
let client: string;
let admin: string;

const NOTE = "We have started the search; expect the response letter by Friday.";

async function signIn(email: string, password = TEST_PASSWORD): Promise<string> {
  const res = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return sessionCookieOf(res);
}

function call(path: string, cookie: string, init: RequestInit & { json?: unknown } = {}) {
  const headers: Record<string, string> = { cookie, ...(init.headers as Record<string, string>) };
  let body = init.body;
  if (init.json !== undefined) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(init.json);
  }
  return app.request(path, { ...init, headers, body });
}

async function pendingItems(type: string) {
  const res = await call(`/api/admin/review?accountId=${fx.accountId}&type=${type}`, admin);
  return ((await res.json()) as { items: any[] }).items;
}

async function raiseRequest(cookie: string): Promise<string> {
  const res = await call("/api/requests", cookie, {
    method: "POST",
    json: { type: "data_request", details: "A former employee wants a copy of their file." },
  });
  expect(res.status).toBe(201);
  return ((await res.json()) as { clockId: string }).clockId;
}

async function testSeat(): Promise<string> {
  const res = await call("/api/admin/users", admin, {
    method: "POST",
    json: { email: "seat@test.example", role: "client", orgId: fx.accountId, testSeat: true },
  });
  expect(res.status).toBe(201);
  const { oneTimePassword } = (await res.json()) as any;
  const cookie = await signIn("seat@test.example", oneTimePassword);
  await call("/api/auth/password", cookie, {
    method: "POST",
    json: { currentPassword: oneTimePassword, newPassword: "a-long-new-password-1" },
  });
  return signIn("seat@test.example", "a-long-new-password-1");
}

async function clientTask(id = "t-client") {
  await mutateOrg(fx.accountId, (doc) => {
    doc.tasks.push({
      id, orgId: fx.accountId, area: 2, phase: 3, title: "Confirm the RoPA owners", how: "", howLink: null,
      ownerType: "client", ownerRole: "Information Officer", dueAt: "2026-12-01", recurrence: "once",
      status: "in_progress", progress: 0, evidence: [], notes: "", source: "manual", recordEntryId: null,
      closedAt: null, clientConfirmedAt: null, clientConfirmedBy: null, createdBy: "x", updatedBy: "x",
      updatedAt: "2026-10-01T00:00:00Z",
    });
  });
}

function allJobTasks(jobs: any): any[] {
  return jobs.groups.flatMap((g: any) => g.tasks);
}

beforeEach(async () => {
  freshStore();
  fx = await seedTestUsers();
  client = await signIn(TEST_CLIENT_EMAIL);
  admin = await signIn(TEST_ADMIN_EMAIL);
});

describe("decision notes (FRAGO 09 3.1)", () => {
  it("a note on approving a data request is stored on the item and the clock and reaches the client; the audit says so without the text", async () => {
    const clockId = await raiseRequest(client);
    const [item] = await pendingItems("intake");
    const res = await call(`/api/admin/review/${item.id}/approve`, admin, { method: "POST", json: { note: NOTE } });
    expect(res.status).toBe(200);

    const org = (await readOrg(fx.accountId))!;
    expect(org.review.find((r) => r.id === item.id)?.decisionNote).toBe(NOTE);
    const clock = org.clocks.find((c) => c.id === clockId)!;
    expect(clock.decisionNote).toBe(NOTE);
    expect(clock.decisionNoteAt).toBeTruthy();

    const list = (await (await call("/api/clocks", client)).json()) as any;
    expect(list.active.find((c: any) => c.id === clockId).decisionNote).toMatchObject({ text: NOTE });
    const detail = (await (await call(`/api/clocks/${clockId}`, client)).json()) as any;
    expect(detail.decisionNote.text).toBe(NOTE);

    const audit = org.audit.filter((a) => a.action === "review.approve");
    expect(audit.at(-1)?.detail).toContain("with a note to the client");
    expect(JSON.stringify(org.audit)).not.toContain(NOTE);
  });

  it("a note on rejecting a concern is stored and shown; the audit carries no note text", async () => {
    const res = await call("/api/requests", client, { method: "POST", json: { type: "concern", details: "A laptop was left on a train." } });
    const { clockId } = (await res.json()) as any;
    const [item] = await pendingItems("intake");
    await call(`/api/admin/review/${item.id}/reject`, admin, { method: "POST", json: { note: "Not a personal data breach: the laptop is encrypted." } });
    const org = (await readOrg(fx.accountId))!;
    expect(org.clocks.find((c) => c.id === clockId)?.decisionNote).toBe("Not a personal data breach: the laptop is encrypted.");
    const reject = org.audit.filter((a) => a.action === "review.reject").at(-1)!;
    expect(reject.detail).toBe("type=intake with a note to the client");
  });

  it("no note, nothing stored and nothing shown", async () => {
    const clockId = await raiseRequest(client);
    const [item] = await pendingItems("intake");
    await call(`/api/admin/review/${item.id}/approve`, admin, { method: "POST", json: {} });
    const org = (await readOrg(fx.accountId))!;
    expect(org.review.find((r) => r.id === item.id)?.decisionNote).toBeUndefined();
    expect(org.clocks.find((c) => c.id === clockId)?.decisionNote).toBeUndefined();
    const list = (await (await call("/api/clocks", client)).json()) as any;
    expect(list.active.find((c: any) => c.id === clockId).decisionNote).toBeNull();
    expect(org.audit.filter((a) => a.action === "review.approve").at(-1)?.detail).toBe("type=intake");
  });

  it("a note longer than 300 characters is refused", async () => {
    await raiseRequest(client);
    const [item] = await pendingItems("intake");
    const res = await call(`/api/admin/review/${item.id}/approve`, admin, { method: "POST", json: { note: "x".repeat(301) } });
    expect(res.status).toBe(400);
  });

  it("a note on accepting or reopening a task confirmation reaches the client's Job management card", async () => {
    await clientTask();
    expect((await call("/api/tracker/tasks/t-client/confirm", client, { method: "POST", json: {} })).status).toBe(200);
    let [item] = await pendingItems("task_confirmation");
    await call(`/api/admin/review/${item.id}/reject`, admin, { method: "POST", json: { note: "Please attach the owner list first." } });
    let jobs = (await (await call("/api/tracker/jobs", client)).json()) as any;
    let task = allJobTasks(jobs).find((t: any) => t.id === "t-client");
    expect(task.mitmarkNote).toMatchObject({ text: "Please attach the owner list first." });

    await call("/api/tracker/tasks/t-client/confirm", client, { method: "POST", json: {} });
    [item] = await pendingItems("task_confirmation");
    await call(`/api/admin/review/${item.id}/approve`, admin, { method: "POST", json: { note: "Thank you, filed." } });
    jobs = (await (await call("/api/tracker/jobs", client)).json()) as any;
    task = allJobTasks(jobs).find((t: any) => t.id === "t-client");
    expect(task.status).toBe("done");
    expect(task.mitmarkNote.text).toBe("Thank you, filed.");
    const org = (await readOrg(fx.accountId))!;
    expect(JSON.stringify(org.audit)).not.toContain("Thank you, filed.");
    expect(org.audit.filter((a) => a.action === "review.task_confirmation.accept").at(-1)?.detail).toContain("with a note to the client");
  });

  it("a test seat's note stays on its test item and never reaches the real task or the client", async () => {
    await clientTask();
    const seat = await testSeat();
    await call("/api/tracker/tasks/t-client/confirm", seat, { method: "POST", json: {} });
    const [item] = await pendingItems("task_confirmation");
    expect(item.test).toBe(true);
    await call(`/api/admin/review/${item.id}/approve`, admin, { method: "POST", json: { note: "Test note." } });
    const org = (await readOrg(fx.accountId))!;
    expect(org.review.find((r) => r.id === item.id)?.decisionNote).toBe("Test note.");
    const t = org.tasks.find((x) => x.id === "t-client")!;
    expect(t.confirmationNote).toBeUndefined();
    expect(t.status).toBe("in_progress");
    const jobs = (await (await call("/api/tracker/jobs", client)).json()) as any;
    expect(allJobTasks(jobs).find((x: any) => x.id === "t-client").mitmarkNote).toBeNull();

    // A test seat's request: its note sits on its own test clock, which no client sees.
    const clockId = await raiseRequest(seat);
    const [intake] = await pendingItems("intake");
    await call(`/api/admin/review/${intake.id}/approve`, admin, { method: "POST", json: { note: "Test request note." } });
    const theirs = (await (await call("/api/clocks", client)).json()) as any;
    expect(theirs.active.map((c: any) => c.id)).not.toContain(clockId);
    expect(JSON.stringify(theirs)).not.toContain("Test request note.");
  });
});

describe("Category on the client upload (FRAGO 09 3.2)", () => {
  const upload = (over: Record<string, unknown> = {}) =>
    call("/api/tracker/documents", client, {
      method: "POST",
      json: {
        title: "Visitor log",
        category: "tracker",
        note: "The visitor book, scanned.",
        kind: "link",
        url: "https://example.org/visitors",
        ...over,
      },
    });

  it("stores the category, leaves the module unset, and the queue shows the category", async () => {
    const res = await upload();
    expect(res.status).toBe(201);
    const { id } = (await res.json()) as { id: string };
    const org = (await readOrg(fx.accountId))!;
    const d = org.documents.find((x) => x.id === id)!;
    expect(d.category).toBe("tracker");
    expect(d.area).toBeNull();
    expect(d.published).toBe(false);
    const [item] = await pendingItems("document_submission");
    expect(item.context.category).toBe("tracker");
    expect(item.context.area).toBeNull();
  });

  it("refuses a client body that sets the module or the section", async () => {
    for (const extra of [{ area: 3 }, { section: "policies" }]) {
      const res = await upload(extra);
      expect(res.status).toBe(400);
      expect(((await res.json()) as any).error).toBe("The module is set by MITMARK when the document is accepted.");
    }
    expect((await upload({ category: "module" })).status).toBe(400);
    expect((await upload({ category: undefined })).status).toBe(400);
    expect((await readOrg(fx.accountId))!.documents.filter((d) => d.submission)).toHaveLength(0);
  });

  it("accept refuses to publish without a module, then publishes onto that module page", async () => {
    await upload();
    const [item] = await pendingItems("document_submission");
    const docId = item.context.documentId;
    const refused = await call(`/api/admin/review/${item.id}/accept-document`, admin, { method: "POST", json: { section: "trackers" } });
    expect(refused.status).toBe(400);
    expect(((await refused.json()) as any).error).toBe("Choose the module before publishing.");
    let org = (await readOrg(fx.accountId))!;
    expect(org.documents.find((d) => d.id === docId)?.published).toBe(false);

    const ok = await call(`/api/admin/review/${item.id}/accept-document`, admin, { method: "POST", json: { section: "trackers", area: 5 } });
    expect(ok.status).toBe(200);
    org = (await readOrg(fx.accountId))!;
    const d = org.documents.find((x) => x.id === docId)!;
    expect(d).toMatchObject({ published: true, area: 5, section: "trackers", category: "tracker" });
    const page = (await (await call("/api/tracker/areas/5", client)).json()) as any;
    expect(page.documents.map((x: any) => x.id)).toContain(docId);
  });
});

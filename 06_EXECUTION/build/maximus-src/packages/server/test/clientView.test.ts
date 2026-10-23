import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { mutateOrg, readOrg } from "../src/db/store.ts";
import type { TaskRecord } from "../src/db/model.ts";
import type { AppEnv } from "../src/lib/middleware.ts";
import { adminRecordRoutes } from "../src/routes/adminRecord.ts";
import { authRoutes } from "../src/routes/auth.ts";
import { chatRoutes } from "../src/routes/chat.ts";
import { trackerRoutes } from "../src/routes/tracker.ts";
import { valueRoutes } from "../src/routes/value.ts";
import {
  freshStore,
  seedTestUsers,
  sessionCookieOf,
  TEST_ADMIN_EMAIL,
  TEST_CLIENT_EMAIL,
  TEST_PASSWORD,
  type TestFixtures,
} from "./helpers.ts";

// v1.4 (FRAGO 04 3.2): the operator reads the client seat, and only reads.
const app = new Hono<AppEnv>()
  .basePath("/api")
  .route("/auth", authRoutes)
  .route("/chat", chatRoutes)
  .route("/tracker", trackerRoutes)
  .route("/value", valueRoutes)
  .route("/admin", adminRecordRoutes);

let fixtures: TestFixtures;
let clientCookie: string;
let adminCookie: string;

async function signIn(email: string): Promise<string> {
  return sessionCookieOf(
    await app.request("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: TEST_PASSWORD }),
    }),
  );
}

beforeEach(async () => {
  freshStore();
  fixtures = await seedTestUsers();
  clientCookie = await signIn(TEST_CLIENT_EMAIL);
  adminCookie = await signIn(TEST_ADMIN_EMAIL);
  await mutateOrg(fixtures.accountId, (doc) => {
    doc.tasks.push(clientTask());
  });
});

const TASK_ID = "t-client-1";

function clientTask(): TaskRecord {
  return {
    id: TASK_ID,
    orgId: fixtures.accountId,
    area: 6,
    phase: 3,
    title: "Send the staff list",
    how: "HR sends the list to MITMARK",
    howLink: null,
    ownerType: "client",
    ownerRole: "HR",
    dueAt: "2026-12-01",
    recurrence: "once",
    status: "not_started",
    progress: 0,
    evidence: [],
    notes: "",
    source: "manual",
    recordEntryId: null,
    closedAt: null,
    clientConfirmedAt: null,
    clientConfirmedBy: null,
    createdBy: "Test Admin User",
    updatedBy: "Test Admin User",
    updatedAt: "2026-09-01T09:00:00.000Z",
  };
}

const preview = () => `client:${fixtures.accountId}`;

function get(path: string, cookie: string, marker?: string) {
  const headers: Record<string, string> = { cookie };
  if (marker) headers["x-assure-preview"] = marker;
  return app.request(path, { headers });
}

const READS = ["/api/tracker/home", "/api/tracker/areas/6", "/api/tracker/jobs", "/api/tracker/documents", "/api/value/statement"];

describe("the operator in client view", () => {
  it("gets exactly the client seat's response for every read", async () => {
    for (const path of READS) {
      const asClient = await (await get(path, clientCookie)).json();
      const res = await get(path, adminCookie, preview());
      expect(res.status, path).toBe(200);
      expect(await res.json(), path).toEqual(asClient);
    }
  });

  it("is refused without the marker", async () => {
    expect((await get("/api/tracker/home", adminCookie)).status).toBe(403);
  });

  it("is refused every write, and the task is unchanged", async () => {
    const res = await app.request(`/api/tracker/tasks/${TASK_ID}/confirm`, {
      method: "POST",
      headers: { cookie: adminCookie, "x-assure-preview": preview(), "content-type": "application/json" },
      body: JSON.stringify({ note: "", evidence: "" }),
    });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/^Read only in client view/);
    const doc = await readOrg(fixtures.accountId);
    const task = doc!.tasks.find((t) => t.id === TASK_ID)!;
    expect(task.clientConfirmedAt).toBeNull();
    expect(doc!.review).toHaveLength(0);

    const chat = await app.request("/api/chat/messages", {
      method: "POST",
      headers: { cookie: adminCookie, "x-assure-preview": preview(), "content-type": "application/json" },
      body: JSON.stringify({ body: "hello" }),
    });
    // v1.7 (FRAGO 07 3.3): Ask is let through client view as a pure read. It
    // answers, and nothing is saved, raised or started.
    expect(chat.status).toBe(200);
    expect((await chat.json()).preview).toBe(true);
    const after = await readOrg(fixtures.accountId);
    expect(after!.threads).toHaveLength(0);
    expect(after!.messages).toHaveLength(0);
    expect(after!.review).toHaveLength(0);
    expect(after!.clocks).toHaveLength(0);
  });

  it("uses the client figure even when the operator's toggle is on the stricter count", async () => {
    await app.request(`/api/admin/settings?org=${fixtures.accountId}`, {
      method: "PUT",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      body: JSON.stringify({ denominatorMode: "cycle" }),
    });
    const asClient = await (await get("/api/tracker/home", clientCookie)).json();
    const asPreview = await (await get("/api/tracker/home", adminCookie, preview())).json();
    expect(asPreview.overall).toEqual(asClient.overall);
    expect(asPreview.overall.mode).toBe("overdue");
  });

  it("writes one audit entry per session, not per request", async () => {
    for (let i = 0; i < 3; i++) await get("/api/tracker/home", adminCookie, preview());
    const doc = await readOrg(fixtures.accountId);
    const opens = doc!.audit.filter((a) => a.action === "client_view.open");
    expect(opens).toHaveLength(1);
    expect(opens[0].detail).not.toContain(adminCookie);

    const second = await signIn(TEST_ADMIN_EMAIL);
    await get("/api/tracker/home", second, preview());
    const after = await readOrg(fixtures.accountId);
    expect(after!.audit.filter((a) => a.action === "client_view.open")).toHaveLength(2);
  });

  it("never creates the client's Guide thread", async () => {
    const res = await get("/api/chat/thread", adminCookie, preview());
    expect(res.status).toBe(200);
    expect((await res.json()).messages).toEqual([]);
    expect((await readOrg(fixtures.accountId))!.threads).toHaveLength(0);
  });

  it("reads an organisation that does not exist as not found", async () => {
    expect((await get("/api/tracker/home", adminCookie, "client:no-such-org")).status).toBe(404);
  });
});

describe("the client seat", () => {
  it("is unaffected by the marker, for its own organisation or any other", async () => {
    for (const path of READS) {
      const plain = await (await get(path, clientCookie)).json();
      expect(await (await get(path, clientCookie, preview())).json(), path).toEqual(plain);
      expect(await (await get(path, clientCookie, "client:someone-else")).json(), path).toEqual(plain);
    }
  });

  it("can still confirm with the marker present, because the marker means nothing to it", async () => {
    const res = await app.request(`/api/tracker/tasks/${TASK_ID}/confirm`, {
      method: "POST",
      headers: { cookie: clientCookie, "x-assure-preview": preview(), "content-type": "application/json" },
      body: JSON.stringify({ note: "", evidence: "" }),
    });
    expect(res.status).toBe(200);
  });

  it("writes no client view audit entry", async () => {
    await get("/api/tracker/home", clientCookie, preview());
    const doc = await readOrg(fixtures.accountId);
    expect(doc!.audit.filter((a) => a.action === "client_view.open")).toHaveLength(0);
  });
});

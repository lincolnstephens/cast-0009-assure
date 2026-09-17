import { LIBRARY_TASKS, expandLibrary } from "@maximus/shared";
import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { mutateOrg, readOrg } from "../src/db/store.ts";
import type { TaskRecord } from "../src/db/model.ts";
import type { AppEnv } from "../src/lib/middleware.ts";
import { AREA_DEFAULT_HOURS } from "../src/lib/workplan.ts";
import { adminWorkplanRoutes } from "../src/routes/adminWorkplan.ts";
import { authRoutes } from "../src/routes/auth.ts";
import {
  freshStore,
  seedTestUsers,
  sessionCookieOf,
  TEST_ADMIN_EMAIL,
  TEST_PASSWORD,
  type TestFixtures,
} from "./helpers.ts";

// A minimal app carrying only the routes this lane owns, plus auth to sign
// in - the house pattern (see valueExportReview.test.ts). LIBRARY_TASKS and
// expandLibrary come from the LIBRARY lane's packages/shared/src/library.ts;
// this suite exercises the API lane's use of them, not their own arithmetic
// (that is library.test.ts).
const app = new Hono<AppEnv>().basePath("/api").route("/auth", authRoutes).route("/admin", adminWorkplanRoutes);

let fixtures: TestFixtures;
let adminCookie: string;

beforeEach(async () => {
  freshStore();
  fixtures = await seedTestUsers();
  adminCookie = sessionCookieOf(
    await app.request("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: TEST_ADMIN_EMAIL, password: TEST_PASSWORD }),
    }),
  );
});

function applyLibrary(startDate: string) {
  return app.request(`/api/admin/workplan/apply-library?org=${fixtures.accountId}`, {
    method: "POST",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ startDate }),
  });
}

function patchTask(id: string, body: Record<string, unknown>) {
  return app.request(`/api/admin/workplan/${id}?org=${fixtures.accountId}`, {
    method: "PATCH",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function baseTask(over: Partial<TaskRecord> = {}): TaskRecord {
  return {
    id: over.id ?? "t-" + Math.random().toString(36).slice(2),
    orgId: fixtures.accountId,
    area: 6,
    phase: 4,
    title: "A manual task",
    how: "Do the thing",
    howLink: null,
    ownerType: "mitmark",
    ownerRole: "",
    dueAt: "2026-10-01",
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
    ...over,
  };
}

async function pushTask(over: Partial<TaskRecord> = {}): Promise<TaskRecord> {
  return mutateOrg(fixtures.accountId, (doc) => {
    const task = baseTask(over);
    doc.tasks.push(task);
    return task;
  });
}

describe("POST /api/admin/workplan/apply-library", () => {
  it("creates the expected count, and a second apply creates none", async () => {
    const startDate = "2026-09-01";
    const expected = expandLibrary(LIBRARY_TASKS, startDate);

    const first = await applyLibrary(startDate);
    expect(first.status).toBe(200);
    const firstBody = await first.json();
    expect(firstBody.created).toBe(expected.length);
    expect(firstBody.skipped).toBe(0);

    const doc = await readOrg(fixtures.accountId);
    expect(doc!.tasks).toHaveLength(expected.length);

    const second = await applyLibrary(startDate);
    expect(second.status).toBe(200);
    const secondBody = await second.json();
    expect(secondBody.created).toBe(0);
    expect(secondBody.skipped).toBe(expected.length);

    const after = await readOrg(fixtures.accountId);
    expect(after!.tasks).toHaveLength(expected.length);
  });
});

describe("PATCH /api/admin/workplan/:id - closing a task", () => {
  it("creates exactly one Record entry with the area's default hours and the closing admin as reviewer", async () => {
    const task = await pushTask({ area: 8, ownerType: "mitmark", status: "not_started" });

    const res = await patchTask(task.id, { status: "done" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.closedAt).not.toBeNull();
    expect(body.recordEntryId).not.toBeNull();

    const doc = await readOrg(fixtures.accountId);
    const entries = doc!.entries.filter((e) => e.sourceRef === task.id);
    expect(entries).toHaveLength(1);
    expect(entries[0].hours).toBe(AREA_DEFAULT_HOURS[8]);
    expect(entries[0].reviewer).toBe("Test Admin User");
    expect(entries[0].reviewed).toBe(true);
    expect(entries[0].ill).toBe(false);
  });

  it("books zero hours for a client-owned task, but still creates the entry", async () => {
    const task = await pushTask({ area: 3, ownerType: "client", ownerRole: "IT", status: "not_started" });
    const res = await patchTask(task.id, { status: "done" });
    expect(res.status).toBe(200);

    const doc = await readOrg(fixtures.accountId);
    const entries = doc!.entries.filter((e) => e.sourceRef === task.id);
    expect(entries).toHaveLength(1);
    expect(entries[0].hours).toBe(0);
  });

  it("does not create a Record entry when editing a task that does not move to done", async () => {
    const task = await pushTask({ status: "not_started" });
    const res = await patchTask(task.id, { title: "Updated title", progress: 50 });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe("Updated title");
    expect(body.recordEntryId).toBeNull();

    const doc = await readOrg(fixtures.accountId);
    expect(doc!.entries.filter((e) => e.sourceRef === task.id)).toHaveLength(0);
  });

  it("does not raise a second entry, or delete the first, when a task leaves and re-enters done", async () => {
    const task = await pushTask({ status: "not_started" });
    await patchTask(task.id, { status: "done" });
    await patchTask(task.id, { status: "in_progress" });
    const third = await patchTask(task.id, { status: "done" });
    expect(third.status).toBe(200);

    const doc = await readOrg(fixtures.accountId);
    expect(doc!.entries.filter((e) => e.sourceRef === task.id)).toHaveLength(1);
  });
});

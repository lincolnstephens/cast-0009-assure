import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { ensureOrg, mutateOrg, readOrg } from "../src/db/store.ts";
import type { TaskRecord } from "../src/db/model.ts";
import type { AppEnv } from "../src/lib/middleware.ts";
import { authRoutes } from "../src/routes/auth.ts";
import { trackerRoutes } from "../src/routes/tracker.ts";
import {
  freshStore,
  seedTestUsers,
  sessionCookieOf,
  TEST_CLIENT_EMAIL,
  TEST_PASSWORD,
  type TestFixtures,
} from "./helpers.ts";

// A minimal app carrying only the routes this lane owns, plus auth to sign
// in, so this suite never depends on whether another lane's route files have
// finished - the house pattern (see valueExportReview.test.ts).
const app = new Hono<AppEnv>().basePath("/api").route("/auth", authRoutes).route("/tracker", trackerRoutes);

let fixtures: TestFixtures;
let clientCookie: string;

beforeEach(async () => {
  freshStore();
  fixtures = await seedTestUsers();
  clientCookie = sessionCookieOf(
    await app.request("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: TEST_CLIENT_EMAIL, password: TEST_PASSWORD }),
    }),
  );
});

function baseTask(over: Partial<TaskRecord> = {}): TaskRecord {
  return {
    id: over.id ?? "t-" + Math.random().toString(36).slice(2),
    orgId: fixtures.accountId,
    area: 6,
    phase: 4,
    title: "A workplan task",
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

function confirm(taskId: string, body: Record<string, unknown> = {}) {
  return app.request(`/api/tracker/tasks/${taskId}/confirm`, {
    method: "POST",
    headers: { cookie: clientCookie, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/tracker/tasks/:id/confirm", () => {
  it("refuses to confirm a MITMARK-owned task", async () => {
    const task = await pushTask({ ownerType: "mitmark" });
    const res = await confirm(task.id);
    expect(res.status).toBe(403);

    const doc = await readOrg(fixtures.accountId);
    const stored = doc!.tasks.find((t) => t.id === task.id)!;
    expect(stored.clientConfirmedAt).toBeNull();
    expect(doc!.review).toHaveLength(0);
  });

  it("404s for a task outside the client's organisation", async () => {
    const otherOrg = await ensureOrg("other-org", "Other Organisation");
    const other = await mutateOrg(otherOrg.id, (doc) => {
      const task = baseTask({ orgId: otherOrg.id, ownerType: "client", ownerRole: "IT" });
      doc.tasks.push(task);
      return task;
    });
    const res = await confirm(other.id);
    expect(res.status).toBe(404);
  });

  it("confirms without changing status, progress or closedAt", async () => {
    const task = await pushTask({ ownerType: "client", ownerRole: "IT", status: "in_progress", progress: 40 });
    const res = await confirm(task.id, { note: "Done on our end.", evidence: "https://example.test/evidence" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    const doc = await readOrg(fixtures.accountId);
    const stored = doc!.tasks.find((t) => t.id === task.id)!;
    expect(stored.status).toBe("in_progress");
    expect(stored.progress).toBe(40);
    expect(stored.closedAt).toBeNull();
    expect(stored.clientConfirmedAt).not.toBeNull();
    expect(stored.clientConfirmedBy).toBe("Test Client User");
    expect(stored.evidence).toContain("https://example.test/evidence");
  });

  it("creates exactly one review item and one audit entry", async () => {
    const task = await pushTask({ ownerType: "client", ownerRole: "HR" });
    await confirm(task.id);

    const doc = await readOrg(fixtures.accountId);
    const items = doc!.review.filter((r) => r.type === "task_confirmation" && r.refId === task.id);
    expect(items).toHaveLength(1);
    expect(items[0].summary).toContain(task.title);

    const audits = doc!.audit.filter((a) => a.action === "task.confirm");
    expect(audits).toHaveLength(1);
    expect(audits[0].actorId).toBe(fixtures.clientUserId);
  });

  it("confirming twice does not duplicate the review item", async () => {
    const task = await pushTask({ ownerType: "client", ownerRole: "Finance" });
    const first = await confirm(task.id, { note: "First." });
    expect(first.status).toBe(200);
    const second = await confirm(task.id, { note: "Second." });
    expect(second.status).toBe(200);

    const doc = await readOrg(fixtures.accountId);
    const items = doc!.review.filter((r) => r.type === "task_confirmation" && r.refId === task.id);
    expect(items).toHaveLength(1);
  });
});

describe("GET /api/tracker/home", () => {
  it("returns empty: true for an organisation with no tasks at all", async () => {
    const res = await app.request("/api/tracker/home", { headers: { cookie: clientCookie } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.empty).toBe(true);
    expect(body.emptyMessage).toBe("MITMARK is preparing your workplan");
  });

  it("never returns a percentage without the fraction beside it", async () => {
    await pushTask({ dueAt: "2026-01-01", status: "done" });
    await pushTask({ dueAt: "2026-01-02", status: "not_started" });

    const res = await app.request("/api/tracker/home", { headers: { cookie: clientCookie } });
    const body = await res.json();
    expect(body.empty).toBe(false);
    expect(body.overall.sentence).toMatch(/\d+ of \d+/);
    const pctMatch = body.overall.sentence.match(/(\d+)%/);
    expect(pctMatch).not.toBeNull();
    expect(body.overall.sentence.indexOf(" of ")).toBeLessThan(body.overall.sentence.indexOf("%"));
  });
});

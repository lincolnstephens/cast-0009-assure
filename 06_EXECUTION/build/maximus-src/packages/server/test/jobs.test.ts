import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { mutateOrg } from "../src/db/store.ts";
import type { TaskRecord } from "../src/db/model.ts";
import type { AppEnv } from "../src/lib/middleware.ts";
import { adminWorkplanRoutes } from "../src/routes/adminWorkplan.ts";
import { authRoutes } from "../src/routes/auth.ts";
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

/**
 * Jobs: every task across all eight modules in one list, grouped the way
 * the operator speaks about them - Not started, In progress, Completed - with a
 * blocked task still landing in In progress but carrying a flag, and not
 * applicable tasks excluded from the client's list but counted honestly.
 */
const app = new Hono<AppEnv>()
  .basePath("/api")
  .route("/auth", authRoutes)
  .route("/tracker", trackerRoutes)
  .route("/admin", adminWorkplanRoutes);

let fixtures: TestFixtures;
let clientCookie: string;
let adminCookie: string;

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
  adminCookie = sessionCookieOf(
    await app.request("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: TEST_ADMIN_EMAIL, password: TEST_PASSWORD }),
    }),
  );
});

function baseTask(over: Partial<TaskRecord> = {}): TaskRecord {
  return {
    id: over.id ?? "t-" + Math.random().toString(36).slice(2),
    orgId: fixtures.accountId,
    area: 1,
    phase: 1,
    title: "A job",
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

function getJobs(qs = "") {
  return app.request(`/api/tracker/jobs${qs}`, { headers: { cookie: clientCookie } });
}

function getAdminJobs(qs = "") {
  return app.request(`/api/admin/jobs?org=${fixtures.accountId}${qs}`, {
    headers: { cookie: adminCookie },
  });
}

describe("GET /api/tracker/jobs", () => {
  it("groups tasks into Not started, In progress and Completed, in that order", async () => {
    await pushTask({ title: "Fresh", status: "not_started" });
    await pushTask({ title: "Working", status: "in_progress" });
    await pushTask({ title: "Finished", status: "done" });

    const res = await getJobs();
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.groups.map((g: { id: string }) => g.id)).toEqual([
      "not_started",
      "in_progress",
      "completed",
    ]);
    expect(body.groups[0].name).toBe("Not started");
    expect(body.groups[1].name).toBe("In progress");
    expect(body.groups[2].name).toBe("Completed");

    expect(body.groups[0].tasks.map((t: { title: string }) => t.title)).toEqual(["Fresh"]);
    expect(body.groups[1].tasks.map((t: { title: string }) => t.title)).toEqual(["Working"]);
    expect(body.groups[2].tasks.map((t: { title: string }) => t.title)).toEqual(["Finished"]);
  });

  it("puts a blocked task in In progress and flags it, without inventing a fourth group", async () => {
    await pushTask({ title: "Stuck", status: "blocked" });

    const res = await getJobs();
    const body = await res.json();

    expect(body.groups.map((g: { id: string }) => g.id)).toHaveLength(3);
    const inProgress = body.groups.find((g: { id: string }) => g.id === "in_progress");
    expect(inProgress.tasks).toHaveLength(1);
    expect(inProgress.tasks[0].title).toBe("Stuck");
    expect(inProgress.tasks[0].blocked).toBe(true);
    expect(inProgress.tasks[0].statusLabel).toBe("Blocked");
  });

  it("excludes not applicable tasks from every group but counts them", async () => {
    await pushTask({ title: "Skip this", status: "not_applicable" });
    await pushTask({ title: "Skip that too", status: "not_applicable" });
    await pushTask({ title: "Keep", status: "not_started" });

    const res = await getJobs();
    const body = await res.json();

    const allTitles = body.groups.flatMap((g: { tasks: { title: string }[] }) =>
      g.tasks.map((t) => t.title),
    );
    expect(allTitles).not.toContain("Skip this");
    expect(allTitles).not.toContain("Skip that too");
    expect(allTitles).toContain("Keep");
    expect(body.notApplicableCount).toBe(2);
  });

  it("marks a client-owned task forYou: true and a MITMARK task forYou: false", async () => {
    await pushTask({ title: "Mine", ownerType: "client", ownerRole: "Finance" });
    await pushTask({ title: "Theirs", ownerType: "mitmark" });

    const res = await getJobs();
    const body = await res.json();
    const all: { title: string; forYou: boolean }[] = body.groups.flatMap(
      (g: { tasks: { title: string; forYou: boolean }[] }) => g.tasks,
    );
    expect(all.find((t) => t.title === "Mine")!.forYou).toBe(true);
    expect(all.find((t) => t.title === "Theirs")!.forYou).toBe(false);
  });

  it("lists the modules and owners actually present", async () => {
    await pushTask({ area: 2, ownerType: "mitmark" });
    await pushTask({ area: 7, ownerType: "client", ownerRole: "IT" });

    const res = await getJobs();
    const body = await res.json();
    expect(body.modules.map((m: { id: number }) => m.id)).toEqual([2, 7]);
    expect(body.owners.sort()).toEqual(["IT", "MITMARK"]);
  });

  it("narrows by module", async () => {
    await pushTask({ area: 2, title: "In module 2" });
    await pushTask({ area: 7, title: "In module 7" });

    const res = await getJobs("?module=2");
    const body = await res.json();
    const titles = body.groups.flatMap((g: { tasks: { title: string }[] }) => g.tasks.map((t) => t.title));
    expect(titles).toEqual(["In module 2"]);
  });

  it("narrows by owner", async () => {
    await pushTask({ ownerType: "client", ownerRole: "Finance", title: "Finance task" });
    await pushTask({ ownerType: "mitmark", title: "MITMARK task" });

    const res = await getJobs("?owner=Finance");
    const body = await res.json();
    const titles = body.groups.flatMap((g: { tasks: { title: string }[] }) => g.tasks.map((t) => t.title));
    expect(titles).toEqual(["Finance task"]);
  });

  it("narrows by due this month", async () => {
    const now = new Date();
    const thisMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-15`;
    await pushTask({ dueAt: thisMonth, title: "Due this month" });
    await pushTask({ dueAt: "2099-12-01", title: "Due much later" });

    const res = await getJobs("?due=month");
    const body = await res.json();
    const titles = body.groups.flatMap((g: { tasks: { title: string }[] }) => g.tasks.map((t) => t.title));
    expect(titles).toEqual(["Due this month"]);
  });
});

describe("GET /api/admin/jobs", () => {
  it("lists not applicable tasks rather than hiding them", async () => {
    await pushTask({ title: "Ruled out", status: "not_applicable" });

    const res = await getAdminJobs();
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.notApplicable.map((t: { title: string }) => t.title)).toEqual(["Ruled out"]);
    expect(body.notApplicableCount).toBe(1);
    const allGroupTitles = body.groups.flatMap((g: { tasks: { title: string }[] }) =>
      g.tasks.map((t) => t.title),
    );
    expect(allGroupTitles).not.toContain("Ruled out");
  });

  it("returns the same three groups as the client view", async () => {
    await pushTask({ title: "Fresh", status: "not_started" });
    await pushTask({ title: "Stuck", status: "blocked" });
    await pushTask({ title: "Finished", status: "done" });

    const res = await getAdminJobs();
    const body = await res.json();
    expect(body.groups.map((g: { id: string }) => g.id)).toEqual([
      "not_started",
      "in_progress",
      "completed",
    ]);
    const inProgress = body.groups.find((g: { id: string }) => g.id === "in_progress");
    expect(inProgress.tasks[0].blocked).toBe(true);
  });
});

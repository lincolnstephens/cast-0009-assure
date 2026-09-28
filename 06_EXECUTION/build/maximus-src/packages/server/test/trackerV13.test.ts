import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { AREAS, DEFAULT_JOURNEY_NOTE, DEFAULT_MODULE_INTRODUCTIONS } from "@maximus/shared";
import { mutateOrg } from "../src/db/store.ts";
import type { TaskRecord } from "../src/db/model.ts";
import type { AppEnv } from "../src/lib/middleware.ts";
import { adminRecordRoutes } from "../src/routes/adminRecord.ts";
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

// v1.3 (FRAGO 03): the journey, Upcoming, the module page's new fields, and
// the operator's settings that drive them.
const app = new Hono<AppEnv>()
  .basePath("/api")
  .route("/auth", authRoutes)
  .route("/tracker", trackerRoutes)
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
});

const inDays = (n: number): string =>
  new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

function task(over: Partial<TaskRecord>): TaskRecord {
  return {
    id: "t-" + Math.random().toString(36).slice(2),
    orgId: fixtures.accountId,
    area: 6,
    phase: 3,
    title: "A workplan task",
    how: "Do the thing",
    howLink: null,
    ownerType: "mitmark",
    ownerRole: "",
    dueAt: inDays(30),
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

async function pushTasks(...tasks: Partial<TaskRecord>[]): Promise<void> {
  await mutateOrg(fixtures.accountId, (doc) => {
    for (const t of tasks) doc.tasks.push(task(t));
  });
}

async function home() {
  const res = await app.request("/api/tracker/home", { headers: { cookie: clientCookie } });
  expect(res.status).toBe(200);
  return res.json();
}

function putSettings(body: Record<string, unknown>) {
  return app.request(`/api/admin/settings?org=${fixtures.accountId}`, {
    method: "PUT",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("module names", () => {
  it("carries the operator's names for modules 2, 3 and 8, ids unchanged", () => {
    expect(AREAS.map((a) => [a.id, a.name])).toEqual([
      [1, "DPO registration"],
      [2, "Data tracker compliance"],
      [3, "Data retention practice"],
      [4, "Policy review"],
      [5, "Data protection impact assessment"],
      [6, "Data subject requests"],
      [7, "Vendor data risk"],
      [8, "Data breach and incident response"],
    ]);
  });
});

describe("journey", () => {
  it("derives the stage from the earliest open due date when the operator has not set it", async () => {
    await pushTasks({ phase: 3, dueAt: inDays(5) }, { phase: 4, dueAt: inDays(40) });
    const { journey } = await home();
    expect(journey.currentPhase).toBe(3);
    expect(journey.source).toBe("derived");
    expect(journey.note).toBe(DEFAULT_JOURNEY_NOTE);
    expect(journey.nodes.map((n: { state: string }) => n.state)).toEqual([
      "done",
      "done",
      "current",
      "future",
      "future",
    ]);
  });

  it("uses the operator's stage and sentence when set", async () => {
    await pushTasks({ phase: 1, dueAt: inDays(5) });
    expect((await putSettings({ journeyPhase: 4, journeyNote: "Year two." })).status).toBe(200);
    const { journey } = await home();
    expect(journey.currentPhase).toBe(4);
    expect(journey.currentName).toBe("Ongoing monitoring");
    expect(journey.source).toBe("operator");
    expect(journey.note).toBe("Year two.");
  });

  it("returns to the derived stage and default sentence when cleared", async () => {
    await pushTasks({ phase: 2, dueAt: inDays(5) });
    await putSettings({ journeyPhase: 5 });
    await putSettings({ journeyPhase: null, journeyNote: "" });
    const { journey } = await home();
    expect(journey.currentPhase).toBe(2);
    expect(journey.note).toBe(DEFAULT_JOURNEY_NOTE);
  });

  it("says nothing is set rather than guessing when no open task carries a date", async () => {
    await pushTasks({ dueAt: null, recurrence: "always-on" });
    const { journey } = await home();
    expect(journey.currentPhase).toBeNull();
    expect(journey.nodes.every((n: { state: string }) => n.state === "future")).toBe(true);
  });

  it("refuses a stage outside 1 to 5", async () => {
    expect((await putSettings({ journeyPhase: 6 })).status).toBe(400);
  });
});

describe("upcoming", () => {
  it("lists dated open MITMARK tasks from today on, soonest first, at most eight", async () => {
    const later = Array.from({ length: 10 }, (_, i) => ({ title: `Later ${i}`, dueAt: inDays(20 + i) }));
    await pushTasks(
      { title: "Overdue", dueAt: inDays(-3) },
      { title: "Done", dueAt: inDays(2), status: "done" },
      { title: "Client", dueAt: inDays(1), ownerType: "client", ownerRole: "HR" },
      { title: "Undated", dueAt: null, recurrence: "always-on" },
      { title: "Soonest", dueAt: inDays(4), area: 1 },
      ...later,
    );
    const { upcoming } = await home();
    expect(upcoming).toHaveLength(8);
    expect(upcoming[0].title).toBe("Soonest");
    expect(upcoming[0].areaName).toBe("DPO registration");
    const titles = upcoming.map((u: { title: string }) => u.title);
    for (const hidden of ["Overdue", "Done", "Client", "Undated"]) expect(titles).not.toContain(hidden);
  });

  it("is empty when nothing is scheduled", async () => {
    await pushTasks({ dueAt: inDays(-1) });
    expect((await home()).upcoming).toEqual([]);
  });
});

describe("module page", () => {
  it("carries the default introduction, the progress fraction and no unfiled documents", async () => {
    await pushTasks({ area: 3, status: "done" }, { area: 3 }, { area: 3, status: "not_applicable" });
    const res = await app.request("/api/tracker/areas/3", { headers: { cookie: clientCookie } });
    const body = await res.json();
    expect(body.name).toBe("Data retention practice");
    expect(body.introduction).toBe(DEFAULT_MODULE_INTRODUCTIONS[3]);
    expect(body.progress).toEqual({ done: 1, total: 2, pct: 50 });
    expect(body.documents.every((d: { id: string }) => !d.id.startsWith("tracker-unfiled:"))).toBe(true);
  });

  it("uses the operator's introduction when one is written", async () => {
    await pushTasks({ area: 2 });
    await putSettings({ moduleIntroductions: { "2": "Our registers, reviewed." } });
    const res = await app.request("/api/tracker/areas/2", { headers: { cookie: clientCookie } });
    expect((await res.json()).introduction).toBe("Our registers, reviewed.");
  });
});

describe("the client cannot set any of it", () => {
  it("refuses the settings route to a client session", async () => {
    const res = await app.request(`/api/admin/settings?org=${fixtures.accountId}`, {
      method: "PUT",
      headers: { cookie: clientCookie, "content-type": "application/json" },
      body: JSON.stringify({ journeyPhase: 1 }),
    });
    expect([401, 403]).toContain(res.status);
  });
});

describe("job management", () => {
  it("carries the Waiting on you empty message the tracker used", async () => {
    await pushTasks({}, {});
    const res = await app.request("/api/tracker/jobs", { headers: { cookie: clientCookie } });
    const body = await res.json();
    expect(body.forYouEmptyMessage).toBe("Nothing needs your action. MITMARK is working 2 items.");
    expect(body.groups.map((g: { name: string }) => g.name)).toEqual([
      "Not started",
      "In progress",
      "Completed",
    ]);
  });
});

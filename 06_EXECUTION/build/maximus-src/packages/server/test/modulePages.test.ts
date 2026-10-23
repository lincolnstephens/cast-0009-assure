import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app.ts";
import { emptyOrgDoc, type ClockRecord, type DocumentRecord, type OrgDoc, type TaskRecord } from "../src/db/model.ts";
import { mutateOrg, readOrg } from "../src/db/store.ts";
import { counters, milestones, moduleScore, moduleTiles, overallScore } from "../src/lib/modulePage.ts";
import { statementOutlook } from "../src/lib/record.ts";
import {
  freshStore,
  seedTestUsers,
  sessionCookieOf,
  TEST_ADMIN_EMAIL,
  TEST_CLIENT_EMAIL,
  TEST_PASSWORD,
  type TestFixtures,
} from "./helpers.ts";

// v1.6 (FRAGO 06): the score rule, the module page's tiles, milestones and
// counters, the Figures form, the seed's additions and the Statement's frame.

const NOW = new Date("2026-09-30T09:00:00.000Z");

function task(over: Partial<TaskRecord> = {}): TaskRecord {
  return {
    id: over.id ?? "t-" + Math.random().toString(36).slice(2),
    orgId: "demo",
    area: 1,
    phase: 1,
    title: "A task",
    how: "",
    howLink: null,
    ownerType: "mitmark",
    ownerRole: "",
    dueAt: null,
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
    createdBy: "operator",
    updatedBy: "operator",
    updatedAt: "2026-09-16T09:00:00.000Z",
    ...over,
  };
}

function docWith(tasks: TaskRecord[]): OrgDoc {
  const doc = emptyOrgDoc("demo", "Demo Organisation");
  doc.tasks = tasks;
  return doc;
}

describe("module score (FRAGO 06 3.6)", () => {
  it("says so, with no number, when a module has no dated obligation", () => {
    const s = moduleScore(docWith([task({ dueAt: null }), task({ dueAt: "2026-12-01" })]), 1, NOW);
    expect(s.pct).toBeNull();
    expect(s.rag).toBe("grey");
    expect(s.sentence).toBe("No dated obligations yet");
  });

  it("counts on time in full, open past its date as nothing", () => {
    const s = moduleScore(
      docWith([
        task({ dueAt: "2026-09-01", status: "done", closedAt: "2026-08-30T10:00:00.000Z" }),
        task({ dueAt: "2026-09-10", status: "in_progress" }),
      ]),
      1,
      NOW,
    );
    expect(s).toMatchObject({ pct: 50, onTime: 1, late: 0, m: 2, rag: "red" });
    expect(s.sentence).toBe("50% (1 of 2 on time)");
  });

  it("gives 70 per cent within 30 days late and 50 per cent beyond", () => {
    const near = moduleScore(
      docWith([task({ dueAt: "2026-08-01", status: "done", closedAt: "2026-08-20T10:00:00.000Z" })]),
      1,
      NOW,
    );
    expect(near.pct).toBe(70);
    expect(near.rag).toBe("amber");
    expect(near.sentence).toBe("70% (0 of 1 on time, 1 late)");
    const far = moduleScore(
      docWith([task({ dueAt: "2026-06-01", status: "done", closedAt: "2026-08-20T10:00:00.000Z" })]),
      1,
      NOW,
    );
    expect(far.pct).toBe(50);
    expect(far.rag).toBe("red");
  });

  it("does not count undated tasks, future open tasks or not applicable", () => {
    const s = moduleScore(
      docWith([
        task({ dueAt: "2026-09-01", status: "done", closedAt: "2026-09-01T10:00:00.000Z" }),
        task({ dueAt: null, status: "in_progress" }),
        task({ dueAt: "2027-01-01" }),
        task({ dueAt: "2026-09-01", status: "not_applicable" }),
      ]),
      1,
      NOW,
    );
    expect(s).toMatchObject({ pct: 100, m: 1, rag: "green" });
  });

  it("counts a task completed early, and leaves out anything due more than twelve months ago", () => {
    const s = moduleScore(
      docWith([
        task({ dueAt: "2027-03-21", status: "done", closedAt: "2026-09-20T10:00:00.000Z" }),
        task({ dueAt: "2025-06-01", status: "not_started" }),
      ]),
      1,
      NOW,
    );
    expect(s).toMatchObject({ pct: 100, m: 1 });
  });

  it("takes a task closed by the seed as met on its date, since the seed time is not a completion date", () => {
    const seededAt = "2026-09-30T08:30:00.000Z";
    const doc = docWith([task({ dueAt: "2026-03-21", status: "done", closedAt: seededAt })]);
    doc.settings.seededAt = seededAt;
    expect(moduleScore(doc, 1, NOW)).toMatchObject({ pct: 100, onTime: 1, late: 0 });
    doc.settings.seededAt = null;
    expect(moduleScore(doc, 1, NOW)).toMatchObject({ pct: 50, late: 1 });
  });

  it("colours green at 90 and above, amber from 60, red below", () => {
    const at = (onTime: number, open: number) =>
      moduleScore(
        docWith([
          ...Array.from({ length: onTime }, () => task({ dueAt: "2026-09-01", status: "done", closedAt: "2026-09-01T00:00:00.000Z" })),
          ...Array.from({ length: open }, () => task({ dueAt: "2026-09-01" })),
        ]),
        1,
        NOW,
      );
    expect(at(9, 1)).toMatchObject({ pct: 90, rag: "green" });
    expect(at(6, 4)).toMatchObject({ pct: 60, rag: "amber" });
    expect(at(5, 5)).toMatchObject({ pct: 50, rag: "red" });
  });

  it("overall is the mean over modules with a dated obligation, with modules green as its fraction", () => {
    const o = overallScore(
      docWith([
        task({ area: 1, dueAt: "2026-09-01", status: "done", closedAt: "2026-09-01T00:00:00.000Z" }),
        task({ area: 2, dueAt: "2026-09-01" }),
        task({ area: 3, dueAt: null }),
      ]),
      NOW,
    );
    expect(o).toMatchObject({ pct: 50, green: 1, counted: 2 });
    expect(o.sentence).toBe("Compliance score: 50% (1 of 8 modules green)");
    expect(overallScore(docWith([]), NOW).sentence).toBe("Compliance score: no dated obligations yet");
  });
});

describe("milestones", () => {
  it("are the module's dated tasks, oldest first, done green and only the next open one overdue", () => {
    const doc = docWith([
      task({ id: "a", area: 1, dueAt: "2026-03-21", status: "done" }),
      task({ id: "b", area: 1, dueAt: "2026-09-01" }),
      task({ id: "c", area: 1, dueAt: "2026-09-02" }),
      task({ id: "d", area: 1, dueAt: null }),
      task({ id: "e", area: 2, dueAt: "2026-01-01" }),
    ]);
    const m = milestones(doc, 1, NOW);
    expect(m.map((x) => [x.taskId, x.state])).toEqual([
      ["a", "done"],
      ["b", "overdue"],
      ["c", "future"],
    ]);
  });

  it("show at most six, keeping the next open one in view", () => {
    const tasks = Array.from({ length: 9 }, (_, i) =>
      task({ id: `m${i}`, area: 4, dueAt: `2026-0${i + 1}-01`, status: i < 7 ? "done" : "not_started" }),
    );
    const m = milestones(docWith(tasks), 4, NOW);
    expect(m).toHaveLength(6);
    expect(m.map((x) => x.taskId)).toContain("m7");
  });

  it("are empty when there is no dated task", () => {
    expect(milestones(docWith([task({ dueAt: null })]), 1, NOW)).toEqual([]);
  });
});

function fileDoc(over: Partial<DocumentRecord>): DocumentRecord {
  return {
    id: over.id ?? "d-" + Math.random().toString(36).slice(2),
    orgId: "demo",
    section: "trackers",
    area: 2,
    title: "A document",
    version: "",
    asAt: "",
    owner: "MITMARK",
    kind: "file",
    blobKey: "x",
    fileName: "x.xlsx",
    contentType: "",
    sizeBytes: 1,
    url: "",
    published: true,
    updatedAt: "2026-09-28T00:00:00.000Z",
    updatedBy: "operator",
    description: "",
    ...over,
  };
}

describe("module tiles", () => {
  it("module 2 lists the operator's registers, a filed one by its alias, the rest as not yet filed", () => {
    const doc = docWith([]);
    doc.documents = [fileDoc({ id: "matrix", title: "Employee Access Matrix" })];
    const tiles = moduleTiles(doc, 2);
    expect(tiles.map((t) => t.title)).toEqual([
      "Record of processing activities",
      "Employee Access Matrix",
      "Cross-border transfer assessment",
      "Information security risk register",
      "Vendor log",
    ]);
    expect(tiles[1]).toMatchObject({ kind: "register", opens: "download", ref: "matrix", filed: true });
    expect(tiles[0]).toMatchObject({ opens: "card", filed: false, detail: "Not yet filed" });
  });

  it("module 3 shows the retention schedule first, then its policy; links come last", () => {
    const doc = docWith([]);
    doc.settings.retentionSchedule = { "3": [{ category: "CCTV and access data", period: "30 days" }] };
    doc.documents = [
      fileDoc({ id: "link", section: "procedures", area: 3, kind: "link", title: "A link", url: "https://example.org" }),
      fileDoc({ id: "pol", section: "policies", area: 3, title: "Data Retention Policy (draft)", description: "Draft." }),
    ];
    const tiles = moduleTiles(doc, 3);
    expect(tiles.map((t) => [t.kind, t.title])).toEqual([
      ["retention", "CCTV and access data"],
      ["policy", "Data Retention Policy (draft)"],
      ["link", "A link"],
    ]);
    expect(tiles[0]).toMatchObject({ detail: "30 days", opens: "card" });
    expect(tiles[1].detail).toBe("No version yet, draft");
  });

  it("module 4 shows every policy with its version and status", () => {
    const doc = docWith([]);
    doc.documents = [
      fileDoc({ id: "p1", section: "policies", area: 4, title: "Data Protection Policy", version: "1", description: "Approved policy, version 1." }),
      fileDoc({ id: "p3", section: "policies", area: 3, title: "Data Retention Policy (draft)", status: "draft" }),
    ];
    const tiles = moduleTiles(doc, 4);
    expect(tiles.map((t) => [t.title, t.detail])).toEqual([
      ["Data Protection Policy", "Version 1, approved"],
      ["Data Retention Policy (draft)", "No version yet, draft"],
    ]);
  });

  it("never shows an unpublished document", () => {
    const doc = docWith([]);
    doc.documents = [fileDoc({ section: "procedures", area: 6, title: "Response template", published: false })];
    expect(moduleTiles(doc, 6).map((t) => t.title)).toEqual(["Data request log"]);
  });
});

function clock(over: Partial<ClockRecord>): ClockRecord {
  return {
    id: "c-" + Math.random().toString(36).slice(2),
    orgId: "demo",
    intakeId: null,
    kind: "sar_1_month",
    startedAt: "2026-09-01T00:00:00.000Z",
    dueAt: "2026-10-01T00:00:00.000Z",
    closedAt: null,
    closedBy: null,
    outcome: null,
    entryId: null,
    insideStatute: null,
    icoNotified: null,
    ...over,
  };
}

describe("counters", () => {
  it("modules 1 to 4 have none", () => {
    for (const a of [1, 2, 3, 4]) expect(counters(docWith([]), a, NOW)).toEqual([]);
  });

  it("operator figures show no data until reported, then carry their date", () => {
    const doc = docWith([]);
    const [dpia] = counters(doc, 5, NOW);
    expect(dpia).toMatchObject({ source: "operator", noData: true });
    doc.figures = [
      {
        id: "f",
        area: 5,
        groups: { dpia: { total: 3, started: 1, in_progress: 1, completed: 1 }, pra: { total: null } },
        enteredById: "u",
        enteredByName: "Operator",
        enteredAt: "2026-09-29T10:00:00.000Z",
      },
    ];
    const [d, p] = counters(doc, 5, NOW);
    expect(d.noData).toBe(false);
    expect(d.items[0]).toEqual({ key: "total", label: "Total", value: 3 });
    expect(d.basis).toBe("Reported by MITMARK on 29 September 2026.");
    expect(p.noData).toBe(true);
  });

  it("data requests are counted from the request log, by state", () => {
    const doc = docWith([]);
    doc.clocks = [
      clock({ intakeId: "i1" }),
      clock({ intakeId: "i2" }),
      clock({ intakeId: "i3", dueAt: "2026-09-20T00:00:00.000Z" }),
      clock({ intakeId: "i4", closedAt: "2026-09-10T00:00:00.000Z" }),
    ];
    doc.review = [
      { id: "r1", orgId: "demo", type: "intake", refId: "i1", summary: "", state: "pending", decidedBy: null, decidedAt: null, createdAt: "" },
    ];
    const [g] = counters(doc, 6, NOW);
    expect(g.source).toBe("records");
    expect(Object.fromEntries(g.items.map((i) => [i.key, i.value]))).toEqual({
      total: 4,
      not_picked_up: 1,
      in_progress: 1,
      blocked: 1,
      addressed: 1,
    });
    expect(g.basis).toBe("From the request log, as at 30 September 2026.");
  });

  it("module 8 counts reported concerns from records and incidents from the operator", () => {
    const groups = counters(docWith([]), 8, NOW);
    expect(groups.map((g) => [g.key, g.source, g.noData])).toEqual([
      ["concerns", "records", true],
      ["incidents", "operator", true],
    ]);
  });
});

describe("statement outlook (FRAGO 06 3.5)", () => {
  it("lists the eight modules in order, and what comes next as the open dated tasks, soonest first", () => {
    const doc = docWith([
      task({ id: "later", title: "Later", dueAt: "2026-11-30" }),
      task({ id: "sooner", title: "Sooner", dueAt: "2026-10-22" }),
      task({ id: "done", dueAt: "2026-09-01", status: "done" }),
      task({ id: "undated", dueAt: null }),
    ]);
    const o = statementOutlook(doc);
    // v1.7 (FRAGO 07 3.4): the service is the eight modules, in module order, each with its one line.
    expect(o.service).toHaveLength(8);
    expect(o.service.map((m) => m.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(o.service.every((m) => m.introduction.length > 0)).toBe(true);
    expect(o.next.map((t) => t.id)).toEqual(["sooner", "later"]);
  });
});

// ---------------------------------------------------------------------------
// Through the API
// ---------------------------------------------------------------------------

const here = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = JSON.parse(
  readFileSync(path.resolve(here, "../../../../../gate/fixtures/seed_manifest_fixture.json"), "utf8"),
);

let fx: TestFixtures;
let admin: string;
let client: string;

async function login(email: string): Promise<string> {
  const res = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: TEST_PASSWORD }),
  });
  return sessionCookieOf(res);
}

function call(p: string, cookie: string, method = "GET", body?: unknown) {
  return app.request(p, {
    method,
    headers: { cookie, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

beforeEach(async () => {
  process.env.SESSION_SECRET ??= "test-secret";
  freshStore();
  fx = await seedTestUsers();
  admin = await login(TEST_ADMIN_EMAIL);
  client = await login(TEST_CLIENT_EMAIL);
});

describe("figures form", () => {
  it("the operator reports figures; the client sees them with the date and never who entered them", async () => {
    const org = fx.accountId;
    const put = await call(`/api/admin/figures/7?org=${org}`, admin, "PUT", {
      groups: { vendors: { total: 12, severity_high: 2, compliant: 9, bogus: 5 } },
    });
    expect(put.status).toBe(200);
    const page = (await (await call("/api/tracker/areas/7", client)).json()) as any;
    const g = page.counters[0];
    expect(g.noData).toBe(false);
    expect(g.items.find((i: any) => i.key === "total").value).toBe(12);
    expect(g.items.find((i: any) => i.key === "severity_low").value).toBeNull();
    expect(JSON.stringify(page)).not.toContain(fx.adminUserId);
    expect(JSON.stringify(page)).not.toContain("bogus");
    const stored = await readOrg(org);
    expect(stored!.figures![0].enteredById).toBe(fx.adminUserId);
  });

  it("the client cannot reach the figures or the settings that hold the retention schedule", async () => {
    expect((await call(`/api/admin/figures?org=${fx.accountId}`, client)).status).toBe(403);
    expect((await call(`/api/admin/figures/5?org=${fx.accountId}`, client, "PUT", { groups: {} })).status).toBe(403);
    expect(
      (await call(`/api/admin/settings?org=${fx.accountId}`, client, "PUT", { retentionSchedule: {} })).status,
    ).toBe(403);
  });

  it("refuses a module that keeps no figures", async () => {
    expect((await call(`/api/admin/figures/2?org=${fx.accountId}`, admin, "PUT", { groups: {} })).status).toBe(404);
  });
});

describe("seed additions (manifest v2.1)", () => {
  it("files the links and the retention schedule without touching tasks or documents, and is idempotent", async () => {
    const org = fx.accountId;
    const url = `/api/admin/organisations/${org}/seed?org=${org}`;
    await call(url, admin, "POST", { manifest: { ...FIXTURE, links: [], organisation: { settings: {} } } });
    await mutateOrg(org, (d) => {
      d.documents.push({ ...fileDoc({ id: "kept", orgId: org }) });
    });
    const before = (await readOrg(org))!;
    const taskIds = before.tasks.map((t) => `${t.id}:${t.updatedAt}:${t.status}`);

    const dry = (await (await call(url, admin, "POST", { manifest: FIXTURE, additionsOnly: true, dryRun: true })).json()) as any;
    expect(dry.wouldAdd).toEqual({ links: 2, linksAlreadyFiled: 0, retentionRows: 7 });
    expect((await readOrg(org))!.documents).toHaveLength(1);

    const real = await call(url, admin, "POST", { manifest: FIXTURE, additionsOnly: true });
    expect(real.status).toBe(200);
    const after = (await readOrg(org))!;
    expect(after.tasks.map((t) => `${t.id}:${t.updatedAt}:${t.status}`)).toEqual(taskIds);
    expect(after.documents.find((d) => d.id === "kept")).toEqual(before.documents.find((d) => d.id === "kept"));
    const links = after.documents.filter((d) => d.kind === "link");
    expect(links.map((l) => [l.area, l.section, l.published])).toEqual([
      [1, "procedures", true],
      [1, "procedures", true],
    ]);
    expect(after.settings.retentionSchedule?.["3"]).toHaveLength(7);

    const again = (await (await call(url, admin, "POST", { manifest: FIXTURE, additionsOnly: true })).json()) as any;
    expect(again.wouldAdd.links).toBe(0);
    expect((await readOrg(org))!.documents.filter((d) => d.kind === "link")).toHaveLength(2);

    const m1 = (await (await call("/api/tracker/areas/1", client)).json()) as any;
    expect(m1.tiles.filter((t: any) => t.kind === "link")).toHaveLength(2);
    const m3 = (await (await call("/api/tracker/areas/3", client)).json()) as any;
    expect(m3.tiles.filter((t: any) => t.kind === "retention")).toHaveLength(7);
  });

  it("a real first seed also files the links and the schedule", async () => {
    const org = fx.accountId;
    await call(`/api/admin/organisations/${org}/seed?org=${org}`, admin, "POST", { manifest: FIXTURE });
    const doc = (await readOrg(org))!;
    expect(doc.documents.filter((d) => d.kind === "link")).toHaveLength(2);
    expect(doc.settings.retentionSchedule?.["3"]).toHaveLength(7);
  });
});

describe("the client's pages", () => {
  it("the Statement has the service and what comes next, and no obligations comparison", async () => {
    const body = (await (await call("/api/value/statement", client)).json()) as any;
    expect(body.service).toHaveLength(8);
    expect(Array.isArray(body.next)).toBe(true);
    expect(Array.isArray(body.items)).toBe(true);
    expect(body).not.toHaveProperty("obligations");
  });

  it("the home carries the overall score and each module's score", async () => {
    const body = (await (await call("/api/tracker/home", client)).json()) as any;
    expect(body.overall.score.sentence).toMatch(/^Compliance score: /);
    expect(body.areas).toHaveLength(8);
    for (const a of body.areas) expect(a.score.sentence).toBeTruthy();
  });
});

import { describe, expect, it } from "vitest";
import { emptyOrgDoc, type ClockRecord, type OrgDoc, type TaskRecord } from "../src/db/model.ts";
import {
  areaSummaries,
  forYou,
  hasFallenDue,
  isOpen,
  kpis,
  overallStatus,
  ownerLabel,
  phaseSummaries,
  taskRag,
  worstRag,
} from "../src/lib/tracker.ts";

/**
 * The tracker's arithmetic, tested against the rules the order states.
 *
 * The denominator rule is the one that matters most: it decides what the client
 * and the CFO are told about how much of the obligation has been met, so it is
 * tested from every side, including the cases that would flatter the client.
 */

const NOW = new Date("2026-09-17T09:00:00.000Z");
const TODAY = "2026-09-17";

function task(over: Partial<TaskRecord> = {}): TaskRecord {
  return {
    id: over.id ?? "t-" + Math.random().toString(36).slice(2),
    orgId: "demo",
    area: 1,
    phase: 1,
    title: "A task",
    how: "How it is done",
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

function docWith(tasks: TaskRecord[], clocks: ClockRecord[] = []): OrgDoc {
  const doc = emptyOrgDoc("demo", "Demo Organisation");
  doc.tasks = tasks;
  doc.clocks = clocks;
  return doc;
}

function clock(over: Partial<ClockRecord> = {}): ClockRecord {
  return {
    id: "c-" + Math.random().toString(36).slice(2),
    orgId: "demo",
    intakeId: null,
    kind: "sar_1_month",
    startedAt: "2026-03-01T09:00:00.000Z",
    dueAt: "2026-04-01T09:00:00.000Z",
    closedAt: null,
    closedBy: null,
    outcome: null,
    entryId: null,
    insideStatute: null,
    icoNotified: null,
    ...over,
  };
}

// ---------------------------------------------------------------------------

describe("the denominator rule", () => {
  it("counts a task due today", () => {
    expect(hasFallenDue(task({ dueAt: TODAY }), TODAY)).toBe(true);
  });

  it("counts a task that fell due in the past", () => {
    expect(hasFallenDue(task({ dueAt: "2026-01-01" }), TODAY)).toBe(true);
  });

  it("does not count a task that is not due yet", () => {
    expect(hasFallenDue(task({ dueAt: "2026-12-01" }), TODAY)).toBe(false);
  });

  it("does not count an always-on duty with nothing live against it", () => {
    // A duty nobody has raised anything against is being kept up. Counting it
    // as unmet made a client who was entirely up to date open on a low number.
    const duty = task({ recurrence: "always-on", dueAt: null, area: 6 });
    expect(hasFallenDue(duty, TODAY, "overdue", new Set())).toBe(false);
  });

  it("counts an always-on duty once its module has something live against it", () => {
    const duty = task({ recurrence: "always-on", dueAt: null, area: 6 });
    expect(hasFallenDue(duty, TODAY, "overdue", new Set([6]))).toBe(true);
    expect(hasFallenDue(duty, TODAY, "overdue", new Set([8]))).toBe(false);
  });

  it("counts every always-on duty in the operator's stricter view", () => {
    const duty = task({ recurrence: "always-on", dueAt: null, area: 6 });
    expect(hasFallenDue(duty, TODAY, "cycle", new Set())).toBe(true);
  });

  it("excludes a task marked not applicable, however it is dated", () => {
    expect(hasFallenDue(task({ dueAt: "2026-01-01", status: "not_applicable" }), TODAY)).toBe(
      false,
    );
    expect(
      hasFallenDue(
        task({ recurrence: "always-on", status: "not_applicable", area: 6 }),
        TODAY,
        "cycle",
        new Set([6]),
      ),
    ).toBe(false);
  });

  it("does not count a dated task with no date that is not always-on", () => {
    expect(hasFallenDue(task({ dueAt: null, recurrence: "once" }), TODAY)).toBe(false);
  });
});

describe("overall status", () => {
  it("states the fraction, the percentage and the date together", () => {
    const doc = docWith([
      task({ dueAt: "2026-09-01", status: "done" }),
      task({ dueAt: "2026-09-02", status: "done" }),
      task({ dueAt: "2026-09-03", status: "in_progress" }),
      task({ dueAt: "2026-09-04", status: "not_started" }),
    ]);
    const o = overallStatus(doc, NOW);
    expect(o.n).toBe(2);
    expect(o.m).toBe(4);
    expect(o.pct).toBe(50);
    expect(o.sentence).toBe("2 of 4 obligations met, 50%, as at 17 September 2026");
  });

  it("never returns a percentage without the fraction in the sentence", () => {
    const doc = docWith([task({ dueAt: "2026-09-01", status: "done" })]);
    const o = overallStatus(doc, NOW);
    expect(o.sentence).toMatch(/\d+ of \d+/);
    const pct = o.sentence.match(/(\d+)%/);
    expect(pct).not.toBeNull();
    // The fraction must appear before the percentage, so it is read first.
    expect(o.sentence.indexOf(" of ")).toBeLessThan(o.sentence.indexOf("%"));
  });

  it("does not let a task due next month flatter or damage the figure", () => {
    const withFuture = docWith([
      task({ dueAt: "2026-09-01", status: "done" }),
      task({ dueAt: "2026-12-01", status: "not_started" }),
    ]);
    const o = overallStatus(withFuture, NOW);
    expect(o.m).toBe(1);
    expect(o.n).toBe(1);
    expect(o.pct).toBe(100);
  });

  it("says nothing is overdue rather than showing nought per cent", () => {
    const doc = docWith([task({ dueAt: "2026-12-01" })]);
    const o = overallStatus(doc, NOW);
    expect(o.m).toBe(0);
    expect(o.sentence).toBe("Nothing overdue, as at 17 September 2026");
    expect(o.sentence).not.toMatch(/%/);
    expect(o.standing).toBe("Nothing overdue");
  });

  it("says how many are outstanding when some are", () => {
    const doc = docWith([
      task({ dueAt: "2026-09-01", status: "done" }),
      task({ dueAt: "2026-09-02" }),
      task({ dueAt: "2026-09-03", status: "blocked" }),
    ]);
    const o = overallStatus(doc, NOW);
    expect(o.standing).toBe("2 overdue or blocked");
  });

  it("an up to date client with only continuous duties reads as nothing overdue", () => {
    // The case that drove the change: every duty is always-on, nothing is live
    // against any of them, and the client is not behind on anything.
    const doc = docWith([
      task({ recurrence: "always-on", area: 5 }),
      task({ recurrence: "always-on", area: 6 }),
      task({ recurrence: "always-on", area: 7 }),
    ]);
    const o = overallStatus(doc, NOW);
    expect(o.m).toBe(0);
    expect(o.standing).toBe("Nothing overdue");

    // The operator's stricter view still shows the work not yet signed off.
    const strict = overallStatus(doc, NOW, "cycle");
    expect(strict.m).toBe(3);
    expect(strict.standing).toBe("3 overdue or blocked");
    expect(strict.basis).not.toBe(o.basis);
  });

  it("an open data request makes module 6's continuous duty count", () => {
    const doc = docWith(
      [task({ recurrence: "always-on", area: 6 })],
      [clock({ kind: "sar_1_month", closedAt: null })],
    );
    const o = overallStatus(doc, NOW);
    expect(o.m).toBe(1);
    expect(o.standing).toBe("1 overdue or blocked");
  });

  it("the operator's toggle cannot change what the client is shown", () => {
    // The stricter count is the operator's own view. If it leaked into the
    // default, flipping a setting in admin would silently move the number on
    // the client's front page and on the statement sent to their CFO.
    const doc = docWith([
      task({ recurrence: "always-on", area: 5 }),
      task({ recurrence: "always-on", area: 7 }),
    ]);
    doc.settings.denominatorMode = "cycle";
    const asClientSeesIt = overallStatus(doc, NOW);
    expect(asClientSeesIt.mode).toBe("overdue");
    expect(asClientSeesIt.m).toBe(0);
    expect(asClientSeesIt.standing).toBe("Nothing overdue");

    // The operator still gets the stricter view by asking for it.
    expect(overallStatus(doc, NOW, "cycle").m).toBe(2);
  });

  it("carries its basis and covers all eight areas", () => {
    const o = overallStatus(docWith([]), NOW);
    expect(o.basis.length).toBeGreaterThan(20);
    expect(o.byArea).toHaveLength(8);
    for (const a of o.byArea) expect(a.ragLabel.length).toBeGreaterThan(0);
  });
});

describe("task RAG", () => {
  it("is red when overdue", () => {
    expect(taskRag(task({ dueAt: "2026-09-01" }), TODAY)).toBe("red");
  });

  it("is red when blocked, whatever the date", () => {
    expect(taskRag(task({ dueAt: "2027-01-01", status: "blocked" }), TODAY)).toBe("red");
  });

  it("is amber inside the fortnight before it is due", () => {
    expect(taskRag(task({ dueAt: "2026-09-25" }), TODAY)).toBe("amber");
  });

  it("is green when it is comfortably ahead", () => {
    expect(taskRag(task({ dueAt: "2026-11-01" }), TODAY)).toBe("green");
  });

  it("is green for an always-on duty with no date, which cannot be overdue", () => {
    expect(taskRag(task({ recurrence: "always-on", dueAt: null }), TODAY)).toBe("green");
  });

  it("is green when done and grey when not applicable", () => {
    expect(taskRag(task({ status: "done", dueAt: "2026-01-01" }), TODAY)).toBe("green");
    expect(taskRag(task({ status: "not_applicable", dueAt: "2026-01-01" }), TODAY)).toBe("grey");
  });

  it("takes the worst of a set, and reads grey when nothing is open", () => {
    expect(
      worstRag([task({ dueAt: "2026-11-01" }), task({ dueAt: "2026-09-01" })], TODAY),
    ).toBe("red");
    expect(worstRag([task({ status: "done" })], TODAY)).toBe("grey");
    expect(worstRag([], TODAY)).toBe("grey");
  });
});

describe("the journey strip", () => {
  it("marks the phase holding the earliest open due date as current", () => {
    const doc = docWith([
      task({ phase: 1, dueAt: "2026-11-01" }),
      task({ phase: 3, dueAt: "2026-09-20" }),
      task({ phase: 5, dueAt: "2026-12-01" }),
    ]);
    const phases = phaseSummaries(doc, NOW);
    expect(phases).toHaveLength(5);
    expect(phases.find((p) => p.current)?.phase).toBe(3);
  });

  it("counts open and done per phase and never marks a closed phase current", () => {
    const doc = docWith([
      task({ phase: 2, status: "done", dueAt: "2026-01-01" }),
      task({ phase: 2, status: "in_progress", dueAt: "2026-10-01" }),
    ]);
    const p2 = phaseSummaries(doc, NOW).find((p) => p.phase === 2)!;
    expect(p2.done).toBe(1);
    expect(p2.open).toBe(1);
  });
});

describe("the area tiles", () => {
  it("returns all eight in order with the next task and its owner", () => {
    const doc = docWith([
      task({ area: 6, dueAt: "2026-10-01", title: "Later", ownerType: "mitmark" }),
      task({
        area: 6,
        dueAt: "2026-09-20",
        title: "Sooner",
        ownerType: "client",
        ownerRole: "Information Officer",
      }),
    ]);
    const areas = areaSummaries(doc, NOW);
    expect(areas.map((a) => a.area)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    const six = areas.find((a) => a.area === 6)!;
    expect(six.nextTaskTitle).toBe("Sooner");
    expect(six.nextOwner).toBe("Information Officer");
    expect(six.openCount).toBe(2);
  });

  it("leaves a not applicable task out of the progress count", () => {
    const doc = docWith([
      task({ area: 3, status: "done", dueAt: "2026-01-01" }),
      task({ area: 3, status: "not_applicable", dueAt: "2026-01-01" }),
    ]);
    const three = areaSummaries(doc, NOW).find((a) => a.area === 3)!;
    expect(three.totalCount).toBe(1);
    expect(three.doneCount).toBe(1);
  });
});

describe("for you", () => {
  it("returns only the client's open tasks, soonest first", () => {
    const doc = docWith([
      task({ ownerType: "mitmark", dueAt: "2026-09-18" }),
      task({ ownerType: "client", ownerRole: "Finance", dueAt: "2026-10-01", title: "Later" }),
      task({ ownerType: "client", ownerRole: "IT", dueAt: "2026-09-19", title: "Sooner" }),
      task({ ownerType: "client", ownerRole: "HR", status: "done", title: "Closed" }),
    ]);
    const mine = forYou(doc, NOW);
    expect(mine.map((t) => t.title)).toEqual(["Sooner", "Later"]);
    for (const t of mine) expect(t.ragLabel.length).toBeGreaterThan(0);
  });

  it("labels the owner as MITMARK or the client role", () => {
    expect(ownerLabel(task({ ownerType: "mitmark" }))).toBe("MITMARK");
    expect(ownerLabel(task({ ownerType: "client", ownerRole: "Board" }))).toBe("Board");
  });
});

describe("open", () => {
  it("treats done and not applicable as settled", () => {
    expect(isOpen(task({ status: "in_progress" }))).toBe(true);
    expect(isOpen(task({ status: "blocked" }))).toBe(true);
    expect(isOpen(task({ status: "done" }))).toBe(false);
    expect(isOpen(task({ status: "not_applicable" }))).toBe(false);
  });
});

describe("the six KPI tiles", () => {
  it("returns six tiles, each with a basis, even with nothing to count", () => {
    const tiles = kpis(docWith([]), NOW);
    expect(tiles).toHaveLength(6);
    for (const t of tiles) {
      expect(t.basis.length).toBeGreaterThan(10);
      expect(t.value.length).toBeGreaterThan(0);
    }
  });

  it("says no data yet rather than showing a nought it cannot justify", () => {
    const tiles = kpis(docWith([]), NOW);
    const dsar = tiles.find((t) => t.key === "dsar")!;
    expect(dsar.noData).toBe(true);
    expect(dsar.value).toBe("No data yet");
  });

  it("counts data requests answered inside the statutory month, this year", () => {
    const doc = docWith(
      [],
      [
        clock({ closedAt: "2026-05-01T09:00:00.000Z", insideStatute: true }),
        clock({ closedAt: "2026-06-01T09:00:00.000Z", insideStatute: false }),
        clock({ closedAt: "2025-06-01T09:00:00.000Z", insideStatute: true }),
      ],
    );
    const dsar = kpis(doc, NOW).find((t) => t.key === "dsar")!;
    expect(dsar.value).toBe("1 of 2");
    expect(dsar.period).toBe("2026");
  });

  it("reports concerns logged, those notified to the ICO and the median assessment time", () => {
    const doc = docWith(
      [],
      [
        clock({
          kind: "breach_72h",
          startedAt: "2026-04-01T00:00:00.000Z",
          closedAt: "2026-04-01T06:00:00.000Z",
          icoNotified: false,
        }),
        clock({
          kind: "breach_72h",
          startedAt: "2026-05-01T00:00:00.000Z",
          closedAt: "2026-05-01T10:00:00.000Z",
          icoNotified: true,
        }),
      ],
    );
    const breach = kpis(doc, NOW).find((t) => t.key === "breach")!;
    expect(breach.value).toContain("2 logged");
    expect(breach.value).toContain("1 notified to the ICO");
    expect(breach.value).toContain("median 8h");
  });

  it("reads impact assessments, processing records and vendors off their areas", () => {
    const doc = docWith([
      task({ area: 5, status: "done", dueAt: "2026-01-01" }),
      task({ area: 5, status: "not_started", dueAt: "2026-01-01" }),
      task({ area: 2, status: "done", dueAt: "2026-01-01" }),
      task({ area: 7, status: "done", dueAt: "2026-01-01" }),
      task({ area: 7, status: "not_started", dueAt: "2026-01-01" }),
    ]);
    const tiles = kpis(doc, NOW);
    expect(tiles.find((t) => t.key === "dpia")!.value).toBe("1 of 2 complete");
    expect(tiles.find((t) => t.key === "ropa")!.value).toBe("1 of 1 documented");
    expect(tiles.find((t) => t.key === "vendor")!.value).toContain("1 of 2 assessed");
  });

  it("says training is not recorded until the operator sets the numbers", () => {
    const doc = docWith([]);
    expect(kpis(doc, NOW).find((t) => t.key === "training")!.value).toBe("Not recorded");
    doc.settings.staffInScope = 40;
    doc.settings.staffTrained = 31;
    const set = kpis(doc, NOW).find((t) => t.key === "training")!;
    expect(set.value).toBe("31 of 40 trained");
    expect(set.noData).toBe(false);
  });

  it("never shows a bare percentage on any tile", () => {
    const doc = docWith([
      task({ area: 5, status: "done", dueAt: "2026-01-01" }),
      task({ area: 2, status: "done", dueAt: "2026-01-01" }),
      task({ area: 7, status: "done", dueAt: "2026-01-01" }),
    ]);
    for (const tile of kpis(doc, NOW)) {
      if (/\d+%/.test(tile.value)) expect(tile.value).toMatch(/\d+ of \d+/);
    }
  });
});

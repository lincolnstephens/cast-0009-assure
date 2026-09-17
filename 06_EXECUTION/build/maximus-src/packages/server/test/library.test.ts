import {
  AREA_IDS,
  AREA_OBLIGATIONS,
  DEFAULT_CLIENT_ROLES,
  LIBRARY_TASKS,
  PHASE_IDS,
  expandLibrary,
  libraryTaskSchema,
  type LibraryTask,
} from "@maximus/shared";
import { describe, expect, it } from "vitest";

// This lane owns the task library seed (`packages/shared/src/library.ts`)
// and this test file only. It does not exercise the admin apply-library
// route or the API lane's TaskRecord shape - those belong to other lanes.

describe("LIBRARY_TASKS", () => {
  it("every task parses against libraryTaskSchema", () => {
    for (const task of LIBRARY_TASKS) {
      expect(() => libraryTaskSchema.parse(task)).not.toThrow();
    }
  });

  it("every id is unique", () => {
    const ids = LIBRARY_TASKS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every task has a non-empty how that is not identical to its title", () => {
    for (const task of LIBRARY_TASKS) {
      expect(task.how.trim().length).toBeGreaterThan(0);
      expect(task.how).not.toBe(task.title);
    }
  });

  it("every client-owned task has a non-empty ownerRole from the allowed list", () => {
    for (const task of LIBRARY_TASKS.filter((t) => t.ownerType === "client")) {
      expect(task.ownerRole.length).toBeGreaterThan(0);
      expect(DEFAULT_CLIENT_ROLES).toContain(task.ownerRole);
    }
  });

  it("every mitmark-owned task has an empty ownerRole", () => {
    for (const task of LIBRARY_TASKS.filter((t) => t.ownerType === "mitmark")) {
      expect(task.ownerRole).toBe("");
    }
  });

  it("every client-owned task books zero default hours", () => {
    for (const task of LIBRARY_TASKS.filter((t) => t.ownerType === "client")) {
      expect(task.defaultHours).toBe(0);
    }
  });

  it("every area 1 to 8 has at least one task", () => {
    for (const area of AREA_IDS) {
      expect(LIBRARY_TASKS.some((t) => t.area === area)).toBe(true);
    }
  });

  it("every phase 1 to 5 is used at least once", () => {
    for (const phase of PHASE_IDS) {
      expect(LIBRARY_TASKS.some((t) => t.phase === phase)).toBe(true);
    }
  });
});

describe("AREA_OBLIGATIONS", () => {
  it("has all eight areas", () => {
    for (const area of AREA_IDS) {
      expect(AREA_OBLIGATIONS[area]).toBeDefined();
    }
  });

  it("each obligation is three to five sentences", () => {
    for (const area of AREA_IDS) {
      const { obligation } = AREA_OBLIGATIONS[area];
      // Split on sentence-ending punctuation followed by whitespace or end of string.
      const sentences = obligation
        .trim()
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.trim().length > 0);
      expect(sentences.length).toBeGreaterThanOrEqual(3);
      expect(sentences.length).toBeLessThanOrEqual(5);
    }
  });

  it("each citation is non-empty", () => {
    for (const area of AREA_IDS) {
      expect(AREA_OBLIGATIONS[area].citation.trim().length).toBeGreaterThan(0);
    }
  });

  it("has no digit-plus-Article/Section pattern in the obligation body", () => {
    const pattern = /\d\s*(article|section)|\b(article|section)\s*\d/i;
    for (const area of AREA_IDS) {
      expect(AREA_OBLIGATIONS[area].obligation).not.toMatch(pattern);
    }
  });
});

describe("expandLibrary", () => {
  const startDate = "2026-09-01";

  function taskOf(overrides: Partial<LibraryTask>): LibraryTask {
    return {
      id: "t-once",
      area: 1,
      phase: 1,
      title: "Test task",
      how: "Test how",
      ownerType: "mitmark",
      ownerRole: "",
      recurrence: "once",
      defaultHours: 1,
      defaultOffsetDays: 10,
      ...overrides,
    };
  }

  it("once produces one instance at startDate plus the offset", () => {
    const out = expandLibrary([taskOf({ id: "t-once", recurrence: "once" })], startDate);
    expect(out).toHaveLength(1);
    expect(out[0].dueAt).toBe("2026-09-11");
  });

  it("annual produces one instance at startDate plus the offset", () => {
    const out = expandLibrary([taskOf({ id: "t-annual", recurrence: "annual" })], startDate);
    expect(out).toHaveLength(1);
    expect(out[0].dueAt).toBe("2026-09-11");
  });

  it("monthly produces twelve instances", () => {
    const out = expandLibrary([taskOf({ id: "t-monthly", recurrence: "monthly" })], startDate);
    expect(out).toHaveLength(12);
    expect(out.every((i) => i.dueAt !== null)).toBe(true);
  });

  it("quarterly produces four instances, three months apart", () => {
    const out = expandLibrary(
      [taskOf({ id: "t-quarterly", recurrence: "quarterly", defaultOffsetDays: 0 })],
      startDate,
    );
    expect(out).toHaveLength(4);
    expect(out.map((i) => i.dueAt)).toEqual([
      "2026-09-01",
      "2026-12-01",
      "2027-03-01",
      "2027-06-01",
    ]);
  });

  it("always-on produces exactly one instance with dueAt null", () => {
    const out = expandLibrary(
      [taskOf({ id: "t-always", recurrence: "always-on", defaultOffsetDays: 0 })],
      startDate,
    );
    expect(out).toHaveLength(1);
    expect(out[0].dueAt).toBeNull();
  });

  it("only always-on instances carry a null dueAt", () => {
    const out = expandLibrary(
      [
        taskOf({ id: "t-once", recurrence: "once" }),
        taskOf({ id: "t-annual", recurrence: "annual" }),
        taskOf({ id: "t-monthly", recurrence: "monthly" }),
        taskOf({ id: "t-quarterly", recurrence: "quarterly" }),
        taskOf({ id: "t-always", recurrence: "always-on" }),
      ],
      startDate,
    );
    const alwaysOn = out.filter((i) => i.dueAt === null);
    const dated = out.filter((i) => i.dueAt !== null);
    expect(alwaysOn).toHaveLength(1);
    expect(alwaysOn[0].libraryId).toBe("t-always");
    expect(dated.every((i) => i.libraryId !== "t-always")).toBe(true);
  });

  it("clamps month-end dates instead of drifting: 31 January monthly stays in each real month", () => {
    const out = expandLibrary(
      [
        taskOf({
          id: "t-clamp",
          recurrence: "monthly",
          defaultOffsetDays: 0,
        }),
      ],
      "2026-01-31",
    );
    expect(out).toHaveLength(12);
    // 2026 is not a leap year: February has 28 days. Adding a month to
    // 31 January must land on 28 February, never roll into March.
    expect(out[0].dueAt).toBe("2026-01-31");
    expect(out[1].dueAt).toBe("2026-02-28");
    expect(out[2].dueAt).toBe("2026-03-31");
    expect(out[3].dueAt).toBe("2026-04-30");
    // Every date must be a real, valid calendar date in a consecutive month.
    const months = out.map((i) => i.dueAt!.slice(0, 7));
    const expectedMonths = [
      "2026-01",
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
      "2026-11",
      "2026-12",
    ];
    expect(months).toEqual(expectedMonths);
    for (const instance of out) {
      expect(new Date(instance.dueAt! + "T00:00:00Z").toISOString().slice(0, 10)).toBe(
        instance.dueAt,
      );
    }
  });

  it("only emits instances whose due date falls within the given horizon", () => {
    const out = expandLibrary(
      [taskOf({ id: "t-far", recurrence: "once", defaultOffsetDays: 400 })],
      startDate,
      12,
    );
    expect(out).toHaveLength(0);
  });

  it("expands the real seeded library without throwing and keeps recurrence counts sane", () => {
    const out = expandLibrary(LIBRARY_TASKS, "2026-09-01");
    const byRecurrence = new Map<string, number>();
    for (const task of LIBRARY_TASKS) {
      byRecurrence.set(task.recurrence, (byRecurrence.get(task.recurrence) ?? 0) + 1);
    }
    const alwaysOnTasks = LIBRARY_TASKS.filter((t) => t.recurrence === "always-on").length;
    const alwaysOnInstances = out.filter((i) => i.dueAt === null).length;
    expect(alwaysOnInstances).toBe(alwaysOnTasks);
    expect(out.length).toBeGreaterThan(0);
  });
});

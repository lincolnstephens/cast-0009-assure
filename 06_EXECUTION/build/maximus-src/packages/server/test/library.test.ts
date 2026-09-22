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
import { policyPack } from "../scripts/policyPack.ts";

// This lane owns the task library seed (`packages/shared/src/library.ts`)
// and this test file only. It does not exercise the admin apply-library
// route or the API lane's TaskRecord shape - those belong to other lanes.

// The full set of ids as they stood in v1.1, before FRAGO 02's remap. Library
// task ids are stable forever, so every one of these must still resolve to a
// task in v1.2, even where it moved module (see TASK_AREA_MOVES in
// db/store.ts) or was retired (a3-policy-refresh).
const V1_1_LIBRARY_IDS = [
  "a1-ico-registration",
  "a1-dpo-appointment",
  "a1-ico-fee-payment",
  "a2-ropa-review",
  "a2-ropa-new-system",
  "a2-department-list",
  "a3-retention-schedule-review",
  "a3-scheduled-deletions",
  "a3-deletion-verification",
  "a4-transfer-mapping",
  "a4-transfer-safeguards",
  "a5-dpia-screening",
  "a5-dpia-completion",
  "a5-dpia-approval",
  "a6-dsar-handling",
  "a6-dsar-forwarding",
  "a6-dsar-log-review",
  "a7-vendor-assessment",
  "a7-vendor-review",
  "a7-vendor-notification",
  "a8-incident-assessment",
  "a8-breach-notification",
  "a8-incident-reporting",
  "a8-incident-response-test",
  "a8-staff-training",
  "a1-board-briefing",
  "a8-monthly-report",
  "a3-policy-refresh",
];

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

  it("every module 1 to 8 has at least one non-retired task", () => {
    for (const area of AREA_IDS) {
      expect(LIBRARY_TASKS.some((t) => t.area === area && !t.retired)).toBe(true);
    }
  });

  it("every phase 1 to 5 is used at least once", () => {
    for (const phase of PHASE_IDS) {
      expect(LIBRARY_TASKS.some((t) => t.phase === phase)).toBe(true);
    }
  });
});

describe("v1.2 remap (FRAGO 02 section 3)", () => {
  it("no id was lost between v1.1 and v1.2", () => {
    const ids = new Set(LIBRARY_TASKS.map((t) => t.id));
    for (const id of V1_1_LIBRARY_IDS) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it("a4-transfer-mapping moved to module 2 as the transfers register review, 4 hours", () => {
    const task = LIBRARY_TASKS.find((t) => t.id === "a4-transfer-mapping");
    expect(task).toBeDefined();
    expect(task?.area).toBe(2);
    expect(task?.defaultHours).toBe(4);
    expect(task?.recurrence).toBe("annual");
    expect(task?.retired).toBeFalsy();
  });

  it("a4-transfer-safeguards moved to module 7 unchanged in title and hours", () => {
    const task = LIBRARY_TASKS.find((t) => t.id === "a4-transfer-safeguards");
    expect(task).toBeDefined();
    expect(task?.area).toBe(7);
    expect(task?.title).toBe("Put the UK Addendum or IDTA in place for any new transfer before it starts.");
    expect(task?.defaultHours).toBe(4);
  });

  it("a3-policy-refresh moved to module 4 and is retired", () => {
    const task = LIBRARY_TASKS.find((t) => t.id === "a3-policy-refresh");
    expect(task).toBeDefined();
    expect(task?.area).toBe(4);
    expect(task?.retired).toBe(true);
  });

  it("module 2 has the employee access tracker review and the transfers register review", () => {
    const accessReview = LIBRARY_TASKS.find((t) => t.id === "a2-access-tracker-review");
    expect(accessReview).toBeDefined();
    expect(accessReview?.area).toBe(2);
    expect(accessReview?.recurrence).toBe("quarterly");
    expect(accessReview?.defaultHours).toBe(4);
    expect(accessReview?.phase).toBe(4);

    const transfersReview = LIBRARY_TASKS.find((t) => t.id === "a4-transfer-mapping");
    expect(transfersReview?.area).toBe(2);
  });

  it("expandLibrary skips retired tasks", () => {
    const retiredTask: LibraryTask = {
      id: "t-retired",
      area: 4,
      phase: 2,
      title: "Retired task",
      how: "Retired how",
      ownerType: "mitmark",
      ownerRole: "",
      recurrence: "annual",
      defaultHours: 2,
      defaultOffsetDays: 10,
      retired: true,
    };
    const out = expandLibrary([retiredTask], "2026-09-01");
    expect(out).toHaveLength(0);
  });

  it("a fresh apply of the real library produces no instance of the retired policy refresh", () => {
    const out = expandLibrary(LIBRARY_TASKS, "2026-09-01");
    expect(out.some((i) => i.libraryId === "a3-policy-refresh")).toBe(false);
  });

  it("the six per-policy review tasks exist with the real codes and titles from the policy pack", () => {
    expect(policyPack).toHaveLength(6);
    for (const entry of policyPack) {
      const id = `a4-policy-review-${entry.code.toLowerCase()}`;
      const task = LIBRARY_TASKS.find((t) => t.id === id);
      expect(task, `expected library task ${id} for policy ${entry.code}`).toBeDefined();
      expect(task?.area).toBe(4);
      expect(task?.phase).toBe(2);
      expect(task?.recurrence).toBe("annual");
      expect(task?.defaultHours).toBe(2);
      expect(task?.retired).toBeFalsy();
      expect(task?.title).toContain(entry.title);
      expect(task?.title).toContain(entry.code);
    }
  });

  it("module 4 has seven non-retired tasks: the six policies plus the privacy notice", () => {
    const nonRetired = LIBRARY_TASKS.filter((t) => t.area === 4 && !t.retired);
    expect(nonRetired).toHaveLength(7);
    expect(nonRetired.every((t) => t.recurrence === "annual" && t.defaultHours === 2)).toBe(true);
    const ids = nonRetired.map((t) => t.id);
    expect(ids).toContain("a4-privacy-notice-review");
    for (const entry of policyPack) {
      expect(ids).toContain(`a4-policy-review-${entry.code.toLowerCase()}`);
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

  it("module 2's obligation is now about the registers, not just the RoPA", () => {
    const { obligation, citation } = AREA_OBLIGATIONS[2];
    expect(obligation.toLowerCase()).toMatch(/regist/);
    expect(obligation.toLowerCase()).toContain("access");
    expect(obligation.toLowerCase()).toMatch(/transfer/);
    expect(citation.trim().length).toBeGreaterThan(0);
    expect(obligation).not.toMatch(/\d\s*(article|section)|\b(article|section)\s*\d/i);
  });

  it("module 4's obligation is now about the policy pack and the privacy notice", () => {
    const { obligation, citation } = AREA_OBLIGATIONS[4];
    expect(obligation.toLowerCase()).toMatch(/polic/);
    expect(obligation.toLowerCase()).toMatch(/privacy notice/);
    expect(citation.trim().length).toBeGreaterThan(0);
    expect(obligation).not.toMatch(/\d\s*(article|section)|\b(article|section)\s*\d/i);
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

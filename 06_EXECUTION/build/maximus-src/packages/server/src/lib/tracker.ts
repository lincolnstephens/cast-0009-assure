/**
 * The Compliance Tracker's arithmetic.
 *
 * Two rules govern everything here.
 *
 * First, the denominator. The overall figure counts obligations that have
 * actually fallen due: tasks with a due date on or before today, plus always-on
 * duties, which are due continuously. A task due next month is not yet an
 * obligation to have met, and counting it would make the client look worse than
 * they are. Tasks marked not applicable are outside the count entirely.
 *
 * Second, no figure without a basis. Every number returned from this file
 * carries the sentence that explains it and the date it was taken. Where there
 * is nothing to count, the figure says so and still names the basis it will use
 * once there is.
 */

import {
  AREA_IDS,
  PHASE_IDS,
  RAG_LABEL,
  TASK_STATUS_LABEL,
  areaName,
  phaseName,
  type AreaSummary,
  type Figure,
  type ForYouTask,
  type OverallStatus,
  type PhaseSummary,
  type Rag,
} from "@maximus/shared";
import type { ClockRecord, OrgDoc, TaskRecord } from "../db/model.ts";

/** Days before a due date at which a task starts reading as due soon. */
const AMBER_WINDOW_DAYS = 14;

export const today = (now: Date = new Date()): string => now.toISOString().slice(0, 10);

export function formatDate(iso: string | null): string {
  if (!iso) return "no date";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00Z" : iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** A task is open when it is neither done nor ruled out. */
export const isOpen = (t: TaskRecord): boolean =>
  t.status !== "done" && t.status !== "not_applicable";

/** A task counts towards the overall figure once it has fallen due. */
export function hasFallenDue(t: TaskRecord, asAt: string): boolean {
  if (t.status === "not_applicable") return false;
  if (t.recurrence === "always-on") return true;
  if (!t.dueAt) return false;
  return t.dueAt <= asAt;
}

function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(fromIso + "T00:00:00Z");
  const b = Date.parse(toIso + "T00:00:00Z");
  return Math.round((b - a) / 86_400_000);
}

/**
 * One task's RAG.
 *
 * Done and not applicable are settled, so they are green and grey. A blocked
 * task is red whatever its date: it is not moving. An always-on duty with no
 * date cannot be overdue, so it reads green while it is being kept up.
 */
export function taskRag(t: TaskRecord, asAt: string): Rag {
  if (t.status === "not_applicable") return "grey";
  if (t.status === "done") return "green";
  if (t.status === "blocked") return "red";
  if (!t.dueAt) return "green";
  if (t.dueAt < asAt) return "red";
  if (daysBetween(asAt, t.dueAt) <= AMBER_WINDOW_DAYS) return "amber";
  return "green";
}

const RAG_ORDER: Rag[] = ["red", "amber", "green", "grey"];

/** The worst RAG among the open tasks given, or grey when there are none. */
export function worstRag(tasks: TaskRecord[], asAt: string): Rag {
  const open = tasks.filter(isOpen);
  if (open.length === 0) return "grey";
  const rags = open.map((t) => taskRag(t, asAt));
  for (const r of RAG_ORDER) {
    if (rags.includes(r)) return r;
  }
  return "grey";
}

// ---------------------------------------------------------------------------
// Overall status
// ---------------------------------------------------------------------------

export const OVERALL_BASIS =
  "Obligations due on or before today, plus duties that run continuously. " +
  "An obligation is met when the task is closed as done. Tasks marked not applicable are excluded.";

export function overallStatus(doc: OrgDoc, now: Date = new Date()): OverallStatus {
  const asAt = today(now);
  const due = doc.tasks.filter((t) => hasFallenDue(t, asAt));
  const m = due.length;
  const n = due.filter((t) => t.status === "done").length;
  const pct = m === 0 ? 0 : Math.round((n / m) * 100);

  const byArea = AREA_IDS.map((area) => {
    const rag = worstRag(
      doc.tasks.filter((t) => t.area === area),
      asAt,
    );
    return { area, name: areaName(area), rag, ragLabel: RAG_LABEL[rag] };
  });

  const ragCounts = { green: 0, amber: 0, red: 0, grey: 0 };
  for (const a of byArea) ragCounts[a.rag] += 1;

  // The fraction always travels with the percentage. A bare percentage hides
  // whether it rests on two obligations or two hundred.
  const sentence =
    m === 0
      ? `No obligations have fallen due yet, as at ${formatDate(asAt)}`
      : `${n} of ${m} obligations met, ${pct}%, as at ${formatDate(asAt)}`;

  return { n, m, pct, sentence, asAt, basis: OVERALL_BASIS, byArea, ragCounts };
}

// ---------------------------------------------------------------------------
// The journey strip
// ---------------------------------------------------------------------------

export function phaseSummaries(doc: OrgDoc, now: Date = new Date()): PhaseSummary[] {
  const asAt = today(now);

  // The current phase is the one holding the earliest open due date. A phase
  // with only always-on duties has no date and cannot claim it.
  let currentPhase: number | null = null;
  let earliest: string | null = null;
  for (const t of doc.tasks) {
    if (!isOpen(t) || !t.dueAt) continue;
    if (earliest === null || t.dueAt < earliest) {
      earliest = t.dueAt;
      currentPhase = t.phase;
    }
  }

  return PHASE_IDS.map((phase) => {
    const of = doc.tasks.filter((t) => t.phase === phase);
    const rag = worstRag(of, asAt);
    return {
      phase,
      name: phaseName(phase),
      open: of.filter(isOpen).length,
      done: of.filter((t) => t.status === "done").length,
      rag,
      ragLabel: RAG_LABEL[rag],
      current: phase === currentPhase,
    };
  });
}

// ---------------------------------------------------------------------------
// The eight area tiles
// ---------------------------------------------------------------------------

export function ownerLabel(t: TaskRecord): string {
  return t.ownerType === "mitmark" ? "MITMARK" : t.ownerRole || "Client";
}

export function areaSummaries(doc: OrgDoc, now: Date = new Date()): AreaSummary[] {
  const asAt = today(now);
  return AREA_IDS.map((area) => {
    const of = doc.tasks.filter((t) => t.area === area);
    const open = of.filter(isOpen);
    const next = open
      .slice()
      .sort((a, b) => {
        if (a.dueAt && b.dueAt) return a.dueAt < b.dueAt ? -1 : 1;
        if (a.dueAt) return -1;
        if (b.dueAt) return 1;
        return 0;
      })[0];
    const rag = worstRag(of, asAt);
    const counted = of.filter((t) => t.status !== "not_applicable");
    return {
      area,
      name: areaName(area),
      rag,
      ragLabel: RAG_LABEL[rag],
      nextTaskTitle: next?.title ?? null,
      nextOwner: next ? ownerLabel(next) : null,
      nextDueAt: next?.dueAt ?? null,
      openCount: open.length,
      doneCount: counted.filter((t) => t.status === "done").length,
      totalCount: counted.length,
    };
  });
}

// ---------------------------------------------------------------------------
// "For you"
// ---------------------------------------------------------------------------

export function forYou(doc: OrgDoc, now: Date = new Date()): ForYouTask[] {
  const asAt = today(now);
  return doc.tasks
    .filter((t) => t.ownerType === "client" && isOpen(t))
    .sort((a, b) => {
      if (a.dueAt && b.dueAt) return a.dueAt < b.dueAt ? -1 : 1;
      if (a.dueAt) return -1;
      if (b.dueAt) return 1;
      return 0;
    })
    .map((t) => {
      const rag = taskRag(t, asAt);
      return {
        id: t.id,
        area: t.area,
        areaName: areaName(t.area),
        title: t.title,
        how: t.how,
        ownerRole: t.ownerRole,
        dueAt: t.dueAt,
        recurrence: t.recurrence,
        status: t.status,
        statusLabel: TASK_STATUS_LABEL[t.status],
        rag,
        ragLabel: RAG_LABEL[rag],
        confirmedAt: t.clientConfirmedAt,
      };
    });
}

// ---------------------------------------------------------------------------
// The six KPI tiles
// ---------------------------------------------------------------------------

function noData(basis: string, period: string): Figure {
  return { value: "No data yet", basis, period, noData: true };
}

const yearOf = (iso: string): number => Number(iso.slice(0, 4));

function medianHours(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

/** Counts of done over counted for one area, used by three of the tiles. */
function areaProgress(doc: OrgDoc, area: number): { done: number; total: number } {
  const of = doc.tasks.filter((t) => t.area === area && t.status !== "not_applicable");
  return { done: of.filter((t) => t.status === "done").length, total: of.length };
}

export interface KpiFigure extends Figure {
  key: string;
  label: string;
}

export function kpis(doc: OrgDoc, now: Date = new Date()): KpiFigure[] {
  const year = now.getUTCFullYear();
  const period = String(year);
  const closed = (c: ClockRecord) => c.closedAt !== null;

  // 1. Data requests answered inside the statutory month.
  const sarBasis =
    "Data request clocks closed this year, counting those answered inside the statutory month.";
  const sars = doc.clocks.filter(
    (c) => c.kind === "sar_1_month" && closed(c) && yearOf(c.closedAt!) === year,
  );
  const sarsOnTime = sars.filter((c) => c.insideStatute === true).length;
  const dsar: KpiFigure =
    sars.length === 0
      ? { key: "dsar", label: "Data requests on time", ...noData(sarBasis, period) }
      : {
          key: "dsar",
          label: "Data requests on time",
          value: `${sarsOnTime} of ${sars.length}`,
          basis: sarBasis,
          period,
          noData: false,
        };

  // 2. Reported concerns, how many went to the ICO, and how fast they were assessed.
  const breachBasis =
    "Concerns reported this year, those notified to the ICO, and the median hours from report to assessment.";
  const breaches = doc.clocks.filter(
    (c) => c.kind === "breach_72h" && yearOf(c.startedAt) === year,
  );
  const breachesClosed = breaches.filter(closed);
  const median = medianHours(
    breachesClosed.map(
      (c) => (Date.parse(c.closedAt!) - Date.parse(c.startedAt)) / 3_600_000,
    ),
  );
  const notified = breachesClosed.filter((c) => c.icoNotified === true).length;
  const breach: KpiFigure =
    breaches.length === 0
      ? { key: "breach", label: "Concerns reported", ...noData(breachBasis, period) }
      : {
          key: "breach",
          label: "Concerns reported",
          value:
            `${breaches.length} logged, ${notified} notified to the ICO` +
            (median === null ? "" : `, median ${median}h to assessment`),
          basis: breachBasis,
          period,
          noData: false,
        };

  // 3, 5, 6. Three tiles read straight off their area's tasks.
  const dpiaBasis = "Impact assessment tasks in the area, and those closed as done.";
  const dpiaCount = areaProgress(doc, 5);
  const dpia: KpiFigure =
    dpiaCount.total === 0
      ? { key: "dpia", label: "Impact assessments", ...noData(dpiaBasis, "") }
      : {
          key: "dpia",
          label: "Impact assessments",
          value: `${dpiaCount.done} of ${dpiaCount.total} complete`,
          basis: dpiaBasis,
          period: "",
          noData: false,
        };

  const ropaBasis = "Data mapping tasks in the area, and those closed as done.";
  const ropaCount = areaProgress(doc, 2);
  const ropa: KpiFigure =
    ropaCount.total === 0
      ? { key: "ropa", label: "Processing records", ...noData(ropaBasis, "") }
      : {
          key: "ropa",
          label: "Processing records",
          value: `${ropaCount.done} of ${ropaCount.total} documented`,
          basis: ropaBasis,
          period: "",
          noData: false,
        };

  const vendorBasis =
    "Vendor tasks in the area, those closed as done, and the state of those still open.";
  const vendorTasks = doc.tasks.filter(
    (t) => t.area === 7 && t.status !== "not_applicable",
  );
  const vendorCount = areaProgress(doc, 7);
  const vendorRag = { green: 0, amber: 0, red: 0 };
  for (const t of vendorTasks.filter(isOpen)) {
    const r = taskRag(t, today(now));
    if (r === "green" || r === "amber" || r === "red") vendorRag[r] += 1;
  }
  const vendor: KpiFigure =
    vendorCount.total === 0
      ? { key: "vendor", label: "Vendors", ...noData(vendorBasis, "") }
      : {
          key: "vendor",
          label: "Vendors",
          value:
            `${vendorCount.done} of ${vendorCount.total} assessed` +
            (vendorRag.red || vendorRag.amber
              ? `, ${vendorRag.red} overdue, ${vendorRag.amber} due soon`
              : ""),
          basis: vendorBasis,
          period: "",
          noData: false,
        };

  // 4. Training comes from the operator's settings, not from a task.
  const trainingBasis =
    "Staff recorded as trained against staff in scope, both set by MITMARK in settings.";
  const inScope = doc.settings.staffInScope;
  const trained = doc.settings.staffTrained;
  const training: KpiFigure =
    inScope === null || inScope === 0
      ? {
          key: "training",
          label: "Training",
          value: "Not recorded",
          basis: trainingBasis,
          period: "",
          noData: true,
        }
      : {
          key: "training",
          label: "Training",
          value: `${trained ?? 0} of ${inScope} trained`,
          basis: trainingBasis,
          period: "",
          noData: false,
        };

  return [dsar, breach, dpia, training, ropa, vendor];
}

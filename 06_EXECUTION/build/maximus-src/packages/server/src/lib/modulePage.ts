/**
 * The module page as the operator drew it (FRAGO 06, v1.6): the score, the
 * Useful links tiles, the compliance journey's milestones and the counters.
 *
 * Every figure here carries its basis. Nothing is drawn that is not stored:
 * a milestone is a task, a tile is a filed item (or a register's honest "Not
 * yet filed"), a counter is either counted from the product's own records or
 * reported by the operator with the date she reported it.
 */

import {
  AREA_IDS,
  MODULE_FIGURES,
  SCORE_AMBER_AT,
  SCORE_GREEN_AT,
  SCORE_LABEL,
  TRACKER_DOCUMENTS,
  type ComplianceDocument,
  type CounterGroup,
  type Milestone,
  type ModuleScore,
  type ModuleTile,
  type OverallScore,
  type Rag,
} from "@maximus/shared";
import type { ModuleFiguresRecord, OrgDoc, TaskRecord } from "../db/model.ts";
import { buildDocumentsResponse, isLiveDocument } from "./documents.ts";
import { formatDate, isOpen, today } from "./tracker.ts";

// ---------------------------------------------------------------------------
// The score (FRAGO 06 3.6)
// ---------------------------------------------------------------------------

/** The cycle is the twelve months to today. */
const CYCLE_DAYS = 365;
/** A completion this many days late or fewer earns LATE_NEAR credit; beyond, LATE_FAR. */
const LATE_WINDOW_DAYS = 30;
const LATE_NEAR = 0.7;
const LATE_FAR = 0.5;

export const MODULE_SCORE_BASIS =
  "Dated obligations in this module that fell due in the last 12 months, plus any completed early. " +
  "One met on or before its date counts in full; one met late counts 70 per cent if within 30 days of its date " +
  "and 50 per cent beyond; one still open after its date counts nothing. Undated tasks are not counted. " +
  "Green at 90 and above, amber from 60 to 89, red below 60.";

export const OVERALL_SCORE_BASIS =
  "The mean of the module scores, over the modules that have at least one dated obligation. " +
  "Each module's score is its dated obligations met on time over those due; a late completion earns part credit.";

function shiftDays(iso: string, days: number): string {
  const d = new Date(Date.parse(iso + "T00:00:00Z") + days * 86_400_000);
  return d.toISOString().slice(0, 10);
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso + "T00:00:00Z") - Date.parse(fromIso + "T00:00:00Z")) / 86_400_000);
}

/**
 * The day a done task was completed, or null when the store holds no real
 * completion date for it. The seed closes the tasks its manifest marks
 * completed at the moment it runs, which is the load time, not the day the
 * work was done; such a task (closedAt equal to the organisation's seededAt)
 * is taken as met on its date, because the operator's own table says it was
 * completed and gives no other date.
 */
export function completionDay(t: TaskRecord, seededAt: string | null | undefined): string | null {
  if (!t.closedAt) return null;
  if (seededAt && t.closedAt === seededAt) return null;
  return t.closedAt.slice(0, 10);
}

export function scoreRag(pct: number | null): Rag {
  if (pct === null) return "grey";
  if (pct >= SCORE_GREEN_AT) return "green";
  if (pct >= SCORE_AMBER_AT) return "amber";
  return "red";
}

/** The dated obligations a module's score counts, as at `asAt`. */
export function scoredTasks(doc: OrgDoc, area: number, asAt: string): (TaskRecord & { dueAt: string })[] {
  const cycleStart = shiftDays(asAt, -CYCLE_DAYS);
  return doc.tasks.filter(
    (t): t is TaskRecord & { dueAt: string } =>
      t.area === area &&
      t.status !== "not_applicable" &&
      t.dueAt !== null &&
      t.dueAt > cycleStart &&
      (t.dueAt <= asAt || t.status === "done"),
  );
}

export function moduleScore(doc: OrgDoc, area: number, now: Date = new Date()): ModuleScore {
  const asAt = today(now);
  const counted = scoredTasks(doc, area, asAt);
  let credit = 0;
  let onTime = 0;
  let late = 0;
  for (const t of counted) {
    if (t.status !== "done") continue;
    const done = completionDay(t, doc.settings.seededAt);
    if (done === null || done <= t.dueAt) {
      onTime += 1;
      credit += 1;
    } else {
      late += 1;
      credit += daysBetween(t.dueAt, done) <= LATE_WINDOW_DAYS ? LATE_NEAR : LATE_FAR;
    }
  }
  const m = counted.length;
  const pct = m === 0 ? null : Math.round((credit / m) * 100);
  const rag = scoreRag(pct);
  return {
    pct,
    onTime,
    late,
    m,
    rag,
    label: SCORE_LABEL[rag],
    sentence:
      pct === null
        ? "No dated obligations yet"
        : `${pct}% (${onTime} of ${m} on time${late ? `, ${late} late` : ""})`,
    basis: MODULE_SCORE_BASIS,
  };
}

export function overallScore(doc: OrgDoc, now: Date = new Date()): OverallScore {
  const scores = AREA_IDS.map((a) => moduleScore(doc, a, now));
  const scored = scores.filter((s): s is ModuleScore & { pct: number } => s.pct !== null);
  const green = scores.filter((s) => s.rag === "green").length;
  const pct = scored.length === 0 ? null : Math.round(scored.reduce((sum, s) => sum + s.pct, 0) / scored.length);
  return {
    pct,
    green,
    counted: scored.length,
    sentence:
      pct === null
        ? "Compliance score: no dated obligations yet"
        : `Compliance score: ${pct}% (${green} of ${AREA_IDS.length} modules green)`,
    basis: `${OVERALL_SCORE_BASIS} ${scored.length} of ${AREA_IDS.length} modules have one.`,
  };
}

// ---------------------------------------------------------------------------
// Useful links (FRAGO 06 3.1 item 2 and 3.2)
// ---------------------------------------------------------------------------

/**
 * A filed document's state. The seed states it from v1.6; a document filed
 * before then carries it in its title or its description line, which the
 * manifest wrote ("Approved policy, version 1", "Draft.").
 */
export function documentStatusOf(d: ComplianceDocument): string {
  if (d.status) return d.status;
  if (d.kind === "policy") return "approved";
  const text = `${d.title} ${d.description}`.toLowerCase();
  if (/\bdraft\b/.test(text)) return "draft";
  if (/\bapproved\b/.test(text)) return "approved";
  if (/\btemplate\b/.test(text)) return "template";
  return "";
}

function statusWord(status: string): string {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "";
}

function policyDetail(d: ComplianceDocument): string {
  const status = statusWord(documentStatusOf(d));
  const version = d.version ? `Version ${d.version}` : "No version yet";
  return status ? `${version}, ${status.toLowerCase()}` : version;
}

function openOf(d: ComplianceDocument): { opens: ModuleTile["opens"]; ref: string | null } {
  if (d.kind === "policy") return { opens: "policy", ref: d.id };
  return { opens: "download", ref: d.id };
}

function tileOfDocument(d: ComplianceDocument, kind: ModuleTile["kind"], detail: string): ModuleTile {
  return {
    id: d.id,
    kind,
    title: d.title,
    detail,
    description: d.description ?? "",
    ...openOf(d),
    filed: true,
  };
}

const sameTitle = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * The module's tiles, in the operator's order: its retention schedule (module
 * 3), its registers, its policies, its other filed items, then its links.
 * Module 4 shows every policy, because its page is the review of all four.
 */
export function moduleTiles(doc: OrgDoc, area: number): ModuleTile[] {
  const sections = buildDocumentsResponse(doc).sections;
  const items = (id: string) =>
    (sections.find((s) => s.id === id)?.items ?? []).filter(
      (d) => !(d.kind === "policy" && d.title.endsWith("(earlier version)")),
    );

  const tiles: ModuleTile[] = [];
  const used = new Set<string>();

  // Retention categories, each a card with its period.
  const schedule = doc.settings.retentionSchedule?.[String(area)] ?? [];
  schedule.forEach((row, i) =>
    tiles.push({
      id: `retention:${area}:${i}`,
      kind: "retention",
      title: row.category,
      detail: row.period,
      description: "From the retention schedule MITMARK keeps for the organisation.",
      opens: "card",
      ref: null,
      filed: true,
    }),
  );
  // v1.10 (FRAGO 11 3.2): module 3 says so when no schedule is recorded,
  // rather than leaving the reader to infer one from elsewhere.
  if (area === 3 && schedule.length === 0) {
    tiles.push({
      id: "retention:3:none",
      kind: "retention",
      title: "Retention schedule",
      detail: "No schedule yet",
      description: "MITMARK records the organisation's retention schedule here once it is agreed.",
      opens: "card",
      ref: null,
      // Muted, not amber: nothing is missing that has been promised.
      filed: true,
    });
  }

  // Registers: filed ones open, missing ones open their "Not yet filed" card.
  const trackers = items("trackers");
  for (const reg of TRACKER_DOCUMENTS.filter((t) => t.area === area || t.alsoAreas?.includes(area))) {
    const names = [reg.title, ...(reg.aliases ?? [])];
    const filed = trackers.find(
      (d) => !d.id.startsWith("tracker-unfiled:") && names.some((n) => sameTitle(n, d.title)),
    );
    if (filed) {
      used.add(filed.id);
      tiles.push(tileOfDocument(filed, "register", filed.asAt ? `As at ${filed.asAt}` : statusWord(documentStatusOf(filed))));
    } else {
      tiles.push({
        id: `register:${reg.key}`,
        kind: "register",
        title: reg.title,
        detail: "Not yet filed",
        description: "MITMARK will file this register here once it is ready.",
        opens: "card",
        ref: null,
        filed: false,
      });
    }
  }

  // Policies.
  for (const d of items("policies")) {
    if (area !== 4 && d.area !== area) continue;
    used.add(d.id);
    tiles.push(tileOfDocument(d, "policy", policyDetail(d)));
  }

  // Other filed items against this module: further registers, procedures and
  // templates, then links last.
  const rest = [...trackers, ...items("procedures")].filter(
    (d) => d.area === area && d.published && !used.has(d.id) && !d.id.startsWith("tracker-unfiled:") && doc.documents.some((r) => r.id === d.id && isLiveDocument(r)),
  );
  for (const d of rest.filter((d) => d.kind !== "link")) {
    tiles.push(tileOfDocument(d, "file", statusWord(documentStatusOf(d))));
  }
  for (const d of rest.filter((d) => d.kind === "link")) {
    tiles.push(tileOfDocument(d, "link", "Link"));
  }
  return tiles;
}

// ---------------------------------------------------------------------------
// The compliance journey (FRAGO 06 3.1 item 4)
// ---------------------------------------------------------------------------

export const MAX_MILESTONES = 6;

/**
 * The module's dated tasks as milestones, oldest first, at most six. When
 * there are more, the six shown are the window that keeps the next open one
 * in view with up to two done ones before it. Only the next open milestone
 * can read as overdue; later ones are grey.
 */
export function milestones(doc: OrgDoc, area: number, now: Date = new Date()): Milestone[] {
  const asAt = today(now);
  const dated = doc.tasks
    .filter((t): t is TaskRecord & { dueAt: string } => t.area === area && t.dueAt !== null && t.status !== "not_applicable")
    .sort((a, b) => (a.dueAt < b.dueAt ? -1 : a.dueAt > b.dueAt ? 1 : a.title.localeCompare(b.title)));
  const nextIndex = dated.findIndex(isOpen);
  let start = 0;
  if (dated.length > MAX_MILESTONES) {
    const anchor = nextIndex === -1 ? dated.length : nextIndex;
    start = Math.max(0, Math.min(anchor - 2, dated.length - MAX_MILESTONES));
  }
  return dated.slice(start, start + MAX_MILESTONES).map((t) => {
    const index = dated.indexOf(t);
    const state: Milestone["state"] =
      t.status === "done"
        ? "done"
        : index === nextIndex
          ? t.dueAt < asAt
            ? "overdue"
            : "next"
          : "future";
    return { taskId: t.id, title: t.title, dueAt: t.dueAt, state };
  });
}

// ---------------------------------------------------------------------------
// Counters (FRAGO 06 3.3)
// ---------------------------------------------------------------------------

/** The newest report the operator made for a module, or null. */
export function latestFigures(doc: OrgDoc, area: number): ModuleFiguresRecord | null {
  const of = (doc.figures ?? []).filter((f) => f.area === area);
  return of.length ? of[of.length - 1] : null;
}

function operatorGroups(doc: OrgDoc, area: number): CounterGroup[] {
  const latest = latestFigures(doc, area);
  return (MODULE_FIGURES[area] ?? []).map((g) => {
    const values = latest?.groups[g.key] ?? {};
    const items = g.items.map((i) => ({
      key: i.key,
      label: i.label,
      value: typeof values[i.key] === "number" ? (values[i.key] as number) : null,
    }));
    const noData = items.every((i) => i.value === null);
    return {
      key: g.key,
      label: g.label,
      source: "operator" as const,
      basis:
        noData || !latest
          ? "Reported by MITMARK in the monthly figures. Nothing reported yet."
          : `Reported by MITMARK on ${formatDate(latest.enteredAt.slice(0, 10))}.`,
      noData,
      items,
    };
  });
}

/**
 * Data requests (module 6) and reported concerns (module 8) are already held
 * as intakes with statutory clocks, so they are counted, not reported.
 */
function recordGroup(doc: OrgDoc, area: 6 | 8, now: Date): CounterGroup {
  const asAt = today(now);
  const kind = area === 6 ? "sar_1_month" : "breach_72h";
  const clocks = doc.clocks.filter((c) => c.kind === kind && !c.test);
  const pendingIntakes = new Set(
    doc.review.filter((r) => r.type === "intake" && r.state === "pending" && !r.test).map((r) => r.refId),
  );
  const open = clocks.filter((c) => !c.closedAt);
  const waiting = open.filter((c) => c.intakeId !== null && pendingIntakes.has(c.intakeId));
  const picked = open.filter((c) => !waiting.includes(c));
  const pastDate = picked.filter((c) => c.dueAt.slice(0, 10) < asAt);
  const closed = clocks.length - open.length;
  const total = clocks.length;

  const items =
    area === 6
      ? [
          { key: "total", label: "Total", value: total },
          { key: "not_picked_up", label: "Not yet picked up", value: waiting.length },
          { key: "in_progress", label: "In progress", value: picked.length - pastDate.length },
          { key: "blocked", label: "Blocked, past the statutory month", value: pastDate.length },
          { key: "addressed", label: "Addressed", value: closed },
        ]
      : [
          { key: "total", label: "Total", value: total },
          { key: "open", label: "Open, not yet assessed", value: waiting.length },
          { key: "in_progress", label: "In progress", value: picked.length },
          { key: "closed", label: "Closed", value: closed },
        ];

  return {
    key: area === 6 ? "requests" : "concerns",
    label: area === 6 ? "Data subject requests" : "Concerns reported through the product",
    source: "records",
    basis: `From the request log, as at ${formatDate(asAt)}.`,
    noData: total === 0,
    items,
  };
}

export function counters(doc: OrgDoc, area: number, now: Date = new Date()): CounterGroup[] {
  if (area === 5 || area === 7) return operatorGroups(doc, area);
  if (area === 6) return [recordGroup(doc, 6, now)];
  if (area === 8) return [recordGroup(doc, 8, now), ...operatorGroups(doc, 8)];
  return [];
}

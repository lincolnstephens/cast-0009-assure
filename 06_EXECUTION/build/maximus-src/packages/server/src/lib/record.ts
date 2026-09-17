/**
 * The Record and the CFO statement.
 *
 * This replaces the prior build's value snapshot, which counted activity rather
 * than stating value. Every figure here derives from a Record entry with a named
 * reviewer: no claim without a record.
 */

import { LINES, lineOf, priority } from "@maximus/shared";
import type {
  LineTotal,
  RecordTotals,
  ServiceLineView,
  StatementResponse,
} from "@maximus/shared";
import type { EntryRecord, OrgDoc, OrgSettings } from "../db/model.ts";

/** 2026-09-12 becomes 2026 Q3. */
export function quarterOf(date: string): string {
  const [y, m] = date.split("-").map(Number);
  return `${y} Q${Math.floor((m - 1) / 3) + 1}`;
}

export function periodsOf(entries: EntryRecord[]): string[] {
  return [...new Set(entries.map((e) => quarterOf(e.date)))].sort().reverse();
}

/** The two comparators for one entry. A contractor day is eight hours. */
export function costs(e: EntryRecord, s: OrgSettings): { io: number; con: number } {
  return {
    io: e.hours * (Number(s.ioRate) || 0),
    con: (e.hours / 8) * (Number(s.dayRate) || 0),
  };
}

/**
 * The entries the client portal and the statement may use: reviewed, and
 * non-illustrative unless the operator has switched on "show illustrative" for
 * a demo, in which case the banner shows.
 */
export function clientVisible(doc: OrgDoc): EntryRecord[] {
  return doc.entries.filter(
    (e) => e.reviewed && (doc.settings.showIllustrative || !e.ill),
  );
}

export interface EntryFilter {
  period?: string;
  line?: number;
}

/** Newest first. */
export function applyFilter(entries: EntryRecord[], f: EntryFilter): EntryRecord[] {
  return entries
    .filter((e) => (f.period ? quarterOf(e.date) === f.period : true))
    .filter((e) => (f.line ? e.line === f.line : true))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function totalsOf(rows: EntryRecord[], s: OrgSettings): RecordTotals {
  const byLine: LineTotal[] = LINES.map((line) => {
    const of = rows.filter((e) => e.line === line.id);
    return {
      line: line.id,
      name: line.name,
      short: line.short,
      items: of.length,
      hours: of.reduce((a, e) => a + Number(e.hours), 0),
    };
  }).filter((x) => x.items > 0);

  return {
    items: rows.length,
    hours: rows.reduce((a, e) => a + Number(e.hours), 0),
    io: rows.reduce((a, e) => a + costs(e, s).io, 0),
    con: rows.reduce((a, e) => a + costs(e, s).con, 0),
    deadlinesMet: rows.filter((e) => e.deadline !== "").length,
    byLine,
    anyIllustrative: rows.some((e) => e.ill),
  };
}

/** The twelve lines in priority order, with this tenant's status and counts. */
export function serviceLineViews(doc: OrgDoc): ServiceLineView[] {
  const status = doc.settings.lineStatus;
  return priority(status).map((l) => ({
    id: l.id,
    name: l.name,
    short: l.short,
    hoursPer: l.hoursPer,
    deadline: l.deadline,
    why: l.why,
    status: status[String(l.id)] ?? "Available",
    onRecord: doc.entries.filter((e) => e.line === l.id).length,
  }));
}

/** Distinct calendar months the rows cover, at least one. A quarter is three. */
export function monthsCovered(rows: EntryRecord[], period: string): number {
  if (period && period !== "all periods") return 3;
  return Math.max(1, new Set(rows.map((e) => e.date.slice(0, 7))).size);
}

/**
 * The statement's model. A ratio against the retainer is shown only when the
 * fee has been entered; otherwise the statement says why there is none.
 */
export function statementOf(
  rows: EntryRecord[],
  s: OrgSettings,
  period: string,
  now: Date = new Date(),
): StatementResponse {
  const totals = totalsOf(rows, s);
  const months = monthsCovered(rows, period);
  const fee =
    s.retainer === "" || s.retainer === null || s.retainer === undefined
      ? null
      : Number(s.retainer) * months;

  return {
    period: period || "all periods",
    clientName: s.clientName,
    ioName: s.ioName,
    lead: s.lead,
    ioRate: Number(s.ioRate) || 0,
    dayRate: Number(s.dayRate) || 0,
    months,
    totals,
    deadlines: rows.filter((e) => e.deadline !== ""),
    fee,
    conRatio: fee ? totals.con / fee : null,
    ioRatio: fee ? totals.io / fee : null,
    generated: now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    illustrative: totals.anyIllustrative,
  };
}

export { lineOf };

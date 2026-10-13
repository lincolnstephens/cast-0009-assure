/**
 * The Record and the CFO statement.
 *
 * This replaces the prior build's value snapshot, which counted activity rather
 * than stating value. Every figure here derives from a Record entry with a named
 * reviewer: no claim without a record.
 */

import { AREA_IDS, DEFAULT_MODULE_INTRODUCTIONS, areaName } from "@maximus/shared";
import type { ModuleTotal, ModuleView, RecordTotals, StatementResponse } from "@maximus/shared";
import type { EntryRecord, OrgDoc, OrgSettings } from "../db/model.ts";
import { isOpen, ownerLabel } from "./tracker.ts";

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
  /** v1.7. A module, 1 to 8. */
  area?: number;
}

/** An entry as the client reads it: the archive line it migrated from stays on the operator's side. */
export function forClient(e: EntryRecord): Omit<EntryRecord, "line"> {
  const { line: _line, ...rest } = e;
  void _line;
  return rest;
}

/** Newest first. */
export function applyFilter(entries: EntryRecord[], f: EntryFilter): EntryRecord[] {
  return entries
    .filter((e) => (f.period ? quarterOf(e.date) === f.period : true))
    .filter((e) => (f.area ? e.area === f.area : true))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function totalsOf(rows: EntryRecord[], s: OrgSettings): RecordTotals {
  const byModule: ModuleTotal[] = AREA_IDS.map((area) => {
    const of = rows.filter((e) => e.area === area);
    return {
      area,
      name: areaName(area),
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
    byModule,
    anyIllustrative: rows.some((e) => e.ill),
  };
}

/** The module's one line: the operator's introduction, else the default. */
export function moduleIntroduction(doc: OrgDoc, area: number): string {
  return doc.settings.moduleIntroductions?.[String(area)]?.trim() || DEFAULT_MODULE_INTRODUCTIONS[area] || "";
}

/** v1.7. The eight modules in module order, with this tenant's status and counts on the Record. */
export function moduleViews(doc: OrgDoc): ModuleView[] {
  const status = doc.settings.moduleStatus ?? {};
  return AREA_IDS.map((area) => ({
    id: area,
    name: areaName(area),
    introduction: moduleIntroduction(doc, area),
    status: status[String(area)] ?? "Available",
    onRecord: doc.entries.filter((e) => e.area === area).length,
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
/** The Statement's outlook: the service, and what comes next. Everything but the Record entries. */
export interface StatementOutlook {
  service: StatementResponse["service"];
  next: StatementResponse["next"];
}

export function statementOf(
  rows: EntryRecord[],
  s: OrgSettings,
  period: string,
  now: Date = new Date(),
  outlook: StatementOutlook = { service: [], next: [] },
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
    service: outlook.service,
    items: rows.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)),
    next: outlook.next,
  };
}

/**
 * The Statement's first and third parts (FRAGO 06 3.5, FRAGO 07 3.4). The
 * service is the eight modules in module order, each with its status from
 * Settings and its one line. What comes next is the workplan's open dated
 * tasks, soonest first, as the operator loaded them; it is stated as at
 * today, not scoped to the period.
 */
export function statementOutlook(doc: OrgDoc): StatementOutlook {
  const service = moduleViews(doc).map((m) => ({
    id: m.id,
    name: m.name,
    status: m.status,
    introduction: m.introduction,
  }));
  const next = doc.tasks
    .filter((t): t is typeof t & { dueAt: string } => isOpen(t) && t.dueAt !== null)
    .sort((a, b) => (a.dueAt < b.dueAt ? -1 : a.dueAt > b.dueAt ? 1 : 0))
    .map((t) => ({ id: t.id, title: t.title, areaName: areaName(t.area), owner: ownerLabel(t), dueAt: t.dueAt }));
  return { service, next };
}


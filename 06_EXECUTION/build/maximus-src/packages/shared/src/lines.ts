import type { LineStatus } from "./record.ts";

/** One of the twelve vDPO service lines. Reference data, not tenant data. */
export interface ServiceLine {
  id: number;
  name: string;
  short: string;
  /** Default estimate of the officer's own hours one instance would take her. */
  hoursPer: number;
  /** True when the line carries a statutory or governance clock. */
  deadline: boolean;
  why: string;
}

/**
 * The twelve vDPO service lines, from the baseline knowledge base.
 * hoursPer is MITMARK's default estimate of the officer's own hours per instance.
 * It is an assumption until the Information Officer gives her own figure.
 */
export const LINES: ServiceLine[] = [
  {
    id: 1,
    name: 'DPIAs',
    short: 'DPIA',
    hoursPer: 16,
    deadline: false,
    why: 'A DPIA is the single largest block of specialist hours a part-time officer faces; it is also the item an auditor asks for first.',
  },
  {
    id: 2,
    name: 'ROPA management',
    short: 'ROPA',
    hoursPer: 8,
    deadline: false,
    why: 'The ROPA is the evidence base for everything else. Keeping it current is slow, unglamorous work that is easy to let slip.',
  },
  {
    id: 3,
    name: 'Policy and procedure suite',
    short: 'Policies',
    hoursPer: 10,
    deadline: false,
    why: 'Six documents on a review cycle. Each refresh is a day she does not have.',
  },
  {
    id: 4,
    name: 'DSAR support',
    short: 'DSAR',
    hoursPer: 6,
    deadline: true,
    why: 'One-month statutory clock. A missed DSAR is an ICO complaint and a reputational cost.',
  },
  {
    id: 5,
    name: 'Breach advisory',
    short: 'Breach',
    hoursPer: 8,
    deadline: true,
    why: '72-hour ICO clock. The judgement call on notification is the one she least wants to make alone.',
  },
  {
    id: 6,
    name: 'Vendor due diligence and DPAs',
    short: 'Vendors',
    hoursPer: 5,
    deadline: true,
    why: 'Every new supplier is a contract question she cannot park; the DPA has to exist before go-live.',
  },
  {
    id: 7,
    name: 'Staff training',
    short: 'Training',
    hoursPer: 6,
    deadline: false,
    why: 'Annual obligation. Building and delivering it herself costs more than the session.',
  },
  {
    id: 8,
    name: 'Monthly threat intelligence report',
    short: 'Monthly report',
    hoursPer: 4,
    deadline: false,
    why: 'The vCISO half of the retainer made visible each month; the item the CFO sees most often.',
  },
  {
    id: 9,
    name: 'Board briefing',
    short: 'Board',
    hoursPer: 8,
    deadline: true,
    why: 'Quarterly. This is where the CFO forms his view of the service; it should be the best thing MITMARK produces.',
  },
  {
    id: 10,
    name: 'Quarterly log review',
    short: 'Log review',
    hoursPer: 6,
    deadline: false,
    why: 'The work behind the board briefing. Without it the briefing is opinion.',
  },
  {
    id: 11,
    name: 'Annual compliance cycle',
    short: 'Annual cycle',
    hoursPer: 12,
    deadline: true,
    why: 'ISMS, access review, BC/DR/IR test, policy refresh. The audit-facing year.',
  },
  {
    id: 12,
    name: 'Ad hoc assurance and advisory',
    short: 'Advisory',
    hoursPer: 1,
    deadline: false,
    why: 'The questions she would otherwise sit on. Small each, many in total, and the reason the relationship feels present.',
  },
];

export const lineOf = (id: number): ServiceLine | undefined => LINES.find((l) => l.id === id);

export const DEFAULT_LINE_STATUS: Record<string, LineStatus> = {
  '1': 'Available',
  '2': 'Live',
  '3': 'Live',
  '4': 'Live',
  '5': 'Live',
  '6': 'Live',
  '7': 'Available',
  '8': 'Live',
  '9': 'Live',
  '10': 'Live',
  '11': 'Available',
  '12': 'Live',
};

/**
 * Priority order for the twelve lines. Three tests, in this order:
 * the line is already delivered under the retainer; a missed obligation on that
 * line carries a regulatory or financial consequence; the line replaces the most
 * of the officer's own hours per instance.
 */
export function priority(status: Record<string, LineStatus>): ServiceLine[] {
  const rank = (l: ServiceLine): number => {
    const st = status[String(l.id)] || 'Available';
    const live = st === 'Live' ? 0 : st === 'Recommended' ? 1 : st === 'Available' ? 2 : 3;
    return live * 1000 + (l.deadline ? 0 : 100) + (100 - l.hoursPer);
  };
  return LINES.slice().sort((a, b) => rank(a) - rank(b));
}

/**
 * The default hours a Record entry gets when the shell raises it automatically.
 * The admin who closed the work can edit it before it is reviewed.
 */
export function defaultHoursFor(lineId: number): number {
  return lineOf(lineId)?.hoursPer ?? 1;
}

// ---------------------------------------------------------------------------
// v1.7 (FRAGO 07 3.4). The Record speaks in the eight modules.
// ---------------------------------------------------------------------------

/**
 * Where each of the twelve archive lines lands among the eight modules. One
 * line, one module. `home` is true where the module is the line's own work;
 * false where the line has no module of its own and goes to the nearest one.
 * The twelve lines stay here only so entries written before v1.7 can be
 * migrated and audited; no client-facing surface reads them.
 */
export const LINE_MODULE: Record<number, { area: number; home: boolean; why: string }> = {
  1: { area: 5, home: true, why: "DPIAs are module 5." },
  2: { area: 2, home: true, why: "The record of processing is one of the registers module 2 reviews." },
  3: { area: 4, home: true, why: "The policy suite is module 4, policy review." },
  4: { area: 6, home: true, why: "Data requests are module 6." },
  5: { area: 8, home: true, why: "Breach advisory is module 8." },
  6: { area: 7, home: true, why: "Vendor due diligence and DPAs are module 7." },
  7: { area: 4, home: false, why: "Staff training is training on the policies; nearest is policy review." },
  8: { area: 8, home: false, why: "The threat report feeds incident readiness; nearest is breach and incident response." },
  9: { area: 1, home: false, why: "Board reporting is the DPO's duty to report to the highest level; nearest is DPO registration." },
  10: { area: 8, home: false, why: "Log review is how incidents are found; nearest is breach and incident response." },
  11: { area: 4, home: false, why: "The annual cycle centres on the policy refresh; nearest is policy review." },
  12: { area: 1, home: false, why: "Ad hoc advice is the DPO's advisory role; nearest is DPO registration." },
};

/** The module a pre-v1.7 entry's line migrates to. An unknown line goes to module 1. */
export function moduleOfLine(line: number | null | undefined): number {
  return LINE_MODULE[Number(line)]?.area ?? 1;
}

/**
 * Default hours a Record entry gets when the product raises it for a module
 * (a clock closing, a policy approved). The officer's own hours the work
 * replaced; the operator edits it before review.
 */
export const MODULE_DEFAULT_HOURS: Record<number, number> = {
  1: 1,
  2: 8,
  3: 6,
  4: 10,
  5: 16,
  6: 6,
  7: 5,
  8: 8,
};

export function defaultHoursForModule(area: number): number {
  return MODULE_DEFAULT_HOURS[area] ?? 1;
}

/** A new organisation's module status: every module Available, never Live (FRAGO 07 3.6). */
export const DEFAULT_MODULE_STATUS: Record<string, LineStatus> = {
  "1": "Available",
  "2": "Available",
  "3": "Available",
  "4": "Available",
  "5": "Available",
  "6": "Available",
  "7": "Available",
  "8": "Available",
};

const STATUS_RANK: Record<string, number> = { Live: 0, Recommended: 1, Available: 2, "Not in scope": 3 };

/**
 * An organisation that set line statuses before v1.7 keeps its values: each
 * module takes the strongest status among the lines that map to it. A module
 * no line maps to stays Available.
 */
export function moduleStatusFromLines(lineStatus: Record<string, LineStatus> | undefined): Record<string, LineStatus> {
  const out: Record<string, LineStatus> = { ...DEFAULT_MODULE_STATUS };
  if (!lineStatus) return out;
  const best: Record<string, LineStatus> = {};
  for (const [line, status] of Object.entries(lineStatus)) {
    const area = String(moduleOfLine(Number(line)));
    if (!best[area] || (STATUS_RANK[status] ?? 9) < (STATUS_RANK[best[area]] ?? 9)) best[area] = status;
  }
  return { ...out, ...best };
}

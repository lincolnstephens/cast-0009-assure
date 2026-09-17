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

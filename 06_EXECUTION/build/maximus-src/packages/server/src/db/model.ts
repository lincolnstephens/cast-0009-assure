/**
 * Tessera Assure persisted model.
 *
 * The store is a JSON document per organisation in Netlify Blobs, plus one
 * document for users and one blob per generated export. It replaces the Neon
 * Postgres store the prior build used. See DECISIONS.md, DC-08.
 *
 * Multi-tenant from the start: every record carries orgId, and the whole of one
 * tenant's data is one document. A second retained client is a second document,
 * not a second build.
 *
 * No client name, no officer name and no data-subject personal data belongs in
 * any field here. Entries describe the work, not the people.
 */

export type Role = 'client' | 'mitmark_admin';
export type RagStatus = 'green' | 'amber' | 'red';
export type PolicyStatus = 'draft' | 'approved';
export type ChatSender = 'user' | 'guide' | 'officer';
export type EscalationState = 'open' | 'answered' | 'closed';
export type IntakeType = 'sar' | 'breach';
export type IntakeSource = 'chat' | 'manual';
export type ClockKind = 'sar_1_month' | 'breach_72h';
export type AlertState = 'new' | 'triaged' | 'actioned' | 'dismissed';
export type ReviewItemType =
  | 'chat_amber'
  | 'export_request'
  | 'alert'
  | 'intake'
  | 'task_confirmation';
export type ReviewItemState = 'pending' | 'approved' | 'rejected';
export type ExportState = 'requested' | 'approved' | 'generated';

/** ISO 8601 datetime string. Dates are stored as strings so the document is plain JSON. */
export type Iso = string;

export interface UserRecord {
  id: string;
  orgId: string | null;
  email: string;
  passwordHash: string;
  role: Role;
  displayName: string;
  createdAt: Iso;
}

export interface SessionRecord {
  id: string;
  userId: string;
  expiresAt: Iso;
  createdAt: Iso;
}

/** The users document. Sessions live here too; the volume is small. */
export interface UsersDoc {
  users: UserRecord[];
  sessions: SessionRecord[];
}

export const EMPTY_USERS_DOC: UsersDoc = { users: [], sessions: [] };

/** The client portal's accent, set by the operator. Empty means the house tokens. */
export interface Branding {
  /** Hex colour, or empty string for the Tessera tokens. */
  accent: string;
  /** Display name shown in the portal and on the statement. */
  displayName: string;
}

export interface PolicyRecord {
  id: string;
  orgId: string;
  code: string;
  title: string;
  version: number;
  status: PolicyStatus;
  bodyMarkdown: string;
  approvedBy: string | null;
  approvedAt: Iso | null;
  createdAt: Iso;
}

export interface ChatThreadRecord {
  id: string;
  orgId: string;
  userId: string;
  title: string;
  createdAt: Iso;
}

export interface ChatMessageRecord {
  id: string;
  threadId: string;
  sender: ChatSender;
  body: string;
  /** Policy ids and versions the answer drew on. Approved policies only. */
  citations: string[];
  /** True when the Guide declined to answer and raised an escalation. */
  escalated: boolean;
  createdAt: Iso;
}

export interface EscalationRecord {
  id: string;
  orgId: string;
  threadId: string | null;
  question: string;
  state: EscalationState;
  answer: string | null;
  answeredBy: string | null;
  answeredAt: Iso | null;
  createdAt: Iso;
}

export interface IntakeRecord {
  id: string;
  orgId: string;
  type: IntakeType;
  source: IntakeSource;
  /** What was asked, in the raiser's words. Never contains personal data. */
  summary: string;
  raisedBy: string;
  createdAt: Iso;
}

export interface ClockRecord {
  id: string;
  orgId: string;
  intakeId: string | null;
  kind: ClockKind;
  startedAt: Iso;
  dueAt: Iso;
  closedAt: Iso | null;
  closedBy: string | null;
  outcome: string | null;
  /** The Record entry this clock created when it closed. */
  entryId: string | null;
  /** Set when a data request closed: was it answered inside the statutory month. */
  insideStatute: boolean | null;
  /** Set when a reported concern closed: was the ICO notified. Feeds the breach tile. */
  icoNotified: boolean | null;
}

export interface ClockEventRecord {
  id: string;
  clockId: string;
  note: string;
  actorId: string | null;
  createdAt: Iso;
}

export interface PostureDomainRecord {
  id: string;
  orgId: string;
  domain: string;
  label: string;
  rag: RagStatus;
  note: string;
  setBy: string | null;
  setAt: Iso;
}

export interface PostureHistoryRecord {
  id: string;
  orgId: string;
  domain: string;
  /** Monday of the week the reading applies to, YYYY-MM-DD. */
  weekOf: string;
  rag: RagStatus;
}

export interface ExposureAlertRecord {
  id: string;
  orgId: string;
  /** What kind of exposure it is, for example credential_exposure. */
  kind: string;
  severity: string;
  /** One plain line. Never contains a data subject's personal data. */
  summary: string;
  /** Free text the operator adds when triaging. This is the product surface. */
  officerNote: string | null;
  state: AlertState;
  /** Always true in this build. Exposure data is demo data and says so. */
  demo: boolean;
  createdAt: Iso;
}

export interface ReviewItemRecord {
  id: string;
  orgId: string;
  type: ReviewItemType;
  refId: string;
  summary: string;
  state: ReviewItemState;
  decidedBy: string | null;
  decidedAt: Iso | null;
  createdAt: Iso;
}

export interface AuditRecord {
  id: string;
  orgId: string | null;
  actorId: string | null;
  actorName: string;
  action: string;
  detail: string;
  createdAt: Iso;
}

export interface ExportRecord {
  id: string;
  orgId: string;
  requestedBy: string;
  requestedByName: string;
  state: ExportState;
  approvedBy: string | null;
  approvedAt: Iso | null;
  generatedAt: Iso | null;
  /** Policy titles and versions included in the defence file. */
  contents: string[];
  /** Blob key of the generated zip, once generated. */
  blobKey: string | null;
  /** The Record entry this export created when it completed. */
  entryId: string | null;
}

// ---------------------------------------------------------------------------
// The Compliance Tracker
// ---------------------------------------------------------------------------

export type OwnerType = 'mitmark' | 'client';
export type Recurrence = 'once' | 'monthly' | 'quarterly' | 'annual' | 'always-on';
export type TaskStatus =
  | 'not_started'
  | 'in_progress'
  | 'blocked'
  | 'done'
  | 'not_applicable';

/**
 * One obligation in MITMARK's workplan for the client.
 *
 * The six columns the client sees map to: title (What), how (How), owner
 * (Who), dueAt (When), closedAt (Done) and status (Status).
 */
export interface TaskRecord {
  id: string;
  orgId: string;
  /** One of the eight areas, 1 to 8. */
  area: number;
  /** One of the five phases, 1 to 5. */
  phase: number;
  title: string;
  how: string;
  howLink: string | null;
  ownerType: OwnerType;
  /** Empty when MITMARK owns it. */
  ownerRole: string;
  /** YYYY-MM-DD, or null for an always-on duty that has no single date. */
  dueAt: string | null;
  recurrence: Recurrence;
  status: TaskStatus;
  progress: number;
  evidence: string[];
  notes: string;
  /** Library task id, clock id, or "manual". */
  source: string;
  recordEntryId: string | null;
  closedAt: Iso | null;
  /**
   * The client saying a task assigned to them is done. This is not a status
   * change: the operator accepts it from the review queue, and the operator's
   * acceptance is what moves the status.
   */
  clientConfirmedAt: Iso | null;
  clientConfirmedBy: string | null;
  createdBy: string;
  updatedBy: string;
  updatedAt: Iso;
}

/** How MITMARK does the work in an area, for the client to read. */
export interface ProcedureRecord {
  id: string;
  orgId: string | null;
  area: number;
  title: string;
  body: string;
  link: string;
  processMapLink: string;
  publishedAt: Iso | null;
  /** When MITMARK expects to publish. Shown on the waiting card until then. */
  targetDate: string | null;
}

// ---------------------------------------------------------------------------
// The ASSURE value layer
// ---------------------------------------------------------------------------

export type EntrySource = 'manual' | 'clock' | 'policy' | 'guide' | 'export' | 'import';

export type DeadlineLabel =
  | ''
  | 'DSAR one month'
  | 'Breach 72 hours'
  | 'DPA before go-live'
  | 'Board or audit date';

/** One piece of work MITMARK completed under the retainer. */
export interface EntryRecord {
  id: string;
  orgId: string;
  /** YYYY-MM-DD, the date the work completed. */
  date: string;
  /** One of the twelve service lines, 1 to 12. */
  line: number;
  what: string;
  outcome: string;
  /** Estimate of the officer's own hours the work replaced. */
  hours: number;
  deadline: DeadlineLabel;
  /** Named MITMARK reviewer. No claim without a record. */
  reviewer: string;
  /** Illustrative entries show the record's structure; they are not work done. */
  ill: boolean;
  /** Only reviewed entries reach the client portal and the statement. */
  reviewed: boolean;
  source: EntrySource;
  sourceRef: string | null;
  createdAt: Iso;
}

export type LineStatus = 'Live' | 'Available' | 'Recommended' | 'Not in scope';

/** Operator settings. One set per organisation. */
export interface OrgSettings {
  /** Display name for the statement. Never the client's real name in seed data. */
  clientName: string;
  /** Name or role of the Information Officer. A role is enough. */
  ioName: string;
  /** Her loaded hourly rate, pounds. */
  ioRate: number;
  /** Contractor day rate, pounds ex VAT. */
  dayRate: number;
  /** Retainer per month, pounds ex VAT. Empty until entered; no ratio without it. */
  retainer: number | '';
  /** MITMARK contract lead, who signs the statement. */
  lead: string;
  /** Demo switch. Off means illustrative entries never reach the client portal. */
  showIllustrative: boolean;
  /** Service line status by line id, 1 to 12. */
  lineStatus: Record<string, LineStatus>;

  // --- Compliance Tracker -------------------------------------------------
  /** Which regime the workplan is written against. Only UK has content. */
  jurisdiction: 'UK' | 'CH-MC' | 'DIFC' | 'SG' | 'US';
  /** Staff in scope for training. Null until the operator records it. */
  staffInScope: number | null;
  /** Staff who have completed training. Null until the operator records it. */
  staffTrained: number | null;
  /** The roles a task may be assigned to on the client side. */
  clientRoles: string[];
  /** Shown on the empty portal while MITMARK prepares the workplan. */
  workplanTargetDate: string | null;
}

/** Everything belonging to one organisation. One blob, one tenant. */
export interface OrgDoc {
  id: string;
  name: string;
  branding: Branding;
  settings: OrgSettings;
  createdAt: Iso;

  policies: PolicyRecord[];
  threads: ChatThreadRecord[];
  messages: ChatMessageRecord[];
  escalations: EscalationRecord[];
  intakes: IntakeRecord[];
  clocks: ClockRecord[];
  clockEvents: ClockEventRecord[];
  posture: PostureDomainRecord[];
  postureHistory: PostureHistoryRecord[];
  alerts: ExposureAlertRecord[];
  review: ReviewItemRecord[];
  audit: AuditRecord[];
  exports: ExportRecord[];
  entries: EntryRecord[];
  tasks: TaskRecord[];
  procedures: ProcedureRecord[];
}

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

export const DEFAULT_SETTINGS: OrgSettings = {
  clientName: 'Demo Organisation',
  ioName: 'Information Officer',
  ioRate: 45,
  dayRate: 650,
  retainer: '',
  lead: '',
  showIllustrative: true,
  lineStatus: { ...DEFAULT_LINE_STATUS },
  jurisdiction: 'UK',
  staffInScope: null,
  staffTrained: null,
  clientRoles: [
    'Information Officer',
    'HR',
    'IT',
    'Finance',
    'Facilities',
    'Board',
  ],
  workplanTargetDate: null,
};

export function emptyOrgDoc(id: string, name: string): OrgDoc {
  return {
    id,
    name,
    branding: { accent: '', displayName: name },
    settings: { ...DEFAULT_SETTINGS, clientName: name, lineStatus: { ...DEFAULT_LINE_STATUS } },
    createdAt: new Date().toISOString(),
    policies: [],
    threads: [],
    messages: [],
    escalations: [],
    intakes: [],
    clocks: [],
    clockEvents: [],
    posture: [],
    postureHistory: [],
    alerts: [],
    review: [],
    audit: [],
    exports: [],
    entries: [],
    tasks: [],
    procedures: [],
  };
}

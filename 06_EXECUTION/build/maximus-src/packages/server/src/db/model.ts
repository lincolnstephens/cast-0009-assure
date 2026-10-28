import type { CoverageEntry } from '@maximus/shared';

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
  | 'task_confirmation'
  | 'document_submission';
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
  /** v1.5. A disabled user cannot sign in and every session is refused. Never deleted. */
  disabled?: boolean;
  /** v1.5. Set on create and on reset; cleared when the user sets their own password. */
  mustChangePassword?: boolean;
  lastSignInAt?: Iso | null;
  /**
   * v1.5. Sessions carry the epoch they were created under. Bumping it ends
   * every session made before, without having to find them: sessions are one
   * blob each and are not indexed by user.
   */
  sessionEpoch?: number;
  /**
   * v1.7 (FRAGO 07 3.3). A client user the operator uses to try the client's
   * flows. One per organisation. Its writes are tagged test and kept out of
   * the Record, the counters and the Statement. The flag is never removed; a
   * test seat is disabled, not converted.
   */
  testSeat?: boolean;
}

export interface SessionRecord {
  id: string;
  userId: string;
  expiresAt: Iso;
  createdAt: Iso;
  /** The user's sessionEpoch when this session was created. Absent means 0. */
  epoch?: number;
}

/** The users document. Sessions live here too; the volume is small. */
export interface UsersDoc {
  users: UserRecord[];
  sessions: SessionRecord[];
  /**
   * v1.5. Manager-level actions (users, organisations) that belong to no one
   * organisation. An action on a client user is also written to that
   * organisation's own audit. Never a password, never an email in the detail.
   */
  audit?: AuditRecord[];
}

export const EMPTY_USERS_DOC: UsersDoc = { users: [], sessions: [] };

/** The client portal's accent, set by the operator. Empty means the house tokens. */
export interface Branding {
  /** Hex colour, or empty string for the Tessera tokens. */
  accent: string;
  /** Display name shown in the portal and on the statement. */
  displayName: string;
  /**
   * v1.8 (FRAGO 08 3.2). The client's own logo, uploaded by the operator.
   * The bytes sit in the store beside the organisation (brandingLogoKey) and
   * are served only through the API to that organisation's sessions. Absent
   * means the portal shows the display name as text.
   */
  logo?: BrandingLogo;
}

export interface BrandingLogo {
  contentType: 'image/png' | 'image/svg+xml';
  sizeBytes: number;
  /** Bumped on every upload, so the portal never shows a replaced logo from cache. */
  version: number;
  updatedAt: Iso;
  updatedBy: string;
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
  /** v1.7. The thread belongs to a test seat. */
  test?: boolean;
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
  /**
   * v1.7. How a Guide reply was made: "answer" when the model composed it
   * from the retrieved passages, "passages" when no model key is set and the
   * passages are shown as they are. Absent on replies before v1.7.
   */
  mode?: 'answer' | 'passages';
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
  /** v1.7. Raised by a test seat: answering it books nothing on the Record. */
  test?: boolean;
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
  /** v1.7. Raised by a test seat. */
  test?: boolean;
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
  /** v1.7. Started by a test seat: never counted, never booked on the Record. */
  test?: boolean;
  /**
   * v1.9 (FRAGO 09 3.1). MITMARK's note to the client when the request was
   * approved or rejected in the review queue, and when. Shown to the client
   * as "MITMARK: {note}"; never repeated in the audit.
   */
  decisionNote?: string;
  decisionNoteAt?: Iso;
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
  /** v1.7. Raised by a test seat; deciding it changes nothing real. */
  test?: boolean;
  /** v1.9 (FRAGO 09 3.1). The note given with the decision, when there was one. */
  decisionNote?: string;
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
  /**
   * v1.9 (FRAGO 09 3.1). MITMARK's note on the client's confirmation, given
   * when it was accepted or reopened, and when. The latest note stands.
   */
  confirmationNote?: string;
  confirmationNoteAt?: Iso;
  createdBy: string;
  updatedBy: string;
  updatedAt: Iso;
}

/**
 * One item in the Compliance Documents repository. The client reads and
 * downloads; only the operator puts anything in. A file lives in the store
 * under `blobKey`; anything too large to hold is kept as a link instead.
 */
export interface DocumentRecord {
  id: string;
  orgId: string;
  section: 'policies' | 'procedures' | 'trackers';
  /** The module it belongs to, or null when it spans all of them. */
  area: number | null;
  title: string;
  /** A version for a policy, an as-at date for a register. Either may be empty. */
  version: string;
  asAt: string;
  owner: string;
  kind: 'file' | 'link' | 'policy';
  blobKey: string | null;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  published: boolean;
  updatedAt: Iso;
  updatedBy: string;
  /** v1.5. One plain line about the state of the document ("Template with one row. Not yet populated."). */
  description?: string;
  /**
   * v1.6. Approved, draft, published or template, as the seed manifest states
   * it. Absent on documents filed before v1.6; the module page then reads the
   * state from the title and description (see lib/modulePage.ts).
   */
  status?: 'approved' | 'draft' | 'published' | 'template' | '';
  /**
   * v1.7 (FRAGO 07 3.1). Present only on a document the client submitted.
   * Until the operator accepts it, it is not published and not counted
   * anywhere; `published` stays false. Returned items keep their reason.
   */
  submission?: DocumentSubmission;
  /** v1.7. The earlier document this one supersedes, when it is a new version. */
  supersedes?: string | null;
  /** v1.7. Set on the earlier document once a newer version is accepted. History is kept. */
  supersededBy?: string | null;
  /**
   * v1.7 (FRAGO 07 3.5). Whether Quick questions can read the file: "yes"
   * once its text is extracted, "no" when extraction failed (shown on the
   * admin side only), absent for a link, which is never read.
   */
  searchable?: 'yes' | 'no';
  /** Why extraction failed, for the operator. Never shown to the client. */
  searchNote?: string;
  /** v1.7. Uploaded by a test seat. */
  test?: boolean;
  /**
   * v1.9 (FRAGO 09 3.2). The client's Category on a submission. The module
   * (`area`) is left unset by the client and set by the operator on acceptance.
   */
  category?: 'policy' | 'procedure' | 'tracker';
}

export type SubmissionState = 'submitted' | 'returned' | 'accepted';

export interface DocumentSubmission {
  state: SubmissionState;
  submittedById: string;
  submittedByName: string;
  submittedAt: Iso;
  /** The client's one line of what it is. */
  note: string;
  decidedById: string | null;
  decidedByName: string | null;
  decidedAt: Iso | null;
  /** The operator's one-line reason, shown to the client, when returned. */
  returnReason: string;
}

/**
 * v1.6 (FRAGO 06 3.3). Counts the operator reports for one module, for what
 * the product does not yet hold as records. Append-only: the newest per
 * module is shown. Who entered it stays on the operator's side; the client
 * sees "Reported by MITMARK on {date}".
 */
export interface ModuleFiguresRecord {
  id: string;
  area: number;
  /** Group key to count key to value; null means not reported. */
  groups: Record<string, Record<string, number | null>>;
  enteredById: string;
  enteredByName: string;
  enteredAt: Iso;
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
  /** v1.7. The module the work belongs to, 1 to 8. */
  area: number;
  /** Before v1.7, one of the twelve archive lines. Kept for history only. */
  line?: number | null;
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
  /** Before v1.7, service line status by line id, 1 to 12. Kept for history; no surface reads it. */
  lineStatus?: Record<string, LineStatus>;
  /** v1.7. Module status by module id, "1" to "8". Available for a new organisation, never Live. */
  moduleStatus: Record<string, LineStatus>;

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
  /**
   * How the overall figure counts always-on duties. The client always sees
   * "overdue"; "cycle" is the operator's stricter view, set here and shown
   * only in admin.
   */
  denominatorMode: 'overdue' | 'cycle';
  /** When MITMARK expects to publish the first documents in each section. */
  documentsTargetDate: string | null;
  /** v1.5. The regulation line on the client's tracker. Empty means the jurisdiction's default. */
  regulationLabel?: string;
  /** v1.5. When the seed command last ran against this organisation. */
  seededAt?: string | null;
  /** The journey's current stage, 1 to 5. Null means work it out from the tasks. */
  journeyPhase: number | null;
  /** The sentence beneath the journey stage. Empty means the default. */
  journeyNote: string;
  /** Per-module introductions keyed "1" to "8". Empty means the default. */
  moduleIntroductions: Record<string, string>;
  /**
   * v1.6 (FRAGO 06 3.2). Retention schedules keyed by module ("3"): category
   * and period, set by the operator in Settings or by the seed. Empty means
   * none recorded.
   */
  retentionSchedule?: Record<string, { category: string; period: string }[]>;
  /**
   * v1.10 (FRAGO 11 3.3). The organisation's jurisdictions, for the Global
   * coverage tile and module 1's registrations table. Absent or empty means
   * neither appears. Changed only through PUT /admin/jurisdictions.
   */
  jurisdictions?: CoverageEntry[];
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
  documents: DocumentRecord[];
  /** v1.6. Operator-reported counts per module, newest last. */
  figures?: ModuleFiguresRecord[];
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

/** v1.7 (FRAGO 07 3.6). Every module Available for a new organisation. */
export const DEFAULT_MODULE_STATUS: Record<string, LineStatus> = {
  '1': 'Available',
  '2': 'Available',
  '3': 'Available',
  '4': 'Available',
  '5': 'Available',
  '6': 'Available',
  '7': 'Available',
  '8': 'Available',
};

export const DEFAULT_SETTINGS: OrgSettings = {
  clientName: 'Demo Organisation',
  ioName: 'Information Officer',
  ioRate: 45,
  dayRate: 650,
  retainer: '',
  lead: '',
  showIllustrative: true,
  moduleStatus: { ...DEFAULT_MODULE_STATUS },
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
  denominatorMode: 'overdue',
  documentsTargetDate: null,
  journeyPhase: null,
  journeyNote: '',
  moduleIntroductions: {},
  retentionSchedule: {},
  jurisdictions: [],
};

export function emptyOrgDoc(id: string, name: string): OrgDoc {
  return {
    id,
    name,
    branding: { accent: '', displayName: name },
    settings: { ...DEFAULT_SETTINGS, clientName: name, moduleStatus: { ...DEFAULT_MODULE_STATUS } },
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
    documents: [],
    figures: [],
  };
}

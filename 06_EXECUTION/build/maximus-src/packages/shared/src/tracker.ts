import { z } from "zod";
import { coverageEntrySchema } from "./coverage.ts";

/**
 * The Compliance Tracker.
 *
 * Every figure the client sees carries its basis and its as-at date. There is
 * no third state between a figure with a basis and a stated absence: where
 * there is nothing to count, the tile says so and names the basis it will use.
 *
 * The workplan is MITMARK's workplan for the client. The operator owns it. A
 * task whose owner is a client role is shown to the client as something to do,
 * with a due date and a one-line ask; the client confirms it and may attach a
 * file. The client never creates, edits, reprioritises or closes a task.
 */

// ---------------------------------------------------------------------------
// The eight areas and the five phases
// ---------------------------------------------------------------------------

/**
 * The eight modules, titled as MITMARK's operator names them.
 *
 * The ids are stable. Two modules were re-scoped at v1.2: module 2 became the
 * review of the trackers the client keeps, and module 4 became policy review,
 * with the old cross-border work moved into modules 2 and 7 where it belongs.
 * Nothing was deleted; existing tasks were moved by id.
 *
 * v1.3 renamed modules 2, 3 and 8 in the operator's words. Tasks and documents
 * carry the id, never the name, so a rename here is the whole migration.
 */
export const AREAS = [
  { id: 1, name: "DPO registration" },
  { id: 2, name: "Data tracker compliance" },
  { id: 3, name: "Data retention practice" },
  { id: 4, name: "Policy review" },
  { id: 5, name: "Data protection impact assessment" },
  { id: 6, name: "Data subject requests" },
  { id: 7, name: "Vendor data risk" },
  { id: 8, name: "Data breach and incident response" },
] as const;

/**
 * What each module covers, in one or two plain sentences. Shown at the top of
 * the module page until the operator writes her own in Settings.
 */
export const DEFAULT_MODULE_INTRODUCTIONS: Record<number, string> = {
  1: "Registration with the Information Commissioner's Office and the appointment of a data protection officer, kept current each year.",
  2: "The registers the organisation keeps about its data: the record of processing, employee access and international transfers, reviewed so they stay accurate.",
  3: "How long each kind of data is kept and how it is deleted when that time is up, checked against the retention schedule.",
  4: "The data protection policies and the privacy notice, reviewed one at a time and reissued when anything changes.",
  5: "Impact assessments for processing that is likely to carry high risk to people, carried out before the processing starts.",
  6: "Requests from people exercising their rights over their data, answered inside the statutory month.",
  7: "The suppliers that handle the organisation's data, assessed before they start and reviewed while they work.",
  8: "Suspected breaches, recorded and assessed within 72 hours, and reported to the ICO where the law requires it.",
};

export const DEFAULT_JOURNEY_NOTE =
  "This shows where the organisation is on its data protection journey. The stage reflects the year's deliverables and is adjusted as they are met.";

export type AreaId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export const AREA_IDS: AreaId[] = [1, 2, 3, 4, 5, 6, 7, 8];
export const areaName = (id: number): string =>
  AREAS.find((a) => a.id === id)?.name ?? "Unknown area";

export const PHASES = [
  { id: 1, name: "Assessment and discovery" },
  { id: 2, name: "Planning and strategy" },
  { id: 3, name: "Implementation" },
  { id: 4, name: "Ongoing monitoring" },
  { id: 5, name: "Reporting and review" },
] as const;

export type PhaseId = 1 | 2 | 3 | 4 | 5;
export const PHASE_IDS: PhaseId[] = [1, 2, 3, 4, 5];
export const phaseName = (id: number): string =>
  PHASES.find((p) => p.id === id)?.name ?? "Unknown phase";

// ---------------------------------------------------------------------------
// Task vocabulary
// ---------------------------------------------------------------------------

export const ownerTypeSchema = z.enum(["mitmark", "client"]);
export type OwnerType = z.infer<typeof ownerTypeSchema>;

/** The client roles an operator may assign a task to. Editable in settings. */
export const DEFAULT_CLIENT_ROLES = [
  "Information Officer",
  "HR",
  "IT",
  "Finance",
  "Facilities",
  "Board",
];

export const recurrenceSchema = z.enum([
  "once",
  "monthly",
  "quarterly",
  "annual",
  "always-on",
]);
export type Recurrence = z.infer<typeof recurrenceSchema>;

export const taskStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "blocked",
  "done",
  "not_applicable",
]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

/** The label shown beside every status. RAG is never colour alone. */
export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
  not_applicable: "Not applicable",
};

export const ragSchema = z.enum(["green", "amber", "red", "grey"]);
export type Rag = z.infer<typeof ragSchema>;

/** Every mark carries this label. Colour alone never carries meaning. */
export const RAG_LABEL: Record<Rag, string> = {
  green: "On track",
  amber: "Due soon",
  red: "Overdue or blocked",
  grey: "Nothing to do",
};

export const jurisdictionSchema = z.enum(["UK", "CH-MC", "DIFC", "SG", "US"]);
export type Jurisdiction = z.infer<typeof jurisdictionSchema>;

export const JURISDICTION_LABEL: Record<Jurisdiction, string> = {
  UK: "United Kingdom",
  "CH-MC": "Switzerland and Monaco",
  DIFC: "Dubai International Financial Centre",
  SG: "Singapore",
  US: "United States",
};

/** Only the United Kingdom has a task library and obligation text in this version. */
export const JURISDICTION_REGULATION: Record<Jurisdiction, string> = {
  UK: "UK GDPR and the Data Protection Act 2018",
  "CH-MC": "Not yet covered",
  DIFC: "Not yet covered",
  SG: "Not yet covered",
  US: "Not yet covered",
};

// ---------------------------------------------------------------------------
// v1.6: the module score, the module page's tiles, milestones and counters
// ---------------------------------------------------------------------------

/**
 * One module's compliance score (FRAGO 06 3.6). Dated obligations met on time
 * over dated obligations due in the cycle; a late completion earns part credit.
 * `pct` is null when the module has no dated obligation in the cycle, and the
 * sentence then says so instead of showing a number.
 */
export const moduleScoreSchema = z.object({
  pct: z.number().int().nullable(),
  /** Obligations met on or before their date. */
  onTime: z.number().int(),
  /** Obligations met after their date (part credit). */
  late: z.number().int(),
  /** Dated obligations counted. */
  m: z.number().int(),
  rag: ragSchema,
  label: z.string(),
  /** "83% (2 of 3 on time, 1 late)", or "No dated obligations yet". */
  sentence: z.string(),
  basis: z.string(),
});
export type ModuleScore = z.infer<typeof moduleScoreSchema>;

/** The words beside a score's colour. Colour never carries the meaning alone. */
export const SCORE_LABEL: Record<Rag, string> = {
  green: "On time",
  amber: "Partly on time",
  red: "Behind",
  grey: "Nothing dated yet",
};

export const SCORE_GREEN_AT = 90;
export const SCORE_AMBER_AT = 60;

export const overallScoreSchema = z.object({
  /** Mean of the module scores that have a dated obligation; null when none has. */
  pct: z.number().int().nullable(),
  /** Modules scoring green. */
  green: z.number().int(),
  /** Modules with at least one dated obligation, i.e. the ones in the mean. */
  counted: z.number().int(),
  /** "Compliance score: 87% (5 of 8 modules green)" */
  sentence: z.string(),
  basis: z.string(),
});
export type OverallScore = z.infer<typeof overallScoreSchema>;

/**
 * One tile on a module page's Useful links. Every tile opens something: a
 * file, a policy, a link, a register's "Not yet filed" card, or a retention
 * category's card.
 */
export const moduleTileKindSchema = z.enum(["register", "policy", "file", "link", "retention"]);
export type ModuleTileKind = z.infer<typeof moduleTileKindSchema>;

export const moduleTileSchema = z.object({
  id: z.string(),
  kind: moduleTileKindSchema,
  title: z.string(),
  /** Version and status for a policy, period for a retention category, "Not yet filed" for a missing register. */
  detail: z.string(),
  /** One plain line about the item, when there is one. */
  description: z.string(),
  /** How the tile opens: a document id to download, a policy id for the panel, or a card. */
  opens: z.enum(["download", "policy", "card"]),
  /** The document or policy id the tile opens, or null for a card. */
  ref: z.string().nullable(),
  filed: z.boolean(),
});
export type ModuleTile = z.infer<typeof moduleTileSchema>;

/** One milestone on a module's compliance journey. Only ever a task. */
export const milestoneSchema = z.object({
  taskId: z.string(),
  title: z.string(),
  dueAt: z.string(),
  state: z.enum(["done", "next", "overdue", "future"]),
});
export type Milestone = z.infer<typeof milestoneSchema>;

/** One counter group on modules 5 to 8. */
export const counterGroupSchema = z.object({
  key: z.string(),
  label: z.string(),
  source: z.enum(["records", "operator"]),
  /** "From the request log, as at ..." or "Reported by MITMARK on ..." */
  basis: z.string(),
  noData: z.boolean(),
  items: z.array(z.object({ key: z.string(), label: z.string(), value: z.number().int().nullable() })),
});
export type CounterGroup = z.infer<typeof counterGroupSchema>;

/**
 * The counts the operator enters for what the product does not yet hold as
 * records (FRAGO 06 3.3). Keyed by module; each group names its counts. The
 * first count in a group is its total.
 */
export const MODULE_FIGURES: Record<number, { key: string; label: string; items: { key: string; label: string }[] }[]> = {
  5: [
    {
      key: "dpia",
      label: "Data protection impact assessments",
      items: [
        { key: "total", label: "Total" },
        { key: "started", label: "Started" },
        { key: "in_progress", label: "In progress" },
        { key: "completed", label: "Completed" },
      ],
    },
    {
      key: "pra",
      label: "Project risk assessments",
      items: [
        { key: "total", label: "Total" },
        { key: "started", label: "Started" },
        { key: "in_progress", label: "In progress" },
        { key: "completed", label: "Completed" },
      ],
    },
  ],
  7: [
    {
      key: "vendors",
      label: "Vendors",
      items: [
        { key: "total", label: "Total" },
        { key: "severity_low", label: "Low severity" },
        { key: "severity_moderate", label: "Moderate severity" },
        { key: "severity_high", label: "High severity" },
        { key: "compliant", label: "Compliant" },
        { key: "non_compliant", label: "Non-compliant" },
      ],
    },
  ],
  8: [
    {
      key: "incidents",
      label: "Incidents",
      items: [
        { key: "total", label: "Total" },
        { key: "severity_low", label: "Low severity" },
        { key: "severity_moderate", label: "Moderate severity" },
        { key: "severity_high", label: "High severity" },
        { key: "open", label: "Open" },
        { key: "in_progress", label: "In progress" },
        { key: "closed", label: "Closed" },
      ],
    },
  ],
};

/** What the operator sends for one module's figures. Null or absent means not reported. */
export const figuresInputSchema = z.object({
  groups: z.record(
    z.string(),
    z.record(z.string(), z.coerce.number().int().min(0).max(100000).nullable()),
  ),
});
export type FiguresInput = z.infer<typeof figuresInputSchema>;

/** One row of a retention schedule. */
export const retentionRowSchema = z.object({
  category: z.string().trim().min(1).max(160),
  period: z.string().trim().min(1).max(200),
});
export type RetentionRow = z.infer<typeof retentionRowSchema>;

// ---------------------------------------------------------------------------
// Task
// ---------------------------------------------------------------------------

export const taskSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  area: z.number().int().min(1).max(8),
  phase: z.number().int().min(1).max(5),
  /** The "What" column. */
  title: z.string(),
  /** The "How" column, one line. */
  how: z.string(),
  /** Where the How points: a policy section or a procedure. */
  howLink: z.string().nullable(),
  /** The "Who" column. */
  ownerType: ownerTypeSchema,
  ownerRole: z.string(),
  /** The "When" column. YYYY-MM-DD, or null for an always-on duty. */
  dueAt: z.string().nullable(),
  recurrence: recurrenceSchema,
  /** The "Status" column. */
  status: taskStatusSchema,
  progress: z.number().int().min(0).max(100),
  evidence: z.array(z.string()),
  notes: z.string(),
  /** Library task id, clock id, or "manual". */
  source: z.string(),
  recordEntryId: z.string().nullable(),
  /** The "Done" column is closedAt: the date it was actually closed. */
  closedAt: z.string().nullable(),
  /** The client has said this is done. Not a status change; the operator accepts. */
  clientConfirmedAt: z.string().nullable(),
  clientConfirmedBy: z.string().nullable(),
  createdBy: z.string(),
  updatedBy: z.string(),
  updatedAt: z.string(),
});
export type Task = z.infer<typeof taskSchema>;

/** What an operator may send when creating or editing a task. */
export const taskInputSchema = z.object({
  area: z.coerce.number().int().min(1).max(8),
  phase: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(1).max(300),
  how: z.string().trim().max(500).default(""),
  howLink: z.string().trim().max(500).nullable().default(null),
  ownerType: ownerTypeSchema,
  ownerRole: z.string().trim().max(120).default(""),
  dueAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .default(null),
  recurrence: recurrenceSchema,
  status: taskStatusSchema,
  progress: z.coerce.number().int().min(0).max(100).default(0),
  evidence: z.array(z.string().trim().max(500)).default([]),
  notes: z.string().trim().max(2000).default(""),
});
export type TaskInput = z.infer<typeof taskInputSchema>;

/** The client's one action: confirming a task assigned to a client role. */
export const taskConfirmSchema = z.object({
  note: z.string().trim().max(1000).default(""),
  evidence: z.string().trim().max(500).default(""),
});
export type TaskConfirm = z.infer<typeof taskConfirmSchema>;

// ---------------------------------------------------------------------------
// Procedure
// ---------------------------------------------------------------------------

export const procedureSchema = z.object({
  id: z.string(),
  /** Null for a MITMARK library procedure that is not yet tenant specific. */
  orgId: z.string().nullable(),
  area: z.number().int().min(1).max(8),
  title: z.string(),
  body: z.string(),
  link: z.string(),
  processMapLink: z.string(),
  publishedAt: z.string().nullable(),
  /** When MITMARK expects to publish it. Shown on the waiting card. */
  targetDate: z.string().nullable(),
});
export type Procedure = z.infer<typeof procedureSchema>;

export const procedureInputSchema = z.object({
  title: z.string().trim().max(300).default(""),
  body: z.string().trim().max(20000).default(""),
  link: z.string().trim().max(500).default(""),
  processMapLink: z.string().trim().max(500).default(""),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .default(null),
  published: z.boolean().default(false),
});
export type ProcedureInput = z.infer<typeof procedureInputSchema>;

// ---------------------------------------------------------------------------
// The library
// ---------------------------------------------------------------------------

export const libraryTaskSchema = z.object({
  id: z.string(),
  area: z.number().int().min(1).max(8),
  phase: z.number().int().min(1).max(5),
  title: z.string().min(1),
  how: z.string().min(1),
  ownerType: ownerTypeSchema,
  ownerRole: z.string(),
  recurrence: recurrenceSchema,
  /** Record hours booked when the task closes. Client-owned tasks book none. */
  defaultHours: z.number().min(0),
  /** Days after the cycle start that the first instance falls due. */
  defaultOffsetDays: z.number().int().min(0),
  /**
   * True for a library task that must no longer be applied to a fresh
   * workplan, because it has been replaced by other tasks. Its id is kept,
   * never deleted, because existing tasks already created from it still
   * point at this id by `source` and must keep resolving. `expandLibrary`
   * skips a retired task, so a fresh apply produces only its replacements.
   */
  retired: z.boolean().optional(),
});
export type LibraryTask = z.infer<typeof libraryTaskSchema>;

export const applyLibrarySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type ApplyLibrary = z.infer<typeof applyLibrarySchema>;

// ---------------------------------------------------------------------------
// What the client home is made of
// ---------------------------------------------------------------------------

/** A figure that always states where it came from. */
export const figureSchema = z.object({
  /** The headline, already formatted. Never a bare percentage. */
  value: z.string(),
  /** How it was worked out, in one sentence. */
  basis: z.string(),
  /** The period it covers, or an empty string when it is a running total. */
  period: z.string(),
  /** True when there is nothing to count yet. The value then says so. */
  noData: z.boolean(),
});
export type Figure = z.infer<typeof figureSchema>;

export const overallStatusSchema = z.object({
  /** Obligations met. */
  n: z.number().int(),
  /** Obligations due on or before today, plus always-on duties. */
  m: z.number().int(),
  pct: z.number().int(),
  /** "12 of 18 obligations met, 67%, as at 17 September 2026" */
  sentence: z.string(),
  /** "Nothing overdue", or "3 overdue or blocked". */
  standing: z.string(),
  asAt: z.string(),
  basis: z.string(),
  /** Which way the obligations were counted. */
  mode: z.enum(["overdue", "cycle"]),
  byArea: z.array(
    z.object({
      area: z.number().int(),
      name: z.string(),
      rag: ragSchema,
      ragLabel: z.string(),
    }),
  ),
  ragCounts: z.object({
    green: z.number().int(),
    amber: z.number().int(),
    red: z.number().int(),
    grey: z.number().int(),
  }),
  /** v1.6 (FRAGO 06 3.6): the headline. Mean of the module scores, with its fraction of modules green. */
  score: overallScoreSchema,
});
export type OverallStatus = z.infer<typeof overallStatusSchema>;

export const phaseSummarySchema = z.object({
  phase: z.number().int(),
  name: z.string(),
  open: z.number().int(),
  done: z.number().int(),
  rag: ragSchema,
  ragLabel: z.string(),
  /** The phase holding the earliest open due date. */
  current: z.boolean(),
});
export type PhaseSummary = z.infer<typeof phaseSummarySchema>;

export const areaSummarySchema = z.object({
  area: z.number().int(),
  name: z.string(),
  rag: ragSchema,
  ragLabel: z.string(),
  nextTaskTitle: z.string().nullable(),
  nextOwner: z.string().nullable(),
  nextDueAt: z.string().nullable(),
  openCount: z.number().int(),
  doneCount: z.number().int(),
  totalCount: z.number().int(),
  /** v1.6: the module's score; the tile's colour is the score's. */
  score: moduleScoreSchema,
});
export type AreaSummary = z.infer<typeof areaSummarySchema>;

export const forYouTaskSchema = z.object({
  id: z.string(),
  area: z.number().int(),
  areaName: z.string(),
  title: z.string(),
  how: z.string(),
  ownerRole: z.string(),
  dueAt: z.string().nullable(),
  recurrence: recurrenceSchema,
  status: taskStatusSchema,
  statusLabel: z.string(),
  rag: ragSchema,
  ragLabel: z.string(),
  confirmedAt: z.string().nullable(),
});
export type ForYouTask = z.infer<typeof forYouTaskSchema>;

/** One step on the journey path. */
export const journeyNodeSchema = z.object({
  phase: z.number().int(),
  name: z.string(),
  state: z.enum(["done", "current", "future"]),
});
export type JourneyNode = z.infer<typeof journeyNodeSchema>;

export const journeySchema = z.object({
  /** Null when the operator has not set it and no open task carries a date. */
  currentPhase: z.number().int().nullable(),
  currentName: z.string().nullable(),
  /** Whether the operator set the stage or it was worked out from the tasks. */
  source: z.enum(["operator", "derived"]),
  note: z.string(),
  nodes: z.array(journeyNodeSchema),
});
export type Journey = z.infer<typeof journeySchema>;

/** A dated open task, for the Upcoming list. */
export const upcomingItemSchema = z.object({
  id: z.string(),
  area: z.number().int(),
  areaName: z.string(),
  title: z.string(),
  dueAt: z.string(),
});
export type UpcomingItem = z.infer<typeof upcomingItemSchema>;

export const trackerHomeSchema = z.object({
  header: z.object({
    clientName: z.string(),
    title: z.string(),
    jurisdiction: z.string(),
    regulation: z.string(),
    asAt: z.string(),
    asAtBasis: z.string(),
  }),
  /** True when no task has been applied yet. The portal shows one card. */
  empty: z.boolean(),
  emptyMessage: z.string(),
  emptyTargetDate: z.string().nullable(),
  overall: overallStatusSchema,
  phases: z.array(phaseSummarySchema),
  kpis: z.array(figureSchema.extend({ key: z.string(), label: z.string() })),
  areas: z.array(areaSummarySchema),
  forYou: z.array(forYouTaskSchema),
  forYouEmptyMessage: z.string(),
  journey: journeySchema,
  upcoming: z.array(upcomingItemSchema),
  /** v1.10 (FRAGO 11 3.3). The organisation's jurisdictions; empty means no tile. */
  coverage: z.array(coverageEntrySchema).default([]),
});
export type TrackerHome = z.infer<typeof trackerHomeSchema>;


// ---------------------------------------------------------------------------
// The area page
// ---------------------------------------------------------------------------

export const areaPageSchema = z.object({
  area: z.number().int(),
  name: z.string(),
  /** One or two sentences, the operator's or the default. */
  introduction: z.string(),
  /** The Compliance Documents items filed against this module. */
  documents: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      section: z.string(),
      kind: z.string(),
      url: z.string(),
    }),
  ),
  progress: z.object({ done: z.number().int(), total: z.number().int(), pct: z.number().int() }),
  /** Three to five plain sentences. No citations in the body. */
  obligation: z.string(),
  /** The one line at the foot naming the article or section. */
  citation: z.string(),
  status: z.object({
    rag: ragSchema,
    ragLabel: z.string(),
    basis: z.string(),
    asAt: z.string(),
  }),
  tasks: z.array(
    taskSchema.extend({
      rag: ragSchema,
      ragLabel: z.string(),
      statusLabel: z.string(),
      ownerLabel: z.string(),
    }),
  ),
  howWeDoIt: z.object({
    policyTitle: z.string().nullable(),
    policyCode: z.string().nullable(),
    policySection: z.string().nullable(),
    procedure: procedureSchema.nullable(),
    /** True when MITMARK has not published the procedure yet. */
    procedurePending: z.boolean(),
    procedureTargetDate: z.string().nullable(),
  }),
  history: z.array(
    z.object({
      at: z.string(),
      kind: z.enum(["task", "record"]),
      title: z.string(),
      detail: z.string(),
      reviewer: z.string(),
    }),
  ),
  /** v1.6 (FRAGO 06 3.1): Useful links, in the operator's order. */
  tiles: z.array(moduleTileSchema),
  /** v1.6: the compliance status under the 3.6 rule. */
  score: moduleScoreSchema,
  /** v1.6: at most six dated tasks, oldest first. Empty means "No dated milestones yet." */
  milestones: z.array(milestoneSchema),
  /** v1.6: modules 5 to 8 only; empty elsewhere. */
  counters: z.array(counterGroupSchema),
  /** v1.10 (FRAGO 11 3.3): module 1 only, the organisation's jurisdictions; empty elsewhere. */
  registrations: z.array(coverageEntrySchema).default([]),
});
export type AreaPage = z.infer<typeof areaPageSchema>;

/** The six questions, in order, on every task table. Never renamed. */
export const TASK_COLUMNS = ["What", "How", "Who", "When", "Done", "Status"] as const;

// ---------------------------------------------------------------------------
// Compliance Documents
// ---------------------------------------------------------------------------

/**
 * The repository. Three sections, because that is how the operator thinks about
 * them: what we said we would do, how we do it, and the registers that record
 * that we did.
 *
 * The client reads and downloads. Only the operator puts anything in.
 */
export const documentSectionSchema = z.enum(["policies", "procedures", "trackers"]);
export type DocumentSection = z.infer<typeof documentSectionSchema>;

export const DOCUMENT_SECTIONS: { id: DocumentSection; name: string; blurb: string }[] = [
  {
    id: "policies",
    name: "Policies",
    blurb: "What the organisation has committed to. The approved pack, with its version history.",
  },
  {
    id: "procedures",
    name: "Procedures",
    blurb: "How MITMARK does the work in each module, and the process map for it.",
  },
  {
    id: "trackers",
    name: "Trackers",
    blurb:
      "The registers that record what happened: processing activities, employee access, data requests, breaches, vendors and transfers.",
  },
];

export const documentKindSchema = z.enum(["file", "link", "policy"]);
export type DocumentKind = z.infer<typeof documentKindSchema>;

/**
 * The registers the Trackers section expects, so an empty one can still be named.
 *
 * v1.6 (FRAGO 06 3.4): the operator's list and her titles. The old titles stay
 * as aliases, so a register filed under either name still matches. `alsoAreas`
 * puts a register on another module's Useful links as well (her module 2 page
 * shows the vendor log beside the other registers she reviews there).
 */
export const TRACKER_DOCUMENTS: {
  key: string;
  title: string;
  area: number;
  aliases?: string[];
  alsoAreas?: number[];
}[] = [
  { key: "ropa", title: "Record of processing activities", area: 2 },
  // v1.5: the client's own register is called a matrix; it is the same register.
  { key: "access", title: "Employee access tracker", area: 2, aliases: ["Employee access matrix"] },
  {
    key: "transfers",
    title: "Cross-border transfer assessment",
    area: 2,
    aliases: ["International transfers register"],
  },
  { key: "infosec", title: "Information security risk register", area: 2 },
  { key: "vendor", title: "Vendor log", area: 7, aliases: ["Vendor list"], alsoAreas: [2] },
  { key: "dsar", title: "Data request log", area: 6 },
  { key: "breach", title: "Breach register", area: 8, aliases: ["Incident log"] },
];

export const documentSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  section: documentSectionSchema,
  /** The module it belongs to, or null when it spans all of them. */
  area: z.number().int().min(1).max(8).nullable(),
  title: z.string(),
  /** A version for a policy, an as-at date for a register. Either may be empty. */
  version: z.string(),
  asAt: z.string(),
  owner: z.string(),
  kind: documentKindSchema,
  /** Set when the item is a file in the store. */
  blobKey: z.string().nullable(),
  fileName: z.string(),
  contentType: z.string(),
  sizeBytes: z.number().int(),
  /** Set when the item is a link to somewhere else. */
  url: z.string(),
  published: z.boolean(),
  updatedAt: z.string(),
  updatedBy: z.string(),
  /** v1.5. One plain line about the state of the document. */
  description: z.string().default(""),
  /** v1.6. Approved, draft, published or template; empty when not stated. */
  status: z.string().default(""),
});
export type ComplianceDocument = z.infer<typeof documentSchema>;

/**
 * The cap on a stored file. Anything larger is held as a link instead.
 *
 * The order asked for 10 MB. The platform cannot carry it: a function request
 * body is buffered at 6 MB, and a file travels as base64, which inflates it by
 * a third. Measured against the deployed site, a 6 MB body is refused with 413
 * and 4 MB passes. The cap is therefore the largest that reliably arrives, and
 * the operator's page says so rather than failing an upload halfway through.
 * Recorded against FRAGO 02 section 4.2 in the build report.
 */
export const DOCUMENT_MAX_BYTES = 4 * 1024 * 1024;

export const documentInputSchema = z.object({
  section: documentSectionSchema,
  area: z.coerce.number().int().min(1).max(8).nullable().default(null),
  title: z.string().trim().min(1).max(300),
  version: z.string().trim().max(60).default(""),
  asAt: z.string().trim().max(40).default(""),
  owner: z.string().trim().max(160).default(""),
  kind: documentKindSchema.default("link"),
  url: z.string().trim().max(1000).default(""),
  /** Base64 of the file, when one is being uploaded. */
  fileBase64: z.string().default(""),
  fileName: z.string().trim().max(300).default(""),
  contentType: z.string().trim().max(200).default(""),
  published: z.boolean().default(true),
  description: z.string().trim().max(300).default(""),
  /** v1.6. The document's state, as the seed manifest or the operator states it. */
  status: z.enum(["approved", "draft", "published", "template", ""]).default(""),
});
export type DocumentInput = z.infer<typeof documentInputSchema>;

/**
 * v1.7 (FRAGO 07 3.1). What the client sends to offer a document. It is an
 * offer, not a filing: nothing is published until the operator accepts it in
 * the review queue, and the operator chooses the section then.
 */
export const clientDocumentSubmitSchema = z.object({
  title: z.string().trim().min(1).max(300),
  /**
   * v1.9 (FRAGO 09 3.2). The client chooses a Category, never a module; the
   * operator sets the module when accepting.
   */
  category: z.enum(["policy", "procedure", "tracker"]),
  /** One line of what it is. */
  note: z.string().trim().min(1).max(300),
  kind: z.enum(["file", "link"]),
  url: z.string().trim().max(1000).default(""),
  fileBase64: z.string().default(""),
  fileName: z.string().trim().max(300).default(""),
  contentType: z.string().trim().max(200).default(""),
  /** The published document this is a new version of, if any. */
  supersedes: z.string().trim().max(128).nullable().default(null),
});
export type ClientDocumentSubmit = z.infer<typeof clientDocumentSubmitSchema>;

/** v1.7. The operator's decision on a client submission. */
export const acceptSubmissionSchema = z.object({
  section: documentSectionSchema,
  /** v1.9 (FRAGO 09 3.2). Required: nothing publishes without its module. */
  area: z.coerce.number().int().min(1).max(8),
});

/** v1.9 (FRAGO 09 3.2). The client's Category, and the section it pre-fills at acceptance. */
export const SUBMISSION_CATEGORY_LABEL = { policy: "Policy", procedure: "Procedure", tracker: "Tracker" } as const;
export const SUBMISSION_CATEGORY_SECTION = { policy: "policies", procedure: "procedures", tracker: "trackers" } as const;
export type SubmissionCategory = keyof typeof SUBMISSION_CATEGORY_LABEL;
export const returnSubmissionSchema = z.object({
  reason: z.string().trim().min(1).max(300),
});

export const documentsResponseSchema = z.object({
  sections: z.array(
    z.object({
      id: documentSectionSchema,
      name: z.string(),
      blurb: z.string(),
      items: z.array(documentSchema),
      /** What MITMARK will publish here, and when, while it is empty. */
      emptyMessage: z.string(),
      emptyTargetDate: z.string().nullable(),
    }),
  ),
});
export type DocumentsResponse = z.infer<typeof documentsResponseSchema>;

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

/**
 * Every task across all eight modules in one list, grouped the way the operator
 * speaks about them. The internal statuses are finer than this on purpose: a
 * blocked task is still in progress to a reader, but it carries a flag saying
 * so, because "blocked" is the word that gets it unblocked.
 */
export const jobGroupSchema = z.enum(["not_started", "in_progress", "completed"]);
export type JobGroup = z.infer<typeof jobGroupSchema>;

export const JOB_GROUP_LABEL: Record<JobGroup, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export function jobGroupOf(status: TaskStatus): JobGroup | null {
  if (status === "not_applicable") return null;
  if (status === "done") return "completed";
  if (status === "not_started") return "not_started";
  return "in_progress";
}

export const jobsResponseSchema = z.object({
  groups: z.array(
    z.object({
      id: jobGroupSchema,
      name: z.string(),
      tasks: z.array(
        taskSchema.extend({
          rag: ragSchema,
          ragLabel: z.string(),
          statusLabel: z.string(),
          ownerLabel: z.string(),
          areaName: z.string(),
          blocked: z.boolean(),
          forYou: z.boolean(),
          /** v1.9 (FRAGO 09 3.1). MITMARK's note on the client's confirmation, if one was given. */
          mitmarkNote: z.object({ text: z.string(), at: z.string() }).nullable(),
        }),
      ),
    }),
  ),
  /** Tasks marked not applicable are not shown, but they are counted. */
  notApplicableCount: z.number().int(),
  modules: z.array(z.object({ id: z.number().int(), name: z.string() })),
  owners: z.array(z.string()),
  /** The Waiting on you strip's empty state, the same words the tracker used. */
  forYouEmptyMessage: z.string(),
});
export type JobsResponse = z.infer<typeof jobsResponseSchema>;

// ---------------------------------------------------------------------------
// How the overall figure is counted
// ---------------------------------------------------------------------------

/**
 * Two ways to count the same obligations.
 *
 * `overdue` is what the client sees: an always-on duty only counts once
 * something live has been raised against it, so a client who is up to date
 * reads as up to date rather than as nothing-signed-off.
 *
 * `cycle` is the stricter operator view, where every always-on duty counts
 * until it has been closed for the period. It is a toggle in admin and is
 * never the client's default.
 */
export const denominatorModeSchema = z.enum(["overdue", "cycle"]);
export type DenominatorMode = z.infer<typeof denominatorModeSchema>;

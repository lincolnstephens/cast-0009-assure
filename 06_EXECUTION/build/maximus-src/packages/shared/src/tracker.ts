import { z } from "zod";

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

export const AREAS = [
  { id: 1, name: "DPO registration and ICO" },
  { id: 2, name: "Data mapping and processing records" },
  { id: 3, name: "Data retention" },
  { id: 4, name: "Cross-border data transfers" },
  { id: 5, name: "Data protection impact assessments" },
  { id: 6, name: "Data subject requests" },
  { id: 7, name: "Vendor data risk" },
  { id: 8, name: "Data breach and incident management" },
] as const;

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
  asAt: z.string(),
  basis: z.string(),
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
});
export type TrackerHome = z.infer<typeof trackerHomeSchema>;

// ---------------------------------------------------------------------------
// The area page
// ---------------------------------------------------------------------------

export const areaPageSchema = z.object({
  area: z.number().int(),
  name: z.string(),
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
});
export type AreaPage = z.infer<typeof areaPageSchema>;

/** The six questions, in order, on every task table. Never renamed. */
export const TASK_COLUMNS = ["What", "How", "Who", "When", "Done", "Status"] as const;

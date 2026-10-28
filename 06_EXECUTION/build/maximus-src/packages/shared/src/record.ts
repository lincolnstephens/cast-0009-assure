import { z } from "zod";
import { jurisdictionsSchema } from "./coverage.ts";

/**
 * The ASSURE value layer's contracts: the Record, the operator's settings and
 * the CFO statement. These are the shapes the client portal and the admin
 * workspace exchange with the API.
 */

export const deadlineLabelSchema = z.enum([
  "",
  "DSAR one month",
  "Breach 72 hours",
  "DPA before go-live",
  "Board or audit date",
]);
export type DeadlineLabel = z.infer<typeof deadlineLabelSchema>;

export const entrySourceSchema = z.enum([
  "manual",
  "clock",
  "policy",
  "guide",
  "export",
  "import",
]);
export type EntrySource = z.infer<typeof entrySourceSchema>;

export const lineStatusSchema = z.enum([
  "Live",
  "Available",
  "Recommended",
  "Not in scope",
]);
export type LineStatus = z.infer<typeof lineStatusSchema>;

/** One piece of work MITMARK completed under the retainer. */
export const recordEntrySchema = z.object({
  id: z.string(),
  orgId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** v1.7. The module the work belongs to, 1 to 8. */
  area: z.number().int().min(1).max(8),
  /** Before v1.7, one of the twelve archive lines. Kept for history; never shown to the client. */
  line: z.number().int().min(1).max(12).nullable().optional(),
  what: z.string(),
  outcome: z.string(),
  hours: z.number().min(0),
  deadline: deadlineLabelSchema,
  reviewer: z.string(),
  ill: z.boolean(),
  reviewed: z.boolean(),
  source: entrySourceSchema,
  sourceRef: z.string().nullable(),
  createdAt: z.string(),
});
export type RecordEntry = z.infer<typeof recordEntrySchema>;

/** What an admin may send when adding or editing an entry. */
export const entryInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  area: z.coerce.number().int().min(1).max(8),
  what: z.string().min(1).max(500),
  outcome: z.string().max(500).default(""),
  hours: z.coerce.number().min(0).max(1000),
  deadline: deadlineLabelSchema.default(""),
  reviewer: z.string().min(1).max(200),
  ill: z.boolean().default(false),
  reviewed: z.boolean().default(true),
});
export type EntryInput = z.infer<typeof entryInputSchema>;

/** The operator's settings. The Information Officer never sees this form. */
export const orgSettingsSchema = z.object({
  clientName: z.string().max(200),
  ioName: z.string().max(200),
  ioRate: z.coerce.number().min(0).max(10000),
  dayRate: z.coerce.number().min(0).max(100000),
  retainer: z.union([z.coerce.number().min(0).max(1000000), z.literal("")]),
  lead: z.string().max(200),
  showIllustrative: z.boolean(),
  /** Before v1.7. Kept so an older client can still save; no surface reads it. */
  lineStatus: z.record(z.string(), lineStatusSchema).optional(),
  /** v1.7. Module status by module id, "1" to "8". */
  moduleStatus: z.record(z.string(), lineStatusSchema).default({}),

  // --- Compliance Tracker -------------------------------------------------
  jurisdiction: z.enum(["UK", "CH-MC", "DIFC", "SG", "US"]).default("UK"),
  /** Null means not recorded, and the training tile says so rather than guessing. */
  staffInScope: z.coerce.number().int().min(0).max(100000).nullable().default(null),
  staffTrained: z.coerce.number().int().min(0).max(100000).nullable().default(null),
  clientRoles: z.array(z.string().trim().min(1).max(120)).default([]),
  workplanTargetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .default(null),
  /**
   * How the overall figure counts always-on duties. The client always sees
   * "overdue"; "cycle" is the operator's stricter view, set here and shown
   * only in admin.
   */
  denominatorMode: z.enum(["overdue", "cycle"]).default("overdue"),
  /** When MITMARK expects to publish the first documents in each section. */
  documentsTargetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .default(null),
  /** v1.5. The regulation line on the client's tracker. Empty means the jurisdiction's default. */
  regulationLabel: z.string().trim().max(200).default(""),
  /** The journey's current stage, 1 to 5. Null means work it out from the tasks. */
  journeyPhase: z.coerce.number().int().min(1).max(5).nullable().default(null),
  /** The sentence beneath the stage. Empty means the default sentence. */
  journeyNote: z.string().trim().max(300).default(""),
  /** Per-module introductions keyed "1" to "8". Empty means the default. */
  moduleIntroductions: z.record(z.string(), z.string().trim().max(600)).default({}),
  /** v1.6. Retention schedules keyed by module ("3"): category and period. */
  retentionSchedule: z
    .record(
      z.string(),
      z
        .array(
          z.object({
            category: z.string().trim().min(1).max(160),
            period: z.string().trim().min(1).max(200),
          }),
        )
        .max(30),
    )
    .default({}),
  /**
   * v1.10 (FRAGO 11 3.3). The organisation's jurisdictions, for the Global
   * coverage tile. Saved only through PUT /admin/jurisdictions, which audits
   * the count; the general settings save ignores it.
   */
  jurisdictions: jurisdictionsSchema.default([]),
});
export type OrgSettings = z.infer<typeof orgSettingsSchema>;

/** v1.7. One of the eight modules, with the tenant's status and count on the Record. */
export const moduleViewSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  introduction: z.string(),
  status: lineStatusSchema,
  onRecord: z.number().int(),
});
export type ModuleView = z.infer<typeof moduleViewSchema>;

export const moduleTotalSchema = z.object({
  area: z.number().int(),
  name: z.string(),
  items: z.number().int(),
  hours: z.number(),
});
export type ModuleTotal = z.infer<typeof moduleTotalSchema>;

export const recordTotalsSchema = z.object({
  items: z.number().int(),
  hours: z.number(),
  io: z.number(),
  con: z.number(),
  deadlinesMet: z.number().int(),
  byModule: z.array(moduleTotalSchema),
  anyIllustrative: z.boolean(),
});
export type RecordTotals = z.infer<typeof recordTotalsSchema>;

export const recordResponseSchema = z.object({
  entries: z.array(recordEntrySchema),
  totals: recordTotalsSchema,
  periods: z.array(z.string()),
  period: z.string(),
  settings: orgSettingsSchema,
  modules: z.array(moduleViewSchema),
  /** True when illustrative entries are being shown to the client for a demo. */
  showingIllustrative: z.boolean(),
});
export type RecordResponse = z.infer<typeof recordResponseSchema>;

export const statementResponseSchema = z.object({
  period: z.string(),
  clientName: z.string(),
  ioName: z.string(),
  lead: z.string(),
  ioRate: z.number(),
  dayRate: z.number(),
  months: z.number().int(),
  totals: recordTotalsSchema,
  deadlines: z.array(recordEntrySchema),
  /** Retainer for the period, or null when the fee has not been entered. */
  fee: z.number().nullable(),
  conRatio: z.number().nullable(),
  ioRatio: z.number().nullable(),
  generated: z.string(),
  /** True when the statement contains illustrative entries and says so. */
  illustrative: z.boolean(),
  /**
   * v1.6 (FRAGO 06 3.5). The Statement reads in three parts: the service,
   * what MITMARK has done, and what comes next. There is no planned-against-
   * achieved comparison. v1.7: `service` is the eight modules with their
   * status from Settings and their one-line introduction, in module order.
   */
  service: z.array(
    z.object({ id: z.number().int(), name: z.string(), status: lineStatusSchema, introduction: z.string() }),
  ),
  /** What MITMARK has done: each reviewed Record entry in the period, oldest first. */
  items: z.array(recordEntrySchema),
  /** What comes next: the open dated tasks in the workplan, soonest first. */
  next: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      areaName: z.string(),
      owner: z.string(),
      dueAt: z.string(),
    }),
  ),
});
export type StatementResponse = z.infer<typeof statementResponseSchema>;

/** The shape Tessera Assure v0.1 exported from the browser, for import. */
export const v01ImportSchema = z.object({
  settings: z.record(z.string(), z.unknown()).optional(),
  status: z.record(z.string(), z.string()).optional(),
  entries: z.array(z.record(z.string(), z.unknown())),
});
export type V01Import = z.infer<typeof v01ImportSchema>;

export const importResultSchema = z.object({
  imported: z.number().int(),
  skipped: z.number().int(),
  problems: z.array(z.string()),
});
export type ImportResult = z.infer<typeof importResultSchema>;

import { z } from "zod";

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
  line: z.number().int().min(1).max(12),
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
  line: z.coerce.number().int().min(1).max(12),
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
  lineStatus: z.record(z.string(), lineStatusSchema),
});
export type OrgSettings = z.infer<typeof orgSettingsSchema>;

/** One of the twelve service lines, with the tenant's status and count. */
export const serviceLineViewSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  short: z.string(),
  hoursPer: z.number(),
  deadline: z.boolean(),
  why: z.string(),
  status: lineStatusSchema,
  onRecord: z.number().int(),
});
export type ServiceLineView = z.infer<typeof serviceLineViewSchema>;

export const lineTotalSchema = z.object({
  line: z.number().int(),
  name: z.string(),
  short: z.string(),
  items: z.number().int(),
  hours: z.number(),
});
export type LineTotal = z.infer<typeof lineTotalSchema>;

export const recordTotalsSchema = z.object({
  items: z.number().int(),
  hours: z.number(),
  io: z.number(),
  con: z.number(),
  deadlinesMet: z.number().int(),
  byLine: z.array(lineTotalSchema),
  anyIllustrative: z.boolean(),
});
export type RecordTotals = z.infer<typeof recordTotalsSchema>;

export const recordResponseSchema = z.object({
  entries: z.array(recordEntrySchema),
  totals: recordTotalsSchema,
  periods: z.array(z.string()),
  period: z.string(),
  settings: orgSettingsSchema,
  lines: z.array(serviceLineViewSchema),
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

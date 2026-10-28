import { z } from "zod";
import { jurisdictionsSchema, lineStatusSchema, recurrenceSchema, taskStatusSchema } from "@maximus/shared";

/**
 * The seed manifest (FRAGO 05 3.5, as amended 28 Sep: the command implements
 * the shape of the manifest Seagull supplied, and T18 documents it from that
 * file). One file describes one organisation's starting content: its settings,
 * its workplan tasks, the dated obligations ("clocks") that sit on those
 * tasks, and the documents to file.
 *
 * Roles only. An owner is a role, never a person, and no title carries the
 * client's name.
 */
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const seedTaskSchema = z.object({
  /** The manifest's own reference ("H01", "D06"); kept on the task's source. */
  ref: z.string().trim().min(1).max(40),
  area: z.number().int().min(1).max(8),
  phase: z.number().int().min(1).max(5).default(3),
  title: z.string().trim().min(1).max(300),
  how: z.string().trim().max(500).default(""),
  ownerType: z.enum(["mitmark", "client"]),
  ownerRole: z.string().trim().max(120).default(""),
  dueAt: isoDate.nullable().default(null),
  recurrence: recurrenceSchema.default("once"),
  status: taskStatusSchema.default("not_started"),
  notes: z.string().trim().max(2000).optional(),
  source: z.string().trim().max(120).optional(),
});
export type SeedTask = z.infer<typeof seedTaskSchema>;

/**
 * A dated obligation that belongs to a task. Not a statutory clock: those are
 * for data requests and breaches. It dates the task it names, or, when that
 * task is already done, it becomes the next open instance of it.
 */
export const seedClockSchema = z.object({
  ref: z.string().trim().min(1).max(40),
  kind: z.string().trim().max(60),
  dueAt: isoDate,
  note: z.string().trim().max(500).default(""),
  taskRef: z.string().trim().min(1).max(40),
});
export type SeedClock = z.infer<typeof seedClockSchema>;

export const seedDocumentSchema = z.object({
  /** File name, relative to the manifest. */
  file: z.string().trim().min(1).max(300),
  title: z.string().trim().min(1).max(300),
  section: z.enum(["policies", "procedures", "trackers"]),
  area: z.number().int().min(1).max(8).nullable().default(null),
  status: z.enum(["approved", "draft", "published", "template"]),
  version: z.string().trim().max(40).optional(),
  approvedAt: isoDate.optional(),
  description: z.string().trim().max(300).default(""),
  /** False files it on the operator's side only. Defaults to visible. */
  clientVisible: z.boolean().default(true),
});
export type SeedDocument = z.infer<typeof seedDocumentSchema>;

/**
 * v2.1 (FRAGO 06 section 4). A link filed as a document of kind "link",
 * shown as a tile on its module's page.
 */
export const seedLinkSchema = z.object({
  title: z.string().trim().min(1).max(300),
  url: z.string().trim().url().max(1000),
  area: z.number().int().min(1).max(8).nullable().default(null),
  section: z.enum(["policies", "procedures", "trackers"]).default("procedures"),
  description: z.string().trim().max(300).default(""),
});
export type SeedLink = z.infer<typeof seedLinkSchema>;

/** v2.1. One row of the retention schedule. The seed files it against module 3. */
export const seedRetentionRowSchema = z.object({
  category: z.string().trim().min(1).max(160),
  period: z.string().trim().min(1).max(200),
});

export const seedManifestSchema = z.object({
  /** The manifest's own description, for the record. Not seeded. v1.10: up to 2000 characters. */
  manifest: z.string().max(2000).optional(),
  organisation: z
    .object({
      displayName: z.string().trim().max(200).nullable().default(null),
      jurisdiction: z.enum(["UK", "CH-MC", "DIFC", "SG", "US"]).optional(),
      regulation: z.string().trim().max(200).optional(),
      settings: z
        .object({
          journeyPhase: z.number().int().min(1).max(5).nullable().optional(),
          journeyNote: z.string().trim().max(300).optional(),
          retentionSchedule: z.array(seedRetentionRowSchema).max(30).optional(),
          // v1.10 (FRAGO 11 3.2). Settings a new organisation can take from
          // its manifest rather than by hand. Absent keys leave the setting
          // as the organisation already has it.
          showIllustrative: z.boolean().optional(),
          /** The Information Officer's label: a role, never a person. */
          informationOfficerLabel: z.string().trim().min(1).max(200).optional(),
          moduleStatus: z
            .record(z.enum(["1", "2", "3", "4", "5", "6", "7", "8"]), lineStatusSchema)
            .optional(),
          rates: z
            .object({
              hourlyRate: z.number().min(0).max(10000).optional(),
              dayRate: z.number().min(0).max(100000).optional(),
              retainer: z.number().min(0).max(1000000).nullable().optional(),
            })
            .optional(),
        })
        .passthrough()
        .default({}),
    })
    .default({ displayName: null, settings: {} }),
  defaults: z
    .object({
      source: z.string().trim().max(120).optional(),
      notesUndated: z.string().trim().max(2000).optional(),
    })
    .passthrough()
    .default({}),
  tasks: z.array(seedTaskSchema).max(500),
  clocks: z.array(seedClockSchema).max(50).default([]),
  documents: z.array(seedDocumentSchema).max(100).default([]),
  links: z.array(seedLinkSchema).max(50).default([]),
  /** v1.10 (FRAGO 11 3.3). The organisation's jurisdictions, for the Global coverage tile. */
  jurisdictions: jurisdictionsSchema.optional(),
  /** What the manifest deliberately leaves out, for the record. Not seeded. */
  notSeeded: z.array(z.unknown()).optional(),
});
export type SeedManifest = z.infer<typeof seedManifestSchema>;

/**
 * How many tasks a manifest creates: one per task, plus one for each clock
 * whose task is already done (the next open instance). Shared by the server,
 * the command and the tests so the three cannot disagree.
 */
export function tasksCreatedBy(m: SeedManifest): number {
  const done = new Set(m.tasks.filter((t) => t.status === "done").map((t) => t.ref));
  return m.tasks.length + m.clocks.filter((c) => done.has(c.taskRef)).length;
}

/** The module a manifest's retention schedule belongs to. */
export const RETENTION_AREA = 3;

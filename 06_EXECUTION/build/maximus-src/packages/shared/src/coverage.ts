import { z } from "zod";
import type { StatusMarkKind } from "./statusMark.ts";

/**
 * v1.10 (FRAGO 11 3.3). An organisation's jurisdictions, for the Global
 * coverage tile on the Compliance Tracker and the registrations table on
 * module 1. Set by the operator in Settings, or by the seed; empty for every
 * organisation that does not list any, where neither appears.
 *
 * A filing duty is MITMARK's understanding, to be confirmed at mobilisation.
 * Nothing here records that a filing or registration has been made: the
 * status is the work's, in words, and the card carries the qualifier.
 */
export const coverageStatusSchema = z.enum(["not_started", "in_progress", "done", "attention"]);
export type CoverageStatus = z.infer<typeof coverageStatusSchema>;

/** The words for each status. Always shown beside the mark. */
export const COVERAGE_STATUS_LABEL: Record<CoverageStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
  attention: "Needs attention",
};

/** The v1.9 status mark each status takes: one rule, the same marks as a task's. */
export const COVERAGE_STATUS_MARK: Record<CoverageStatus, StatusMarkKind> = {
  not_started: "not_started",
  in_progress: "in_progress",
  done: "done",
  attention: "red",
};

export const coverageEntrySchema = z.object({
  id: z.string().trim().min(1).max(12),
  name: z.string().trim().min(1).max(120),
  hub: z.string().trim().min(1).max(80),
  regulator: z.string().trim().max(200).default(""),
  law: z.string().trim().max(200).default(""),
  filingDuty: z.string().trim().max(400).default(""),
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  status: coverageStatusSchema.default("not_started"),
});
export type CoverageEntry = z.infer<typeof coverageEntrySchema>;

export const MAX_JURISDICTIONS = 30;

export const jurisdictionsSchema = z
  .array(coverageEntrySchema)
  .max(MAX_JURISDICTIONS)
  .refine((list) => new Set(list.map((j) => j.id.toLowerCase())).size === list.length, {
    message: "Each jurisdiction needs its own id.",
  });

/** The body of the operator's save. */
export const jurisdictionsSaveSchema = z.object({ jurisdictions: jurisdictionsSchema });

/** The tile's title: "Global coverage" for two or more, "Coverage" for one. */
export function coverageTitle(count: number): string {
  return count >= 2 ? "Global coverage" : "Coverage";
}

/** The card's qualifier, ahead of the filing duty text. */
export const FILING_DUTY_QUALIFIER = "Filing duty (to be confirmed at mobilisation):";

/** Module 1's table heading. */
export const REGISTRATIONS_HEADING = "Registrations and filings by jurisdiction";

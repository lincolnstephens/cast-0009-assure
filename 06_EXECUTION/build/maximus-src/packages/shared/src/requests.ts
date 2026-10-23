import { z } from "zod";
import { intakeTypeSchema } from "./enums.ts";

// "Raise a request" (spec §4.3): data request → SAR intake + clock;
// report a concern → potential incident → breach intake + clock.
export const raiseRequestSchema = z.object({
  type: z.enum(["data_request", "concern"]),
  details: z.string().trim().min(1).max(5000),
});
export type RaiseRequest = z.infer<typeof raiseRequestSchema>;

export const addClockEventSchema = z.object({
  note: z.string().trim().min(1).max(2000),
});
export type AddClockEvent = z.infer<typeof addClockEventSchema>;

export const closeClockSchema = z.object({
  outcome: z.string().trim().min(1).max(500),
  // Required when closing a SAR clock: drives the Value Snapshot counter.
  insideStatute: z.boolean().optional(),
});
export type CloseClock = z.infer<typeof closeClockSchema>;

export const manualIntakeSchema = z.object({
  clientAccountId: z.string().min(1).max(120),
  type: intakeTypeSchema,
  summary: z.string().trim().min(1).max(5000),
});
export type ManualIntake = z.infer<typeof manualIntakeSchema>;

import { z } from "zod";
import { alertStateSchema } from "./enums.ts";

export const createDemoAlertSchema = z.object({
  clientAccountId: z.string().min(1).max(120),
  kind: z.string().trim().min(1).max(80),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  summary: z.string().trim().min(1).max(500),
  detail: z.record(z.unknown()).optional(),
});
export type CreateDemoAlert = z.infer<typeof createDemoAlertSchema>;

export const updateAlertStateSchema = z.object({
  state: alertStateSchema,
  officerNote: z.string().trim().min(1).max(2000),
});
export type UpdateAlertState = z.infer<typeof updateAlertStateSchema>;

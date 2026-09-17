import { z } from "zod";

export const policyCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{2,8}-\d{2}$/, "Code must look like DP-01");

export const createPolicySchema = z.object({
  clientAccountId: z.string().min(1).max(120),
  code: policyCodeSchema,
  title: z.string().trim().min(1).max(200),
  bodyMarkdown: z.string().max(20000).optional().default(""),
});
export type CreatePolicy = z.infer<typeof createPolicySchema>;

export const updatePolicySchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  bodyMarkdown: z.string().max(20000).optional(),
});
export type UpdatePolicy = z.infer<typeof updatePolicySchema>;

export const upsertSectionSchema = z.object({
  sectionRef: z
    .string()
    .trim()
    .regex(/^\d{1,2}(\.\d{1,2})?$/, "Section ref must look like 4 or 4.2"),
  heading: z.string().trim().min(1).max(200),
  bodyMarkdown: z.string().trim().min(1).max(20000),
});
export type UpsertSection = z.infer<typeof upsertSectionSchema>;

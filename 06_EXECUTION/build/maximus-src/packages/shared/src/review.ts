import { z } from "zod";

export const reviewAnswerSchema = z.object({
  reply: z.string().trim().min(1).max(4000),
});
export type ReviewAnswer = z.infer<typeof reviewAnswerSchema>;

export const reviewDecisionSchema = z.object({
  note: z.string().trim().max(2000).optional(),
});
export type ReviewDecision = z.infer<typeof reviewDecisionSchema>;

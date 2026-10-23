import { z } from "zod";

export const reviewAnswerSchema = z.object({
  reply: z.string().trim().min(1).max(4000),
});
export type ReviewAnswer = z.infer<typeof reviewAnswerSchema>;

/**
 * v1.9 (FRAGO 09 3.1). The note read by Approve and Reject. On a data request,
 * a concern or a task confirmation it is MITMARK's note to the client, up to
 * 300 characters, and optional; blank changes nothing.
 */
export const reviewDecisionSchema = z.object({
  note: z.string().trim().max(300).optional(),
});
export type ReviewDecision = z.infer<typeof reviewDecisionSchema>;

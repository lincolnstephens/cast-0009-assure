import { z } from "zod";

export const sendChatMessageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});
export type SendChatMessage = z.infer<typeof sendChatMessageSchema>;

/** Raw JSON the LLM (or stub) must return — parsed defensively server-side. */
export const guideRawResultSchema = z.object({
  status: z.enum(["green", "amber", "red"]),
  answer: z.string(),
  citations: z
    .array(
      z.object({
        policy_code: z.string(),
        section_ref: z.string(),
        heading: z.string().optional().default(""),
      }),
    )
    .default([]),
  intake: z
    .object({
      type: z.enum(["sar", "breach"]),
      summary: z.string(),
    })
    .nullable()
    .default(null),
});
export type GuideRawResult = z.infer<typeof guideRawResultSchema>;

/**
 * A citation as stored on chat_messages: validated against the approved
 * corpus and pinned to the policy version that served the answer, so chips
 * resolve to THAT version even after a newer one is approved.
 */
export interface StoredCitation {
  policyId: string;
  policyCode: string;
  policyVersion: number;
  sectionRef: string;
  heading: string;
}

export const answerEscalationSchema = z.object({
  reply: z.string().trim().min(1).max(4000),
});
export type AnswerEscalation = z.infer<typeof answerEscalationSchema>;

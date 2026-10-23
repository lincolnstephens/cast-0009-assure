import { z } from "zod";
import { postureDomainSchema, ragStatusSchema } from "./enums.ts";

export const updatePostureSchema = z.object({
  status: ragStatusSchema,
  note: z.string().trim().min(1).max(500),
});
export type UpdatePosture = z.infer<typeof updatePostureSchema>;

export const postureDomainLabel: Record<z.infer<typeof postureDomainSchema>, string> = {
  policies: "Policies",
  training: "Training",
  access_reviews: "Access reviews",
  retention: "Retention",
  ropa: "RoPA",
};

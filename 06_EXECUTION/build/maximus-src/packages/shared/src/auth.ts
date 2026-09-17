import { z } from "zod";
import { clientBrandingSchema } from "./branding.ts";
import { roleSchema } from "./enums.ts";

export const loginRequestSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const sessionUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string(),
  role: roleSchema,
  clientAccountId: z.string().uuid().nullable(),
  clientAccountName: z.string().nullable(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const meResponseSchema = z.object({
  user: sessionUserSchema,
  officer: z
    .object({
      displayName: z.string(),
    })
    .nullable(),
  /** Client-portal theme for the signed-in tenant; null for officers and unscoped sessions. */
  branding: clientBrandingSchema.nullable(),
});
export type MeResponse = z.infer<typeof meResponseSchema>;

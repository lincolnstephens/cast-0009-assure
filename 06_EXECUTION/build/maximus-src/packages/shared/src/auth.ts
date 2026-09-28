import { z } from "zod";
import { clientBrandingSchema } from "./branding.ts";
import { roleSchema } from "./enums.ts";

export const loginRequestSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const sessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  displayName: z.string(),
  role: roleSchema,
  clientAccountId: z.string().min(1).nullable(),
  clientAccountName: z.string().nullable(),
  /** v1.5. True until the user sets their own password; nothing else opens until then. */
  mustChangePassword: z.boolean().default(false),
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

/** v1.5. The rule, stated rather than scored. */
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_RULE = `At least ${PASSWORD_MIN_LENGTH} characters.`;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().max(200),
});
export type ChangePassword = z.infer<typeof changePasswordSchema>;

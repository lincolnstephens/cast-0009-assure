import { z } from "zod";

/**
 * A tenant's client-portal branding.
 *
 * The portal's accent is the client's own colour only when the operator sets
 * one. When `accent` is empty the portal uses the Tessera house tokens. No
 * tenant's name, logo or colour is hardcoded here: a second retained client is
 * a second organisation, not a second build.
 */

export const clientBrandingColorsSchema = z.object({
  bg: z.string(),
  surface: z.string(),
  text: z.string(),
  accent: z.string(),
  accentMuted: z.string(),
});
export type ClientBrandingColors = z.infer<typeof clientBrandingColorsSchema>;

export const clientBrandingSchema = z.object({
  displayName: z.string(),
  logoLight: z.string().optional(),
  logoDark: z.string().optional(),
  colors: clientBrandingColorsSchema,
  poweredByText: z.string(),
});
export type ClientBranding = z.infer<typeof clientBrandingSchema>;

/** Panel hairlines on white-field layouts. */
export const PANEL_LINE = "#F7F7F5";

/**
 * The house default. Used until an operator sets a tenant's own colour, and
 * used for every tenant that never sets one.
 */
export const DEFAULT_BRANDING: ClientBranding = {
  displayName: "Demo Organisation",
  colors: {
    bg: "#FFFFFF",
    surface: "#FFFFFF",
    text: "#1F2937",
    accent: "#1E8A2E",
    accentMuted: "#166B22",
  },
  poweredByText: "Tessera Assure, by MITMARK Intelligence",
};

/** Build a tenant's branding from the operator's settings. */
export function brandingFor(displayName: string, accent: string): ClientBranding {
  if (!accent) return { ...DEFAULT_BRANDING, displayName };
  return {
    ...DEFAULT_BRANDING,
    displayName,
    colors: { ...DEFAULT_BRANDING.colors, accent, accentMuted: accent },
  };
}

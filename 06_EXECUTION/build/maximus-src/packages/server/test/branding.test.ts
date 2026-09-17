import { describe, expect, it } from "vitest";
import { DEFAULT_BRANDING, brandingFor } from "@maximus/shared";

/**
 * The client portal's accent is the client's own colour only when the operator
 * has set one. Otherwise it is the house token. No tenant's name, logo or
 * colour is hardcoded anywhere in the build.
 */
describe("tenant branding", () => {
  it("falls back to the house accent when the operator has set no colour", () => {
    const b = brandingFor("Demo Organisation", "");
    expect(b.colors.accent).toBe(DEFAULT_BRANDING.colors.accent);
    expect(b.colors.accentMuted).toBe(DEFAULT_BRANDING.colors.accentMuted);
  });

  it("uses the client's own colour when the operator has set one", () => {
    const b = brandingFor("Demo Organisation", "#8A1E1E");
    expect(b.colors.accent).toBe("#8A1E1E");
    expect(b.colors.accentMuted).toBe("#8A1E1E");
  });

  it("carries the tenant's display name and no logo asset", () => {
    const b = brandingFor("Second Organisation", "");
    expect(b.displayName).toBe("Second Organisation");
    expect(b.logoLight).toBeUndefined();
    expect(b.logoDark).toBeUndefined();
  });

  it("does not carry any tenant name in the default", () => {
    expect(DEFAULT_BRANDING.displayName).toBe("Demo Organisation");
    expect(DEFAULT_BRANDING.poweredByText).toContain("MITMARK");
  });
});

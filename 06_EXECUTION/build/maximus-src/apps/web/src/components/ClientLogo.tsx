import type { ClientBranding } from "@maximus/shared";

/** Tenant wordmark, plain text from branding data. This build ships no client logo asset. */
export function ClientLogo({ branding }: { branding: ClientBranding }) {
  return (
    <span
      className="text-sm font-semibold tracking-[0.2em]"
      style={{ color: "var(--color-client-accent)" }}
    >
      {branding.displayName.toUpperCase()}
    </span>
  );
}

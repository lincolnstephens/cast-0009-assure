import type { ClientBranding } from "@maximus/shared";
import { useEffect, useState } from "react";
import { apiHref } from "../lib/preview";

/**
 * The client's mark in the portal (FRAGO 08 3.2). The organisation's own logo
 * when the operator has uploaded one, served through the API to this
 * organisation's sessions only; otherwise, or if it fails to load, the
 * display name as text. The logo is shown as uploaded: the portal is light,
 * and the client's mark is never inverted. This build ships no client logo.
 */
export function ClientLogo({
  branding,
  place,
}: {
  branding: ClientBranding;
  place: "sidebar" | "header";
}) {
  const [failed, setFailed] = useState(false);
  const src = branding.logoLight;
  useEffect(() => setFailed(false), [src]);

  if (src && !failed) {
    return (
      <img
        src={apiHref(src)}
        alt={branding.displayName}
        data-testid={`client-logo-${place}`}
        onError={() => setFailed(true)}
        className={
          place === "sidebar"
            ? "block h-auto max-h-14 w-auto max-w-full object-contain object-left"
            : "block h-7 w-auto max-w-[180px] object-contain object-left"
        }
      />
    );
  }

  if (place === "header") {
    return (
      <span data-testid="client-name-fallback-header" className="truncate">
        {branding.displayName}
      </span>
    );
  }
  return (
    <span
      data-testid="client-name-fallback"
      className="text-sm font-semibold tracking-[0.2em]"
      style={{ color: "var(--color-client-accent)" }}
    >
      {branding.displayName.toUpperCase()}
    </span>
  );
}

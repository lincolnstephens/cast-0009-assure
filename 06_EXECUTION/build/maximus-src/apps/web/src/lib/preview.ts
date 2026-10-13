// "View as client" (FRAGO 04 section 3.2). The operator's browser holds the
// organisation being viewed; every API call then carries the preview header,
// and the server serves it as that organisation's client seat, read only.
// The organisation id is explicit so a second client needs nothing new here.
//
// Held in sessionStorage so a reload keeps the view and a new tab does not.
// Only an operator session acts on it: the server ignores the header for a
// client, and the portal only shows the banner to an operator.

const KEY = "assure.clientView";
export const PREVIEW_HEADER = "X-Assure-Preview";
export const PREVIEW_READ_ONLY = "Read only in client view";
/** v1.7 (FRAGO 07 3.3). A refused control in client view says why, in the same words as the server. */
export const PREVIEW_SUBMIT_MESSAGE = "Read only in client view. The client submits requests from her own sign-in.";
export const PREVIEW_CONFIRM_MESSAGE = "Read only in client view. The client confirms from her own sign-in.";

let current: string | null = read();

function read(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function previewOrg(): string | null {
  return current;
}

export function startPreview(orgId: string): void {
  current = orgId;
  try {
    sessionStorage.setItem(KEY, orgId);
  } catch {
    // The view still works for this page load.
  }
}

export function endPreview(): void {
  current = null;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

/**
 * A plain link to an API download cannot carry a header, so in client view
 * it carries the same marker as a query parameter. The server treats both
 * alike: read only, and ignored for a client session.
 */
export function apiHref(path: string): string {
  const org = current;
  if (!org) return `/api${path}`;
  const sep = path.includes("?") ? "&" : "?";
  return `/api${path}${sep}preview=${encodeURIComponent(`client:${org}`)}`;
}

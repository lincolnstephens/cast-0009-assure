// All API calls use relative /api paths only - the site and functions are
// same-origin behind Netlify.

import { ADMIN_ORG_HEADER, selectedOrg } from "./org";
import { PREVIEW_HEADER, previewOrg } from "./preview";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (init?.body) headers["content-type"] = "application/json";
  const org = previewOrg();
  if (org) headers[PREVIEW_HEADER] = `client:${org}`;
  const adminOrg = selectedOrg();
  if (adminOrg && path.startsWith("/admin")) headers[ADMIN_ORG_HEADER] = adminOrg;
  const res = await fetch(`/api${path}`, {
    credentials: "same-origin",
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
  });
  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const body = await res.json();
      if (typeof body?.error === "string") message = body.error;
    } catch {
      // keep the generic message
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as T;
}

import { createHash } from "node:crypto";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { readOrg, readUsers } from "../db/store.ts";
import { writeAudit } from "./audit.ts";
import {
  decodeSessionCookie,
  getUserForSession,
  SESSION_COOKIE,
  type AuthedUser,
} from "./sessions.ts";

export interface AppEnv {
  Variables: {
    user: AuthedUser;
    /** True when an operator is reading the client seat in "View as client". */
    preview?: boolean;
  };
}

export async function requireAuth(c: Context<AppEnv>, next: Next) {
  const raw = getCookie(c, SESSION_COOKIE);
  if (!raw) return c.json({ error: "Not signed in" }, 401);
  const sessionId = decodeSessionCookie(raw);
  if (!sessionId) return c.json({ error: "Not signed in" }, 401);
  const user = await getUserForSession(sessionId);
  if (!user) return c.json({ error: "Not signed in" }, 401);
  c.set("user", user);
  await next();
}

export function requireRole(role: "client" | "mitmark_admin") {
  return async (c: Context<AppEnv>, next: Next) => {
    const user = c.get("user");
    if (!user || user.role !== role) {
      return c.json({ error: "Forbidden" }, 403);
    }
    await next();
  };
}

// ---------------------------------------------------------------------------
// The client seat, and the operator's read-only view of it (FRAGO 04 3.2)
// ---------------------------------------------------------------------------

/** The header the web client sets in "View as client": `client:<orgId>`. */
export const PREVIEW_HEADER = "x-assure-preview";
export const PREVIEW_READ_ONLY = "Read only in client view";

/** The organisation a preview header names, or null when it names none. */
export function previewOrgOf(c: Context<AppEnv>): string | null {
  // The header for API calls; the query parameter for a plain download link,
  // which cannot carry a header. Either is read only (requireClientSeat).
  const raw = (c.req.header(PREVIEW_HEADER) ?? c.req.query("preview") ?? "").trim();
  const match = /^client:([A-Za-z0-9_-]{1,128})$/.exec(raw);
  return match ? match[1] : null;
}

/** A short, non-reversible reference to a session, so the audit can dedupe without holding the session id. */
function sessionRef(sessionId: string): string {
  return createHash("sha256").update(sessionId).digest("hex").slice(0, 12);
}

/**
 * Every client router sits behind this instead of `requireRole("client")`.
 *
 * A client session passes straight through, and the preview header does
 * nothing for it. An operator session passes only with a preview header
 * naming an organisation, and then only to read: the request is served as
 * that organisation's client seat (the same user the client signs in as), so
 * every read runs the client's own code path over the client's own data and
 * nothing admin-only can be added. Any other method is refused before a
 * handler runs. The first preview request in a session writes one audit
 * entry naming the operator.
 */
export async function requireClientSeat(c: Context<AppEnv>, next: Next) {
  const user = c.get("user");
  if (user?.role === "client") {
    await next();
    return;
  }
  if (user?.role !== "mitmark_admin") return c.json({ error: "Forbidden" }, 403);

  const orgId = previewOrgOf(c);
  if (!orgId) return c.json({ error: "Forbidden" }, 403);
  if (c.req.method !== "GET" && c.req.method !== "HEAD") {
    return c.json({ error: PREVIEW_READ_ONLY }, 403);
  }

  const doc = await readOrg(orgId);
  if (!doc) return c.json({ error: "No organisation" }, 404);
  const seat = (await readUsers()).users.find((u) => u.role === "client" && u.orgId === orgId);
  if (!seat) return c.json({ error: "This organisation has no client seat yet." }, 404);

  const ref = sessionRef(user.sessionId);
  if (!doc.audit.some((a) => a.action === "client_view.open" && a.detail.includes(ref))) {
    await writeAudit({
      orgId,
      actorId: user.id,
      actorName: user.displayName,
      action: "client_view.open",
      detail: `Opened client view, read only (session ${ref}).`,
    });
  }

  c.set("user", {
    sessionId: user.sessionId,
    id: seat.id,
    email: seat.email,
    displayName: seat.displayName,
    role: "client",
    clientAccountId: orgId,
  });
  c.set("preview", true);
  await next();
}

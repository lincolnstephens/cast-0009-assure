import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { SessionRecord } from "../db/model.ts";
import { deleteSession, newId, readSession, readUsers, writeSession } from "../db/store.ts";

export const SESSION_COOKIE = "assure_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function sign(sessionId: string): string {
  return createHmac("sha256", secret()).update(sessionId).digest("hex");
}

/** Cookie value is "<sessionId>.<hmac>" so a forged id is rejected without a store hit. */
export function encodeSessionCookie(sessionId: string): string {
  return `${sessionId}.${sign(sessionId)}`;
}

export function decodeSessionCookie(value: string): string | null {
  const dot = value.indexOf(".");
  if (dot <= 0) return null;
  const sessionId = value.slice(0, dot);
  const mac = value.slice(dot + 1);
  const expected = sign(sessionId);
  if (mac.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  return sessionId;
}

/** `epoch` is the user's sessionEpoch now; a later bump ends this session. */
export async function createSession(userId: string, epoch = 0): Promise<SessionRecord> {
  const now = new Date();
  const session: SessionRecord = {
    id: newId(),
    userId,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
    createdAt: now.toISOString(),
    epoch,
  };
  await writeSession(session);
  return session;
}

export async function destroySession(sessionId: string): Promise<void> {
  await deleteSession(sessionId);
}

export interface AuthedUser {
  sessionId: string;
  id: string;
  email: string;
  displayName: string;
  role: string;
  clientAccountId: string | null;
  /** v1.5. Until false, only the /auth routes answer (requireAuth). */
  mustChangePassword: boolean;
}

/**
 * A short, non-reversible reference to a session, for the audit log. The
 * session id itself is a bearer credential and is never written anywhere but
 * its own blob and the signed cookie.
 */
export function sessionRef(sessionId: string): string {
  return createHash("sha256").update(sessionId).digest("hex").slice(0, 12);
}

/**
 * Rejects a missing, unknown or expired session. An expired session blob is
 * removed as it is found, so nothing has to sweep them on a schedule.
 */
export async function getUserForSession(sessionId: string): Promise<AuthedUser | null> {
  const session = await readSession(sessionId);
  if (!session) return null;
  if (session.expiresAt <= new Date().toISOString()) {
    await deleteSession(sessionId);
    return null;
  }

  const doc = await readUsers();
  const user = doc.users.find((u) => u.id === session.userId);
  if (!user) return null;
  // A disabled user, or a session made before the user's password changed or
  // was reset, is refused. The blob is removed as it is found.
  if (user.disabled || (session.epoch ?? 0) !== (user.sessionEpoch ?? 0)) {
    await deleteSession(sessionId);
    return null;
  }

  return {
    sessionId: session.id,
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    clientAccountId: user.orgId,
    mustChangePassword: user.mustChangePassword === true,
  };
}

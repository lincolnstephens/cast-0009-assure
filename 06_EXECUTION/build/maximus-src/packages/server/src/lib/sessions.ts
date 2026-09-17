import { createHmac, timingSafeEqual } from "node:crypto";
import type { SessionRecord } from "../db/model.ts";
import { mutateUsers, newId, readUsers } from "../db/store.ts";

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

/** Drop expired sessions. Called opportunistically from write paths only. */
function pruneExpired(sessions: SessionRecord[], nowIso: string): SessionRecord[] {
  return sessions.filter((s) => s.expiresAt > nowIso);
}

export async function createSession(userId: string): Promise<SessionRecord> {
  const now = new Date();
  const session: SessionRecord = {
    id: newId(),
    userId,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
    createdAt: now.toISOString(),
  };
  await mutateUsers((doc) => {
    doc.sessions = pruneExpired(doc.sessions, now.toISOString());
    doc.sessions.push(session);
  });
  return session;
}

export async function destroySession(sessionId: string): Promise<void> {
  await mutateUsers((doc) => {
    doc.sessions = pruneExpired(doc.sessions, new Date().toISOString()).filter(
      (s) => s.id !== sessionId,
    );
  });
}

export interface AuthedUser {
  sessionId: string;
  id: string;
  email: string;
  displayName: string;
  role: string;
  clientAccountId: string | null;
}

/** Rejects a missing, unknown or expired session. Does not itself write; the
 * pruning of expired sessions happens on the next write (see createSession,
 * destroySession). */
export async function getUserForSession(sessionId: string): Promise<AuthedUser | null> {
  const doc = await readUsers();
  const session = doc.sessions.find((s) => s.id === sessionId);
  if (!session) return null;
  if (session.expiresAt <= new Date().toISOString()) return null;

  const user = doc.users.find((u) => u.id === session.userId);
  if (!user) return null;

  return {
    sessionId: session.id,
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    clientAccountId: user.orgId,
  };
}

import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import {
  decodeSessionCookie,
  getUserForSession,
  SESSION_COOKIE,
  type AuthedUser,
} from "./sessions.ts";

export interface AppEnv {
  Variables: {
    user: AuthedUser;
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

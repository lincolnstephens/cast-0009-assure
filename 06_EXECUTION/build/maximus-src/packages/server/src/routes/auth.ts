import { brandingFor, loginRequestSchema, type ClientBranding } from "@maximus/shared";
import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { OrgDoc, UserRecord } from "../db/model.ts";
import { readOrg, readUsers } from "../db/store.ts";
import { writeAudit } from "../lib/audit.ts";
import { requireAuth, type AppEnv } from "../lib/middleware.ts";
import {
  createSession,
  decodeSessionCookie,
  destroySession,
  encodeSessionCookie,
  SESSION_COOKIE,
} from "../lib/sessions.ts";

export const authRoutes = new Hono<AppEnv>();

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "Lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};

authRoutes.post("/login", async (c) => {
  const parsed = loginRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Enter a valid email address and password." }, 400);
  }
  const { email, password } = parsed.data;

  const usersDoc = await readUsers();
  const user = usersDoc.users.find((u) => u.email === email.toLowerCase());
  const invalid = { error: "Email address or password is incorrect." };
  if (!user) return c.json(invalid, 401);

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return c.json(invalid, 401);

  const session = await createSession(user.id);
  setCookie(c, SESSION_COOKIE, encodeSessionCookie(session.id), cookieOptions);

  await writeAudit({
    orgId: user.orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "auth.login",
    detail: `session=${session.id}`,
  });

  return c.json({ user: await toSessionUser(user) });
});

/**
 * Who is signed in, if anyone. Unlike /me this does not require a session: a
 * first page load by a signed-out visitor is a normal event, and answering it
 * with 401 makes the browser log a console error on every cold open.
 */
authRoutes.get("/session", async (c) => {
  const raw = getCookie(c, SESSION_COOKIE);
  const sessionId = raw ? decodeSessionCookie(raw) : null;
  if (!sessionId) return c.json({ user: null, officer: null, branding: null });

  const { getUserForSession } = await import("../lib/sessions.ts");
  const authed = await getUserForSession(sessionId);
  if (!authed) return c.json({ user: null, officer: null, branding: null });

  const usersDoc = await readUsers();
  const user = usersDoc.users.find((u) => u.id === authed.id);
  if (!user) return c.json({ user: null, officer: null, branding: null });

  const org = user.orgId ? await readOrg(user.orgId) : null;
  const officer = usersDoc.users.find((u) => u.role === "mitmark_admin");
  return c.json({
    user: await toSessionUser(user),
    officer: officer ? { displayName: officer.displayName } : null,
    branding: org ? toClientBranding(org) : null,
  });
});

authRoutes.post("/logout", requireAuth, async (c) => {
  const user = c.get("user");
  const raw = getCookie(c, SESSION_COOKIE);
  const sessionId = raw ? decodeSessionCookie(raw) : null;
  if (sessionId) await destroySession(sessionId);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });

  await writeAudit({
    orgId: user.clientAccountId,
    actorId: user.id,
    actorName: user.displayName,
    action: "auth.logout",
    detail: sessionId ? `session=${sessionId}` : "",
  });

  return c.json({ ok: true });
});

authRoutes.get("/me", requireAuth, async (c) => {
  const user = c.get("user");

  // The named MITMARK officer shown in the client top bar. Beta: the first
  // admin user is the assigned officer for every account (see DECISIONS.md).
  const usersDoc = await readUsers();
  const officer = usersDoc.users.find((u) => u.role === "mitmark_admin") ?? null;

  let clientAccountName: string | null = null;
  let branding: ClientBranding | null = null;
  if (user.clientAccountId) {
    const org = await readOrg(user.clientAccountId);
    clientAccountName = org?.name ?? null;
    branding = org ? toClientBranding(org) : null;
  }

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      clientAccountId: user.clientAccountId,
      clientAccountName,
    },
    officer: officer ? { displayName: officer.displayName } : null,
    branding,
  });
});

async function toSessionUser(user: UserRecord) {
  let clientAccountName: string | null = null;
  if (user.orgId) {
    const org = await readOrg(user.orgId);
    clientAccountName = org?.name ?? null;
  }
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    clientAccountId: user.orgId,
    clientAccountName,
  };
}

/**
 * The stored `OrgDoc.branding` is deliberately thin: a display name and an
 * accent that is empty unless the operator has set the client's own colour.
 * The `/me` response promises the richer `ClientBranding` shape, so this builds
 * one from the house default in the shared package. The house tokens are the
 * single source of the palette; no tenant's colours are hardcoded anywhere.
 */
function toClientBranding(org: OrgDoc): ClientBranding {
  return brandingFor(org.branding.displayName || org.name, org.branding.accent);
}


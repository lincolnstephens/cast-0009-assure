import {
  brandingFor,
  changePasswordSchema,
  loginRequestSchema,
  PASSWORD_MIN_LENGTH,
  PASSWORD_RULE,
  type ClientBranding,
} from "@maximus/shared";
import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { OrgDoc, UserRecord } from "../db/model.ts";
import { mutateUsers, readOrg, readUsers } from "../db/store.ts";
import { writeAudit } from "../lib/audit.ts";
import { logoPath } from "../lib/logo.ts";
import { previewOrgOf, requireAuth, type AppEnv } from "../lib/middleware.ts";
import {
  createSession,
  decodeSessionCookie,
  destroySession,
  encodeSessionCookie,
  SESSION_COOKIE,
  sessionRef,
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
  // A disabled account answers exactly as a wrong password does, so the
  // sign-in form never confirms which addresses exist.
  if (!ok || user.disabled) return c.json(invalid, 401);

  const session = await createSession(user.id, user.sessionEpoch ?? 0);
  setCookie(c, SESSION_COOKIE, encodeSessionCookie(session.id), cookieOptions);

  const signedInAt = new Date().toISOString();
  await mutateUsers((doc) => {
    const row = doc.users.find((u) => u.id === user.id);
    if (row) row.lastSignInAt = signedInAt;
  });
  user.lastSignInAt = signedInAt;

  // v1.5: the audit carries a one-way reference to the session, never the
  // session id, which is a bearer credential (it was written here raw
  // from v1.0 to v1.4).
  await writeAudit({
    orgId: user.orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "auth.login",
    detail: `session ${sessionRef(session.id)}`,
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

  // As /me: in "View as client" the operator's session carries the
  // previewed organisation's branding, so a reload keeps the client's look.
  // v1.10: a manager's preview wins over any organisation the account itself
  // carries (the demo manager has one), so the look is the previewed client's.
  const brandingOrg = (user.role === "mitmark_admin" ? previewOrgOf(c) : null) ?? user.orgId;
  const org = brandingOrg ? await readOrg(brandingOrg) : null;
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
    detail: sessionId ? `session ${sessionRef(sessionId)}` : "",
  });

  return c.json({ ok: true });
});

/**
 * v1.5 (FRAGO 05 3.3). Any signed-in user changes their own password here,
 * and a user holding a one-time password must do so before anything else
 * opens. The new password is hashed and never written anywhere else: not to
 * a log, not to the audit. Every other session for the user ends; this one
 * is replaced by a fresh session under the new epoch.
 */
authRoutes.post("/password", requireAuth, async (c) => {
  const user = c.get("user");
  const parsed = changePasswordSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Enter your current password and a new one." }, 400);
  const { currentPassword, newPassword } = parsed.data;
  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return c.json({ error: `The new password must be ${PASSWORD_RULE.toLowerCase().replace(/\.$/, "")}.` }, 400);
  }

  const record = (await readUsers()).users.find((u) => u.id === user.id);
  if (!record || !(await bcrypt.compare(currentPassword, record.passwordHash))) {
    return c.json({ error: "The current password is not right." }, 400);
  }
  if (await bcrypt.compare(newPassword, record.passwordHash)) {
    return c.json({ error: "Choose a password different from the current one." }, 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const epoch = await mutateUsers((doc) => {
    const row = doc.users.find((u) => u.id === user.id)!;
    row.passwordHash = passwordHash;
    row.mustChangePassword = false;
    row.sessionEpoch = (row.sessionEpoch ?? 0) + 1;
    return row.sessionEpoch;
  });

  await destroySession(user.sessionId);
  const session = await createSession(user.id, epoch);
  setCookie(c, SESSION_COOKIE, encodeSessionCookie(session.id), cookieOptions);

  await writeAudit({
    orgId: user.clientAccountId,
    actorId: user.id,
    actorName: user.displayName,
    action: "auth.password_change",
    detail: "Password changed by its owner; other sessions ended.",
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
  // In "View as client" the operator's portal carries the previewed
  // organisation's name and branding, exactly as its client seat receives
  // them. A client session ignores the header.
  const previewOrg = user.role === "mitmark_admin" ? previewOrgOf(c) : null;
  const orgForBranding = previewOrg ?? user.clientAccountId;
  if (orgForBranding) {
    const org = await readOrg(orgForBranding);
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
      mustChangePassword: user.mustChangePassword,
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
    mustChangePassword: user.mustChangePassword === true,
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
  // v1.8: the logo travels as an API path, served only to this
  // organisation's sessions (routes/branding.ts); absent means text.
  const branding = brandingFor(org.branding.displayName || org.name, org.branding.accent);
  const logo = logoPath(org.branding.logo);
  return logo ? { ...branding, logoLight: logo } : branding;
}


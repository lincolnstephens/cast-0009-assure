import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { z } from "zod";
import type { UserRecord } from "../db/model.ts";
import { mutateUsers, newId, readOrg, readUsers } from "../db/store.ts";
import { writeSystemAudit } from "../lib/audit.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";
import { oneTimePassword } from "../lib/oneTimePassword.ts";

/**
 * Users (FRAGO 05 3.2). Managers only. A manager is a `mitmark_admin` with no
 * organisation and sees every organisation; a client user belongs to exactly
 * one. The product never emails anyone: a new or reset password is returned
 * once, in the response to the manager who asked, and is otherwise held only
 * as a hash. There is no delete; a user is disabled instead.
 */
export const adminUserRoutes = new Hono<AppEnv>();
adminUserRoutes.use("/users", requireAuth, requireRole("mitmark_admin"));
adminUserRoutes.use("/users/*", requireAuth, requireRole("mitmark_admin"));

const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  role: z.enum(["client", "mitmark_admin"]),
  orgId: z.string().trim().min(1).max(128).nullable().optional(),
  displayName: z.string().trim().max(200).optional(),
  /** v1.7 (FRAGO 07 3.3). A client test seat; one active per organisation; never removed. */
  testSeat: z.boolean().optional(),
});

type UserStatus = "active" | "disabled" | "must_change_password";

function statusOf(u: UserRecord): UserStatus {
  if (u.disabled) return "disabled";
  if (u.mustChangePassword) return "must_change_password";
  return "active";
}

function view(u: UserRecord, orgNames: Map<string, string>) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    role: u.role,
    orgId: u.orgId,
    orgName: u.orgId ? (orgNames.get(u.orgId) ?? null) : null,
    status: statusOf(u),
    lastSignInAt: u.lastSignInAt ?? null,
    testSeat: u.testSeat === true,
  };
}

async function orgNamesFor(users: UserRecord[]): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  for (const id of new Set(users.map((u) => u.orgId).filter((x): x is string => !!x))) {
    const doc = await readOrg(id);
    if (doc) names.set(id, doc.branding.displayName || doc.name);
  }
  return names;
}

const activeManagers = (users: UserRecord[]) =>
  users.filter((u) => u.role === "mitmark_admin" && !u.disabled);

adminUserRoutes.get("/users", async (c) => {
  const { users } = await readUsers();
  const names = await orgNamesFor(users);
  const sorted = [...users].sort((a, b) => a.email.localeCompare(b.email));
  return c.json({ users: sorted.map((u) => view(u, names)) });
});

adminUserRoutes.get("/users/audit", async (c) => {
  const { audit = [] } = await readUsers();
  const entries = [...audit].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 500);
  return c.json({ entries });
});

adminUserRoutes.post("/users", async (c) => {
  const actor = c.get("user");
  const parsed = createUserSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Give an email address and a role." }, 400);
  const { email, role } = parsed.data;
  const orgId = parsed.data.orgId ?? null;

  if (role === "client" && !orgId) {
    return c.json({ error: "A client user belongs to one organisation. Choose it." }, 400);
  }
  if (role === "mitmark_admin" && orgId) {
    return c.json({ error: "A manager sees every organisation and belongs to none." }, 400);
  }
  if (orgId && !(await readOrg(orgId))) return c.json({ error: "No such organisation." }, 404);
  const testSeat = parsed.data.testSeat === true;
  if (testSeat && role !== "client") {
    return c.json({ error: "A test seat is a client user. Choose the client role and its organisation." }, 400);
  }

  const password = oneTimePassword();
  const passwordHash = await bcrypt.hash(password, 10);
  const created = await mutateUsers((doc) => {
    if (doc.users.some((u) => u.email === email)) return null;
    if (testSeat && doc.users.some((u) => u.testSeat && u.orgId === orgId && !u.disabled)) return "seat_taken" as const;
    const user: UserRecord = {
      id: newId(),
      orgId,
      email,
      passwordHash,
      role,
      displayName:
        parsed.data.displayName ||
        (testSeat ? "Test seat" : role === "client" ? "Information Officer" : "MITMARK officer"),
      createdAt: new Date().toISOString(),
      disabled: false,
      mustChangePassword: true,
      lastSignInAt: null,
      sessionEpoch: 0,
      ...(testSeat ? { testSeat: true } : {}),
    };
    doc.users.push(user);
    return user;
  });
  if (created === "seat_taken") {
    return c.json({ error: "This organisation already has an active test seat. Disable it before adding another." }, 409);
  }
  if (!created) return c.json({ error: "A user with that email address already exists." }, 409);

  await writeSystemAudit({
    orgId,
    actorId: actor.id,
    actorName: actor.displayName,
    action: "user.create",
    detail: `Created user ${created.id} as ${testSeat ? `the test seat of ${orgId} (test)` : role === "client" ? `a client user of ${orgId}` : "a manager"}; one-time password issued.`,
  });

  return c.json({ user: view(created, await orgNamesFor([created])), oneTimePassword: password }, 201);
});

adminUserRoutes.post("/users/:id/reset-password", async (c) => {
  const actor = c.get("user");
  const id = c.req.param("id");
  const password = oneTimePassword();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await mutateUsers((doc) => {
    const u = doc.users.find((x) => x.id === id);
    if (!u) return null;
    u.passwordHash = passwordHash;
    u.mustChangePassword = true;
    u.sessionEpoch = (u.sessionEpoch ?? 0) + 1;
    return u;
  });
  if (!user) return c.json({ error: "No such user." }, 404);

  await writeSystemAudit({
    orgId: user.orgId,
    actorId: actor.id,
    actorName: actor.displayName,
    action: "user.reset_password",
    detail: `Reset the password of user ${user.id}; one-time password issued; their sessions ended.`,
  });
  return c.json({ oneTimePassword: password });
});

adminUserRoutes.post("/users/:id/disable", async (c) => {
  const actor = c.get("user");
  const id = c.req.param("id");
  const outcome = await mutateUsers((doc) => {
    const u = doc.users.find((x) => x.id === id);
    if (!u) return { code: "not_found" as const };
    if (u.role === "mitmark_admin" && !u.disabled && activeManagers(doc.users).length <= 1) {
      return { code: "last_manager" as const };
    }
    u.disabled = true;
    u.sessionEpoch = (u.sessionEpoch ?? 0) + 1;
    return { code: "ok" as const, user: u };
  });
  if (outcome.code === "not_found") return c.json({ error: "No such user." }, 404);
  if (outcome.code === "last_manager") {
    return c.json({ error: "This is the last active manager and cannot be disabled." }, 409);
  }

  await writeSystemAudit({
    orgId: outcome.user.orgId,
    actorId: actor.id,
    actorName: actor.displayName,
    action: "user.disable",
    detail: `Disabled user ${outcome.user.id}; their sessions ended.`,
  });
  return c.json({ user: view(outcome.user, await orgNamesFor([outcome.user])) });
});

adminUserRoutes.post("/users/:id/enable", async (c) => {
  const actor = c.get("user");
  const id = c.req.param("id");
  const user = await mutateUsers((doc) => {
    const u = doc.users.find((x) => x.id === id);
    if (!u) return null;
    u.disabled = false;
    return u;
  });
  if (!user) return c.json({ error: "No such user." }, 404);

  await writeSystemAudit({
    orgId: user.orgId,
    actorId: actor.id,
    actorName: actor.displayName,
    action: "user.enable",
    detail: `Re-enabled user ${user.id}.`,
  });
  return c.json({ user: view(user, await orgNamesFor([user])) });
});

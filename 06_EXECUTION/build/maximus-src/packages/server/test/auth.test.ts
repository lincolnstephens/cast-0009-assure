import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { readOrg } from "../src/db/store.ts";
import type { AppEnv } from "../src/lib/middleware.ts";
import { authRoutes } from "../src/routes/auth.ts";
import {
  freshStore,
  seedTestUsers,
  sessionCookieOf,
  TEST_ADMIN_EMAIL,
  TEST_CLIENT_EMAIL,
  TEST_PASSWORD,
  type TestFixtures,
} from "./helpers.ts";

// A minimal app carrying only the routes this lane owns, so this suite never
// depends on whether another lane's route files have finished porting.
const app = new Hono<AppEnv>().basePath("/api").route("/auth", authRoutes);

let fixtures: TestFixtures;

beforeEach(async () => {
  freshStore();
  fixtures = await seedTestUsers();
});

function login(email: string, password: string) {
  return app.request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

describe("POST /api/auth/login", () => {
  it("signs in a valid user, sets an httpOnly cookie and creates a session", async () => {
    const res = await login(TEST_CLIENT_EMAIL, TEST_PASSWORD);
    expect(res.status).toBe(200);

    const setCookie = res.headers.get("set-cookie")!;
    expect(setCookie).toContain("assure_session=");
    expect(setCookie.toLowerCase()).toContain("httponly");
    expect(setCookie.toLowerCase()).toContain("secure");
    expect(setCookie.toLowerCase()).toContain("samesite=lax");

    const body = await res.json();
    expect(body.user.role).toBe("client");
    expect(body.user.clientAccountName).toBe("Test Organisation");
  });

  it("writes an audit entry on login (state change without audit = bug)", async () => {
    await login(TEST_CLIENT_EMAIL, TEST_PASSWORD);
    const org = await readOrg(fixtures.accountId);
    const rows = org!.audit.filter((a) => a.action === "auth.login");
    expect(rows).toHaveLength(1);
    expect(rows[0].actorId).toBe(fixtures.clientUserId);
    expect(rows[0].orgId).toBe(fixtures.accountId);
    expect(rows[0].actorName).toBeTruthy();
  });

  it("rejects a wrong password with 401 and creates no usable session", async () => {
    const res = await login(TEST_CLIENT_EMAIL, "wrong");
    expect(res.status).toBe(401);

    const ok = await login(TEST_CLIENT_EMAIL, TEST_PASSWORD);
    expect(ok.status).toBe(200);
  });

  it("rejects an unknown email with 401", async () => {
    const res = await login("nobody@test.example", TEST_PASSWORD);
    expect(res.status).toBe(401);
  });

  it("rejects malformed input with 400 (zod)", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "not-an-email", password: "" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  it("returns 401 without a session", async () => {
    const res = await app.request("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 for a forged cookie", async () => {
    const res = await app.request("/api/auth/me", {
      headers: {
        cookie: "assure_session=00000000-0000-0000-0000-000000000000.deadbeef",
      },
    });
    expect(res.status).toBe(401);
  });

  it("returns 401 for an expired session", async () => {
    const loginRes = await login(TEST_CLIENT_EMAIL, TEST_PASSWORD);
    const cookie = sessionCookieOf(loginRes);

    const { mutateUsers } = await import("../src/db/store.ts");
    await mutateUsers((doc) => {
      for (const session of doc.sessions) {
        session.expiresAt = new Date(Date.now() - 1000).toISOString();
      }
    });

    const res = await app.request("/api/auth/me", { headers: { cookie } });
    expect(res.status).toBe(401);
  });

  it("returns the signed-in user with account name and officer", async () => {
    const loginRes = await login(TEST_CLIENT_EMAIL, TEST_PASSWORD);
    const res = await app.request("/api/auth/me", {
      headers: { cookie: sessionCookieOf(loginRes) },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe(TEST_CLIENT_EMAIL);
    expect(body.user.clientAccountName).toBe("Test Organisation");
    expect(body.officer.displayName).toBe("Test Admin User");
  });
});

describe("POST /api/auth/logout", () => {
  it("destroys the session and writes an audit entry for an org-scoped user", async () => {
    const loginRes = await login(TEST_CLIENT_EMAIL, TEST_PASSWORD);
    const cookie = sessionCookieOf(loginRes);

    const res = await app.request("/api/auth/logout", {
      method: "POST",
      headers: { cookie },
    });
    expect(res.status).toBe(200);

    const org = await readOrg(fixtures.accountId);
    const rows = org!.audit.filter((a) => a.action === "auth.logout");
    expect(rows).toHaveLength(1);
    expect(rows[0].actorId).toBe(fixtures.clientUserId);

    const meAfter = await app.request("/api/auth/me", { headers: { cookie } });
    expect(meAfter.status).toBe(401);
  });

  it("destroys the session for an admin user with no organisation", async () => {
    // Admin users are not scoped to an org, so there is no audit document to
    // append to (writeAudit is a documented no-op when orgId is null). The
    // session must still be destroyed.
    const loginRes = await login(TEST_ADMIN_EMAIL, TEST_PASSWORD);
    const cookie = sessionCookieOf(loginRes);

    const res = await app.request("/api/auth/logout", {
      method: "POST",
      headers: { cookie },
    });
    expect(res.status).toBe(200);

    const meAfter = await app.request("/api/auth/me", { headers: { cookie } });
    expect(meAfter.status).toBe(401);
  });
});

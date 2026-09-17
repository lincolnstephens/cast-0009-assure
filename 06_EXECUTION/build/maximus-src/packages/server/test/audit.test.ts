import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { ensureOrg, readOrg } from "../src/db/store.ts";
import { writeAudit } from "../src/lib/audit.ts";
import type { AppEnv } from "../src/lib/middleware.ts";
import { authRoutes } from "../src/routes/auth.ts";
import { freshStore, seedTestUsers, TEST_CLIENT_EMAIL, TEST_PASSWORD } from "./helpers.ts";

// This lane owns `writeAudit`, not the admin audit-viewer route (that is
// another lane's file, `routes/adminAudit.ts`). These tests exercise the
// library function directly, plus one end-to-end check through the auth
// routes this lane does own, so they never depend on other lanes' porting
// status.

beforeEach(() => {
  freshStore();
});

describe("writeAudit", () => {
  it("appends an audit record to the organisation's document", async () => {
    await ensureOrg("org-a", "Organisation A");
    await writeAudit({
      orgId: "org-a",
      actorId: "user-1",
      actorName: "Test Admin User",
      action: "posture.update",
      detail: "domain=policies status=amber",
    });

    const org = await readOrg("org-a");
    expect(org!.audit).toHaveLength(1);
    const entry = org!.audit[0];
    expect(entry.orgId).toBe("org-a");
    expect(entry.actorId).toBe("user-1");
    expect(entry.actorName).toBe("Test Admin User");
    expect(entry.action).toBe("posture.update");
    expect(entry.detail).toBe("domain=policies status=amber");
    expect(entry.id).toBeTruthy();
    expect(entry.createdAt).toBeTruthy();
  });

  it("is append-only: two writes keep both entries, in order", async () => {
    await ensureOrg("org-a", "Organisation A");
    await writeAudit({ orgId: "org-a", actorId: null, actorName: "System", action: "a.one" });
    await writeAudit({ orgId: "org-a", actorId: null, actorName: "System", action: "a.two" });

    const org = await readOrg("org-a");
    expect(org!.audit.map((a) => a.action)).toEqual(["a.one", "a.two"]);
  });

  it("scopes entries to the correct organisation (no cross-tenant leak)", async () => {
    await ensureOrg("org-a", "Organisation A");
    await ensureOrg("org-b", "Organisation B");
    await writeAudit({ orgId: "org-a", actorId: null, actorName: "System", action: "a.only" });

    const orgA = await readOrg("org-a");
    const orgB = await readOrg("org-b");
    expect(orgA!.audit.some((a) => a.action === "a.only")).toBe(true);
    expect(orgB!.audit.some((a) => a.action === "a.only")).toBe(false);
  });

  it("is a no-op when there is no organisation to record against", async () => {
    await expect(
      writeAudit({
        orgId: null,
        actorId: "user-1",
        actorName: "Test Admin User",
        action: "auth.login",
      }),
    ).resolves.toBeUndefined();
  });

  it("defaults detail to an empty string when omitted", async () => {
    await ensureOrg("org-a", "Organisation A");
    await writeAudit({ orgId: "org-a", actorId: null, actorName: "System", action: "a.three" });
    const org = await readOrg("org-a");
    expect(org!.audit.find((a) => a.action === "a.three")!.detail).toBe("");
  });
});

describe("audit through the auth routes", () => {
  it("records the acting user's display name on login end to end", async () => {
    const fixtures = await seedTestUsers();
    const app = new Hono<AppEnv>().basePath("/api").route("/auth", authRoutes);

    await app.request("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: TEST_CLIENT_EMAIL, password: TEST_PASSWORD }),
    });

    const org = await readOrg(fixtures.accountId);
    const entry = org!.audit.find((a) => a.action === "auth.login");
    expect(entry?.actorName).toBe("Test Client User");
  });
});

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app.ts";
import { mutateOrg, readOrg, readUsers } from "../src/db/store.ts";
import { seedManifestSchema, tasksCreatedBy } from "../src/lib/seedManifest.ts";
import {
  freshStore,
  seedTestUsers,
  sessionCookieOf,
  TEST_ADMIN_EMAIL,
  TEST_CLIENT_EMAIL,
  TEST_PASSWORD,
  type TestFixtures,
} from "./helpers.ts";

// v1.5 (FRAGO 05): users, first sign-in, password change, organisations,
// the switcher's server side, the seed, and isolation between organisations.

const here = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = JSON.parse(
  readFileSync(path.resolve(here, "../../../../../gate/fixtures/seed_manifest_fixture.json"), "utf8"),
);

let fx: TestFixtures;
let admin: string;

async function login(email: string, password: string): Promise<{ status: number; cookie: string; body: any }> {
  const res = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  return { status: res.status, cookie: res.status === 200 ? sessionCookieOf(res) : "", body };
}

function call(p: string, cookie: string, method = "GET", body?: unknown) {
  return app.request(p, {
    method,
    headers: { cookie, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function createUser(body: Record<string, unknown>) {
  const res = await call("/api/admin/users", admin, "POST", body);
  return { status: res.status, body: (await res.json()) as any };
}

beforeEach(async () => {
  process.env.SESSION_SECRET ??= "test-secret";
  freshStore();
  fx = await seedTestUsers();
  admin = (await login(TEST_ADMIN_EMAIL, TEST_PASSWORD)).cookie;
});

describe("users", () => {
  it("creates a client user with a one-time password shown once and never stored or audited", async () => {
    const { status, body } = await createUser({ email: "new@test.example", role: "client", orgId: fx.accountId });
    expect(status).toBe(201);
    const otp: string = body.oneTimePassword;
    expect(otp).toMatch(/^[A-Za-z2-9]{5}(-[A-Za-z2-9]{5}){3}$/);
    expect(body.user.status).toBe("must_change_password");

    const list = await (await call("/api/admin/users", admin)).text();
    expect(list).not.toContain(otp);
    const usersDoc = JSON.stringify(await readUsers());
    expect(usersDoc).not.toContain(otp);
    const orgDoc = JSON.stringify(await readOrg(fx.accountId));
    expect(orgDoc).not.toContain(otp);

    const audit = (await (await call("/api/admin/users/audit", admin)).json()).entries;
    const entry = audit.find((a: any) => a.action === "user.create");
    expect(entry.detail).toContain(body.user.id);
    expect(entry.detail).not.toContain("new@test.example");
    expect((await readOrg(fx.accountId))!.audit.some((a) => a.action === "user.create")).toBe(true);
  });

  it("refuses a client user without an organisation and a manager with one, and a duplicate email", async () => {
    expect((await createUser({ email: "a@test.example", role: "client" })).status).toBe(400);
    expect((await createUser({ email: "b@test.example", role: "mitmark_admin", orgId: fx.accountId })).status).toBe(400);
    expect((await createUser({ email: TEST_CLIENT_EMAIL, role: "client", orgId: fx.accountId })).status).toBe(409);
  });

  it("is managers only", async () => {
    const client = (await login(TEST_CLIENT_EMAIL, TEST_PASSWORD)).cookie;
    expect((await call("/api/admin/users", client)).status).toBe(403);
  });

  it("disables a user, ends their sessions and refuses sign-in; re-enables", async () => {
    const client = (await login(TEST_CLIENT_EMAIL, TEST_PASSWORD)).cookie;
    expect((await call("/api/tracker/home", client)).status).toBe(200);
    expect((await call(`/api/admin/users/${fx.clientUserId}/disable`, admin, "POST")).status).toBe(200);
    expect((await call("/api/tracker/home", client)).status).toBe(401);
    expect((await login(TEST_CLIENT_EMAIL, TEST_PASSWORD)).status).toBe(401);
    expect((await call(`/api/admin/users/${fx.clientUserId}/enable`, admin, "POST")).status).toBe(200);
    expect((await login(TEST_CLIENT_EMAIL, TEST_PASSWORD)).status).toBe(200);
  });

  it("will not disable the last active manager", async () => {
    const res = await call(`/api/admin/users/${fx.adminUserId}/disable`, admin, "POST");
    expect(res.status).toBe(409);
    expect((await res.json()).error).toContain("last active manager");
  });

  it("resets a password: the old one stops working, sessions end, the user must change it", async () => {
    const client = (await login(TEST_CLIENT_EMAIL, TEST_PASSWORD)).cookie;
    const { oneTimePassword } = await (await call(`/api/admin/users/${fx.clientUserId}/reset-password`, admin, "POST")).json();
    expect((await call("/api/tracker/home", client)).status).toBe(401);
    expect((await login(TEST_CLIENT_EMAIL, TEST_PASSWORD)).status).toBe(401);
    const fresh = await login(TEST_CLIENT_EMAIL, oneTimePassword);
    expect(fresh.status).toBe(200);
    expect(fresh.body.user.mustChangePassword).toBe(true);
  });
});

describe("first sign-in and password change", () => {
  it("opens nothing but /auth until the one-time password is replaced", async () => {
    const { body } = await createUser({ email: "first@test.example", role: "client", orgId: fx.accountId });
    const s = await login("first@test.example", body.oneTimePassword);
    const blocked = await call("/api/tracker/home", s.cookie);
    expect(blocked.status).toBe(403);
    expect((await blocked.json()).code).toBe("password_change_required");
    expect((await call("/api/auth/me", s.cookie)).status).toBe(200);

    const short = await call("/api/auth/password", s.cookie, "POST", {
      currentPassword: body.oneTimePassword,
      newPassword: "too-short",
    });
    expect(short.status).toBe(400);
    expect((await short.json()).error).toContain("12 characters");

    const ok = await call("/api/auth/password", s.cookie, "POST", {
      currentPassword: body.oneTimePassword,
      newPassword: "a-long-enough-password",
    });
    expect(ok.status).toBe(200);
    const next = sessionCookieOf(ok);
    expect((await call("/api/tracker/home", next)).status).toBe(200);
  });

  it("ends every other session of the user, and keeps this one", async () => {
    const one = (await login(TEST_CLIENT_EMAIL, TEST_PASSWORD)).cookie;
    const two = (await login(TEST_CLIENT_EMAIL, TEST_PASSWORD)).cookie;
    const res = await call("/api/auth/password", one, "POST", {
      currentPassword: TEST_PASSWORD,
      newPassword: "another-long-password",
    });
    expect(res.status).toBe(200);
    const replaced = sessionCookieOf(res);
    expect((await call("/api/tracker/home", two)).status).toBe(401);
    expect((await call("/api/tracker/home", one)).status).toBe(401);
    expect((await call("/api/tracker/home", replaced)).status).toBe(200);
  });

  it("never writes a password or a session id to the audit", async () => {
    await login(TEST_CLIENT_EMAIL, TEST_PASSWORD);
    const s = await login(TEST_CLIENT_EMAIL, TEST_PASSWORD);
    await call("/api/auth/password", s.cookie, "POST", { currentPassword: TEST_PASSWORD, newPassword: "third-long-password" });
    const text = JSON.stringify((await readOrg(fx.accountId))!.audit) + JSON.stringify((await readUsers()).audit ?? []);
    expect(text).not.toContain(TEST_PASSWORD);
    expect(text).not.toContain("third-long-password");
    expect(text).not.toMatch(/session=[0-9a-f-]{20,}/);
    const sessionId = decodeURIComponent(s.cookie.split("=")[1]).split(".")[0];
    expect(text).not.toContain(sessionId);
  });
});

describe("organisations", () => {
  async function newOrg(name: string): Promise<string> {
    const res = await call("/api/admin/organisations", admin, "POST", { name, jurisdiction: "UK" });
    expect(res.status).toBe(201);
    return (await res.json()).organisation.id;
  }

  it("creates an empty organisation, and the library preview count is what apply creates", async () => {
    const id = await newOrg("Second Organisation");
    expect(id).toMatch(/^org-[0-9a-f]{10}$/);
    expect((await readOrg(id))!.tasks).toHaveLength(0);
    const preview = await (await call(`/api/admin/workplan/apply-library/preview?org=${id}&startDate=2026-10-01`, admin)).json();
    expect(preview.willCreate).toBeGreaterThan(0);
    expect((await readOrg(id))!.tasks).toHaveLength(0);
    const applied = await (
      await call(`/api/admin/workplan/apply-library?org=${id}`, admin, "POST", { startDate: "2026-10-01" })
    ).json();
    expect(applied.created).toBe(preview.willCreate);
  });

  it("refuses an admin request that names no organisation, rather than falling back to one", async () => {
    expect((await call("/api/admin/settings", admin)).status).toBe(400);
    expect((await call("/api/admin/workplan", admin)).status).toBe(400);
  });

  it("takes the organisation from the switcher's header", async () => {
    const id = await newOrg("Header Organisation");
    const res = await app.request("/api/admin/settings", { headers: { cookie: admin, "x-assure-org": id } });
    expect(res.status).toBe(200);
    expect((await res.json()).name).toBe("Header Organisation");
  });

  it("keeps settings per organisation", async () => {
    const id = await newOrg("Isolated Organisation");
    await call(`/api/admin/settings?org=${id}`, admin, "PUT", { journeyNote: "only here" });
    expect((await readOrg(fx.accountId))!.settings.journeyNote).toBe("");
    expect((await readOrg(id))!.settings.journeyNote).toBe("only here");
  });

  it("never gives a client user another organisation's records", async () => {
    const other = await newOrg("Other Organisation");
    await call(`/api/admin/organisations/${other}/seed?org=${other}`, admin, "POST", { manifest: FIXTURE });
    const { body } = await createUser({ email: "other@test.example", role: "client", orgId: other });
    const s = await login("other@test.example", body.oneTimePassword);
    const ok = await call("/api/auth/password", s.cookie, "POST", {
      currentPassword: body.oneTimePassword,
      newPassword: "other-long-password",
    });
    const otherCookie = sessionCookieOf(ok);
    const mine = (await login(TEST_CLIENT_EMAIL, TEST_PASSWORD)).cookie;
    await mutateOrg(fx.accountId, (doc) => {
      doc.tasks.push({ ...(doc.tasks[0] ?? {}), id: "home-task", orgId: fx.accountId, area: 1, phase: 1, title: "Home only", how: "", howLink: null, ownerType: "mitmark", ownerRole: "", dueAt: null, recurrence: "once", status: "not_started", progress: 0, evidence: [], notes: "", source: "manual", recordEntryId: null, closedAt: null, clientConfirmedAt: null, clientConfirmedBy: null, createdBy: "t", updatedBy: "t", updatedAt: new Date().toISOString() });
    });
    for (const p of ["/api/tracker/jobs", "/api/tracker/home", "/api/tracker/areas/1", "/api/tracker/documents"]) {
      const theirs = await (await call(p, otherCookie)).text();
      expect(theirs, p).not.toContain("home-task");
      expect(theirs, p).not.toContain(`"orgId":"${fx.accountId}"`);
      const ours = await (await call(p, mine)).text();
      expect(ours, p).not.toContain(`"orgId":"${other}"`);
    }
  });
});

describe("the seed", () => {
  it("dry-runs without writing, seeds with counts, refuses a second run without replace", async () => {
    const res0 = await call("/api/admin/organisations", admin, "POST", { name: "Seeded Organisation" });
    const id = (await res0.json()).organisation.id;
    const url = `/api/admin/organisations/${id}/seed?org=${id}`;

    const expected = tasksCreatedBy(seedManifestSchema.parse(FIXTURE));
    const dry = await (await call(url, admin, "POST", { manifest: FIXTURE, dryRun: true })).json();
    expect(dry.wouldCreate.tasks).toBe(expected);
    expect((await readOrg(id))!.tasks).toHaveLength(0);

    const real = await (await call(url, admin, "POST", { manifest: FIXTURE })).json();
    expect(real.after.tasks).toBe(expected);
    const doc = (await readOrg(id))!;
    expect(doc.settings.journeyPhase).toBe(FIXTURE.organisation.settings.journeyPhase);
    expect(doc.settings.regulationLabel).toBe(FIXTURE.organisation.regulation);
    expect(doc.tasks.filter((t) => t.status === "done")).toHaveLength(
      FIXTURE.tasks.filter((t: { status: string }) => t.status === "done").length,
    );
    // Every task keeps its manifest reference.
    for (const t of FIXTURE.tasks) expect(doc.tasks.some((x) => x.source.endsWith(`:${t.ref}`)), t.ref).toBe(true);

    expect((await call(url, admin, "POST", { manifest: FIXTURE })).status).toBe(409);
    const again = await (await call(url, admin, "POST", { manifest: FIXTURE, replace: true })).json();
    expect(again.after.tasks).toBe(expected);
  });

  it("puts a clock on its task, or on a new open task when that task is done", async () => {
    const res0 = await call("/api/admin/organisations", admin, "POST", { name: "Clock Organisation" });
    const id = (await res0.json()).organisation.id;
    const manifest = {
      tasks: [
        { ref: "A", area: 1, title: "Renewal", ownerType: "mitmark", status: "done", dueAt: null },
        { ref: "B", area: 2, title: "Review", ownerType: "mitmark", status: "not_started", dueAt: null },
      ],
      clocks: [
        { ref: "C1", kind: "registration_renewal", dueAt: "2027-03-21", note: "Next renewal.", taskRef: "A" },
        { ref: "C2", kind: "register_review", dueAt: "2026-09-15", note: "Overdue.", taskRef: "B" },
      ],
    };
    const r = await (await call(`/api/admin/organisations/${id}/seed?org=${id}`, admin, "POST", { manifest })).json();
    expect(r.after.tasks).toBe(3);
    const tasks = (await readOrg(id))!.tasks;
    const next = tasks.find((t) => t.source === "clock:C1")!;
    expect(next.status).toBe("not_started");
    expect(next.dueAt).toBe("2027-03-21");
    expect(tasks.find((t) => t.source.endsWith(":A"))!.status).toBe("done");
    const review = tasks.find((t) => t.source.endsWith(":B"))!;
    expect(review.dueAt).toBe("2026-09-15");
    expect(review.notes).toContain("Overdue.");
    expect((await readOrg(id))!.clocks).toHaveLength(0);
  });

  it("refuses a manifest that does not read", async () => {
    const res0 = await call("/api/admin/organisations", admin, "POST", { name: "Bad Manifest" });
    const id = (await res0.json()).organisation.id;
    const res = await call(`/api/admin/organisations/${id}/seed?org=${id}`, admin, "POST", {
      manifest: { tasks: [{ ref: "X", area: 9, title: "x", ownerType: "mitmark" }] },
    });
    expect(res.status).toBe(400);
  });
});

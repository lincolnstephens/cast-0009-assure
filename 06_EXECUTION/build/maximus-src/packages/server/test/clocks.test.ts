/**
 * Ported from Drizzle+Postgres to the JSON document store (see
 * PORTING_BRIEF.md). Two cross-lane modules this suite would otherwise need
 * are not yet ported and are mocked here rather than edited:
 *
 * - lib/middleware.ts (AUTH lane): still imports the deleted db/index.ts, so
 *   `requireAuth`/`requireRole` cannot run. The mock reads a fake signed-in
 *   user from an `x-test-user` header instead of a session cookie, and
 *   applies the same role check.
 * - lib/audit.ts (AUTH lane): still imports the deleted db/schema.ts. The
 *   mock implements the write for real, against the real store, using the
 *   `writeAudit(orgId, user, action, detail)` shape and the AuditRecord
 *   fields already established by the ported routes/adminRecord.ts, so the
 *   assertions below exercise genuine behaviour rather than a stub.
 *
 * Both are flagged in this lane's final report as cross-lane dependencies.
 */
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Hono } from "hono";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Context, Next } from "hono";

interface FakeUser {
  sessionId: string;
  id: string;
  email: string;
  displayName: string;
  role: "client" | "mitmark_admin";
  clientAccountId: string | null;
}

vi.mock("../src/lib/middleware.ts", () => ({
  requireAuth: async (c: Context, next: Next) => {
    const raw = c.req.header("x-test-user");
    if (!raw) return c.json({ error: "Not signed in" }, 401);
    c.set("user", JSON.parse(raw));
    await next();
  },
  requireRole: (role: string) => async (c: Context, next: Next) => {
    const user = c.get("user") as FakeUser | undefined;
    if (!user || user.role !== role) return c.json({ error: "Forbidden" }, 403);
    await next();
  },
}));

vi.mock("../src/lib/audit.ts", () => ({
  writeAudit: async (orgId: string, user: FakeUser, action: string, detail: string) => {
    const { mutateOrg, newId } = await import("../src/db/store.ts");
    await mutateOrg(orgId, (doc) => {
      doc.audit.push({
        id: newId(),
        orgId,
        actorId: user.id,
        actorName: user.displayName,
        action,
        detail,
        createdAt: new Date().toISOString(),
      });
    });
  },
}));

import { ensureOrg, mutateOrg, readOrg, resetDriver } from "../src/db/store.ts";
import { adminRoutes } from "../src/routes/adminClocks.ts";
import { clockRoutes, requestRoutes } from "../src/routes/clocks.ts";
import { createIntakeWithClock } from "../src/lib/intakes.ts";
import type { AppEnv } from "../src/lib/middleware.ts";

function buildApp() {
  const app = new Hono<AppEnv>().basePath("/api");
  app.route("/clocks", clockRoutes);
  app.route("/requests", requestRoutes);
  app.route("/admin", adminRoutes);
  return app;
}
const app = buildApp();

let dataDir: string;
let clientUser: FakeUser;
let adminUser: FakeUser;
let orgId: string;

beforeEach(async () => {
  dataDir = mkdtempSync(path.join(os.tmpdir(), "assure-clocks-"));
  process.env.ASSURE_DATA_DIR = dataDir;
  process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? "test-secret";
  resetDriver();

  const doc = await ensureOrg("pemberton", "Pemberton Estates Ltd");
  orgId = doc.id;
  clientUser = {
    sessionId: "s-client",
    id: "client-1",
    email: "ea@pemberton.example",
    displayName: "Eleanor Ashworth",
    role: "client",
    clientAccountId: orgId,
  };
  adminUser = {
    sessionId: "s-admin",
    id: "admin-1",
    email: "officer@mitmark.example",
    displayName: "Marcus Holt",
    role: "mitmark_admin",
    clientAccountId: null,
  };
});

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

function asUser(user: FakeUser, method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { "x-test-user": JSON.stringify(user), "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

/** Second tenant with its own clock, for cross-tenant isolation tests. */
async function seedOtherTenantClock() {
  const other = await ensureOrg("halloway", "Halloway Logistics Ltd");
  const result = await mutateOrg(other.id, (doc) =>
    createIntakeWithClock(doc, {
      type: "sar",
      source: "manual",
      summary: "Other tenant SAR",
      raisedBy: "other-user",
    }),
  );
  return { accountId: other.id, clockId: result.clock.id };
}

describe("POST /api/requests (raise a request)", () => {
  it("creates intake + clock + review item and writes an audit row", async () => {
    const res = await app.request(
      "/api/requests",
      asUser(clientUser, "POST", {
        type: "data_request",
        details: "A leaseholder has asked for a copy of all records we hold.",
      }),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.reference).toMatch(/^SAR-[0-9A-F]{8}$/);

    const doc = await readOrg(orgId);
    const intake = doc!.intakes[0];
    expect(intake.orgId).toBe(orgId);
    expect(intake.type).toBe("sar");
    expect(intake.source).toBe("manual");

    const clock = doc!.clocks[0];
    expect(clock.intakeId).toBe(intake.id);
    expect(clock.kind).toBe("sar_1_month");
    expect(new Date(clock.dueAt).getTime()).toBeGreaterThan(new Date(clock.startedAt).getTime());

    const item = doc!.review[0];
    expect(item.type).toBe("intake");
    expect(item.refId).toBe(intake.id);
    expect(item.state).toBe("pending");

    // A state change without an audit write is a failing test by definition.
    const audits = doc!.audit.filter((a) => a.action === "intake.create");
    expect(audits).toHaveLength(1);
    expect(audits[0].actorId).toBe(clientUser.id);
  });

  it("maps 'concern' to a 72-hour breach clock", async () => {
    await app.request(
      "/api/requests",
      asUser(clientUser, "POST", { type: "concern", details: "Lost a site key fob." }),
    );
    const doc = await readOrg(orgId);
    const clock = doc!.clocks[0];
    expect(clock.kind).toBe("breach_72h");
    expect(new Date(clock.dueAt).getTime() - new Date(clock.startedAt).getTime()).toBe(
      72 * 3600 * 1000,
    );
  });

  it("rejects admin users (clients only)", async () => {
    const res = await app.request(
      "/api/requests",
      asUser(adminUser, "POST", { type: "concern", details: "x" }),
    );
    expect(res.status).toBe(403);
  });
});

describe("GET /api/clocks", () => {
  it("returns only the signed-in tenant's clocks, split active/closed", async () => {
    await seedOtherTenantClock();
    await app.request(
      "/api/requests",
      asUser(clientUser, "POST", { type: "data_request", details: "Own SAR." }),
    );

    const res = await app.request("/api/clocks", { headers: { "x-test-user": JSON.stringify(clientUser) } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.active).toHaveLength(1); // other tenant's clock invisible
    expect(body.closed).toHaveLength(0);
    expect(body.active[0].status).toBe("green");
    expect(body.active[0].latestNote).toContain("SAR clock started");
  });
});

describe("cross-tenant isolation (spec §8/§11)", () => {
  it("client fetching another tenant's clock timeline gets 403", async () => {
    const other = await seedOtherTenantClock();
    const res = await app.request(`/api/clocks/${other.clockId}`, {
      headers: { "x-test-user": JSON.stringify(clientUser) },
    });
    expect(res.status).toBe(403);
  });

  it("client routes are inaccessible without a session", async () => {
    const res = await app.request("/api/clocks");
    expect(res.status).toBe(401);
  });

  it("admin clock endpoints reject client users", async () => {
    const res = await app.request(`/api/admin/clocks?accountId=${orgId}`, {
      headers: { "x-test-user": JSON.stringify(clientUser) },
    });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/clocks/:id", () => {
  it("returns the event timeline for an own-tenant clock", async () => {
    const raise = await app.request(
      "/api/requests",
      asUser(clientUser, "POST", { type: "data_request", details: "Own SAR." }),
    );
    const { clockId } = await raise.json();

    const res = await app.request(`/api/clocks/${clockId}`, {
      headers: { "x-test-user": JSON.stringify(clientUser) },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.kind).toBe("sar_1_month");
    expect(body.events).toHaveLength(1);
    expect(body.events[0].event).toBe("started");
  });
});

describe("admin clock management", () => {
  async function raiseOwnSar(): Promise<string> {
    const res = await app.request(
      "/api/requests",
      asUser(clientUser, "POST", { type: "data_request", details: "SAR for admin tests." }),
    );
    return (await res.json()).clockId;
  }

  it("lists clocks for an account", async () => {
    const clockId = await raiseOwnSar();
    const res = await app.request(`/api/admin/clocks?accountId=${orgId}`, {
      headers: { "x-test-user": JSON.stringify(adminUser) },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.clocks.map((c: { id: string }) => c.id)).toContain(clockId);
  });

  it("adds an event with an audit row", async () => {
    const clockId = await raiseOwnSar();
    const res = await app.request(
      `/api/admin/clocks/${clockId}/events`,
      asUser(adminUser, "POST", { note: "Identity of requester verified." }),
    );
    expect(res.status).toBe(201);

    const doc = await readOrg(orgId);
    const events = doc!.clockEvents.filter(
      (e) => e.clockId === clockId && e.note === "Identity of requester verified.",
    );
    expect(events).toHaveLength(1);

    const audits = doc!.audit.filter((a) => a.action === "clock.event_add");
    expect(audits).toHaveLength(1);
    expect(audits[0].actorId).toBe(adminUser.id);
  });

  it("refuses to close a SAR without the inside-statute flag", async () => {
    const clockId = await raiseOwnSar();
    const res = await app.request(
      `/api/admin/clocks/${clockId}/close`,
      asUser(adminUser, "POST", { outcome: "Responded." }),
    );
    expect(res.status).toBe(400);
  });

  it("closes a SAR, recording outcome and an audit row; closing again -> 409", async () => {
    const clockId = await raiseOwnSar();
    const res = await app.request(
      `/api/admin/clocks/${clockId}/close`,
      asUser(adminUser, "POST", { outcome: "Responded within statute.", insideStatute: true }),
    );
    expect(res.status).toBe(200);

    const doc = await readOrg(orgId);
    const clock = doc!.clocks.find((c) => c.id === clockId)!;
    expect(clock.closedAt).not.toBeNull();
    expect(clock.outcome).toBe("Responded within statute.");

    const audits = doc!.audit.filter((a) => a.action === "clock.close");
    expect(audits).toHaveLength(1);
    expect(audits[0].detail).toContain("Inside statute: yes");

    // closing again → 409
    const again = await app.request(
      `/api/admin/clocks/${clockId}/close`,
      asUser(adminUser, "POST", { outcome: "x", insideStatute: true }),
    );
    expect(again.status).toBe(409);
  });

  it("creates a manual intake with clock and audit row", async () => {
    const res = await app.request(
      "/api/admin/intakes",
      asUser(adminUser, "POST", {
        clientAccountId: orgId,
        type: "breach",
        summary: "Contractor reported a misdirected email.",
      }),
    );
    expect(res.status).toBe(201);
    const doc = await readOrg(orgId);
    const clock = doc!.clocks[0];
    expect(clock.kind).toBe("breach_72h");
    const audits = doc!.audit.filter((a) => a.action === "intake.create");
    expect(audits).toHaveLength(1);
    expect(audits[0].actorId).toBe(adminUser.id);
  });

  it("closing a clock creates exactly one Record entry, linked back via entryId", async () => {
    const clockId = await raiseOwnSar();
    await app.request(
      `/api/admin/clocks/${clockId}/close`,
      asUser(adminUser, "POST", { outcome: "Responded within statute.", insideStatute: true }),
    );

    const doc = await readOrg(orgId);
    const clock = doc!.clocks.find((c) => c.id === clockId)!;
    expect(clock.entryId).not.toBeNull();

    const entries = doc!.entries.filter((e) => e.sourceRef === clockId);
    expect(entries).toHaveLength(1);
    const entry = entries[0];
    expect(entry.id).toBe(clock.entryId);
    expect(entry.line).toBe(4); // SAR -> DSAR support
    expect(entry.hours).toBe(6);
    expect(entry.deadline).toBe("DSAR one month");
    expect(entry.reviewer).toBe(adminUser.displayName);
    expect(entry.outcome).toBe("Responded within statute.");
    expect(entry.source).toBe("clock");
    expect(entry.sourceRef).toBe(clockId);
    expect(entry.ill).toBe(false);
    expect(entry.reviewed).toBe(true);
    expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("closing a breach clock creates a line-5 entry with an 8-hour default", async () => {
    const raise = await app.request(
      "/api/requests",
      asUser(clientUser, "POST", { type: "concern", details: "Possible incident." }),
    );
    const { clockId } = await raise.json();
    await app.request(
      `/api/admin/clocks/${clockId}/close`,
      asUser(adminUser, "POST", { outcome: "No notification required." }),
    );

    const doc = await readOrg(orgId);
    const entry = doc!.entries.find((e) => e.sourceRef === clockId)!;
    expect(entry.line).toBe(5);
    expect(entry.hours).toBe(8);
    expect(entry.deadline).toBe("Breach 72 hours");
    expect(entry.what).toContain("ICO notification threshold");
  });
});

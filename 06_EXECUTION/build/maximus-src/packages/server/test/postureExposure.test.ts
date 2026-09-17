import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import { getDb } from "../src/db";
import {
  auditLog,
  clientAccounts,
  exposureAlerts,
  postureDomainHistory,
  postureDomains,
  users,
} from "../src/db/schema";
import {
  prepareTestDatabase,
  resetTables,
  seedTestUsers,
  sessionCookieOf,
  type TestFixtures,
} from "./helpers";

let fixtures: TestFixtures;
let clientCookie: string;
let adminCookie: string;
let domainId: string;

beforeAll(async () => {
  await prepareTestDatabase();
});

beforeEach(async () => {
  await resetTables();
  fixtures = await seedTestUsers();
  clientCookie = sessionCookieOf(await login("ea@pemberton.example"));
  adminCookie = sessionCookieOf(await login("officer@mitmark.example"));

  const db = getDb();
  const [domain] = await db
    .insert(postureDomains)
    .values({
      clientAccountId: fixtures.accountId,
      domain: "policies",
      status: "green",
      note: "Initial note.",
      updatedBy: fixtures.adminUserId,
    })
    .returning();
  domainId = domain.id;
  await db.insert(postureDomainHistory).values({
    postureDomainId: domain.id,
    clientAccountId: fixtures.accountId,
    domain: "policies",
    status: "green",
    note: "Initial note.",
    updatedBy: fixtures.adminUserId,
    recordedAt: new Date(),
  });
});

async function login(email: string) {
  return app.request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: "correct-horse" }),
  });
}

describe("posture", () => {
  it("officer update requires a note and writes history + audit", async () => {
    const res = await app.request(`/api/admin/posture/${domainId}`, {
      method: "PUT",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      body: JSON.stringify({ status: "amber", note: "Policy review overdue." }),
    });
    expect(res.status).toBe(200);

    const db = getDb();
    const [row] = await db.select().from(postureDomains).where(eq(postureDomains.id, domainId));
    expect(row.status).toBe("amber");
    expect(row.note).toBe("Policy review overdue.");

    const history = await db
      .select()
      .from(postureDomainHistory)
      .where(eq(postureDomainHistory.postureDomainId, domainId));
    expect(history).toHaveLength(2);

    const audits = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.action, "posture.update"));
    expect(audits).toHaveLength(1);
  });

  it("rejects posture update without a note", async () => {
    const res = await app.request(`/api/admin/posture/${domainId}`, {
      method: "PUT",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      body: JSON.stringify({ status: "red", note: "   " }),
    });
    expect(res.status).toBe(400);
  });

  it("client can read posture with history; cannot update", async () => {
    const list = await app.request("/api/posture", { headers: { cookie: clientCookie } });
    expect(list.status).toBe(200);
    const body = await list.json();
    expect(body.domains).toHaveLength(1);
    expect(body.domains[0].history.length).toBeGreaterThanOrEqual(1);

    const denied = await app.request(`/api/admin/posture/${domainId}`, {
      method: "PUT",
      headers: { cookie: clientCookie, "content-type": "application/json" },
      body: JSON.stringify({ status: "green", note: "nope" }),
    });
    expect(denied.status).toBe(403);
  });

  it("cross-tenant: client sees only their posture domains", async () => {
    const db = getDb();
    const [other] = await db
      .insert(clientAccounts)
      .values({ name: "Halloway Logistics Ltd" })
      .returning();
    await db.insert(postureDomains).values({
      clientAccountId: other.id,
      domain: "ropa",
      status: "red",
      note: "Other tenant only.",
    });
    await db.insert(users).values({
      email: "ops@halloway.example",
      passwordHash: await bcrypt.hash("correct-horse", 10),
      role: "client",
      displayName: "Other Tenant",
      clientAccountId: other.id,
    });
    const otherCookie = sessionCookieOf(await login("ops@halloway.example"));

    const res = await (
      await app.request("/api/posture", { headers: { cookie: otherCookie } })
    ).json();
    expect(res.domains).toHaveLength(1);
    expect(res.domains[0].domain).toBe("ropa");
    expect(res.domains.every((d: { note: string }) => d.note !== "Initial note.")).toBe(true);
  });
});

describe("exposure alerts", () => {
  it("creates demo alerts with is_demo true; rejects isDemo override", async () => {
    const ok = await app.request("/api/admin/exposure", {
      method: "POST",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      body: JSON.stringify({
        clientAccountId: fixtures.accountId,
        kind: "test_kind",
        severity: "low",
        summary: "Synthetic test alert.",
      }),
    });
    expect(ok.status).toBe(201);
    const { id } = await ok.json();

    const db = getDb();
    const [alert] = await db.select().from(exposureAlerts).where(eq(exposureAlerts.id, id));
    expect(alert.isDemo).toBe(true);

    const audits = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.action, "exposure.create_demo"));
    expect(audits).toHaveLength(1);

    const blocked = await app.request("/api/admin/exposure", {
      method: "POST",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      body: JSON.stringify({
        clientAccountId: fixtures.accountId,
        kind: "live",
        severity: "high",
        summary: "Trying to fake live.",
        isDemo: false,
      }),
    });
    expect(blocked.status).toBe(400);
  });

  it("state transition requires officer note and writes audit; client sees note", async () => {
    const db = getDb();
    const [alert] = await db
      .insert(exposureAlerts)
      .values({
        clientAccountId: fixtures.accountId,
        kind: "credential_exposure",
        severity: "high",
        summary: "Test alert.",
        isDemo: true,
      })
      .returning();

    const res = await app.request(`/api/admin/exposure/${alert.id}/state`, {
      method: "PUT",
      headers: { cookie: adminCookie, "content-type": "application/json" },
      body: JSON.stringify({
        state: "triaged",
        officerNote: "Credentials rotated.",
      }),
    });
    expect(res.status).toBe(200);

    const clientView = await (
      await app.request("/api/exposure", { headers: { cookie: clientCookie } })
    ).json();
    const found = clientView.alerts.find((a: { id: string }) => a.id === alert.id);
    expect(found.state).toBe("triaged");
    expect(found.officerNote).toBe("Credentials rotated.");
    expect(found.isDemo).toBe(true);

    const audits = await db
      .select()
      .from(auditLog)
      .where(
        and(eq(auditLog.action, "exposure.state_change"), eq(auditLog.entityId, alert.id)),
      );
    expect(audits).toHaveLength(1);
  });

  it("cross-tenant: client exposure feed excludes other accounts", async () => {
    const db = getDb();
    const [other] = await db
      .insert(clientAccounts)
      .values({ name: "Halloway Logistics Ltd" })
      .returning();
    await db.insert(exposureAlerts).values({
      clientAccountId: other.id,
      kind: "secret",
      severity: "critical",
      summary: "Must not leak.",
      isDemo: true,
    });
    await db.insert(exposureAlerts).values({
      clientAccountId: fixtures.accountId,
      kind: "visible",
      severity: "low",
      summary: "Pemberton alert.",
      isDemo: true,
    });
    await db.insert(users).values({
      email: "ops@halloway.example",
      passwordHash: await bcrypt.hash("correct-horse", 10),
      role: "client",
      displayName: "Other Tenant",
      clientAccountId: other.id,
    });
    const otherCookie = sessionCookieOf(await login("ops@halloway.example"));

    const pemberton = await (
      await app.request("/api/exposure", { headers: { cookie: clientCookie } })
    ).json();
    expect(pemberton.alerts).toHaveLength(1);
    expect(pemberton.alerts[0].summary).toBe("Pemberton alert.");

    const otherView = await (
      await app.request("/api/exposure", { headers: { cookie: otherCookie } })
    ).json();
    expect(otherView.alerts).toHaveLength(1);
    expect(otherView.alerts[0].summary).toBe("Must not leak.");
  });

  it("client cannot access admin exposure routes", async () => {
    const res = await app.request(
      `/api/admin/exposure?accountId=${fixtures.accountId}`,
      { headers: { cookie: clientCookie } },
    );
    expect(res.status).toBe(403);
  });
});

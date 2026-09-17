/**
 * Ported from Drizzle+Postgres to the JSON document store (see
 * PORTING_BRIEF.md). See clocks.test.ts for why lib/middleware.ts and
 * lib/audit.ts are mocked rather than imported for real — both are AUTH-lane
 * files still wired to the deleted db/index.ts and db/schema.ts.
 *
 * Posture history changed shape in the port: `PostureHistoryRecord` is one
 * row per (domain, ISO week) rather than one row per edit (db/model.ts), so
 * the "writes history" assertion below seeds an initial point in an earlier
 * week and checks that an edit in the current week adds a second point,
 * rather than asserting on edit count — that is what the new weekly-snapshot
 * model actually promises. See this lane's final report for the reasoning.
 *
 * Exposure alerts changed shape too: `ExposureAlertRecord` has only `title`
 * with kind, severity, summary and the officer's note as their own fields
 * columns (db/model.ts). Assertions that read those now read `detail`, which
 * carries the same information as free text — see routes/adminExposure.ts.
 */
import { randomUUID } from "node:crypto";
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

// The audit module writes straight to the organisation document, so the real
// one is used here rather than a stand-in.

import { ensureOrg, mutateOrg, newId, readOrg, resetDriver } from "../src/db/store.ts";
import { mondayOf } from "../src/lib/posture.ts";
import { adminExposureRoutes } from "../src/routes/adminExposure.ts";
import { adminPostureRoutes } from "../src/routes/adminPosture.ts";
import { exposureRoutes } from "../src/routes/exposure.ts";
import { postureRoutes } from "../src/routes/posture.ts";
import type { AppEnv } from "../src/lib/middleware.ts";

function buildApp() {
  const app = new Hono<AppEnv>().basePath("/api");
  app.route("/posture", postureRoutes);
  app.route("/exposure", exposureRoutes);
  app.route("/admin", adminPostureRoutes);
  app.route("/admin", adminExposureRoutes);
  return app;
}
const app = buildApp();

let dataDir: string;
let clientUser: FakeUser;
let adminUser: FakeUser;
let orgId: string;
let domainId: string;

function asUser(user: FakeUser, method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { "x-test-user": JSON.stringify(user), "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

beforeEach(async () => {
  dataDir = mkdtempSync(path.join(os.tmpdir(), "assure-posture-"));
  process.env.ASSURE_DATA_DIR = dataDir;
  process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? "test-secret";
  resetDriver();

  const doc = await ensureOrg(randomUUID(), "Pemberton Estates Ltd");
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

  const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 3600 * 1000);
  await mutateOrg(orgId, (d) => {
    domainId = newId();
    d.posture.push({
      id: domainId,
      orgId,
      domain: "policies",
      label: "Policies",
      rag: "green",
      note: "Initial note.",
      setBy: adminUser.displayName,
      setAt: threeWeeksAgo.toISOString(),
    });
    d.postureHistory.push({
      id: newId(),
      orgId,
      domain: "policies",
      weekOf: mondayOf(threeWeeksAgo),
      rag: "green",
    });
  });
});

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

describe("posture", () => {
  it("officer update requires a note and writes weekly history + audit", async () => {
    const res = await app.request(
      `/api/admin/posture/${domainId}`,
      asUser(adminUser, "PUT", { status: "amber", note: "Policy review overdue." }),
    );
    expect(res.status).toBe(200);

    const doc = await readOrg(orgId);
    const domain = doc!.posture.find((d) => d.id === domainId)!;
    expect(domain.rag).toBe("amber");
    expect(domain.note).toBe("Policy review overdue.");

    const history = doc!.postureHistory.filter((h) => h.domain === "policies");
    expect(history).toHaveLength(2); // the seeded week, plus this week

    const audits = doc!.audit.filter((a) => a.action === "posture.update");
    expect(audits).toHaveLength(1);
  });

  it("rejects posture update without a note", async () => {
    const res = await app.request(
      `/api/admin/posture/${domainId}`,
      asUser(adminUser, "PUT", { status: "red", note: "   " }),
    );
    expect(res.status).toBe(400);
  });

  it("client can read posture with history; cannot update", async () => {
    const list = await app.request("/api/posture", {
      headers: { "x-test-user": JSON.stringify(clientUser) },
    });
    expect(list.status).toBe(200);
    const body = await list.json();
    expect(body.domains).toHaveLength(1);
    expect(body.domains[0].history.length).toBeGreaterThanOrEqual(1);

    const denied = await app.request(
      `/api/admin/posture/${domainId}`,
      asUser(clientUser, "PUT", { status: "green", note: "nope" }),
    );
    expect(denied.status).toBe(403);
  });

  it("cross-tenant: client sees only their posture domains", async () => {
    const other = await ensureOrg(randomUUID(), "Halloway Logistics Ltd");
    await mutateOrg(other.id, (d) => {
      d.posture.push({
        id: newId(),
        orgId: other.id,
        domain: "ropa",
        label: "RoPA",
        rag: "red",
        note: "Other tenant only.",
        setBy: null,
        setAt: new Date().toISOString(),
      });
    });
    const otherClient: FakeUser = { ...clientUser, id: "other-client", clientAccountId: other.id };

    const res = await (
      await app.request("/api/posture", { headers: { "x-test-user": JSON.stringify(otherClient) } })
    ).json();
    expect(res.domains).toHaveLength(1);
    expect(res.domains[0].domain).toBe("ropa");
    expect(res.domains.every((d: { note: string }) => d.note !== "Initial note.")).toBe(true);
  });
});

describe("exposure alerts", () => {
  it("creates demo alerts with demo true; rejects isDemo override", async () => {
    const ok = await app.request(
      "/api/admin/exposure",
      asUser(adminUser, "POST", {
        clientAccountId: orgId,
        kind: "test_kind",
        severity: "low",
        summary: "Synthetic test alert.",
      }),
    );
    expect(ok.status).toBe(201);
    const { id } = await ok.json();

    const doc = await readOrg(orgId);
    const alert = doc!.alerts.find((a) => a.id === id)!;
    expect(alert.demo).toBe(true);
    expect(alert.summary).toBe("Synthetic test alert.");

    const audits = doc!.audit.filter((a) => a.action === "exposure.create_demo");
    expect(audits).toHaveLength(1);

    const blocked = await app.request(
      "/api/admin/exposure",
      asUser(adminUser, "POST", {
        clientAccountId: orgId,
        kind: "live",
        severity: "high",
        summary: "Trying to fake live.",
        isDemo: false,
      }),
    );
    expect(blocked.status).toBe(400);
  });

  it("state transition requires an officer note and writes audit; client sees the note", async () => {
    const alertId = newId();
    await mutateOrg(orgId, (d) => {
      d.alerts.push({
        id: alertId,
        orgId,
        kind: "credential_exposure",
        severity: "high",
        summary: "Test alert.",
        officerNote: null,
        state: "new",
        demo: true,
        createdAt: new Date().toISOString(),
      });
    });

    const res = await app.request(
      `/api/admin/exposure/${alertId}/state`,
      asUser(adminUser, "PUT", { state: "triaged", officerNote: "Credentials rotated." }),
    );
    expect(res.status).toBe(200);

    const clientView = await (
      await app.request("/api/exposure", { headers: { "x-test-user": JSON.stringify(clientUser) } })
    ).json();
    const found = clientView.alerts.find((a: { id: string }) => a.id === alertId);
    expect(found.state).toBe("triaged");
    expect(found.officerNote).toContain("Credentials rotated.");
    expect(found.isDemo).toBe(true);

    const doc = await readOrg(orgId);
    const audits = doc!.audit.filter(
      (a) => a.action === "exposure.state_change" && a.detail.includes(alertId),
    );
    expect(audits).toHaveLength(1);
  });

  it("cross-tenant: client exposure feed excludes other accounts", async () => {
    const other = await ensureOrg(randomUUID(), "Halloway Logistics Ltd");
    await mutateOrg(other.id, (d) => {
      d.alerts.push({
        id: newId(),
        orgId: other.id,
        kind: "credential_exposure",
        severity: "high",
        summary: "Must not leak.",
        officerNote: null,
        state: "new",
        demo: true,
        createdAt: new Date().toISOString(),
      });
    });
    await mutateOrg(orgId, (d) => {
      d.alerts.push({
        id: newId(),
        orgId,
        kind: "credential_exposure",
        severity: "high",
        summary: "Pemberton alert.",
        officerNote: null,
        state: "new",
        demo: true,
        createdAt: new Date().toISOString(),
      });
    });
    const otherClient: FakeUser = { ...clientUser, id: "other-client", clientAccountId: other.id };

    const pemberton = await (
      await app.request("/api/exposure", { headers: { "x-test-user": JSON.stringify(clientUser) } })
    ).json();
    expect(pemberton.alerts).toHaveLength(1);
    expect(pemberton.alerts[0].summary).toBe("Pemberton alert.");

    const otherView = await (
      await app.request("/api/exposure", { headers: { "x-test-user": JSON.stringify(otherClient) } })
    ).json();
    expect(otherView.alerts).toHaveLength(1);
    expect(otherView.alerts[0].summary).toBe("Must not leak.");
  });

  it("client cannot access admin exposure routes", async () => {
    const res = await app.request(`/api/admin/exposure?accountId=${orgId}`, {
      headers: { "x-test-user": JSON.stringify(clientUser) },
    });
    expect(res.status).toBe(403);
  });
});

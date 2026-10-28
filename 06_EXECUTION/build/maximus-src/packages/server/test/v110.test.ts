import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { coverageTitle, FILING_DUTY_QUALIFIER, type CoverageEntry } from "@maximus/shared";
import { ensureOrg, readOrg } from "../src/db/store.ts";
import { seedManifestSchema } from "../src/lib/seedManifest.ts";
import type { AppEnv } from "../src/lib/middleware.ts";
import { adminOrganisationRoutes } from "../src/routes/adminOrganisations.ts";
import { adminRecordRoutes } from "../src/routes/adminRecord.ts";
import { authRoutes } from "../src/routes/auth.ts";
import { trackerRoutes } from "../src/routes/tracker.ts";
import {
  freshStore,
  seedTestUsers,
  sessionCookieOf,
  TEST_ADMIN_EMAIL,
  TEST_CLIENT_EMAIL,
  TEST_PASSWORD,
  type TestFixtures,
} from "./helpers.ts";

// v1.10 (FRAGO 11): the jurisdictions list, the Global coverage tile's data,
// module 1's registrations and the seed's new settings. Generic fixtures only.
const app = new Hono<AppEnv>()
  .basePath("/api")
  .route("/auth", authRoutes)
  .route("/tracker", trackerRoutes)
  .route("/admin", adminRecordRoutes)
  .route("/admin", adminOrganisationRoutes);

const UK: CoverageEntry = {
  id: "UK",
  name: "United Kingdom",
  hub: "London",
  regulator: "Information Commissioner's Office",
  law: "UK GDPR",
  filingDuty: "Data protection fee and registration.",
  lat: 51.51,
  lon: -0.13,
  status: "not_started",
};
const SG: CoverageEntry = {
  id: "SG",
  name: "Singapore",
  hub: "Singapore",
  regulator: "Personal Data Protection Commission",
  law: "PDPA 2012",
  filingDuty: "DPO designated with contact details registered.",
  lat: 1.29,
  lon: 103.85,
  status: "in_progress",
};

let fx: TestFixtures;
let client: string;
let admin: string;

async function signIn(email: string): Promise<string> {
  const res = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: TEST_PASSWORD }),
  });
  return sessionCookieOf(res);
}

function call(cookie: string, method: string, path: string, body?: unknown) {
  return app.request(path, {
    method,
    headers: { cookie, ...(body !== undefined ? { "content-type": "application/json" } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

beforeEach(async () => {
  freshStore();
  fx = await seedTestUsers();
  client = await signIn(TEST_CLIENT_EMAIL);
  admin = await signIn(TEST_ADMIN_EMAIL);
});

describe("jurisdictions setting", () => {
  it("saves the whole list and writes one audit entry naming the count, never the entries", async () => {
    const res = await call(admin, "PUT", `/api/admin/jurisdictions?org=${fx.accountId}`, { jurisdictions: [UK, SG] });
    expect(res.status).toBe(200);
    const doc = await readOrg(fx.accountId);
    expect(doc!.settings.jurisdictions).toHaveLength(2);
    const rows = doc!.audit.filter((a) => a.action === "settings.jurisdictions");
    expect(rows).toHaveLength(1);
    expect(rows[0].detail).toBe("Jurisdictions list saved: 2 entries.");
    for (const word of ["London", "Singapore", "United Kingdom", "PDPA"]) expect(rows[0].detail).not.toContain(word);
  });

  it("refuses a duplicate id and an entry with no position", async () => {
    let res = await call(admin, "PUT", `/api/admin/jurisdictions?org=${fx.accountId}`, { jurisdictions: [UK, UK] });
    expect(res.status).toBe(400);
    res = await call(admin, "PUT", `/api/admin/jurisdictions?org=${fx.accountId}`, {
      jurisdictions: [{ ...UK, lat: "" , lon: 400 }],
    });
    expect(res.status).toBe(400);
  });

  it("is the operator's only: a client cannot save it", async () => {
    const res = await call(client, "PUT", `/api/admin/jurisdictions?org=${fx.accountId}`, { jurisdictions: [UK] });
    expect(res.status).toBe(403);
  });

  it("is not changed by the general settings save", async () => {
    await call(admin, "PUT", `/api/admin/jurisdictions?org=${fx.accountId}`, { jurisdictions: [UK] });
    const res = await call(admin, "PUT", `/api/admin/settings?org=${fx.accountId}`, { jurisdictions: [], lead: "Lead" });
    expect(res.status).toBe(200);
    expect((await readOrg(fx.accountId))!.settings.jurisdictions).toHaveLength(1);
  });
});

describe("the client's reads", () => {
  it("tracker home carries no coverage for an organisation that lists none", async () => {
    const res = await call(client, "GET", "/api/tracker/home");
    expect(res.status).toBe(200);
    expect((await res.json()).coverage).toEqual([]);
  });

  it("tracker home and module 1 carry the list; other modules do not", async () => {
    await call(admin, "PUT", `/api/admin/jurisdictions?org=${fx.accountId}`, { jurisdictions: [UK, SG] });
    const home = await (await call(client, "GET", "/api/tracker/home")).json();
    expect(home.coverage.map((j: CoverageEntry) => j.id)).toEqual(["UK", "SG"]);
    const m1 = await (await call(client, "GET", "/api/tracker/areas/1")).json();
    expect(m1.registrations).toHaveLength(2);
    const m2 = await (await call(client, "GET", "/api/tracker/areas/2")).json();
    expect(m2.registrations).toEqual([]);
  });

  it("module 3 says no schedule yet when none is recorded", async () => {
    const m3 = await (await call(client, "GET", "/api/tracker/areas/3")).json();
    const tile = m3.tiles.find((t: { id: string }) => t.id === "retention:3:none");
    expect(tile?.detail).toBe("No schedule yet");
  });

  it("titles the tile by count and qualifies the filing duty", () => {
    expect(coverageTitle(1)).toBe("Coverage");
    expect(coverageTitle(2)).toBe("Global coverage");
    expect(FILING_DUTY_QUALIFIER).toBe("Filing duty (to be confirmed at mobilisation):");
  });
});

describe("seed with settings and jurisdictions", () => {
  const manifest = {
    organisation: {
      displayName: null,
      jurisdiction: "UK",
      regulation: "Multi-jurisdiction",
      settings: {
        journeyPhase: 1,
        showIllustrative: false,
        informationOfficerLabel: "Compliance Lead",
        contractLeadRole: "prose, not applied",
        moduleStatus: { "1": "Available", "2": "Available" },
        rates: { hourlyRate: 45, dayRate: 850, retainer: 5000 },
        ratesNote: "prose, not applied",
      },
    },
    tasks: [
      { ref: "A01", area: 1, phase: 1, title: "First task", ownerType: "mitmark", dueAt: "2026-12-01" },
      { ref: "A02", area: 6, phase: 2, title: "Second task", ownerType: "client", dueAt: null, recurrence: "always-on" },
    ],
    jurisdictions: [UK, SG],
    clocks: [],
    documents: [],
  };

  it("reads the manifest with its new keys", () => {
    const parsed = seedManifestSchema.safeParse(manifest);
    expect(parsed.success).toBe(true);
    expect(parsed.data!.jurisdictions).toHaveLength(2);
  });

  it("dry run names what it would set and writes nothing", async () => {
    await ensureOrg("new-org", "New organisation");
    const res = await call(admin, "POST", "/api/admin/organisations/new-org/seed", { manifest, dryRun: true });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.wouldCreate.tasks).toBe(2);
    expect(body.wouldSet).toEqual([
      "show illustrative",
      "Information Officer label",
      "module status",
      "rates",
      "jurisdictions (2)",
    ]);
    const doc = await readOrg("new-org");
    expect(doc!.tasks).toHaveLength(0);
    expect(doc!.settings.jurisdictions ?? []).toHaveLength(0);
  });

  it("applies the settings and the list", async () => {
    await ensureOrg("new-org", "New organisation");
    const res = await call(admin, "POST", "/api/admin/organisations/new-org/seed", { manifest });
    expect(res.status).toBe(200);
    const s = (await readOrg("new-org"))!.settings;
    expect(s.showIllustrative).toBe(false);
    expect(s.ioName).toBe("Compliance Lead");
    expect(s.ioRate).toBe(45);
    expect(s.dayRate).toBe(850);
    expect(s.retainer).toBe(5000);
    expect(s.moduleStatus["1"]).toBe("Available");
    expect(s.jurisdictions).toHaveLength(2);
    expect(s.journeyPhase).toBe(1);
  });
});

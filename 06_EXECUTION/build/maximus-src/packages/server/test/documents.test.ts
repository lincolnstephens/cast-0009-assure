import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import type { PolicyRecord } from "../src/db/model.ts";
import { ensureOrg, mutateOrg, newId, readOrg } from "../src/db/store.ts";
import type { AppEnv } from "../src/lib/middleware.ts";
import { EFFECTIVE_UPLOAD_MAX_BYTES } from "../src/lib/documents.ts";
import { adminDocumentRoutes } from "../src/routes/adminDocuments.ts";
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

// A minimal app carrying only the routes this suite needs, plus auth to sign
// in - the house pattern (see tracker.test.ts, workplan.test.ts).
const app = new Hono<AppEnv>()
  .basePath("/api")
  .route("/auth", authRoutes)
  .route("/tracker", trackerRoutes)
  .route("/admin", adminDocumentRoutes);

let fixtures: TestFixtures;
let clientCookie: string;
let adminCookie: string;

beforeEach(async () => {
  freshStore();
  fixtures = await seedTestUsers();
  clientCookie = sessionCookieOf(
    await app.request("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: TEST_CLIENT_EMAIL, password: TEST_PASSWORD }),
    }),
  );
  adminCookie = sessionCookieOf(
    await app.request("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: TEST_ADMIN_EMAIL, password: TEST_PASSWORD }),
    }),
  );
});

function createAsAdmin(body: Record<string, unknown>) {
  return app.request(`/api/admin/documents?org=${fixtures.accountId}`, {
    method: "POST",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function clientDocuments() {
  return app.request("/api/tracker/documents", { headers: { cookie: clientCookie } });
}

function clientDownload(id: string) {
  return app.request(`/api/tracker/documents/${id}/download`, { headers: { cookie: clientCookie } });
}

describe("Compliance Documents: admin files, client reads", () => {
  it("a link item round-trips: created by the operator, read by the client, opens to the link", async () => {
    const created = await createAsAdmin({
      section: "procedures",
      area: 3,
      title: "Retention process map",
      owner: "MITMARK",
      kind: "link",
      url: "https://example.test/retention-map.pdf",
      published: true,
    });
    expect(created.status).toBe(201);
    const record = await created.json();

    const res = await clientDocuments();
    expect(res.status).toBe(200);
    const body = await res.json();
    const procedures = body.sections.find((s: { id: string }) => s.id === "procedures");
    const item = procedures.items.find((i: { id: string }) => i.id === record.id);
    expect(item).toBeDefined();
    expect(item.kind).toBe("link");

    const dl = await clientDownload(record.id);
    expect(dl.status).toBe(302);
    expect(dl.headers.get("location")).toBe("https://example.test/retention-map.pdf");
  });

  it("a file item stores and reads back byte for byte, with the right content type and filename", async () => {
    const bytes = Buffer.from("This is the employee access tracker, as a small test file.\n", "utf8");
    const created = await createAsAdmin({
      section: "trackers",
      area: 2,
      title: "Employee access tracker",
      owner: "MITMARK",
      kind: "file",
      fileBase64: bytes.toString("base64"),
      fileName: "access-tracker.csv",
      contentType: "text/csv",
      published: true,
    });
    expect(created.status).toBe(201);
    const record = await created.json();
    expect(record.sizeBytes).toBe(bytes.byteLength);

    const dl = await clientDownload(record.id);
    expect(dl.status).toBe(200);
    expect(dl.headers.get("content-type")).toBe("text/csv");
    expect(dl.headers.get("content-disposition")).toContain("access-tracker.csv");
    const back = Buffer.from(await dl.arrayBuffer());
    expect(back.equals(bytes)).toBe(true);
  });

  it("rejects an upload past the working cap with a message that says to link instead", async () => {
    const oversized = Buffer.alloc(EFFECTIVE_UPLOAD_MAX_BYTES + 1024, 1);
    const res = await createAsAdmin({
      section: "trackers",
      title: "Oversized register",
      kind: "file",
      fileBase64: oversized.toString("base64"),
      fileName: "big.bin",
      contentType: "application/octet-stream",
      published: true,
    });
    expect(res.status).toBe(413);
    const body = await res.json();
    expect(body.error.toLowerCase()).toContain("link");

    const doc = await readOrg(fixtures.accountId);
    expect(doc!.documents).toHaveLength(0);
  });

  it("the client sees only published items", async () => {
    const published = await createAsAdmin({
      section: "trackers",
      title: "Vendor list",
      kind: "link",
      url: "https://example.test/vendors.pdf",
      published: true,
    });
    await createAsAdmin({
      section: "trackers",
      title: "Draft compliance note",
      kind: "link",
      url: "https://example.test/draft.pdf",
      published: false,
    });
    expect(published.status).toBe(201);

    const res = await clientDocuments();
    const body = await res.json();
    const trackers = body.sections.find((s: { id: string }) => s.id === "trackers");
    const titles = trackers.items.map((i: { title: string }) => i.title);
    expect(titles).toContain("Vendor list");
    expect(titles).not.toContain("Draft compliance note");
  });

  it("the client cannot create, edit or delete a document", async () => {
    const createRes = await app.request(`/api/admin/documents?org=${fixtures.accountId}`, {
      method: "POST",
      headers: { cookie: clientCookie, "content-type": "application/json" },
      body: JSON.stringify({ section: "trackers", title: "x", kind: "link", url: "https://example.test" }),
    });
    expect([403, 404]).toContain(createRes.status);

    const filed = await createAsAdmin({
      section: "trackers",
      title: "Breach register",
      kind: "link",
      url: "https://example.test/breach.pdf",
      published: true,
    });
    const record = await filed.json();

    const editRes = await app.request(`/api/admin/documents/${record.id}?org=${fixtures.accountId}`, {
      method: "PATCH",
      headers: { cookie: clientCookie, "content-type": "application/json" },
      body: JSON.stringify({ title: "Renamed" }),
    });
    expect([403, 404]).toContain(editRes.status);

    const deleteRes = await app.request(`/api/admin/documents/${record.id}?org=${fixtures.accountId}`, {
      method: "DELETE",
      headers: { cookie: clientCookie },
    });
    expect([403, 404]).toContain(deleteRes.status);

    const doc = await readOrg(fixtures.accountId);
    expect(doc!.documents.find((d) => d.id === record.id)?.title).toBe("Breach register");
  });

  it("lists the approved policy pack under Policies without anything being uploaded", async () => {
    const now = new Date().toISOString();
    await mutateOrg(fixtures.accountId, (doc) => {
      const policy: PolicyRecord = {
        id: newId(),
        orgId: doc.id,
        code: "DP-01",
        title: "Data protection policy",
        version: 1,
        status: "approved",
        bodyMarkdown: "Preamble.",
        approvedBy: "Test Admin User",
        approvedAt: now,
        createdAt: now,
      };
      doc.policies.push(policy);
    });

    const res = await clientDocuments();
    const body = await res.json();
    const policies = body.sections.find((s: { id: string }) => s.id === "policies");
    expect(policies.items).toHaveLength(1);
    expect(policies.items[0].kind).toBe("policy");
    expect(policies.items[0].title).toBe("Data protection policy");
    expect(policies.items[0].version).toBe("1");

    const doc = await readOrg(fixtures.accountId);
    expect(doc!.documents).toHaveLength(0);
  });

  it("shows an unfiled tracker with an honest not-yet-filed state, alongside filed ones", async () => {
    await createAsAdmin({
      section: "trackers",
      title: "Vendor list",
      kind: "link",
      url: "https://example.test/vendors.pdf",
      published: true,
    });

    const res = await clientDocuments();
    const body = await res.json();
    const trackers = body.sections.find((s: { id: string }) => s.id === "trackers");

    // All six named registers appear, even the ones nobody has filed yet.
    expect(trackers.items.length).toBeGreaterThanOrEqual(6);

    const ropa = trackers.items.find((i: { title: string }) => i.title === "Record of processing activities");
    expect(ropa).toBeDefined();
    expect(ropa.published).toBe(false);
    expect(ropa.url).toBe("");
    expect(ropa.blobKey).toBeNull();

    const vendor = trackers.items.find((i: { title: string }) => i.title === "Vendor list");
    expect(vendor.published).toBe(true);
    expect(vendor.url).toBe("https://example.test/vendors.pdf");
  });

  it("a document outside the client's organisation 404s on download", async () => {
    const otherOrg = await ensureOrg("other-org", "Other Organisation");
    const otherDoc = await mutateOrg(otherOrg.id, (doc) => {
      const record = {
        id: newId(),
        orgId: otherOrg.id,
        section: "trackers" as const,
        area: null,
        title: "Other org's register",
        version: "",
        asAt: "",
        owner: "",
        kind: "link" as const,
        blobKey: null,
        fileName: "",
        contentType: "",
        sizeBytes: 0,
        url: "https://example.test/other.pdf",
        published: true,
        updatedAt: new Date().toISOString(),
        updatedBy: "Test Admin User",
      };
      doc.documents.push(record);
      return record;
    });

    const res = await clientDownload(otherDoc.id);
    expect(res.status).toBe(404);
  });
});

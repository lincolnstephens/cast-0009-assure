import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { ensureOrg, mutateUsers, newId, readOrg } from "../src/db/store.ts";
import { checkLogo, LOGO_MAX_BYTES } from "../src/lib/logo.ts";
import { requireAuth, requireClientSeat, type AppEnv } from "../src/lib/middleware.ts";
import { adminOrganisationRoutes } from "../src/routes/adminOrganisations.ts";
import { authRoutes } from "../src/routes/auth.ts";
import { brandingRoutes } from "../src/routes/branding.ts";
import {
  freshStore,
  seedTestUsers,
  sessionCookieOf,
  TEST_ADMIN_EMAIL,
  TEST_CLIENT_EMAIL,
  TEST_PASSWORD,
  type TestFixtures,
} from "./helpers.ts";

// v1.8 (FRAGO 08): the organisation's name and branding logo, served only to
// that organisation's sessions and its client view.
const app = new Hono<AppEnv>()
  .basePath("/api")
  .route("/auth", authRoutes)
  .route("/branding", brandingRoutes)
  .route("/admin", adminOrganisationRoutes);
// Which seat a client view is served as.
app.get("/whoami", requireAuth, requireClientSeat, (c) => c.json({ id: c.get("user").id }));

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 73, 72, 68, 82]);
const b64 = (bytes: Uint8Array | string) => Buffer.from(bytes).toString("base64");
const OTHER_CLIENT_EMAIL = "other@test.example";

let fx: TestFixtures;
let client: string;
let other: string;
let admin: string;

async function signIn(email: string): Promise<string> {
  const res = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: TEST_PASSWORD }),
  });
  return sessionCookieOf(res);
}

function call(cookie: string, method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
  return app.request(path, {
    method,
    headers: { cookie, ...(body !== undefined ? { "content-type": "application/json" } : {}), ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

beforeEach(async () => {
  freshStore();
  fx = await seedTestUsers();
  await ensureOrg("other-org", "Other Organisation");
  const hash = await bcrypt.hash(TEST_PASSWORD, 10);
  await mutateUsers((doc) => {
    doc.users.push({
      id: newId(),
      email: OTHER_CLIENT_EMAIL,
      displayName: "Other Client User",
      role: "client",
      orgId: "other-org",
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    } as (typeof doc.users)[number]);
  });
  client = await signIn(TEST_CLIENT_EMAIL);
  other = await signIn(OTHER_CLIENT_EMAIL);
  admin = await signIn(TEST_ADMIN_EMAIL);
});

describe("logo checks", () => {
  it("takes a PNG by its signature and refuses other types, whatever the name", () => {
    expect(checkLogo(PNG)).toEqual({ ok: true, contentType: "image/png" });
    expect(checkLogo(new TextEncoder().encode("GIF89a....")).ok).toBe(false);
    expect(checkLogo(new Uint8Array()).ok).toBe(false);
  });

  it("takes a plain SVG and refuses one that carries script, handlers or outside references", () => {
    const plain = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1"/></svg>';
    expect(checkLogo(new TextEncoder().encode(plain))).toEqual({ ok: true, contentType: "image/svg+xml" });
    for (const bad of [
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://example.com/x.png"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject></foreignObject></svg>',
    ]) {
      expect(checkLogo(new TextEncoder().encode(bad)).ok).toBe(false);
    }
  });

  it("refuses more than 500 KB with 413", () => {
    const big = new Uint8Array(LOGO_MAX_BYTES + 1);
    big.set(PNG);
    expect(checkLogo(big)).toMatchObject({ ok: false, status: 413 });
  });
});

describe("organisation logo", () => {
  it("is set by a manager, served to that organisation's seat and client view only, and removed", async () => {
    const put = await call(admin, "PUT", `/api/admin/organisations/${fx.accountId}/logo`, { fileName: "l.png", dataBase64: b64(PNG) });
    expect(put.status).toBe(200);
    const doc = await readOrg(fx.accountId);
    expect(doc?.branding.logo).toMatchObject({ contentType: "image/png", version: 1 });
    expect(doc?.audit.some((a) => a.action === "branding.logo.set")).toBe(true);

    const own = await call(client, "GET", "/api/branding/logo");
    expect(own.status).toBe(200);
    expect(own.headers.get("content-type")).toBe("image/png");
    expect(own.headers.get("content-security-policy")).toContain("sandbox");
    expect(new Uint8Array(await own.arrayBuffer())).toEqual(PNG);

    // Another organisation's seat never receives it, with or without a preview marker.
    expect((await call(other, "GET", "/api/branding/logo")).status).toBe(404);
    expect((await call(other, "GET", "/api/branding/logo", undefined, { "x-assure-preview": `client:${fx.accountId}` })).status).toBe(404);

    // The operator in client view gets the viewed organisation's logo, and no other.
    expect((await call(admin, "GET", `/api/branding/logo?preview=client:${fx.accountId}`)).status).toBe(200);
    expect((await call(admin, "GET", "/api/branding/logo?preview=client:other-org")).status).toBe(404);
    // Without a client view the operator has no client logo route at all.
    expect((await call(admin, "GET", "/api/branding/logo")).status).toBe(403);

    const me = await (await call(client, "GET", "/api/auth/me")).json();
    expect(me.branding.logoLight).toBe("/branding/logo?v=1");
    const otherMe = await (await call(other, "GET", "/api/auth/me")).json();
    expect(otherMe.branding.logoLight).toBeUndefined();

    const list = await (await call(admin, "GET", "/api/admin/organisations")).json();
    const row = list.organisations.find((o: { id: string }) => o.id === fx.accountId);
    expect(row.logoVersion).toBe(1);

    expect((await call(admin, "DELETE", `/api/admin/organisations/${fx.accountId}/logo`)).status).toBe(200);
    expect((await call(client, "GET", "/api/branding/logo")).status).toBe(404);
    expect((await readOrg(fx.accountId))?.branding.logo).toBeUndefined();
  });

  it("refuses a wrong type and an oversize file and leaves no logo", async () => {
    const gif = await call(admin, "PUT", `/api/admin/organisations/${fx.accountId}/logo`, { dataBase64: b64("GIF89a") });
    expect(gif.status).toBe(400);
    const big = new Uint8Array(LOGO_MAX_BYTES + 1);
    big.set(PNG);
    const over = await call(admin, "PUT", `/api/admin/organisations/${fx.accountId}/logo`, { dataBase64: b64(big) });
    expect(over.status).toBe(413);
    expect((await readOrg(fx.accountId))?.branding.logo).toBeUndefined();
  });

  it("is a manager's action only", async () => {
    const res = await call(client, "PUT", `/api/admin/organisations/${fx.accountId}/logo`, { dataBase64: b64(PNG) });
    expect(res.status).toBe(403);
  });
});

describe("organisation name", () => {
  it("is changed by a manager on the organisation named, audited without the name", async () => {
    const res = await call(admin, "PATCH", "/api/admin/organisations/other-org", { name: "Renamed Organisation" });
    expect(res.status).toBe(200);
    const doc = await readOrg("other-org");
    expect(doc?.name).toBe("Renamed Organisation");
    const row = doc?.audit.find((a) => a.action === "organisation.rename");
    expect(row?.detail).not.toContain("Renamed");
    expect((await readOrg(fx.accountId))?.name).not.toBe("Renamed Organisation");
  });
});

describe("client view seat", () => {
  it("serves an organisation's active client seat before a disabled one", async () => {
    const hash = await bcrypt.hash(TEST_PASSWORD, 10);
    const second = newId();
    await mutateUsers((doc) => {
      const first = doc.users.find((u) => u.email === TEST_CLIENT_EMAIL)!;
      first.disabled = true;
      doc.users.push({ ...first, id: second, email: "second@test.example", disabled: false, passwordHash: hash });
    });
    const res = await call(admin, "GET", `/api/whoami?preview=client:${fx.accountId}`);
    expect((await res.json()).id).toBe(second);
  });

  it("still serves the only seat when it is disabled", async () => {
    await mutateUsers((doc) => {
      doc.users.find((u) => u.email === TEST_CLIENT_EMAIL)!.disabled = true;
    });
    const res = await call(admin, "GET", `/api/whoami?preview=client:${fx.accountId}`);
    expect((await res.json()).id).toBe(fx.clientUserId);
  });
});

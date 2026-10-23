import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import type { DocumentRecord } from "../src/db/model.ts";
import { mutateOrg, readOrg } from "../src/db/store.ts";
import { trackersSectionItems } from "../src/lib/documents.ts";
import type { AppEnv } from "../src/lib/middleware.ts";
import { moduleTiles } from "../src/lib/modulePage.ts";
import { authRoutes } from "../src/routes/auth.ts";
import { trackerRoutes } from "../src/routes/tracker.ts";
import { freshStore, seedTestUsers, sessionCookieOf, TEST_CLIENT_EMAIL, TEST_PASSWORD, type TestFixtures } from "./helpers.ts";

// v1.9 (FRAGO 10 3.1): a named register with more than one live match shows
// the most recently updated in its slot and every earlier match beneath it as
// "(earlier version)". Until v1.8 the first match took the slot and the rest
// were dropped from the section and from the module page.
const app = new Hono<AppEnv>().basePath("/api").route("/auth", authRoutes).route("/tracker", trackerRoutes);

let fx: TestFixtures;

function filed(id: string, title: string, updatedAt: string, extra: Partial<DocumentRecord> = {}): DocumentRecord {
  return {
    id,
    orgId: fx.accountId,
    section: "trackers",
    area: 2,
    title,
    version: "",
    asAt: updatedAt.slice(0, 10),
    owner: "MITMARK",
    kind: "link",
    blobKey: null,
    fileName: "",
    contentType: "",
    sizeBytes: 0,
    url: "https://example.invalid/register",
    published: true,
    updatedAt,
    updatedBy: "x",
    ...extra,
  };
}

async function file(...docs: DocumentRecord[]) {
  await mutateOrg(fx.accountId, (doc) => {
    doc.documents = doc.documents.filter((d) => d.section !== "trackers");
    doc.documents.push(...docs);
  });
  return (await readOrg(fx.accountId))!;
}

const ROPA = "Record of processing activities";
const titlesOf = (items: { title: string; id: string }[]) => items.map((i) => i.title);

beforeEach(async () => {
  freshStore();
  fx = await seedTestUsers();
});

describe("register slots (FRAGO 10 3.1)", () => {
  it("two live matches: the newest takes the slot, the earlier follows it as an earlier version", async () => {
    // The order filed is the 23 Oct fault: the template first, the real register later.
    const doc = await file(
      filed("tpl", ROPA, "2026-09-29T08:50:12Z"),
      filed("real", "record of processing activities ", "2026-10-21T15:00:21Z"),
    );
    const items = trackersSectionItems(doc);
    const i = items.findIndex((d) => d.id === "real");
    expect(i).toBeGreaterThanOrEqual(0);
    expect(items[i + 1]).toMatchObject({ id: "tpl", title: `${ROPA} (earlier version)`, published: true });
    expect(items.some((d) => d.id === "tracker-unfiled:ropa")).toBe(false);
  });

  it("three live matches are ordered newest first by updatedAt, then asAt", async () => {
    const doc = await file(
      filed("a", ROPA, "2026-10-01T00:00:00Z"),
      filed("b", ROPA, "2026-10-21T00:00:00Z", { asAt: "2026-10-20" }),
      filed("c", ROPA, "2026-10-21T00:00:00Z", { asAt: "2026-10-21" }),
    );
    const ropa = trackersSectionItems(doc).filter((d) => ["a", "b", "c"].includes(d.id));
    expect(ropa.map((d) => d.id)).toEqual(["c", "b", "a"]);
    expect(titlesOf(ropa)).toEqual([ROPA, `${ROPA} (earlier version)`, `${ROPA} (earlier version)`]);
  });

  it("an alias match counts, a match never fills two slots, and nothing live is dropped", async () => {
    const doc = await file(
      filed("m1", "Employee access matrix", "2026-09-29T00:00:00Z"),
      filed("m2", "Employee access tracker", "2026-10-21T00:00:00Z"),
      filed("x", "A register beyond the list", "2026-10-02T00:00:00Z"),
    );
    const items = trackersSectionItems(doc);
    const ids = items.map((d) => d.id);
    for (const id of ["m1", "m2", "x"]) expect(ids.filter((v) => v === id)).toHaveLength(1);
    expect(ids.indexOf("m2")).toBe(ids.indexOf("m1") - 1);
  });

  it("only live documents fill a slot: an unpublished, test or superseded match is not shown", async () => {
    const doc = await file(
      filed("live", ROPA, "2026-09-29T00:00:00Z"),
      filed("hidden", ROPA, "2026-10-22T00:00:00Z", { published: false }),
      filed("test", ROPA, "2026-10-22T00:00:00Z", { test: true }),
      filed("gone", ROPA, "2026-10-22T00:00:00Z", { supersededBy: "live" }),
    );
    const ropa = trackersSectionItems(doc).filter((d) => d.title.startsWith(ROPA));
    expect(ropa).toHaveLength(1);
    expect(ropa[0]).toMatchObject({ id: "live", title: ROPA });
  });

  it("one match: unchanged from v1.8", async () => {
    const doc = await file(filed("only", ROPA, "2026-10-21T00:00:00Z"));
    const ropa = trackersSectionItems(doc).filter((d) => d.title.startsWith(ROPA));
    expect(ropa).toEqual([expect.objectContaining({ id: "only", title: ROPA })]);
  });

  it("the module page's register tile opens the newest, and the earlier version is still listed there", async () => {
    const doc = await file(filed("tpl", ROPA, "2026-09-29T00:00:00Z"), filed("real", ROPA, "2026-10-21T00:00:00Z"));
    const tiles = moduleTiles(doc, 2);
    const reg = tiles.find((t) => t.kind === "register" && t.title === ROPA);
    expect(reg?.ref ?? reg?.id).toContain("real");
    expect(tiles.some((t) => t.title === `${ROPA} (earlier version)`)).toBe(true);
  });

  it("the client's Compliance Documents reads the same order through the API", async () => {
    await file(filed("tpl", ROPA, "2026-09-29T00:00:00Z"), filed("real", ROPA, "2026-10-21T00:00:00Z"));
    const login = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: TEST_CLIENT_EMAIL, password: TEST_PASSWORD }),
    });
    const res = await app.request("/api/tracker/documents", { headers: { cookie: sessionCookieOf(login) } });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sections: { id: string; items: { id: string; title: string }[] }[] };
    const trackers = body.sections.find((s) => s.id === "trackers")!.items;
    const i = trackers.findIndex((d) => d.id === "real");
    expect(trackers[i + 1]).toMatchObject({ id: "tpl", title: `${ROPA} (earlier version)` });
  });
});

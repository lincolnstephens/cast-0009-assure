import { Hono } from "hono";
import JSZip from "jszip";
import { beforeEach, describe, expect, it } from "vitest";
import { LINE_MODULE, moduleOfLine } from "@maximus/shared";
import { mutateOrg, readOrg, readOrgRaw, writeOrg } from "../src/db/store.ts";
import type { EntryRecord, OrgDoc } from "../src/db/model.ts";
import { extractText } from "../src/lib/extract.ts";
import { retrieve } from "../src/lib/guide/retrieve.ts";
import type { CorpusSection } from "../src/lib/guide/corpus.ts";
import { workingDaysBetween } from "../src/lib/reviewQueue.ts";
import type { AppEnv } from "../src/lib/middleware.ts";
import { adminDocumentRoutes } from "../src/routes/adminDocuments.ts";
import { adminMigrationRoutes } from "../src/routes/adminMigrations.ts";
import { adminRecordRoutes } from "../src/routes/adminRecord.ts";
import { adminReviewRoutes } from "../src/routes/adminReview.ts";
import { adminUserRoutes } from "../src/routes/adminUsers.ts";
import { adminWorkplanRoutes } from "../src/routes/adminWorkplan.ts";
import { authRoutes } from "../src/routes/auth.ts";
import { chatRoutes } from "../src/routes/chat.ts";
import { clockRoutes, requestRoutes } from "../src/routes/clocks.ts";
import { trackerRoutes } from "../src/routes/tracker.ts";
import { valueRoutes } from "../src/routes/value.ts";
import {
  freshStore,
  seedTestUsers,
  sessionCookieOf,
  TEST_ADMIN_EMAIL,
  TEST_CLIENT_EMAIL,
  TEST_PASSWORD,
  type TestFixtures,
} from "./helpers.ts";

// v1.7 (FRAGO 07): documents both ways, the board, Ask in client view, the
// test seat, eight modules, and Quick questions over every published document.
const app = new Hono<AppEnv>()
  .basePath("/api")
  .route("/auth", authRoutes)
  .route("/chat", chatRoutes)
  .route("/clocks", clockRoutes)
  .route("/requests", requestRoutes)
  .route("/tracker", trackerRoutes)
  .route("/value", valueRoutes)
  .route("/admin", adminDocumentRoutes)
  .route("/admin", adminRecordRoutes)
  .route("/admin", adminReviewRoutes)
  .route("/admin", adminUserRoutes)
  .route("/admin", adminWorkplanRoutes)
  .route("/admin", adminMigrationRoutes);

let fx: TestFixtures;
let client: string;
let admin: string;

async function signIn(email: string, password = TEST_PASSWORD): Promise<string> {
  const res = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return sessionCookieOf(res);
}

function call(path: string, cookie: string, init: RequestInit & { json?: unknown } = {}) {
  const headers: Record<string, string> = { cookie, ...(init.headers as Record<string, string>) };
  let body = init.body;
  if (init.json !== undefined) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(init.json);
  }
  return app.request(path, { ...init, headers, body });
}

const preview = () => ({ "x-assure-preview": `client:${fx.accountId}` });

/** A minimal .docx: a heading and two paragraphs under it. */
async function docx(heading: string, paras: string[]): Promise<string> {
  const zip = new JSZip();
  const p = (t: string, style = "") =>
    `<w:p>${style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ""}<w:r><w:t>${t}</w:t></w:r></w:p>`;
  zip.file(
    "word/document.xml",
    `<?xml version="1.0"?><w:document xmlns:w="x"><w:body>${p("Intro line.")}${p(heading, "Heading1")}${paras.map((t) => p(t)).join("")}</w:body></w:document>`,
  );
  return Buffer.from(await zip.generateAsync({ type: "uint8array" })).toString("base64");
}

const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

beforeEach(async () => {
  freshStore();
  fx = await seedTestUsers();
  client = await signIn(TEST_CLIENT_EMAIL);
  admin = await signIn(TEST_ADMIN_EMAIL);
});

async function submit(cookie: string, over: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  return call("/api/tracker/documents", cookie, {
    method: "POST",
    headers,
    json: {
      title: "Visitor log retention note",
      // v1.9 (FRAGO 09 3.2): the client chooses a Category; MITMARK sets the module.
      category: "procedure",
      note: "How long the visitor book is kept.",
      kind: "file",
      fileBase64: await docx("Visitor book", ["The visitor book is kept for two years and then shredded."]),
      fileName: "visitor-note.docx",
      contentType: DOCX_TYPE,
      ...over,
    },
  });
}

async function pendingItems(type?: string) {
  const res = await call(`/api/admin/review?accountId=${fx.accountId}${type ? `&type=${type}` : ""}`, admin);
  return ((await res.json()) as { items: any[] }).items;
}

describe("client upload (FRAGO 07 3.1)", () => {
  it("lands in the queue, is neither published nor counted, and is visible to the client as awaiting review", async () => {
    const res = await submit(client);
    expect(res.status).toBe(201);
    const { id } = (await res.json()) as { id: string };

    const docs = (await (await call("/api/tracker/documents", client)).json()) as any;
    const listed = docs.sections.flatMap((s: any) => s.items).map((d: any) => d.id);
    expect(listed).not.toContain(id);
    expect(docs.submissions[0]).toMatchObject({ id, state: "submitted", stateLabel: "Submitted, awaiting MITMARK review" });

    // Not downloadable, not on the module page, not in the queue as anything but a submission.
    expect((await call(`/api/tracker/documents/${id}/download`, client)).status).toBe(404);
    const area = (await (await call("/api/tracker/areas/3", client)).json()) as any;
    expect(area.documents.map((d: any) => d.id)).not.toContain(id);
    expect(area.tiles.map((t: any) => t.ref ?? t.id)).not.toContain(id);

    const items = await pendingItems("document_submission");
    expect(items).toHaveLength(1);
    expect(items[0].context.documentId).toBe(id);
  });

  it("accept publishes under the chosen section; return carries the reason to the client", async () => {
    await submit(client);
    await submit(client, { title: "Second one" });
    const [first, second] = await pendingItems("document_submission");

    const acc = await call(`/api/admin/review/${first.id}/accept-document`, admin, { method: "POST", json: { section: "trackers", area: 3 } });
    expect(acc.status).toBe(200);
    const ret = await call(`/api/admin/review/${second.id}/return-document`, admin, { method: "POST", json: { reason: "Please send the signed copy." } });
    expect(ret.status).toBe(200);

    const docs = (await (await call("/api/tracker/documents", client)).json()) as any;
    const trackers = docs.sections.find((s: any) => s.id === "trackers").items.map((d: any) => d.id);
    expect(trackers).toContain(first.context.documentId);
    const returned = docs.submissions.find((s: any) => s.id === second.context.documentId);
    expect(returned).toMatchObject({ state: "returned", returnReason: "Please send the signed copy." });
    expect((await call(`/api/tracker/documents/${first.context.documentId}/download`, client)).status).toBe(200);
    expect((await call(`/api/tracker/documents/${second.context.documentId}/download`, client)).status).toBe(404);
  });

  it("a new version supersedes the earlier one on acceptance, and history is kept", async () => {
    await submit(client);
    const [first] = await pendingItems("document_submission");
    await call(`/api/admin/review/${first.id}/accept-document`, admin, { method: "POST", json: { section: "procedures", area: 3 } });
    const earlierId = first.context.documentId;

    await submit(client, { title: "Visitor log retention note v2", supersedes: earlierId });
    const [second] = await pendingItems("document_submission");
    // Before acceptance the earlier version is still the live one.
    let docs = (await (await call("/api/tracker/documents", client)).json()) as any;
    let ids = docs.sections.flatMap((s: any) => s.items).map((d: any) => d.id);
    expect(ids).toContain(earlierId);
    expect(ids).not.toContain(second.context.documentId);

    await call(`/api/admin/review/${second.id}/accept-document`, admin, { method: "POST", json: { section: "procedures", area: 3 } });
    docs = (await (await call("/api/tracker/documents", client)).json()) as any;
    ids = docs.sections.flatMap((s: any) => s.items).map((d: any) => d.id);
    expect(ids).toContain(second.context.documentId);
    expect(ids).not.toContain(earlierId);

    const org = (await readOrg(fx.accountId))!;
    expect(org.documents.find((d) => d.id === earlierId)?.supersededBy).toBe(second.context.documentId);
  });

  it("is refused in client view, with the stated message", async () => {
    const res = await submit(admin, {}, preview());
    expect(res.status).toBe(403);
    expect(((await res.json()) as any).error).toBe(
      "Read only in client view. The client uploads documents from her own sign-in.",
    );
  });

  it("over the cap is refused with the link instruction", async () => {
    const big = Buffer.alloc(4 * 1024 * 1024 + 1).toString("base64");
    const res = await submit(client, { fileBase64: big, fileName: "big.bin", contentType: "application/octet-stream" });
    expect(res.status).toBe(413);
  });
});

describe("download (FRAGO 07 3.1)", () => {
  it("the operator downloads a filed file with its name and type, and it is audited", async () => {
    const created = await call(`/api/admin/documents?org=${fx.accountId}`, admin, {
      method: "POST",
      json: { section: "procedures", title: "Procedure", kind: "file", fileBase64: Buffer.from("hello").toString("base64"), fileName: "Procédure note.txt", contentType: "text/plain" },
    });
    const { id } = (await created.json()) as { id: string };
    const res = await call(`/api/admin/documents/${id}/download?org=${fx.accountId}`, admin);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/plain");
    expect(res.headers.get("content-disposition")).toContain("filename*=UTF-8''Proc%C3%A9dure%20note.txt");
    expect(await res.text()).toBe("hello");
    const org = (await readOrg(fx.accountId))!;
    expect(org.audit.some((a) => a.action === "document.download" && a.detail.includes(id))).toBe(true);
  });
});

describe("client view (FRAGO 07 3.3)", () => {
  it("Ask answers and saves nothing; Submit request is refused with the stated message", async () => {
    // A published procedure, so the Guide has something to read.
    await call(`/api/admin/documents?org=${fx.accountId}`, admin, {
      method: "POST",
      json: { section: "procedures", title: "Reception procedure", kind: "file", fileBase64: await docx("Visitors", ["Visitors sign in at reception."]), fileName: "r.docx", contentType: DOCX_TYPE },
    });
    const before = JSON.stringify((await readOrgRaw(fx.accountId))!);
    const ask = await call("/api/chat/messages", admin, { method: "POST", headers: preview(), json: { body: "I think my work laptop was stolen" } });
    expect(ask.status).toBe(200);
    const body = (await ask.json()) as any;
    expect(body.preview).toBe(true);
    expect(body.messages[1].body).toMatch(/^Client view: nothing was/);
    // Nothing saved: no thread, message, escalation, intake, clock or review item.
    const after = (await readOrgRaw(fx.accountId))!;
    for (const k of ["threads", "messages", "escalations", "intakes", "clocks", "review"] as const) {
      expect((after as OrgDoc)[k]).toEqual((JSON.parse(before) as OrgDoc)[k]);
    }

    const req = await call("/api/requests", admin, { method: "POST", headers: preview(), json: { type: "data_request", details: "x" } });
    expect(req.status).toBe(403);
    expect(((await req.json()) as any).error).toBe("Read only in client view. The client submits requests from her own sign-in.");
  });
});

describe("test seat (FRAGO 07 3.3)", () => {
  async function testSeat(): Promise<string> {
    const res = await call("/api/admin/users", admin, {
      method: "POST",
      json: { email: "seat@test.example", role: "client", orgId: fx.accountId, testSeat: true },
    });
    expect(res.status).toBe(201);
    const { oneTimePassword, user } = (await res.json()) as any;
    expect(user.testSeat).toBe(true);
    const cookie = await signIn("seat@test.example", oneTimePassword);
    await call("/api/auth/password", cookie, {
      method: "POST",
      json: { currentPassword: oneTimePassword, newPassword: "a-long-new-password-1" },
    });
    return signIn("seat@test.example", "a-long-new-password-1");
  }

  it("one active per organisation", async () => {
    await testSeat();
    const again = await call("/api/admin/users", admin, {
      method: "POST",
      json: { email: "seat2@test.example", role: "client", orgId: fx.accountId, testSeat: true },
    });
    expect(again.status).toBe(409);
  });

  it("its request is tagged test, hidden from the client, never counted, and books nothing on close", async () => {
    const seat = await testSeat();
    const res = await call("/api/requests", seat, { method: "POST", json: { type: "data_request", details: "Test request" } });
    expect(res.status).toBe(201);
    const { clockId } = (await res.json()) as any;

    const mine = (await (await call("/api/clocks", seat)).json()) as any;
    expect(mine.active.map((c: any) => c.id)).toContain(clockId);
    const theirs = (await (await call("/api/clocks", client)).json()) as any;
    expect(theirs.active.map((c: any) => c.id)).not.toContain(clockId);

    const org = (await readOrg(fx.accountId))!;
    expect(org.clocks.find((c) => c.id === clockId)?.test).toBe(true);
    const home = (await (await call("/api/tracker/home", client)).json()) as any;
    expect(JSON.stringify(home.kpis)).not.toContain("1 of 1");

    // Statement and Record: no entry from test work.
    const statement = (await (await call("/api/value/statement", client)).json()) as any;
    expect(statement.totals.items).toBe(0);
  });

  it("its upload, once accepted, reaches no client page", async () => {
    const seat = await testSeat();
    await submit(seat);
    const [item] = await pendingItems("document_submission");
    expect(item.test).toBe(true);
    await call(`/api/admin/review/${item.id}/accept-document`, admin, { method: "POST", json: { section: "procedures", area: 3 } });
    const docs = (await (await call("/api/tracker/documents", client)).json()) as any;
    expect(docs.sections.flatMap((s: any) => s.items).map((d: any) => d.id)).not.toContain(item.context.documentId);
    expect(docs.submissions).toHaveLength(0);
    const seatDocs = (await (await call("/api/tracker/documents", seat)).json()) as any;
    expect(seatDocs.submissions[0].state).toBe("accepted");
  });

  it("client view serves the client's own seat, not the test seat", async () => {
    await testSeat();
    const res = await call("/api/tracker/documents", admin, { headers: preview() });
    expect(((await res.json()) as any).testSeat).toBe(false);
  });
});

describe("the board (FRAGO 07 3.2)", () => {
  it("a move to Completed dates it today and audits the move; moving out clears the date", async () => {
    await mutateOrg(fx.accountId, (doc) => {
      doc.tasks.push({
        id: "t1", orgId: fx.accountId, area: 2, phase: 3, title: "Review the RoPA", how: "", howLink: null,
        ownerType: "mitmark", ownerRole: "", dueAt: "2026-12-01", recurrence: "once", status: "in_progress",
        progress: 0, evidence: [], notes: "", source: "manual", recordEntryId: null, closedAt: null,
        clientConfirmedAt: null, clientConfirmedBy: null, createdBy: "x", updatedBy: "x", updatedAt: "2026-10-01T00:00:00Z",
      });
    });
    await call(`/api/admin/workplan/t1?org=${fx.accountId}`, admin, { method: "PATCH", json: { status: "done" } });
    let org = (await readOrg(fx.accountId))!;
    const t = org.tasks.find((x) => x.id === "t1")!;
    expect(t.closedAt?.slice(0, 10)).toBe(new Date().toISOString().slice(0, 10));
    expect(org.audit.some((a) => a.detail.includes("moved from In progress to Done"))).toBe(true);
    const entries = org.entries.length;

    await call(`/api/admin/workplan/t1?org=${fx.accountId}`, admin, { method: "PATCH", json: { status: "in_progress" } });
    org = (await readOrg(fx.accountId))!;
    expect(org.tasks.find((x) => x.id === "t1")!.closedAt).toBeNull();
    await call(`/api/admin/workplan/t1?org=${fx.accountId}`, admin, { method: "PATCH", json: { status: "done" } });
    org = (await readOrg(fx.accountId))!;
    expect(org.entries.length).toBe(entries); // booked once only
  });
});

describe("eight modules (FRAGO 07 3.4)", () => {
  it("every line maps to exactly one module 1 to 8", () => {
    for (let l = 1; l <= 12; l += 1) {
      expect(LINE_MODULE[l].area).toBeGreaterThanOrEqual(1);
      expect(LINE_MODULE[l].area).toBeLessThanOrEqual(8);
    }
  });

  it("the migration keeps counts and hours equal, writes once, and is idempotent", async () => {
    const doc = (await readOrgRaw(fx.accountId))!;
    const legacy = [1, 3, 4, 9, 12].map(
      (line, i) =>
        ({ id: `e${i}`, orgId: fx.accountId, date: "2026-09-01", line, what: "w", outcome: "", hours: i + 1, deadline: "", reviewer: "r", ill: false, reviewed: true, source: "manual", sourceRef: null, createdAt: "2026-09-01T00:00:00Z" }) as unknown as EntryRecord,
    );
    (doc as OrgDoc).entries = legacy;
    delete (doc.settings as Partial<OrgDoc["settings"]>).moduleStatus;
    await writeOrg(doc);

    const dry = (await (await call(`/api/admin/migrations/v1-7/modules?org=${fx.accountId}&dryRun=1`, admin, { method: "POST" })).json()) as any;
    expect(dry.written).toBe(false);
    expect(dry.before.entries).toBe(5);
    expect(dry.after.entries).toBe(5);
    expect(dry.before.hours).toBe(15);
    expect(dry.after.hours).toBe(15);
    expect(dry.equal).toBe(true);

    const run = (await (await call(`/api/admin/migrations/v1-7/modules?org=${fx.accountId}`, admin, { method: "POST" })).json()) as any;
    expect(run.written).toBe(true);
    expect(run.entriesMigrated).toBe(5);
    const raw = (await readOrgRaw(fx.accountId))!;
    expect(raw.entries.map((e) => e.area)).toEqual([1, 3, 4, 9, 12].map(moduleOfLine));
    expect(Object.values(raw.settings.moduleStatus)).toEqual(Array(8).fill("Available"));

    const again = (await (await call(`/api/admin/migrations/v1-7/modules?org=${fx.accountId}`, admin, { method: "POST" })).json()) as any;
    expect(again.written).toBe(false);
  });

  it("the client's Value and Statement carry no archive line", async () => {
    const statement = await (await call("/api/value/statement", client)).text();
    expect(statement).not.toMatch(/"line"|lineStatus|byLine/);
    const record = await (await call("/api/value/record", client)).text();
    expect(record).not.toMatch(/"line"|lineStatus|byLine/);
  });
});

describe("Quick questions over published documents (FRAGO 07 3.5)", () => {
  it("extracts a .docx into sections and a published procedure is cited by document and section", async () => {
    const b64 = await docx("Visitors", ["Visitors sign the visitor book at reception.", "The visitor book is retained for two years and then shredded."]);
    const ex = await extractText({ documentId: "d", title: "Note", fileName: "n.docx", contentType: DOCX_TYPE, bytes: new Uint8Array(Buffer.from(b64, "base64")) });
    expect(ex.ok).toBe(true);
    if (ex.ok) expect(ex.corpus.sections.map((s) => s.heading)).toEqual(["Note", "Visitors"]);

    const created = await call(`/api/admin/documents?org=${fx.accountId}`, admin, {
      method: "POST",
      json: { section: "procedures", title: "Reception procedure", kind: "file", fileBase64: b64, fileName: "reception.docx", contentType: DOCX_TYPE },
    });
    const rec = (await created.json()) as any;
    expect(rec.searchable).toBe("yes");

    const ask = await call("/api/chat/messages", client, { method: "POST", json: { body: "How long is the visitor book retained before it is shredded?" } });
    const reply = ((await ask.json()) as any).messages[1];
    expect(reply.status).toBe("green");
    expect(reply.mode).toBe("passages");
    expect(reply.body).toMatch(/^No AI answer is switched on/);
    expect(reply.citations[0]).toMatchObject({ sourceKind: "document", policyId: rec.id, sectionRef: "2", title: "Reception procedure" });
  });

  it("finds headings by the styles part's names, and cuts long unheaded text into parts", async () => {
    const zip = new JSZip();
    const long = Array.from({ length: 12 }, (_, i) => `<w:p><w:r><w:t>Paragraph ${i} ${"words ".repeat(60)}</w:t></w:r></w:p>`).join("");
    zip.file(
      "word/styles.xml",
      `<w:styles><w:style w:type="paragraph" w:styleId="Ttulo1"><w:name w:val="heading 1"/></w:style><w:style w:type="paragraph" w:styleId="MMHead"><w:name w:val="House head"/><w:pPr><w:outlineLvl w:val="0"/></w:pPr></w:style></w:styles>`,
    );
    zip.file(
      "word/document.xml",
      `<w:document><w:body><w:p><w:pPr><w:pStyle w:val="Ttulo1"/></w:pPr><w:r><w:t>Scope</w:t></w:r></w:p><w:p><w:r><w:t>Short.</w:t></w:r></w:p><w:p><w:pPr><w:pStyle w:val="MMHead"/></w:pPr><w:r><w:t>Detail</w:t></w:r></w:p>${long}</w:body></w:document>`,
    );
    const bytes = await zip.generateAsync({ type: "uint8array" });
    const ex = await extractText({ documentId: "d", title: "T", fileName: "t.docx", contentType: DOCX_TYPE, bytes });
    expect(ex.ok).toBe(true);
    if (!ex.ok) return;
    const headings = ex.corpus.sections.map((s) => s.heading);
    expect(headings[0]).toBe("Scope");
    expect(headings.slice(1).every((h) => h.startsWith("Detail, part "))).toBe(true);
    expect(headings.length).toBeGreaterThan(2);
  });

  it("a file that cannot be read is filed and marked not searchable", async () => {
    const created = await call(`/api/admin/documents?org=${fx.accountId}`, admin, {
      method: "POST",
      json: { section: "trackers", title: "Broken", kind: "file", fileBase64: Buffer.from("not a zip").toString("base64"), fileName: "broken.xlsx", contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    });
    const rec = (await created.json()) as any;
    expect(created.status).toBe(201);
    expect(rec.searchable).toBe("no");
  });

  it("retrieval is deterministic and scores headings and phrases", () => {
    const corpus: CorpusSection[] = [
      { sourceKind: "document", policyId: "a", policyCode: "DOC-A", policyTitle: "A", policyVersion: 0, sectionRef: "1", heading: "CCTV retention", body: "CCTV footage is kept for 31 days." },
      { sourceKind: "document", policyId: "b", policyCode: "DOC-B", policyTitle: "B", policyVersion: 0, sectionRef: "1", heading: "Other", body: "Nothing about cameras." },
    ];
    const one = retrieve(corpus, "How long do we keep CCTV footage?");
    expect(one[0].section.policyId).toBe("a");
    expect(retrieve(corpus, "How long do we keep CCTV footage?")).toEqual(one);
  });
});

describe("review queue amber flag", () => {
  it("counts working days, Monday to Friday", () => {
    // Friday to the following Friday is five working days.
    expect(workingDaysBetween("2026-10-09T10:00:00Z", new Date("2026-10-16T10:00:00Z"))).toBe(5);
    expect(workingDaysBetween("2026-10-10T10:00:00Z", new Date("2026-10-12T10:00:00Z"))).toBe(1);
  });
});

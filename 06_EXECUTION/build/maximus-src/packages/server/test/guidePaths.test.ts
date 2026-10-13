import { Hono } from "hono";
import JSZip from "jszip";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppEnv } from "../src/lib/middleware.ts";
import { adminDocumentRoutes } from "../src/routes/adminDocuments.ts";
import { authRoutes } from "../src/routes/auth.ts";
import { chatRoutes } from "../src/routes/chat.ts";
import { freshStore, seedTestUsers, sessionCookieOf, TEST_ADMIN_EMAIL, TEST_CLIENT_EMAIL, TEST_PASSWORD, type TestFixtures } from "./helpers.ts";

// v1.7 (FRAGO 07 3.5). Quick questions has two paths and both are gated:
// without a model key the passages are the answer; with one, the model
// composes from the retrieved passages only and its citations are checked
// against them. The model path is driven here with the API mocked, because
// the deployed site has no key (DC-19).
const app = new Hono<AppEnv>().basePath("/api").route("/auth", authRoutes).route("/chat", chatRoutes).route("/admin", adminDocumentRoutes);

let fx: TestFixtures;
let client: string;
let admin: string;
let docId: string;

async function signIn(email: string) {
  return sessionCookieOf(
    await app.request("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password: TEST_PASSWORD }) }),
  );
}

async function docx(): Promise<string> {
  const zip = new JSZip();
  const p = (t: string, style = "") => `<w:p>${style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ""}<w:r><w:t>${t}</w:t></w:r></w:p>`;
  zip.file(
    "word/document.xml",
    `<w:document><w:body>${p("Scope", "Heading1")}${p("This applies to reception staff.")}${p("Visitor book", "Heading1")}${p("The visitor book is retained for two years and then shredded.")}</w:body></w:document>`,
  );
  return Buffer.from(await zip.generateAsync({ type: "uint8array" })).toString("base64");
}

const ask = (body: string) =>
  app.request("/api/chat/messages", { method: "POST", headers: { cookie: client, "content-type": "application/json" }, body: JSON.stringify({ body }) });

beforeEach(async () => {
  freshStore();
  fx = await seedTestUsers();
  client = await signIn(TEST_CLIENT_EMAIL);
  admin = await signIn(TEST_ADMIN_EMAIL);
  const res = await app.request(`/api/admin/documents?org=${fx.accountId}`, {
    method: "POST",
    headers: { cookie: admin, "content-type": "application/json" },
    body: JSON.stringify({ section: "procedures", title: "Reception procedure", kind: "file", fileBase64: await docx(), fileName: "reception.docx", contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }),
  });
  docId = ((await res.json()) as { id: string }).id;
});

afterEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
  vi.unstubAllGlobals();
});

const code = () => `DOC-${docId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}`;

describe("Quick questions, both paths", () => {
  it("no key: the passages, cited by document and section, with the escalation line", async () => {
    const reply = ((await (await ask("How long is the visitor book retained before shredding?")).json()) as any).messages[1];
    expect(reply.mode).toBe("passages");
    expect(reply.citations[0]).toMatchObject({ sourceKind: "document", policyId: docId, sectionRef: "2", heading: "Visitor book" });
    expect(reply.body).toContain("Send to MITMARK");
  });

  it("with a key: the model composes from the retrieved passages only, and its citation is checked", async () => {
    process.env.ANTHROPIC_API_KEY = "x";
    let sent = "";
    vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
      sent = String(init.body);
      const text = JSON.stringify({
        status: "green",
        answer: "The visitor book is kept for two years, then shredded.",
        citations: [{ policy_code: code(), section_ref: "2", heading: "Visitor book" }, { policy_code: "DP-99", section_ref: "1" }],
        intake: null,
      });
      return new Response(JSON.stringify({ content: [{ type: "text", text }], usage: {} }), { status: 200, headers: { "content-type": "application/json" } });
    });
    const reply = ((await (await ask("How long is the visitor book retained before shredding?")).json()) as any).messages[1];
    expect(reply.mode).toBe("answer");
    expect(reply.status).toBe("green");
    expect(reply.body).toBe("The visitor book is kept for two years, then shredded.");
    // The invented citation is stripped; the real one is stamped from the corpus.
    expect(reply.citations).toHaveLength(1);
    expect(reply.citations[0]).toMatchObject({ sourceKind: "document", policyId: docId, sectionRef: "2" });
    // The model was given the retrieved passages under PASSAGES, and the passage that matched.
    expect(sent).toContain("PASSAGES:");
    expect(sent).toContain(`[${code()} §2]`);
  });

  it("the thread says which path is live: the model only once a call to it has worked", async () => {
    const path = async () => ((await (await app.request("/api/chat/thread", { headers: { cookie: client } })).json()) as any).guidePath;
    expect(await path()).toBe("passages");
    process.env.ANTHROPIC_API_KEY = "x";
    // Set but never yet tried: passages.
    expect(await path()).toBe("passages");
    // A key that is refused (DC-19): the reply falls back to passages and the page says so.
    vi.stubGlobal("fetch", async () => new Response("{}", { status: 401 }));
    const refused = ((await (await ask("How long is the visitor book retained before shredding?")).json()) as any).messages[1];
    expect(refused.mode).toBe("passages");
    expect(await path()).toBe("passages");
    // A working key: the model path is live.
    vi.stubGlobal("fetch", async () =>
      new Response(JSON.stringify({ content: [{ type: "text", text: JSON.stringify({ status: "amber", answer: "", citations: [], intake: null }) }] }), { status: 200 }),
    );
    await ask("Anything else?");
    expect(await path()).toBe("model");
  });
});

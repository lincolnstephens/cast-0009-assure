import { Hono } from "hono";
import { TRACKER_DOCUMENTS, areaName, documentInputSchema } from "@maximus/shared";
import type { DocumentRecord } from "../db/model.ts";
import { deleteDocumentBlob, mutateOrg, newId, readOrg, writeDocumentBlob } from "../db/store.ts";
import { EFFECTIVE_UPLOAD_MAX_BYTES, EFFECTIVE_UPLOAD_MAX_MB } from "../lib/documents.ts";
import { writeAudit } from "../lib/audit.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";

/**
 * The operator's side of the Compliance Documents repository: file upload or
 * link, filed into one of the three sections, published or held back. The
 * client reads and downloads only (see routes/tracker.ts); every write here
 * is the operator's, and every one leaves an audit row - the house pattern
 * (adminWorkplan.ts).
 *
 * Policies are never created here. They are generated from the approved
 * policy pack (lib/documents.ts); `kind: "policy"` is rejected on both
 * create and update so nobody can file a fake one over the real thing.
 */
export const adminDocumentRoutes = new Hono<AppEnv>();
adminDocumentRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

function orgIdOf(c: { req: { query: (k: string) => string | undefined } }): string {
  return c.req.query("org") || "demo";
}

const OVERSIZE_MESSAGE = `Files up to ${EFFECTIVE_UPLOAD_MAX_MB} MB can be uploaded here; this one is larger. Add it as a link instead.`;

function decodeBase64(value: string): Uint8Array | null {
  try {
    return new Uint8Array(Buffer.from(value, "base64"));
  } catch {
    return null;
  }
}

adminDocumentRoutes.get("/documents", async (c) => {
  const orgId = orgIdOf(c);
  const doc = await readOrg(orgId);
  if (!doc) return c.json({ error: "Organisation not found" }, 404);

  const section = c.req.query("section");
  let documents = doc.documents;
  if (section) documents = documents.filter((d) => d.section === section);

  return c.json({
    documents,
    // For the admin page's cap notice and its "which register" picker.
    uploadMaxBytes: EFFECTIVE_UPLOAD_MAX_BYTES,
    uploadMaxMb: EFFECTIVE_UPLOAD_MAX_MB,
    trackerDocuments: TRACKER_DOCUMENTS,
  });
});

adminDocumentRoutes.post("/documents", async (c) => {
  const orgId = orgIdOf(c);
  const user = c.get("user");
  const parsed = documentInputSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Check the document: section and title are needed." }, 400);
  }
  const input = parsed.data;

  if (input.kind === "policy") {
    return c.json(
      { error: "Policies are published automatically from the approved pack; they are not filed here." },
      400,
    );
  }

  const doc = await readOrg(orgId);
  if (!doc) return c.json({ error: "Organisation not found" }, 404);

  const id = newId();
  const now = new Date().toISOString();
  const record: DocumentRecord = {
    id,
    orgId,
    section: input.section,
    area: input.area,
    title: input.title,
    version: input.version,
    asAt: input.asAt,
    owner: input.owner,
    kind: input.kind,
    blobKey: null,
    fileName: "",
    contentType: "",
    sizeBytes: 0,
    url: "",
    published: input.published,
    updatedAt: now,
    updatedBy: user.displayName,
  };

  if (input.kind === "file") {
    if (!input.fileBase64) return c.json({ error: "Choose a file, or switch to a link." }, 400);
    const bytes = decodeBase64(input.fileBase64);
    if (!bytes) return c.json({ error: "That file could not be read." }, 400);
    if (bytes.byteLength > EFFECTIVE_UPLOAD_MAX_BYTES) {
      return c.json({ error: OVERSIZE_MESSAGE }, 413);
    }
    await writeDocumentBlob(orgId, id, bytes);
    record.blobKey = id;
    record.fileName = input.fileName || record.title;
    record.contentType = input.contentType || "application/octet-stream";
    record.sizeBytes = bytes.byteLength;
  } else {
    if (!input.url) return c.json({ error: "Add a link, or switch to a file." }, 400);
    record.url = input.url;
  }

  await mutateOrg(orgId, (d) => {
    d.documents.push(record);
  });

  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "document.create",
    detail: `Document ${record.id} ("${record.title}") filed under ${record.section}${record.area ? `, module ${record.area} (${areaName(record.area)})` : ""}${record.published ? ", published" : ", not published"}.`,
  });

  return c.json(record, 201);
});

adminDocumentRoutes.patch("/documents/:id", async (c) => {
  const orgId = orgIdOf(c);
  const user = c.get("user");
  const id = c.req.param("id");
  const parsed = documentInputSchema.partial().safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Check the document." }, 400);
  const p = parsed.data;

  if (p.kind === "policy") {
    return c.json(
      { error: "Policies are published automatically from the approved pack; they are not filed here." },
      400,
    );
  }

  // Decode and size-check the new file, if one was sent, before touching
  // the store - a rejected upload must leave the existing record untouched.
  let newBytes: Uint8Array | null = null;
  if (p.kind === "file" && p.fileBase64) {
    newBytes = decodeBase64(p.fileBase64);
    if (!newBytes) return c.json({ error: "That file could not be read." }, 400);
    if (newBytes.byteLength > EFFECTIVE_UPLOAD_MAX_BYTES) {
      return c.json({ error: OVERSIZE_MESSAGE }, 413);
    }
  }

  const result = await mutateOrg(orgId, (doc) => {
    const record = doc.documents.find((d) => d.id === id);
    if (!record) return null;

    if (p.section !== undefined) record.section = p.section;
    if (p.area !== undefined) record.area = p.area;
    if (p.title !== undefined) record.title = p.title;
    if (p.version !== undefined) record.version = p.version;
    if (p.asAt !== undefined) record.asAt = p.asAt;
    if (p.owner !== undefined) record.owner = p.owner;
    if (p.published !== undefined) record.published = p.published;

    const wasFile = record.kind === "file";

    if (p.kind === "file") {
      record.kind = "file";
      if (newBytes) {
        record.fileName = p.fileName || record.title;
        record.contentType = p.contentType || "application/octet-stream";
        record.sizeBytes = newBytes.byteLength;
        record.blobKey = record.id;
        record.url = "";
      }
    } else if (p.kind === "link") {
      record.kind = "link";
      if (p.url !== undefined) record.url = p.url;
      if (wasFile) {
        record.blobKey = null;
        record.fileName = "";
        record.contentType = "";
        record.sizeBytes = 0;
      }
    } else if (p.url !== undefined && record.kind === "link") {
      record.url = p.url;
    }

    record.updatedAt = new Date().toISOString();
    record.updatedBy = user.displayName;
    return { record, blobRemoved: wasFile && p.kind === "link" };
  });

  if (!result) return c.json({ error: "Document not found" }, 404);

  if (newBytes) await writeDocumentBlob(orgId, id, newBytes);
  if (result.blobRemoved) await deleteDocumentBlob(orgId, id);

  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "document.update",
    detail: `Document ${id} ("${result.record.title}") updated.`,
  });

  return c.json(result.record);
});

adminDocumentRoutes.delete("/documents/:id", async (c) => {
  const orgId = orgIdOf(c);
  const user = c.get("user");
  const id = c.req.param("id");

  const removed = await mutateOrg(orgId, (doc) => {
    const i = doc.documents.findIndex((d) => d.id === id);
    if (i === -1) return null;
    const [record] = doc.documents.splice(i, 1);
    return record;
  });

  if (!removed) return c.json({ error: "Document not found" }, 404);
  if (removed.kind === "file") await deleteDocumentBlob(orgId, id);

  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "document.remove",
    detail: `Document ${id} ("${removed.title}") removed.`,
  });

  return c.json({ ok: true });
});

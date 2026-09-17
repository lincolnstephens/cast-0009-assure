import { Hono } from "hono";
import type { ExportRecord } from "../db/model.ts";
import { listOrgIds, mutateOrg, newId, readExportBlob, readOrg } from "../db/store.ts";
import { writeAudit } from "../lib/audit.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";

export const exportRoutes = new Hono<AppEnv>();
exportRoutes.use("*", requireAuth);

/**
 * Find an export by id without knowing its organisation up front. Exports
 * live inside a per-org document (no global table any more), so this scans
 * the small, beta-scale set of organisations — used only for the download
 * route, which (like the original API) carries no organisation id.
 */
async function findExportAnywhere(id: string): Promise<{ orgId: string; row: ExportRecord } | null> {
  for (const orgId of await listOrgIds()) {
    const doc = await readOrg(orgId);
    const row = doc?.exports.find((e) => e.id === id);
    if (row) return { orgId, row };
  }
  return null;
}

/** Client's export requests for their account. */
exportRoutes.get("/", requireRole("client"), async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);
  const doc = await readOrg(user.clientAccountId);
  if (!doc) return c.json({ error: "No organisation" }, 404);

  return c.json({
    exports: doc.exports.map((r) => ({
      id: r.id,
      state: r.state,
      generatedAt: r.generatedAt,
      downloadable: r.state === "generated",
    })),
  });
});

/** Request a defence-file export — creates a review item for officer approval. */
exportRoutes.post("/", requireRole("client"), async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);
  const orgId = user.clientAccountId;

  let conflict = false;
  const created = await mutateOrg(orgId, (doc) => {
    if (doc.exports.some((e) => e.state === "requested")) {
      conflict = true;
      return null;
    }
    const row: ExportRecord = {
      id: newId(),
      orgId,
      requestedBy: user.id,
      requestedByName: user.displayName,
      state: "requested",
      approvedBy: null,
      approvedAt: null,
      generatedAt: null,
      contents: [],
      blobKey: null,
      entryId: null,
    };
    doc.exports.push(row);
    doc.review.push({
      id: newId(),
      orgId,
      type: "export_request",
      refId: row.id,
      summary: "Defence-file export requested.",
      state: "pending",
      decidedBy: null,
      decidedAt: null,
      createdAt: new Date().toISOString(),
    });
    return row;
  });

  if (conflict || !created) {
    return c.json({ error: "You already have an export awaiting approval." }, 409);
  }

  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "export.request",
    detail: `exportId=${created.id}`,
  });

  return c.json({ id: created.id }, 201);
});

/** Download a generated defence file — tenant-scoped for clients, either role signed in. */
exportRoutes.get("/:id/download", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  let found: { orgId: string; row: ExportRecord } | null = null;
  if (user.role === "client") {
    if (user.clientAccountId) {
      const doc = await readOrg(user.clientAccountId);
      const row = doc?.exports.find((e) => e.id === id);
      if (row) found = { orgId: user.clientAccountId, row };
    }
    if (!found) {
      const elsewhere = await findExportAnywhere(id);
      return c.json({ error: elsewhere ? "Forbidden" : "Not found" }, elsewhere ? 403 : 404);
    }
  } else {
    found = await findExportAnywhere(id);
    if (!found) return c.json({ error: "Not found" }, 404);
  }

  const { row } = found;
  if (row.state !== "generated" || !row.blobKey) {
    return c.json({ error: "This export is not ready to download yet." }, 404);
  }
  const bytes = await readExportBlob(row.id);
  if (!bytes) return c.json({ error: "This export is not ready to download yet." }, 404);

  const filename = `defence-file-${row.id.slice(0, 8)}.zip`;
  // Cast: @types/node's Uint8Array<ArrayBufferLike> is not structurally
  // assignable to lib.dom's BodyInit even though this is exactly the byte
  // buffer a Response body accepts at runtime.
  return new Response(bytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});

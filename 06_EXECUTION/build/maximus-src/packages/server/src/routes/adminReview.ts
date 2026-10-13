import {
  acceptSubmissionSchema,
  returnSubmissionSchema,
  reviewAnswerSchema,
  reviewDecisionSchema,
  reviewItemTypeSchema,
} from "@maximus/shared";
import { Hono } from "hono";
import { readOrg } from "../db/store.ts";
import { requireAuth, requireRole, type AppEnv, ADMIN_ORG_HEADER } from "../lib/middleware.ts";
import {
  answerChatAmber,
  approveExportRequest,
  approveReviewItem,
  findReviewItemOrgId,
  pendingReviewItems,
  rejectReviewItem,
  decideTaskConfirmation,
  acceptDocumentSubmission,
  returnDocumentSubmission,
  ReviewError,
} from "../lib/reviewQueue.ts";
import { closeTaskAndRaiseEntry } from "./adminWorkplan.ts";

export const adminReviewRoutes = new Hono<AppEnv>();
adminReviewRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

/** Unified review queue - pending items oldest first, optional type filter. */
adminReviewRoutes.get("/review", async (c) => {
  const accountId = c.req.query("accountId") || c.req.header(ADMIN_ORG_HEADER);
  if (!accountId) return c.json({ error: "accountId is required" }, 400);

  const typeParam = c.req.query("type");
  const typeParsed = typeParam ? reviewItemTypeSchema.safeParse(typeParam) : null;
  if (typeParam && !typeParsed?.success) {
    return c.json({ error: "Invalid type filter." }, 400);
  }

  const items = await pendingReviewItems(accountId, typeParsed?.success ? typeParsed.data : undefined);
  return c.json({ items });
});

adminReviewRoutes.post("/review/:id/answer", async (c) => {
  const parsed = reviewAnswerSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Write a reply first." }, 400);

  const id = c.req.param("id");
  const user = c.get("user");
  const orgId = await findReviewItemOrgId(id);
  if (!orgId) return c.json({ error: "Review item not found or already decided." }, 404);

  try {
    await answerChatAmber(orgId, id, user.id, user.displayName, parsed.data.reply);
    return c.json({ ok: true });
  } catch (err) {
    if (err instanceof ReviewError) return c.json({ error: err.message }, err.status as 400);
    throw err;
  }
});

adminReviewRoutes.post("/review/:id/approve", async (c) => {
  reviewDecisionSchema.safeParse(await c.req.json().catch(() => ({})));

  const id = c.req.param("id");
  const user = c.get("user");
  const orgId = await findReviewItemOrgId(id);
  if (!orgId) return c.json({ error: "Review item not found or already decided." }, 404);

  const doc = await readOrg(orgId);
  const item = doc?.review.find((r) => r.id === id);
  if (!item) return c.json({ error: "Review item not found or already decided." }, 404);

  try {
    if (item.type === "export_request") {
      const exportId = await approveExportRequest(orgId, id, user.id, user.displayName);
      return c.json({ ok: true, exportId });
    }
    if (item.type === "alert" || item.type === "intake") {
      await approveReviewItem(orgId, id, user.id, user.displayName, item.type);
      return c.json({ ok: true });
    }
    if (item.type === "task_confirmation") {
      // Accepting the client's word is what closes the task, and closing it is
      // what books the work on the Record. The operator's decision, not the
      // client's, is the thing with consequences.
      await decideTaskConfirmation(orgId, id, user.id, user.displayName, true, (doc, task, name) => {
        task.status = "done";
        task.progress = 100;
        task.updatedBy = name;
        task.updatedAt = new Date().toISOString();
        closeTaskAndRaiseEntry(doc, task, {
          reviewer: name,
          outcome: "Confirmed by the client and accepted by MITMARK.",
        });
      });
      return c.json({ ok: true });
    }
    if (item.type === "document_submission") {
      return c.json({ error: "Choose a section, then accept the document." }, 409);
    }
    return c.json({ error: "This item must be answered, not approved." }, 409);
  } catch (err) {
    if (err instanceof ReviewError) return c.json({ error: err.message }, err.status as 400);
    throw err;
  }
});

adminReviewRoutes.post("/review/:id/reject", async (c) => {
  const parsed = reviewDecisionSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) return c.json({ error: "Invalid request." }, 400);

  const id = c.req.param("id");
  const user = c.get("user");
  const orgId = await findReviewItemOrgId(id);
  if (!orgId) return c.json({ error: "Review item not found or already decided." }, 404);

  try {
    const doc = await readOrg(orgId);
    const item = doc?.review.find((r) => r.id === id);
    if (item?.type === "document_submission") {
      const reason = parsed.data.note?.trim();
      if (!reason) return c.json({ error: "Give the client a one-line reason." }, 400);
      await returnDocumentSubmission(orgId, id, user.id, user.displayName, reason.slice(0, 300));
      return c.json({ ok: true });
    }
    if (item?.type === "task_confirmation") {
      // Reopening clears the client's claim and leaves the task where it was.
      await decideTaskConfirmation(orgId, id, user.id, user.displayName, false, () => {});
      return c.json({ ok: true });
    }
    await rejectReviewItem(orgId, id, user.id, user.displayName, parsed.data.note);
    return c.json({ ok: true });
  } catch (err) {
    if (err instanceof ReviewError) return c.json({ error: err.message }, err.status as 400);
    throw err;
  }
});

/** v1.7 (FRAGO 07 3.1). Accept a client's document: choose its section; only now is it published. */
adminReviewRoutes.post("/review/:id/accept-document", async (c) => {
  const parsed = acceptSubmissionSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Choose the section it belongs in." }, 400);
  const id = c.req.param("id");
  const user = c.get("user");
  const orgId = await findReviewItemOrgId(id);
  if (!orgId) return c.json({ error: "Review item not found or already decided." }, 404);
  try {
    const out = await acceptDocumentSubmission(orgId, id, user.id, user.displayName, parsed.data);
    return c.json({ ok: true, ...out });
  } catch (err) {
    if (err instanceof ReviewError) return c.json({ error: err.message }, err.status as 400);
    throw err;
  }
});

/** v1.7. Return a client's document with a one-line reason she sees. */
adminReviewRoutes.post("/review/:id/return-document", async (c) => {
  const parsed = returnSubmissionSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Give the client a one-line reason." }, 400);
  const id = c.req.param("id");
  const user = c.get("user");
  const orgId = await findReviewItemOrgId(id);
  if (!orgId) return c.json({ error: "Review item not found or already decided." }, 404);
  try {
    await returnDocumentSubmission(orgId, id, user.id, user.displayName, parsed.data.reason);
    return c.json({ ok: true });
  } catch (err) {
    if (err instanceof ReviewError) return c.json({ error: err.message }, err.status as 400);
    throw err;
  }
});

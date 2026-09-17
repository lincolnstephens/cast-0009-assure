import { reviewAnswerSchema, reviewDecisionSchema, reviewItemTypeSchema } from "@maximus/shared";
import { Hono } from "hono";
import { readOrg } from "../db/store.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";
import {
  answerChatAmber,
  approveExportRequest,
  approveReviewItem,
  findReviewItemOrgId,
  pendingReviewItems,
  rejectReviewItem,
  ReviewError,
} from "../lib/reviewQueue.ts";

export const adminReviewRoutes = new Hono<AppEnv>();
adminReviewRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

/** Unified review queue — pending items oldest first, optional type filter. */
adminReviewRoutes.get("/review", async (c) => {
  const accountId = c.req.query("accountId");
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
    await rejectReviewItem(orgId, id, user.id, user.displayName, parsed.data.note);
    return c.json({ ok: true });
  } catch (err) {
    if (err instanceof ReviewError) return c.json({ error: err.message }, err.status as 400);
    throw err;
  }
});

import { reviewAnswerSchema, reviewDecisionSchema, reviewItemTypeSchema } from "@maximus/shared";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { getDb } from "../db/index.ts";
import { reviewItems } from "../db/schema.ts";
import {
  approveExportRequest,
  approveReviewItem,
  answerChatAmber,
  pendingReviewItems,
  rejectReviewItem,
  ReviewError,
} from "../lib/reviewQueue.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";

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

  const items = await pendingReviewItems(
    getDb(),
    accountId,
    typeParsed?.success ? typeParsed.data : undefined,
  );
  return c.json({ items });
});

adminReviewRoutes.post("/review/:id/answer", async (c) => {
  const parsed = reviewAnswerSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Write a reply first." }, 400);

  try {
    await answerChatAmber(getDb(), c.req.param("id"), c.get("user").id, parsed.data.reply);
    return c.json({ ok: true });
  } catch (err) {
    if (err instanceof ReviewError) return c.json({ error: err.message }, err.status as 400);
    throw err;
  }
});

adminReviewRoutes.post("/review/:id/approve", async (c) => {
  reviewDecisionSchema.safeParse(await c.req.json().catch(() => ({})));

  const db = getDb();
  const user = c.get("user");
  const id = c.req.param("id");

  const [item] = await db
    .select()
    .from(reviewItems)
    .where(and(eq(reviewItems.id, id), eq(reviewItems.state, "pending")))
    .limit(1);
  if (!item) return c.json({ error: "Review item not found or already decided." }, 404);

  try {
    if (item.type === "export_request") {
      const exportId = await approveExportRequest(db, id, user.id);
      return c.json({ ok: true, exportId });
    }
    if (item.type === "alert" || item.type === "intake") {
      await approveReviewItem(db, id, user.id, item.type);
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

  try {
    await rejectReviewItem(getDb(), c.req.param("id"), c.get("user").id, parsed.data.note);
    return c.json({ ok: true });
  } catch (err) {
    if (err instanceof ReviewError) return c.json({ error: err.message }, err.status as 400);
    throw err;
  }
});

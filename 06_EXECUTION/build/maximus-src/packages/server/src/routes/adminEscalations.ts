import { answerEscalationSchema } from "@maximus/shared";
import { and, desc, eq, lt } from "drizzle-orm";
import { Hono } from "hono";
import { getDb } from "../db/index.ts";
import {
  chatMessages,
  chatThreads,
  escalations,
  reviewItems,
} from "../db/schema.ts";
import { writeAudit } from "../lib/audit.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";

export const adminEscalationRoutes = new Hono<AppEnv>();
adminEscalationRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

/** Escalations for an account, open first, each with its chat context. */
adminEscalationRoutes.get("/escalations", async (c) => {
  const db = getDb();
  const accountId = c.req.query("accountId");
  if (!accountId) return c.json({ error: "accountId is required" }, 400);

  const rows = await db
    .select({
      escalation: escalations,
      threadId: chatThreads.id,
    })
    .from(escalations)
    .innerJoin(chatThreads, eq(escalations.threadId, chatThreads.id))
    .where(eq(chatThreads.clientAccountId, accountId))
    .orderBy(desc(escalations.createdAt));

  const detailed = [];
  for (const { escalation } of rows) {
    // The flagged guide message, and the client question just before it.
    const [flagged] = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, escalation.messageId))
      .limit(1);
    const [question] = flagged
      ? await db
          .select()
          .from(chatMessages)
          .where(
            and(
              eq(chatMessages.threadId, escalation.threadId),
              eq(chatMessages.sender, "client"),
              lt(chatMessages.createdAt, flagged.createdAt),
            ),
          )
          .orderBy(desc(chatMessages.createdAt))
          .limit(1)
      : [];

    detailed.push({
      id: escalation.id,
      state: escalation.state,
      createdAt: escalation.createdAt.toISOString(),
      answeredAt: escalation.answeredAt?.toISOString() ?? null,
      question: question?.body ?? "(question unavailable)",
      guideReply: flagged?.body ?? "",
    });
  }

  return c.json({ escalations: detailed });
});

/** Spec §5.1: answering posts the officer's reply into the client's thread. */
adminEscalationRoutes.post("/escalations/:id/answer", async (c) => {
  const parsed = answerEscalationSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Write a reply first." }, 400);

  const db = getDb();
  const user = c.get("user");

  const [row] = await db
    .select({ escalation: escalations, clientAccountId: chatThreads.clientAccountId })
    .from(escalations)
    .innerJoin(chatThreads, eq(escalations.threadId, chatThreads.id))
    .where(eq(escalations.id, c.req.param("id")))
    .limit(1);
  if (!row) return c.json({ error: "Not found" }, 404);
  if (row.escalation.state !== "open") {
    return c.json({ error: "This escalation has already been answered." }, 409);
  }

  const [reply] = await db
    .insert(chatMessages)
    .values({
      threadId: row.escalation.threadId,
      sender: "officer",
      body: parsed.data.reply,
    })
    .returning();

  await db
    .update(escalations)
    .set({
      state: "answered",
      officerId: user.id,
      officerNote: parsed.data.reply,
      answeredAt: new Date(),
    })
    .where(eq(escalations.id, row.escalation.id));

  await db
    .update(reviewItems)
    .set({ state: "approved", officerId: user.id, decidedAt: new Date() })
    .where(and(eq(reviewItems.type, "chat_amber"), eq(reviewItems.refId, row.escalation.id)));

  await writeAudit(db, {
    clientAccountId: row.clientAccountId,
    actorId: user.id,
    action: "escalation.answer",
    entity: "escalation",
    entityId: row.escalation.id,
    detail: { messageId: reply.id },
  });

  return c.json({ ok: true });
});

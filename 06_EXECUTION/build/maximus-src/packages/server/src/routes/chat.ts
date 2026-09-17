import { sendChatMessageSchema, type StoredCitation } from "@maximus/shared";
import { and, eq, gte, sql } from "drizzle-orm";
import { Hono } from "hono";
import { getDb, type Db } from "../db/index.ts";
import {
  chatMessages,
  chatThreads,
  clientAccounts,
  escalations,
  reviewItems,
  users,
} from "../db/schema.ts";
import { writeAudit } from "../lib/audit.ts";
import { buildCorpus } from "../lib/guide/corpus.ts";
import { enforce, parseRawResult, type EnforcedReply } from "../lib/guide/enforce.ts";
import { askLlm, GuideBusyError, isLlmConfigured } from "../lib/guide/llm.ts";
import { askStub } from "../lib/guide/stub.ts";
import { createIntakeWithClock } from "../lib/intakes.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";

const BUSY_COPY = "The Guide is busy right now. Give me a few seconds and ask that again.";
const EMPTY_CORPUS_COPY =
  "Your policy pack is being prepared by your compliance officer. I can't answer from approved policies yet — once they're signed off, ask me again.";
const RATE_LIMIT_PER_MINUTE = 10;

export const chatRoutes = new Hono<AppEnv>();
chatRoutes.use("*", requireAuth, requireRole("client"));

/** The user's thread (created on first visit) with full message history. */
chatRoutes.get("/thread", async (c) => {
  const db = getDb();
  const user = c.get("user");
  const thread = await getOrCreateThread(db, user.id, user.clientAccountId!);

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.threadId, thread.id))
    .orderBy(chatMessages.createdAt);

  const officerName = await officerDisplayName(db);

  return c.json({
    threadId: thread.id,
    officerName,
    messages: messages.map(serialiseMessage),
  });
});

/** One guide round-trip: user message in, enforced guide reply out. */
chatRoutes.post("/messages", async (c) => {
  const parsed = sendChatMessageSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Type a question first." }, 400);
  }

  const db = getDb();
  const user = c.get("user");
  const thread = await getOrCreateThread(db, user.id, user.clientAccountId!);

  // Spec §8: 10 messages/min/user. Counted from the DB so it holds across
  // stateless function instances.
  const oneMinuteAgo = new Date(Date.now() - 60_000);
  const [{ recent }] = await db
    .select({ recent: sql<number>`count(*)::int` })
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.threadId, thread.id),
        eq(chatMessages.sender, "client"),
        gte(chatMessages.createdAt, oneMinuteAgo),
      ),
    );
  if (recent >= RATE_LIMIT_PER_MINUTE) {
    return c.json({ error: "That's a lot of questions at once — give me a minute, then ask again." }, 429);
  }

  const question = parsed.data.body;
  const corpus = await buildCorpus(db, user.clientAccountId!);
  const officerName = await officerDisplayName(db);

  let reply: EnforcedReply;
  if (corpus.length === 0) {
    reply = { status: "amber", answer: EMPTY_CORPUS_COPY, citations: [] };
  } else {
    // Ask the model (or the deterministic stub when no key is configured),
    // BEFORE writing the user message, so a busy model leaves no half-state.
    try {
      if (isLlmConfigured()) {
        const { text } = await askLlm(thread.clientName, corpus, question);
        reply = enforce(parseRawResult(text), corpus);
      } else {
        reply = enforce(askStub(corpus, question), corpus);
      }
    } catch (err) {
      if (err instanceof GuideBusyError) {
        return c.json({ error: BUSY_COPY, retryable: true }, 503);
      }
      throw err;
    }
  }

  const [userMessage] = await db
    .insert(chatMessages)
    .values({ threadId: thread.id, sender: "client", body: question })
    .returning();

  const guideBody = await applySideEffects(db, {
    reply,
    threadId: thread.id,
    clientAccountId: user.clientAccountId!,
    actorId: user.id,
    officerName,
  });

  const [guideMessage] = await db
    .insert(chatMessages)
    .values({
      threadId: thread.id,
      sender: "guide",
      body: guideBody,
      status: reply.status,
      citations: reply.citations,
    })
    .returning();

  // Amber: link the escalation to the guide message it flagged (not for empty corpus).
  if (reply.status === "amber" && corpus.length > 0) {
    await createEscalation(db, {
      threadId: thread.id,
      messageId: guideMessage.id,
      clientAccountId: user.clientAccountId!,
      actorId: user.id,
    });
  }

  await writeAudit(db, {
    clientAccountId: user.clientAccountId!,
    actorId: user.id,
    action: "chat.message",
    entity: "chat_message",
    entityId: guideMessage.id,
    detail: { status: reply.status, citations: reply.citations.length },
  });

  return c.json({
    messages: [serialiseMessage(userMessage), serialiseMessage(guideMessage)],
  });
});

/** Amber/red side effects; returns the fixed copy to store as the reply body. */
async function applySideEffects(
  db: Db,
  input: {
    reply: EnforcedReply;
    threadId: string;
    clientAccountId: string;
    actorId: string;
    officerName: string;
  },
): Promise<string> {
  const { reply, officerName } = input;

  if (reply.status === "red" && reply.intake) {
    // Same plumbing as POST /api/requests (Phase 2) — not a parallel path.
    await createIntakeWithClock(db, {
      clientAccountId: input.clientAccountId,
      type: reply.intake.type,
      source: "chat",
      summary: reply.intake.summary,
      actorId: input.actorId,
    });
    const noun = reply.intake.type === "sar" ? "data request" : "potential incident";
    return `What you've described is a formal ${noun}. I've started the statutory process and alerted ${officerName}.`;
  }

  if (reply.status === "amber") {
    if (reply.answer === EMPTY_CORPUS_COPY) return reply.answer;
    return `This needs a judgement call from your compliance officer. I've flagged it to ${officerName} — meanwhile, here's what's useful to gather: dates, names, and any documents or messages involved.`;
  }

  return reply.answer;
}

async function createEscalation(
  db: Db,
  input: { threadId: string; messageId: string; clientAccountId: string; actorId: string },
) {
  const [escalation] = await db
    .insert(escalations)
    .values({ threadId: input.threadId, messageId: input.messageId, state: "open" })
    .returning();

  await db.insert(reviewItems).values({
    clientAccountId: input.clientAccountId,
    type: "chat_amber",
    refId: escalation.id,
    state: "pending",
  });

  await writeAudit(db, {
    clientAccountId: input.clientAccountId,
    actorId: input.actorId,
    action: "escalation.create",
    entity: "escalation",
    entityId: escalation.id,
    detail: { threadId: input.threadId },
  });

  return escalation;
}

async function getOrCreateThread(db: Db, userId: string, clientAccountId: string) {
  const [{ clientName }] = await db
    .select({ clientName: clientAccounts.name })
    .from(clientAccounts)
    .where(eq(clientAccounts.id, clientAccountId));

  const [existing] = await db
    .select({ id: chatThreads.id })
    .from(chatThreads)
    .where(and(eq(chatThreads.userId, userId), eq(chatThreads.clientAccountId, clientAccountId)))
    .limit(1);
  if (existing) return { id: existing.id, clientName };

  const [created] = await db
    .insert(chatThreads)
    .values({ userId, clientAccountId })
    .returning({ id: chatThreads.id });
  return { id: created.id, clientName };
}

async function officerDisplayName(db: Db): Promise<string> {
  const [officer] = await db
    .select({ displayName: users.displayName })
    .from(users)
    .where(eq(users.role, "mitmark_admin"))
    .limit(1);
  return officer?.displayName ?? "your compliance officer";
}

function serialiseMessage(m: typeof chatMessages.$inferSelect) {
  return {
    id: m.id,
    sender: m.sender,
    body: m.body,
    status: m.status,
    citations: (m.citations ?? []) as StoredCitation[],
    createdAt: m.createdAt.toISOString(),
  };
}

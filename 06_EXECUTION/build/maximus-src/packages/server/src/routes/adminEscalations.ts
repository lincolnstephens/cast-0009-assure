import { answerEscalationSchema } from "@maximus/shared";
import { Hono } from "hono";
import type { ChatMessageRecord } from "../db/model.ts";
import { mutateOrg, newId, readOrg } from "../db/store.ts";
import { writeAudit } from "../lib/audit.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";
import { findEscalationOrgId } from "../lib/reviewQueue.ts";
import { raiseGuideEntry } from "../lib/raiseEntry.ts";

export const adminEscalationRoutes = new Hono<AppEnv>();
adminEscalationRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

/** Escalations for an account, newest first. */
adminEscalationRoutes.get("/escalations", async (c) => {
  const accountId = c.req.query("accountId");
  if (!accountId) return c.json({ error: "accountId is required" }, 400);
  const doc = await readOrg(accountId);
  if (!doc) return c.json({ error: "Organisation not found" }, 404);

  const rows = [...doc.escalations].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return c.json({
    escalations: rows.map((e) => ({
      id: e.id,
      state: e.state,
      createdAt: e.createdAt,
      answeredAt: e.answeredAt,
      question: e.question,
      answer: e.answer,
    })),
  });
});

/** Spec §5.1: answering posts the officer's reply into the client's thread,
 * and raises a Record entry (line 12) for the deciding admin. */
adminEscalationRoutes.post("/escalations/:id/answer", async (c) => {
  const parsed = answerEscalationSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Write a reply first." }, 400);

  const id = c.req.param("id");
  const user = c.get("user");
  const orgId = await findEscalationOrgId(id);
  if (!orgId) return c.json({ error: "Not found" }, 404);

  let conflict = false;
  const reply = await mutateOrg(orgId, (doc) => {
    const escalation = doc.escalations.find((e) => e.id === id);
    if (!escalation) {
      conflict = true;
      return null;
    }
    if (escalation.state !== "open") {
      conflict = true;
      return null;
    }

    const now = new Date().toISOString();
    const message: ChatMessageRecord = {
      id: newId(),
      threadId: escalation.threadId!,
      sender: "officer",
      body: parsed.data.reply,
      citations: [],
      escalated: false,
      createdAt: now,
    };
    doc.messages.push(message);

    escalation.state = "answered";
    escalation.answer = parsed.data.reply;
    escalation.answeredBy = user.id;
    escalation.answeredAt = now;

    const item = doc.review.find((r) => r.type === "chat_amber" && r.refId === escalation.id && r.state === "pending");
    if (item) {
      item.state = "approved";
      item.decidedBy = user.id;
      item.decidedAt = now;
    }

    raiseGuideEntry(doc, { refId: escalation.id, reviewer: user.displayName, decisionNote: parsed.data.reply });

    return message;
  });

  if (conflict || !reply) {
    return c.json({ error: "This escalation has already been answered." }, 409);
  }

  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "escalation.answer",
    detail: `messageId=${reply.id}`,
  });

  return c.json({ ok: true });
});

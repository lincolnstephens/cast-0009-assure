import { sendChatMessageSchema, type StoredCitation } from "@maximus/shared";
import { Hono } from "hono";
import type { ChatMessageRecord, ChatThreadRecord, EscalationRecord, OrgDoc } from "../db/model.ts";
import { mutateOrg, newId, readOrg, readUsers } from "../db/store.ts";
import { writeAudit } from "../lib/audit.ts";
import { buildCorpus } from "../lib/guide/corpus.ts";
import { enforce, parseRawResult, type EnforcedReply } from "../lib/guide/enforce.ts";
import { askLlm, GuideBusyError, GuideUnavailableError, isLlmConfigured } from "../lib/guide/llm.ts";
import { askStub } from "../lib/guide/stub.ts";
import { createIntakeWithClock } from "../lib/intakes.ts";
import { requireAuth, requireClientSeat, type AppEnv } from "../lib/middleware.ts";

const BUSY_COPY = "The Guide is busy right now. Give me a few seconds and ask that again.";
const EMPTY_CORPUS_COPY =
  "Your policy pack is being prepared by your compliance officer. I can't answer from approved policies yet - once they're signed off, ask me again.";
const RATE_LIMIT_PER_MINUTE = 10;

export const chatRoutes = new Hono<AppEnv>();
chatRoutes.use("*", requireAuth, requireClientSeat);

/** The user's thread (created on first visit) with full message history. */
chatRoutes.get("/thread", async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);
  const orgId = user.clientAccountId;

  const officerName = await officerDisplayName();
  const threadOf = (doc: OrgDoc, thread: ChatThreadRecord) => ({
    threadId: thread.id,
    messages: doc.messages
      .filter((m) => m.threadId === thread.id)
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)),
  });

  // Reading an existing thread is a read, not a write. Only the client's own
  // first visit creates the thread; the operator's client view never does
  // (FRAGO 04 3.2), and shows an empty conversation until the client has one.
  const current = await readOrg(orgId);
  if (!current) return c.json({ error: "No organisation" }, 404);
  const existing = current.threads.find((t) => t.userId === user.id);
  let result: { threadId: string; messages: ChatMessageRecord[] };
  if (existing) {
    result = threadOf(current, existing);
  } else if (c.get("preview")) {
    result = { threadId: "", messages: [] };
  } else {
    result = await mutateOrg(orgId, (doc) => threadOf(doc, getOrCreateThread(doc, user.id)));
  }

  return c.json({
    threadId: result.threadId,
    officerName,
    messages: result.messages.map(serialiseMessage),
  });
});

type PostResult =
  | { kind: "rate_limited" }
  | { kind: "busy" }
  | { kind: "ok"; userMessage: ChatMessageRecord; guideMessage: ChatMessageRecord; reply: EnforcedReply };

/** One guide round-trip: user message in, enforced guide reply out. */
chatRoutes.post("/messages", async (c) => {
  const parsed = sendChatMessageSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Type a question first." }, 400);
  }

  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);
  const orgId = user.clientAccountId;
  const question = parsed.data.body;
  const officerName = await officerDisplayName();

  const result: PostResult = await mutateOrg(orgId, async (doc): Promise<PostResult> => {
    const thread = getOrCreateThread(doc, user.id);

    // Spec §8: 10 messages/min/user.
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const recent = doc.messages.filter(
      (m) => m.threadId === thread.id && m.sender === "user" && m.createdAt >= oneMinuteAgo,
    ).length;
    if (recent >= RATE_LIMIT_PER_MINUTE) return { kind: "rate_limited" };

    const corpus = buildCorpus(doc);
    let reply: EnforcedReply;
    if (corpus.length === 0) {
      reply = { status: "amber", answer: EMPTY_CORPUS_COPY, citations: [], intake: null };
    } else {
      // Ask the model (or the deterministic stub when no key is configured),
      // BEFORE writing the user message, so a busy model leaves no half-state.
      try {
        if (isLlmConfigured()) {
          const { text } = await askLlm(doc.branding.displayName || doc.name, corpus, question);
          reply = enforce(parseRawResult(text), corpus);
        } else {
          reply = enforce(askStub(corpus, question), corpus);
        }
      } catch (err) {
        if (err instanceof GuideUnavailableError) {
          // The key or the request is wrong, not the moment. Answering from the
          // approved policies with the deterministic matcher is better than
          // telling her to come back in a few seconds for an answer that will
          // never arrive.
          reply = enforce(askStub(corpus, question), corpus);
        } else if (err instanceof GuideBusyError) {
          return { kind: "busy" };
        } else {
          throw err;
        }
      }
    }

    const now = new Date().toISOString();
    const userMessage: ChatMessageRecord = {
      id: newId(),
      threadId: thread.id,
      sender: "user",
      body: question,
      citations: [],
      escalated: false,
      createdAt: now,
    };
    doc.messages.push(userMessage);

    const guideBody = applyReplyCopy(reply, officerName);
    // A real escalation is raised only for amber with a real corpus (the
    // empty-corpus amber has nothing to escalate to). ChatMessageRecord has
    // no persisted "status" column, so the citations array also carries a
    // status marker for amber/red replies (see encodeStatusCitations) - the
    // only reliable way to recover green/amber/red on a later read.
    const escalated = reply.status === "amber" && corpus.length > 0;
    const guideMessage: ChatMessageRecord = {
      id: newId(),
      threadId: thread.id,
      sender: "guide",
      body: guideBody,
      citations: encodeStatusCitations(reply),
      escalated,
      createdAt: now,
    };
    doc.messages.push(guideMessage);

    // Amber (with a real corpus): raise an escalation + review item.
    if (escalated) {
      createEscalation(doc, { threadId: thread.id, question });
    }

    // Red: same plumbing as "raise a request" - not a parallel path.
    if (reply.status === "red" && reply.intake) {
      createIntakeWithClock(doc, {
        type: reply.intake.type,
        source: "chat",
        summary: reply.intake.summary,
        raisedBy: user.id,
      });
    }

    return { kind: "ok", userMessage, guideMessage, reply };
  });

  if (result.kind === "rate_limited") {
    return c.json(
      { error: "That's a lot of questions at once - give me a minute, then ask again." },
      429,
    );
  }
  if (result.kind === "busy") {
    return c.json({ error: BUSY_COPY, retryable: true }, 503);
  }

  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "chat.message",
    detail: `status=${result.reply.status} citations=${result.reply.citations.length}`,
  });

  return c.json({
    messages: [serialiseMessage(result.userMessage), serialiseMessage(result.guideMessage)],
  });
});

/** The fixed copy stored as the guide reply body for amber/red states. */
function applyReplyCopy(reply: EnforcedReply, officerName: string): string {
  if (reply.status === "red" && reply.intake) {
    const noun = reply.intake.type === "sar" ? "data request" : "potential incident";
    return `What you've described is a formal ${noun}. I've started the statutory process and alerted ${officerName}.`;
  }
  if (reply.status === "amber") {
    if (reply.answer === EMPTY_CORPUS_COPY) return reply.answer;
    return `This needs a judgement call from your compliance officer. I've flagged it to ${officerName} - meanwhile, here's what's useful to gather: dates, names, and any documents or messages involved.`;
  }
  return reply.answer;
}

function createEscalation(doc: OrgDoc, input: { threadId: string; question: string }): EscalationRecord {
  const now = new Date().toISOString();
  const escalation: EscalationRecord = {
    id: newId(),
    orgId: doc.id,
    threadId: input.threadId,
    question: input.question,
    state: "open",
    answer: null,
    answeredBy: null,
    answeredAt: null,
    createdAt: now,
  };
  doc.escalations.push(escalation);

  doc.review.push({
    id: newId(),
    orgId: doc.id,
    type: "chat_amber",
    refId: escalation.id,
    summary: `Amber policy question: "${trim(input.question, 140)}"`,
    state: "pending",
    decidedBy: null,
    decidedAt: null,
    createdAt: now,
  });

  return escalation;
}

function getOrCreateThread(doc: OrgDoc, userId: string): ChatThreadRecord {
  const existing = doc.threads.find((t) => t.userId === userId);
  if (existing) return existing;
  const created: ChatThreadRecord = {
    id: newId(),
    orgId: doc.id,
    userId,
    title: "Policy questions",
    createdAt: new Date().toISOString(),
  };
  doc.threads.push(created);
  return created;
}

async function officerDisplayName(): Promise<string> {
  const usersDoc = await readUsers();
  const officer = usersDoc.users.find((u) => u.role === "mitmark_admin");
  return officer?.displayName ?? "your compliance officer";
}

const STATUS_MARKER = "__status:";

/**
 * `ChatMessageRecord.citations` is a plain `string[]` (db/model.ts) - there
 * is no separate stored status. Green messages store one JSON-encoded
 * `StoredCitation` per citation; amber/red messages (which never carry a
 * citation) store a single status marker instead, so a later read can still
 * tell amber apart from red. See `decodeCitations` / `statusOf`.
 */
function encodeStatusCitations(reply: EnforcedReply): string[] {
  if (reply.status === "green") return reply.citations.map((c) => JSON.stringify(c));
  return [`${STATUS_MARKER}${reply.status}`];
}

function decodeCitations(raw: string[]): StoredCitation[] {
  const out: StoredCitation[] = [];
  for (const s of raw) {
    if (s.startsWith(STATUS_MARKER)) continue;
    try {
      out.push(JSON.parse(s) as StoredCitation);
    } catch {
      // Ignore anything that doesn't decode - never surface a raw parse error.
    }
  }
  return out;
}

function statusOf(m: ChatMessageRecord): "green" | "amber" | "red" | null {
  if (m.sender !== "guide") return null;
  const marker = m.citations.find((c) => c.startsWith(STATUS_MARKER));
  if (marker) return marker.slice(STATUS_MARKER.length) as "amber" | "red";
  return "green";
}

function trim(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function serialiseMessage(m: ChatMessageRecord) {
  return {
    id: m.id,
    sender: m.sender,
    body: m.body,
    status: statusOf(m),
    citations: decodeCitations(m.citations),
    createdAt: m.createdAt,
  };
}

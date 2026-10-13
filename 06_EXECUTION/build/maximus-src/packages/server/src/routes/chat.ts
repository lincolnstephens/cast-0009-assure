import { sendChatMessageSchema, type StoredCitation } from "@maximus/shared";
import { Hono } from "hono";
import type { ChatMessageRecord, ChatThreadRecord, EscalationRecord, OrgDoc } from "../db/model.ts";
import { mutateOrg, newId, readGuideHealth, readOrg, readUsers, writeGuideHealth } from "../db/store.ts";
import { writeAudit } from "../lib/audit.ts";
import { buildCorpus, documentSections } from "../lib/guide/corpus.ts";
import { retrieve } from "../lib/guide/retrieve.ts";
import { loadDocumentCorpora } from "../lib/documentCorpus.ts";
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
    result = await mutateOrg(orgId, (doc) => threadOf(doc, getOrCreateThread(doc, user.id, user.testSeat === true)));
  }

  return c.json({
    threadId: result.threadId,
    officerName,
    messages: result.messages.map(serialiseMessage),
    // v1.7. Which path answers, so the page's wording stays true to it.
    guidePath: await livePath(),
  });
});

type PostResult =
  | { kind: "rate_limited" }
  | { kind: "ok"; userMessage: ChatMessageRecord; guideMessage: ChatMessageRecord; reply: EnforcedReply };

type Answered =
  | { kind: "busy" }
  | { kind: "ok"; reply: EnforcedReply; mode: "answer" | "passages" | null; corpusSize: number };

/** How many retrieved passages the model is given to compose from. */
const LLM_PASSAGES = 8;

/**
 * Answer one question over the organisation's corpus, without writing
 * anything. v1.7 (FRAGO 07 3.5): the corpus is the approved policies plus the
 * published procedures' and trackers' extracted text. Retrieval is
 * deterministic. With a model key, the model composes the answer from the
 * retrieved passages only and must cite them; without one, the passages are
 * the answer, each with where it comes from.
 */
async function answer(doc: OrgDoc, question: string): Promise<Answered> {
  const corpus = [...buildCorpus(doc), ...documentSections(await loadDocumentCorpora(doc))];
  if (corpus.length === 0) {
    return {
      kind: "ok",
      reply: { status: "amber", answer: EMPTY_CORPUS_COPY, citations: [], intake: null },
      mode: null,
      corpusSize: 0,
    };
  }
  const passagesPath = (): Answered => {
    const reply = enforce(askStub(corpus, question), corpus);
    return { kind: "ok", reply, mode: reply.status === "green" ? "passages" : null, corpusSize: corpus.length };
  };
  if (!isLlmConfigured()) return passagesPath();
  try {
    const passages = retrieve(corpus, question, LLM_PASSAGES, 1).map((p) => p.section);
    const { text } = await askLlm(doc.branding.displayName || doc.name, passages, question);
    await recordHealth(true, 200);
    const reply = enforce(parseRawResult(text), passages);
    return { kind: "ok", reply, mode: reply.status === "green" ? "answer" : null, corpusSize: corpus.length };
  } catch (err) {
    // The key or the request is wrong, not the moment: show the passages
    // rather than tell her to come back for an answer that will never arrive.
    if (err instanceof GuideUnavailableError) {
      await recordHealth(false, err.httpStatus);
      return passagesPath();
    }
    if (err instanceof GuideBusyError) return { kind: "busy" };
    throw err;
  }
}

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

  const current = await readOrg(orgId);
  if (!current) return c.json({ error: "No organisation" }, 404);

  // v1.7 (FRAGO 07 3.3). In client view, Ask is a pure read: the answer is
  // worked out and shown, and nothing is saved, raised or started. A question
  // that would start a statutory clock or go to MITMARK says so instead.
  if (c.get("preview")) {
    const result = await answer(current, question);
    if (result.kind === "busy") return c.json({ error: BUSY_COPY, retryable: true }, 503);
    const now = new Date().toISOString();
    const userMessage = previewMessage("user", question, now);
    const guideMessage = previewMessage("guide", previewReplyCopy(result.reply, result.mode, officerName), now);
    guideMessage.citations = encodeStatusCitations(result.reply);
    if (result.mode) guideMessage.mode = result.mode;
    return c.json({ messages: [serialiseMessage(userMessage), serialiseMessage(guideMessage)], preview: true });
  }

  // Spec section 8: 10 messages a minute a user, checked before the model is asked.
  if (recentCount(current, user.id) >= RATE_LIMIT_PER_MINUTE) {
    return c.json({ error: "That's a lot of questions at once - give me a minute, then ask again." }, 429);
  }

  // Ask BEFORE writing the user message, so a busy model leaves no half-state.
  const answered = await answer(current, question);
  if (answered.kind === "busy") return c.json({ error: BUSY_COPY, retryable: true }, 503);
  const { reply, mode, corpusSize } = answered;
  const test = user.testSeat === true;

  const result: PostResult = await mutateOrg(orgId, (doc): PostResult => {
    if (recentCount(doc, user.id) >= RATE_LIMIT_PER_MINUTE) return { kind: "rate_limited" };
    const thread = getOrCreateThread(doc, user.id, test);

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

    // A real escalation is raised only for amber with a real corpus (the
    // empty-corpus amber has nothing to escalate to). ChatMessageRecord has
    // no persisted "status" column, so the citations array also carries a
    // status marker for amber/red replies (see encodeStatusCitations) - the
    // only reliable way to recover green/amber/red on a later read.
    const escalated = reply.status === "amber" && corpusSize > 0;
    const guideMessage: ChatMessageRecord = {
      id: newId(),
      threadId: thread.id,
      sender: "guide",
      body: applyReplyCopy(reply, mode, officerName),
      citations: encodeStatusCitations(reply),
      escalated,
      createdAt: now,
      ...(mode ? { mode } : {}),
    };
    doc.messages.push(guideMessage);

    // Amber (with a real corpus): raise an escalation + review item.
    if (escalated) {
      createEscalation(doc, { threadId: thread.id, question, test });
    }

    // Red: same plumbing as "raise a request" - not a parallel path.
    if (reply.status === "red" && reply.intake) {
      createIntakeWithClock(doc, {
        type: reply.intake.type,
        source: "chat",
        summary: reply.intake.summary,
        raisedBy: user.id,
        test,
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

  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "chat.message",
    detail: `status=${result.reply.status} citations=${result.reply.citations.length}${mode ? ` mode=${mode}` : ""}${test ? " test" : ""}`,
  });

  return c.json({
    messages: [serialiseMessage(result.userMessage), serialiseMessage(result.guideMessage)],
  });
});

/**
 * v1.7. "Send to MITMARK" under a passages reply: the passages did not answer
 * it, so the question goes to the operator's review queue as an amber
 * escalation would. Once per reply. Refused in client view by the middleware.
 */
chatRoutes.post("/messages/:id/escalate", async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);
  const orgId = user.clientAccountId;
  const id = c.req.param("id");
  const officerName = await officerDisplayName();
  const test = user.testSeat === true;

  const result = await mutateOrg(orgId, (doc) => {
    const thread = doc.threads.find((t) => t.userId === user.id);
    const reply = doc.messages.find((m) => m.id === id && m.sender === "guide" && m.threadId === thread?.id);
    if (!thread || !reply) return { code: "not_found" as const };
    if (reply.mode !== "passages") return { code: "not_passages" as const };
    if (reply.escalated) return { code: "already" as const };
    const asked = doc.messages
      .filter((m) => m.threadId === thread.id && m.sender === "user" && m.createdAt <= reply.createdAt)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
    reply.escalated = true;
    createEscalation(doc, {
      threadId: thread.id,
      question: asked?.body ?? "A question the passages did not answer.",
      test,
    });
    const note: ChatMessageRecord = {
      id: newId(),
      threadId: thread.id,
      sender: "guide",
      body: `Sent to ${officerName}. The answer will appear here.`,
      citations: [`${STATUS_MARKER}amber`],
      escalated: true,
      createdAt: new Date().toISOString(),
    };
    doc.messages.push(note);
    return { code: "ok" as const, note };
  });

  if (result.code === "not_found") return c.json({ error: "Not found" }, 404);
  if (result.code === "not_passages") return c.json({ error: "Only a passages reply is sent on this way." }, 409);
  if (result.code === "already") return c.json({ error: "This has already gone to MITMARK." }, 409);

  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "chat.escalate",
    detail: `Passages reply ${id} sent to MITMARK${test ? " (test)" : ""}.`,
  });
  return c.json({ messages: [serialiseMessage(result.note)] });
});

/**
 * The path that is actually answering. The model path is live only when a
 * key is set and the last call to the model succeeded; a key that is set
 * but refused, or never yet tried, leaves the passages path live, and the
 * page says so.
 */
async function livePath(): Promise<"model" | "passages"> {
  if (!isLlmConfigured()) return "passages";
  const health = await readGuideHealth();
  return health?.ok === true ? "model" : "passages";
}

async function recordHealth(ok: boolean, httpStatus: number): Promise<void> {
  const prev = await readGuideHealth();
  // Write only on a change of state, so a working Guide is not a store write per question.
  if (!prev || prev.ok !== ok) await writeGuideHealth({ ok, httpStatus, at: new Date().toISOString() });
}

function recentCount(doc: OrgDoc, userId: string): number {
  const thread = doc.threads.find((t) => t.userId === userId);
  if (!thread) return 0;
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  return doc.messages.filter((m) => m.threadId === thread.id && m.sender === "user" && m.createdAt >= oneMinuteAgo)
    .length;
}

function previewMessage(sender: "user" | "guide", body: string, createdAt: string): ChatMessageRecord {
  return { id: `preview-${sender}-${newId()}`, threadId: "", sender, body, citations: [], escalated: false, createdAt };
}

/** The reply copy in client view, where nothing is saved, raised or started. */
function previewReplyCopy(reply: EnforcedReply, mode: "answer" | "passages" | null, officerName: string): string {
  if (reply.status === "red" && reply.intake) {
    const noun = reply.intake.type === "sar" ? "data request" : "potential incident";
    return `Client view: nothing was started. From the client's own sign-in, this would be treated as a formal ${noun}, the statutory process would start and ${officerName} would be alerted.`;
  }
  if (reply.status === "amber") {
    if (reply.answer === EMPTY_CORPUS_COPY) return reply.answer;
    return `Client view: nothing was sent. From the client's own sign-in, this question would go to ${officerName} for a judgement call.`;
  }
  return applyReplyCopy(reply, mode, officerName);
}

export const PASSAGES_LEAD =
  "No AI answer is switched on, so these are the passages from your policies and documents that best match the question.";

/** The fixed copy stored as the guide reply body, by state and by path. */
function applyReplyCopy(reply: EnforcedReply, mode: "answer" | "passages" | null, officerName: string): string {
  if (reply.status === "red" && reply.intake) {
    const noun = reply.intake.type === "sar" ? "data request" : "potential incident";
    return `What you've described is a formal ${noun}. I've started the statutory process and alerted ${officerName}.`;
  }
  if (reply.status === "amber") {
    if (reply.answer === EMPTY_CORPUS_COPY) return reply.answer;
    return `This needs a judgement call from your compliance officer. I've flagged it to ${officerName} - meanwhile, here's what's useful to gather: dates, names, and any documents or messages involved.`;
  }
  if (mode === "passages") {
    return `${PASSAGES_LEAD}\n\n${reply.answer}\n\nIf these do not answer it, use Send to MITMARK and the question goes to ${officerName}.`;
  }
  return reply.answer;
}

function createEscalation(doc: OrgDoc, input: { threadId: string; question: string; test?: boolean }): EscalationRecord {
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
    ...(input.test ? { test: true } : {}),
  };
  doc.escalations.push(escalation);

  doc.review.push({
    id: newId(),
    orgId: doc.id,
    type: "chat_amber",
    refId: escalation.id,
    summary: `${input.test ? "TEST SEAT. " : ""}Amber policy question: "${trim(input.question, 140)}"`,
    state: "pending",
    decidedBy: null,
    decidedAt: null,
    createdAt: now,
    ...(input.test ? { test: true } : {}),
  });

  return escalation;
}

function getOrCreateThread(doc: OrgDoc, userId: string, test = false): ChatThreadRecord {
  const existing = doc.threads.find((t) => t.userId === userId);
  if (existing) return existing;
  const created: ChatThreadRecord = {
    id: newId(),
    orgId: doc.id,
    userId,
    title: "Policy questions",
    createdAt: new Date().toISOString(),
    ...(test ? { test: true } : {}),
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
    mode: m.mode ?? null,
    escalated: m.escalated,
  };
}

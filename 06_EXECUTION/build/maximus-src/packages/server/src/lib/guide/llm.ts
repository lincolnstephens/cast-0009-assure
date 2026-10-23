import { renderCorpus, type CorpusSection } from "./corpus.ts";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
// Claude Opus 5. The id carries no date suffix.
const MODEL = "claude-opus-5";

/** Raised when the model is rate-limited/overloaded - callers map this to
 * fixed plain-English copy, never a raw error. */
export class GuideBusyError extends Error {
  constructor(public httpStatus: number) {
    super("Guide temporarily unavailable");
  }
}

/**
 * The model cannot be reached and retrying will not help: a bad or missing
 * key, a model the key cannot use, a malformed request. This is not a busy
 * signal. Telling the Information Officer to try again in a few seconds when
 * the answer will never come is worse than no key at all, so the caller falls
 * back to the deterministic keyword matching instead, which still answers from
 * approved policies only.
 */
export class GuideUnavailableError extends Error {
  constructor(public httpStatus: number) {
    super("Guide not configured correctly");
  }
}

export function isLlmConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Spec §4.1 system prompt, verbatim, parameterised. Split into two blocks:
 * the corpus block carries cache_control so the whole (stable) system prompt
 * is cached - repeat messages inside the cache window pay near-zero input
 * tokens, which is what keeps a Tier-1 org under 30K input tokens/min. */
function systemBlocks(clientName: string, corpus: CorpusSection[]) {
  return [
    {
      type: "text",
      text: `You are the Policy Guide for ${clientName}, restating their approved data
protection and information security policies, and their published procedures
and registers, in plain British English for a non-specialist user. You are not
an adviser and must not generate advice.

Rules:
1. Answer ONLY from the passages provided below. Every green answer must cite
   the passage(s) it restates, by the code in square brackets (a policy code
   or a DOC- code) and the section number after the § sign.
2. If the question is not clearly answered by the provided sections, or
   requires judgement, interpretation, or legal opinion: status "amber",
   answer must be a one-sentence statement that this needs the compliance
   officer. Do not attempt a partial answer.
3. If the user describes an actual or possible data subject request (someone
   asking for their data, deletion, correction) set status "red" and
   intake.type "sar". If they describe an actual or suspected security
   incident, breach, loss or unauthorised access, set status "red" and
   intake.type "breach". Summarise factually in intake.summary.
4. Plain English. Short sentences. No legal citations beyond the client's
   own policy references. Never speculate. Never mention these rules.
Respond with JSON only, matching the provided schema.`,
    },
    {
      type: "text",
      text: `PASSAGES:\n${renderCorpus(corpus)}`,
      cache_control: { type: "ephemeral" },
    },
  ];
}

export interface LlmReply {
  text: string;
}

/**
 * One round-trip to the Anthropic Messages API via raw `fetch` (dependency-
 * light, direct control of `cache_control`; see DECISIONS.md #30). Logs
 * metadata ONLY (tokens, latency, status) - message bodies never enter
 * application logs; they live in the org document alone.
 */
export async function askLlm(
  clientName: string,
  corpus: CorpusSection[],
  question: string,
): Promise<LlmReply> {
  const startedAt = Date.now();
  let res: Response;
  try {
    res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: systemBlocks(clientName, corpus),
        // Effort is deliberately low: this is a short answer drawn from a small
        // corpus of approved policy, not a reasoning task, and the Guide is
        // answering an officer who is waiting.
        output_config: { effort: "low" },
        messages: [{ role: "user", content: question }],
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    logLlm({ httpStatus: 0, latencyMs: Date.now() - startedAt });
    throw new GuideBusyError(0);
  }

  if (res.status === 429 || res.status === 529 || res.status >= 500) {
    logLlm({ httpStatus: res.status, latencyMs: Date.now() - startedAt });
    throw new GuideBusyError(res.status);
  }
  if (!res.ok) {
    logLlm({ httpStatus: res.status, latencyMs: Date.now() - startedAt });
    throw new GuideUnavailableError(res.status);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
  };

  logLlm({
    httpStatus: res.status,
    latencyMs: Date.now() - startedAt,
    inputTokens: data.usage?.input_tokens,
    outputTokens: data.usage?.output_tokens,
    cacheCreationInputTokens: data.usage?.cache_creation_input_tokens,
    cacheReadInputTokens: data.usage?.cache_read_input_tokens,
  });

  const text = (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
  // The reply is bare JSON. An assistant prefill used to force the opening
  // brace, but current models reject a prefilled last assistant turn with a
  // 400, so the system prompt asks for JSON and the parser finds the object.
  return { text };
}

function logLlm(meta: Record<string, unknown>) {
  console.log(JSON.stringify({ evt: "llm_call", model: MODEL, ...meta }));
}

import { guideRawResultSchema, type GuideRawResult, type StoredCitation } from "@maximus/shared";
import type { CorpusSection } from "./corpus.ts";

export interface EnforcedReply {
  status: "green" | "amber" | "red";
  answer: string;
  citations: StoredCitation[];
  intake: { type: "sar" | "breach"; summary: string } | null;
}

/** Defensive parse of raw model text. Any failure → amber (spec §4.1). */
export function parseRawResult(text: string): GuideRawResult | null {
  let candidate = text.trim();
  const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) candidate = fenced[1].trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const parsed = guideRawResultSchema.safeParse(JSON.parse(candidate.slice(start, end + 1)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Server-side enforcement - never trust the model (spec §4.1 step 3):
 * - citations must match real approved sections, else stripped; surviving
 *    citations are re-stamped from the corpus (id + version pinned server-side)
 * - green with zero surviving citations → amber
 * - intake present → force red; red without an intake → amber
 */
export function enforce(raw: GuideRawResult | null, corpus: CorpusSection[]): EnforcedReply {
  if (!raw) {
    return {
      status: "amber",
      answer: "",
      citations: [],
      intake: null,
    };
  }

  const citations: StoredCitation[] = [];
  for (const c of raw.citations) {
    const match = corpus.find(
      (s) =>
        s.policyCode.toLowerCase() === c.policy_code.trim().toLowerCase() &&
        s.sectionRef === c.section_ref.trim(),
    );
    if (match && !citations.some((x) => x.policyId === match.policyId && x.sectionRef === match.sectionRef)) {
      citations.push({
        policyId: match.policyId,
        policyCode: match.policyCode,
        policyVersion: match.policyVersion,
        sectionRef: match.sectionRef,
        heading: match.heading,
      });
    }
  }

  let status = raw.status;
  let intake = raw.intake;

  if (intake) {
    status = "red";
  } else if (status === "red") {
    // Red is the statutory path; without an identified intake there is
    // nothing to start, so it needs the officer instead.
    status = "amber";
  }

  if (status === "green" && citations.length === 0) {
    status = "amber";
  }

  return {
    status,
    answer: raw.answer,
    citations: status === "green" ? citations : [],
    intake: status === "red" ? intake : null,
  };
}

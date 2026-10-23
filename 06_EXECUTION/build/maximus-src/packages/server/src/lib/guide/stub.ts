import type { GuideRawResult } from "@maximus/shared";
import type { CorpusSection } from "./corpus.ts";
import { retrieve, type Passage } from "./retrieve.ts";

/**
 * The deterministic path, used when ANTHROPIC_API_KEY is absent. Pure
 * function of (question, corpus): the three seeded demo questions produce
 * green / amber / red respectively, every time.
 */
export function askStub(corpus: CorpusSection[], question: string): GuideRawResult {
  const q = question.toLowerCase();

  // Red, SAR: someone asking for / about their own data.
  const sarPatterns = [
    /former (employee|tenant|member of staff)/,
    /everything (you|we) (hold|have)/,
    /all (the )?(data|information|records) (you|we) (hold|have)/,
    /(see|copy of|send me) (my|their|his|her) (data|file|records|information)/,
    /(delete|erase|remove) (my|their) (data|details|records)/,
    /subject access request/,
    /\bsar\b/,
    /asking for (their|his|her|my) data/,
  ];
  if (sarPatterns.some((p) => p.test(q))) {
    return {
      status: "red",
      answer: "",
      citations: [],
      intake: { type: "sar", summary: `Possible subject access request: "${trim200(question)}"` },
    };
  }

  // Red, breach: an actual or suspected incident.
  const breachPatterns = [
    /\bbreach\b/,
    /\b(lost|stolen|missing)\b.*\b(laptop|phone|device|file|usb|paperwork|post)\b/,
    /\b(laptop|phone|device|file|usb|paperwork|post)\b.*\b(lost|stolen|missing)\b/,
    /hack(ed|er)?/,
    /ransom/,
    /phish/,
    /unauthorised access/,
    /wrong (person|email|address|recipient)/,
    /misdirected/,
    /leak(ed)?\b/,
  ];
  if (breachPatterns.some((p) => p.test(q))) {
    return {
      status: "red",
      answer: "",
      citations: [],
      intake: {
        type: "breach",
        summary: `Possible security incident: "${trim200(question)}"`,
      },
    };
  }

  // Otherwise: the passages that match (lib/guide/retrieve.ts). v1.7: with no
  // model key the Guide does not compose an answer; it shows the matching
  // passages with where each comes from. A strong match reads as answered
  // from the sources (green); nothing strong enough goes to MITMARK (amber).
  const passages = retrieve(corpus, question, PASSAGE_LIMIT, PASSAGE_MIN_SCORE);
  if (passages.length > 0) {
    return {
      status: "green",
      answer: passages.map(passageLine).join("\n\n"),
      citations: passages.map((p) => ({
        policy_code: p.section.policyCode,
        section_ref: p.section.sectionRef,
        heading: p.section.heading,
      })),
      intake: null,
    };
  }

  return {
    status: "amber",
    answer: "This is not clearly answered by your approved policies and published documents and needs your compliance officer.",
    citations: [],
    intake: null,
  };
}

/** At most three passages, and only those that match well. */
export const PASSAGE_LIMIT = 3;
export const PASSAGE_MIN_SCORE = 4;

/** One passage as the Information Officer reads it: the words, then where they come from. */
export function passageLine(p: Passage): string {
  const where =
    p.section.sourceKind === "document"
      ? `${p.section.policyTitle}, section ${p.section.sectionRef}: ${p.section.heading}`
      : `Your ${p.section.policyTitle}, section ${p.section.sectionRef}: ${p.section.heading}`;
  return `"${p.excerpt}" (${where})`;
}

function trim200(text: string): string {
  return text.length > 200 ? `${text.slice(0, 197)}...` : text;
}

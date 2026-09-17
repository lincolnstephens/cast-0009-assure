import type { GuideRawResult } from "@maximus/shared";
import type { CorpusSection } from "./corpus.ts";

/**
 * Deterministic keyword-matching stub used when ANTHROPIC_API_KEY is absent.
 * Pure function of (question, corpus): the three seeded demo questions
 * produce green / amber / red respectively, every time.
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

  // Otherwise: keyword overlap against the corpus. A strong single-section
  // match reads as "clearly answered" (green); anything weaker is amber.
  const tokens = tokenise(q);
  let best: { section: CorpusSection; score: number } | null = null;
  for (const section of corpus) {
    const haystack = `${section.heading} ${section.body}`.toLowerCase();
    let score = 0;
    for (const token of tokens) {
      if (haystack.includes(token)) score += 1;
    }
    if (!best || score > best.score) best = { section, score };
  }

  if (best && best.score >= 4) {
    const { section } = best;
    return {
      status: "green",
      answer: `${firstSentences(section.body, 2)} (Your ${section.policyTitle}, section ${section.sectionRef}.)`,
      citations: [
        {
          policy_code: section.policyCode,
          section_ref: section.sectionRef,
          heading: section.heading,
        },
      ],
      intake: null,
    };
  }

  return {
    status: "amber",
    answer: "This is not clearly answered by your approved policies and needs your compliance officer.",
    citations: [],
    intake: null,
  };
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "with", "our", "your", "their", "his",
  "her", "can", "could", "should", "would", "may", "might", "is", "are", "was",
  "were", "be", "been", "do", "does", "did", "have", "has", "had", "what",
  "when", "where", "who", "how", "why", "that", "this", "these", "those", "it",
  "its", "in", "on", "at", "to", "of", "for", "from", "by", "about", "into",
  "want", "wants", "wanted", "put", "own", "allowed", "okay", "fine", "please",
]);

function tokenise(q: string): string[] {
  const words = q
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((w) => (w.endsWith("s") && w.length > 4 ? w.slice(0, -1) : w))
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
  return [...new Set(words)];
}

function firstSentences(text: string, count: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return sentences.slice(0, count).join(" ").trim();
}

function trim200(text: string): string {
  return text.length > 200 ? `${text.slice(0, 197)}...` : text;
}

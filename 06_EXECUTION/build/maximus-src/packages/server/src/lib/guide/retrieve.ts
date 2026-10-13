/**
 * v1.7 (FRAGO 07 3.5). Deterministic retrieval for Quick questions.
 *
 * Section-level keyword and phrase match over the whole corpus (approved
 * policies plus published procedures and trackers). The same question over
 * the same corpus always returns the same passages in the same order. Both
 * answer paths start here: without a model key the passages are shown as
 * they are; with one, the model composes its answer from these passages only.
 */

import type { CorpusSection } from "./corpus.ts";

export interface Passage {
  section: CorpusSection;
  score: number;
  /** The sentences of the section that best match the question, at most about 420 characters. */
  excerpt: string;
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "with", "our", "your", "their", "his",
  "her", "can", "could", "should", "would", "may", "might", "is", "are", "was",
  "were", "be", "been", "do", "does", "did", "have", "has", "had", "what",
  "when", "where", "who", "how", "why", "that", "this", "these", "those", "it",
  "its", "in", "on", "at", "to", "of", "for", "from", "by", "about", "into",
  "want", "wants", "wanted", "put", "own", "allowed", "okay", "fine", "please",
  "there", "they", "them", "then", "than", "will", "shall", "must", "need",
  "needs", "which", "also", "any", "all", "some", "such", "each", "more",
  "most", "other", "only", "same", "very", "just", "here", "know", "tell",
]);

/** Lower-case words of four or more letters, plural "s" folded, stopwords out, in question order. */
export function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((w) => (w.endsWith("s") && w.length > 4 ? w.slice(0, -1) : w))
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

function sentences(text: string): string[] {
  return (text.replace(/\n+/g, ". ").match(/[^.!?]+[.!?]*/g) ?? [text]).map((s) => s.trim()).filter(Boolean);
}

function excerptOf(body: string, tokens: string[]): string {
  const ranked = sentences(body)
    .map((s, i) => ({ s, i, hits: tokens.filter((t) => s.toLowerCase().includes(t)).length }))
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits || a.i - b.i)
    .slice(0, 2)
    .sort((a, b) => a.i - b.i);
  const text = (ranked.length ? ranked.map((x) => x.s) : sentences(body).slice(0, 1)).join(" ");
  return text.length > 420 ? `${text.slice(0, 417).trimEnd()}...` : text;
}

/**
 * Score every section and return the best, highest first.
 *
 * A question word found in the heading scores 2, in the body 1; each pair of
 * adjacent question words found together as a phrase scores 2 more. Ties
 * break on corpus order, which is stable.
 */
export function retrieve(corpus: CorpusSection[], question: string, limit = 3, minScore = 3): Passage[] {
  const words = tokenise(question);
  const tokens = [...new Set(words)];
  if (tokens.length === 0) return [];
  const phrases: string[] = [];
  for (let i = 0; i + 1 < words.length; i += 1) phrases.push(`${words[i]} ${words[i + 1]}`);

  const scored = corpus.map((section, order) => {
    const heading = section.heading.toLowerCase();
    const body = section.body.toLowerCase();
    const flat = `${heading} ${body}`.replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ");
    let score = 0;
    for (const t of tokens) {
      if (heading.includes(t)) score += 2;
      else if (body.includes(t)) score += 1;
    }
    for (const p of phrases) if (flat.includes(p)) score += 2;
    return { section, score, order };
  });

  return scored
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map(({ section, score }) => ({ section, score, excerpt: excerptOf(section.body, tokens) }));
}

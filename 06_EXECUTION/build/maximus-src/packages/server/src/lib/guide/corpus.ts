import type { OrgDoc } from "../../db/model.ts";
import { latestApprovedPolicies, parsePolicyDocument } from "../policies.ts";

/** One approved policy section, flattened for prompting and validation. */
export interface CorpusSection {
  policyId: string;
  policyCode: string;
  policyTitle: string;
  policyVersion: number;
  sectionRef: string;
  heading: string;
  body: string;
}

/**
 * The Policy Guide's entire knowledge: every section of the latest approved
 * version of each policy. Order is stable (code, then ref) so prompts are
 * byte-identical between requests - a requirement for prompt caching.
 */
export function buildCorpus(doc: OrgDoc): CorpusSection[] {
  const approved = latestApprovedPolicies(doc);

  return approved
    .flatMap((policy) => {
      const { sections } = parsePolicyDocument(policy.id, policy.bodyMarkdown);
      return sections.map((s) => ({
        policyId: policy.id,
        policyCode: policy.code,
        policyTitle: policy.title,
        policyVersion: policy.version,
        sectionRef: s.sectionRef,
        heading: s.heading,
        body: s.bodyMarkdown,
      }));
    })
    .sort(
      (a, b) =>
        a.policyCode.localeCompare(b.policyCode) ||
        a.sectionRef.localeCompare(b.sectionRef, undefined, { numeric: true }),
    );
}

export function renderCorpus(corpus: CorpusSection[]): string {
  return corpus
    .map(
      (s) =>
        `[${s.policyCode} §${s.sectionRef}] ${s.policyTitle} - ${s.heading}\n${s.body}`,
    )
    .join("\n\n");
}

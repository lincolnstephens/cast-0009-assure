import type { OrgDoc } from "../../db/model.ts";
import type { ExtractedCorpus } from "../extract.ts";
import type { DocumentRecord } from "../../db/model.ts";
import { latestApprovedPolicies, parsePolicyDocument } from "../policies.ts";

/**
 * One citable passage, flattened for retrieval, prompting and validation.
 *
 * v1.7 (FRAGO 07 3.5): a passage is a section of an approved policy, as
 * before, or a section of a published procedure or tracker's extracted text.
 * The field names stay those of the policy-only Guide so a stored citation
 * reads the same either way: for a document, `policyId` is the document id,
 * `policyCode` is its short code (DOC-1A2B3C4D) and `policyVersion` is 0.
 */
export interface CorpusSection {
  sourceKind: "policy" | "document";
  policyId: string;
  policyCode: string;
  policyTitle: string;
  policyVersion: number;
  sectionRef: string;
  heading: string;
  body: string;
}

/** A document's short, stable citation code. */
export const documentCode = (documentId: string) => `DOC-${documentId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}`;

/**
 * Every section of the latest approved version of each policy. Order is
 * stable (code, then ref) so prompts are byte-identical between requests.
 */
export function buildCorpus(doc: OrgDoc): CorpusSection[] {
  const approved = latestApprovedPolicies(doc);

  return approved
    .flatMap((policy) => {
      const { sections } = parsePolicyDocument(policy.id, policy.bodyMarkdown);
      return sections.map((s) => ({
        sourceKind: "policy" as const,
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

/** The published documents' sections, in a stable order, after the policies. */
export function documentSections(corpora: { record: DocumentRecord; corpus: ExtractedCorpus }[]): CorpusSection[] {
  return corpora
    .slice()
    .sort((a, b) => a.record.title.localeCompare(b.record.title) || a.record.id.localeCompare(b.record.id))
    .flatMap(({ record, corpus }) =>
      corpus.sections.map((s) => ({
        sourceKind: "document" as const,
        policyId: record.id,
        policyCode: documentCode(record.id),
        policyTitle: record.title,
        policyVersion: 0,
        sectionRef: s.ref,
        heading: s.heading,
        body: s.text,
      })),
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

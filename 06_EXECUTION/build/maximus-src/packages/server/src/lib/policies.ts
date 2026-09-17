/**
 * Policy pack helpers, ported from Drizzle+Postgres to the store.
 *
 * The old schema kept a policy's numbered sections as separate `policySections`
 * rows. The new `PolicyRecord` (db/model.ts) has a single `bodyMarkdown` field
 * - there is no persisted section entity any more. This lane keeps the numbered
 * sections the client panel, the admin editor and the Policy Guide all rely on
 * by writing them as `## <ref> <heading>` markdown headings inside that one
 * field, and parsing them back out on read. Content before the first heading
 * is the policy's preamble.
 *
 * Everything here is a pure function over an already-loaded `OrgDoc` - no
 * store access - so callers do all of one request's reads and writes inside a
 * single `mutateOrg`.
 */

import type { OrgDoc, PolicyRecord } from "../db/model.ts";
import { listOrgIds, newId, readOrg } from "../db/store.ts";

export interface PolicySection {
  /** Synthetic - derived from the policy id and the section ref, not stored. */
  id: string;
  sectionRef: string;
  heading: string;
  bodyMarkdown: string;
}

const SECTION_HEADING = /^##\s+(\d{1,2}(?:\.\d{1,2})?)\s+(.+?)\s*$/;

/** Split a policy's full markdown into its preamble and its numbered sections. */
export function parsePolicyDocument(
  policyId: string,
  fullMarkdown: string,
): { preamble: string; sections: PolicySection[] } {
  const lines = (fullMarkdown ?? "").split(/\r?\n/);
  const sections: PolicySection[] = [];
  const preambleLines: string[] = [];
  let current: { ref: string; heading: string; lines: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    sections.push({
      id: `${policyId}#${current.ref}`,
      sectionRef: current.ref,
      heading: current.heading,
      bodyMarkdown: current.lines.join("\n").trim(),
    });
  };

  for (const line of lines) {
    const match = line.match(SECTION_HEADING);
    if (match) {
      flush();
      current = { ref: match[1], heading: match[2], lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      preambleLines.push(line);
    }
  }
  flush();

  return { preamble: preambleLines.join("\n").trim(), sections };
}

/** Render a preamble plus numbered sections back into one markdown document. */
export function renderPolicyDocument(
  preamble: string,
  sections: { sectionRef: string; heading: string; bodyMarkdown: string }[],
): string {
  const parts: string[] = [];
  if (preamble.trim()) parts.push(preamble.trim());
  for (const s of sections) {
    parts.push(`## ${s.sectionRef} ${s.heading}\n\n${s.bodyMarkdown.trim()}`);
  }
  return parts.join("\n\n");
}

/**
 * Latest approved version of each policy code - the ONLY corpus the client
 * side panel and the Policy Guide read. Drafts and superseded versions are
 * invisible to clients.
 */
export function latestApprovedPolicies(doc: OrgDoc): PolicyRecord[] {
  const latest = new Map<string, PolicyRecord>();
  for (const policy of doc.policies) {
    if (policy.status !== "approved") continue;
    const existing = latest.get(policy.code);
    if (!existing || policy.version > existing.version) latest.set(policy.code, policy);
  }
  return [...latest.values()].sort((a, b) => a.code.localeCompare(b.code));
}

/** All versions of a policy code, newest version first. */
function versionsOf(doc: OrgDoc, code: string): PolicyRecord[] {
  return doc.policies.filter((p) => p.code === code).sort((a, b) => b.version - a.version);
}

export function maxVersionOf(doc: OrgDoc, code: string): number {
  const versions = versionsOf(doc, code);
  return versions.length ? versions[0].version : 0;
}

/**
 * Editing an approved policy never mutates it: this snapshots the approved
 * policy into a new draft version, which stays invisible to clients until
 * approved in its turn.
 */
export function createDraftFrom(doc: OrgDoc, source: PolicyRecord): PolicyRecord {
  const draft: PolicyRecord = {
    id: newId(),
    orgId: doc.id,
    code: source.code,
    title: source.title,
    version: maxVersionOf(doc, source.code) + 1,
    status: "draft",
    bodyMarkdown: source.bodyMarkdown,
    approvedBy: null,
    approvedAt: null,
    createdAt: new Date().toISOString(),
  };
  doc.policies.push(draft);
  return draft;
}

/**
 * Find a policy by id without knowing its organisation up front. Policies
 * live inside a per-org document (no global table any more), so this scans
 * the (small, beta-scale) set of organisations. Used to tell "not found"
 * (404) apart from "belongs to a different tenant" (403).
 */
export async function findPolicyAnywhere(
  id: string,
): Promise<{ orgId: string; policy: PolicyRecord } | null> {
  for (const orgId of await listOrgIds()) {
    const doc = await readOrg(orgId);
    const policy = doc?.policies.find((p) => p.id === id);
    if (policy) return { orgId, policy };
  }
  return null;
}

/**
 * Posture: five compliance domains, each with a current RAG status, the
 * officer's note, and a weekly snapshot history the client portal draws as a
 * 12-week trend.
 *
 * The trend is genuinely supportable from this store: `PostureHistoryRecord`
 * is keyed by (domain, weekOf), one row per ISO week - see db/model.ts. Every
 * officer update upserts that week's row, so repeated edits within the same
 * week collapse to the week's final reading rather than inventing extra
 * points, and a domain that has never been updated still shows one honest
 * point derived from its current, dated reading (never a fabricated series).
 */
import { DateTime } from "luxon";
import type { OrgDoc, PostureDomainRecord, PostureHistoryRecord, RagStatus } from "../db/model.ts";
import { listOrgIds, newId, readOrg } from "../db/store.ts";

const LONDON = "Europe/London";
const HISTORY_WEEKS = 12;

/** Monday of the Europe/London ISO week containing `when`, as YYYY-MM-DD. */
export function mondayOf(when: Date): string {
  const dt = DateTime.fromJSDate(when, { zone: LONDON });
  return dt.minus({ days: dt.weekday - 1 }).toFormat("yyyy-LL-dd");
}

export interface HistoryPoint {
  rag: RagStatus;
  weekOf: string;
}

/**
 * Officer-only: set a domain's current reading and upsert this week's
 * snapshot. Returns the (possibly updated) history row for this week.
 */
export function recordPostureChange(
  doc: OrgDoc,
  input: { domain: PostureDomainRecord; rag: RagStatus; note: string; setByName: string; when?: Date },
): PostureHistoryRecord {
  const when = input.when ?? new Date();
  input.domain.rag = input.rag;
  input.domain.note = input.note;
  input.domain.setBy = input.setByName;
  input.domain.setAt = when.toISOString();

  const weekOf = mondayOf(when);
  const existing = doc.postureHistory.find(
    (h) => h.domain === input.domain.domain && h.weekOf === weekOf,
  );
  if (existing) {
    existing.rag = input.rag;
    return existing;
  }
  const created: PostureHistoryRecord = {
    id: newId(),
    orgId: doc.id,
    domain: input.domain.domain,
    weekOf,
    rag: input.rag,
  };
  doc.postureHistory.push(created);
  return created;
}

/** Last 12 weeks of snapshots for the sparkline, oldest first. */
export function historyForDomain(doc: OrgDoc, domain: PostureDomainRecord): HistoryPoint[] {
  const rows = doc.postureHistory
    .filter((h) => h.domain === domain.domain)
    .sort((a, b) => (a.weekOf < b.weekOf ? -1 : a.weekOf > b.weekOf ? 1 : 0))
    .slice(-HISTORY_WEEKS)
    .map((h) => ({ rag: h.rag, weekOf: h.weekOf }));
  if (rows.length > 0) return rows;
  // No weekly snapshot recorded yet - the domain's current reading is itself
  // real and dated, so show that single point rather than an empty series.
  return [{ rag: domain.rag, weekOf: mondayOf(new Date(domain.setAt)) }];
}

/** Domains for one organisation, alphabetical by key. */
export function domainsForOrg(doc: OrgDoc): PostureDomainRecord[] {
  return doc.posture.slice().sort((a, b) => (a.domain < b.domain ? -1 : a.domain > b.domain ? 1 : 0));
}

export interface FoundPostureDomain {
  doc: OrgDoc;
  domain: PostureDomainRecord;
}

/**
 * Find a posture domain by id without an accountId (the web app's PUT
 * /admin/posture/:id call carries none). The org count in this beta is small
 * enough that a scan is the honest option - see findClockGlobally in
 * lib/intakes.ts for the same trade-off.
 */
export async function findPostureDomainGlobally(id: string): Promise<FoundPostureDomain | null> {
  for (const orgId of await listOrgIds()) {
    const doc = await readOrg(orgId);
    if (!doc) continue;
    const domain = doc.posture.find((d) => d.id === id);
    if (domain) return { doc, domain };
  }
  return null;
}

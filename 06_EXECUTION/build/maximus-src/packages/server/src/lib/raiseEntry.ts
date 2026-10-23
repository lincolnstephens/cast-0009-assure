/**
 * The shared "raise a Record entry" helper.
 *
 * Three actions this lane owns each create one Record entry automatically,
 * on the organisation document, the moment the underlying work completes:
 * approving a policy version, an answered Guide question leaving the review
 * queue, and a completed defence-file export (see PORTING_BRIEF.md, "The
 * value layer being added"). Every entry this helper creates is real,
 * reviewed work - never illustrative - with a named reviewer, so `ill` is
 * always false and `reviewed` is always true.
 *
 * Call this from inside the same `mutateOrg` block as the state change it
 * records, so the entry and the change it describes are written together.
 */

import { DateTime } from "luxon";
import type { DeadlineLabel, EntryRecord, EntrySource, OrgDoc } from "../db/model.ts";
import { newId } from "../db/store.ts";

export interface RaiseEntryInput {
  /** YYYY-MM-DD in Europe/London. Defaults to today. */
  date?: string;
  /** v1.7. The module the work belongs to, 1 to 8. */
  area: number;
  what: string;
  outcome: string;
  hours: number;
  deadline: DeadlineLabel;
  /** The named MITMARK reviewer - the admin who closed the underlying action. */
  reviewer: string;
  source: EntrySource;
  sourceRef: string | null;
}

/** Today's date in Europe/London, YYYY-MM-DD. */
export function todayLondon(): string {
  return DateTime.now().setZone("Europe/London").toFormat("yyyy-MM-dd");
}

/**
 * Push a new Record entry onto the organisation document and return it.
 * Pure in-memory work - the caller's `mutateOrg` performs the write.
 */
export function raiseEntry(doc: OrgDoc, input: RaiseEntryInput): EntryRecord {
  const entry: EntryRecord = {
    id: newId(),
    orgId: doc.id,
    date: input.date ?? todayLondon(),
    area: input.area,
    what: input.what,
    outcome: input.outcome,
    hours: input.hours,
    deadline: input.deadline,
    reviewer: input.reviewer,
    ill: false,
    reviewed: true,
    source: input.source,
    sourceRef: input.sourceRef,
    createdAt: new Date().toISOString(),
  };
  doc.entries.push(entry);
  return entry;
}

/** Module 4, policy review: an approved policy version issued and recorded. */
export function raisePolicyEntry(
  doc: OrgDoc,
  input: { policyId: string; title: string; version: number; reviewer: string },
): EntryRecord {
  return raiseEntry(doc, {
    area: 4,
    what: `Reviewed and issued ${input.title}, version ${input.version}`,
    outcome: "Approved version issued and recorded",
    hours: 10,
    deadline: "",
    reviewer: input.reviewer,
    source: "policy",
    sourceRef: input.policyId,
  });
}

/** Module 1, the DPO's advisory role: an answered Guide question leaving the review queue. */
export function raiseGuideEntry(
  doc: OrgDoc,
  input: { refId: string; reviewer: string; decisionNote?: string | null },
): EntryRecord {
  return raiseEntry(doc, {
    area: 1,
    what: "Answered a question from the Information Officer on the approved policies",
    outcome: input.decisionNote?.trim() ? input.decisionNote.trim() : "Answer released to the client portal",
    hours: 1,
    deadline: "",
    reviewer: input.reviewer,
    source: "guide",
    sourceRef: input.refId,
  });
}

/** Module 4, policy review: a completed defence-file export of the approved policy pack. */
export function raiseExportEntry(
  doc: OrgDoc,
  input: { exportId: string; reviewer: string },
): EntryRecord {
  return raiseEntry(doc, {
    area: 4,
    what: "Produced the defence file: approved policy pack with summary",
    outcome: "Defence file generated and released",
    hours: 12,
    deadline: "Board or audit date",
    reviewer: input.reviewer,
    source: "export",
    sourceRef: input.exportId,
  });
}

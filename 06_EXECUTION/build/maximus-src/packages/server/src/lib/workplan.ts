/**
 * Workplan helpers shared between the client tracker routes
 * (`routes/tracker.ts`) and the admin workplan routes
 * (`routes/adminWorkplan.ts`): the hours a closed task books to the Record,
 * the identity rule that makes a library re-apply additive only, and the
 * match between an area and its approved policy.
 *
 * Pure functions over an already-loaded `OrgDoc` - no store access - so
 * callers do all of one request's reads and writes inside a single
 * `mutateOrg`, as `lib/raiseEntry.ts` and `lib/policies.ts` already do.
 */

import { LIBRARY_TASKS, expandLibrary, type AreaId } from "@maximus/shared";
import type { OrgDoc, PolicyRecord, TaskRecord } from "../db/model.ts";
import { newId } from "../db/store.ts";
import { latestApprovedPolicies } from "./policies.ts";

// ---------------------------------------------------------------------------
// Record hours on close
// ---------------------------------------------------------------------------

/**
 * Record hours booked when a task closes as done and its source does not
 * name a library task carrying its own `defaultHours` - that is, a task the
 * operator created by hand (source "manual") rather than one applied from
 * the library. Client-owned tasks always book 0 hours regardless of area
 * (see `hoursForTask`), so this table only ever prices MITMARK-owned work.
 *
 * Each figure is the rounded mean of the MITMARK-owned default hours given
 * to that area's tasks in the section 8 library draft
 * (FRAGO_01_TRACKER.md), the client-owned 0h tasks excluded:
 *   1 DPO registration and ICO:            1h, 1h            -> 1
 *   2 Data mapping and processing records:  8h, 2h            -> 4 (rounded down from 5)
 *   3 Data retention:                      10h, 2h            -> 6
 *   4 Cross-border data transfers:          6h, 4h            -> 5
 *   5 Data protection impact assessments:   2h, 16h           -> 8 (rounded down from 9)
 *   6 Data subject requests:                6h, 2h            -> 4
 *   7 Vendor data risk:                     5h, 8h            -> 6 (rounded down from 6.5)
 *   8 Data breach and incident management:  8h, 6h, 6h        -> 6 (rounded down from 6.67)
 */
export const AREA_DEFAULT_HOURS: Record<AreaId, number> = {
  1: 1,
  2: 4,
  3: 6,
  4: 5,
  5: 8,
  6: 4,
  7: 6,
  8: 6,
};

/**
 * The service line a task's Record entry books against on close, by area.
 * Where an area maps cleanly onto one of the twelve vDPO service lines (see
 * packages/shared/src/lines.ts) that line is used - areas 2, 5, 6, 7 and 8
 * have an exact match. Areas 1, 3 and 4 have no dedicated line: area 3
 * (retention) books against "Policy and procedure suite" since the
 * retention schedule is one of the six documents on that cycle; areas 1 and
 * 4 book against "Ad hoc assurance and advisory" rather than inventing a
 * line that does not exist in the reference data.
 */
export const AREA_LINE: Record<AreaId, number> = {
  1: 12,
  2: 2,
  3: 3,
  4: 12,
  5: 1,
  6: 4,
  7: 6,
  8: 5,
};

/**
 * The Record hours a task books when it closes as done.
 *
 * Client-owned tasks always book 0 hours, whatever their source: the
 * client's one action is confirming, not doing MITMARK's billable work. For
 * a MITMARK-owned task applied from the library, the hours are the library
 * task's own `defaultHours`, passed in via `libraryHoursBySource` (keyed by
 * library task id, i.e. `TaskRecord.source`). For a MITMARK-owned task the
 * operator created by hand, or whose library source is no longer in the
 * pack, the area's default in `AREA_DEFAULT_HOURS` stands in.
 */
export function hoursForTask(
  task: Pick<TaskRecord, "ownerType" | "area" | "source">,
  libraryHoursBySource: ReadonlyMap<string, number>,
): number {
  if (task.ownerType === "client") return 0;
  const fromLibrary = libraryHoursBySource.get(task.source);
  if (fromLibrary !== undefined) return fromLibrary;
  return AREA_DEFAULT_HOURS[task.area as AreaId] ?? 0;
}

// ---------------------------------------------------------------------------
// Re-apply identity
// ---------------------------------------------------------------------------

/**
 * Identity of one library instance for the re-apply rule: applying the
 * library a second time adds only the instances not already present, and
 * never touches an existing (possibly edited) task. Two tasks are the same
 * instance when they share `source` (the library task id) and `dueAt`, with
 * null treated as a value in its own right - the identity of an always-on
 * duty's single instance, which has no date.
 */
export function taskIdentityKey(source: string, dueAt: string | null): string {
  return `${source}|${dueAt === null ? "always-on" : dueAt}`;
}

// ---------------------------------------------------------------------------
// Area to policy match
// ---------------------------------------------------------------------------

/**
 * Match an area to the approved policy that covers it: by policy code
 * prefix first - the six-policy pack's codes are already area-shaped
 * (DSR-01, RET-01, BREACH-01, INTL-01, DP-01) so this is the reliable
 * signal - and by a keyword in the title as a fallback, for a pack that
 * names things differently. Areas 2 (data mapping), 5 (DPIA) and 7 (vendor
 * risk) have no policy of their own among the six seeded today, so a match
 * for them returns null rather than attaching the wrong document; the area
 * page shows no policy card in that case, which is the honest answer.
 */
const AREA_POLICY_MATCH: Record<AreaId, { codePrefixes: string[]; titleKeywords: string[] }> = {
  1: { codePrefixes: ["DP-"], titleKeywords: ["data protection policy"] },
  2: { codePrefixes: ["ROPA-"], titleKeywords: ["processing activities", "record of processing"] },
  3: { codePrefixes: ["RET-"], titleKeywords: ["retention"] },
  4: { codePrefixes: ["INTL-"], titleKeywords: ["transfer"] },
  5: { codePrefixes: ["DPIA-"], titleKeywords: ["impact assessment"] },
  6: { codePrefixes: ["DSR-"], titleKeywords: ["subject rights", "subject access"] },
  7: { codePrefixes: ["VEN-", "DPA-"], titleKeywords: ["vendor", "supplier"] },
  8: { codePrefixes: ["BREACH-"], titleKeywords: ["breach", "incident"] },
};

export function policyForArea(doc: OrgDoc, area: number): PolicyRecord | null {
  const rule = AREA_POLICY_MATCH[area as AreaId];
  if (!rule) return null;
  const approved = latestApprovedPolicies(doc);
  const byCode = approved.find((p) =>
    rule.codePrefixes.some((prefix) => p.code.toUpperCase().startsWith(prefix.toUpperCase())),
  );
  if (byCode) return byCode;
  const byTitle = approved.find((p) =>
    rule.titleKeywords.some((kw) => p.title.toLowerCase().includes(kw)),
  );
  return byTitle ?? null;
}

/**
 * Apply the task library to an organisation document.
 *
 * This is deliberately additive. An instance already present is left exactly as
 * it is, edits and all: an operator who has moved a due date or closed a task
 * must never have that undone by someone re-applying the library. Identity is
 * the library task id plus the due date, so each dated instance of a recurring
 * duty is its own row and an always-on duty has exactly one.
 *
 * It takes a document rather than an organisation id so the caller owns the
 * single read-modify-write, which is how every other mutation in the server works.
 */
export function applyLibraryToDoc(
  doc: OrgDoc,
  startDate: string,
  actorName: string,
  now: Date = new Date(),
): { created: number; skipped: number; total: number } {
  const instances = expandLibrary(LIBRARY_TASKS, startDate);
  const byId = new Map(LIBRARY_TASKS.map((t) => [t.id, t]));
  const existing = new Set(doc.tasks.map((t) => taskIdentityKey(t.source, t.dueAt)));
  const stamp = now.toISOString();
  let created = 0;
  let skipped = 0;

  for (const instance of instances) {
    const lib = byId.get(instance.libraryId);
    if (!lib) {
      skipped += 1;
      continue;
    }
    const key = taskIdentityKey(lib.id, instance.dueAt);
    if (existing.has(key)) {
      skipped += 1;
      continue;
    }
    doc.tasks.push({
      id: newId(),
      orgId: doc.id,
      area: lib.area,
      phase: lib.phase,
      title: lib.title,
      how: lib.how,
      howLink: null,
      ownerType: lib.ownerType,
      ownerRole: lib.ownerRole,
      dueAt: instance.dueAt,
      recurrence: lib.recurrence,
      status: "not_started",
      progress: 0,
      evidence: [],
      notes: "",
      source: lib.id,
      recordEntryId: null,
      closedAt: null,
      clientConfirmedAt: null,
      clientConfirmedBy: null,
      createdBy: actorName,
      updatedBy: actorName,
      updatedAt: stamp,
    });
    existing.add(key);
    created += 1;
  }

  return { created, skipped, total: instances.length };
}

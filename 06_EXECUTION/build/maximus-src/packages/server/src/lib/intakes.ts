/**
 * Intake and statutory-clock lifecycle, plus the clock-to-Record-entry bridge.
 *
 * All of this operates on an already-loaded `OrgDoc` and mutates it in place;
 * callers wrap the call in a single `mutateOrg` so the whole of one request's
 * reads and writes land in one document write. Cross-tenant lookups by a bare
 * record id (a clock has no accountId in the URL on several routes the web
 * app already calls) use `findClockGlobally`, which scans the small number of
 * organisation documents this beta carries.
 */
import { defaultHoursFor } from "@maximus/shared";
import { listOrgIds, newId, readOrg } from "../db/store.ts";
import type {
  ClockEventRecord,
  ClockKind,
  ClockRecord,
  DeadlineLabel,
  EntryRecord,
  IntakeRecord,
  IntakeSource,
  IntakeType,
  OrgDoc,
  ReviewItemRecord,
} from "../db/model.ts";
import { dueAtFor } from "./deadlines.ts";

export interface CreateIntakeInput {
  type: IntakeType;
  source: IntakeSource;
  /** What was asked, in the raiser's own words. Never contains personal data. */
  summary: string;
  /** The id of the person raising it — the client user, or the admin on a manual intake. */
  raisedBy: string;
}

export interface CreateIntakeResult {
  intake: IntakeRecord;
  clock: ClockRecord;
  reviewItem: ReviewItemRecord;
}

/**
 * The single path that turns an intake into a statutory clock + review item,
 * used by "raise a request" and admin manual intake — the only two places the
 * Information Officer's client portal or MITMARK's admin ever creates one.
 * Pure mutation of `doc`; the caller writes the audit row once the enclosing
 * `mutateOrg` has committed, matching the rest of the codebase's convention.
 */
export function createIntakeWithClock(doc: OrgDoc, input: CreateIntakeInput): CreateIntakeResult {
  const startedAt = new Date();
  const kind: ClockKind = input.type === "sar" ? "sar_1_month" : "breach_72h";

  const intake: IntakeRecord = {
    id: newId(),
    orgId: doc.id,
    type: input.type,
    source: input.source,
    summary: input.summary,
    raisedBy: input.raisedBy,
    createdAt: startedAt.toISOString(),
  };
  doc.intakes.push(intake);

  const clock: ClockRecord = {
    id: newId(),
    orgId: doc.id,
    intakeId: intake.id,
    kind,
    startedAt: startedAt.toISOString(),
    dueAt: dueAtFor(kind, startedAt).toISOString(),
    closedAt: null,
    closedBy: null,
    outcome: null,
    entryId: null,
  };
  doc.clocks.push(clock);

  doc.clockEvents.push({
    id: newId(),
    clockId: clock.id,
    note:
      input.type === "sar"
        ? "Statutory one-month SAR clock started."
        : "72-hour breach assessment clock started.",
    actorId: input.raisedBy,
    createdAt: new Date().toISOString(),
  });

  const reviewItem: ReviewItemRecord = {
    id: newId(),
    orgId: doc.id,
    type: "intake",
    refId: intake.id,
    summary: input.summary,
    state: "pending",
    decidedBy: null,
    decidedAt: null,
    createdAt: new Date().toISOString(),
  };
  doc.review.push(reviewItem);

  return { intake, clock, reviewItem };
}

/** Short human-readable reference, e.g. SAR-3F2A91B0. */
export function clockReference(intakeType: string, intakeId: string): string {
  return `${intakeType.toUpperCase()}-${intakeId.slice(0, 8).toUpperCase()}`;
}

/** The two fixed notes `createIntakeWithClock` writes when a clock starts. */
const STARTED_NOTES = new Set([
  "Statutory one-month SAR clock started.",
  "72-hour breach assessment clock started.",
]);

/**
 * An event's kind, derived rather than stored — `ClockEventRecord` (db/model.ts)
 * carries only a note, not an event-type column. The opening note is one of
 * two fixed strings only this codebase writes; the closing note is always
 * exactly the clock's outcome. Anything else is a plain note. Shared by the
 * client and admin clock routes so the two timelines agree.
 */
export function clockEventLabel(event: ClockEventRecord, clock: ClockRecord): string {
  if (STARTED_NOTES.has(event.note)) return "started";
  if (clock.closedAt && event.note === clock.outcome) return "closed";
  return "note";
}

export interface FoundClock {
  doc: OrgDoc;
  clock: ClockRecord;
  intake: IntakeRecord | null;
}

/**
 * Find a clock by id without knowing which organisation holds it. Several
 * existing routes take only a clock id (no accountId), which the store's
 * per-organisation documents cannot resolve directly. The beta's org count is
 * small enough that a scan is the honest option — it keeps the routes' URLs
 * unchanged rather than forcing a new query parameter onto the web app.
 */
export async function findClockGlobally(clockId: string): Promise<FoundClock | null> {
  for (const orgId of await listOrgIds()) {
    const doc = await readOrg(orgId);
    if (!doc) continue;
    const clock = doc.clocks.find((c) => c.id === clockId);
    if (clock) {
      const intake = doc.intakes.find((i) => i.id === clock.intakeId) ?? null;
      return { doc, clock, intake };
    }
  }
  return null;
}

/**
 * Defaults for the Record entry a closed clock creates, by clock kind.
 * `hours` mirrors the corresponding service line's default (line 4 DSAR
 * support, line 5 breach advisory) so the figure is never invented — it is
 * the same estimate the Record uses everywhere else, editable afterwards.
 */
function entryDefaultsFor(kind: ClockKind): { line: number; what: string; deadline: DeadlineLabel } {
  if (kind === "sar_1_month") {
    return {
      line: 4,
      what: "Handled a data request end to end: acknowledgment, search checklist, response letter",
      deadline: "DSAR one month",
    };
  }
  return {
    line: 5,
    what: "Assessed a reported concern against the ICO notification threshold",
    deadline: "Breach 72 hours",
  };
}

/**
 * Closing a statutory clock creates a Record entry automatically (see
 * PORTING_BRIEF.md, "the value layer being added"). Mutates `doc` and the
 * `clock` passed in — sets `clock.entryId` — and returns the new entry. The
 * caller must have already set `clock.closedAt`, `closedBy` and `outcome`.
 */
export function recordEntryForClosedClock(
  doc: OrgDoc,
  clock: ClockRecord,
  input: { outcome: string; closedAt: Date; reviewerName: string },
): EntryRecord {
  const defaults = entryDefaultsFor(clock.kind);
  const entry: EntryRecord = {
    id: newId(),
    orgId: doc.id,
    date: input.closedAt.toISOString().slice(0, 10),
    line: defaults.line,
    what: defaults.what,
    outcome: input.outcome,
    hours: defaultHoursFor(defaults.line),
    deadline: defaults.deadline,
    reviewer: input.reviewerName,
    ill: false,
    reviewed: true,
    source: "clock",
    sourceRef: clock.id,
    createdAt: new Date().toISOString(),
  };
  doc.entries.push(entry);
  clock.entryId = entry.id;
  return entry;
}

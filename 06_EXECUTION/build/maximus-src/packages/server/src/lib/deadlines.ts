import { DateTime } from "luxon";

const LONDON = "Europe/London";

/**
 * SAR clock (spec §3): due at the same day-of-month one calendar month after
 * `startsAt`, computed in Europe/London wall-clock time (e.g. 14 Jan → 14 Feb).
 * If the target month has no such day, due is the last day of that month
 * (31 Jan → 28/29 Feb). Wall-clock time of day is preserved across GMT/BST.
 */
export function sarDueAt(startsAt: Date): Date {
  return DateTime.fromJSDate(startsAt, { zone: LONDON })
    .plus({ months: 1 })
    .toJSDate();
}

/** Breach clock (spec §3): exactly 72 elapsed hours after `startsAt`. */
export function breachDueAt(startsAt: Date): Date {
  return new Date(startsAt.getTime() + 72 * 60 * 60 * 1000);
}

export function dueAtFor(kind: "sar_1_month" | "breach_72h", startsAt: Date): Date {
  return kind === "sar_1_month" ? sarDueAt(startsAt) : breachDueAt(startsAt);
}

export { clockStatus } from "@maximus/shared";

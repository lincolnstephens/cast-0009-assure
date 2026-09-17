import type { RagStatus } from "./enums.ts";

/**
 * Status thresholds (spec §3): green when MORE than 50% of the clock's time
 * remains, amber from 50% down to 20%, red below 20% or overdue.
 */
export function clockStatus(startsAt: Date, dueAt: Date, now: Date): RagStatus {
  const total = dueAt.getTime() - startsAt.getTime();
  const remaining = dueAt.getTime() - now.getTime();
  if (total <= 0 || remaining <= 0) return "red";
  const fraction = remaining / total;
  if (fraction > 0.5) return "green";
  if (fraction >= 0.2) return "amber";
  return "red";
}

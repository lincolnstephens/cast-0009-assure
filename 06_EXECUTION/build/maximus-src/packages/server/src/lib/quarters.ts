import { DateTime } from "luxon";

const LONDON = "Europe/London";

export type Quarter = 1 | 2 | 3 | 4;

export interface QuarterKey {
  year: number;
  quarter: Quarter;
}

export function currentQuarter(now = DateTime.now().setZone(LONDON)): QuarterKey {
  return { year: now.year, quarter: Math.ceil(now.month / 3) as Quarter };
}

export function previousQuarter(key: QuarterKey): QuarterKey {
  if (key.quarter === 1) return { year: key.year - 1, quarter: 4 };
  return { year: key.year, quarter: (key.quarter - 1) as Quarter };
}

/** Inclusive start, exclusive end - Europe/London quarter boundaries. */
export function quarterRange(key: QuarterKey): { start: Date; end: Date } {
  const startMonth = (key.quarter - 1) * 3 + 1;
  const start = DateTime.fromObject(
    { year: key.year, month: startMonth, day: 1 },
    { zone: LONDON },
  ).startOf("day");
  const end = start.plus({ months: 3 });
  return { start: start.toJSDate(), end: end.toJSDate() };
}

export function quarterLabel(key: QuarterKey): string {
  return `Q${key.quarter} ${key.year}`;
}

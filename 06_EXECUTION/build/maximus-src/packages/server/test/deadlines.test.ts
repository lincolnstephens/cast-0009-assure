// Deadline calculus (spec §3) — these tests were written BEFORE the
// implementation, per the operating rules. Unchanged by the store port:
// this module has no database dependency, before or after.
//
// SAR clock: due = same day-of-month one calendar month after starts_at,
// computed in Europe/London wall-clock time; if the target month has no such
// day, due = last day of that month. Breach clock: starts_at + 72 hours.
// Status: green > 50% time remaining, amber 20–50%, red < 20% or overdue.

import { describe, expect, it } from "vitest";
import { breachDueAt, sarDueAt } from "../src/lib/deadlines.ts";
import { clockStatus } from "@maximus/shared";

const utc = (s: string) => new Date(s);

describe("sarDueAt — one calendar month, Europe/London", () => {
  it("14 Jan → 14 Feb (plain case, GMT throughout)", () => {
    expect(sarDueAt(utc("2026-01-14T10:00:00Z")).toISOString()).toBe(
      "2026-02-14T10:00:00.000Z",
    );
  });

  it("31 Jan → 28 Feb in a non-leap year (clamp to month end)", () => {
    expect(sarDueAt(utc("2025-01-31T09:30:00Z")).toISOString()).toBe(
      "2025-02-28T09:30:00.000Z",
    );
  });

  it("31 Jan → 29 Feb in a leap year", () => {
    expect(sarDueAt(utc("2024-01-31T09:30:00Z")).toISOString()).toBe(
      "2024-02-29T09:30:00.000Z",
    );
  });

  it("31 Mar → 30 Apr (clamp; BST throughout)", () => {
    // 2026-03-31 12:00 London (BST, UTC+1) = 11:00Z; due 30 Apr 12:00 London = 11:00Z.
    expect(sarDueAt(utc("2026-03-31T11:00:00Z")).toISOString()).toBe(
      "2026-04-30T11:00:00.000Z",
    );
  });

  it("31 May → 30 Jun (clamp)", () => {
    expect(sarDueAt(utc("2026-05-31T13:15:00Z")).toISOString()).toBe(
      "2026-06-30T13:15:00.000Z",
    );
  });

  it("30 Jan → 28 Feb (clamp from a 30th too)", () => {
    expect(sarDueAt(utc("2025-01-30T17:00:00Z")).toISOString()).toBe(
      "2025-02-28T17:00:00.000Z",
    );
  });

  it("BST boundary: 31 Mar 23:30 UTC is already 1 Apr in London → due 1 May", () => {
    // 2026-03-31T23:30Z = 2026-04-01 00:30 London (BST). One calendar month
    // later is 1 May 00:30 London (BST) = 2026-04-30T23:30Z.
    expect(sarDueAt(utc("2026-03-31T23:30:00Z")).toISOString()).toBe(
      "2026-04-30T23:30:00.000Z",
    );
  });

  it("GMT→BST transition inside the month preserves London wall-clock time", () => {
    // 15 Mar 2026 10:00 London is GMT (UTC+0) = 10:00Z. Due 15 Apr 10:00
    // London, which is BST (UTC+1) = 09:00Z.
    expect(sarDueAt(utc("2026-03-15T10:00:00Z")).toISOString()).toBe(
      "2026-04-15T09:00:00.000Z",
    );
  });

  it("BST→GMT transition inside the month preserves London wall-clock time", () => {
    // 10 Oct 2026 09:00 London is BST (UTC+1) = 08:00Z. Due 10 Nov 09:00
    // London, which is GMT (UTC+0) = 09:00Z.
    expect(sarDueAt(utc("2026-10-10T08:00:00Z")).toISOString()).toBe(
      "2026-11-10T09:00:00.000Z",
    );
  });

  it("31 Dec → 31 Jan (year rollover, no clamp needed)", () => {
    expect(sarDueAt(utc("2025-12-31T14:00:00Z")).toISOString()).toBe(
      "2026-01-31T14:00:00.000Z",
    );
  });
});

describe("breachDueAt — 72 hours flat", () => {
  it("adds exactly 72 hours", () => {
    expect(breachDueAt(utc("2026-06-01T08:45:00Z")).toISOString()).toBe(
      "2026-06-04T08:45:00.000Z",
    );
  });

  it("is unaffected by DST (72 elapsed hours, not 3 wall-clock days)", () => {
    // Crosses the 29 Mar 2026 BST start; still exactly 72h of elapsed time.
    expect(breachDueAt(utc("2026-03-27T12:00:00Z")).toISOString()).toBe(
      "2026-03-30T12:00:00.000Z",
    );
  });
});

describe("clockStatus — thresholds on fraction of time remaining", () => {
  const startsAt = utc("2026-06-01T00:00:00Z");
  const dueAt = utc("2026-06-11T00:00:00Z"); // 10-day window
  const at = (day: number) => utc(`2026-06-${String(day).padStart(2, "0")}T00:00:00Z`);

  it("green when more than 50% of the time remains", () => {
    expect(clockStatus(startsAt, dueAt, at(2))).toBe("green"); // 90% left
    expect(clockStatus(startsAt, dueAt, at(4))).toBe("green"); // 70% left
  });

  it("amber at exactly 50% remaining (green requires strictly more)", () => {
    expect(clockStatus(startsAt, dueAt, at(6))).toBe("amber"); // 50% left
  });

  it("amber between 20% and 50% remaining", () => {
    expect(clockStatus(startsAt, dueAt, at(7))).toBe("amber"); // 40% left
    expect(clockStatus(startsAt, dueAt, at(9))).toBe("amber"); // 20% left exactly
  });

  it("red below 20% remaining", () => {
    expect(clockStatus(startsAt, dueAt, utc("2026-06-10T12:00:00Z"))).toBe("red"); // 5% left
  });

  it("red when overdue", () => {
    expect(clockStatus(startsAt, dueAt, at(12))).toBe("red");
    expect(clockStatus(startsAt, dueAt, dueAt)).toBe("red"); // 0% remaining
  });
});

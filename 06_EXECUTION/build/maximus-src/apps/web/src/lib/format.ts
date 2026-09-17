// All timestamps display in Europe/London, "dd MMM yyyy, HH:mm" (spec §6).
const londonDateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatLondon(iso: string): string {
  const parts = londonDateTime.formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")} ${get("month")} ${get("year")}, ${get("hour")}:${get("minute")}`;
}

/** British currency: rounded to the nearest pound, grouped, with a £ sign. */
export function formatGBP(amount: number): string {
  return `£${Math.round(amount).toLocaleString("en-GB")}`;
}

/** British short date, e.g. "12 Sep 2026", from a YYYY-MM-DD date string. */
/**
 * A date the reader can trust. Takes either a plain YYYY-MM-DD, as a due date
 * is, or a full ISO timestamp, as a closing time is. Anything it cannot read
 * says so rather than rendering "Invalid Date" at the reader.
 */
export function formatDateGB(date: string): string {
  if (!date) return "No date";
  const value = /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00` : date;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "No date";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Live countdown, e.g. "11d 04:32:18" or "-2d 01:15:00" when overdue. */
export function formatCountdown(dueIso: string, now: Date): string {
  let ms = new Date(dueIso).getTime() - now.getTime();
  const sign = ms < 0 ? "-" : "";
  ms = Math.abs(ms);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${sign}${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

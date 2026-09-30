import { useEffect, useState } from "react";
import type { RetentionRow } from "@maximus/shared";
import { api, ApiError } from "../lib/api";

/** The module the retention schedule belongs to (Data retention practice). */
const RETENTION_MODULE = "3";

/**
 * The retention schedule (FRAGO 06 3.2): a short list of data category and
 * retention period, shown as tiles on module 3. Operator only; it sits in
 * Settings and saves with the rest of the organisation's settings.
 */
export function RetentionScheduleEditor({
  orgId,
  schedule,
  onSaved,
}: {
  orgId: string;
  schedule: Record<string, RetentionRow[]> | undefined;
  onSaved: (next: Record<string, RetentionRow[]>) => void;
}) {
  const [rows, setRows] = useState<RetentionRow[]>(schedule?.[RETENTION_MODULE] ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setRows(schedule?.[RETENTION_MODULE] ?? []);
  }, [schedule]);

  const set = (i: number, key: keyof RetentionRow, value: string) =>
    setRows((r) => r.map((row, j) => (j === i ? { ...row, [key]: value } : row)));

  async function save() {
    const clean = rows
      .map((r) => ({ category: r.category.trim(), period: r.period.trim() }))
      .filter((r) => r.category || r.period);
    if (clean.some((r) => !r.category || !r.period)) {
      setError("Give every row both a category and a period, or remove it.");
      return;
    }
    try {
      const next = { ...(schedule ?? {}), [RETENTION_MODULE]: clean };
      const res = await api<{ settings: { retentionSchedule?: Record<string, RetentionRow[]> } }>(
        `/admin/settings?org=${orgId}`,
        { method: "PUT", body: JSON.stringify({ retentionSchedule: next }) },
      );
      onSaved(res.settings.retentionSchedule ?? next);
      setError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save the retention schedule.");
    }
  }

  return (
    <div data-testid="retention-editor" className="mt-4 rounded border border-hud-line bg-hud-panel/60 p-4">
      <h2 className="text-sm font-semibold">Retention schedule, module 3</h2>
      <p className="mt-1 max-w-[75ch] text-[12px] text-hud-muted">
        Each category shows on the client's Data retention practice page as a tile with its period. The client
        reads it; only MITMARK changes it.
      </p>
      {rows.length === 0 && <p className="mt-3 text-[13px] text-hud-muted">No categories recorded yet.</p>}
      <ul className="mt-3 space-y-2">
        {rows.map((r, i) => (
          <li key={i} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
            <input
              aria-label={`Category ${i + 1}`}
              data-testid="retention-category"
              value={r.category}
              maxLength={160}
              onChange={(e) => set(i, "category", e.target.value)}
              placeholder="Category"
              className="rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            />
            <input
              aria-label={`Period ${i + 1}`}
              data-testid="retention-period"
              value={r.period}
              maxLength={200}
              onChange={(e) => set(i, "period", e.target.value)}
              placeholder="Retention period"
              className="rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            />
            <button
              type="button"
              onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
              className="text-[12px] text-status-red hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, { category: "", period: "" }])}
          className="rounded border border-hud-line px-3 py-1.5 text-[13px] hover:bg-hud-bg"
        >
          Add a category
        </button>
        <button
          type="button"
          data-testid="retention-save"
          onClick={() => void save()}
          className="rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90"
        >
          Save schedule
        </button>
        {saved && <span className="text-[13px] text-status-green">Saved</span>}
      </div>
      {error && (
        <p className="mt-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

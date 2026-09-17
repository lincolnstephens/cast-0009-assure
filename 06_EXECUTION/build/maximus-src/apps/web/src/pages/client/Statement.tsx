import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { RecordResponse, StatementResponse } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { StatementDocument } from "../../components/StatementDocument";

/**
 * The CFO statement: a plain, forwardable document built from the same
 * reviewed, non-illustrative entries as the Record. Print uses the browser
 * print path against the print stylesheet; "download as PDF" is the same
 * dialogue, honestly labelled.
 */
export function StatementPage() {
  const [periods, setPeriods] = useState<string[]>([]);
  const [period, setPeriod] = useState<string>("");
  const [data, setData] = useState<StatementResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The period list lives on the Record response; fetch it once to populate
  // the selector here too, then load the statement for the chosen period.
  useEffect(() => {
    void (async () => {
      try {
        const res = await api<RecordResponse>("/value/record");
        setPeriods(res.periods);
        setPeriod(res.period === "all periods" ? "all" : res.period);
      } catch {
        // The period list is a convenience only; the statement loads regardless.
      }
    })();
  }, []);

  const load = useCallback(async (nextPeriod: string) => {
    try {
      const qs = nextPeriod ? `?period=${encodeURIComponent(nextPeriod)}` : "";
      setData(await api<StatementResponse>(`/value/statement${qs}`));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load the statement.");
    }
  }, []);

  useEffect(() => {
    if (period) void load(period);
  }, [period, load]);

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex gap-1 text-sm print:hidden" role="tablist" aria-label="Value">
        <Link
          role="tab"
          aria-selected="false"
          to="/value"
          className="rounded-t border border-b-0 border-transparent px-3 py-1.5 text-client-muted hover:text-client-text"
        >
          Record
        </Link>
        <span role="tab" aria-selected="true" className="rounded-t border border-b-0 border-client-accent bg-client-surface px-3 py-1.5 font-medium text-client-accent">
          CFO statement
        </span>
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted print:hidden">
        Forwardable
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3 print:hidden">
        <button
          type="button"
          data-testid="statement-print"
          onClick={() => window.print()}
          className="rounded bg-client-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-client-accent/90"
        >
          Print or save as PDF
        </button>
        <label htmlFor="stmtPeriod" className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
          Period
        </label>
        <select
          id="stmtPeriod"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded border border-client-line bg-client-bg px-2 py-1 text-[13px]"
        >
          <option value="all">All periods</option>
          {periods.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <span className="text-[13px] text-client-muted">
          Plain statement of work and value for the period selected in Record. No product
          language. Written to be forwarded as it stands.
        </span>
      </div>

      {error && (
        <p className="mt-4 border-l-2 border-status-red pl-3 text-sm text-status-red" role="alert">
          {error}
        </p>
      )}

      {data ? (
        <StatementDocument data={data} />
      ) : (
        !error && <p className="mt-4 text-sm text-client-muted">Loading…</p>
      )}
    </div>
  );
}

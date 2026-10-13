import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { RecordResponse } from "@maximus/shared";
import { AREAS } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { formatDateGB, formatGBP } from "../../lib/format";
import { RecordTable } from "../../components/RecordTable";
import { ModuleStatus } from "../../components/ModuleStatus";
import { SpendList } from "../../components/SpendList";

/**
 * The Record: what MITMARK did on the Information Officer's behalf, read
 * only. Her only inputs here are the period and module filters; there
 * is no form and nothing for her to enter.
 */
export function ValuePage() {
  const [data, setData] = useState<RecordResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("");
  const [moduleId, setModuleId] = useState<string>("");

  const load = useCallback(async (nextPeriod?: string, nextModule?: string) => {
    try {
      const params = new URLSearchParams();
      if (nextPeriod) params.set("period", nextPeriod);
      if (nextModule) params.set("module", nextModule);
      const qs = params.toString();
      const res = await api<RecordResponse>(`/value/record${qs ? `?${qs}` : ""}`);
      setData(res);
      setError(null);
      if (!nextPeriod) setPeriod(res.period === "all periods" ? "all" : res.period);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load the record.");
    }
  }, []);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changePeriod(value: string) {
    setPeriod(value);
    void load(value, moduleId);
  }

  function changeModule(value: string) {
    setModuleId(value);
    void load(period, value);
  }

  const rows = data?.entries ?? [];
  const deadlineRows = rows.filter((e) => e.deadline !== "");
  const bars = data
    ? [...data.totals.byModule].filter((l) => l.hours > 0).sort((a, b) => b.hours - a.hours)
    : [];
  const maxHours = Math.max(1, ...bars.map((b) => b.hours));

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex gap-1 text-sm" role="tablist" aria-label="Value">
        <span role="tab" aria-selected="true" className="rounded-t border border-b-0 border-client-accent bg-client-surface px-3 py-1.5 font-medium text-client-accent">
          Record
        </span>
        <Link
          role="tab"
          aria-selected="false"
          to="/value/statement"
          className="rounded-t border border-b-0 border-transparent px-3 py-1.5 text-client-muted hover:text-client-text"
        >
          CFO statement
        </Link>
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
        For the Information Officer
      </p>
      <h1 className="text-lg font-semibold">What MITMARK did on your behalf, and what it saved you</h1>
      <p className="mt-2 max-w-[58ch] text-[13px] text-client-muted">
        Each row is one piece of work MITMARK completed under the retainer, filed under the module it
        belongs to. The hours are an
        estimate of your time it replaced. The cost equivalent is those hours at the rate set in
        Operator, and what a contractor would have charged for the same work. Every entry is
        reviewed by a named MITMARK person before it appears here.
      </p>

      {error && (
        <p className="mt-4 border-l-2 border-status-red pl-3 text-sm text-status-red" role="alert">
          {error}
        </p>
      )}

      {data && (
        <>
          {data.showingIllustrative && (
            <div className="mt-4 flex items-center gap-3 rounded border border-status-amber px-3 py-2.5 text-[13px]">
              <b className="font-mono text-[11px] uppercase tracking-[0.18em] text-status-amber">
                Illustrative
              </b>
              <span>
                Entries marked illustrative are examples of the record's structure, not a log of
                work done. They are replaced as the operator enters real items. Figures depend on
                the rates set in Operator.
              </span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="fPeriod" className="mb-1 block font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
                Period
              </label>
              <select
                id="fPeriod"
                value={period}
                onChange={(e) => changePeriod(e.target.value)}
                className="min-w-[160px] rounded border border-client-line bg-client-bg px-2 py-1.5 text-[13px]"
              >
                <option value="all">All periods</option>
                {data.periods.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="fModule" className="mb-1 block font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
                Module
              </label>
              <select
                id="fModule"
                value={moduleId}
                onChange={(e) => changeModule(e.target.value)}
                className="min-w-[160px] rounded border border-client-line bg-client-bg px-2 py-1.5 text-[13px]"
              >
                <option value="">All modules</option>
                {AREAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id}. {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Tile
              label="Items delivered"
              value={String(data.totals.items)}
              detail={data.totals.anyIllustrative ? "includes illustrative entries" : "all real entries"}
            />
            <Tile
              label="Your hours saved"
              value={String(data.totals.hours)}
              detail="estimated hours of your time replaced"
            />
            <Tile
              label="Cost equivalent"
              value={formatGBP(data.totals.io)}
              detail={`at £${data.settings.ioRate}/h loaded rate (assumption until confirmed)`}
            />
            <Tile
              label="Contractor equivalent"
              value={formatGBP(data.totals.con)}
              detail={`at £${data.settings.dayRate}/day ex VAT`}
            />
            <Tile
              label="Statutory deadlines met"
              value={String(data.totals.deadlinesMet)}
              detail="DSAR, breach, DPA, board dates"
            />
          </div>

          <div className="mt-5">
            <RecordTable entries={rows} ioRate={data.settings.ioRate} dayRate={data.settings.dayRate} />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-client-line bg-client-surface p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
                Hours saved by module
              </p>
              {bars.length === 0 ? (
                <p className="mt-2 text-[13px] text-client-muted">Nothing yet.</p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {bars.map((b) => (
                    <div
                      key={b.area}
                      data-testid="value-module-group"
                      className="grid grid-cols-[150px_1fr_40px] items-center gap-2 text-[13px]"
                    >
                      <span>{b.name}</span>
                      <div className="h-2 bg-client-line">
                        <div
                          className="h-2 bg-client-accent"
                          style={{ width: `${(b.hours / maxHours) * 100}%` }}
                        />
                      </div>
                      <span className="text-right font-mono tabular-nums">{b.hours}h</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded border border-client-line bg-client-surface p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
                Deadlines and obligations met
              </p>
              {deadlineRows.length === 0 ? (
                <p className="mt-2 text-[13px] text-client-muted">No statutory deadlines in this selection.</p>
              ) : (
                <table className="mt-2 w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className="border-b border-client-line py-1.5 text-left font-mono text-[11px] uppercase tracking-wider text-client-muted">
                        Date
                      </th>
                      <th className="border-b border-client-line py-1.5 text-left font-mono text-[11px] uppercase tracking-wider text-client-muted">
                        Clock
                      </th>
                      <th className="border-b border-client-line py-1.5 text-left font-mono text-[11px] uppercase tracking-wider text-client-muted">
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deadlineRows.map((e) => (
                      <tr key={e.id}>
                        <td className="border-b border-client-line py-1.5 font-mono">{formatDateGB(e.date)}</td>
                        <td className="border-b border-client-line py-1.5">{e.deadline}</td>
                        <td className="border-b border-client-line py-1.5">{e.outcome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="mt-3 text-[13px] text-client-muted">
                Statutory clocks MITMARK tracked so you did not have to: DSAR one month, breach 72
                hours to the ICO, vendor DPA before go-live.
              </p>
            </div>
          </div>

          <section className="mt-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">Assessment</p>
            <h2 className="text-lg font-semibold">The eight modules of the service</h2>
            <p className="mt-2 max-w-[88ch] text-[13px] text-client-muted">
              Each module with its status for this contract and the work on record against it.
              Status is the operator's entry, not an assumption.
            </p>
            <div className="mt-3">
              <ModuleStatus modules={data.modules} />
            </div>
          </section>

          <section className="mt-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">Delivered at £0</p>
            <h2 className="text-lg font-semibold">Where modest spend would improve this</h2>
            <p className="mt-2 max-w-[88ch] text-[13px] text-client-muted">
              Nothing below is needed for the record to work. Each item states what it adds, what
              it costs, and who it is for.
            </p>
            <div className="mt-3">
              <SpendList />
            </div>
          </section>
        </>
      )}

      {!data && !error && <p className="mt-4 text-sm text-client-muted">Loading…</p>}
    </div>
  );
}

function Tile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded border border-client-line bg-client-surface px-4 py-3">
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">{label}</div>
      <div className="mt-1.5 font-mono text-2xl tabular-nums">{value}</div>
      <div className="mt-0.5 text-[12px] text-client-muted">{detail}</div>
    </div>
  );
}

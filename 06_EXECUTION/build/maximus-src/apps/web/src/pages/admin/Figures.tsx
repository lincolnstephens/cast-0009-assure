import { type FormEvent, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../../lib/api";
import { formatLondon } from "../../lib/format";
import { useAdmin } from "../../store/admin";

type Counts = Record<string, number | null>;

interface FigureModule {
  area: number;
  name: string;
  groups: { key: string; label: string; items: { key: string; label: string }[] }[];
  latest: { groups: Record<string, Counts>; enteredByName: string; enteredAt: string } | null;
}

/**
 * Figures (FRAGO 06 3.3). The counts MITMARK reports each month for what the
 * product does not yet hold as records: impact assessments and project risk
 * assessments (module 5), vendors (module 7) and incidents (module 8). Each
 * save is a new report, kept with who made it and when; the client's module
 * page shows the newest as "Reported by MITMARK on {date}". A count left
 * empty shows "No data yet", never zero. Operators only.
 */
export function AdminFiguresPage() {
  const { selectedAccountId } = useAdmin();
  const [modules, setModules] = useState<FigureModule[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const res = await api<{ modules: FigureModule[] }>(`/admin/figures?org=${selectedAccountId}`);
      setModules(res.modules);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load the figures.");
    }
  }, [selectedAccountId]);

  useEffect(() => {
    setModules(null);
    void load();
  }, [load]);

  async function submit(e: FormEvent<HTMLFormElement>, m: FigureModule) {
    e.preventDefault();
    if (!selectedAccountId) return;
    const form = new FormData(e.currentTarget);
    const groups: Record<string, Counts> = {};
    for (const g of m.groups) {
      groups[g.key] = {};
      for (const i of g.items) {
        const raw = String(form.get(`${g.key}.${i.key}`) ?? "").trim();
        groups[g.key][i.key] = raw === "" ? null : Number(raw);
      }
    }
    try {
      await api(`/admin/figures/${m.area}?org=${selectedAccountId}`, {
        method: "PUT",
        body: JSON.stringify({ groups }),
      });
      setError(null);
      setSaved(m.area);
      setTimeout(() => setSaved(null), 2500);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save the figures.");
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-semibold">Figures</h1>
      <p className="mt-1 max-w-[75ch] text-[13px] text-hud-muted">
        The counts you report for modules 5, 7 and 8, for what the product does not yet hold as records. The
        client sees the newest report on the module page with its date. Leave a count empty if you do not know
        it; the client then sees "No data yet", never zero. Data requests and reported concerns are counted
        from the product's own records and are not entered here.
      </p>

      {error && (
        <p className="mt-3 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}
      {!selectedAccountId && <p className="mt-4 text-[13px] text-hud-muted">Choose an organisation first.</p>}
      {selectedAccountId && !modules && !error && <p className="mt-4 text-[13px] text-hud-muted">Loading…</p>}

      {modules?.map((m) => (
        <form
          key={`${selectedAccountId}-${m.area}-${m.latest?.enteredAt ?? "none"}`}
          data-testid="figures-form"
          data-area={m.area}
          onSubmit={(e) => void submit(e, m)}
          className="mt-4 rounded border border-hud-line bg-hud-panel/60 p-4"
        >
          <h2 className="text-sm font-semibold">
            Module {m.area}. {m.name}
          </h2>
          <p className="mt-0.5 text-[12px] text-hud-muted">
            {m.latest
              ? `Last reported by ${m.latest.enteredByName}, ${formatLondon(m.latest.enteredAt)}.`
              : "Nothing reported yet."}
          </p>
          {m.groups.map((g) => (
            <fieldset key={g.key} className="mt-3">
              <legend className="text-[12px] font-medium uppercase tracking-wider text-hud-muted">{g.label}</legend>
              <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {g.items.map((i) => {
                  const current = m.latest?.groups[g.key]?.[i.key];
                  return (
                    <label key={i.key} className="block text-[12px]">
                      <span className="mb-1 block text-hud-muted">{i.label}</span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        name={`${g.key}.${i.key}`}
                        data-testid={`figure-${g.key}-${i.key}`}
                        defaultValue={current === null || current === undefined ? "" : String(current)}
                        className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
                      />
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <div className="mt-3 flex items-center gap-3">
            <button
              type="submit"
              data-testid="figures-save"
              className="rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90"
            >
              Save report
            </button>
            {saved === m.area && <span className="text-[13px] text-status-green">Saved</span>}
          </div>
        </form>
      ))}
    </div>
  );
}

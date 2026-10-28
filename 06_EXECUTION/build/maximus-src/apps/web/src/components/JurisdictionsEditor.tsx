import { useEffect, useState } from "react";
import {
  COVERAGE_STATUS_LABEL,
  coverageStatusSchema,
  jurisdictionsSchema,
  type CoverageEntry,
  type CoverageStatus,
} from "@maximus/shared";
import { api, ApiError } from "../lib/api";

/** One row as it is typed: positions stay text until the save reads them. */
type Draft = Omit<CoverageEntry, "lat" | "lon"> & { lat: string; lon: string };

const toDraft = (j: CoverageEntry): Draft => ({ ...j, lat: String(j.lat), lon: String(j.lon) });
const blank = (): Draft => ({
  id: "",
  name: "",
  hub: "",
  regulator: "",
  law: "",
  filingDuty: "",
  lat: "",
  lon: "",
  status: "not_started",
});

const TEXT_FIELDS: { key: "id" | "name" | "hub" | "regulator" | "law"; label: string; max: number }[] = [
  { key: "id", label: "Id", max: 12 },
  { key: "name", label: "Jurisdiction", max: 120 },
  { key: "hub", label: "Hub", max: 80 },
  { key: "regulator", label: "Regulator", max: 200 },
  { key: "law", label: "Law", max: 200 },
];

/**
 * v1.10 (FRAGO 11 3.3). The organisation's jurisdictions: add, change,
 * remove, save. Operator only; the client reads the list on the Global
 * coverage tile and on module 1. The whole list saves at once to the
 * organisation whose settings are on screen, and the audit records the
 * count, never the entries.
 */
export function JurisdictionsEditor({
  orgId,
  jurisdictions,
  onSaved,
}: {
  orgId: string;
  jurisdictions: CoverageEntry[] | undefined;
  onSaved: (next: CoverageEntry[]) => void;
}) {
  const [rows, setRows] = useState<Draft[]>((jurisdictions ?? []).map(toDraft));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setRows((jurisdictions ?? []).map(toDraft));
  }, [jurisdictions]);

  const set = (i: number, key: keyof Draft, value: string) =>
    setRows((r) => r.map((row, j) => (j === i ? { ...row, [key]: value } : row)));

  async function save() {
    const parsed = jurisdictionsSchema.safeParse(
      rows.map((r) => ({
        ...r,
        lat: r.lat.trim() === "" ? Number.NaN : Number(r.lat),
        lon: r.lon.trim() === "" ? Number.NaN : Number(r.lon),
      })),
    );
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setError(
        issue?.code === "custom"
          ? issue.message
          : "Give every jurisdiction an id, a name, a hub, and a latitude (-90 to 90) and longitude (-180 to 180), or remove it.",
      );
      return;
    }
    try {
      const res = await api<{ jurisdictions: CoverageEntry[] }>(`/admin/jurisdictions?org=${orgId}`, {
        method: "PUT",
        body: JSON.stringify({ jurisdictions: parsed.data }),
      });
      onSaved(res.jurisdictions);
      setError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save the jurisdictions.");
    }
  }

  return (
    <div data-testid="jurisdictions-editor" className="mt-4 rounded border border-hud-line bg-hud-panel/60 p-4">
      <h2 className="text-sm font-semibold">Jurisdictions</h2>
      <p className="mt-1 max-w-[75ch] text-[12px] text-hud-muted">
        Each jurisdiction shows on the client's Compliance Tracker as a marker on the Global coverage map and a row
        in the table beneath it, and on module 1 under Registrations and filings. With none listed, neither appears.
        The filing duty is shown to the client as "to be confirmed at mobilisation". The client reads it; only MITMARK
        changes it.
      </p>
      {rows.length === 0 && <p className="mt-3 text-[13px] text-hud-muted">No jurisdictions listed.</p>}
      <ul className="mt-3 space-y-3">
        {rows.map((r, i) => (
          <li
            key={i}
            data-testid="jurisdiction-row"
            className="grid gap-2 rounded border border-hud-line p-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {TEXT_FIELDS.map((f) => (
              <label key={f.key} className="text-[12px] text-hud-muted">
                {f.label}
                <input
                  data-testid={`jurisdiction-${f.key}`}
                  value={r[f.key]}
                  maxLength={f.max}
                  onChange={(e) => set(i, f.key, e.target.value)}
                  className="mt-0.5 block w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px] text-hud-text"
                />
              </label>
            ))}
            <label className="text-[12px] text-hud-muted">
              Latitude
              <input
                data-testid="jurisdiction-lat"
                inputMode="decimal"
                value={r.lat}
                onChange={(e) => set(i, "lat", e.target.value)}
                className="mt-0.5 block w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 font-mono text-[13px] text-hud-text"
              />
            </label>
            <label className="text-[12px] text-hud-muted">
              Longitude
              <input
                data-testid="jurisdiction-lon"
                inputMode="decimal"
                value={r.lon}
                onChange={(e) => set(i, "lon", e.target.value)}
                className="mt-0.5 block w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 font-mono text-[13px] text-hud-text"
              />
            </label>
            <label className="text-[12px] text-hud-muted">
              Status
              <select
                data-testid="jurisdiction-status"
                value={r.status}
                onChange={(e) => set(i, "status", e.target.value as CoverageStatus)}
                className="mt-0.5 block w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px] text-hud-text"
              >
                {coverageStatusSchema.options.map((s) => (
                  <option key={s} value={s}>
                    {COVERAGE_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[12px] text-hud-muted sm:col-span-2 lg:col-span-3">
              Filing duty
              <input
                data-testid="jurisdiction-filingDuty"
                value={r.filingDuty}
                maxLength={400}
                onChange={(e) => set(i, "filingDuty", e.target.value)}
                className="mt-0.5 block w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px] text-hud-text"
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                data-testid="jurisdiction-remove"
                onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                className="text-[12px] text-status-red hover:underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          data-testid="jurisdictions-add"
          onClick={() => setRows((rs) => [...rs, blank()])}
          className="rounded border border-hud-line px-3 py-1.5 text-[13px] hover:bg-hud-bg"
        >
          Add a jurisdiction
        </button>
        <button
          type="button"
          data-testid="jurisdictions-save"
          onClick={() => void save()}
          className="rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90"
        >
          Save jurisdictions
        </button>
        {saved && (
          <span data-testid="jurisdictions-saved" className="text-[13px] text-status-green">
            Saved
          </span>
        )}
      </div>
      {error && (
        <p className="mt-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

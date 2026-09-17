import { type FormEvent, useCallback, useEffect, useState } from "react";
import { lineStatusSchema } from "@maximus/shared";
import type { LineStatus, OrgSettings } from "@maximus/shared";
import { LINES } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { useAdmin } from "../../store/admin";

const STATUS_OPTS = lineStatusSchema.options;

interface Branding {
  accent: string;
  displayName: string;
}

/**
 * The operator's settings: rates and names for the statement, the twelve
 * line statuses, the illustrative demo switch, and the client accent
 * colour. The Information Officer never sees this page.
 */
export function AdminSettingsPage() {
  const { selectedAccountId } = useAdmin();
  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [accent, setAccent] = useState("");
  const [accentSaved, setAccentSaved] = useState(false);
  const [accentError, setAccentError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const res = await api<{ settings: OrgSettings; branding: Branding; name: string }>(
        `/admin/settings?org=${selectedAccountId}`,
      );
      setSettings(res.settings);
      setBranding(res.branding);
      setAccent(res.branding.accent);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load settings.");
    }
  }, [selectedAccountId]);

  useEffect(() => {
    setSettings(null);
    void load();
  }, [load]);

  async function saveSettings(next: Partial<OrgSettings>) {
    if (!selectedAccountId) return;
    const res = await api<{ settings: OrgSettings }>(`/admin/settings?org=${selectedAccountId}`, {
      method: "PUT",
      body: JSON.stringify(next),
    });
    setSettings(res.settings);
    return res.settings;
  }

  async function submitRates(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    const form = new FormData(e.currentTarget);
    const retainerRaw = String(form.get("retainer") ?? "");
    try {
      await saveSettings({
        clientName: String(form.get("clientName") ?? ""),
        ioName: String(form.get("ioName") ?? ""),
        ioRate: Number(form.get("ioRate") ?? 0),
        dayRate: Number(form.get("dayRate") ?? 0),
        retainer: retainerRaw === "" ? "" : Number(retainerRaw),
        lead: String(form.get("lead") ?? ""),
      });
      setError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save the rates.");
    }
  }

  async function toggleIllustrative(checked: boolean) {
    if (!settings) return;
    setSettings({ ...settings, showIllustrative: checked });
    try {
      await saveSettings({ showIllustrative: checked });
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to change the demo switch.");
      void load();
    }
  }

  async function changeLineStatus(lineId: number, status: LineStatus) {
    if (!settings) return;
    const lineStatus = { ...settings.lineStatus, [String(lineId)]: status };
    setSettings({ ...settings, lineStatus });
    try {
      await saveSettings({ lineStatus });
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to change that status.");
      void load();
    }
  }

  async function saveAccent(e: FormEvent) {
    e.preventDefault();
    if (!selectedAccountId) return;
    setAccentError(null);
    try {
      const res = await api<{ branding: Branding }>(`/admin/branding?org=${selectedAccountId}`, {
        method: "PUT",
        body: JSON.stringify({ accent }),
      });
      setBranding(res.branding);
      setAccentSaved(true);
      setTimeout(() => setAccentSaved(false), 2000);
    } catch (err) {
      setAccentError(err instanceof ApiError ? err.message : "Unable to save the accent colour.");
    }
  }

  if (error && !settings) {
    return (
      <p className="border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
        {error}
      </p>
    );
  }
  if (!settings) return <p className="text-sm text-hud-muted">Loading…</p>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-semibold">Settings</h1>
      <p className="mt-0.5 text-[13px] text-hud-muted">
        Rates are assumptions until confirmed; the statement says so. The Information Officer
        enters nothing here.
      </p>

      {error && (
        <p className="mt-3 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <form onSubmit={submitRates} className="rounded border border-hud-line bg-hud-panel/60 p-4">
          <h2 className="text-sm font-semibold">Rates and names</h2>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <F label="Client display name">
              <input name="clientName" type="text" defaultValue={settings.clientName} placeholder="e.g. The Estate" />
            </F>
            <F label="Information Officer (name or role)">
              <input name="ioName" type="text" defaultValue={settings.ioName} placeholder="Information Officer" />
            </F>
            <F label="Her loaded hourly rate, £">
              <input name="ioRate" type="number" min="0" step="1" defaultValue={settings.ioRate} />
            </F>
            <F label="Contractor day rate, £ ex VAT">
              <input name="dayRate" type="number" min="0" step="1" defaultValue={settings.dayRate} />
            </F>
            <F label="Retainer fee per month, £ ex VAT">
              <input
                name="retainer"
                type="number"
                min="0"
                step="1"
                defaultValue={settings.retainer}
                placeholder="not entered"
              />
            </F>
            <F label="MITMARK contract lead">
              <input name="lead" type="text" defaultValue={settings.lead} placeholder="name" />
            </F>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="submit"
              className="rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90"
            >
              Save rates
            </button>
            {saved && <span className="text-[12px] text-status-green">Saved</span>}
          </div>
        </form>

        <div className="rounded border border-hud-line bg-hud-panel/60 p-4">
          <h2 className="text-sm font-semibold">Demo and branding</h2>
          <label className="mt-3 flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              data-testid="toggle-illustrative"
              checked={settings.showIllustrative}
              onChange={(e) => void toggleIllustrative(e.target.checked)}
            />
            Show illustrative entries to the client (demo switch)
          </label>
          <p className="mt-1 text-[12px] text-hud-muted">
            Off means illustrative entries never reach the client portal or the statement.
          </p>

          <form onSubmit={saveAccent} className="mt-4">
            <F label="Client accent colour">
              <input
                type="text"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                placeholder="#e80029, or leave empty for house tokens"
              />
            </F>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="submit"
                className="rounded border border-hud-accent px-3 py-1.5 text-[13px] text-hud-accent hover:bg-hud-accent hover:text-white"
              >
                Save colour
              </button>
              {accentSaved && <span className="text-[12px] text-status-green">Saved</span>}
            </div>
            {accentError && (
              <p className="mt-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
                {accentError}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="mt-4 rounded border border-hud-line bg-hud-panel/60 p-4">
        <h2 className="text-sm font-semibold">Service line status</h2>
        <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 text-[13px]">
          {LINES.map((l) => (
            <FragmentRow key={l.id}>
              <span>
                {l.id}. {l.short}
              </span>
              <select
                value={settings.lineStatus[String(l.id)] ?? "Available"}
                onChange={(e) => void changeLineStatus(l.id, e.target.value as LineStatus)}
                className="rounded border border-hud-line bg-hud-bg px-2 py-1 text-[13px]"
              >
                {STATUS_OPTS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </FragmentRow>
          ))}
        </div>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[13px]">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">{label}</span>
      <div className="[&>input]:w-full [&>input]:rounded [&>input]:border [&>input]:border-hud-line [&>input]:bg-hud-bg [&>input]:px-2 [&>input]:py-1.5 [&>input]:text-[13px]">
        {children}
      </div>
    </label>
  );
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

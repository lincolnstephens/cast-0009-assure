import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  AREAS,
  DEFAULT_JOURNEY_NOTE,
  DEFAULT_MODULE_INTRODUCTIONS,
  JURISDICTION_LABEL,
  PHASES,
  jurisdictionSchema,
  lineStatusSchema,
} from "@maximus/shared";
import type { Jurisdiction, LineStatus, OrgSettings as BaseOrgSettings } from "@maximus/shared";
import { LINES } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { useAdmin } from "../../store/admin";
import { RetentionScheduleEditor } from "../../components/RetentionScheduleEditor";

const STATUS_OPTS = lineStatusSchema.options;
const JURISDICTION_OPTS = jurisdictionSchema.options;

interface Branding {
  accent: string;
  displayName: string;
}

/**
 * The Compliance Tracker fields on settings. Typed here rather than relying
 * solely on the shared `OrgSettings` shape so this page compiles whichever
 * order the data-model lane's schema update and this UI lane land in; the
 * server is the source of truth for what actually comes back.
 */
interface TrackerFields {
  jurisdiction: Jurisdiction;
  staffInScope: number | null;
  staffTrained: number | null;
  clientRoles: string[];
  workplanTargetDate: string | null;
  denominatorMode: "overdue" | "cycle";
  documentsTargetDate: string | null;
  journeyPhase: number | null;
  journeyNote: string;
  moduleIntroductions: Record<string, string>;
}

type OrgSettings = BaseOrgSettings & TrackerFields;

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
  const [trackerSaved, setTrackerSaved] = useState(false);
  const [trackerError, setTrackerError] = useState<string | null>(null);
  const [journeySaved, setJourneySaved] = useState(false);
  const [journeyError, setJourneyError] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("");
  const [rolesError, setRolesError] = useState<string | null>(null);

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

  async function submitTracker(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    const form = new FormData(e.currentTarget);
    const inScopeRaw = String(form.get("staffInScope") ?? "");
    const trainedRaw = String(form.get("staffTrained") ?? "");
    const targetDateRaw = String(form.get("workplanTargetDate") ?? "");
    const denominatorModeRaw = String(form.get("denominatorMode") ?? "overdue");
    const documentsTargetDateRaw = String(form.get("documentsTargetDate") ?? "");
    try {
      await saveSettings({
        jurisdiction: form.get("jurisdiction") as OrgSettings["jurisdiction"],
        staffInScope: inScopeRaw === "" ? null : Number(inScopeRaw),
        staffTrained: trainedRaw === "" ? null : Number(trainedRaw),
        workplanTargetDate: targetDateRaw === "" ? null : targetDateRaw,
        denominatorMode: denominatorModeRaw === "cycle" ? "cycle" : "overdue",
        documentsTargetDate: documentsTargetDateRaw === "" ? null : documentsTargetDateRaw,
      });
      setTrackerError(null);
      setTrackerSaved(true);
      setTimeout(() => setTrackerSaved(false), 2000);
    } catch (err) {
      setTrackerError(err instanceof ApiError ? err.message : "Unable to save these settings.");
    }
  }

  async function submitJourney(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    const form = new FormData(e.currentTarget);
    const phaseRaw = String(form.get("journeyPhase") ?? "");
    const moduleIntroductions: Record<string, string> = {};
    for (const a of AREAS) {
      moduleIntroductions[String(a.id)] = String(form.get(`intro-${a.id}`) ?? "").trim();
    }
    try {
      await saveSettings({
        journeyPhase: phaseRaw === "" ? null : Number(phaseRaw),
        journeyNote: String(form.get("journeyNote") ?? "").trim(),
        moduleIntroductions,
      });
      setJourneyError(null);
      setJourneySaved(true);
      setTimeout(() => setJourneySaved(false), 2000);
    } catch (err) {
      setJourneyError(err instanceof ApiError ? err.message : "Unable to save these settings.");
    }
  }

  async function addRole() {
    if (!settings) return;
    const role = newRole.trim();
    if (!role || settings.clientRoles.includes(role)) {
      setNewRole("");
      return;
    }
    const clientRoles = [...settings.clientRoles, role];
    setSettings({ ...settings, clientRoles });
    setNewRole("");
    try {
      await saveSettings({ clientRoles });
      setRolesError(null);
    } catch (err) {
      setRolesError(err instanceof ApiError ? err.message : "Unable to add that role.");
      void load();
    }
  }

  async function removeRole(index: number) {
    if (!settings) return;
    const clientRoles = settings.clientRoles.filter((_, i) => i !== index);
    setSettings({ ...settings, clientRoles });
    try {
      await saveSettings({ clientRoles });
      setRolesError(null);
    } catch (err) {
      setRolesError(err instanceof ApiError ? err.message : "Unable to remove that role.");
      void load();
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

      <form
        onSubmit={submitJourney}
        data-testid="journey-settings"
        className="mt-4 rounded border border-hud-line bg-hud-panel/60 p-4"
      >
        <h2 className="text-sm font-semibold">Journey and module introductions</h2>
        <p className="mt-1 text-[12px] text-hud-muted">
          What the client reads at the top of the Compliance Tracker and of each module page. Leave
          a field blank and the default shown beneath it is used.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <F label="Current stage of the journey">
            <select
              name="journeyPhase"
              defaultValue={settings.journeyPhase ?? ""}
              className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            >
              <option value="">Derive from tasks (the phase with the earliest open due date)</option>
              {PHASES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id}. {p.name}
                </option>
              ))}
            </select>
          </F>
          <F label="Sentence beneath the stage">
            <textarea
              name="journeyNote"
              rows={3}
              maxLength={300}
              defaultValue={settings.journeyNote ?? ""}
              className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            />
            <span className="mt-1 block text-[11px] text-hud-muted">Default: {DEFAULT_JOURNEY_NOTE}</span>
          </F>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {AREAS.map((a) => (
            <F key={a.id} label={`${a.id}. ${a.name}`}>
              <textarea
                name={`intro-${a.id}`}
                rows={3}
                maxLength={600}
                defaultValue={settings.moduleIntroductions?.[String(a.id)] ?? ""}
                className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
              />
              <span className="mt-1 block text-[11px] text-hud-muted">
                Default: {DEFAULT_MODULE_INTRODUCTIONS[a.id]}
              </span>
            </F>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            className="rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90"
          >
            Save journey and introductions
          </button>
          {journeySaved && <span className="text-[12px] text-status-green">Saved</span>}
        </div>
        {journeyError && (
          <p className="mt-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
            {journeyError}
          </p>
        )}
      </form>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <form onSubmit={submitTracker} className="rounded border border-hud-line bg-hud-panel/60 p-4">
          <h2 className="text-sm font-semibold">Compliance Tracker</h2>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <F label="Jurisdiction">
              <select
                name="jurisdiction"
                defaultValue={settings.jurisdiction}
                className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
              >
                {JURISDICTION_OPTS.map((j) => (
                  <option key={j} value={j}>
                    {JURISDICTION_LABEL[j]}
                  </option>
                ))}
              </select>
            </F>
            <p className="-mt-1 text-[12px] text-hud-muted">
              Only the United Kingdom has task and obligation content in this version.
            </p>
            <F label="Staff in scope for training">
              <input
                name="staffInScope"
                type="number"
                min="0"
                step="1"
                defaultValue={settings.staffInScope ?? ""}
                placeholder="blank means not recorded"
              />
            </F>
            <F label="Staff trained">
              <input
                name="staffTrained"
                type="number"
                min="0"
                step="1"
                defaultValue={settings.staffTrained ?? ""}
                placeholder="blank means not recorded"
              />
            </F>
            <p className="-mt-1 text-[12px] text-hud-muted">
              Kept for your record. Since v1.3 the client's tracker no longer shows a training
              figure.
            </p>
            <F label="Workplan target date, shown on the client's empty portal">
              <input
                name="workplanTargetDate"
                type="date"
                defaultValue={settings.workplanTargetDate ?? ""}
              />
            </F>
            <F label="Documents target date, shown to the client while a documents section is still empty">
              <input
                name="documentsTargetDate"
                type="date"
                defaultValue={settings.documentsTargetDate ?? ""}
              />
            </F>
            <div className="text-[13px]">
              <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">
                How obligations are counted
              </span>
              <div className="space-y-2" data-testid="denominator-mode">
                <label className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="denominatorMode"
                    value="overdue"
                    defaultChecked={settings.denominatorMode !== "cycle"}
                    className="mt-0.5"
                  />
                  <span className="font-medium">Overdue only (what the client sees)</span>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="denominatorMode"
                    value="cycle"
                    defaultChecked={settings.denominatorMode === "cycle"}
                    className="mt-0.5"
                  />
                  <span className="font-medium">Signed off this cycle (stricter, operator view)</span>
                </label>
              </div>
              <p className="mt-1.5 text-[12px] text-hud-muted">
                In "Overdue only", a continuous duty counts only when something live is running
                against it. In "Signed off this cycle", every continuous duty counts until it has
                been signed off for the period.
              </p>
              <p className="mt-1.5 text-[12px] text-status-red">
                This is not a cosmetic setting: it changes your own view here in admin. It does not
                change the figure the client sees on their Compliance Tracker home or on the CFO
                statement, which always uses "Overdue only".
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="submit"
              className="rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90"
            >
              Save Compliance Tracker settings
            </button>
            {trackerSaved && <span className="text-[12px] text-status-green">Saved</span>}
          </div>
          {trackerError && (
            <p className="mt-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
              {trackerError}
            </p>
          )}
        </form>

        <div className="rounded border border-hud-line bg-hud-panel/60 p-4">
          <h2 className="text-sm font-semibold">Client roles</h2>
          <p className="mt-1 text-[12px] text-hud-muted">
            The roles a task can be assigned to on the client side, offered in the workplan's owner
            role field.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="e.g. Facilities"
              className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            />
            <button
              type="button"
              onClick={() => void addRole()}
              className="shrink-0 rounded border border-hud-line px-3 py-1.5 text-[13px] hover:bg-hud-bg"
            >
              Add
            </button>
          </div>
          {settings.clientRoles.length === 0 && (
            <p className="mt-2 text-[13px] text-hud-muted">No client roles set.</p>
          )}
          {settings.clientRoles.length > 0 && (
            <ul className="mt-2 space-y-1 text-[13px]">
              {settings.clientRoles.map((r, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 rounded border border-hud-line px-2 py-1"
                >
                  {r}
                  <button
                    type="button"
                    onClick={() => void removeRole(i)}
                    className="shrink-0 text-[12px] text-status-red hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          {rolesError && (
            <p className="mt-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
              {rolesError}
            </p>
          )}
        </div>
      </div>

      {selectedAccountId && (
        <RetentionScheduleEditor
          orgId={selectedAccountId}
          schedule={settings.retentionSchedule}
          onSaved={(next) => setSettings({ ...settings, retentionSchedule: next })}
        />
      )}

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

import type { AlertState } from "@maximus/shared";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { DemoBadge } from "../../components/DemoBadge";
import { api, ApiError } from "../../lib/api";
import { formatLondon } from "../../lib/format";
import { useAdmin } from "../../store/admin";

interface ExposureAlert {
  id: string;
  kind: string;
  severity: string;
  summary: string;
  state: AlertState;
  officerNote: string | null;
  isDemo: boolean;
  createdAt: string;
}

const severityColour: Record<string, string> = {
  critical: "border-status-red text-status-red",
  high: "border-status-red/70 text-status-red",
  medium: "border-status-amber text-status-amber",
  low: "border-hud-accent/60 text-hud-accent",
  info: "border-hud-muted text-hud-muted",
};

export function AdminAlertsPage() {
  const { selectedAccountId } = useAdmin();
  const [alerts, setAlerts] = useState<ExposureAlert[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [triaging, setTriaging] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const res = await api<{ alerts: ExposureAlert[] }>(
        `/admin/exposure?accountId=${selectedAccountId}`,
      );
      setAlerts(res.alerts);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load alerts.");
    }
  }, [selectedAccountId]);

  useEffect(() => {
    setAlerts(null);
    void load();
  }, [load]);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Alert triage</h1>
          <p className="mt-0.5 text-[13px] text-hud-muted">
            Demo alerts only in beta - every item is synthetic and labelled for the client.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="shrink-0 rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90"
        >
          Create demo alert
        </button>
      </div>
      <div className="mt-1.5 h-px w-12 bg-hud-gold/60" />

      {error && (
        <p className="mt-4 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}
      {!alerts && !error && <p className="mt-4 text-[13px] text-hud-muted">Loading…</p>}
      {alerts && alerts.length === 0 && (
        <p className="mt-4 text-[13px] text-hud-muted">No exposure alerts for this account.</p>
      )}

      <ul className="mt-5 space-y-3">
        {alerts?.map((a) => (
          <li key={a.id} className="rounded border border-hud-line bg-hud-panel/60 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <DemoBadge />
              <span
                className={`rounded border px-2 py-0.5 text-[11px] font-medium uppercase ${severityColour[a.severity] ?? severityColour.info}`}
              >
                {a.severity}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-hud-muted">
                {a.kind.replace(/_/g, " ")}
              </span>
              <span className="ml-auto text-[11px] text-hud-muted">{a.state}</span>
            </div>
            <p className="mt-2 text-[13px]">{a.summary}</p>
            {a.officerNote && (
              <p className="mt-2 text-[12px] text-hud-muted">Note: {a.officerNote}</p>
            )}
            <p className="mt-1 text-[11px] text-hud-muted">{formatLondon(a.createdAt)}</p>

            {triaging === a.id ? (
              <TriageForm
                alertId={a.id}
                currentState={a.state}
                onCancel={() => setTriaging(null)}
                onSaved={async () => {
                  setTriaging(null);
                  await load();
                }}
              />
            ) : (
              <button
                onClick={() => setTriaging(a.id)}
                className="mt-3 rounded border border-hud-gold px-3 py-1 text-[12px] text-hud-gold hover:bg-hud-gold hover:text-hud-bg"
              >
                Update state
              </button>
            )}
          </li>
        ))}
      </ul>

      {showCreate && selectedAccountId && (
        <CreateDemoAlertModal
          accountId={selectedAccountId}
          onClose={() => setShowCreate(false)}
          onCreated={async () => {
            setShowCreate(false);
            await load();
          }}
        />
      )}
    </div>
  );
}

function TriageForm({
  alertId,
  currentState,
  onCancel,
  onSaved,
}: {
  alertId: string;
  currentState: AlertState;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [state, setState] = useState<AlertState>(currentState);
  const [officerNote, setOfficerNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(`/admin/exposure/${alertId}/state`, {
        method: "PUT",
        body: JSON.stringify({ state, officerNote }),
      });
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update the alert.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 rounded border border-hud-line bg-hud-bg/40 p-3">
      <label className="block text-[12px] uppercase tracking-wider text-hud-muted">State</label>
      <select
        value={state}
        onChange={(e) => setState(e.target.value as AlertState)}
        className="mt-1 rounded border border-hud-line bg-hud-bg px-2 py-1 text-[13px]"
      >
        <option value="new">New</option>
        <option value="triaged">Triaged</option>
        <option value="actioned">Actioned</option>
        <option value="dismissed">Dismissed</option>
      </select>
      <label className="mt-2 block text-[12px] uppercase tracking-wider text-hud-muted">
        Note for client (required)
      </label>
      <textarea
        value={officerNote}
        onChange={(e) => setOfficerNote(e.target.value)}
        required
        rows={2}
        placeholder="e.g. Credentials rotated; no tenant data accessed."
        className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-2 py-1 text-[13px]"
      />
      {error && (
        <p className="mt-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="text-[13px] text-hud-muted">
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy || officerNote.trim().length === 0}
          className="rounded bg-hud-accent px-3 py-1 text-[13px] text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

function CreateDemoAlertModal({
  accountId,
  onClose,
  onCreated,
}: {
  accountId: string;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [kind, setKind] = useState("credential_exposure");
  const [severity, setSeverity] = useState("medium");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/admin/exposure", {
        method: "POST",
        body: JSON.stringify({ clientAccountId: accountId, kind, severity, summary }),
      });
      await onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create the alert.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded border border-hud-line bg-hud-panel p-6"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">Create demo alert</h2>
          <DemoBadge />
        </div>
        <p className="mt-1 text-[12px] text-hud-muted">
          Always marked as demo data - cannot be presented as live monitoring.
        </p>

        <label className="mt-4 block text-[13px] text-hud-muted">Kind</label>
        <input
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          required
          className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-3 py-2 text-[13px]"
        />

        <label className="mt-3 block text-[13px] text-hud-muted">Severity</label>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-3 py-2 text-[13px]"
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>

        <label className="mt-3 block text-[13px] text-hud-muted">Summary</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
          rows={3}
          className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-3 py-2 text-[13px]"
        />

        {error && (
          <p className="mt-3 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="text-[13px] text-hud-muted">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-hud-accent px-4 py-2 text-[13px] font-medium text-white disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

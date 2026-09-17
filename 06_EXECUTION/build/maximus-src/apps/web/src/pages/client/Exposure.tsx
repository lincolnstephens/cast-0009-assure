import type { AlertState } from "@maximus/shared";
import { useCallback, useEffect, useState } from "react";
import { DemoBadge } from "../../components/DemoBadge";
import { api, ApiError } from "../../lib/api";
import { formatLondon } from "../../lib/format";

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
  low: "border-client-accent/60 text-client-accent",
  info: "border-client-line text-client-muted",
};

const stateLabel: Record<AlertState, string> = {
  new: "New",
  triaged: "Triaged",
  actioned: "Actioned",
  dismissed: "Dismissed",
};

function kindLabel(kind: string) {
  return kind.replace(/_/g, " ");
}

export function ExposurePage() {
  const [alerts, setAlerts] = useState<ExposureAlert[] | null>(null);
  const [officerName, setOfficerName] = useState("your compliance officer");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api<{ alerts: ExposureAlert[]; officerName: string }>("/exposure");
      setAlerts(res.alerts);
      setOfficerName(res.officerName);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load exposure alerts.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-lg font-semibold">Exposure</h1>
      <p className="mt-0.5 text-sm text-client-muted">
        Items your compliance officer has reviewed. Alerts marked as demo data are
        simulations for training - not live monitoring.
      </p>
      <div className="mt-1.5 h-px w-12 bg-client-line" />

      {error && (
        <p className="mt-4 border-l-2 border-status-red pl-3 text-sm text-status-red" role="alert">
          {error}
        </p>
      )}
      {!alerts && !error && <p className="mt-4 text-sm text-client-muted">Loading…</p>}
      {alerts?.length === 0 && (
        <p className="mt-4 text-sm text-client-muted">No exposure alerts on record.</p>
      )}

      <ul className="mt-5 space-y-3">
        {alerts?.map((a) => (
          <li
            key={a.id}
            className="rounded border border-client-line bg-client-surface p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              {a.isDemo && <DemoBadge />}
              <span
                className={`rounded border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${severityColour[a.severity] ?? severityColour.info}`}
              >
                {a.severity}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-client-muted">
                {kindLabel(a.kind)}
              </span>
              <span className="ml-auto text-[11px] text-client-muted">{stateLabel[a.state]}</span>
            </div>
            <p className="mt-2 text-sm">{a.summary}</p>
            {a.officerNote && a.state !== "new" && (
              <p className="mt-2 border-l-2 border-client-line pl-3 text-[13px] text-client-muted">
                <span className="font-medium text-client-muted">
                  {a.state === "triaged"
                    ? `Triaged by ${officerName}:`
                    : a.state === "actioned"
                      ? `Actioned by ${officerName}:`
                      : `Dismissed by ${officerName}:`}
                </span>{" "}
                {a.officerNote}
              </p>
            )}
            <p className="mt-2 text-[11px] text-client-muted">{formatLondon(a.createdAt)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

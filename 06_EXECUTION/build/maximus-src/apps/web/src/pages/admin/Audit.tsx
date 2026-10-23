import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../../lib/api";
import { formatLondon } from "../../lib/format";
import { useAdmin } from "../../store/admin";

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  detail: Record<string, unknown> | null;
  createdAt: string;
  actorName: string | null;
}

export function AdminAuditPage() {
  const { selectedAccountId } = useAdmin();
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const load = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const params = new URLSearchParams({ accountId: selectedAccountId });
      if (actionFilter) params.set("action", actionFilter);
      if (entityFilter) params.set("entity", entityFilter);
      const res = await api<{ entries: AuditEntry[] }>(`/admin/audit?${params}`);
      setEntries(res.entries);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load the audit log.");
    }
  }, [selectedAccountId, actionFilter, entityFilter]);

  useEffect(() => {
    setEntries(null);
    void load();
  }, [load]);

  async function downloadCsv() {
    if (!selectedAccountId) return;
    const params = new URLSearchParams({ accountId: selectedAccountId });
    if (actionFilter) params.set("action", actionFilter);
    if (entityFilter) params.set("entity", entityFilter);
    const res = await fetch(`/api/admin/audit/export.csv?${params}`, { credentials: "same-origin" });
    if (!res.ok) {
      setError("Unable to export the audit log. Please try again.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Audit log</h1>
          <p className="mt-0.5 text-[13px] text-hud-muted">
            Append-only record of state changes for the selected account. Filter and export as
            CSV.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void downloadCsv()}
          disabled={!selectedAccountId}
          className="rounded border border-hud-accent px-3 py-1.5 text-[13px] text-hud-accent hover:bg-hud-accent hover:text-white disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>
      <div className="mt-1.5 h-px w-12 bg-hud-gold/60" />

      <div className="mt-4 flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-[13px] text-hud-muted">
          Action
          <input
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            placeholder="e.g. posture.update"
            className="rounded border border-hud-line bg-hud-bg px-2 py-1 text-[13px] outline-none focus:border-hud-accent"
          />
        </label>
        <label className="flex items-center gap-2 text-[13px] text-hud-muted">
          Entity
          <input
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            placeholder="e.g. clock"
            className="rounded border border-hud-line bg-hud-bg px-2 py-1 text-[13px] outline-none focus:border-hud-accent"
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}
      {!entries && !error && <p className="mt-4 text-[13px] text-hud-muted">Loading…</p>}

      {entries && entries.length === 0 && (
        <p className="mt-4 text-[13px] text-hud-muted">No audit entries match these filters.</p>
      )}

      <div className="mt-4 overflow-x-auto rounded border border-hud-line">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead className="border-b border-hud-line bg-hud-panel/60 text-[11px] uppercase tracking-wider text-hud-muted">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Entity</th>
              <th className="px-3 py-2">Actor</th>
              <th className="px-3 py-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {entries?.map((row) => (
              <tr key={row.id} className="border-b border-hud-line/50">
                <td className="whitespace-nowrap px-3 py-2 text-hud-muted">
                  {formatLondon(row.createdAt)}
                </td>
                <td className="px-3 py-2 font-mono text-[12px]">{row.action}</td>
                <td className="px-3 py-2">
                  {row.entity}
                  {row.entityId && (
                    <span className="ml-1 font-mono text-[11px] text-hud-muted">
                      {row.entityId.slice(0, 8)}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">{row.actorName ?? " - "}</td>
                <td className="max-w-xs truncate px-3 py-2 font-mono text-[11px] text-hud-muted">
                  {row.detail ? JSON.stringify(row.detail) : " - "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

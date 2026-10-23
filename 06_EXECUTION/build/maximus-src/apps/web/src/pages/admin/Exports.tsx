import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../../lib/api";
import { formatLondon } from "../../lib/format";
import { useAdmin } from "../../store/admin";

interface ExportRow {
  id: string;
  state: string;
  createdAt: string;
  generatedAt: string | null;
  downloadable: boolean;
}

export function AdminExportsPage() {
  const { selectedAccountId } = useAdmin();
  const [rows, setRows] = useState<ExportRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const res = await api<{ exports: ExportRow[] }>(
        `/admin/exports?accountId=${selectedAccountId}`,
      );
      setRows(res.exports);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load exports.");
    }
  }, [selectedAccountId]);

  useEffect(() => {
    setRows(null);
    void load();
    const timer = setInterval(() => void load(), 12_000);
    return () => clearInterval(timer);
  }, [load]);

  async function download(id: string) {
    const res = await fetch(`/api/exports/${id}/download`, { credentials: "same-origin" });
    if (!res.ok) {
      setError("Unable to download that export. Please try again.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `defence-file-${id.slice(0, 8)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-semibold">Exports</h1>
      <p className="mt-0.5 text-[13px] text-hud-muted">
        Defence-file requests for the selected account. Approve pending requests from the
        review queue; downloads appear here once generated.
      </p>
      <div className="mt-1.5 h-px w-12 bg-hud-gold/60" />

      {error && (
        <p className="mt-4 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}
      {!rows && !error && <p className="mt-4 text-[13px] text-hud-muted">Loading…</p>}

      <div className="mt-5 space-y-2">
        {rows?.map((row) => (
          <div
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded border border-hud-line bg-hud-panel/60 px-4 py-3 text-[13px]"
          >
            <div>
              <p>
                <span className="uppercase tracking-wide text-hud-muted">{row.state}</span>
                {" · "}
                requested {formatLondon(row.createdAt)}
              </p>
              {row.generatedAt && (
                <p className="mt-0.5 text-hud-muted">Generated {formatLondon(row.generatedAt)}</p>
              )}
            </div>
            {row.downloadable && (
              <button
                type="button"
                onClick={() => void download(row.id)}
                className="rounded bg-hud-accent px-3 py-1.5 text-[12px] font-medium text-white hover:bg-hud-accent/90"
              >
                Download zip
              </button>
            )}
          </div>
        ))}
        {rows?.length === 0 && (
          <p className="text-[13px] text-hud-muted">No export requests for this account.</p>
        )}
      </div>
    </div>
  );
}

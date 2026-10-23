import type { PostureDomain, RagStatus } from "@maximus/shared";
import { postureDomainLabel } from "@maximus/shared";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Sparkline } from "../../components/Sparkline";
import { StatusLamp } from "../../components/StatusLamp";
import { api, ApiError } from "../../lib/api";
import { formatLondon } from "../../lib/format";
import { useAdmin } from "../../store/admin";

interface PostureRow {
  id: string;
  domain: PostureDomain;
  status: RagStatus;
  note: string;
  updatedAt: string;
  verifiedBy: string | null;
  history: { status: RagStatus; recordedAt: string }[];
}

const domainOrder: PostureDomain[] = [
  "policies",
  "training",
  "access_reviews",
  "retention",
  "ropa",
];

export function AdminPosturePage() {
  const { selectedAccountId } = useAdmin();
  const [domains, setDomains] = useState<PostureRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const res = await api<{ domains: PostureRow[] }>(
        `/admin/posture?accountId=${selectedAccountId}`,
      );
      const sorted = [...res.domains].sort(
        (a, b) => domainOrder.indexOf(a.domain) - domainOrder.indexOf(b.domain),
      );
      setDomains(sorted);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load posture.");
    }
  }, [selectedAccountId]);

  useEffect(() => {
    setDomains(null);
    void load();
  }, [load]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-semibold">Posture control</h1>
      <p className="mt-0.5 text-[13px] text-hud-muted">
        Set each domain's status and note. Every change is logged and appears in the
        client's 12-week trend.
      </p>
      <div className="mt-1.5 h-px w-12 bg-hud-gold/60" />

      {error && (
        <p className="mt-4 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}
      {!domains && !error && <p className="mt-4 text-[13px] text-hud-muted">Loading…</p>}
      {domains && domains.length === 0 && (
        <p className="mt-4 text-[13px] text-hud-muted">No posture domains for this account.</p>
      )}

      <div className="mt-5 space-y-4">
        {domains?.map((d) =>
          editing === d.id ? (
            <EditPostureForm
              key={d.id}
              domain={d}
              onCancel={() => setEditing(null)}
              onSaved={async () => {
                setEditing(null);
                await load();
              }}
            />
          ) : (
            <article
              key={d.id}
              className="rounded border border-hud-line bg-hud-panel/60 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">{postureDomainLabel[d.domain]}</h2>
                  <StatusLamp status={d.status} />
                </div>
                <button
                  onClick={() => setEditing(d.id)}
                  className="rounded border border-hud-accent px-3 py-1 text-[13px] text-hud-accent hover:bg-hud-accent hover:text-white"
                >
                  Update
                </button>
              </div>
              <p className="mt-2 text-[13px] text-hud-muted">{d.note}</p>
              <div className="mt-3 flex items-end justify-between border-t border-hud-line/60 pt-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-hud-muted">
                    12-week trend
                  </p>
                  <div className="mt-1">
                    <Sparkline history={d.history} />
                  </div>
                </div>
                <p className="text-right text-[11px] text-hud-muted">
                  {formatLondon(d.updatedAt)}
                  {d.verifiedBy ? ` · ${d.verifiedBy}` : ""}
                </p>
              </div>
            </article>
          ),
        )}
      </div>
    </div>
  );
}

function EditPostureForm({
  domain,
  onCancel,
  onSaved,
}: {
  domain: PostureRow;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [status, setStatus] = useState<RagStatus>(domain.status);
  const [note, setNote] = useState(domain.note);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(`/admin/posture/${domain.id}`, {
        method: "PUT",
        body: JSON.stringify({ status, note }),
      });
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save the change.");
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded border border-hud-accent/60 bg-hud-panel/60 p-4"
    >
      <h2 className="text-sm font-semibold">{postureDomainLabel[domain.domain]}</h2>
      <label className="mt-3 block text-[12px] uppercase tracking-wider text-hud-muted">
        Status
      </label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as RagStatus)}
        className="mt-1 rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px] outline-none focus:border-hud-accent"
      >
        <option value="green">Green</option>
        <option value="amber">Amber</option>
        <option value="red">Red</option>
      </select>
      <label className="mt-3 block text-[12px] uppercase tracking-wider text-hud-muted">
        Note (required)
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        required
        rows={3}
        className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px] outline-none focus:border-hud-accent"
      />
      {error && (
        <p className="mt-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1 text-[13px] text-hud-muted">
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy || note.trim().length === 0}
          className="rounded bg-hud-accent px-4 py-1.5 text-[13px] font-medium text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save change"}
        </button>
      </div>
    </form>
  );
}

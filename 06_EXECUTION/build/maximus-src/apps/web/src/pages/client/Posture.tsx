import type { PostureDomain, RagStatus } from "@maximus/shared";
import { postureDomainLabel } from "@maximus/shared";
import { useCallback, useEffect, useState } from "react";
import { Sparkline } from "../../components/Sparkline";
import { StatusLamp } from "../../components/StatusLamp";
import { api, ApiError } from "../../lib/api";
import { formatLondon } from "../../lib/format";

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

export function PosturePage() {
  const [domains, setDomains] = useState<PostureRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api<{ domains: PostureRow[] }>("/posture");
      const sorted = [...res.domains].sort(
        (a, b) => domainOrder.indexOf(a.domain) - domainOrder.indexOf(b.domain),
      );
      setDomains(sorted);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load posture.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-semibold">Posture</h1>
      <p className="mt-0.5 text-sm text-client-muted">
        How your organisation is doing across five compliance domains - set and verified
        by your compliance officer.
      </p>
      <div className="mt-1.5 h-px w-12 bg-client-line" />

      {error && (
        <p className="mt-4 border-l-2 border-status-red pl-3 text-sm text-status-red" role="alert">
          {error}
        </p>
      )}
      {!domains && !error && <p className="mt-4 text-sm text-client-muted">Loading…</p>}
      {domains && domains.length === 0 && (
        <p className="mt-4 text-sm text-client-muted">No posture domains have been set yet.</p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {domains?.map((d) => (
          <article
            key={d.id}
            className="rounded border border-client-line bg-client-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-semibold">{postureDomainLabel[d.domain]}</h2>
              <StatusLamp status={d.status} />
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-client-muted">{d.note}</p>
            <div className="mt-3 flex items-end justify-between gap-3 border-t border-client-line pt-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-client-muted">
                  12-week trend
                </p>
                <div className="mt-1">
                  <Sparkline history={d.history} />
                </div>
              </div>
              <p className="text-right text-[11px] text-client-muted">
                {formatLondon(d.updatedAt)}
                <br />
                {d.verifiedBy ? `verified by ${d.verifiedBy}` : "awaiting verification"}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

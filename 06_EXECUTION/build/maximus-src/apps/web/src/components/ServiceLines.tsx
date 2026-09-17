import type { ServiceLineView } from "@maximus/shared";

const STATUS_COLOUR: Record<ServiceLineView["status"], string> = {
  Live: "bg-status-green",
  Recommended: "bg-status-amber",
  Available: "bg-client-muted",
  "Not in scope": "bg-client-line",
};

/**
 * The twelve service lines, in the order the API returns them (already
 * priority order): rank, name, the reason, status, hours per instance and
 * the count on record.
 */
export function ServiceLines({ lines }: { lines: ServiceLineView[] }) {
  return (
    <div className="divide-y divide-client-line rounded border border-client-line bg-client-surface">
      {lines.map((l, i) => (
        <div key={l.id} className="grid grid-cols-[40px_1fr] gap-3 p-3 sm:grid-cols-[40px_1fr_140px_120px_120px]">
          <div className="font-mono text-xl text-client-muted">{String(i + 1).padStart(2, "0")}</div>
          <div className="col-span-1 sm:col-span-1">
            <b>
              {l.id}. {l.name}
            </b>
            <div className="mt-1 max-w-[70ch] text-[13px] text-client-muted">{l.why}</div>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 font-mono text-[11px] sm:col-span-1">
            <i aria-hidden className={`inline-block h-2 w-2 rounded-full ${STATUS_COLOUR[l.status]}`} />
            {l.status}
          </div>
          <div className="col-span-1 font-mono text-[12px] text-client-muted">{l.hoursPer}h per instance</div>
          <div className="col-span-1 font-mono text-[12px] text-client-muted">
            {l.onRecord} on record
            {l.deadline && (
              <>
                <br />
                statutory clock
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

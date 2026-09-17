import { Link } from "react-router-dom";
import type { AreaSummary } from "@maximus/shared";
import { formatDateGB } from "../../lib/format";
import { RagMark } from "./RagMark";

/**
 * The eight area tiles, in the order `home.areas` sends (area 1 to 8). Each
 * links through to its area page. The progress bar always carries the
 * fraction it draws beneath it - never the bar alone.
 */
export function AreaTiles({ areas }: { areas: AreaSummary[] }) {
  return (
    <section aria-label="Areas" data-testid="area-tiles">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
        Areas
      </p>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {areas.map((a) => {
          const pct = a.totalCount === 0 ? 0 : Math.round((a.doneCount / a.totalCount) * 100);
          return (
            <Link
              key={a.area}
              to={`/tracker/areas/${a.area}`}
              data-testid="area-tile"
              className="block rounded border border-client-line bg-client-surface p-4 hover:border-client-accent"
            >
              <div className="text-[13px] font-medium leading-snug text-client-text">{a.name}</div>
              <div className="mt-2">
                <RagMark rag={a.rag} label={a.ragLabel} />
              </div>
              <div className="mt-2 text-[12px] text-client-muted">
                {a.nextTaskTitle ? (
                  <>
                    Next: {a.nextOwner ?? "Unassigned"}
                    {a.nextDueAt ? `, due ${formatDateGB(a.nextDueAt)}` : ", no date"}
                  </>
                ) : (
                  "Nothing open"
                )}
              </div>
              <div className="mt-1 font-mono text-[12px] text-client-muted">
                {a.openCount} open, {a.doneCount} of {a.totalCount} done
              </div>
              <div className="mt-2">
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-client-line"
                  role="img"
                  aria-label={`${a.doneCount} of ${a.totalCount} done this cycle`}
                >
                  <div className="h-1.5 rounded-full bg-client-accent" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 font-mono text-[11px] text-client-muted">
                  {a.doneCount} of {a.totalCount} done
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

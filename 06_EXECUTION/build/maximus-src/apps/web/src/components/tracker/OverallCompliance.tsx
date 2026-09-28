import { Link } from "react-router-dom";
import type { AreaSummary, OverallStatus, Rag } from "@maximus/shared";
import { formatDateGB } from "../../lib/format";

/**
 * The score, then the eight modules as tiles filled with their RAG colour.
 *
 * The percentage and its fraction are one string in one element, so they can
 * never be separated. The tile fill is the status ramp and nothing else; the
 * RAG label is written on the tile as well, so colour never carries the
 * meaning on its own.
 */
const TILE_FILL: Record<Rag, string> = {
  green: "bg-status-green",
  amber: "bg-status-amber",
  red: "bg-status-red",
  grey: "bg-client-muted",
};

export const OVERALL_EXPLAINER =
  "There are eight compliance modules under the data protection function. The score reflects their overall status. Open a module to see its tasks, documents and status.";

export function OverallCompliance({
  overall,
  areas,
}: {
  overall: OverallStatus;
  areas: AreaSummary[];
}) {
  const clear = overall.standing === "Nothing overdue";
  const score =
    overall.m === 0
      ? "Compliance score: nothing has fallen due yet"
      : `Compliance score: ${overall.pct}% (${overall.n} of ${overall.m} obligations met)`;

  return (
    <section aria-labelledby="overall-heading" data-testid="tracker-overall">
      <h2 id="overall-heading" className="text-base font-semibold">
        Overall compliance status
      </h2>
      <div className="mt-2 rounded border border-client-line bg-client-surface p-5">
        <p data-testid="overall-sentence" className="text-xl font-semibold text-client-text">
          {score}
        </p>
        <p data-testid="overall-asat" className="mt-0.5 text-[13px] text-client-muted">
          as at {formatDateGB(overall.asAt)}
        </p>
        <p data-testid="overall-basis" className="mt-1.5 max-w-[75ch] text-[12px] text-client-muted">
          {overall.basis}
        </p>
        <p
          data-testid="overall-standing"
          className={
            "mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold " +
            (clear ? "text-status-green" : "text-status-red")
          }
        >
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${clear ? "bg-status-green" : "bg-status-red"}`}
          />
          {overall.standing}
        </p>
      </div>

      <p data-testid="overall-explainer" className="mt-4 max-w-[75ch] text-[13px] text-client-muted">
        {OVERALL_EXPLAINER}
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {areas.map((a) => (
          <Link
            key={a.area}
            to={`/tracker/areas/${a.area}`}
            data-testid="module-tile"
            data-rag={a.rag}
            className={`module-tile block rounded-lg p-4 text-white shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-client-text ${TILE_FILL[a.rag]}`}
          >
            <span data-testid="module-tile-name" className="block text-[15px] font-semibold leading-snug">
              {a.name}
            </span>{" "}
            <span data-testid="module-tile-count" className="mt-1.5 block font-mono text-[12px]">
              {a.doneCount} of {a.totalCount} done
            </span>{" "}
            <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider">
              {a.ragLabel}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

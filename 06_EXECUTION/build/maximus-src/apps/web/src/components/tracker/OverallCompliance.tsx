import { Link } from "react-router-dom";
import type { AreaSummary, OverallStatus, Rag } from "@maximus/shared";
import { formatDateGB } from "../../lib/format";

/**
 * The score, then the eight modules as tiles filled with their score's colour.
 *
 * v1.6 (FRAGO 06 3.6): the headline is the mean of the module scores with its
 * fraction, the modules that score green; each tile is filled with its module's
 * score colour and states the score. The overdue count stays beneath.
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

/**
 * Text on each fill, chosen by measured contrast (FRAGO 04 3.1, DC-42a): the
 * colour that clears 4.5:1 against that fill. Measured against the house
 * tokens, dark text (#1f2937) / white:
 *   green #2ee6a6  9.08 / 1.62  -> dark
 *   amber #f5a623  7.24 / 2.03  -> dark
 *   red   #d63a3a  3.16 / 4.64  -> white
 *   grey  #6b7280  3.04 / 4.83  -> white
 * The gate re-measures the rendered tiles, so a token change that breaks
 * this fails there rather than shipping.
 */
const TILE_TEXT: Record<Rag, string> = {
  green: "text-client-text",
  amber: "text-client-text",
  red: "text-white",
  grey: "text-white",
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
  const score = overall.score.sentence;

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
          {overall.score.basis}
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
            data-rag={a.score.rag}
            className={`module-tile block rounded-lg p-4 shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-client-text ${TILE_FILL[a.score.rag]} ${TILE_TEXT[a.score.rag]}`}
          >
            <span data-testid="module-tile-name" className="block text-[15px] font-semibold leading-snug">
              {a.name}
            </span>{" "}
            <span data-testid="module-tile-count" className="mt-1.5 block font-mono text-[12px]">
              {a.score.sentence}
            </span>{" "}
            <span data-testid="module-tile-label" className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider">
              {a.score.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

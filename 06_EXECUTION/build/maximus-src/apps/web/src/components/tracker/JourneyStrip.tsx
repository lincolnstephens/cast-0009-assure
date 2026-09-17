import type { PhaseSummary } from "@maximus/shared";
import { RagMark } from "./RagMark";

/**
 * The five-phase journey strip, in the order the API returns (phase id 1 to
 * 5). The phase holding the earliest open due date carries a plain "Current"
 * label in text - no icon implies activity the data does not show.
 */
export function JourneyStrip({ phases }: { phases: PhaseSummary[] }) {
  return (
    <section aria-label="Journey" data-testid="journey-strip">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
        Journey
      </p>
      <ol className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-5">
        {phases.map((p) => (
          <li
            key={p.phase}
            data-testid="journey-phase"
            className={`rounded border p-3 ${
              p.current
                ? "border-client-accent bg-client-accent/5"
                : "border-client-line bg-client-surface"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[13px] font-medium leading-snug text-client-text">
                {p.name}
              </span>
              {p.current && (
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-client-accent">
                  Current
                </span>
              )}
            </div>
            <div className="mt-2">
              <RagMark rag={p.rag} label={p.ragLabel} />
            </div>
            <div className="mt-2 font-mono text-[12px] text-client-muted">
              {p.open} open &middot; {p.done} done
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

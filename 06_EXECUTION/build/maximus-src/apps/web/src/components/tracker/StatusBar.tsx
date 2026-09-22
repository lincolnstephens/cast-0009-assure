import type { OverallStatus } from "@maximus/shared";
import { RAG_LABEL } from "@maximus/shared";
import { RagMark } from "./RagMark";

/**
 * The one figure Rich wants. `overall.sentence` already contains the
 * fraction, the percentage and the date - it is rendered exactly as sent and
 * never reformatted, and the percentage never appears without the fraction
 * beside it. Beneath it, `overall.standing` says in one phrase whether the
 * reader can move on or needs to look, because a fraction alone does not say
 * that. The basis sits beneath both, then the RAG position of every area.
 */
export function StatusBar({ overall }: { overall: OverallStatus }) {
  const ragOrder: (keyof OverallStatus["ragCounts"])[] = ["red", "amber", "green", "grey"];
  // "Nothing overdue" is the only clear reading; anything else, including
  // "0 overdue or blocked" should that ever occur, reads as a call to look.
  const clear = overall.standing === "Nothing overdue";

  return (
    <section
      data-testid="overall-status"
      className="rounded border border-client-line bg-client-surface p-5"
      aria-label="Overall status"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
        Overall status
      </p>
      <p
        data-testid="overall-sentence"
        className="mt-1 text-xl font-semibold text-client-text"
        title={overall.basis}
      >
        {overall.sentence}
      </p>
      <p
        data-testid="overall-standing"
        className={
          "mt-1.5 inline-flex items-center gap-1.5 text-[14px] font-semibold " +
          (clear ? "text-status-green" : "text-status-red")
        }
      >
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${clear ? "bg-status-green" : "bg-status-red"}`}
        />
        {overall.standing}
      </p>
      <p className="mt-1.5 text-[12px] text-client-muted">{overall.basis}</p>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
        Areas by status
      </p>
      <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-client-muted">
        {ragOrder.map((r) => (
          <span key={r} className="font-mono">
            {overall.ragCounts[r]} {RAG_LABEL[r].toLowerCase()}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-4">
        {overall.byArea.map((a) => (
          <div key={a.area} className="flex items-center justify-between gap-2 text-[13px]">
            <span className="min-w-0 truncate text-client-text">{a.name}</span>
            <RagMark rag={a.rag} label={a.ragLabel} />
          </div>
        ))}
      </div>
    </section>
  );
}

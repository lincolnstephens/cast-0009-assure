import type { Rag } from "@maximus/shared";

const DOT: Record<Rag, string> = {
  green: "bg-status-green",
  amber: "bg-status-amber",
  red: "bg-status-red",
  // There is no house "grey" status colour; a nothing-to-do mark uses the
  // muted client token rather than inventing a new one.
  grey: "bg-client-muted",
};

/**
 * A RAG mark. Colour never carries meaning on its own - the label from
 * RAG_LABEL renders as text in the DOM next to the dot, not only in a
 * `title` attribute.
 *
 * v1.9 (FRAGO 09 3.3): a task's status is marked by StatusMark, never by
 * this. A RagMark marks a module or a score only, and carries
 * data-testid="rag-mark" so the gate can prove none sits in a task row.
 */
export function RagMark({
  rag,
  label,
  className = "",
}: {
  rag: Rag;
  label: string;
  className?: string;
}) {
  return (
    <span
      data-testid="rag-mark"
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-client-muted ${className}`}
    >
      <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[rag]}`} />
      {label}
    </span>
  );
}

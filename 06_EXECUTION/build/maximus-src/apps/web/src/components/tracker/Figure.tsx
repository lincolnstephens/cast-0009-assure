/**
 * A figure that always carries its basis, and its period when it has one.
 * The basis renders beneath the value so it is visible without hovering; the
 * full sentence also sits in `title` for a hover tooltip. "No data yet" is a
 * distinct styled state, never a blank space and never an invented number -
 * the caller sets `noData` and still passes the basis it will use.
 */
export function Figure({
  label,
  value,
  basis,
  period = "",
  noData = false,
  size = "md",
}: {
  label: string;
  value: string;
  basis: string;
  period?: string;
  noData?: boolean;
  size?: "md" | "lg";
}) {
  const hoverText = period ? `${basis} (${period})` : basis;

  return (
    <div
      data-testid="kpi-tile"
      data-figure="figure-tile"
      data-no-data={noData ? "true" : "false"}
      title={hoverText}
      className={`rounded border p-4 ${
        noData
          ? "border-dashed border-client-line bg-client-bg"
          : "border-client-line bg-client-surface"
      }`}
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
        {label}
      </div>
      <div
        className={`mt-1.5 font-mono tabular-nums ${size === "lg" ? "text-2xl" : "text-lg"} ${
          noData ? "italic text-client-muted" : "text-client-text"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[12px] text-client-muted">
        {basis}
        {period ? ` · ${period}` : ""}
      </div>
    </div>
  );
}

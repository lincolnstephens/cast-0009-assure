import type { RagStatus } from "@maximus/shared";

const colours: Record<RagStatus, string> = {
  green: "bg-status-green",
  amber: "bg-status-amber",
  red: "bg-status-red",
};

const labels: Record<RagStatus, string> = {
  green: "ON TRACK",
  amber: "ATTENTION",
  red: "CRITICAL",
};

/** DEFCON-style square status lamp with label (spec §6, not a traffic-light circle). */
export function StatusLamp({ status, label }: { status: RagStatus; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[var(--color-client-muted,var(--color-hud-muted))]">
      <span aria-hidden className={`h-2.5 w-2.5 ${colours[status]}`} />
      {label ?? labels[status]}
    </span>
  );
}

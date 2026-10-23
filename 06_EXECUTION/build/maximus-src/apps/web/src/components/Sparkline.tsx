import type { RagStatus } from "@maximus/shared";

const level: Record<RagStatus, number> = { green: 2, amber: 1, red: 0 };
/** Severity colours, used for status only: the house status tokens, not decoration. */
const colour: Record<RagStatus, string> = {
  green: "var(--color-status-green)",
  amber: "var(--color-status-amber)",
  red: "var(--color-status-red)",
};

/** 12-week posture trend: reads history snapshots, not mutable state. */
export function Sparkline({ history }: { history: { status: RagStatus }[] }) {
  if (history.length === 0) {
    return (
      <span className="text-[11px] text-[var(--color-client-muted,var(--color-hud-muted))]">
        No trend data yet
      </span>
    );
  }

  const w = 120;
  const h = 28;
  const pad = 2;
  const step = history.length > 1 ? (w - pad * 2) / (history.length - 1) : 0;

  const points = history.map((p, i) => ({
    x: pad + i * step,
    y: pad + (h - pad * 2) * (1 - level[p.status] / 2),
    status: p.status,
  }));

  const line = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="block"
      aria-label="12-week posture trend"
    >
      <polyline
        fill="none"
        stroke="var(--color-client-accent, var(--color-hud-accent))"
        strokeWidth="1.5"
        strokeLinejoin="round"
        points={line}
      />
      {points.map((p, i) => (
        <rect
          key={i}
          x={p.x - 2}
          y={p.y - 2}
          width={4}
          height={4}
          fill={colour[p.status]}
        />
      ))}
    </svg>
  );
}

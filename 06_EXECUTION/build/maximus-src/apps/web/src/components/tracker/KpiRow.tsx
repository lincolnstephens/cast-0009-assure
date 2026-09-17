import type { Figure as FigureData } from "@maximus/shared";
import { Figure } from "./Figure";

interface KpiFigure extends FigureData {
  key: string;
  label: string;
}

/**
 * The six KPI tiles, in the order `home.kpis` sends. Each is a Figure: its
 * value, its basis and its period when it has one, or the styled "no data
 * yet" state. Nothing here is computed client-side.
 */
export function KpiRow({ kpis }: { kpis: KpiFigure[] }) {
  return (
    <section aria-label="Key figures" data-testid="kpi-row">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
        Key figures
      </p>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <Figure
            key={k.key}
            label={k.label}
            value={k.value}
            basis={k.basis}
            period={k.period}
            noData={k.noData}
          />
        ))}
      </div>
    </section>
  );
}

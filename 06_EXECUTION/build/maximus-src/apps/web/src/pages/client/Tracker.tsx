import { useCallback, useEffect, useState } from "react";
import type { TrackerHome } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { formatDateGB, formatLondon } from "../../lib/format";
import { AreaTiles } from "../../components/tracker/AreaTiles";
import { ForYouPanel } from "../../components/tracker/ForYouPanel";
import { JourneyStrip } from "../../components/tracker/JourneyStrip";
import { KpiRow } from "../../components/tracker/KpiRow";
import { ModuleNav } from "../../components/tracker/ModuleNav";
import { StatusBar } from "../../components/tracker/StatusBar";

/**
 * The Compliance Tracker home page. Every element on it derives from
 * `TrackerHome` as the API sends it - nothing here is decorated or
 * invented. When the operator has not applied a workplan yet, the page is a
 * single waiting card and nothing else.
 */
export function TrackerPage() {
  const [data, setData] = useState<TrackerHome | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api<TrackerHome>("/tracker/home"));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load the tracker.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <p className="border-l-2 border-status-red pl-3 text-sm text-status-red" role="alert">
        {error}
      </p>
    );
  }

  if (!data) {
    return <p className="text-sm text-client-muted">Loading…</p>;
  }

  if (data.empty) {
    return (
      <div className="max-w-xl">
        <div
          data-testid="tracker-empty"
          className="rounded border border-client-line bg-client-surface p-6"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
            Compliance Tracker
          </p>
          <h1 className="mt-1 text-lg font-semibold">{data.emptyMessage}</h1>
          <p className="mt-2 text-[13px] text-client-muted">
            {data.emptyTargetDate
              ? `Target date: ${formatDateGB(data.emptyTargetDate)}`
              : "No target date has been set yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8">
      <header data-testid="tracker-header">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
          {data.header.clientName}
        </p>
        <h1 className="text-lg font-semibold">{data.header.title}</h1>
        <p className="mt-0.5 text-[13px] text-client-muted">
          {data.header.jurisdiction} &middot; {data.header.regulation}
        </p>
        <p
          className="mt-1.5 text-[12px] text-client-muted"
          title={data.header.asAtBasis}
        >
          As at {formatLondon(data.header.asAt)}
          <span className="mx-1.5">&middot;</span>
          {data.header.asAtBasis}
        </p>
      </header>

      <StatusBar overall={data.overall} />

      <ModuleNav />

      <JourneyStrip phases={data.phases} />

      <KpiRow kpis={data.kpis} />

      <AreaTiles areas={data.areas} />

      <ForYouPanel tasks={data.forYou} emptyMessage={data.forYouEmptyMessage} />
    </div>
  );
}

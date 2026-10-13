import type { ModuleView } from "@maximus/shared";

const STATUS_COLOUR: Record<ModuleView["status"], string> = {
  Live: "bg-status-green",
  Recommended: "bg-status-amber",
  Available: "bg-client-muted",
  "Not in scope": "bg-client-line",
};

/**
 * The eight modules in module order: name, its one line, its status from
 * Settings and the count on the Record.
 */
export function ModuleStatus({ modules }: { modules: ModuleView[] }) {
  return (
    <div className="divide-y divide-client-line rounded border border-client-line bg-client-surface">
      {modules.map((m) => (
        <div
          key={m.id}
          data-testid="module-status-row"
          className="grid grid-cols-[40px_1fr] gap-3 p-3 sm:grid-cols-[40px_1fr_140px_120px]"
        >
          <div className="font-mono text-xl text-client-muted">{String(m.id).padStart(2, "0")}</div>
          <div>
            <b>{m.name}</b>
            <div className="mt-1 max-w-[70ch] text-[13px] text-client-muted">{m.introduction}</div>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 font-mono text-[11px] sm:col-span-1">
            <i aria-hidden className={`inline-block h-2 w-2 rounded-full ${STATUS_COLOUR[m.status]}`} />
            {m.status}
          </div>
          <div className="col-span-2 font-mono text-[12px] text-client-muted sm:col-span-1">{m.onRecord} on record</div>
        </div>
      ))}
    </div>
  );
}

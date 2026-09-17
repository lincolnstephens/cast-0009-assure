import { SPEND } from "@maximus/shared";

/** Where modest spend would improve the product. Reference data, not tenant data. */
export function SpendList() {
  return (
    <div className="divide-y divide-client-line rounded border border-client-line bg-client-surface">
      {SPEND.map((s, i) => (
        <div key={s.what} className="p-3">
          <b>
            {String(i + 1).padStart(2, "0")}. {s.what}
          </b>
          <div className="mt-1 flex flex-wrap gap-4 text-[13px]">
            <span className="font-mono text-client-accent">{s.cost}</span>
            <span className="text-client-muted">For: {s.who}</span>
          </div>
          <div className="mt-1 text-[13px] text-client-muted">{s.note}</div>
        </div>
      ))}
    </div>
  );
}

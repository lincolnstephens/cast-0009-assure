import type { UpcomingItem } from "@maximus/shared";

const monthYear = (iso: string): string =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/**
 * The next dated open tasks, soonest first, as the API sends them. The
 * operator puts an activity here by giving it a due date in the workplan;
 * there is no second list to keep.
 */
export function Upcoming({ items }: { items: UpcomingItem[] }) {
  return (
    <section aria-labelledby="upcoming-heading" data-testid="tracker-upcoming">
      <h2 id="upcoming-heading" className="text-base font-semibold">
        Upcoming
      </h2>
      <p className="mt-1 text-[13px] text-client-muted">Activities planned to roll out.</p>
      {items.length === 0 ? (
        <p
          data-testid="upcoming-empty"
          className="mt-2 rounded border border-client-line bg-client-surface p-4 text-[13px] text-client-muted"
        >
          Nothing scheduled yet.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-client-line rounded border border-client-line bg-client-surface">
          {items.map((i) => (
            <li key={i.id} data-testid="upcoming-item" className="px-4 py-3">
              <p className="text-[14px] text-client-text">
                {i.title.replace(/[.\s]+$/, "")}, {monthYear(i.dueAt)}
              </p>
              <p className="mt-0.5 text-[12px] text-client-muted">{i.areaName}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

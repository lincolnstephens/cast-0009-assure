import type { Journey } from "@maximus/shared";

/**
 * The journey as a path: five nodes on one line, left to right. Done is
 * green, current amber, future grey, from the house status tokens. The
 * current node also carries the word "Current", so colour never carries the
 * meaning on its own. On a phone the path turns to run top to bottom.
 */
const NODE_FILL: Record<Journey["nodes"][number]["state"], string> = {
  done: "bg-status-green border-status-green",
  current: "bg-status-amber border-status-amber",
  future: "bg-client-surface border-client-muted",
};

const STATE_LABEL: Record<Journey["nodes"][number]["state"], string> = {
  done: "Completed",
  current: "Current",
  future: "Not yet reached",
};

export function JourneyPath({ journey }: { journey: Journey }) {
  return (
    <section aria-labelledby="journey-heading" data-testid="tracker-journey">
      <h2 id="journey-heading" className="text-base font-semibold">
        Journey
      </h2>
      <p data-testid="journey-current" className="mt-1 text-[15px] text-client-text">
        Current stage:{" "}
        <span className="font-semibold">{journey.currentName ?? "not yet set"}</span>
      </p>
      <p data-testid="journey-note" className="mt-1 max-w-[75ch] text-[13px] text-client-muted">
        {journey.note}
      </p>

      <ol className="relative mt-5 grid grid-cols-1 gap-4 sm:grid-cols-5 sm:gap-2">
        {/* The line the nodes sit on. Decorative; the order of the list is the meaning. */}
        <span
          aria-hidden
          className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-client-line sm:left-[10%] sm:right-[10%] sm:top-[11px] sm:bottom-auto sm:h-0.5 sm:w-auto"
        />
        {journey.nodes.map((n) => (
          <li
            key={n.phase}
            data-testid="journey-node"
            data-state={n.state}
            aria-current={n.state === "current" ? "step" : undefined}
            className="relative flex items-center gap-3 sm:flex-col sm:gap-2 sm:text-center"
          >
            <span
              aria-hidden
              className={`h-6 w-6 shrink-0 rounded-full border-2 ${NODE_FILL[n.state]} ${
                n.state === "current" ? "ring-4 ring-status-amber/25" : ""
              }`}
            />
            <span className="min-w-0">
              <span className="block text-[13px] font-medium leading-snug text-client-text">
                {n.name}
              </span>{" "}
              <span
                className={`block font-mono text-[10px] uppercase tracking-wider ${
                  n.state === "current" ? "font-semibold text-client-text" : "text-client-muted"
                }`}
              >
                {STATE_LABEL[n.state]}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

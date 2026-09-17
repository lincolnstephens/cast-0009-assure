import type { RagStatus } from "@maximus/shared";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { StatusLamp } from "../../components/StatusLamp";
import { api, ApiError } from "../../lib/api";
import { formatCountdown, formatLondon } from "../../lib/format";

interface ClockItem {
  id: string;
  kind: "sar_1_month" | "breach_72h";
  reference: string;
  startsAt: string;
  dueAt: string;
  closedAt: string | null;
  outcome: string | null;
  status: RagStatus | null;
  latestNote: string | null;
}

interface ClockDetail {
  id: string;
  kind: string;
  reference: string;
  summary: string | null;
  startsAt: string;
  dueAt: string;
  closedAt: string | null;
  outcome: string | null;
  status: RagStatus | null;
  events: { id: string; event: string; note: string | null; createdAt: string; actorName: string | null }[];
}

const kindLabel = (kind: string) =>
  kind === "sar_1_month" ? "Subject access request" : "Breach assessment";

export function ClocksPage() {
  const [data, setData] = useState<{ active: ClockItem[]; closed: ClockItem[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [openClock, setOpenClock] = useState<ClockDetail | null>(null);
  const [showRaise, setShowRaise] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api<{ active: ClockItem[]; closed: ClockItem[] }>("/clocks"));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load clocks.");
    }
  }, []);

  useEffect(() => {
    void load();
    const poll = setInterval(() => void load(), 30_000);
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [load]);

  async function openDetail(id: string) {
    try {
      setOpenClock(await api<ClockDetail>(`/clocks/${id}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to open that clock.");
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Statutory clocks</h1>
          <div className="mt-2 h-px w-16 bg-client-line" />
        </div>
        <button
          onClick={() => setShowRaise(true)}
          className="rounded bg-client-accent px-4 py-2 text-sm font-medium text-white hover:bg-client-accent/90"
        >
          Raise a request
        </button>
      </div>

      {error && (
        <p className="mt-4 border-l-2 border-status-red pl-3 text-sm text-status-red" role="alert">
          {error}
        </p>
      )}

      {!data && !error && <p className="mt-6 text-client-muted">Loading clocks…</p>}

      {data && (
        <>
          <h2 className="mt-8 text-sm font-medium uppercase tracking-wider text-client-muted">
            Active
          </h2>
          {data.active.length === 0 ? (
            <p className="mt-3 text-sm text-client-muted">
              No active statutory clocks. Anything you raise will appear here immediately.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {data.active.map((clock) => (
                <li key={clock.id}>
                  <button
                    onClick={() => void openDetail(clock.id)}
                    className="w-full rounded border border-client-line bg-client-surface p-4 text-left hover:border-client-accent"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="font-medium">{kindLabel(clock.kind)}</span>
                        <span className="ml-3 text-sm text-client-muted">{clock.reference}</span>
                      </div>
                      {clock.status && <StatusLamp status={clock.status} />}
                    </div>
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                      <div className="text-sm text-client-muted">
                        <div>Started {formatLondon(clock.startsAt)}</div>
                        <div>Due {formatLondon(clock.dueAt)}</div>
                      </div>
                      <div
                        className={`tabular-nums text-2xl font-semibold ${
                          clock.status === "red"
                            ? "text-status-red"
                            : clock.status === "amber"
                              ? "text-status-amber"
                              : "text-client-text"
                        }`}
                      >
                        {formatCountdown(clock.dueAt, now)}
                      </div>
                    </div>
                    {clock.latestNote && (
                      <p className="mt-3 border-t border-client-line pt-2 text-sm text-client-muted">
                        {clock.latestNote}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h2 className="mt-10 text-sm font-medium uppercase tracking-wider text-client-muted">
            Closed
          </h2>
          {data.closed.length === 0 ? (
            <p className="mt-3 text-sm text-client-muted">No closed clocks yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.closed.map((clock) => (
                <li key={clock.id}>
                  <button
                    onClick={() => void openDetail(clock.id)}
                    className="w-full rounded border border-client-line bg-client-surface px-4 py-3 text-left hover:border-client-accent"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-sm">{kindLabel(clock.kind)}</span>
                        <span className="ml-3 text-sm text-client-muted">{clock.reference}</span>
                      </div>
                      <span className="text-sm text-client-muted">
                        Closed {clock.closedAt ? formatLondon(clock.closedAt) : ""}
                      </span>
                    </div>
                    {clock.outcome && (
                      <p className="mt-1 text-sm text-client-muted">{clock.outcome}</p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {openClock && (
        <ClockDrawer clock={openClock} now={now} onClose={() => setOpenClock(null)} />
      )}
      {showRaise && (
        <RaiseRequestModal
          onClose={() => setShowRaise(false)}
          onRaised={() => {
            setShowRaise(false);
            void load();
          }}
        />
      )}
    </div>
  );
}

function ClockDrawer({
  clock,
  now,
  onClose,
}: {
  clock: ClockDetail;
  now: Date;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50" onClick={onClose}>
      <aside
        className="h-full w-full max-w-md overflow-y-auto border-l border-client-line bg-client-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{kindLabel(clock.kind)}</h2>
            <p className="text-sm text-client-muted">{clock.reference}</p>
          </div>
          <button onClick={onClose} className="text-sm text-client-muted hover:text-client-text">
            Close
          </button>
        </div>

        {clock.summary && <p className="mt-4 text-sm">{clock.summary}</p>}

        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-client-muted">Started</dt>
            <dd>{formatLondon(clock.startsAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-client-muted">Due</dt>
            <dd>{formatLondon(clock.dueAt)}</dd>
          </div>
          {clock.closedAt ? (
            <>
              <div className="flex justify-between">
                <dt className="text-client-muted">Closed</dt>
                <dd>{formatLondon(clock.closedAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-client-muted">Outcome</dt>
                <dd>{clock.outcome}</dd>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <dt className="text-client-muted">Time remaining</dt>
              <dd className="tabular-nums font-semibold">
                {formatCountdown(clock.dueAt, now)}
              </dd>
            </div>
          )}
        </dl>

        <h3 className="mt-6 border-t border-client-line pt-4 text-sm font-medium uppercase tracking-wider text-client-muted">
          Timeline
        </h3>
        <ul className="mt-3 space-y-3">
          {clock.events.map((event) => (
            <li key={event.id} className="border-l-2 border-client-accent/60 pl-3">
              <div className="text-xs uppercase tracking-wider text-client-muted">
                {event.event} - {formatLondon(event.createdAt)}
                {event.actorName ? ` - ${event.actorName}` : ""}
              </div>
              {event.note && <p className="mt-0.5 text-sm">{event.note}</p>}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function RaiseRequestModal({
  onClose,
  onRaised,
}: {
  onClose: () => void;
  onRaised: () => void;
}) {
  const [type, setType] = useState<"data_request" | "concern">("data_request");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/requests", {
        method: "POST",
        body: JSON.stringify({ type, details }),
      });
      onRaised();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to raise the request.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded border border-client-line bg-client-surface p-6"
      >
        <h2 className="text-lg font-semibold">Raise a request</h2>
        <p className="mt-1 text-sm text-client-muted">
          This starts the statutory process and alerts your compliance officer.
        </p>

        <label className="mt-4 block text-sm text-client-muted" htmlFor="request-type">
          Type
        </label>
        <select
          id="request-type"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="mt-1 w-full rounded border border-client-line bg-client-bg px-3 py-2 text-sm outline-none focus:border-client-accent"
        >
          <option value="data_request">Data request (someone wants their data)</option>
          <option value="concern">Report a concern (possible incident)</option>
        </select>

        <label className="mt-4 block text-sm text-client-muted" htmlFor="request-details">
          What happened?
        </label>
        <textarea
          id="request-details"
          required
          rows={4}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Describe it in your own words - plain English is perfect."
          className="mt-1 w-full rounded border border-client-line bg-client-bg px-3 py-2 text-sm outline-none focus:border-client-accent"
        />

        {error && (
          <p className="mt-3 border-l-2 border-status-red pl-3 text-sm text-status-red" role="alert">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-client-muted hover:text-client-text">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || details.trim().length === 0}
            className="rounded bg-client-accent px-4 py-2 text-sm font-medium text-white hover:bg-client-accent/90 disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Submit request"}
          </button>
        </div>
      </form>
    </div>
  );
}

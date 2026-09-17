import type { IntakeType, RagStatus } from "@maximus/shared";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { StatusLamp } from "../../components/StatusLamp";
import { api, ApiError } from "../../lib/api";
import { formatCountdown, formatLondon } from "../../lib/format";
import { useAdmin } from "../../store/admin";

interface AdminClock {
  id: string;
  kind: "sar_1_month" | "breach_72h";
  reference: string;
  summary: string | null;
  intakeSource: string;
  startsAt: string;
  dueAt: string;
  closedAt: string | null;
  outcome: string | null;
  status: RagStatus | null;
}

interface TimelineEvent {
  id: string;
  event: string;
  note: string | null;
  createdAt: string;
  actorName: string | null;
}

const kindLabel = (kind: string) =>
  kind === "sar_1_month" ? "SAR (1 month)" : "Breach (72h)";

export function AdminClocksPage() {
  const { selectedAccountId } = useAdmin();
  const [clocks, setClocks] = useState<AdminClock[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [events, setEvents] = useState<Record<string, TimelineEvent[]>>({});
  const [showIntake, setShowIntake] = useState(false);

  const load = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const res = await api<{ clocks: AdminClock[] }>(
        `/admin/clocks?accountId=${selectedAccountId}`,
      );
      setClocks(res.clocks);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load clocks.");
    }
  }, [selectedAccountId]);

  useEffect(() => {
    setClocks(null);
    void load();
    const poll = setInterval(() => void load(), 30_000);
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [load]);

  async function toggleTimeline(clockId: string) {
    if (expanded === clockId) {
      setExpanded(null);
      return;
    }
    try {
      const res = await api<{ events: TimelineEvent[] }>(`/admin/clocks/${clockId}/events`);
      setEvents((prev) => ({ ...prev, [clockId]: res.events }));
      setExpanded(clockId);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load the timeline.");
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">Intakes and clocks</h1>
          <div className="mt-1.5 h-px w-12 bg-hud-gold/60" />
        </div>
        <button
          onClick={() => setShowIntake(true)}
          className="rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90"
        >
          Create manual intake
        </button>
      </div>

      {error && (
        <p className="mt-3 border-l-2 border-status-red pl-3 text-sm text-status-red" role="alert">
          {error}
        </p>
      )}
      {!clocks && !error && <p className="mt-4 text-sm text-hud-muted">Loading clocks…</p>}
      {clocks && clocks.length === 0 && (
        <p className="mt-4 text-sm text-hud-muted">No clocks for this account yet.</p>
      )}

      {clocks && clocks.length > 0 && (
        <ul className="mt-4 space-y-2">
          {clocks.map((clock) => (
            <li key={clock.id} className="rounded border border-hud-line bg-hud-panel">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-[13px]">
                <span className="w-28 font-medium">{kindLabel(clock.kind)}</span>
                <span className="w-32 text-hud-muted">{clock.reference}</span>
                <span className="text-hud-muted">due {formatLondon(clock.dueAt)}</span>
                {clock.closedAt ? (
                  <span className="text-hud-muted">closed — {clock.outcome}</span>
                ) : (
                  <>
                    <span className="tabular-nums font-semibold">
                      {formatCountdown(clock.dueAt, now)}
                    </span>
                    {clock.status && <StatusLamp status={clock.status} />}
                  </>
                )}
                <span className="ml-auto flex gap-3">
                  <button
                    onClick={() => void toggleTimeline(clock.id)}
                    className="text-hud-accent hover:underline"
                  >
                    {expanded === clock.id ? "Hide timeline" : "Timeline"}
                  </button>
                </span>
              </div>

              {expanded === clock.id && (
                <ClockTimeline
                  clock={clock}
                  events={events[clock.id] ?? []}
                  onChanged={() => {
                    void load();
                    void toggleTimeline(clock.id).then(() => setExpanded(clock.id));
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {showIntake && selectedAccountId && (
        <ManualIntakeModal
          accountId={selectedAccountId}
          onClose={() => setShowIntake(false)}
          onCreated={() => {
            setShowIntake(false);
            void load();
          }}
        />
      )}
    </div>
  );
}

function ClockTimeline({
  clock,
  events,
  onChanged,
}: {
  clock: AdminClock;
  events: TimelineEvent[];
  onChanged: () => void;
}) {
  const [note, setNote] = useState("");
  const [outcome, setOutcome] = useState("");
  const [insideStatute, setInsideStatute] = useState(true);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addNote(e: FormEvent) {
    e.preventDefault();
    try {
      await api(`/admin/clocks/${clock.id}/events`, {
        method: "POST",
        body: JSON.stringify({ note }),
      });
      setNote("");
      setError(null);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to add the note.");
    }
  }

  async function close(e: FormEvent) {
    e.preventDefault();
    try {
      await api(`/admin/clocks/${clock.id}/close`, {
        method: "POST",
        body: JSON.stringify({
          outcome,
          ...(clock.kind === "sar_1_month" ? { insideStatute } : {}),
        }),
      });
      setError(null);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to close the clock.");
    }
  }

  return (
    <div className="border-t border-hud-line px-4 py-3">
      {clock.summary && (
        <p className="mb-3 text-[13px] text-hud-muted">
          Intake ({clock.intakeSource}): {clock.summary}
        </p>
      )}

      <ul className="space-y-2">
        {events.map((event) => (
          <li key={event.id} className="border-l-2 border-hud-accent/60 pl-3 text-[13px]">
            <span className="text-hud-muted">
              {event.event} — {formatLondon(event.createdAt)}
              {event.actorName ? ` — ${event.actorName}` : ""}
            </span>
            {event.note && <p>{event.note}</p>}
          </li>
        ))}
        {events.length === 0 && (
          <li className="text-[13px] text-hud-muted">No events recorded.</li>
        )}
      </ul>

      {error && (
        <p className="mt-3 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}

      {!clock.closedAt && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <form onSubmit={addNote}>
            <label className="block text-[12px] uppercase tracking-wider text-hud-muted">
              Add event note
            </label>
            <div className="mt-1 flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                className="flex-1 rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px] outline-none focus:border-hud-accent"
              />
              <button
                type="submit"
                className="rounded border border-hud-accent px-3 py-1.5 text-[13px] text-hud-accent hover:bg-hud-accent hover:text-white"
              >
                Add
              </button>
            </div>
          </form>

          {!closing ? (
            <div className="md:text-right">
              <button
                onClick={() => setClosing(true)}
                className="rounded border border-status-red/70 px-3 py-1.5 text-[13px] text-status-red hover:bg-status-red hover:text-white"
              >
                Close clock…
              </button>
            </div>
          ) : (
            <form onSubmit={close}>
              <label className="block text-[12px] uppercase tracking-wider text-hud-muted">
                Close with outcome
              </label>
              <input
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                required
                placeholder="e.g. Responded within statute"
                className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px] outline-none focus:border-hud-accent"
              />
              {clock.kind === "sar_1_month" && (
                <label className="mt-2 flex items-center gap-2 text-[13px] text-hud-muted">
                  <input
                    type="checkbox"
                    checked={insideStatute}
                    onChange={(e) => setInsideStatute(e.target.checked)}
                  />
                  Responded inside statute
                </label>
              )}
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClosing(false)}
                  className="px-2 py-1 text-[13px] text-hud-muted hover:text-hud-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-status-red px-3 py-1.5 text-[13px] font-medium text-white hover:bg-status-red/80"
                >
                  Close clock
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function ManualIntakeModal({
  accountId,
  onClose,
  onCreated,
}: {
  accountId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [type, setType] = useState<IntakeType>("sar");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/admin/intakes", {
        method: "POST",
        body: JSON.stringify({ clientAccountId: accountId, type, summary }),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create the intake.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded border border-hud-line bg-hud-panel p-6"
      >
        <h2 className="text-base font-semibold">Create manual intake</h2>

        <label className="mt-4 block text-[13px] text-hud-muted" htmlFor="intake-type">
          Type
        </label>
        <select
          id="intake-type"
          value={type}
          onChange={(e) => setType(e.target.value as IntakeType)}
          className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-3 py-2 text-[13px] outline-none focus:border-hud-accent"
        >
          <option value="sar">Subject access request (1-month clock)</option>
          <option value="breach">Breach assessment (72-hour clock)</option>
        </select>

        <label className="mt-4 block text-[13px] text-hud-muted" htmlFor="intake-summary">
          Summary
        </label>
        <textarea
          id="intake-summary"
          required
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-3 py-2 text-[13px] outline-none focus:border-hud-accent"
        />

        {error && (
          <p className="mt-3 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-3 py-2 text-[13px] text-hud-muted hover:text-hud-text">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || summary.trim().length === 0}
            className="rounded bg-hud-accent px-4 py-2 text-[13px] font-medium text-white hover:bg-hud-accent/90 disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create intake"}
          </button>
        </div>
      </form>
    </div>
  );
}

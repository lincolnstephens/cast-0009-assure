import { useState } from "react";
import type { ForYouTask } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { formatDateGB } from "../../lib/format";
import { PREVIEW_CONFIRM_MESSAGE } from "../../lib/preview";
import { usePreviewing } from "../../lib/usePreviewing";
import { StatusMark } from "./StatusMark";

/**
 * Tasks whose owner is a client role, soonest due first. At v1.3 it sits at
 * the top of Job management as "Waiting on you". The client's only
 * action anywhere in the portal lives here: confirm, with an optional
 * evidence link. Confirming does not change the task's status - the operator
 * accepts it separately - so a confirmed row shows "Sent to MITMARK to
 * accept" and nothing pretends the work is done.
 */
export function ForYouPanel({
  tasks,
  emptyMessage,
  title = "Waiting on you",
  testId = "waiting-on-you",
}: {
  tasks: ForYouTask[];
  emptyMessage: string;
  title?: string;
  testId?: string;
}) {
  return (
    <section aria-label={title} data-testid={testId} data-panel="for-you-panel">
      <h2 className="text-base font-semibold">{title}</h2>
      {tasks.length === 0 ? (
        <p
          data-testid="for-you-empty"
          className="mt-2 rounded border border-client-line bg-client-surface p-4 text-[13px] text-client-muted"
        >
          {emptyMessage}
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {tasks.map((t) => (
            <ForYouRow key={t.id} task={t} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ForYouRow({ task }: { task: ForYouTask }) {
  const [evidence, setEvidence] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(task.confirmedAt !== null);
  const previewing = usePreviewing();

  async function confirm() {
    setSending(true);
    setError(null);
    try {
      await api<{ ok: true }>(`/tracker/tasks/${task.id}/confirm`, {
        method: "POST",
        body: JSON.stringify({ note: "", evidence: evidence.trim() }),
      });
      setConfirmed(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That did not go through. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <li
      data-testid="for-you-row"
      className="rounded border border-client-line bg-client-surface p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-wider text-client-muted">
            {task.areaName}
          </p>
          <p className="text-[14px] font-medium text-client-text">{task.how}</p>
          <p className="mt-1 text-[12px] text-client-muted">
            Due {task.dueAt ? formatDateGB(task.dueAt) : "no date - always on"}
          </p>
          <div className="mt-1.5">
            <StatusMark status={task.status} rag={task.rag} />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {confirmed ? (
            <span
              data-testid="for-you-confirmed"
              className="font-mono text-[12px] text-client-accent"
            >
              Sent to MITMARK to accept
            </span>
          ) : (
            <>
              <label className="sr-only" htmlFor={`evidence-${task.id}`}>
                Evidence link, optional
              </label>
              <input
                id={`evidence-${task.id}`}
                type="text"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Evidence link (optional)"
                className="w-52 rounded border border-client-line bg-client-bg px-2 py-1 text-[12px]"
              />
              <button
                type="button"
                data-testid="confirm-task"
                onClick={() => void confirm()}
                disabled={sending || previewing}
                title={previewing ? PREVIEW_CONFIRM_MESSAGE : undefined}
                className="rounded bg-client-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-client-accent/90 disabled:opacity-50"
              >
                {sending ? "Sending…" : "Confirm"}
              </button>
              {previewing && (
                <span data-testid="preview-read-only" className="text-[11px] text-client-muted">
                  {PREVIEW_CONFIRM_MESSAGE}
                </span>
              )}
            </>
          )}
          {error && (
            <span role="alert" className="max-w-[180px] text-right text-[11px] text-status-red">
              {error}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

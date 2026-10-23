import { useCallback, useEffect, useState } from "react";
import type { ForYouTask, JobsResponse } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { formatDateGB } from "../../lib/format";
import { ForYouPanel } from "../../components/tracker/ForYouPanel";
import { StatusMark } from "../../components/tracker/StatusMark";

type JobTask = JobsResponse["groups"][number]["tasks"][number];

/**
 * Job management (FRAGO 03 section 3.5): every task across all eight modules
 * as a board of three columns, Not started, In progress, Completed. The
 * client's own tasks sit above the board as "Waiting on you", because
 * confirming is the client's only action anywhere in this portal. There is
 * no create, edit, drag, reorder, close or delete control on this page; the
 * filters narrow the view and write nothing. Quick questions has its own
 * menu item now, so the Guide no longer sits at the foot.
 */
export function JobsPage() {
  const [data, setData] = useState<JobsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [moduleFilter, setModuleFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [dueFilter, setDueFilter] = useState("");

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (moduleFilter) params.set("module", moduleFilter);
      if (ownerFilter) params.set("owner", ownerFilter);
      if (dueFilter) params.set("due", dueFilter);
      const qs = params.toString();
      setData(await api<JobsResponse>(`/tracker/jobs${qs ? `?${qs}` : ""}`));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load Jobs.");
    }
  }, [moduleFilter, ownerFilter, dueFilter]);

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

  // The client's own tasks, soonest due first, exactly as the tracker's "for
  // you" panel presents them - drawn from whichever filter is active, so
  // narrowing to a module or owner narrows this panel with it.
  const forYouTasks: ForYouTask[] = data.groups
    .filter((g) => g.id !== "completed")
    .flatMap((g) => g.tasks)
    .filter((t) => t.forYou)
    .map(toForYouTask)
    .sort((a, b) => {
      if (a.dueAt && b.dueAt) return a.dueAt < b.dueAt ? -1 : 1;
      if (a.dueAt) return -1;
      if (b.dueAt) return 1;
      return 0;
    });

  return (
    <div data-testid="jobs" className="max-w-6xl space-y-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
          Compliance Tracker
        </p>
        <h1 className="text-lg font-semibold">Job management</h1>
        <p className="mt-0.5 text-[13px] text-client-muted">
          Every task across all eight modules, by where it stands.
        </p>
      </header>

      <ForYouPanel
        tasks={forYouTasks}
        emptyMessage={data.forYouEmptyMessage}
      />

      <section aria-label="Filters" className="flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor="jobsModule"
            className="mb-1 block font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted"
          >
            Module
          </label>
          <select
            id="jobsModule"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="min-w-[200px] rounded border border-client-line bg-client-bg px-2 py-1.5 text-[13px]"
          >
            <option value="">All eight modules</option>
            {data.modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id}. {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="jobsOwner"
            className="mb-1 block font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted"
          >
            Owner
          </label>
          <select
            id="jobsOwner"
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="min-w-[160px] rounded border border-client-line bg-client-bg px-2 py-1.5 text-[13px]"
          >
            <option value="">Everyone</option>
            {data.owners.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 pb-1.5 text-[13px] text-client-text">
          <input
            type="checkbox"
            checked={dueFilter === "month"}
            onChange={(e) => setDueFilter(e.target.checked ? "month" : "")}
          />
          Due this month
        </label>
      </section>

      <section aria-label="Job board" data-testid="job-board" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {data.groups.map((group) => (
          <div
            key={group.id}
            data-testid="job-column"
            className="flex min-w-0 flex-col rounded border border-client-line bg-client-surface/60"
          >
            <h2 className="flex items-baseline justify-between border-b border-client-line px-3 py-2.5 text-[14px] font-semibold">
              <span data-testid="job-column-name">{group.name}</span>
              <span className="font-mono text-[12px] font-normal text-client-muted">
                {group.tasks.length}
              </span>
            </h2>
            {group.tasks.length === 0 ? (
              <p className="px-3 py-4 text-[13px] text-client-muted">None.</p>
            ) : (
              <ul className="space-y-2 p-2">
                {group.tasks.map((t) => (
                  <JobCard key={t.id} task={t} />
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <p className="text-[12px] text-client-muted">
        {data.notApplicableCount === 0
          ? "No tasks are marked not applicable."
          : `${data.notApplicableCount} task${data.notApplicableCount === 1 ? "" : "s"} marked not applicable, not shown here.`}
      </p>

    </div>
  );
}

function JobCard({ task }: { task: JobTask }) {
  return (
    <li
      data-testid="job-card"
      data-blocked={task.blocked ? "true" : undefined}
      className="rounded border border-client-line bg-client-surface p-3 shadow-sm"
    >
      <p className="text-[13px] font-medium leading-snug text-client-text">{task.title}</p>
      <p className="mt-1 text-[12px] text-client-muted">{task.areaName}</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[12px] text-client-muted">
          {task.dueAt ? formatDateGB(task.dueAt) : "no date"}
        </span>
        {/* v1.9 (FRAGO 09 3.3): one mark with its words. A blocked task says
            Blocked in the mark itself, so the separate badge has gone. */}
        <StatusMark status={task.status} rag={task.rag} />
      </div>
      {/* v1.9 (FRAGO 09 3.1): MITMARK's note on her confirmation, when one was given. */}
      {task.mitmarkNote && (
        <div className="mt-2 border-t border-client-line pt-2 text-[12px]">
          <p data-testid="decision-note-client" className="text-client-text">
            MITMARK: {task.mitmarkNote.text}
          </p>
          <span data-testid="decision-note-date" className="text-client-muted">
            {formatDateGB(task.mitmarkNote.at.slice(0, 10))}
          </span>
        </div>
      )}
    </li>
  );
}

function toForYouTask(t: JobTask): ForYouTask {
  return {
    id: t.id,
    area: t.area,
    areaName: t.areaName,
    title: t.title,
    how: t.how,
    ownerRole: t.ownerRole,
    dueAt: t.dueAt,
    recurrence: t.recurrence,
    status: t.status,
    statusLabel: t.statusLabel,
    rag: t.rag,
    ragLabel: t.ragLabel,
    confirmedAt: t.clientConfirmedAt,
  };
}

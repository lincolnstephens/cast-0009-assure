import { useCallback, useEffect, useState } from "react";
import type { ForYouTask, JobsResponse } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { ForYouPanel } from "../../components/tracker/ForYouPanel";
import { TaskTable } from "../../components/tracker/TaskTable";
import { GuidePage } from "./Guide";

type JobTask = JobsResponse["groups"][number]["tasks"][number];

/**
 * Jobs: every task across all eight modules in one list, grouped the way
 * the operator speaks about them (FRAGO section 4). The client's tasks sit in their own
 * panel at the top, exactly as on the Compliance Tracker, because confirming
 * is the client's only action anywhere in this portal - there is no edit,
 * delete, reopen or status control on this page. The Policy Guide sits at
 * the foot as "Ask a question", so a question and a task are in one place.
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
        <h1 className="text-lg font-semibold">Jobs</h1>
        <p className="mt-0.5 text-[13px] text-client-muted">
          Every task across all eight modules, in one list, grouped by where it stands.
        </p>
      </header>

      <ForYouPanel
        tasks={forYouTasks}
        emptyMessage="Nothing needs your action. MITMARK is working the rest."
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

      {data.groups.map((group) => (
        <section key={group.id} aria-label={group.name}>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
            <span data-testid="job-group-name">{group.name}</span> &middot;{" "}
            {group.tasks.length}
          </p>
          <div className="mt-2">
            <TaskTable tasks={group.tasks} />
          </div>
        </section>
      ))}

      <p className="text-[12px] text-client-muted">
        {data.notApplicableCount === 0
          ? "No tasks are marked not applicable."
          : `${data.notApplicableCount} task${data.notApplicableCount === 1 ? "" : "s"} marked not applicable, not shown here.`}
      </p>

      <section aria-label="Ask a question" className="border-t border-client-line pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
          Ask a question
        </p>
        <p className="mt-1 text-[13px] text-client-muted">
          Scoped to all approved policies, so a question and a task sit in the same place.
        </p>
        <div className="mt-3 h-[560px] rounded border border-client-line bg-client-surface">
          <GuidePage />
        </div>
      </section>
    </div>
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

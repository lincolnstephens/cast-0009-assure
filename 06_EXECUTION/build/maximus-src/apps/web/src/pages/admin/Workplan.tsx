import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  AREAS,
  PHASES,
  TASK_COLUMNS,
  TASK_STATUS_LABEL,
  areaName,
  phaseName,
  ownerTypeSchema,
  recurrenceSchema,
  taskStatusSchema,
} from "@maximus/shared";
import type { OwnerType, Recurrence, Task, TaskInput, TaskStatus } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { formatDateGB } from "../../lib/format";
import { useAdmin } from "../../store/admin";

const STATUS_OPTS = taskStatusSchema.options;
const RECURRENCE_OPTS = recurrenceSchema.options;
const OWNER_OPTS = ownerTypeSchema.options;

const RECURRENCE_LABEL: Record<Recurrence, string> = {
  once: "Once",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
  "always-on": "Always-on",
};

/** Settings, read only for the client role list a task's owner can be set to. */
interface SettingsLite {
  clientRoles: string[];
}

interface ApplyLibraryResult {
  created: number;
  skipped: number;
}

function ownerLabel(t: Task): string {
  return t.ownerType === "mitmark" ? "MITMARK" : t.ownerRole || "Client";
}

/**
 * MITMARK's workplan for the client. The operator adds, edits and closes
 * tasks here. The client's only write path is a confirmation, actioned
 * through the review queue, not through this page.
 */
export function AdminWorkplanPage() {
  const { selectedAccountId } = useAdmin();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [clientRoles, setClientRoles] = useState<string[]>([]);
  const [areaFilter, setAreaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Task | "new" | null>(null);

  const [startDate, setStartDate] = useState("");
  const [applyBusy, setApplyBusy] = useState(false);
  const [applyResult, setApplyResult] = useState<ApplyLibraryResult | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const params = new URLSearchParams({ org: selectedAccountId });
      if (areaFilter) params.set("area", areaFilter);
      if (statusFilter) params.set("status", statusFilter);
      const res = await api<{ tasks: Task[] }>(`/admin/workplan?${params}`);
      setTasks(res.tasks);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load the workplan.");
    }
  }, [selectedAccountId, areaFilter, statusFilter]);

  const loadRoles = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const res = await api<{ settings: SettingsLite }>(`/admin/settings?org=${selectedAccountId}`);
      setClientRoles(res.settings.clientRoles ?? []);
    } catch {
      // Falls back to an empty role list; the owner role field then has
      // nothing to offer until settings loads.
    }
  }, [selectedAccountId]);

  useEffect(() => {
    setTasks(null);
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId, areaFilter, statusFilter]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  async function act(fn: () => Promise<unknown>) {
    try {
      setError(null);
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That action failed.");
    }
  }

  async function applyLibrary(e: FormEvent) {
    e.preventDefault();
    if (!selectedAccountId || !startDate) return;
    setApplyBusy(true);
    setApplyError(null);
    try {
      const res = await api<ApplyLibraryResult>(
        `/admin/workplan/apply-library?org=${selectedAccountId}`,
        { method: "POST", body: JSON.stringify({ startDate }) },
      );
      setApplyResult(res);
      await load();
    } catch (err) {
      setApplyError(err instanceof ApiError ? err.message : "Unable to apply the library.");
    } finally {
      setApplyBusy(false);
    }
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-lg font-semibold">Workplan</h1>
      <p className="mt-0.5 text-[13px] text-hud-muted">
        This is MITMARK's workplan for the client. The client can only confirm a task assigned to
        them, from their own portal; every other change happens here.
      </p>

      {error && (
        <p className="mt-3 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 rounded border border-hud-line bg-hud-panel/60 p-4">
        <h2 className="text-sm font-semibold">Apply the task library</h2>
        <p className="mt-1 text-[13px] text-hud-muted">
          Applies the seeded task library from a start date and expands recurring tasks for the
          next twelve months. Re-applying adds whatever is missing; it never overwrites a task
          you have already edited.
        </p>
        <form onSubmit={applyLibrary} className="mt-2 flex flex-wrap items-end gap-3">
          <label className="block text-[13px]">
            <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">
              Start date
            </span>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            />
          </label>
          <button
            type="submit"
            disabled={applyBusy}
            className="rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90 disabled:opacity-60"
          >
            {applyBusy ? "Applying…" : "Apply library"}
          </button>
        </form>
        {applyError && (
          <p className="mt-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
            {applyError}
          </p>
        )}
        {applyResult && (
          <p className="mt-2 text-[13px]">
            Created {applyResult.created}, skipped {applyResult.skipped} because they already
            existed.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block text-[13px]">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">
            Area
          </span>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="min-w-[240px] rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          >
            <option value="">All areas</option>
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id}. {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[13px]">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">
            Status
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[160px] rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          >
            <option value="">All statuses</option>
            {STATUS_OPTS.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90"
        >
          Add a task
        </button>
      </div>

      {!tasks && !error && <p className="mt-4 text-[13px] text-hud-muted">Loading…</p>}
      {tasks && tasks.length === 0 && (
        <p className="mt-4 text-[13px] text-hud-muted">No tasks match these filters.</p>
      )}

      {tasks && tasks.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded border border-hud-line">
          <table data-testid="task-table" className="w-full min-w-[960px] text-left text-[13px]">
            <thead className="border-b border-hud-line bg-hud-panel/60 text-[11px] uppercase tracking-wider text-hud-muted">
              <tr>
                <th className="px-3 py-2">Area</th>
                <th className="px-3 py-2">Phase</th>
                {TASK_COLUMNS.map((c) => (
                  <th key={c} className="px-3 py-2">
                    {c}
                  </th>
                ))}
                <th className="px-3 py-2">Progress</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} data-testid="task-row" className="border-b border-hud-line/50 align-top">
                  <td className="whitespace-nowrap px-3 py-2 text-hud-muted">{areaName(t.area)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-hud-muted">{phaseName(t.phase)}</td>
                  <td className="px-3 py-2">{t.title}</td>
                  <td className="px-3 py-2">
                    {t.howLink ? (
                      <a
                        href={t.howLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-hud-accent hover:underline"
                      >
                        {t.how || "Link"}
                      </a>
                    ) : (
                      t.how || " - "
                    )}
                  </td>
                  <td className="px-3 py-2">{ownerLabel(t)}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {t.dueAt ? formatDateGB(t.dueAt) : "Always-on"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {t.closedAt ? formatDateGB(t.closedAt.slice(0, 10)) : " - "}
                  </td>
                  <td className="px-3 py-2">
                    <div>{TASK_STATUS_LABEL[t.status]}</div>
                    {t.clientConfirmedAt && (
                      <div className="mt-1 text-[12px] text-status-amber">
                        Client confirmed on {formatDateGB(t.clientConfirmedAt.slice(0, 10))}, waiting
                        for you to accept in the review queue.
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{t.progress}%</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col items-start gap-1 text-[12px]">
                      <button className="text-hud-accent hover:underline" onClick={() => setEditing(t)}>
                        Edit
                      </button>
                      <button
                        className="text-status-red hover:underline"
                        onClick={() =>
                          void act(async () => {
                            if (!window.confirm("Remove this task from the workplan?")) return;
                            await api(`/admin/workplan/${t.id}?org=${selectedAccountId}`, {
                              method: "DELETE",
                            });
                          })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && selectedAccountId && (
        <TaskModal
          orgId={selectedAccountId}
          task={editing === "new" ? null : editing}
          clientRoles={clientRoles}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function TaskModal({
  orgId,
  task,
  clientRoles,
  onClose,
  onSaved,
}: {
  orgId: string;
  task: Task | null;
  clientRoles: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [area, setArea] = useState(String(task?.area ?? 1));
  const [phase, setPhase] = useState(String(task?.phase ?? 1));
  const [title, setTitle] = useState(task?.title ?? "");
  const [how, setHow] = useState(task?.how ?? "");
  const [howLink, setHowLink] = useState(task?.howLink ?? "");
  const [ownerType, setOwnerType] = useState<OwnerType>(task?.ownerType ?? "mitmark");
  const [ownerRole, setOwnerRole] = useState(task?.ownerRole ?? "");
  const [dueAt, setDueAt] = useState(task?.dueAt ?? "");
  const [recurrence, setRecurrence] = useState<Recurrence>(task?.recurrence ?? "once");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "not_started");
  const [progress, setProgress] = useState(String(task?.progress ?? 0));
  const [evidence, setEvidence] = useState<string[]>(task?.evidence ?? []);
  const [evidenceInput, setEvidenceInput] = useState("");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // The owner role only means something for a client-owned task; MITMARK
  // does not have a role and the field should not silently keep a stale one.
  useEffect(() => {
    if (ownerType === "mitmark") setOwnerRole("");
  }, [ownerType]);

  function addEvidence() {
    const v = evidenceInput.trim();
    if (!v) return;
    setEvidence((prev) => [...prev, v]);
    setEvidenceInput("");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const body: Partial<TaskInput> = {
      area: Number(area),
      phase: Number(phase),
      title,
      how,
      howLink: howLink.trim() === "" ? null : howLink.trim(),
      ownerType,
      ownerRole: ownerType === "client" ? ownerRole : "",
      dueAt: dueAt === "" ? null : dueAt,
      recurrence,
      status,
      progress: Number(progress),
      evidence,
      notes,
    };
    try {
      if (task) {
        await api(`/admin/workplan/${task.id}?org=${orgId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await api(`/admin/workplan?org=${orgId}`, { method: "POST", body: JSON.stringify(body) });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save the task.");
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="grid w-full max-w-2xl grid-cols-1 gap-3 rounded border border-hud-line bg-hud-panel p-6 sm:grid-cols-2"
      >
        <h2 className="col-span-1 text-base font-semibold sm:col-span-2">
          {task ? "Edit task" : "Add a task"}
        </h2>

        <Field label="Area">
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          >
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id}. {a.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Phase">
          <select
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          >
            {PHASES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id}. {p.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="col-span-1 sm:col-span-2">
          <Field label="Title, the What">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            />
          </Field>
        </div>
        <div className="col-span-1 sm:col-span-2">
          <Field label="How, one line">
            <input
              type="text"
              value={how}
              onChange={(e) => setHow(e.target.value)}
              className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            />
          </Field>
        </div>
        <div className="col-span-1 sm:col-span-2">
          <Field label="How link, a policy section or procedure">
            <input
              type="text"
              value={howLink ?? ""}
              onChange={(e) => setHowLink(e.target.value)}
              placeholder="optional"
              className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            />
          </Field>
        </div>

        <Field label="Owner">
          <select
            value={ownerType}
            onChange={(e) => setOwnerType(e.target.value as OwnerType)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          >
            {OWNER_OPTS.map((o) => (
              <option key={o} value={o}>
                {o === "mitmark" ? "MITMARK" : "Client"}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Client role">
          <select
            value={ownerRole}
            onChange={(e) => setOwnerRole(e.target.value)}
            disabled={ownerType !== "client"}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px] disabled:opacity-50"
          >
            <option value="">Select a role</option>
            {clientRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Due date">
          <input
            type="date"
            value={dueAt ?? ""}
            onChange={(e) => setDueAt(e.target.value)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          />
          <span className="mt-1 block text-[11px] text-hud-muted">
            Leave blank for an always-on duty with no single date.
          </span>
        </Field>
        <Field label="Recurrence">
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as Recurrence)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          >
            {RECURRENCE_OPTS.map((r) => (
              <option key={r} value={r}>
                {RECURRENCE_LABEL[r]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          >
            {STATUS_OPTS.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-hud-muted">
            Closing a task as done creates a Record entry for this organisation automatically.
          </p>
        </Field>
        <Field label="Progress, %">
          <input
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          />
        </Field>

        <div className="col-span-1 sm:col-span-2">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">
            Evidence links
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={evidenceInput}
              onChange={(e) => setEvidenceInput(e.target.value)}
              placeholder="https://…"
              className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            />
            <button
              type="button"
              onClick={addEvidence}
              className="shrink-0 rounded border border-hud-line px-3 py-1.5 text-[13px] hover:bg-hud-bg"
            >
              Add
            </button>
          </div>
          {evidence.length > 0 && (
            <ul className="mt-2 space-y-1 text-[13px]">
              {evidence.map((link, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 rounded border border-hud-line px-2 py-1"
                >
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-hud-accent hover:underline"
                  >
                    {link}
                  </a>
                  <button
                    type="button"
                    onClick={() => setEvidence((prev) => prev.filter((_, idx) => idx !== i))}
                    className="shrink-0 text-[12px] text-status-red hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="col-span-1 sm:col-span-2">
          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            />
          </Field>
        </div>

        {error && (
          <p
            className="col-span-1 border-l-2 border-status-red pl-3 text-[13px] text-status-red sm:col-span-2"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="col-span-1 mt-2 flex justify-end gap-3 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-[13px] text-hud-muted hover:text-hud-text"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-hud-accent px-4 py-2 text-[13px] font-medium text-white hover:bg-hud-accent/90 disabled:opacity-60"
          >
            {busy ? "Saving…" : task ? "Save task" : "Add task"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[13px]">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">{label}</span>
      {children}
    </label>
  );
}

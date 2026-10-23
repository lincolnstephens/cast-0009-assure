import { type DragEvent, useState } from "react";
import {
  JOB_GROUP_LABEL,
  TASK_STATUS_LABEL,
  areaName,
  jobGroupOf,
  taskRagFor,
  taskStatusSchema,
} from "@maximus/shared";
import type { JobGroup, Task, TaskStatus } from "@maximus/shared";
import { formatDateGB } from "../lib/format";
import { StatusMark } from "./tracker/StatusMark";

const GROUPS: JobGroup[] = ["not_started", "in_progress", "completed"];

/** The status a drop on each column sets. Blocked is never reached by drag. */
const DROP_STATUS: Record<JobGroup, TaskStatus> = {
  not_started: "not_started",
  in_progress: "in_progress",
  completed: "done",
};

function ownerLabel(t: Task): string {
  return t.ownerType === "mitmark" ? "MITMARK" : t.ownerRole || "Client";
}

/**
 * Job management on the operator's side (FRAGO 07 3.2): the client's three
 * columns, with the cards draggable between them. A drop changes the status
 * through the same edit the workplan uses, so it writes the audit entry and
 * the tracker follows. Each card also carries a status select, the keyboard
 * equivalent, and the only way to Blocked besides its own button. The
 * client's board stays read only and has none of this.
 */
export function AdminJobBoard({
  tasks,
  onStatus,
}: {
  tasks: Task[];
  onStatus: (task: Task, status: TaskStatus) => void;
}) {
  const [over, setOver] = useState<JobGroup | null>(null);
  const onBoard = tasks.filter((t) => jobGroupOf(t.status) !== null);
  const notApplicable = tasks.length - onBoard.length;

  function drop(e: DragEvent<HTMLDivElement>, group: JobGroup) {
    e.preventDefault();
    setOver(null);
    const id = e.dataTransfer.getData("text/plain");
    const task = onBoard.find((t) => t.id === id);
    if (!task) return;
    const status = DROP_STATUS[group];
    if (task.status === status) return;
    // A blocked card already sits in In progress; dropping it there unblocks it.
    onStatus(task, status);
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-[13px] text-hud-muted">
        Drag a card to change its status. Dropping on Completed dates it today.
      </p>
      <section
        aria-label="Job board"
        data-testid="admin-board"
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        {GROUPS.map((group) => {
          const cards = onBoard
            .filter((t) => jobGroupOf(t.status) === group)
            .sort((a, b) => {
              if (a.dueAt && b.dueAt) return a.dueAt < b.dueAt ? -1 : 1;
              if (a.dueAt) return -1;
              if (b.dueAt) return 1;
              return 0;
            });
          return (
            <div
              key={group}
              data-testid="board-column"
              data-group={group}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (over !== group) setOver(group);
              }}
              onDragLeave={() => setOver((g) => (g === group ? null : g))}
              onDrop={(e) => drop(e, group)}
              className={`flex min-h-[160px] min-w-0 flex-col rounded border bg-hud-panel/60 ${
                over === group ? "border-hud-accent" : "border-hud-line"
              }`}
            >
              <h2 className="flex items-baseline justify-between border-b border-hud-line px-3 py-2.5 text-[14px] font-semibold">
                <span>{JOB_GROUP_LABEL[group]}</span>
                <span className="font-mono text-[12px] font-normal text-hud-muted">{cards.length}</span>
              </h2>
              {cards.length === 0 ? (
                <p className="px-3 py-4 text-[13px] text-hud-muted">None.</p>
              ) : (
                <ul className="space-y-2 p-2">
                  {cards.map((t) => (
                    <BoardCard key={t.id} task={t} onStatus={onStatus} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </section>
      <p className="text-[12px] text-hud-muted">
        {notApplicable === 0
          ? "No tasks are marked not applicable."
          : `${notApplicable} task${notApplicable === 1 ? "" : "s"} marked not applicable, not shown here.`}
      </p>
    </div>
  );
}

function BoardCard({ task, onStatus }: { task: Task; onStatus: (task: Task, status: TaskStatus) => void }) {
  const blocked = task.status === "blocked";
  return (
    <li
      data-testid="board-card"
      data-task-id={task.id}
      data-blocked={blocked ? "true" : undefined}
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="cursor-grab rounded border border-hud-line bg-hud-bg p-3 active:cursor-grabbing"
    >
      <p className="text-[13px] font-medium leading-snug">{task.title}</p>
      <p className="mt-1 text-[12px] text-hud-muted">
        {areaName(task.area)} · {ownerLabel(task)}
      </p>
      <p className="mt-1 font-mono text-[12px] text-hud-muted">
        {task.dueAt ? formatDateGB(task.dueAt) : "no date"}
        {task.closedAt ? `, done ${formatDateGB(task.closedAt.slice(0, 10))}` : ""}
      </p>
      {/* v1.9 (FRAGO 09 3.3): the card carries the same one mark as the
          client's board; a blocked card says Blocked in the mark itself. */}
      <div className="mt-2">
        <StatusMark status={task.status} rag={taskRagFor(task.status, task.dueAt, new Date().toISOString().slice(0, 10))} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="text-[12px]">
          <span className="sr-only">Status of {task.title}</span>
          <select
            data-testid="card-status"
            value={task.status}
            onChange={(e) => onStatus(task, e.target.value as TaskStatus)}
            className="rounded border border-hud-line bg-hud-bg px-1.5 py-1 text-[12px]"
          >
            {taskStatusSchema.options.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        {!blocked && task.status !== "done" && task.status !== "not_applicable" && (
          <button
            type="button"
            data-testid="card-block"
            onClick={() => onStatus(task, "blocked")}
            className="text-[12px] text-status-red hover:underline"
          >
            Mark blocked
          </button>
        )}
      </div>
    </li>
  );
}

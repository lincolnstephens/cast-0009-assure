import type { ReactNode } from "react";
import { useState } from "react";
import type { AreaPage } from "@maximus/shared";
import { TASK_COLUMNS } from "@maximus/shared";
import { formatDateGB } from "../../lib/format";
import { RagMark } from "./RagMark";

type AreaTask = AreaPage["tasks"][number];

/**
 * The task table: the six questions, What/How/Who/When/Done/Status, in that
 * order, from TASK_COLUMNS - never renamed. Desktop renders a table; at
 * phone width it becomes a card per task carrying the same six labels, so
 * nothing scrolls sideways. Rows expand to show notes, evidence links and
 * the Record entry the task produced.
 */
export function TaskTable({ tasks }: { tasks: AreaTask[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggle(id: string) {
    setExpanded((cur) => (cur === id ? null : id));
  }

  if (tasks.length === 0) {
    return (
      <div
        data-testid="task-table"
        className="rounded border border-client-line bg-client-surface p-4 text-[13px] text-client-muted"
      >
        No tasks in this area yet.
      </div>
    );
  }

  return (
    <div>
      {/* sm and up: a table carrying the six questions as header cells. */}
      <table
        data-testid="task-table"
        className="hidden w-full border-collapse text-[13px] sm:table"
      >
        <thead>
          <tr>
            {TASK_COLUMNS.map((c) => (
              <th
                key={c}
                className="border-b border-client-line px-2 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-client-muted"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} expanded={expanded === t.id} onToggle={() => toggle(t.id)} />
          ))}
        </tbody>
      </table>

      {/* Below sm: cards, the same six labels, no horizontal overflow. */}
      {/* below sm: the same six labelled on every card. */}
      <div data-testid="task-cards" className="space-y-3 sm:hidden">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} expanded={expanded === t.id} onToggle={() => toggle(t.id)} />
        ))}
      </div>
    </div>
  );
}

function Detail({ task }: { task: AreaTask }) {
  return (
    <div className="space-y-1.5 text-[12px] text-client-muted">
      <p>
        <span className="font-mono text-[10px] uppercase tracking-wider">Notes</span>
        <br />
        {task.notes ? task.notes : "No notes."}
      </p>
      <div>
        <span className="font-mono text-[10px] uppercase tracking-wider">Evidence</span>
        {task.evidence.length > 0 ? (
          <ul className="mt-0.5 list-disc space-y-0.5 pl-4">
            {task.evidence.map((link, i) => (
              <li key={i}>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-client-accent underline"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No evidence links.</p>
        )}
      </div>
      <p>
        <span className="font-mono text-[10px] uppercase tracking-wider">Record entry</span>
        <br />
        {task.recordEntryId ? task.recordEntryId : "No Record entry yet."}
      </p>
    </div>
  );
}

function HowValue({ task }: { task: AreaTask }) {
  // "How (link)": where the task points at a policy section or procedure,
  // jump to the "How we do it" section of this same area page rather than
  // inventing a URL the API never sent.
  if (task.howLink) {
    return (
      <a href="#how-we-do-it" className="text-client-accent underline">
        {task.how}
      </a>
    );
  }
  return <>{task.how}</>;
}

function TaskRow({
  task,
  expanded,
  onToggle,
}: {
  task: AreaTask;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        data-testid="task-row"
        className="cursor-pointer align-top hover:bg-client-bg"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <Td>{task.title}</Td>
        <Td>
          <HowValue task={task} />
        </Td>
        <Td>{task.ownerLabel}</Td>
        <Td className="whitespace-nowrap font-mono">
          {task.dueAt ? formatDateGB(task.dueAt) : "always on"}
        </Td>
        <Td className="whitespace-nowrap font-mono">
          {task.closedAt ? formatDateGB(task.closedAt) : "Not yet"}
        </Td>
        <Td>
          <div className="flex flex-wrap items-center gap-2">
            <RagMark rag={task.rag} label={task.ragLabel} />
            <span>{task.statusLabel}</span>
          </div>
        </Td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={TASK_COLUMNS.length} className="border-b border-client-line bg-client-bg px-2 py-3">
            <Detail task={task} />
          </td>
        </tr>
      )}
    </>
  );
}

function TaskCard({
  task,
  expanded,
  onToggle,
}: {
  task: AreaTask;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <article data-testid="task-row" className="rounded border border-client-line bg-client-surface p-3">
      <button type="button" onClick={onToggle} className="w-full text-left" aria-expanded={expanded}>
        <Field label="What">{task.title}</Field>
        <Field label="How">
          <HowValue task={task} />
        </Field>
        <Field label="Who">{task.ownerLabel}</Field>
        <Field label="When" mono>
          {task.dueAt ? formatDateGB(task.dueAt) : "always on"}
        </Field>
        <Field label="Done" mono>
          {task.closedAt ? formatDateGB(task.closedAt) : "Not yet"}
        </Field>
        <div className="mt-1.5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-client-muted">Status</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <RagMark rag={task.rag} label={task.ragLabel} />
            <span className="text-[13px] text-client-text">{task.statusLabel}</span>
          </div>
        </div>
      </button>
      {expanded && (
        <div className="mt-2 border-t border-client-line pt-2">
          <Detail task={task} />
        </div>
      )}
    </article>
  );
}

function Field({
  label,
  mono = false,
  children,
}: {
  label: string;
  mono?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mt-1.5 first:mt-0">
      <p className="font-mono text-[10px] uppercase tracking-wider text-client-muted">{label}</p>
      <p className={`text-[13px] text-client-text ${mono ? "font-mono" : ""}`}>{children}</p>
    </div>
  );
}

function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`border-b border-client-line px-2 py-2 align-top ${className}`}>{children}</td>;
}

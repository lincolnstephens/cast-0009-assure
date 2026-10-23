import { TASK_STATUS_LABEL, type Rag, type TaskStatus } from "./tracker.ts";

/**
 * v1.9 (FRAGO 09 3.3). One mark per task, as the operator drew them: a green
 * tick for done, a grey circle for not started, an amber circle for in
 * progress, and red with its word for overdue or blocked in any state but
 * done. The separate RAG lamp beside the status column is retired; its
 * meaning moves into the mark and the words.
 *
 * The words are always present, so colour never carries the meaning alone,
 * and a mark's colour never contradicts its word: amber only ever says "In
 * progress", green only "Done", grey only "Not started" or "Not applicable",
 * red only "Overdue" or "Blocked". "Due soon" survives as words after the
 * state, never as a colour of its own.
 */
export type StatusMarkKind = "done" | "not_started" | "in_progress" | "red" | "not_applicable";

export interface TaskStatusMark {
  mark: StatusMarkKind;
  /** The full words shown beside the mark ("Overdue, in progress"). */
  word: string;
}

/** Days ahead of its date in which an open task reads "due soon". Same window as the server's taskRag. */
export const DUE_SOON_WINDOW_DAYS = 14;

function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(fromIso + "T00:00:00Z");
  const b = Date.parse(toIso + "T00:00:00Z");
  return Math.round((b - a) / 86_400_000);
}

/**
 * One task's RAG from its status and date, as at a YYYY-MM-DD date. The
 * server's taskRag is this rule; the operator's pages, which receive tasks
 * without a computed RAG, use it directly so the two sides cannot disagree.
 */
export function taskRagFor(status: TaskStatus, dueAt: string | null, asAt: string): Rag {
  if (status === "not_applicable") return "grey";
  if (status === "done") return "green";
  if (status === "blocked") return "red";
  if (!dueAt) return "green";
  if (dueAt < asAt) return "red";
  if (daysBetween(asAt, dueAt) <= DUE_SOON_WINDOW_DAYS) return "amber";
  return "green";
}

/** The mark and words for one task, from its status and its RAG. */
export function taskStatusMark(status: TaskStatus, rag: Rag): TaskStatusMark {
  if (status === "done") return { mark: "done", word: TASK_STATUS_LABEL.done };
  if (status === "not_applicable") return { mark: "not_applicable", word: TASK_STATUS_LABEL.not_applicable };
  if (status === "blocked") return { mark: "red", word: TASK_STATUS_LABEL.blocked };
  const state = status === "in_progress" ? "in_progress" : "not_started";
  const stateWord = TASK_STATUS_LABEL[state];
  if (rag === "red") return { mark: "red", word: `Overdue, ${stateWord.toLowerCase()}` };
  if (rag === "amber") return { mark: state, word: `${stateWord}, due soon` };
  return { mark: state, word: stateWord };
}

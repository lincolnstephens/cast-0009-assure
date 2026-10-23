import { describe, expect, it } from "vitest";
import { taskRagFor, taskStatusMark, type Rag, type TaskStatus } from "@maximus/shared";
import type { TaskRecord } from "../src/db/model.ts";
import { taskRag } from "../src/lib/tracker.ts";

/**
 * v1.9 (FRAGO 09 3.3). One mark per task: green tick done, grey circle not
 * started, amber circle in progress, red with its word for overdue or
 * blocked. The words are always present and the colour never contradicts
 * them.
 */
const STATUSES: TaskStatus[] = ["not_started", "in_progress", "blocked", "done", "not_applicable"];
const RAGS: Rag[] = ["green", "amber", "red", "grey"];

/** The only words each mark may carry. */
const WORDS_FOR: Record<string, RegExp> = {
  done: /^Done$/,
  not_started: /^Not started(, due soon)?$/,
  in_progress: /^In progress(, due soon)?$/,
  red: /^(Blocked|Overdue, (not started|in progress))$/,
  not_applicable: /^Not applicable$/,
};

describe("v1.9 status marks (FRAGO 09 3.3)", () => {
  it("maps each state as the operator drew it", () => {
    expect(taskStatusMark("done", "green")).toEqual({ mark: "done", word: "Done" });
    expect(taskStatusMark("not_started", "green")).toEqual({ mark: "not_started", word: "Not started" });
    expect(taskStatusMark("in_progress", "green")).toEqual({ mark: "in_progress", word: "In progress" });
    expect(taskStatusMark("blocked", "red")).toEqual({ mark: "red", word: "Blocked" });
    expect(taskStatusMark("in_progress", "red")).toEqual({ mark: "red", word: "Overdue, in progress" });
    expect(taskStatusMark("not_started", "red")).toEqual({ mark: "red", word: "Overdue, not started" });
    expect(taskStatusMark("not_applicable", "grey")).toEqual({ mark: "not_applicable", word: "Not applicable" });
  });

  it("keeps due soon as words after the state, never as a colour of its own", () => {
    expect(taskStatusMark("in_progress", "amber")).toEqual({ mark: "in_progress", word: "In progress, due soon" });
    expect(taskStatusMark("not_started", "amber")).toEqual({ mark: "not_started", word: "Not started, due soon" });
  });

  it("never lets a mark's colour contradict its word, for any status and RAG", () => {
    for (const s of STATUSES) {
      for (const r of RAGS) {
        const { mark, word } = taskStatusMark(s, r);
        expect(word, `${s}/${r}`).toMatch(WORDS_FOR[mark]!);
      }
    }
  });

  it("reads a task's RAG exactly as the server's taskRag does", () => {
    const asAt = "2026-10-21";
    const dates = [null, "2026-09-01", "2026-10-20", "2026-10-21", "2026-10-30", "2026-11-04", "2026-11-05", "2027-03-21"];
    for (const status of STATUSES) {
      for (const dueAt of dates) {
        const t = { status, dueAt } as TaskRecord;
        expect(taskRagFor(status, dueAt, asAt), `${status} ${dueAt}`).toBe(taskRag(t, asAt));
      }
    }
  });
});

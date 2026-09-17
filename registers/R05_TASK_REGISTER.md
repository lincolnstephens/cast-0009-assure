---
document: R5_TASK_REGISTER
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: R5
instantiated_by: Seagull, opened empty at Phase 1, kept current to Phase 6
usage: Every task issued to a cell: to whom, what, why, by when, what it hands to, and its status. Append-only. Nothing sits with Seagull.
---

# TASK REGISTER

Every output from every cell is TASK, CIR, DECISION, RISK or CM and is routed. This register holds the tasks. A task that is not here was not issued, and a cell is not accountable for it.

A task states what to achieve and why. It does not state how. A cell that receives a task decides method within its lane and may challenge the task upward, once, in one sentence, then executes.

## Columns

| Column | What goes in it |
|---|---|
| Time | Date and 24-hour time the task was issued. |
| ID | `T-{{NN}}`, sequential, never reused. |
| To | The cell. One cell owns each task; a task owned by two is two tasks. |
| Task | What to achieve, in one sentence, in the imperative. No method. |
| Why | The effect it serves: which decisive condition, which line of operation, or which paragraph of the order. |
| By when | The time it is needed, expressed against a gate, a freeze or H-hour, not a working day. |
| Hands to | The cell or product that receives the output, and in what typed form. This is the hand-off in the main effort thread. |
| Source | Where the task came from: the estimate question, the order paragraph, or the fragmentary order. |
| Status | Issued; Accepted; Challenged (with the challenge and the answer); In hand; Delivered (with what was delivered and where it is); Cut (with the row in R2); Failed (with the shortfall reported). |

## Rule for who appends

Seagull issues and appends. A cell appends its own re-tasking within its lane, and appends a row when it hands work to another cell laterally, keeping Seagull informed rather than asking permission. A cell updates only the Status column of its own rows, and updates it the moment the status changes, not at a review. Nobody quietly narrows a task: a cell that cannot deliver what it was tasked says so at once, in the Status column and up the layer, with what it can deliver instead.

## The register

| Time | ID | To | Task | Why | By when | Hands to | Source | Status |
|---|---|---|---|---|---|---|---|---|
| {{YYYY-MM-DD HH:MM}} | T-01 | {{CELL}} | {{WHAT_TO_ACHIEVE}} | {{DECISIVE_CONDITION_OR_PARAGRAPH}} | Before {{GATE_OR_H_HOUR}} | {{CELL}}, as {{TYPED_OUTPUT}} | {{ORDER_PARAGRAPH}} | Issued |

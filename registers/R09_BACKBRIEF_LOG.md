---
document: R9_BACKBRIEF_LOG
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: R9
instantiated_by: Seagull, opened empty at Phase 1, kept current to Phase 6
usage: Every one-line back-brief sent up a layer, in order. Append-only. One line per delegated decision of consequence, within the working day.
---

# BACKBRIEF LOG

Direction runs down one layer at a time; challenge and back-brief go up one layer at a time. Every delegated decision of consequence goes up within the working day, in one line: what was decided, why, what it costs. This register holds those lines in the order they were sent.

Three things are back-briefed and they are different sizes. One line per delegated decision, within the working day. One page per gate, which is T16. One page at battle inspection, which is T17. This register records all three as rows, and points at the page where the row is a page.

## Columns

| Column | What goes in it |
|---|---|
| Time | Date and 24-hour time the back-brief was sent, not the time the decision was taken. |
| From | The layer sending: a cell, or Seagull. |
| To | The layer receiving. One layer up, always. A cell does not back-brief Sunray. |
| Type | Decision line; Gate page; Inspection page; Shortfall; Challenge answered. |
| The line | The back-brief itself, verbatim, in one sentence: what was decided, why, what it costs. Where the type is a page, this is the bottom line of that page and the column Points at names the document. |
| Points at | The row in R1, the gate result in R10, or the document, so the back-brief can be traced to the thing it reports. |
| Acknowledged | Time the layer above acknowledged, or `None`. Silence is not a veto and an unacknowledged back-brief does not stop anything. |

## Rule for who appends

The sender appends, at the time of sending. A cell appends its own lines to Seagull. Seagull appends its own lines to Sunray. Nobody appends on behalf of a layer they do not sit in, and nobody edits another layer's line. The receiving layer fills only the Acknowledged column.

Seagull audits the log against R1 at every gate: every decision in R1 marked as consequential must have a line here within the working day, and a decision without one is a shortfall on Seagull, not on the cell.

## The log

| Time | From | To | Type | The line | Points at | Acknowledged |
|---|---|---|---|---|---|---|
| {{YYYY-MM-DD HH:MM}} | {{CELL}} | Seagull | Decision line | {{WHAT_WAS_DECIDED}}, because {{WHY}}, costing {{COST}}. | R1 D-{{NN}} | {{YYYY-MM-DD HH:MM}} |

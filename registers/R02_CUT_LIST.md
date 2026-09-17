---
document: R2_CUT_LIST
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: R2
instantiated_by: Seagull, opened empty at Phase 1, kept current to Phase 6
usage: Every scope cut taken to hold H-hour. Append-only. Cuts are taken in the pre-agreed order and the ask is never cut.
---

# CUT LIST

Scope removed to hold H-hour. The order is fixed before the build starts, by the preloaded decision that sets it, and is followed. Seventy-five per cent at H-hour beats a hundred per cent after it.

**The ask is never cut.** Neither is anything Annex A names as a thing the commander will not accept.

## Columns

| Column | What goes in it |
|---|---|
| Time | Date and 24-hour time the cut was taken. |
| Cut | What was removed, named as the component, task or capability it was, not as a category. |
| Why | What it was cut to protect: the hour, a gate, a decisive condition, or capacity. |
| Cost to intent | What the intent loses. Stated against Annex A, in one sentence. `None` is not a permitted entry; if a cut costs nothing it was not scope. |
| Cut order position | Its number in the pre-agreed cut order, and the preloaded decision that set that order. `Out of order` where it was taken out of sequence, with the reason. |
| Restorable | Whether it can come back in a later iteration, and what it would take. |

## Rule for who appends

Seagull appends. Cutting scope is a delegated decision reserved to Seagull, so no cell removes its own work from the plan; a cell that cannot deliver says so at once with what it can deliver instead, and Seagull decides the cut. Every row here also has a row in R1 DECISION_LOG. Sunray is back-briefed on every cut within the working day and at the next battle inspection.

## The list

| Time | Cut | Why | Cost to intent | Cut order position | Restorable |
|---|---|---|---|---|---|
| {{YYYY-MM-DD HH:MM}} | {{WHAT_WAS_REMOVED}} | {{WHAT_IT_PROTECTED}} | {{WHAT_THE_INTENT_LOSES}} | {{N}} of {{TOTAL}}, per preloaded {{Dn}} | Yes, in {{ITERATION}}, needs {{WHAT}} |

---
document: R3_RISK_REGISTER
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: R3
instantiated_by: Seagull, opened empty at Phase 1, kept current to Phase 6
usage: Every output typed RISK. Append-only. One row per risk, with the earliest point it bites and the treatment already in place.
---

# RISK REGISTER

A risk is a thing that has not happened and would cost the intent if it did. A thing that has already happened is a shortfall and is reported, not logged here. A risk with no treatment is not a risk entry, it is a decision waiting to be taken.

## Columns

| Column | What goes in it |
|---|---|
| # | Sequential, never reused. |
| Risk | One sentence. What could happen, and the consequence to the intent. Where the risk is a question the room will ask, write it as the question. |
| Owner | The cell that holds it, and the cell it is shared with where it crosses a lane. Named as `{{CELL}}` or `{{CELL}} with {{CELL}}`. |
| Earliest point it bites | The moment it first costs something: a gate, a freeze, H-hour, or a named point in the run. Not a date unless the date is the point. |
| Treatment | What is already in place, stated as a fact, not an intention. Where the treatment is a rule the gate enforces, say which gate line. |
| Status | Open, Open and mitigated, Realised (with the row in R1 or the shortfall report), or Closed with the reason. |

## Rule for who appends

Any cell appends a risk in its own lane the moment it is known, without asking and without waiting for a review. Report risk and shortfall the moment it is known is a standing instruction to every branch. Seagull appends risks that cross lanes, owns the ranking, and carries the top of the register into every battle inspection. A cell may not close another cell's risk. Sunray closes nothing; he is told.

## The register

| # | Risk | Owner | Earliest point it bites | Treatment | Status |
|---|---|---|---|---|---|
| 1 | {{WHAT_COULD_HAPPEN_AND_WHAT_IT_COSTS}} | {{CELL}} with {{CELL}} | {{GATE_FREEZE_OR_MOMENT}} | {{WHAT_IS_ALREADY_IN_PLACE}} | Open |

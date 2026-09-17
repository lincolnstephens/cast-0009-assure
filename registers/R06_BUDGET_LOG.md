---
document: R6_BUDGET_LOG
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: R6
instantiated_by: G8 Commercial, opened empty at Phase 1, kept current to Phase 6
usage: Every pound against the cap, and every zero-cost decision that could have cost. Append-only. The cap is a hard ceiling and waits for Sunray however long it takes.
---

# BUDGET LOG

**Cap for this session: {{SESSION_CAP}}.** *Set by the preloaded decision that governs it. An unattended session defaults to zero.*
**Cap for the operation: {{SPEND_CAP}} cumulative.** Held by Seagull, kept by G8.

Any spend that would breach the cumulative cap is reserved to Sunray and is a hard ceiling. It waits for Sunray however long it takes, because it cannot be undone. The silence rule does not apply. Breach is submitted by T27 IRTB.

**Zero-cost rows are required.** Every decision that could have cost and did not is logged at £0.00, with the free path that was taken. A log with no zero rows has not been kept.

## Columns

| Column | What goes in it |
|---|---|
| Time | Date and 24-hour time the spend was committed, not when it was invoiced. |
| Item | What was bought or what was decided not to buy, and which component or task it serves. Where nothing was purchased, say what free path was taken instead. |
| Amount | In pounds, to two decimal places, ex VAT, or £0.00. |
| Cumulative | Running total against the operation cap, after this row. |
| Authority | The preloaded decision, the IRTB reference, or Sunray's decision with its time. Every non-zero row cites one. |

## Rule for who appends

G8 appends, and appends the moment spend is committed. Any cell that needs to spend does not spend: it raises T27 IRTB through G8 and waits. G8 also appends the zero rows at the close of its own tasking and at each gate, confirming the cap is held. Nobody else writes to this register. Seagull audits it at every gate and reports the cumulative figure at every battle inspection.

## The log

| Time | Item | Amount | Cumulative | Authority |
|---|---|---|---|---|
| {{YYYY-MM-DD HH:MM}} | {{WHAT_WAS_COMMITTED_OR_THE_FREE_PATH_TAKEN}}, serving {{COMPONENT_OR_TASK}} | £0.00 | £0.00 | Preloaded {{Dn}}. G8 confirms cap held. |

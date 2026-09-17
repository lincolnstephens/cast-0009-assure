---
document: R4_CIR_REGISTER
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: R4
instantiated_by: G2 Intelligence, opened empty at Phase 1, kept current to Phase 6
usage: Critical Information Requirements. Things we do not know that would change the plan. Append-only, ranked, each with the latest time it is of use.
---

# CRITICAL INFORMATION REQUIREMENTS

Things we do not know that would change the plan. A fact that would not change the plan is not a CIR, however interesting it is. Every CIR has a latest time of use, after which it is closed as overtaken whether or not it was answered.

## Columns

| Column | What goes in it |
|---|---|
| # | Sequential, never reused. |
| CIR | The thing not known, written as a question or as a statement of the gap. One sentence. |
| Why it changes the plan | What would be decided differently depending on the answer. If nothing would, it is not a CIR. |
| Owner | The cell that will answer it, or Sunray where answering it requires contact and is therefore a hard ceiling. |
| Latest time of use | The point after which the answer no longer changes anything: before a named gate, before freeze, before H-hour. |
| Status | Open; Open and mitigated (the build already works around it, say how); Answered (with the answer and its source and date); Assumed (with the assumption made and who made it); Overtaken. |

## Rule for who appends

G2 owns and maintains this register and ranks it. Any cell raises a CIR in its own lane and appends it; G2 ranks it into the order and may merge it with an existing row, noting the merge. Only the owner marks a row Answered, and an answer carries a source and a date to the grading standard G2 sets. Where a CIR can only be answered by contacting a third party, it is not answered by the staff: it goes to Sunray as a hard ceiling, or it is carried into the room as a question to be asked from the front, which G2 recommends by default.

## Ranking

*The order of value, restated in one line whenever the register changes, with the single fact that most changes the plan named first and why.*

## The register

| # | CIR | Why it changes the plan | Owner | Latest time of use | Status |
|---|---|---|---|---|---|
| 1 | {{WHAT_IS_NOT_KNOWN}} | {{WHAT_WOULD_BE_DECIDED_DIFFERENTLY}} | {{CELL_OR_SUNRAY}} | Before {{GATE_OR_FREEZE}} | Open |

## Note on method

*Where a CIR cannot be answered without breaching a hard ceiling, say so here, say which ones are answerable in the room by asking, and record G2's recommendation on whether they are carried as questions rather than guessed at.*

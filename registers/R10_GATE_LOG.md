---
document: R10_GATE_LOG
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: R10
instantiated_by: G7 Readiness and assurance, opened empty at Phase 1, kept current to Phase 6
usage: Every gate run: time, build, result per line of the definition of done, and where the build was deployed. Append-only. Nothing reaches inspection that fails the gate.
---

# GATE LOG

The gate executes the definition of done against the product, by driving it, and reports pass or fail per line. A gate that counts features is a floor, not a standard. Every run is logged, including the runs that failed, because the failures are the record that the standard was held.

**Two rows per run.** A summary row in the run table, and one row per definition-of-done line in the line table beneath it, keyed to the run.

## Columns, run table

| Column | What goes in it |
|---|---|
| Time | Date and 24-hour time the gate finished. |
| Run | `G-{{NN}}`, sequential, never reused. |
| Iteration | The iteration and the fragmentary order the definition of done came from. |
| Build | The commit or build identifier the gate ran against. Not a description. |
| Lines | Passed of total, as `{{N}} of {{N}}`. |
| Result | PASS or FAIL. A gate with any line failed is FAIL, whatever the count. |
| Deployed where | The environment or artefact the passing build went to, or `Not deployed`. A failing build is never deployed. |
| Fix cycles | How many fix cycles this iteration has now had. Seagull stops and writes the back-brief early if the gate cannot be passed after two. |
| Points at | The gate output, the screenshots or renders, and the T16 gate back-brief where one was written. |

## Columns, line table

| Column | What goes in it |
|---|---|
| Run | The run this line belongs to. |
| Line | The number of the definition-of-done line, as written in the fragmentary order. |
| What it tests | The line itself, quoted, in the terms it was written: the product in a stranger's hands. |
| Method | Driven, inspected, or string-tested. A line that can only be inspected is marked so, because it is weaker evidence. |
| Result | Pass or Fail. |
| Note | On a fail, what was observed, not what is believed to be wrong. On a pass of a line that was previously failed, the change that fixed it. |

## Rule for who appends

G7 appends, and only G7. G7 holds the gate and is the last gate before freeze. No cell records its own pass, and no cell may mark its own work as gate-passed. After freeze, G7 also appends a row for every breakage fix passed, so the freeze can be audited afterwards: the build, the fix, and the confirmation that Seagull was told.

Sunray does not append. He inspects the result at the battle inspection and passes or rejects the iteration, and his decision is recorded in R1, not here.

## Runs

| Time | Run | Iteration | Build | Lines | Result | Deployed where | Fix cycles | Points at |
|---|---|---|---|---|---|---|---|---|
| {{YYYY-MM-DD HH:MM}} | G-01 | {{ITERATION}}, per {{FRAGO}} | {{BUILD_ID}} | {{N}} of {{N}} | PASS | {{ENVIRONMENT_OR_ARTEFACT}} | 0 | {{GATE_OUTPUT_PATH}} |

## Lines

| Run | Line | What it tests | Method | Result | Note |
|---|---|---|---|---|---|
| G-01 | 1 | {{DEFINITION_OF_DONE_LINE_QUOTED}} | Driven | Pass | {{NOTE}} |

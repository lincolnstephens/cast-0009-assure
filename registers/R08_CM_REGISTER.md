---
document: R8_CM_REGISTER
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: R8
instantiated_by: Seagull, opened at Phase 1 with the standing control measures in force, kept current to Phase 6
usage: The control measures in force for this operation, and every addition or revisit, with Sunray's mark. Append-only.
---

# CONTROL MEASURE REGISTER

Control measures are minimal by design. A control measure exists only where the cost of being wrong is not recoverable before H-hour, or damages a relationship that outlasts the operation. Anything not listed here is deliberately open, and G7's red team enforces the intent by test rather than by rule.

This register opens with the standing set from the canon, instantiated with this operation's values, and then holds every addition, revisit and closure as a new row.

## Columns

| Column | What goes in it |
|---|---|
| Time | Date and 24-hour time the row was created. |
| CM | `CM-{{NN}}` for a named control measure, or the standing name (Budget, External contact, Model allocation, Freeze, Licence hygiene, Keys and secrets). |
| In force | What the measure requires, in one or two sentences, as a rule that can be tested. Not a principle. |
| Applies to | The cells, products or components bound by it. |
| Owner | The cell that enforces it, and the gate line that tests it where one exists. |
| Type | Standing (from the canon), Operation (added for this operation), Revisit (amending an earlier row, which it cites), or Closed. |
| Sunray's mark | AUTHENTICATED, ALTERED (with what changed), or STRUCK. A control measure without a mark is proposed, not in force. |

## Rule for who appends

Seagull appends. A cell that believes a control measure is needed proposes it to Seagull with the cost of being wrong stated; Seagull adds the row and brings it to Sunray for a mark, because a change to the operating model is reserved. A cell may not add, widen, narrow or waive a control measure in its own lane. Sunray marks; nobody marks on his behalf. Where the silence interval passes on a proposed measure, Seagull decides against Annex A, records the decision in R1, and the row is marked at the next inspection.

Revisits are new rows. No row is edited once marked.

## The register

| Time | CM | In force | Applies to | Owner | Type | Sunray's mark |
|---|---|---|---|---|---|---|
| {{YYYY-MM-DD HH:MM}} | Budget | Cumulative cap of {{SPEND_CAP}}, session cap {{SESSION_CAP}}. Breach by T27 IRTB to Sunray. Hard ceiling. | All cells | G8 | Standing | AUTHENTICATED |
| {{YYYY-MM-DD HH:MM}} | External contact | Contact means transmission. Drafting for a third party is free and expected. Sending is the ceiling and waits for Sunray. | All cells | Seagull | Standing | AUTHENTICATED |
| {{YYYY-MM-DD HH:MM}} | CM-01 | Third-party data. Every fact stated on the product carries source and date to G2's grading standard. Directory data directional only. Inference labelled. Nothing confidential asserted. No other client's data or name anywhere in the product. | G2, G6, G9 | G2, tested at the gate | Standing | AUTHENTICATED |
| {{YYYY-MM-DD HH:MM}} | CM-02 | Sensitive capability. Any capability whose live use against {{SUBJECT}} would expose them, breach a licence or a contract, or create a commitment MITMARK cannot honour is shown as concept, and run live only against MITMARK's own footprint where the intent allows. | {{CELLS}} | G7 | Standing, first-pass decision, Sunray may revisit | AUTHENTICATED |
| {{YYYY-MM-DD HH:MM}} | CM-{{NN}} | {{WHAT_THE_RULE_REQUIRES}} | {{CELLS}} | {{CELL}}, gate line {{N}} | Operation | {{MARK}} |

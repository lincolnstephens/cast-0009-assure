---
document: T28_OUTCOME_RECORD
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: T28
instantiated_by: Sunray, at the close of Phase 4
usage: One line at the close of the engagement, with the supporting fields beneath it. What was achieved against the end state, what was not, why, the next date, and whether a budget holder or decision owner was named. Phase 5 does not open without it.
---

# OUTCOME RECORD: {{CODENAME}}

*Frontmatter for the instantiated document also carries: status RECORDED by Sunray with the date and time; h_hour {{H_HOUR}}; the higher commander's name or role; who reported the outcome and how.*

## The line

*One sentence. What was achieved, what was not, and why. It is written before anything else on this page and it is not softened afterwards. This sentence is what the operation is remembered by and it is what Phase 5 and Phase 6 both work from.*

> {{THE_LINE}}

---

## Achieved against each end state line

*One row per line of Annex A's end state, in the order Annex A gives them. No line is merged, reworded or omitted. Achieved means it is true now, not that it is on track. Evidence is what a stranger could check.*

| # | End state line, as written in Annex A | Achieved | Evidence | Note |
|---|---|---|---|---|
| 1 | {{END_STATE_LINE}} | Yes / No / Partly | {{EVIDENCE}} | {{NOTE}} |

## Not achieved

*One row per line marked No or Partly above. Why is a cause, not a description of the failure. Recoverable says whether it can still be achieved after H-hour and by what.*

| # | What was not achieved | Why | Recoverable | By what, and by when |
|---|---|---|---|---|
| {{N}} | {{SHORTFALL}} | {{CAUSE}} | Yes / No | {{ROUTE}} |

## The named answer

| Field | Entry |
|---|---|
| A budget holder or decision owner was named | Yes / No |
| Name or role given, as given | {{NAME_OR_ROLE}} |
| Named by whom, in the room | {{WHO}} |
| A next date was given | Yes / No |
| The next date, as given | {{DATE}} |
| Where each was recorded on the day | {{WHERE}} |
| Which sequel this triggers under T23 | Yes / Not yet / No |

*Where no owner and no date were given, say so plainly in both rows and do not record an intention as an answer. A name without a date, or a date without a name, is recorded as what it is.*

## What the higher commander said

*The outcome as reported, in the reporter's own words, without improvement. Two or three sentences at most. Anything Sunray adds is marked as Sunray's, separately.*

## Standing conditions at close

| Field | Entry |
|---|---|
| Product state at H-hour | *Ran as built / ran with a named fallback / did not run. One line on which and why.* |
| Anything said that was not in the pack | {{WHAT}} |
| Anything promised in the room | {{WHAT}}, and whether MITMARK can keep it |
| Relationship state | *One line. Intact, improved, or at risk, and what the evidence is.* |
| Hard ceilings breached at H-hour | None / {{WHICH}}, with the IRTB reference |
| Cumulative spend at close | {{AMOUNT}} of {{SPEND_CAP}} |

## Routed from here

- The sequel named above is executed by G5 under T23. Phase 5 opens on this record.
- Anything under "recoverable" becomes a task in R5 TASK_REGISTER, owned and dated.
- Anything promised in the room that MITMARK cannot yet keep becomes a risk in R3 RISK_REGISTER before Phase 5 begins.
- This record is an input to T29 AFTER_ACTION_REVIEW and is not rewritten there.

**Authenticated by Sunray.** {{DATE_AND_TIME}}

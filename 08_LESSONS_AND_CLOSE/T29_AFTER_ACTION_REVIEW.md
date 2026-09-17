---
document: T29_AFTER_ACTION_REVIEW
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: T29
instantiated_by: Seagull, Phase 6; Sunray authenticates
usage: What was asked, what was delivered, where the cycle held and where it bent, the decisions to take differently, the changes proposed to canon and templates, the memory to file, and what is stripped before archive. The operation does not close without it.
---

# AFTER ACTION REVIEW: {{CODENAME}}

*Frontmatter for the instantiated document also carries: status DRAFT for Sunray, then AUTHENTICATED with the date; date; h_hour {{H_HOUR}}; the phase dates from Phase 0 open to Phase 5 close; who contributed, by cell.*

## 1. Bottom line

*Three to five bullets. Whether the intent was achieved, at what cost, what the cycle got right that would not have happened without it, and the single change that would most improve the next operation. Written last, placed first.*

## 2. What was asked

*The higher commander's intent in his own words, quoted from Annex A: purpose, main effort and end state. Then, in one line, what Sunray's Interpretation Note added that the commander did not say. This section reproduces; it does not reinterpret.*

## 3. What was delivered

*What existed at H-hour, against the product list in the Document Register. One line each on the product itself, the operator brief, the ask and the after. Then the outcome line, quoted verbatim from T28 OUTCOME_RECORD and not rewritten.*

| Product | Required at exit | Existed at H-hour | Note |
|---|---|---|---|
| {{PRODUCT}} | Yes | Yes / No | {{NOTE}} |

## 4. Where the cycle held

*One entry per part of the cycle that did its job. Name the mechanism, not the person. The test is whether the outcome would have been worse without it.*

| Mechanism | What it did | Evidence |
|---|---|---|
| {{MECHANISM}} | {{WHAT_IT_DID}} | {{EVIDENCE}} |

## 5. Where the cycle bent

*One entry per place the cycle did not work as written: a phase that ran out of order, a decision right that was ambiguous in practice, a gate that measured the wrong thing, a register that was not kept, a product that was produced and never used. State what bent, what it cost, and whether the fix is a change to the cycle or a change to how it was run. The two are different and the difference matters.*

| What bent | What it cost | Cycle change or execution change | Proposed fix |
|---|---|---|---|
| {{WHAT}} | {{COST}} | Cycle / Execution | {{FIX}} |

## 6. Decisions to take differently

*One entry per decision, delegated or reserved, that would be taken differently now. Take them from R1 DECISION_LOG in order. A decision that was right on the information available and wrong in outcome is recorded as right, with the information that was missing named as a CIR that should have been raised. This section is not a list of regrets; it is a list of causes.*

| # | Decision, as logged | Taken by | Would now be | Why | What it would have cost or saved |
|---|---|---|---|---|---|
| {{N}} | {{DECISION}} | {{WHO}} | {{ALTERNATIVE}} | {{WHY}} | {{COST}} |

## 7. Proposed changes to canon and templates

*One row per change. Document is the register id and file name. Change is what the words become, specific enough to apply without a further conversation. Reason cites the section above that produced it. Nothing goes in this table that is not traceable to section 5 or 6.*

| Document | Change | Reason |
|---|---|---|
| {{REGISTER_ID}} {{DOCUMENT}} | {{CHANGE}} | {{SECTION_REFERENCE}} |

**Applied by.** Seagull, on Sunray's authentication, into the standing pack. Each applied change is recorded in S7 SEAGULL_CYCLE_06_LESSONS against this operation's codename, with the date it was applied and the version it produced. A proposed change that Sunray strikes is recorded there too, with the reason, so it is not proposed again unexamined.

## 8. Memory to file

*What belongs to Sunray and survives the operation, as distinct from what belongs to the operation and does not. One row each. Nothing here carries the subject's name, any individual's name, or any figure specific to the operation.*

| What | Why it is worth keeping | Where it is filed |
|---|---|---|
| {{DURABLE_FACT_OR_PATTERN}} | {{WHY}} | {{LOCATION}} |

## 9. What to strip before archive

*The list of everything removed from anything reusable, checked line by line before the pack is archived and before any template touched by this operation is returned to the standing set. The list of terms itself is held by Sunray and is not reproduced in the archived pack.*

| Category | Present in | Action | Checked by |
|---|---|---|---|
| Subject, client or audience name | {{FILES}} | Replace with {{SUBJECT}} | {{WHO}} |
| Any individual's name | {{FILES}} | Replace with the role | {{WHO}} |
| Site, address or location list | {{FILES}} | Replace with a placeholder | {{WHO}} |
| Any other client's name | {{FILES}} | Remove | {{WHO}} |
| Figures, prices and rates | {{FILES}} | Remove or replace with a placeholder | {{WHO}} |
| Addresses, project names and key names | {{FILES}} | Remove | {{WHO}} |
| Specific H-hour and dates | {{FILES}} | Replace with {{H_HOUR}} | {{WHO}} |

**Archive rule.** The pack is archived whole, with its registers, under `archive/`. The stripping above applies to anything leaving the pack for the standing template set, not to the archive itself, which keeps the record intact.

## 10. Closure

| Field | Entry |
|---|---|
| Sunray authenticates this review | {{DATE_AND_TIME}} |
| Canon changes authenticated | {{WHICH}} |
| Template changes authenticated | {{WHICH}} |
| S7 LESSONS updated | Yes / No |
| Pack archived | {{LOCATION}} |
| Operation closed | {{DATE_AND_TIME}} |

---
document: INTERPRETATION_NOTE
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: T3
instantiated_by: Sunray, Phase 0
usage: Sunray's translation of the intent for Seagull. Working authority, not canon. It is what makes Annex A operable by a machine staff without Sunray in the loop.
---

# {{CODENAME}} INTERPRETATION NOTE

| Field | Entry |
|---|---|
| Operation codename | {{CODENAME}} |
| Written by | Sunray |
| Date | {{NOTE_DATE}} |
| Sits beneath | {{CODENAME}} Higher Commander's Intent (Annex A), {{ANNEX_A_VERSION}} |
| Status | Working authority. Not canon. Where this note appears to conflict with Annex A, Annex A wins and this note is corrected. |

*Instantiate one per operation, immediately after Annex A is authenticated. Written by Sunray for Seagull. Every ambiguity in the intent is resolved here rather than during the build, so that no cell stalls and no cell invents. Seagull may quote it in orders; it is never quoted to the higher commander as his words.*

## 1. Ambiguities and how they are resolved

*Every place where Annex A can be read two ways and the difference changes what gets built. One row per ambiguity. The resolution is Sunray's and it is final for this operation unless Sunray reopens it. Anything not resolved here is a reserved decision and appears in section 11.*

| # | Annex A reference | The ambiguity | Resolved as | Reasoning, one line |
|---|---|---|---|---|
| 1 | A_ | | | |
| 2 | A_ | | | |

## 2. The quality bar in testable terms

*The commander's standard, restated as numbered lines that can be executed against a product by driving it rather than by reading it. Written before any build starts. Each line describes the product in a stranger's hands and can be answered yes or no by someone who was not in the room. This is the source from which every iteration's definition of done is written, and it is the section the canon's section 10 exists to enforce.*

1. 
2. 
3. 

*Where the commander's standard is not yet known in these terms, say so here and state the standard Sunray is setting in his place, so that Seagull restates it in every fragmentary order.*

## 3. H-hour

| Field | Entry |
|---|---|
| H-hour, date | {{H_HOUR_DATE}} |
| H-hour, clock time | {{H_HOUR_TIME}} *or "unknown, assume {{H_HOUR_ASSUMPTION}}", stated as an assumption the build works to* |
| Timezone | {{TIMEZONE}} |
| Freeze point | {{FREEZE_POINT}} *or "set by G3, back-briefed to Sunray"* |
| What happens if H-hour cannot be held | *Held and scope cut, per the cut order. State it explicitly; the default is that H-hour does not move.* |

## 4. Hard ceiling values

*The two ceilings from the canon, with this operation's values. They are never waived by silence and never delegated. A task that needs either is not done until Sunray answers, however long that takes.*

| Ceiling | Value for this operation | Held by | Logged in |
|---|---|---|---|
| Cumulative spend cap | {{SPEND_CAP}} | Seagull | R6 BUDGET_LOG |
| External contact | {{EXTERNAL_CONTACT_RULE}} *State the rule in the form "contact means transmission; drafting is free and expected, sending is the ceiling", and name any category of contact that is permitted, if any.* | Sunray | R1 DECISION_LOG |

*Breach of either is submitted by IRTB (Issue, Recommendation, Timings, Background) to Sunray. Nothing is spent and nothing is sent while the submission is open.*

## 5. Silence interval

| Field | Entry |
|---|---|
| Silence interval | {{SILENCE_INTERVAL}} *default thirty minutes* |
| Applies to | Reserved items 1, 4, 5, 6 and 7. Items 2 and 3 are hard ceilings and wait however long it takes. |
| Behaviour on expiry | The layer below interprets against Annex A, decides, allocates, and back-briefs in one line to R9. |
| For an unattended session | The silence rule collapses to the Preloaded Decisions. Anything not covered there is decided by Seagull against Annex A and logged in R1. |
| How Sunray is reached inside the interval | {{CONTACT_METHOD}} |

## 6. Ground truth sources

*The authoritative sources Sunray names for what exists, what is concept, and everything the product asserts as fact. A source not named here is not ground truth, whatever else it may be useful for. Absent material is treated as absent and the part of the product that depended on it becomes concept.*

| Source | What it is authoritative for | Held by | Provided to which cells, when |
|---|---|---|---|
| | | | |

| Field | Entry |
|---|---|
| What exists and can be shown live | |
| What is concept and is shown as designed | |
| Where the line between the two falls | |
| Front door: which name is the firm, which is the engine | MITMARK is the firm and the design authority. Tessera is the engine. *State any operation-specific addition.* |
| Human capacity available | {{CAPACITY}} *This governs how far the honest layer can grow before {{H_HOUR}}.* |

## 7. The subject, and what may be said about it

*Feeds CM-01. The subject is the client, audience or target of the operation: {{SUBJECT}}. State the boundary of what the product may assert about the subject and to what evidence standard, and state what must never appear.*

| Field | Entry |
|---|---|
| The subject | {{SUBJECT}} |
| Foundation source for subject information | {{SUBJECT_SOURCE}} |
| Evidence standard | Primary and reputable secondary sources stated as fact with source and date; directory data directional only; inference labelled as inference; unknowns carried as questions; nothing confidential asserted. |
| Further sources permitted | *Named here or graded by G2 to the standard above.* |
| Never appears in the product | Any other client's data. Any other client's name. Anything the subject has not made public that would embarrass them in front of a colleague. |
| Who enforces | G2 grades and may veto any figure. G9 holds the relationship veto. G7's gate tests for source and date on every stated fact. |

## 8. Sensitive capabilities

*Feeds CM-02. Any capability whose live use against {{SUBJECT}} would expose them, breach a licence or a contract, or create a commitment the firm cannot honour. First-pass decision; Sunray may revisit.*

| Capability | Against the subject | Against the firm's own footprint | Material required, and where it is placed |
|---|---|---|---|
| {{CAPABILITY}} | *Concept only, shown as designed / permitted live, with conditions* | *Permitted live so the audience sees it working / not used* | *Named file or folder in `material/`. Absent means concept.* |

*Any document or corpus that must never be opened by the build is named here explicitly.*

## 9. What the commander did not say, but Sunray knows

*Material the staff needs and Annex A does not contain. Drawn from section 5 and section 6 of the Intent Capture Record. Each line marked as Sunray's knowledge, not the commander's instruction, so that no cell mistakes it for intent. Where a line would change what the commander asked for, it is an ambiguity and belongs in section 1 instead.*

- 
- 

## 10. Ratification status

| Field | Entry |
|---|---|
| Annex A ratified by the higher commander | *Yes, on {{RATIFICATION_DATE}} / no, and he will not be consulted again before {{H_HOUR}}* |
| This note ratified | Not applicable. This note is Sunray's and is never put to the higher commander. |
| Who may reopen the intent | Sunray alone. |
| What happens if the commander gives fresh direction before H-hour | It is captured as an addendum to the Intent Capture Record, Annex A is reissued, and this note is corrected within the same working period. |

## 11. What remains Sunray's

*The decisions that are not delegated even with this note in force, and the actions only Sunray can take. Seagull does not attempt these and does not wait on them where the work can proceed around them.*

| # | What | Why it stays with Sunray | Latest useful time |
|---|---|---|---|
| 1 | | | |
| 2 | | | |

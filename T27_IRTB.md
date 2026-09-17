---
document: T27_IRTB
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: T27
instantiated_by: G8 Commercial holds it; any cell submits, at any phase
usage: Issue, Recommendation, Timings, Background. The submission that breaches either hard ceiling: spend above the cap, or contact with a third party and anything that commits MITMARK or SIG externally. One page. Nothing is committed until Sunray answers.
---

# IRTB: Issue, Recommendation, Timings, Background

**When to use this.** Any proposed spend that would take cumulative spend above {{SESSION_CAP}} in this session, or above {{SPEND_CAP}} across the operation. Any contact with a real person outside MITMARK and SIG, and anything that commits either firm externally. Both are hard ceilings. They wait for Sunray however long it takes and whatever it costs at H-hour, because they cannot be undone. The silence rule does not apply and {{SILENCE_INTERVAL}} of silence is not approval.

**Before submitting, answer this.** Is there a free path? "The source needs a key" means find the keyless one. Is there a path that does not require contact? Drafting is free; only sending is the ceiling. A cell may answer no and stop for exactly two reasons, and cost is one of them. Submit only when the free path, or the no-contact path, has been looked for and does not exist.

**Route.** G8 drafts, Seagull sees it, Sunray decides. One page. Nothing is committed until Sunray answers.

---

## SUBMISSION

**Reference:** IRTB-{{NN}}  |  **Raised by:** {{CELL}}  |  **Date and time:** {{TIME}}
**Ceiling breached:** spend / external contact / both
**Amount:** {{AMOUNT}}  |  **Cumulative if approved:** {{CUMULATIVE}} of {{SPEND_CAP}}  |  **Recurring or one-off:** {{WHICH}}
**Counterparty, where the ceiling is contact:** {{WHO}}  |  **Medium and exact wording attached:** yes / no

### ISSUE

One sentence. What cannot be delivered without this, and which decisive condition or component it belongs to. State the shortfall, not the purchase.

### RECOMMENDATION

What to buy or send, from or to whom, at what price, on what terms, and who holds the payment method or the account. Then, in order:

- **The free path, or the no-contact path.** What was tried, why it does not work. If nothing was tried, this submission is not ready.
- **The cheaper path.** The next option down and what is lost by taking it.
- **Do nothing.** What the product looks like if this is refused, and which cut in the cut order absorbs it. The ask is never cut.
- **G8's recommendation.** One of the above, named, with one line of reasoning against Annex A.

### TIMINGS

- Latest time a decision is useful: {{TIME}}
- Time from approval to the thing working: {{DURATION}}
- What happens after that time if no answer: state the fallback that runs automatically. There is always one, and it is the do-nothing option above.
- Reversible: yes or no. If no, say what is unrecoverable.

### BACKGROUND

Five lines at most.

- Which line of operation and which decisive condition this serves.
- What has already been spent, cumulatively, and on what.
- Why this was not foreseen at the estimate.
- Any commitment, subscription, licence term or data-sharing condition attached. Anything that binds MITMARK or SIG externally is the second reserved matter and must be named here.
- Risk of approving, in one line. Where the ceiling is contact, this line names the relationship at risk and whether it outlasts the operation.

---

## DECISION

| Field | Entry |
|---|---|
| Sunray's decision | APPROVED / APPROVED WITH LIMIT {{AMOUNT}} / REFUSED |
| Conditions | |
| Time of decision | |

On approval: G8 logs the spend in R6 BUDGET_LOG the moment it is committed, not when it is invoiced, and back-briefs Seagull in one line into R9. Where the ceiling was contact, the transmission and its exact wording are logged in R1 DECISION_LOG. On refusal: G8 confirms the fallback is running and tells the cell affected within the hour. A refusal is not an obstacle. It is a description of the first path.

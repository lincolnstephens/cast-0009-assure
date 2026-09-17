---
document: T30_COMMERCIAL_FOLLOW_THROUGH
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: T30
instantiated_by: G8 Commercial with G5 Plans, Phase 5
usage: The cover for the commercial work that follows a yes. It names the four products, says which the outcome demands, and fixes the section headings each must carry. It holds no figure itself and never becomes the paper.
---

# COMMERCIAL FOLLOW THROUGH: {{CODENAME}}

*This is a cover. It is instantiated at the top of Phase 5, once T28 OUTCOME_RECORD exists, and it points at four products. It carries no price, no rate, no margin and no target. Every figure lives in the pricing model and is quoted from there into the papers, never from paper to paper.*

## 1. What the outcome demands

| Product | Demanded by this outcome | Owner | By when | Status |
|---|---|---|---|---|
| A. Pricing paper | Yes / No | G8 | {{DATE}} | {{STATUS}} |
| B. Pricing model | Yes / No | G8 | {{DATE}} | {{STATUS}} |
| C. Proposal | Yes / No | G8 with G9 | {{DATE}} | {{STATUS}} |
| D. Go-to-market plan | Yes / No | G5 with G8 and G9 | {{DATE}} | {{STATUS}} |

*One line per No, saying why it is not demanded. A product not demanded is not drafted "for completeness".*

## 2. Standing rules for all four

- **Sending is Sunray's ceiling.** Drafting is free and expected. Nothing goes to a client, a partner or a third party until Sunray says so, and the decision is logged in R1.
- **One source of figures.** The pricing model is the only place a number is set. The pricing paper, the proposal and the plan quote it and cite the sheet and cell they came from. A figure that appears in two places and disagrees is a defect.
- **Fact, uncertainty, judgement are separated** in every paper, in those words, so a reader can tell which is which without asking.
- **Every external figure carries its source and its retrieval date.** Marketplace list prices are ceilings and are labelled as such.
- **Placeholders are named as placeholders** and carry the work that would replace them.
- House rules apply throughout: British English, plain and factual, no em dashes, no sales language, MITMARK is the firm and {{PRODUCT}} is the engine.
- Where the commercial work outgrows this operation's canon, it becomes a new operation with its own Phase 0 rather than a longer Phase 5. Seagull decides which, and records it.

---

## A. Pricing paper

*Internal. For Sunray. Working figures, not a price list issued to any client. Frontmatter carries a companion line naming the pricing model file, so the two are never separated.*

Section headings, in this order:

1. **The problem.** What is not yet known, and what stays shut until it is.
2. **Bottom line.** The window, the target for {{SUBJECT}}, the entry point, whether margin holds, and how the position reads against the market. Bullets, no prose.
3. **Structure.** How the price is built up: the recurring unit, what is included in it, what is added per unit of scale, the feature modules, the support tiers, the one-off items, and the terms. State which unit was chosen and why the market default was rejected.
4. **The cost stack.** Fixed costs shared across clients, variable costs per unit, and which cost line dominates. Say at what point the target margin is reached and show the curve.
5. **Fact, uncertainty, judgement.** Sourced facts with their retrieval date; what is not published anywhere and is therefore an assumption; the judgements taken and why.
6. **Risks.** Capacity, anchoring, placeholders, and any hosting, region or data-term risk. One line each with the treatment.
7. **Material limitations.** Retrieval date, currency assumption, and the plain statement that no figure has been tested with a buyer.
8. **Smallest next decision.** One decision for Sunray, from which everything else follows.

## B. Pricing model

*The live model. Every figure in the pricing paper comes from it. Held as a spreadsheet, versioned with the paper.*

Sheets, in this order:

1. **Rate card.** Every price, with the editable cells marked. Prices are changed here and nowhere else.
2. **Cost stack.** Fixed and variable costs, with the assumption behind each and its confidence.
3. **Configuration.** The named client's configuration built from the rate card, producing the target and the year-one total.
4. **Portfolio.** Contribution and gross margin across one, two, three and four clients, showing where the target margin arrives.
5. **Benchmarks.** Every comparator with its source, its date, and whether it is list, median or negotiated.
6. **Sensitivity.** The two or three assumptions that move the margin most, and what happens at their plausible extremes.

## C. Proposal

*Outward. Drafted free, sent only on Sunray's authority. It is the first document {{SUBJECT}} receives that carries a number, so everything in it is quoted from the model.*

Section headings, in this order:

1. **What you asked for.** Their words, from the room, not ours.
2. **What we propose.** The offer named, its length, and MITMARK's role.
3. **What it produces.** The artefacts, in the same words as T21 THE_ASK (a) and T23 SEQUELS. They do not drift between documents.
4. **How it runs.** The phases inside the work, the checkpoint rhythm, and the named owner required on their side.
5. **The boundary.** What would ever connect, what would not, and who owns that decision. Agreed in writing before anything connects.
6. **What it costs.** The figure, its basis, what is included and what is not, the terms, and what happens after the work if they continue. One page.
7. **What you own.** The outputs are theirs; they may tender the build against them to any firm.
8. **Who does it.** By role, honestly, at the size MITMARK actually is. No implied delivery team.
9. **What we need from you.** The named owner, the start date, and the decision required.
10. **Assumptions and exclusions.** Everything the price depends on, stated plainly.

## D. Go-to-market plan

*Internal. An operating plan Sunray executes, not a paper for a client and not a paper for the higher commander. It uses the order's paragraph map, because it is an order.*

Section headings, in this order:

1. **The problem this plan solves.** Including the dependency being ended.
2. **Bottom line.** The ladder, the centre of gravity, what sets the target, the channels that carry the plan, and the blockers that must close.
3. **Situation.** The market, sourced and dated. The competition, fact and judgement separated. Own forces, including what is absent. The constraint, stated as arithmetic.
4. **Mission.** One sentence: who will achieve what, by when, by what means, in order to what.
5. **Execution.** Intent, being purpose, method and end state. Operational design, being both centres of gravity, decisive conditions with the line each belongs to, main effort, and culmination with the cut order. Concept of operations by phase with dates. Segments and targets in priority. The offer as spoken. Channels with the weekly effort each takes and what it is for. Partner motion. Branches, one per objection likely to be met. Tasks to cells with dates. Coordinating instructions, including the battle rhythm, the measures reported, the decision points, the freeze rule and the sending ceiling.
6. **Service support.** Proof assets with their cost and route, spend to be authorised, capacity, and the sales cycle to plan on.
7. **Command and signal.** Who commands, who holds the picture, who drafts, what is reported and when.
8. **Fact, uncertainty, judgement.**
9. **Material limitations.** Including anything unresolved at the time of writing and what would cause the plan to be re-issued.
10. **Smallest next decision.** One decision, with its date, from which everything else follows.

---

## 3. Routing

- Every figure decided goes to R6 BUDGET_LOG where it commits spend, and to R1 DECISION_LOG where it commits a position.
- Every task in the plan goes to R5 TASK_REGISTER with an owner and a date.
- Every risk in the paper or the plan goes to R3 RISK_REGISTER.
- Any spend or any transmission raises T27 IRTB and waits for Sunray.
- When the four products are issued and the plan is running, Seagull records whether Phase 5 continues under this canon or opens a new operation.

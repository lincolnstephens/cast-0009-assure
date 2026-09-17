---
document: ESTIMATE
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: T10
instantiated_by: Seagull with the cells, Phase 2 Design
usage: The seven questions answered in three columns for one operation, every output typed and routed. Written as the estimate runs, not after it. Closes at Q7 and is extracted into the Operation Order (T11) by the paragraph map.
---

# THE ESTIMATE, OPERATION {{CODENAME}}

*Instruction: fill the header line with time zone, the references this estimate rests on (the operation's Read First, Annex A, the Interpretation Note, the visual and design standard, the Preloaded Decisions and their authentication state, the registers), and the time the estimate opened.*

Time zone: {{TIME_ZONE}}. References: {{REFERENCES}}. Opened {{ESTIMATE_OPEN_TIME}}.

## How to use this document

Every question is answered in three columns.

| Factor | So what | Therefore |
|---|---|---|
| What is true. A fact, a constraint, a piece of ground, a thing we own or do not. | The deduction. What it means for us, tested against Annex A. Ends with "so what for the intent." | The output. A task, a Critical Information Requirement, a decision for Sunray, a risk, or a control measure. |

Column logic: this, therefore, so what, therefore. A row that does not produce a Therefore is deleted. A Therefore that does not serve the intent is deleted.

Outputs are typed so they route correctly.

- **TASK** to a named G-cell, with what and why.
- **CIR** a thing we need to know that changes the plan. Assigned to G2 unless another cell owns the source.
- **DECISION** for Sunray, submitted as options with a recommendation. The silence interval applies except to the two hard ceilings.
- **RISK** with owner and the earliest point it bites.
- **CM** a control measure, only if the estimate exposes a genuine need. The canon's control measures are the presumption.

**The five tests.** Every row in every question is held against these before it is kept.

- Does the Therefore serve the end state in Annex A?
- Can {{HIGHER_COMMANDER}} carry it, alone, unrehearsed?
- Is it built from what we own, or is it honestly marked as concept?
- Is it reusable for the further audiences the intent names?
- Would we still be trusted in a year if we did it?

If a row fails any test, it is cut or rewritten. Nobody argues for a row that fails.

**The estimate is not the plan.** It is the reasoning that produces the plan. It is not complete. It is good enough to start, and it is revisited when the situation changes. It is not a gate. Cells start work on the strength of a Q3 task; they do not wait for Q7.

## Q1. What is the situation and how does it affect us? ({{Q1_OWNER}}, normally G2, with G8 on the commercial ground)

*Instruction: the picture of the ground in three columns. Cover the audience and who is in the room; {{SUBJECT}} as an organisation and as an estate or a problem; the specific ground the product concerns and everything around it; what we own and what is concept; who else could hold the position we are asking for and what they would say; the commercial position, what an ask of this shape looks like to {{SUBJECT}} and what the budget holder can and cannot sign. Every fact graded and dated to the standard G2 sets, per CM-01. Ends with the ranked CIR list.*

| Factor | So what | Therefore |
|---|---|---|
| *{{FACT}}: a stated fact about the environment, with source and date.* | *The deduction, ending "so what for the intent".* | *TASK / CIR / DECISION / RISK / CM, routed to a named cell or to Sunray.* |
| | | |
| | | |

**Both centres of gravity.** *Theirs: the source of {{SUBJECT}}'s decision to fund, act or agree, as G2 confirms or corrects it. Ours: the thing we cannot lose, normally {{HIGHER_COMMANDER}}'s ability to carry the product alone and credibly.*

**Most likely and most dangerous courses of action.** *One line each, with where the counter is scripted.*

**Critical information requirements, ranked.** *The unknowns that would change the plan, each with owner and the latest time it can be used. Routed to R4.*

| CIR | What we need to know | Why it changes the plan | Owner | Latest time of use |
|---|---|---|---|---|
| CIR-1 | | | | |

## Q2. What have we been told to do and why? (Seagull)

*Instruction: mission analysis of Annex A. Take each element of the intent in turn, purpose, method, main effort, end state, unacceptables, freedoms, then the ceilings, the time and the resources. One row per element. The specified tasks are the things Annex A says in terms; the implied tasks are the things that must be done for the specified tasks to be possible, and are normally most of the work.*

| Factor | So what | Therefore |
|---|---|---|
| *{{HIGHER_COMMANDER}}'s purpose (Annex A section on purpose), restated in his words.* | | |
| *{{HIGHER_COMMANDER}}'s method (Annex A), restated.* | | |
| *Main effort (Annex A), and what it beats when the two compete.* | | |
| *End state (Annex A), broken into the conditions that must be true.* | | |
| *Unacceptables (Annex A): what the commander will not accept. These are the gate.* | | |
| *Specified tasks, listed in the commander's terms.* | | |
| *Implied tasks, derived.* | | |
| *Freedoms (Annex A): what is delegated.* | | |
| *Hard ceilings: spend above {{SPEND_CAP}}; contact with any real person outside MITMARK and SIG.* | | |
| *Time: session opened {{SESSION_OPEN}}; inspection {{INSPECTION_TIME}}; H-hour {{H_HOUR}}.* | | |
| *Resources: human capacity, the cells, what exists, what is licensed, what is held.* | | |

**Mission statement.** *One sentence, in the form: who, what, when, where, why. "Seagull, with the cells, will deliver by {{H_HOUR_MINUS}} to {{DELIVERY_POINT}} a {{ITERATION}} of {{PRODUCT}} for {{SUBJECT}}, honest where it is live and visibly designed where it is not, in order to give {{HIGHER_COMMANDER}} an asset he can carry alone at {{H_HOUR}} and leave with {{END_STATE_IN_ONE_CLAUSE}}."*

**Timeline, backwards from H-hour.**

| Time | Event | Owner |
|---|---|---|
| {{H_HOUR}} | *The higher commander executes.* | {{HIGHER_COMMANDER}} |
| *H minus n* | *The product and the operator brief are in his hands.* | Sunray |
| | *Sunray's go or no-go (reserved item 5).* | Sunray |
| | *Freeze.* | G3 |
| | *Gate passed, back-brief written, committed.* | G7, Seagull |
| | *Build.* | *Cells* |
| | *Estimate, order, data pack.* | Seagull, G2, G8 |

## Q3. What effects must we achieve, and what direction do we give? (Seagull)

*Instruction: the effects in priority, each traced to a decisive condition, each with what it needs and from whom. Name the main effort and say plainly which effects support it. Where an effect is the condition of all the others rather than one among them, say so and say how it is enforced, normally by the gate rather than by rank.*

| Factor | So what | Therefore |
|---|---|---|
| *The presumed effects, listed, with which decisive condition each reaches.* | *Confirmed, corrected or added to. State the priority order and the reasoning.* | *The main effort. The supporting effects in order.* |
| *Effect 1 ({{DC}}). Needs: the parts, with the owning cell and whether each is done.* | | |
| *Effect 2 ({{DC}}). Needs:* | | |
| *Effect 3 ({{DC}}). Needs:* | | |
| *Effect 4 ({{DC}}). Needs:* | | |
| *Effect 5 ({{DC}}). Needs:* | | |
| *Build sequence, from Sunray's direction: the order in which the work is done and the order in which the gate is run.* | | |

**Seagull's intent, one level below {{HIGHER_COMMANDER}}'s.** *Purpose, method, end state, in three sentences. Purpose: what must be true in Sunray's hands at the inspection. Method: the sequence, the main effort in every phase, the cut order, commit at every gate, log every decision and cut. End state: named artefacts in named places, gate passed, back-brief written last and honest.*

**Tasks to cells from Q3.** *See the Operation Order paragraph 3d for the consolidated list. Record here the time each cell was tasked and on what input, since cells are tasked as their inputs become available and do not wait for the full set.*

## Q4. Where best is each effect achieved? ({{Q4_OWNER}}, normally G3, with G7 red team and G9)

*Instruction: "where" means on which component, at which moment in the run, on which capability. The adversary is the sceptical audience. For each effect, give the audience's most likely objection and their most dangerous objection, and what counters each without a promise we cannot keep. Produces the component-to-effect map and the first cut of the run order.*

| Factor | So what | Therefore |
|---|---|---|
| *{{EFFECT}}: where it is achieved, on what, at what moment.* | *Most likely objection. Most dangerous objection.* | *TASK: the counter, scripted where, by whom.* |
| | | |

**Component-to-effect map.** *Every effect has a place in the run and every component serves an effect. Any component that serves none is on the cut list.*

| Component | Effect served | Moment in the run | Layer (live or designed) |
|---|---|---|---|
| | | | |

## Q5. What resources do we need? (Seagull, with G1, G4 and G8)

*Instruction: model allocation, human capacity and where it is irreplaceable, existing assets and licences, time, and whether any Therefore in the estimate would breach the spend cap. Produces the task organisation weighted to the main effort thread and opens G8's budget log.*

| Factor | So what | Therefore |
|---|---|---|
| *Model allocation: frontier models to hard reasoning, lighter models to routine work. Name which cells sit where.* | | |
| *Human capacity: how many, when available, and the list of things only that human can do.* | | |
| *Existing assets: the token system, marks and wordmarks, held infrastructure, keyless public data, tooling.* | | |
| *Time: opened, gates, freeze, H-hour, and how much machine time remains to the first inspection.* | | |
| *Refused or unavailable sources and what replaced each.* | | |

### Task organisation (G1)

| Cell | Model | Task this session | Hands to | Status |
|---|---|---|---|---|
| G1 People | | *Task organisation; the list of things only Sunray or {{HIGHER_COMMANDER}} can give* | Back-brief section 9 | |
| G2 Intelligence | | | | |
| G3 Operations | | | | |
| G4 Infrastructure | | | | |
| G5 Plans | | | | |
| G6 Engineering | | | | |
| G7 Readiness | | | | |
| G8 Commercial | | | | |
| G9 Client and narrative | | | | |

*Where a light cell's work is absorbed by Seagull, say so in the Model column rather than leaving the row out.*

## Q6. When and where, in relation to each other? (Seagull, with G3)

*Instruction: backwards from H-hour. What is sequential and what is concurrent. Where one cell's output is another's input. The points at which a decision must go to Sunray, and by when.*

### Synchronisation matrix

*Instruction: cells across the top, time down the side, outputs and hand-offs in the cells. Leave a cell blank where that cell is not working in that slot. Write it as planned before the work and mark it "as executed" when the estimate closes.*

| Time | G1 | G2 | G3 | G4 | G5 | G6 | G7 | G8 | G9 | Seagull |
|---|---|---|---|---|---|---|---|---|---|---|
| {{SLOT_1}} | | | | | | | | | | |
| {{SLOT_2}} | | | | | | | | | | |
| {{SLOT_3}} | | | | | | | | | | |
| {{SLOT_4}} | | | | | | | | | | |
| {{SLOT_5}} | | | | | | | | | | |
| {{SLOT_6}} | | | | | | | | | | |
| {{SLOT_7}} | | | | | | | | | | |

### Decision points

| DP | Decision | Latest time | Taken by | Result |
|---|---|---|---|---|
| DP1 | | | *Seagull under {{PRELOADED_DECISION_REF}} / Sunray (reserved item n)* | |
| DP2 | | | | |
| DP3 | | | | |
| DP4 | | | | |
| DP5 | *Freeze* | *At gate PASS* | G3 | |
| DP6 | *Go or no-go* | | Sunray (reserved item 5) | *Open* |

## Q7. What control measures do we need? (Seagull)

*Instruction: confirm the canon's control measures are sufficient. Add nothing unless Q1 to Q6 exposed a cost that is not recoverable before H-hour or damages a relationship that outlasts the operation. State the reporting rhythm as it will run. Close with the must-not-forget list.*

| Factor | So what | Therefore |
|---|---|---|
| *The canon's control measure set, listed: budget, external contact, CM-01 third-party data, CM-02 sensitive capability, model allocation, freeze, licence hygiene, keys and secrets, and what is deliberately open.* | *Whether Q1 to Q6 exposed any cost the set does not already cover.* | *CM: confirmed sufficient, or the addition submitted to Sunray as an IRTB.* |
| *Anything the estimate surfaced that looks like a control measure but is a test or a matter of professional judgement.* | *Kept as a test or as guidance, not elevated.* | *No CM.* |
| *Reporting rhythm: one typed summary per cell on completion; decisions of consequence logged by the cell that took them; Seagull routes and commits. Nothing sits with Seagull.* | | *CM: the same rhythm for the next iteration.* |
| **Must-not-forget list.** | | *The numbered list below.* |

**Must-not-forget list.**

*Instruction: the things that are nobody's task and will sink the operation if forgotten. Each one is a single imperative line. Typical shape: the outstanding CIRs by number; Sunray's go or no-go; the physical acts of handover (print the operator brief, copy the product onto the machine it will run on, open it once from that machine, test the fallback address on that machine); and the standing prohibitions restated (nothing sent to anyone at {{SUBJECT}}, nothing spent above {{SPEND_CAP}}).*

1.
2.
3.
4.
5.
6.
7.

Estimate closed at {{ESTIMATE_CLOSE_TIME}}.

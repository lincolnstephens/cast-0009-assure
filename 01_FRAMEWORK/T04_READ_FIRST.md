---
document: READ_FIRST
version: v1.1
status: AUTHENTICATED by Sunray, 2026-09-07, on Seagull's recommendation. Layout reconciliation to the CAST phase-folder structure stands. Placeholders remain unfilled: Phase 0 has not run.
authority: Seagull
sits_beneath: COI-001 (Tier 0), then KBD-001, BCD-001, AEF-001, CAST-001, CCP-001 (Tier 1), then SEAGULL_CYCLE_00_CANON v1.0
register_id: T4
instantiated_by: Seagull, CAST-001 Phase 1 (mission analysis), authenticated by Sunray at Phase 2
layout: CAST phase folders govern. This document stays at `01_FRAMEWORK/T04_READ_FIRST.md` and is not renamed or moved.
usage: This job's canon. Filled in place, derived in its entirety from the Higher Commander's Intent at Annex A. Every section is present in every instantiation.
---

<!--
INSTANTIATION FRONTMATTER. Replace this block with the job's own YAML frontmatter, in this shape:

document: {{CONTROL_NO}}_{{CODENAME}}_READ_FIRST
version: v1.0
status: CANON. Authenticated by {{SUNRAY_NAME}} (Sunray), {{AUTHENTICATION_DATE}}. Closes CAST-001 Phase 2, authentication.
authority: Seagull, Chief of Staff, under delegated authority from Sunray. Derived in its entirety from the Higher Commander's Intent (Annex A).
supersedes: {{SUPERSEDED_DOCUMENTS}}
date: {{DATE}}
h_hour: {{H_HOUR}}
audience: All contributors, human and machine, to Operation {{CODENAME}} ({{CONTROL_NO}}). Read this before anything else.
usage: This is the single point of truth for the job. It sets out the whole framework in one place so that any contributor, joining at any point, can start work without asking. Everything in it derives from the Higher Commander's Intent at Annex A; if any section of this document is ever found to conflict with Annex A, Annex A wins and the section is corrected. Nothing inside the job outranks this document; the doctrine set outside it does. Branch outputs sit beneath it.
-->

# OPERATION {{CODENAME}} ({{CONTROL_NO}}), READ FIRST

## 0. How to use this document

Read it once, top to bottom. Then go to your lane and start. If something here does not answer your question, you have the authority to decide it yourself. That is not a gap; it is the design.

## 0.1 Where everything is

This job runs in the CAST phase-folder layout, not the Seagull Cycle session-pack layout. There is no `kb/` and no `outputs/`. Paths are relative to the job root.

| Folder | CAST-001 phase | What is in it |
|---|---|---|
| `00_INTENT/` | 0. Intent | T01 the brief as given, T02 the intent (Annex A), T03 the Interpretation Note, and `PHASE0_SELECTOR.md`, the permission envelope |
| `01_FRAMEWORK/` | 1. Mission analysis | This document, the standing orders, the preloaded decisions, the session setup note, and the nine agent templates in `agents/` |
| `02_ESTIMATE/` | 1, continued | The seven-question estimate and the courses of action |
| `03_GATE1_COA_DECISION/` | 4. HITL Gate 1 | The COA brief and Sunray's decision |
| `04_WARGAME_RESOURCING/` | 5. Wargame and resourcing | The wargame, the resourced plan, the design back-brief |
| `05_GATE2_LAUNCH/` | 6. HITL Gate 2 | The operation order and the resource allocation record |
| `06_EXECUTION/` | 7. Execution | Fragmentary orders, definition of done, the gate, gate back-brief, battle inspection, run order, actions on |
| `07_HANDOVER/` | 8. Handover | Operator brief, the ask, on-screen copy, sequels, leave-behind, follow-up draft, roadmap |
| `08_LESSONS_AND_CLOSE/` | 9. Lessons and close | Outcome record, after action review, lessons draft, commercial follow-through |
| `registers/` | all | This job's R01 to R10, append-only |
| `material/` | all | What Sunray has placed. Absent means concept |
| `T27_IRTB.md` | all | The breach submission for either hard ceiling, used from any phase |

Outside the job, and read but not edited during it: the doctrine set at `../../`, and the method and capability corpus at `../../SEAGULL_CYCLE/canon/` and `../../SEAGULL_CYCLE/standing/`. This job's row in the master log is at `../_JOB_INDEX.md`.

## 1. The operation in one paragraph

*One paragraph, written by Seagull, derived from Annex A sections A1 to A5. It states who does what at {{H_HOUR}}, in front of whom, with what, and what the single measure of success is. It names the near thing and the far thing if the intent distinguishes them. It is the paragraph a contributor joining at any hour reads to know what they are serving. No sales language, no adjectives that do not carry information.*

## 2. Mission command

This operation is run on mission command. The doctrine is short and it is not negotiable:

- **You are told what to achieve and why. How is yours.** Nobody above you will consult you on method unless you ask them to.
- **Authority is delegated by default and reserved by exception.** Section 6 lists the only things reserved. If it is not there, it is yours.
- **Freedoms, not controls.** The first build works to freedoms. A control measure exists only where the cost of being wrong is not recoverable before H-hour or damages a relationship that outlasts the operation.
- **Challenge upward, once, then execute.** Any contributor may test any task against the intent, in one sentence, to the layer above. If the answer is no, execute without relitigating.
- **Silence is not a veto.** Ask, wait {{SILENCE_INTERVAL}}, then decide and back-brief. Only the hard ceilings wait longer.
- **Break honestly.** If you cannot deliver what you were tasked, say so immediately, with what you can deliver instead. Nobody quietly narrows a task.
- **Seventy-five per cent at H-hour beats a hundred per cent after it.**

## 3. The intent

Full text in {{HIGHER_COMMANDER}}'s words at Annex A. Constructed from his verbal brief and authenticated by Sunray. *State here whether the higher commander will be consulted again before {{H_HOUR}} and who the sole interpreter is.* What follows is the summary; Annex A is the source.

**Purpose.** *One or two sentences from A2, compressed, no new content.*

**Method, in {{HIGHER_COMMANDER}}'s words.** *The constraints from A3 as a short run of clauses in his own phrasing.*

**Main effort.** *From A4, with the trade he named when it competes with something else.*

**End state.** *From A5, compressed to the conditions that are testable on the day.*

**What {{HIGHER_COMMANDER}} will not accept.** *From A7, as short lines, unmerged and unsoftened.*

**Note, authenticated with this document.** *Any A9 note that changes a build assumption, restated with the assumption that stands.*

## 4. Chain of command

| Tier | Who | Role | Callsign | Mil equivalent |
|---|---|---|---|---|
| 1 | {{HIGHER_COMMANDER}} | {{HIGHER_COMMANDER_ROLE}}. Sets the intent. Receives the finished product and the operator brief. | none | Chief of the General Staff |
| 2 | {{SUNRAY_NAME}} | Commands the operation. Sole interpreter of the intent. | Sunray | Divisional Commander |
| 3 | Seagull | Chief of Staff. Interprets Sunray's direction, apportions work, allocates resources, brings options with a recommendation on reserved matters, decides everything else. | Seagull | Chief of Staff, Divisional HQ |
| 4 | G1 to G9 | Staff branches. Own one question each. Full freedom of method within lane. | G-number | Divisional staff |

Direction runs {{HIGHER_COMMANDER}}, Sunray, Seagull, G-cells. Nothing skips a layer going down. Challenge goes up one layer at a time. Sunray does not manage G-cells directly; Seagull does not consult Sunray on method.

## 5. The staff

*State the small number of things that must be true at {{H_HOUR}}, derived from Annex A. Each branch owns a piece of one. No branch owns two.* Full definitions, authorities and freedoms at Annex B.

| Branch | Owns | Weight |
|---|---|---|
| G1 People | Who is on the build, capacity, access and permissions | *Light / Medium / Heavy for this operation* |
| G2 Intelligence | Everything factual the product rests on: the ground, {{SUBJECT}}, provenance of every figure, the line between real and concept | |
| G3 Operations | The delivery itself: run order, sequence, script, freeze point, H-hour | |
| G4 Infrastructure | Standing it up and keeping it up: hosting, deployment, fallback, the device it runs on | |
| G5 Plans | What happens after: sequels, roadmap, next date, reuse | |
| G6 Engineering | The engine: architecture, code, pipelines, integration | |
| G7 Readiness and assurance | Operability by the higher commander, the quality bar, the design standard, red team, the gate | |
| G8 Commercial | The ask: what exists versus what the money buys, the number, the deal, the budget log, the IRTB | |
| G9 Client and narrative | The story, positioning, relationship protection, leave-behind, follow-up, all outward words | |

*Where a branch is stood down for this operation, say so in its row and say who absorbs its lane.*

**Main effort thread.** *Write it as a chain of hand-offs between named cells, so each cell knows which thread it serves and in what order. Everyone else supports that thread.*

**Common to every branch.** You decide how. You are not asked to justify method or second-guessed on your specialism. Coordinate laterally and directly, keeping Seagull informed, not asking permission. Report risk and shortfall the moment it is known. You may not commit spend, commit MITMARK or SIG externally, contact any third party, change another branch's output without agreement, or quietly narrow a task.

## 6. Decision rights

**Delegated by default.** Seagull decides all questions of method, architecture, tooling, source selection, design, sequencing and staff organisation; tasks and re-tasks any cell; cuts scope to hold H-hour; rejects any output that fails the intent; commits spend up to {{SPEND_CAP}}. Each G-cell decides everything within its lane.

**Reserved to Sunray. These seven and nothing else:**

1. Interpretation of the intent where the ambiguity is material.
2. Any spend that would breach the {{SPEND_CAP}} cumulative cap. **Hard ceiling.**
3. Any contact with a real person outside MITMARK and SIG, and anything that commits either firm externally. **Hard ceiling.**
4. Anything that puts a relationship at risk that outlasts the operation.
5. Final go or no-go on the product before it goes to {{HIGHER_COMMANDER}}.
6. Changes to the operating model and hierarchy.
7. Authentication of canonical documents.

**Silence rule.** Applies to items 1, 4, 5, 6 and 7. Ask Sunray; if no answer within {{SILENCE_INTERVAL}}, the layer below interprets, decides and allocates, then back-briefs. Items 2 and 3 are hard ceilings and wait for Sunray however long it takes and whatever it costs at H-hour, because they cannot be undone.

**Back-brief.** Every delegated decision of consequence goes up one layer within the working day, in one line: what was decided, why, what it costs.

## 7. Control measures

Minimal by design. This section is the complete set; there is no separate control measures document.

- **Budget.** {{SPEND_CAP}} cumulative, held by Seagull, logged by G8. Breach by IRTB (Issue, Recommendation, Timings, Background) to Sunray.
- **External contact.** Contact means transmission. Drafting anything for a third party is free and expected. Sending it is the ceiling.
- **CM-01 Third-party data.** *Name the subject, {{SUBJECT}}, and the foundation source Sunray provides. State the evidence standard: primary and reputable secondary sources stated as fact with source and date, directory data directional only, inference labelled, nothing confidential asserted. State that no other client's data and no other client's name appear anywhere in the product. State what is free: the ground around the subject, open public data, the firm's own feeds.*
- **CM-02 Sensitive capability.** *Name each capability whose live use against {{SUBJECT}} would expose them, breach a licence or a contract, or create a commitment the firm cannot honour. State that it is shown as concept against the subject, and where the intent allows, run live only against MITMARK's own footprint so the audience sees it working. First-pass decision; Sunray may revisit.*
- **Model allocation.** Match the model to the task. Frontier models for hard reasoning, lighter models for routine work. Seagull allocates and records it in the agent definitions.
- **Freeze.** G3 sets it. After freeze only G7-passed breakage fixes go in.
- **Licence hygiene.** No source copied from a codebase whose licence MITMARK does not intend to inherit. The gate checks for it.
- **Keys and secrets.** Free-tier or already-held only unless the cap allows otherwise. Registered by name in the Key Register, held in the hosting environment, never committed, never rendered.
- **Deliberately open.** *Name what is deliberately left unruled for this operation. G7's red team enforces the intent by test, not by rule.*
- **Not adopted.** *Name any guardrail carried in reference material that is professional judgement for the owning cell and is not a control measure of this operation.*

## 8. Ground truth

Source: {{GROUND_TRUTH_SOURCE}}. *Reference material held by Sunray, placed in `material/` and provided to the named cells when the estimate opens. Absent means concept.*

**What exists.** *Each capability that can be shown live, one line each, with its state: live, in build, paid, owned by whom. This list is the ceiling on the honest layer.*

**What is concept.** *What does not exist today and is shown as designed, not built. This is what the money buys.*

**Where the line falls.** *One sentence naming exactly which parts of the product are the honest layer and which are the designed layer, in terms the gate can test.*

**Front door, authenticated.** MITMARK is the firm and the design authority. Tessera is the engine behind the picture. SIG is the consultancy. One group. *Add any operation-specific naming here.*

**Capacity.** {{CAPACITY}}. That governs how far the honest layer can grow before {{H_HOUR}}.

## 9. The room

*Who is present at {{H_HOUR}}, on both sides, by role. Mark anything unconfirmed as unconfirmed and route it to a CIR. Do not record third-party individuals beyond what the operation needs to shape the ask, and hold that detail to the CM-01 standard.*

**{{OUR_SIDE}}.** *Who operates the product, who else attends and in what role, who is advisory.*

**{{SUBJECT}}, unconfirmed.** *Who is expected, what each cares about, who holds or controls a budget, who is the technical validator, what is unknown. Sunray's action to confirm.*

**Working assumption.** *The assumption the build runs on until the CIR is answered, and which cells act on it.*

## 10. Documents and precedence

| Order | Document | Status |
|---|---|---|
| 0 | Direct, explicit instruction from Sunray on the matter in hand | Highest, per KBD-001 section 3. Written up afterwards so the record stays complete. |
| 1 | `../../COI-001_Canonical_Operating_Instruction_v1.1.docx` | Tier 0 canonical doctrine. Project-wide precedence. Outranks this document. |
| 2 | `../../KBD-001`, `../../BCD-001`, `../../AEF-001`, `../../CAST-001`, `../../CCP-001` | Tier 1 canonical instructions. Outrank this document. |
| 3 | `../../SEAGULL_CYCLE/canon/SEAGULL_CYCLE_00_CANON_v1.0.md` and `standing/` | The standing method. Governs how this job's canon is produced, and yields to it once produced. |
| 4 | `00_INTENT/PHASE0_SELECTOR.md` | The permission envelope, and the enforceable authority record COI-001 section 7 requires. Nothing in this job runs outside it. |
| 5 | This document, including Annex A and Annex B | Canon for this job. The single point of truth inside it. |
| 6 | `05_GATE2_LAUNCH/T11_OPERATION_ORDER.md`, then each fragmentary order in `06_EXECUTION/` in sequence | Canon beneath this document once confirmed. Later orders amend earlier ones. |
| 7 | `03_GATE1_COA_DECISION/SUNRAY_DECISION_RECORD.md` and `05_GATE2_LAUNCH/RESOURCE_ALLOCATION_RECORD.md` | The two HITL gate decisions. Authority for everything downstream of each gate. |
| none | {{REFERENCE_MATERIAL}} | Reference. Not canon. *One row per named reference source, with what it is authoritative for.* |
| none | Estimate, Preloaded Decisions, Interpretation Note | Working authority. Not canon. |
| none | Branch outputs | Beneath all of it. |

Within this document, Annex A wins any conflict. Outside it, the doctrine set wins and this document is corrected.

## 11. Open at close of mission analysis

*Numbered list of everything unresolved at the close of the framework, each with an owner and, where it is Sunray's, marked as Sunray's ceiling. An item here is either answered, assumed with the assumption stated, or cut.*

1. 
2. 

## 12. Standing guidance

*Annex A section A8, verbatim.*

Mission analysis is closed. On Sunray's authentication of this document, the job moves to concurrent branch planning and the estimate in `02_ESTIMATE/`, and from there to HITL Gate 1.

---

# ANNEX A, HIGHER COMMANDER'S INTENT

*Slot. Insert the authenticated {{CODENAME}} Higher Commander's Intent (T2) here in full, header block and headings A1 to A9, unaltered. It is not summarised, not reordered and not edited to fit this document. Where Annex A and any section above conflict, Annex A wins and the section above is corrected.*

<!-- INSERT T2 HERE, IN FULL -->

---

# ANNEX B, ROLES, AUTHORITIES AND FREEDOMS

*Full definitions for every layer. Section 6 of the main document lists what is reserved; everything not reserved is delegated to the layer facing it.*

## B1. Command roles

### B1.1 {{HIGHER_COMMANDER}}, CGS

**Responsibilities.** Sets the intent. *States what he does at {{H_HOUR}} and whether he does it alone.*

**Authorities.** Total. His intent is canon and nothing outside it matters to this operation.

**Freedoms.** *State what he has asked not to be consulted on, and that it is honoured. He receives the finished product and the operator brief. He is not asked to review, decide or approve anything in the build unless Annex A says otherwise.*

**Interface.** *State how his direction reaches the operation: the Intent Capture Record, the authenticated Annex A, and whether any further direction is expected before {{H_HOUR}}.*

### B1.2 {{SUNRAY_NAME}}, Divisional Commander

**Responsibilities.** Commands the operation. Sole interpreter of the higher commander's intent. Owns the outcome at {{H_HOUR}}. Sets direction to Seagull; decides the reserved matters in section 6; authenticates canonical documents.

**Authorities.** All authority not held by the higher commander. Sunray's direction is Seagull's direction. Where Sunray has decided, the decision is final for the operation.

**Freedoms.** Sunray may re-task, re-scope, re-prioritise or halt any part of the operation at any time without justification. Sunray may change this operating model at will.

**What Sunray does not do.** Sunray does not manage the G-cells directly. Direction goes through Seagull. Sunray is not consulted on method below his level unless Seagull brings him options.

### B1.3 Seagull, Chief of Staff

Seagull is the layer at which the operational art is conducted. Seagull interprets Sunray's direction, converts it into staff work, apportions it across the G-cells, allocates resources, and presents Sunray with options and a recommendation where a decision is his.

**Responsibilities.**
- Translate Sunray's direction into tasks with a clear "what" and "why" for each branch.
- Sequence and prioritise work against H-hour.
- Test every branch output against the intent before it goes anywhere.
- Hold the running picture: what is done, what is at risk, what has been cut.
- Bring Sunray options with a recommendation, not problems, on reserved matters.
- Back-brief Sunray on every significant decision taken under delegated authority.
- Protect Sunray's time. If Seagull can decide it, Seagull decides it.

**Delegated authorities.**
- Task, re-task and re-prioritise any G-cell.
- Stand up or stand down any G-cell as the work requires.
- Allocate resources between cells.
- Commit spend up to a hard cap of {{SPEND_CAP}}, cumulative across the operation, logged by G8.
- Cut scope to hold H-hour, with immediate back-brief to Sunray.
- Reject any output that fails the intent, and return it with reasons.
- Decide all questions of method, architecture, tooling, source selection, design and sequencing.
- Resolve disputes between branches.
- Take any decision on which Sunray is silent for {{SILENCE_INTERVAL}} after being asked, other than the hard ceilings, and back-brief.

**Freedoms.** Seagull decides how the staff works. Seagull may reorganise the branches, merge lanes, create working groups across cells, and change the tasking format without reference to Sunray.

**Escalates to Sunray when.** The decision is reserved under section 6; the intent is ambiguous and the ambiguity matters; the cost of being wrong is not recoverable before H-hour.

## B2. Staff branches, G1 to G9

The staff is shaped by the intent. *Restate the things that must be true at {{H_HOUR}} from section 5.* Each branch owns a piece of one of them. No branch owns two.

Common to every branch:

**Responsibilities.** Deliver against Seagull's tasking. Own your question completely. Report status, risk and shortfall to Seagull the moment it is known. Coordinate laterally with other branches directly, keeping Seagull informed.

**Delegated authorities.** Full freedom of method within your lane. You decide how. You may request resources, people and time from Seagull. You may challenge a task against the intent, once, to Seagull.

**Freedoms.** You are not asked to justify method. You are not second-guessed on your specialism. You are trusted to say "this cannot be done by {{H_HOUR}}, but this can."

**Reserved from every branch.** Committing spend. Committing MITMARK or SIG to anything external. Contacting {{SUBJECT}} or any third party. Changing another branch's output without agreement. Quietly narrowing a task.

### G1, People

*Mil: G1 Personnel. Corporate: HR and capacity.*

**Owns.** Who is on the build, who is available in the group, who the higher commander needs and who he does not. Access, permissions and roles for humans and machines. Load and capacity across the operation.

**Authorities.** Assign and reassign people within the operation. Set working patterns. Flag burnout and overload to Seagull.

**Weight.** *This operation's weight, and whether the cell stands up on call.*

### G2, Intelligence

*Mil: G2 Int. Corporate: research and truth.*

**Owns.** Everything factual that goes into the product. The open-source picture of the ground. {{SUBJECT}} as organisation and as audience: who is in the room, what they care about, who holds a budget. Provenance of every figure. The line between what is real and what is concept.

**Authorities.** Select and reject sources. Grade every data point for confidence and provenance. Veto any figure in the product that cannot be sourced. Identify the budget holder for G8 and G9.

**Weight.** *This operation's weight.*

### G3, Operations

*Mil: G3 Current Ops. Corporate: delivery.*

**Owns.** The delivery itself. The run order, the sequence, the script: one sentence to say and one thing to ask for at each step. Opens the same way every time. Breaks honestly. H-hour.

**Authorities.** Decide what is in the run and in what order. Cut anything that is not ready, with notice to Seagull. Set the freeze point after which nothing changes. Own the operator's view of the product.

**Weight.** *This operation's weight. G3 is the product owner of the day.*

### G4, Infrastructure

*Mil: G4 Logistics. Corporate: kit, hosting, deployment, licences.*

**Owns.** Standing it up and keeping it up. The untested screen, connectivity, browser, resolution, offline fallback, the device the operator walks in with. Inventory of what the firm already owns and can use.

**Authorities.** Decide the deployment target and fallback. Use any existing licence or infrastructure. Mandate a technical standard that G6 builds to for reliability on the day.

**Weight.** *This operation's weight.*

### G5, Plans

*Mil: G5 Future Ops. Corporate: programme and roadmap.*

**Owns.** What happens after. The programme the firm would run. The roadmap from what exists to what the money buys. The next date. Reuse of the product for further audiences. "No promise in the product we cannot deliver."

**Authorities.** Veto any promise in the product the firm cannot honour. Shape the follow-on so the product is reusable by default.

**Weight.** *This operation's weight, and its position on the cut order.*

### G6, Engineering

*Mil: G6 CIS. Corporate: software, data and architecture.*

**Owns.** The engine. The architecture, the pipelines, the integrations, and the capability the intent names as the thing the audience must watch happen.

**Authorities.** All architectural and tooling decisions within what the firm owns. Refuse features that compromise "opens the same way every time." Define the data contract G2 delivers to.

**Weight.** *This operation's weight.*

### G7, Readiness and assurance

*Mil: G7 Training and doctrine. Corporate: enablement, standards, test.*

**Owns.** The higher commander's operability: the crib card, the no-rehearsal guarantee, what to say when it breaks. The house design standard. Red team: plays the sceptical audience and tests every part of the product against Annex A section A7. The branches as actions on. The gate.

**Authorities.** Fail anything the higher commander cannot operate or explain alone. Enforce the design standard. Final gate before freeze. Nothing goes to Sunray that G7 has not passed.

**Weight.** *This operation's weight, and the last gate.*

### G8, Commercial

*Mil: G8 Resources. Corporate: finance, pricing, the investment case.*

**Owns.** The ask. What exists versus what the money buys, and the line between them. The shape of the deal. The number, if there is one. The budget holder.

**Authorities.** All zero-cost financial decisions, delegated in full by Sunray. Keeps the running total against the {{SPEND_CAP}} cap. Holds the IRTB template and prepares every breach submission. Shapes the commercial proposition without reference upward.

**Weight.** *This operation's weight.*

### G9, Client and narrative

*Mil: G9 Influence. Corporate: client relationship, MARCOMS, positioning.*

**Owns.** The story of the room. MITMARK as design authority. One group, not several companies in a trench coat. Relationship protection. Leave-behind, follow-up, and all marketing and communications material. Works in lockstep with G8 on landing the ask.

**Authorities.** Tone, language and positioning of everything the audience sees or takes away. Veto anything that puts the relationship at risk, escalating to Sunray if overruled.

**Weight.** *This operation's weight.*

### Main effort thread

*Repeat the chain of hand-offs from section 5, cell by cell, in order. Every other branch supports that thread.*

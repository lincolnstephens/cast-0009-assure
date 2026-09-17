---
document: FRAGMENTARY_ORDER
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: T13
instantiated_by: Seagull, Phase 3 Build, one per iteration or material change
usage: The order that opens an iteration. It states what changed, replaces the previous definition of done with the one this iteration is held to, amends the tasks and the cut order, and sets the gates. Where it conflicts with the Operation Order, this order wins. Where it conflicts with Annex A, Annex A wins. Authenticated by Sunray starting the session on it.
---

# {{ITERATION}} ORDERS, OPERATION {{CODENAME}}

*Instruction: frontmatter on the instantiated order carries document, version, status (ISSUED by Seagull on Sunray's direction at {{TIME}}; fragmentary order to the Operation Order; for Sunray's authentication, authenticated by starting the session on it), authority, sits_beneath (the operation's Read First, and which paragraphs of the Operation Order and which preloaded decisions this amends), date, h_hour, audience (this iteration's Seagull and every cell; read after the Read First and before anything else) and usage.*

## 1. Situation

### 1a. What changed

*Instruction: two paragraphs and no more. The first states what the previous iteration delivered, what it passed, and precisely how it fell short of the standard, in the terms Sunray used at the inspection. Name the structural cause where there is one, for example that the gate measured a floor rather than the product in a person's hands. The second gives Sunray's direction in his own words, quoted or closely paraphrased, including what he wants offered and what the fallback benefit is if the audience does not take it. Do not improve his words.*

### 1b. Own forces, corrected

*Instruction: what the previous iteration assumed about what we own that is now known to be wrong or incomplete. Name each asset, its real licence and status, and state plainly which of it is pattern and which of it is codebase or content we may use. What carries forward from the previous iteration as data and copy, and which of its constraints does not carry forward. Where material, keys or patterns now sit, folder by folder.*

### 1c. Ceilings and control measures, unchanged

*Instruction: restate both hard ceilings with their values, and every control measure in force, so that a session opening on this order alone has them. State them as unchanged unless Sunray has changed one, and if he has, mark the change. Include the standing prohibitions on named material, on keys, and on anything the earlier iterations put out of bounds.*

- No spend above {{SPEND_CAP}}.
- No contact with any real person outside MITMARK and SIG.
- CM-01 third-party data: {{CM_01_STATEMENT}}.
- CM-02 sensitive capability: {{CM_02_STATEMENT}}.
- Keys: free-tier or already held, registered by name, held in the hosting environment only, never committed, never rendered.

## 2. Mission

*Instruction: one sentence, who, what, when, where, why, rewritten for this iteration. It is not the Operation Order's mission repeated; it is this iteration's, and it names the gates the iteration is held to.*

{{ITERATION_MISSION}}

## 3. Execution

### 3a. Seagull's intent

*Instruction: purpose, method, main effort, end state, in four sentences. Purpose says what the product must do in a stranger's hands. Method says how the build differs from the last one. Main effort names the one thing the room will test. End state lists the artefacts that must exist when the iteration closes.*

### 3b. The product

*Instruction: the working name, who presents it, and what may not be branded on a guess. The positioning in one sentence, as it appears on screen and in copy. Then the architecture as decided, one bullet per layer, each stating the choice and the constraint that produced it: application, presentation layer, data and feeds with their common shape and their fallback, hosting, repository, and provenance and marking. Decisions here are Seagull's and are stated as decided, not as options.*

- Application: {{APPLICATION_STACK}}.
- Presentation: {{PRESENTATION_LAYER}}, the token system as the only stylesheet source.
- Feeds: {{PROXY_LAYER}}, one per source, common shape `{ source, url, retrieved_at, status, data }`, server-side caching, and a baked snapshot fallback for every source so the picture never goes blank.
- Hosting: {{HOSTING}}, unlisted name, no client name in URL, title or metadata, noindex.
- Repository: {{REPOSITORY}}, its own version control, with the session pack copied inside as `docs/{{CODENAME}}/` so canon, data, registers and gate travel with the code.
- Provenance and marking: every live element carries source, retrieved time and state in the DOM and on hover; every designed element carries the designed treatment and mark by rule; the gate reads both.

### 3c. What "works" means: the definition of done

*Instruction: this is the definition of done for the iteration and it is the whole of the standard. Write it as numbered, testable lines describing the product in a stranger's hands. G7 tests every line by driving it, not by reading it. The full method for writing these lines, and a worked example set, is in T14 DEFINITION_OF_DONE; either write the lines here or point at the T14 instance for this iteration, but not both.*

See `outputs/{{ITERATION}}/DEFINITION_OF_DONE.md`, {{N}} numbered lines. No line is optional. The gate is `gate/g7_gate_{{ITERATION}}.py` and it reports pass or fail per line.

### 3d. {{COMPONENT}} register

*Instruction: the components carried over with their words unchanged and their layer and treatment as before, then the additions for this iteration, each marked live, designed or honestly absent. Where a component is split or promoted, say so in the note rather than renumbering it.*

| # | Component | Layer | Note |
|---|---|---|---|
| | | *Live / Designed / The ask* | |

### 3e. Tasks to cells

| Cell | Task | Hands to |
|---|---|---|
| G1 | *Task organisation; the list of things only Sunray or {{HIGHER_COMMANDER}} can give.* | Seagull |
| G2 | | |
| G3 | | |
| G4 | | |
| G5 | | |
| G6 | | |
| G7 | *The gate for this iteration: the previous checks plus this iteration's definition of done, driven against the deployed product and the local build. Red team from the sceptic's chair. Operator brief updated.* | Seagull, G6 |
| G8 | | |
| G9 | | |

*Instruction: only tasks that change. A cell whose task is unchanged is not listed, and the order says so once rather than repeating the Operation Order. Where a cell is run as several detachments, say so and give the build order between them.*

### 3f. Gates and timings

| Time | Gate | What Sunray sees |
|---|---|---|
| {{T0}} | *Session opens on this order* | Nothing yet |
| {{T1}} | *Gate 1: the floor. What must be alive, stated in terms that can be driven. Rough at the edges is acceptable; dead is not.* | *URL or artefact, one-page back-brief, screenshots* |
| {{T2}} | *Gate 2: the product. Every component, both resolutions, gate passing, run order frozen.* | *URL or artefact, back-brief, operator brief* |
| {{T3}} | *Gate 3: final. Polish, snapshot refresh, deploy, fallback refreshed, back-brief. Stop.* | *URL or artefact, battle inspection* |
| {{H_HOUR_MINUS}} | *{{HIGHER_COMMANDER}}* | *Sunray presents; the commander's words go in before H-hour only as copy changes, never as build changes* |

### 3g. Cut order if culmination approaches

*Instruction: the cut list in strict order, each cut logged with its cost to the intent. Then the never-cut list. Both are written before the build starts, so that a cut taken at speed is a decision already made rather than a decision taken tired.*

In this order, logged in `registers/CUT_LIST.md` with cost to intent: {{CUT_1}}; {{CUT_2}}; {{CUT_3}}; {{CUT_4}}; polish.

Never cut: {{NEVER_CUT_LIST}}, the designed layer by rule, the ask, the operator brief, the fallback.

### 3h. Coordinating instructions

- Check zero: this session starts from this order, the canon and the previous iteration's pack. It does not inherit the previous session's context. Every cell reads its brief and this order before acting.
- Commit at every gate and at every completed piece of work. Log every decision and every cut. Cells return typed summaries.
- Licence hygiene: nothing from {{PROHIBITED_SOURCE}} is copied. The gate greps the repository for its identifiers and fails on a hit.
- Words are fixed: the approved copy files carry over unchanged. New words go through G9.
- The previous iteration's data pack is the seed; this iteration's feeds supersede it at run time and refresh it at each gate.

## 4. Service support

*Instruction: model allocation for this iteration, frontier and lighter by cell. Budget against the cap and where it is logged. Keys: tier, where found, where held, registered by name. Infrastructure and tooling available in the session.*

## 5. Command and signal

*Instruction: unchanged hierarchy stated in one line. Where each gate's back-brief will be written, by filename. How Sunray steers at each gate and that silence is delegation. That the two hard ceilings wait for Sunray however long it takes.*

Acknowledge by opening the session.

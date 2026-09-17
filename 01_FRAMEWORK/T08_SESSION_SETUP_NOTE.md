---
document: SESSION_SETUP_NOTE
version: v1.1
status: AUTHENTICATED by Sunray, 2026-09-07, on Seagull's recommendation. Layout reconciliation to the CAST phase-folder structure stands. Placeholders remain unfilled: Phase 0 has not run.
authority: Seagull
sits_beneath: COI-001 (Tier 0), then CAST-001 and CCP-001 (Tier 1), then SEAGULL_CYCLE_00_CANON v1.0
register_id: T8
instantiated_by: Seagull, Phase 1
layout: CAST phase folders govern. The job folder itself is the working directory; there is no separate session pack to assemble.
usage: Conditions for success for a Seagull session on this job. Instantiate in place, here at `01_FRAMEWORK/T08_SESSION_SETUP_NOTE.md`. Sections A to I, all present, so Sunray can set the session up and start it without asking anything.
---

# SUNRAY SETUP, {{CONTROL_NO}} {{CODENAME}}, {{ITERATION}} SESSION

This job folder is the working directory. Nothing is copied, assembled or moved to start a session: the pack and the job are the same thing, and the phase folders are the pack. *State the honest time this takes, in minutes, and the session's end time: the session runs to {{SESSION_END}} with the two HITL gates at {{GATE_TIMES}}.*

## A. Authenticate and place (your action, before anything else)

1. **Fill `00_INTENT/`.** T01 the brief as given, T02 the intent under the nine fixed headings, T03 the Interpretation Note. Phase 0 does not close until all three are authenticated, and no cell stands up before it does.
2. **Fill `00_INTENT/PHASE0_SELECTOR.md`.** All nine fields. This is the permission envelope and the enforceable authority record COI-001 section 7 requires. A blank field is not a wide permission; it is no permission.
3. Read `01_FRAMEWORK/T07_PRELOADED_DECISIONS.md`. Mark every line AUTHENTICATED, ALTERED or STRUCK. Anything blank is Seagull's call under the silence rule. *Name the lines that need Sunray's eye and say why.*
4. Read `CLAUDE.md` at the job root. It is Seagull's standing orders, instantiated from `01_FRAMEWORK/T05_STANDING_ORDERS_CLAUDE.md`. Strike anything that is not yours.
5. Skim the nine files in `.claude/agents/`. They are Annex B, cell by cell, with this job's tasks. Change model allocation if you disagree. Only the branches this job needs are stood up, per PD3.
6. Place material into `material/` per its README. Absent means concept.
7. `git init` in this job folder and commit as "{{COMMIT_LABEL}}". *If Sunray has instead placed the repository root at `CAST_JOBS/` or at the `Tessera Cast` root, say which here and commit there instead.*

*For a later iteration, add in order: the fragmentary order that opens it in `06_EXECUTION/`, what is left in place as the previous iteration's record, and what stale state is cleared first.*

## B. Session settings

| Setting | Value | Why |
|---|---|---|
| Working directory | this job folder | The only context Seagull needs |
| Also connected, read-only | `../../` for the doctrine set and `../../SEAGULL_CYCLE/` for the method and R11 | Authority and method, read, never edited during a live job |
| Seagull's model | frontier | Operational art is hard reasoning |
| Subagent models | as set per agent file: {{MODEL_ALLOCATION}} | Model allocation control measure. This harness accepts Anthropic aliases only; record any cross-provider intent in Annex B |
| Permission mode | autonomous, prompts bypassed inside this job folder only | A prompt in an unattended session is a stall until {{SESSION_END}} |
| Turn or time cap | none, or the maximum available | A cap mid-build produces nothing to inspect |
| Extra usage | enabled, if frontier subagents require it on your plan | Known issue: frontier subagents can fail without it |
| Git | enabled, commit at every gate | Audit trail for inspection. Not yet initialised on this job |
| Working directory scope | writes confined to this job folder. `../../SEAGULL_CYCLE/` is written only at close, to fold lessons in | Nothing else is touched |
| Session start | new session in this folder, check zero, on the pack alone | Drift control |

## C. Connectors: on

| Connector | Needed for | Owner cell |
|---|---|---|
| Web search and fetch | Open-source research, live data | G2 |
| A browser, or a headless browser in the environment | Proof of deterministic open; red team screenshots; the driven half of the gate | G4, G7 |

*Nothing goes in this table until it carries a row in `../../SEAGULL_CYCLE/standing/R11_CAPABILITY_REGISTER.md` with a safety status, per CCP-001 section 2, and falls inside the capability categories `PHASE0_SELECTOR.md` permits.*

## D. Connectors: off

Fewer doors, less wandering, no accidental external contact. Where material lives behind a connector that is off, copy it into `material/` instead and leave the connector off.

**Off by Sunray's direct instruction of 2026-09-07, until lifted in writing:** Gmail, Canva, monday.com, Netlify, Supabase, Twilio. No safety assessment exists for any of them, no envelope had been set when they were found open, and Gmail, Twilio, Canva and monday.com can transmit to third parties, which is a hard ceiling.

*List any further connector that stays off.*

## E. Skills: load

- *Any skill the build needs, one per line, with what it is for, once it carries an R11 row.*

The `mitmark-design-system` skill named in the standing template **does not exist on this machine.** The house standard is `../../SEAGULL_CYCLE/standing/SEAGULL_CYCLE_04_DESIGN_STANDARD_v1.0.md` and it is read as a document. Load nothing else.

## F. Authorities you are granting for the session

- Seagull: everything not reserved in the canon's decision rights section. Silence rule collapses to `01_FRAMEWORK/T07_PRELOADED_DECISIONS.md`; anything not covered, Seagull decides against Annex A and logs it in `registers/R01_DECISION_LOG.md`.
- The permission envelope: `00_INTENT/PHASE0_SELECTOR.md`, in full. Widening only by `T27_IRTB.md` at a HITL gate or by exception.
- Spend: **{{SPEND_CAP}}**. Hard ceiling. No key or service needing a card unless the cap allows it.
- External contact: **none**. Hard ceiling. Drafting is free; sending is forbidden.
- Scope cuts: Seagull's, in the cut order in `01_FRAMEWORK/T07_PRELOADED_DECISIONS.md`, logged in `registers/R02_CUT_LIST.md`. *Name what is never cut.*
- G7 gate: final. Nothing reaches inspection that fails `06_EXECUTION/gate/g7_gate_<iteration>.py`. **Note that the gate cannot run today: it needs Python 3 and Playwright, and neither is installed.**

## G. What you will find at {{SESSION_END}}

In the order to open them.

- `06_EXECUTION/T17_BATTLE_INSPECTION.md`, one page, read this first
- {{PRODUCT_PATH}} and the mirror address
- `07_HANDOVER/T18_OPERATOR_BRIEF.md`, with `06_EXECUTION/T19_RUN_ORDER.md` and `06_EXECUTION/T20_ACTIONS_ON.md`
- `02_ESTIMATE/T10_ESTIMATE.md` and `05_GATE2_LAUNCH/T11_OPERATION_ORDER.md`
- `registers/` R01 to R10 for audit, and `06_EXECUTION/T16_GATE_BACKBRIEF.md`

*For a session with interim gates, list what appears at each gate time. At a HITL gate the session stops: what you will find is `03_GATE1_COA_DECISION/COA_DECISION_BRIEF.md` or `05_GATE2_LAUNCH/T11_OPERATION_ORDER.md` and nothing beyond it.*

## H. Still yours, not Seagull's

*Numbered list of what only Sunray can do or decide, carried from `00_INTENT/T03_INTERPRETATION_NOTE.md` section 11. Seagull works around each of these rather than waiting on them.*

1. The two HITL gate decisions: which COA runs, and what resources launch.
2. 

## I. The one-line prompt to start the session

> You are Seagull. Read CLAUDE.md at the root of this job folder, then the read order it gives. *State the deliverable, the two HITL gates and their times, whether Sunray steers at the gates or is unreachable, and the two hard ceilings.* Deliver by {{SESSION_END}}.

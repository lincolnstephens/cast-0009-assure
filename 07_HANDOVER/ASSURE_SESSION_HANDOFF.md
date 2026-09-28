---
document: ASSURE_SESSION_HANDOFF
job: CAST-0009 ASSURE
version: v1.0
status: HANDOFF, 2026-09-28 08:40, from the opening Cowork session to its successor
authority: Seagull
usage: Read in full at the start of the new ASSURE Cowork session before doing anything. Then read the three files in section 2 in order. This document is the bridge; the job folder is the truth.
---

# ASSURE session handoff

## 1. Bottom line

Tessera Assure v1.2 is live at https://tessera-assure.netlify.app, deployed 22 Sep (deploy `6ab25725b4a60a16e14b0e06`), gate 75 of 75, no new money committed. It is the MITMARK DPO and vCISO service made visible to a retained client: a compliance tracker on eight modules, a document repository, a consolidated job list, statutory clocks, a policy pack with a Guide, and a record of MITMARK's work with a CFO statement that prices it. It has been driven by both seats since 17 Sep. Nothing in the product is waiting on a build decision. Everything now open is human: content from Lurong, a key from Linc, and the outcome of the 24 Sep boardroom, which this session did not see.

## 2. Read first, in this order

1. `00_INTENT/T02_HIGHER_COMMANDERS_INTENT.md`. Annex A. A7 is the stop list. Unchanged since 16 Sep except as noted in R01 DC-20 and DC-25.
2. `06_EXECUTION/BUILD_REPORT.md`. Three sections, v1.0, v1.1, v1.2. The v1.2 section is the current product description.
3. `07_HANDOVER/T18_OPERATOR_BRIEF.md`. How Lurong runs it.
4. Then `00_INTENT/ASSURE_BASELINE_KB.md` (the archive, defunct for working purposes, with the MAXIMUS addendum), `00_INTENT/ASSURE_LIVE_REQUIREMENTS.md` (what real data is still needed, 25 items in five blocks), and `registers/R01_DECISION_LOG.md` (DC-01 to DC-31; note the DC-21 to DC-24 gap recorded at DC-31).
5. `material/restricted/CLIENT.md`. Read once. The client's name and the officer's first name are in it and nowhere else. They never enter code, commits, data, URLs, screens, logs, or any document that can be forwarded. Grep before every commit and deploy.

## 3. Roles and people

- Sunray: Linc. All decisions above delegated authorities. Sets direction; does not want execution decisions handed back to him.
- Seagull: the Cowork session (you). Chief of staff. Reads the folder, briefs in short bullets, records decisions in R01, drafts in Linc's voice under the Linc Writing Standard v1.0 (24 Sep 2026; see memory `writing-standard`), never takes a decision Sunray has not made, issues orders to the build session.
- Build session: Claude Code on the mini PC in the job folder. Executes FRAGOs, commits as `Seagull <seagull@cast.local>` on master, deploys, runs the gate, writes BUILD_REPORT and T17.
- Higher commander: Rich Roberts, MITMARK CEO. Revenue is his worry. Cost- and control-sensitive. No Cast codenames in front of him; describe the thing. Never "£0" to him: "no new money committed" and name what was spent (time, compute, Netlify plan, Anthropic API).
- Lurong: MITMARK's data compliance officer. Runs the client contract. The operator seat. Her method is what the product standardises; her three benefits (compliance overview, document repository, consolidated actions) are the test for every client-side change.
- The Information Officer at the client: the reader seat. Part-time role in a full-time post. Maintains nothing. Confirms "for you" tasks with one click and that is her only write.
- The client's CFO: the audience of the Statement. Sceptical. Reads a percentage as assurance, which is why every figure carries its fraction and basis.
- Ed: a current customer or client of MITMARK, invited to the 24 Sep boardroom to drive the product cold as the user-journey test.

## 4. What exists, by version

**v0.1 (16 Sep, Cowork built).** Single static page. Record, CFO Statement, twelve service lines, Operator, spend list. Superseded but kept at `06_EXECUTION/build/site/` as the reference for the Statement's wording.

**v1.0 (17 Sep, build session, initiating prompt).** MAXIMUS shell (a prior MITMARK build found at `C:\Projects\mitmark-tessera-assure\Proj MAXIMUS`) carrying the v0.1 value layer. Client portal (light) and admin workspace (dark), role-separated. Statutory clocks, policy pack with immutable approved versions, defence-file export, Policy Guide, review queue, audit log, posture. Store moved from Neon Postgres to Netlify Blobs (DC-09); API is a v2 function over a pre-bundled server (DC-12). Seven defects found by driving it, all fixed and tested.

**v1.1 (17 Sep, FRAGO 01).** Client home became the Compliance Tracker: six-question columns (what, how, who, when, done, status) on every task table; overall status as fraction plus percentage plus date; five-phase journey strip; six measures with basis or "No data yet"; eight area tiles; "for you" panel. Eight area pages. Admin Workplan and Procedures. Task library seeded (UK GDPR, estate client), marked DRAFT. Client confirms only; operator accepts or reopens.

**v1.2 (22 Sep, FRAGO 02).** Lurong's structure. Client nav: Compliance Tracker, Compliance Documents (Policies, Procedures, Trackers), Jobs (Not started, In progress, Completed, Guide at the foot), Requests and clocks, Value, Statement for the CFO. Modules 2 and 4 renamed to Data tracker review and Policy review; cross-border obligations moved into 2 and 7, nothing lost. Overall figure is overdue-based by default ("Nothing overdue" or "k overdue or blocked"); the stricter signed-off view is an admin toggle that cannot reach the client. File cap 4 MB (Netlify function body limit), larger items as links (DC-28). Library now 36 tasks; demo organisation holds 65 dated tasks.

## 5. Access and secrets

- Netlify site `tessera-assure`, id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`, team plan, unlisted, noindex, no password.
- Demo logins: `demo@demo.local` (client seat), `operator@demo.local` (operator seat). Password `demo` for both (env vars `SEED_CLIENT_PASSWORD`, `SEED_OFFICER_PASSWORD`). Change before anything leaves MITMARK.
- `SESSION_SECRET` is set but its value passed through a build transcript; rotate.
- `ANTHROPIC_API_KEY`: not set on the project. The team-level key Netlify injects is rejected 401. The Guide runs on its deterministic fallback (answers from approved policies only, cites, escalates). Only Linc can supply a working key. Open since v1.0 (DC-19).
- `DATABASE_URL` must not be set; nothing reads it.
- Repo: the job folder is its own git repo, master, commits as Seagull. Working tree was clean after v1.2.

## 6. Standing rules that bit us

- Prohibited connectors for Cast: Gmail, Canva, monday.com, Supabase, Twilio. Netlify authorised for ASSURE (DC-04).
- The workplan is MITMARK's workplan for the client. The client never creates, edits, reprioritises or closes a task. The gate checks for the absence of every such control on the client side.
- No claim without a record. No client-side figure without a stored basis. No illustrative figure reachable on the client side unless the operator has switched on the demo flag, and then the banner shows.
- No percentage without its fraction.
- MITMARK design standard: Tessera tokens, night default in admin, day in the client portal, Inter and JetBrains Mono, severity colours for status only, no retired lavender or olive, no dual axis. Skill `mitmark-design-system`.
- R01 is append-only and had a concurrent-write loss on 22 Sep (DC-31). Rule now: the build session is the sole writer while a build runs; Seagull appends only between builds.
- The mini PC's Cowork Linux workspace (Hyper-V VM) failed to start throughout 16 to 17 Sep; all folder writes from Cowork went through the file bridge (stage and commit). Check `device_bash` at session start; if it fails, the bridge still works.

## 7. What happened that the folder does not fully show

- 16 Sep: job opened; Maxima OneDrive archive read in place and reduced to the baseline KB; Rich's steer relayed by Linc became the intent; v0.1 built and deployed from Cowork in under an hour; MAXIMUS identified as the prior product.
- 17 Sep: v1.0 and v1.1 built by two Claude Code runs (3h and 1h 20m). Rich's email arrived between them, widening the intent to a SaaS and a six-question tracker; Linc's steer was "a product that uses the beta and meets Rich at least half way". Rich's own mock (a five-phase strip, KPI tiles, an 85 per cent compliant bar) was adopted in structure, not colour, and the bare percentage was refused.
- 18 Sep: the client seat confirmed a task unprompted. That confirmation sat in Lurong's queue unanswered through 22 Sep. The build reports flag it as the main risk: a system that asks the client for things and then ignores her.
- 21 Sep: Lurong's written feedback. 22 Sep: FRAGO 02 issued and built the same day, a day inside its deadline.
- 24 Sep: boardroom with Rich, Linc, Lurong and Ed. This session has no record of its outcome. Get it from Linc first.
- 24 Sep: Linc adopted the Linc Writing Standard v1.0 as canon for all authorship. It supersedes earlier writing direction. Read it before drafting anything.

## 8. Open items, by owner

Linc (Sunray):
- Boardroom outcome and any new direction from Rich or Ed.
- Working Anthropic key on the project.
- Whether the client name may appear as a display name on screen (it is currently a settable field, blank).

Lurong (operator):
- Answer the 18 Sep confirmation, if still open.
- Authenticate the task library (36 tasks, DRAFT).
- Publish the first procedure per module (client sees "to be published, 15 Oct").
- File the first registers under Trackers (all six "Not yet filed").
- Block 1 of ASSURE_LIVE_REQUIREMENTS: retainer fee, contract dates, live lines, backfill of real work, reviewer per entry. This alone turns the Record from illustrative to real.

MITMARK (Rich or Lurong):
- Change both demo passwords; rotate SESSION_SECRET.
- Client consent to a hosted record naming the officer (Block 5).

Build (when ordered):
- Module sub-navigation on each module page, not only on the tracker (deferred in v1.2).
- Areas 2, 5 and 7 have no matching policy in the six-policy pack.
- Second organisation for the next client: configuration, not development.
- Jurisdiction field accepts five values; only UK has content.

## 9. Where things are

| Thing | Path |
|---|---|
| Job folder | `C:\Projects\Tessera Cast\CAST_JOBS\CAST-0009_ASSURE` (mini PC minipc-kwr53) |
| Build source | `06_EXECUTION/build/maximus-src/` (pnpm workspace: apps/web, packages/shared, packages/server, netlify/functions) |
| Gate | `06_EXECUTION/gate/g7_gate_assure_v1.py`, run against any URL; `check_restricted.py` before every commit |
| Orders issued | `06_EXECUTION/CLAUDE_CODE_INITIATING_PROMPT.md`, `FRAGO_01_TRACKER.md`, `FRAGO_02_LURONG.md` |
| Build reports | `06_EXECUTION/BUILD_REPORT.md` (v1.0, v1.1, v1.2 sections); T17 per version; T14 per version |
| Operator brief | `07_HANDOVER/T18_OPERATOR_BRIEF.md` |
| Archive of record | OneDrive `MITMARK\MITMARK Capabilities\Maxima` on the mini PC; defunct; read the KB instead |
| MAXIMUS source | `C:\Projects\mitmark-tessera-assure\Proj MAXIMUS` |
| Project docs (Cowork) | CAST-0009_STATE.md, CAST-0009_INTENT_DRAFT.md, CAST-0009_FRAGO_01_DRAFT.md (assessment of Rich's feedback and boardroom agenda) |
| Memory | Project subtree areas/cast.md, people/lurong.md, people/(the officer's file), people/rich-roberts.md, people/ed-hackett.md |

## 10. How to run a build from the new session

1. Write the FRAGO into `06_EXECUTION/FRAGO_NN_<name>.md` via the file bridge (or `device_bash` if the workspace is up). Number continues from 03.
2. Record the Sunray decision that authorises it in R01 only if no build is running.
3. Give Linc the one-paragraph paste for Claude Code: read the FRAGO, execute under the standing rules, stop only on its stop conditions, deploy to the site id.
4. While it runs, poll the site (`curl` the URL and look for a new `/assets/index-*.js` hash) and the folder (`BUILD_REPORT.md` mtime), not the transcript.
5. When done, read BUILD_REPORT and T17, update CAST-0009_STATE.md in the project, brief Linc in bullets: what shipped, what deviated, what waits on whom, smallest next decision.

## 11. Smallest next decision for the new session

Ask Linc what came out of the 24 Sep boardroom, and whether the 18 Sep confirmation has been answered. Those two answers set the next FRAGO or confirm there is none.

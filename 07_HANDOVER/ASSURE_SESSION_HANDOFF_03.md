---
document: ASSURE_SESSION_HANDOFF_03
job: CAST-0009 ASSURE
version: v1.0
status: HANDOFF, 2026-10-28 09:30, from the third Cowork session (14 Oct to 28 Oct) to its successor
authority: Seagull
usage: Read in full at the start of the new ASSURE Cowork session before doing anything. Then the reading order in section 2. This document is the bridge; the job folder is the truth. Supersedes ASSURE_SESSION_HANDOFF_02.md as the bridge; HANDOFF and HANDOFF_02 remain the record of v0.1 to v1.8.
---

# ASSURE session handoff 03

## 1. Bottom line

Tessera Assure v1.9 is live at https://assure.tessera-monitor.com (deploy 6adb323e240c965c3ec449fe, 23 Oct 11:09 BST), gate 247 of 247, tests 321 of 321, no new money committed. The first client is live on it: four client users since 22 Oct, the meeting went well, the client downloaded documents the same afternoon. The job now has a private remote, lincolnstephens/cast-0009-assure, and builds can run from the mini PC or Sunray's home PC. The next session's work is a second client: a prospect whose feedback Sunray will bring to the session. It is the first client of Assure outside the retained contract and Sunray rates it very important. Everything open on the first client is human (section 9).

## 2. Read first, in this order

1. `00_INTENT/T02_HIGHER_COMMANDERS_INTENT.md`. Annex A7 is the stop list. Three rules bent with reasons: FRAGO 07 section 1 (client upload as an offer; eight modules replace twelve lines) and FRAGO 10 section 7 (restricted inputs by environment when the restricted folder is absent).
2. `06_EXECUTION/BUILD_REPORT.md`, section v1.9. It is the current product description; v1.3 to v1.8 for how it got there.
3. `07_HANDOVER/T18_OPERATOR_BRIEF.md`, sections 5h to 5n, and `T27_CLIENT_QUICK_START.md` (what a client is sent).
4. `06_EXECUTION/FRAGO_09_BETA_DELIVERY.md` and `FRAGO_10_REGISTER_SLOTS.md` (with its section 7). FRAGO 03 to 08 as needed.
5. `registers/R01_DECISION_LOG.md`, DC-72 to DC-78 (this session). DC-74 is the 23 Oct fault and its data fix.
6. `material/restricted/CLIENT.md`. Read once. On the mini PC only. The first client's name, the officer's first name, both account addresses, the logo, the nine client files and the operator's 15 Oct feedback document live there and nowhere else. Grep (`06_EXECUTION/gate/check_restricted.py`, from the job root) before every commit.

## 3. Roles and people

- Sunray: Linc. Decisions above delegated authorities. Standing delegation of 30 Sep: operational decisions sit with Seagull; record them in R01 as delegated; never hand execution decisions back. Has a manager account on the product (signed in 23 Oct from Chrome and let Seagull act under it for reads and one data fix).
- Seagull: the Cowork session (you). Reads the folder, briefs in short bullets, bottom line first, British English, no em dashes, ends with the smallest sensible next decision. Writes FRAGOs, appends R01 between builds, drafts in Linc's voice under the Linc Writing Standard v1.0 (memory `writing-standard`), configures the live product through the API when quicker than a build. Can use Claude in Chrome against Sunray's signed-in session when he says so.
- Build session: Claude Code, on the mini PC or the home PC, in the job folder. Executes FRAGOs, commits as `Seagull <seagull@cast.local>` on master, pushes to origin, deploys, gates, writes BUILD_REPORT, T14, T17, T18. Sole writer of R01 while a build runs.
- Higher commander: Rich Roberts, MITMARK CEO. No codenames in front of him. Never "£0": "no new money committed" and name what was spent.
- The operator: Lurong Chen, Chief Information Security Officer, MITMARK Intelligence. Runs the first client's contract and will run the second. Five rounds of feedback so far (28 Sep deck, 29 Sep deck, 29 Sep email, 13 Oct document, 15 Oct document). Her three benefits (overview, repository, consolidated actions) remain the test.
- The first client: live. Its Information Officer and two colleagues have sign-ins; one of the two has not yet signed in.
- The second client: a prospect, a wealth manager, approached by MITMARK for an outsourced DPO service earlier in 2026 (account memory `azura-dpo`; MITMARK's relationship lead on it is Jad). Its name goes into `material/restricted/CLIENT.md` as a second entry and nowhere else in the folder. Its feedback arrives with Sunray in the new session.

## 4. What exists, by version (this session)

- v1.9 (23 Oct, FRAGO 09 and 10): decision notes on Approve and Reject that reach the client (requests, concerns, confirmations); Category on the client's upload with the module set by the operator at acceptance; one status mark per task (green tick done, grey circle not started, amber circle in progress, red with its word for overdue or blocked; RAG lamps gone from task rows); client logo once at the menu head, MITMARK mark in the header beside "Delivered by MITMARK Intelligence", footer and watermark as v1.8; register slots fixed (newest live match fills a named register, earlier matches listed as earlier versions, on Compliance Documents and module pages); T27 client quick start; T18 5n.
- Data fix 23 Oct (DC-74): the first client's two 29 Sep register templates set to not published under Sunray's manager account so the operator's 21 Oct registers showed. The gate now reads the client organisation at run start and compares, because the client's data moves.

## 5. Access, remote and secrets

- Netlify site `tessera-assure`, id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`, team plan. Primary address https://assure.tessera-monitor.com. Deploy with absolute paths and `--skip-functions-cache`; the CLI reused a cached function on a v1.9 draft (BUILD_REPORT v1.9).
- Remote: `lincolnstephens/cast-0009-assure`, private, master at 4a90186 on GitHub, on the mini PC and on the home PC. The Cowork mount cannot push (no credentials in its shell); Seagull pushed and pulled through a git bundle via the cloud container. A Claude Code session on either PC pushes directly.
- `material/restricted/` exists only on the mini PC. On any other machine the gate takes the restricted names from `ASSURE_RESTRICTED_NAMES` (derived in memory from the product, DC-76) and the logo reference bytes from the product's manager route (FRAGO 10 section 7). A second client's name must be added to both the restricted file and the derivation: `check_restricted.py` and the gate's `load_restricted_names` read one `- Client:` line today. Extending them to every `- Client` line is the first code change of the next build.
- Accounts: the operator (manager); Sunray (manager, active); `operator@demo.local` (manager; the gate's account; its password has sat in a OneDrive-synced file on the home PC, `Personal App Builds\assure_gate_admin.txt`; Sunray was asked on 23 Oct to delete it and reset the password in Users, outcome unknown at handoff); `demo@demo.local` disabled; gate users disabled between runs; first client: Information Officer (active), two colleagues (one active, one must_change_password), one test seat.
- `SESSION_SECRET`: unrotated as far as this session knows. Rotation now signs a live client out, so it is timed with the operator.
- `ANTHROPIC_API_KEY`: absent. Quick questions returns cited passages and says so.
- Chrome: Sunray signed in as manager and authorised Seagull to act; the client view read and the two document updates on 23 Oct are under his name in the first client's audit.

## 6. The first client's organisation (org-f2b4afdf0d), at handoff

- Trading name on name, display name and Statement; logo; contract lead the operator with title; modules 1 to 8 Live; fee blank; rates at house figures; illustrative off; journey Implementation; 19 tasks; 15 documents (9 seeded, 2 registers filed by the operator 21 Oct, 2 test-seat uploads accepted 22 Oct, 2 ICO links); the 29 Sep templates not published.
- Audit: 110 entries at the v1.9 gate; the gate added none.
- Demo organisation (`demo`, 65 tasks, 27 Record entries) kept for prospects. Gate organisation (`org-878b49f7f7`) is the gate's fixture.

## 7. Standing rules that bit us this session

- A client upload from the test seat is published to no one, even after acceptance (DC-66). Say it plainly to whoever tests.
- The named register slots took the first match and dropped the rest (DC-74). Fixed; but any list keyed on a title is the same class of fault.
- The Cowork mount leaves `.git/*.lock` files behind; delete them first (deletion permission for the Tessera Cast folder is per session).
- Numbering: check the last DC before issuing. DC-74 and DC-75 were Seagull's; the build appended from DC-76 after being told so in the order.
- Sunray will not hand-place secrets or restricted names on a machine (23 Oct). The build derives them from the product or reads an existing file; nothing is typed by hand.
- A half-finished build leaves no record. If a build stalls, commit the work in progress by name, marked as such, before anything else.

## 8. What happened that the folder does not fully show

- 14 Oct: session started; two standing questions to Sunray (operator walk-through, secret rotation); only the first was ever answered, by the audit.
- 15 Oct: the operator's fifth feedback (document, six screenshots, filed in material/restricted). She passed v1.8 in full.
- 21 Oct: FRAGO 09 issued; the build stalled at the gate's credential question and never resumed; uncommitted until 23 Oct.
- 22 Oct: the first client meeting. The operator reset the Information Officer's password herself and created two more client users. Block 5 consent was never formally confirmed to Seagull; the client is in.
- 23 Oct: the operator reported documents not showing; Seagull read the live store from Sunray's Chrome session, found the register-slot fault and the test-seat confusion, fixed the data, issued FRAGO 10, committed the stalled work, created the remote with Sunray, and the build ran from the home PC to v1.9 by 11:09 BST.
- 23 to 28 Oct: no reply from the operator recorded here; the reply to her was drafted on 23 Oct and its sending is unconfirmed. The second client's feedback arrived with Sunray on 28 Oct.

## 9. Open items, by owner

The operator:
- Look at v1.9 in View as client; send T27 to the client user who has not signed in; the Statement's numbers; the date of the next client meeting.

Sunray:
- The OneDrive password file and the demo manager's password reset; `SESSION_SECRET` timed with the operator; the Anthropic key.
- The second client's feedback, and its name into `material/restricted/CLIENT.md` on the mini PC.

Build, on order only:
- Restricted names from every `- Client` line; the second client's organisation (create, brand, seed from a manifest, modules, journey); whatever its feedback orders; structured registers (T23); PDF extraction.

## 10. Where things are

| Thing | Path |
|---|---|
| Job folder | `C:\Projects\Tessera Cast\CAST_JOBS\CAST-0009_ASSURE` on the mini PC (minipc-kwr53), and a clone at the same path on the home PC (`C:\Users\Bendy`) |
| Remote | `lincolnstephens/cast-0009-assure`, private |
| Build source | `06_EXECUTION/build/maximus-src/` (Maximus was the product's earlier name) |
| Gate | `06_EXECUTION/gate/g7_gate_assure_v1.py`; `check_restricted.py` from the job root; `GATE_RESULT.md` |
| Orders | `06_EXECUTION/FRAGO_03` to `FRAGO_10` |
| Reports | `06_EXECUTION/BUILD_REPORT.md` (v1.0 to v1.9); T14 and T17 per version |
| Hand-over | `07_HANDOVER/T18_OPERATOR_BRIEF.md`, `T27_CLIENT_QUICK_START.md` |
| Restricted | `material/restricted/` (mini PC only): `CLIENT.md`, `client_logo.png`, the zip, `operator_feedback_05_20261015.docx` |
| Project docs (Cowork) | `CAST-0009_STATE.md`, `CAST-0009_HANDOFF_03.md` |
| Memory | Project subtree areas/assure.md, areas/cast.md, people/lurong.md, people/rich-roberts.md, the officer's file; account-level areas/azura-dpo.md, people/jad.md, topics/writing-standard.md |

## 11. How to run a build from the new session

1. Check the last DC in R01. Write the FRAGO into `06_EXECUTION/FRAGO_NN_<name>.md` (next is 11). Append the Sunray or delegated decision to R01. Commit by name as Seagull. If the mount cannot push, bundle through the container or let the build session push.
2. Give Sunray the paste for Claude Code on whichever PC: delete stale locks, `git pull`, read the FRAGO, execute under T02 and T05, `check_restricted.py` before every commit, sole writer of R01 from the next DC, push after each commit, deploy with absolute paths and the functions cache off, gate against the primary address at three widths, pin the gate to the demo, client organisations by reads only with a run-start read, write BUILD_REPORT, T14, T17, T18, no secret changes, no real person's password reset, report deploy id, gate result, deviations, each client organisation's audit since the last known entry, what waits on whom.
3. When it reports: verify the deploy serves on the primary address (Netlify reader), pull master onto the mini PC, check each client organisation's audit, update CAST-0009_STATE.md, brief Sunray in bullets, end with the smallest next decision.
4. Configuration that needs no build (settings, seeding, users, branding) can be done from Cowork through the API with a manager session, or from Chrome under Sunray's sign-in when he offers it. Record it as a delegated DC.

## 12. Smallest next decision for the new session

Read the second client's feedback as Sunray presents it, then ask one question before any order: is the second client to be set up as its own organisation on the live product now (seeded, branded, with its own users), or is its feedback to be built into the product first and shown on the demo organisation? That answer decides whether FRAGO 11 is a build order or a configuration order.

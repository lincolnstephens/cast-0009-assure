---
document: ASSURE_SESSION_HANDOFF_02
job: CAST-0009 ASSURE
version: v1.0
status: HANDOFF, 2026-10-14 13:00, from the second Cowork session (28 Sep to 14 Oct) to its successor
authority: Seagull
usage: Read in full at the start of the new ASSURE Cowork session before doing anything. Then the reading order in section 2. This document is the bridge; the job folder is the truth. Supersedes ASSURE_SESSION_HANDOFF.md (28 Sep) as the bridge; that document remains the record of v0.1 to v1.2.
---

# ASSURE session handoff 02

## 1. Bottom line

Tessera Assure v1.8 is live at https://assure.tessera-monitor.com (deploy 6acf5487aa8f49901b804151, 14 Oct 11:08 BST), gate 226 of 226, unit tests 301 of 301, no new money committed. The client has its own organisation in the product, configured with its name, logo and the operator's workplan, documents, links and retention schedule. Named accounts exist for the operator (active), for Sunray (one-time password issued 14 Oct) and for the client's Information Officer (no usable password yet). A client meeting falls in the week of 19 October; the product side for it is complete. Everything open is human: the operator's walk-through, Sunray's secrets and consent steps, the Information Officer's password, the Anthropic key, and the Statement's numbers, which come from the meeting itself.

## 2. Read first, in this order

1. `00_INTENT/T02_HIGHER_COMMANDERS_INTENT.md`. Annex A7 is the stop list. Two rules bent with reasons in FRAGO 07 section 1 (client upload as an offer reviewed by the operator; eight modules replace the twelve-line catalogue).
2. `06_EXECUTION/BUILD_REPORT.md`, sections v1.3 to v1.8. The v1.8 section is the current product description.
3. `07_HANDOVER/T18_OPERATOR_BRIEF.md`, now with sections 5h to 5m (journey, users and organisations, seed, Figures and schedule, documents both ways, branding).
4. `06_EXECUTION/FRAGO_03` to `FRAGO_08`: the orders of this session, each with the reasoning. `00_INTENT/ASSURE_PREPOPULATION_PLAN.md`: what the MITMARK drive held and what was seeded.
5. `registers/R01_DECISION_LOG.md`, DC-32 to DC-71 (this session). `material/lurong_documents/manifest_v2.json`: the seed manifest the client organisation runs on.
6. `material/restricted/CLIENT.md`. Read once. The client's name, the officer's first name, both account addresses and the logo file live there and nowhere else. Grep (`06_EXECUTION/gate/check_restricted.py`, from the job root) before every commit.

## 3. Roles and people

- Sunray: Linc. Takes decisions above delegated authorities; on 30 Sep delegated operational decisions to Seagull ("I need the product to inspect"). Has a manager account on the product (first sign-in pending at handoff).
- Seagull: the Cowork session (you). Reads the folder, briefs in short bullets, writes FRAGOs, records Sunray's decisions in R01 between builds, drafts in Linc's voice under the Linc Writing Standard v1.0 (memory `writing-standard`), configures the live product through its API when that is quicker than a build, never takes a decision Sunray has reserved.
- Build session: Claude Code on the mini PC in the job folder. Executes FRAGOs, commits as `Seagull <seagull@cast.local>` on master, deploys, runs the gate, writes BUILD_REPORT, T14, T17, T18. Sole writer of R01 while a build runs.
- Higher commander: Rich Roberts, MITMARK CEO. No codenames in front of him. Never "£0": "no new money committed" and name what was spent.
- The operator: MITMARK's Chief Information Security Officer, runs the client contract, manager account active since 29 Sep. Her feedback (four rounds: 28 Sep deck, 29 Sep deck, 29 Sep email, 13 Oct document) shaped v1.3 to v1.8. Her three benefits (overview, repository, consolidated actions) remain the test.
- The Information Officer: the reader seat. Part-time role in a full-time post. Confirms, submits requests, uploads documents for review; never edits the workplan.
- The client's CFO: audience of the Statement.

## 4. What exists, by version (this session)

- v1.3 (28 Sep, FRAGO 03): the operator's dashboard. Tracker reduced to Journey, Overall compliance status (eight RAG tiles as navigation), Upcoming. Job management board. Value to the operator's side; Statement linked to its record. Quick questions back on the menu. Modules 2, 3, 8 renamed.
- v1.4 (28 Sep, FRAGO 04): dark text on tiles by measurement; View as client (operator served the client's own responses, read only, diffed identical, audited).
- v1.5 (28 Sep, FRAGO 05): Users and Organisations pages, one-time passwords shown once and changed at first sign-in, organisation switcher, seed command from a manifest. Two security fixes found by the build: raw session ids in the audit (DC-51), admin requests without an organisation served the demo (DC-52).
- v1.6 (30 Sep, FRAGO 06): module pages in the operator's seven sections, score rule (3.6), Figures form, retention schedule, her register list, Statement in three parts (the service; what MITMARK has done; what comes next).
- v1.7 (13 Oct, FRAGO 07): documents both ways (admin download; client upload into the review queue, nothing published or counted until accepted); operator Job management draggable; Ask in client view, Submit request explained; test seat per organisation; eight modules replace the twelve service lines (migration checked); Quick questions reads every published document (docx, xlsx; PDF filed but not read); Settings-to-wrong-organisation fault fixed.
- v1.8 (14 Oct, FRAGO 08): per-organisation client logo (served only to that organisation); "Delivered by MITMARK Intelligence" footer; 6 per cent MITMARK watermark in a text-free margin; client organisation configured (section 6).

## 5. Access and secrets

- Netlify site `tessera-assure`, id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`, team plan. Primary address https://assure.tessera-monitor.com; tessera-assure.netlify.app serves the same deploy.
- Accounts (Users page): the operator (manager, active); Sunray (manager, one-time password issued 14 Oct, `mustChangePassword` until he signs in); the Information Officer (client user of the client organisation, status must_change_password with its one-time password discarded; a Reset in Users issues a fresh one); `operator@demo.local` (manager, password changed by Sunray then re-enabled 14 Oct; the build uses it); `demo@demo.local` (disabled); three `@gate.invalid` users (the gate's, disabled between runs).
- `SESSION_SECRET` unchanged since v1.0; rotation is the step before any client sign-in (DC-48 sequence). Rotating also makes the pre-v1.5 raw session ids in the audit log useless.
- `ANTHROPIC_API_KEY`: still rejected (DC-19). Quick questions returns cited passages and says so; with a working key it composes answers from those passages only.
- Repo: job folder is its own git repo, master at b4c61a5 (v1.8). Not pushed; no remote ordered. Cowork git calls leave stale `.git/*.lock` files on the Windows mount; the build session deletes them first.
- The nine client files and the logo are gitignored (they carry the client's name); `manifest_v2.json` is force-added. `check_restricted.py` scans content including the built bundle.

## 6. The client organisation (org-f2b4afdf0d)

- Name, display name and Statement name: the client's trading name (set 14 Oct via API from the restricted file). Logo loaded. Contract lead: the operator, with title. Information Officer shown as the role. Modules 1 to 8 Live (operator to confirm). Fee blank; rates at house defaults £45 an hour and £650 a day (the product cannot hold them blank; operator confirms with the client). Illustrative off. Journey stage Implementation.
- Content: 19 tasks from the operator's 29 Sep tables (seeded 30 Sep with --replace, DC-60), 9 documents plus 2 ICO links (11 in Documents), retention schedule (7 rows), all 9 documents searchable. Tracker reads "3 of 3 obligations met, nothing overdue" until she dates more tasks.
- Demo organisation (`demo`, 65 tasks, 27 Record entries) kept for prospects. Gate organisation (`org-878b49f7f7`) is the gate's fixture; managers see it.
- Registration renewal confirmed by the operator as 21 March 2027.

## 7. Standing rules that bit us this session

- Build session is the sole writer of R01 while a build runs; Seagull appends only between builds. Numbering collisions happened twice (DC-61, DC-69): check the last DC before issuing.
- The admin switcher once defaulted to the first organisation by name and the gate flipped the client's illustrative flag (DC-63); the gate now pins to the demo at every sign-in. Check the client organisation's audit after any gate run.
- A one-time password is shown once; Seagull passes it to Sunray in chat and nowhere in the folder. Passwords for real people are never reset by the build.
- The client's name: store and restricted folder only. Organisation ids are random so URLs and logs never carry it.
- Secrets stay as they are until the product is running with the operator in it; rotation is the last step before the client (Sunray, 28 Sep).
- "Operational decisions sit with you" (Sunray, 30 Sep): decide, record the decision as delegated in R01, brief, move on.

## 8. What happened that the folder does not fully show

- 28 Sep: three builds in one day (v1.3, v1.4, v1.5) on the operator's second feedback and Sunray's "working programme" direction; the operator's manager account created; her one-time password passed to Sunray.
- 29 Sep: the client organisation created and seeded from the MITMARK DPO/CISO Drive (19 handover activities and documents); the Information Officer's account created with its password discarded, because View as client needs a client seat.
- 30 Sep: the operator's third feedback reseeded the workplan from her own tables; FRAGO 06 issued under the 30 Sep delegation; the custom domain appeared (set by Sunray).
- 1 Oct: Seagull switched the client organisation's illustrative flag back off via the API.
- 13 Oct: the operator's fourth feedback; FRAGO 07; v1.7 same day. Sunray: client meeting the week of 19 Oct.
- 14 Oct: Sunray's manager account; FRAGO 08; the logo delivered into material/restricted via the file bridge; v1.8; the client organisation configured. Sunray changed the demo manager's password, then re-enabled the account for the build.
- The 24 Sep boardroom outcome was never recorded; the operator's feedback was taken as the direction from it. The score-rule conversation between Sunray and the operator (FRAGO 06 3.6) has not been reported back; the rule in 3.6 stands.

## 9. Open items, by owner

The operator:
- View as client on the client organisation; confirm module statuses, the Information Officer's name, the two rates.
- Create a test seat in Users; walk request, upload and Quick questions as the client.
- The deck's module descriptions; the May agreed deliverables; first monthly Figures.
- At the meeting: Block 1 of ASSURE_LIVE_REQUIREMENTS (retainer, contract dates, backfill of work since March), entered into Settings and the Record.

Sunray:
- First sign-in with his one-time password.
- Rotate SESSION_SECRET.
- Block 5 consent; then Reset the Information Officer's password in Users and pass it through the operator.
- Anthropic key on the Netlify project.
- Whether the watermark margin (content up to 128 px narrower on desktop) is acceptable by eye.

Build (on order only):
- Structured registers for DPIAs, vendors and incidents (T23 sequel), so the counters come from records rather than monthly entry.
- PDF text extraction for Quick questions.
- Anything the meeting produces.

## 10. Where things are

| Thing | Path |
|---|---|
| Job folder | `C:\Projects\Tessera Cast\CAST_JOBS\CAST-0009_ASSURE` (mini PC minipc-kwr53) |
| Build source | `06_EXECUTION/build/maximus-src/` |
| Gate | `06_EXECUTION/gate/g7_gate_assure_v1.py`; `check_restricted.py` from the job root |
| Orders | `06_EXECUTION/FRAGO_03` to `FRAGO_08` |
| Reports | `06_EXECUTION/BUILD_REPORT.md` (v1.0 to v1.8); T14 and T17 per version |
| Operator brief | `07_HANDOVER/T18_OPERATOR_BRIEF.md` (sections 5h to 5m new) |
| Seed | `material/lurong_documents/manifest_v2.json` and the nine client files (gitignored) |
| Restricted | `material/restricted/CLIENT.md`, `client_logo.png`, the original zip |
| Project docs (Cowork) | CAST-0009_STATE.md (kept current through this session) |
| Memory | Project subtree areas/cast.md, people/lurong.md, people/rich-roberts.md, the officer's file, topics/devices.md; account-level topics/writing-standard.md |

## 11. How to run a build from the new session

1. Check the last DC in R01. Write the FRAGO into `06_EXECUTION/FRAGO_NN_<name>.md` (next is 09). Append the Sunray or delegated decision to R01.
2. Give Sunray the paste for Claude Code: delete stale `.git/*.lock`, commit the FRAGO and R01 as Seagull, read the FRAGO, execute under T02 and T05, `check_restricted.py` before every commit, sole writer of R01 from the next DC, deploy to the site id, gate against the primary address, pin the gate to the demo, write BUILD_REPORT, T14, T17, T18, no secret changes, no real person's password reset, report deploy id, gate result, deviations, what waits on whom.
3. When it reports: verify the deploy serves on the primary address, check the client organisation's audit for unintended writes, update CAST-0009_STATE.md, brief Sunray in bullets, end with the smallest next decision.
4. Configuration that needs no build (settings, seeding, users) can be done from Cowork through the API with a manager session; record it as a delegated DC.

## 12. Smallest next decision for the new session

Ask Sunray whether the operator has done her walk-through and whether SESSION_SECRET has been rotated. Those two answers decide whether the Information Officer's password goes out before the meeting.

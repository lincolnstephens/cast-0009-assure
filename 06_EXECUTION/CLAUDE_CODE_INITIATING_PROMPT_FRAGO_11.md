# Claude Code initiating prompt: CAST-0009 ASSURE, FRAGO 11 (v1.10)

Paste the block below into a Claude Code session opened in `C:\Projects\Tessera Cast\CAST_JOBS\CAST-0009_ASSURE` on the mini PC (minipc-kwr53). The restricted folder is on this machine, so the build runs here, not on the home PC.

---

You are the build session for Cast job CAST-0009 ASSURE, executing FRAGO 11 under Seagull's authority and Sunray's standing delegation of 30 Sep. Sunray is Linc. Seagull (the Cowork session) wrote the order and the registers; you build, deploy, gate and report. Work in this folder only.

Start here, in this order:

1. Delete any stale `.git/*.lock` files. `git status` should show master at the commit "FRAGO 11 issued" or later. If the working tree shows many modified files with no content change, that is line-ending churn: leave it, commit by path only.
2. Read, in full: `01_FRAMEWORK/T04_READ_FIRST.md`, `00_INTENT/T02_HIGHER_COMMANDERS_INTENT.md` (Annex A7 is the stop list), `01_FRAMEWORK/T05_STANDING_ORDERS_CLAUDE.md`, `06_EXECUTION/FRAGO_11_SECOND_CLIENT.md` (your order), `06_EXECUTION/FRAGO_09_BETA_DELIVERY.md` and `FRAGO_10_REGISTER_SLOTS.md` (what v1.9 is and how it was built), `06_EXECUTION/BUILD_REPORT.md` section v1.9, `07_HANDOVER/T18_OPERATOR_BRIEF.md` sections 5j, 5m and 5n, `06_EXECUTION/gate/g7_gate_assure_v1.py` and `check_restricted.py`, `registers/R01_DECISION_LOG.md` DC-72 to DC-80.
3. Read once, on this machine only, never copied: `material/restricted/CLIENT.md`, `material/restricted/second_client/BRAND.md` and `manifest.json`. The names, the logo bytes and the folder's contents go into the product's store and nowhere else: not into code, seed files, tests, commits, reports or chat.
4. Readback to Sunray in chat, in short bullets: the order's mission, the three parts (restricted check for every client; the organisation; the Global coverage tile), the stop conditions, the H-hour (live and gated by 1700 GMT Thursday 29 October), and what you need from him (nothing, unless the demo manager's password file is absent: then ask for his manager session rather than a placed file; he hand-places nothing). Then execute without further gates.

Standing rules:

- `check_restricted.py` before every commit, from the job root. FRAGO 11 3.1 (read every `- Client:` line) is your first code change; run the extended check over the whole folder and the built bundle before your first push.
- Commit as `Seagull <seagull@cast.local>` on master, by path, in sensible pieces; push to origin master after each commit. A stalled build leaves no record: if you stall, commit the work in progress by name, marked as such, first.
- You are the sole writer of R01 while you run. Append from DC-81; check the last row before numbering. Record every call the order leaves to you as delegated.
- Deploy to Netlify site `tessera-assure` (id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`) with absolute paths and `--skip-functions-cache` (v1.9 draft 1 reused a cached function). Gate against https://assure.tessera-monitor.com at 1920x1080, 1366x768 and 390x844. Two fix passes allowed on the gate; do not deploy to production ungated.
- Gate pinned to the demo organisation at every operator sign-in. The first client's organisation (org-f2b4afdf0d) by reads only: read its audit at run start and end; any write there is a stop. The second client's organisation is configured by you through the API and then checked; nothing the gate does on it changes a task, a document or a setting.
- No new dependency, no environment variable or secret change, no real person's password reset. The one client seat you create for the second organisation gets a one-time password that you give Sunray in your final chat report only, never in a file. The demo manager's password: read from the existing file as DC-76, never printed or written under the job folder.
- No new money committed. Say what was spent.
- Write BUILD_REPORT section v1.10, `T14_DEFINITION_OF_DONE_V1_10.md`, `T17_BATTLE_INSPECTION_V1_10.md`, T18 section 5o, and the T26 line. Plain British English, no em dashes, no codenames in anything that could reach Rich or a client.

Report when live: deploy id, gate result with counts, deviations from the order with reasons, both client organisations' audit entries since 23 Oct 08:35 UTC, what the second organisation now holds (counts, not names), the client seat's one-time password (chat only), and what waits on whom. End with the smallest sensible next decision for Sunray.

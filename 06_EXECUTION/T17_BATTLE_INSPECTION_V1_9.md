---
document: BATTLE_INSPECTION
job: CAST-0009 ASSURE
version: v1.9
status: DEPLOYED, GATE PASSED, CLIENT ORGANISATION UNTOUCHED
authority: Seagull, executed by the build session under T02 A6, FRAGO 09 and FRAGO 10 (with amendment 1)
---

# ASSURE battle inspection, v1.9, the operator's four points and the register slots

- **URL:** https://assure.tessera-monitor.com. Site id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`.
- **Deployed:** 2026-10-23 at 11:09 BST, production deploy `6adb323e240c965c3ec449fe`. The order required it live and gated by 1500 BST; gated by about 11:58.
- **Spend:** no new money committed, and no new dependency. Three deploys on the existing plan.
- **Secrets:** no environment variable or secret changed. No real person's password was reset.
- **Client name and logo:** no restricted folder on this machine (FRAGO 10 section 7). The names were derived from the live product in memory and the logo's reference bytes read from its manager route, never written (DC-76).
  - `check_restricted.py`: 3 terms, 0 hits before every commit and over the folder with the built bundle in it.
  - Line 50 finds no restricted term in the bundle; line 77 finds the stored logo's bytes in no file outside `material/`.

## The gate

**PASS, 247 of 247**, against the production address on run 1: the static checks plus 83 live lines at three resolutions. Line 17 stays retired.

| Run | Result |
|---|---|
| Draft `6adb2c3d94724f712ff86031` | Not used: the CLI reused the cached v1.8 function |
| Draft `6adb2c5c2314f735d35fe1bc`, new and changed lines (1, 11, 12, 15, 21, 59 to 61, 69, 72 to 84) | 71 of 72: line 79 at 1920 |
| Fix pass 1 | Gate only: the role check asks the server who is signed in |
| Draft `6adb2c5c2314f735d35fe1bc`, lines 1 and 78 to 83 | 33 of 33 |
| 1, production `6adb323e240c965c3ec449fe` | **247 of 247** |

Unit and integration tests: **321 of 321**. 20 are new at v1.9: status marks 4, decision notes 6, upload Category 3, register slots 7.

## What the inspection should look at

1. **The register slots.** The newest live match fills each named register; earlier ones follow as "(earlier version)". The module pages read the same list, so they too now show the earlier version, labelled, where until now they hid it (DC-77 item 3). The operator can set any earlier version to not published.
2. **One mark per task, everywhere at once.** Every status column changes look: tick, circles and red, each with its words; the RAG dot has gone from task rows. The operator should see it in View as client.
3. **Line 76 and line 83 now read against the start of the run**, not fixed figures, because the client organisation is live and its documents have moved from 11 to 15 by the operator's own work.
4. **The client organisation was only read.** 110 audit entries before and after; the newest is DC-74's of 08:35 UTC.

## Stop conditions

None was met.
- **The gate:** passed on run 1 against production after one gate-only fix pass on a draft.
- **A client path to a module or to publishing:** none. The client's only document write is the upload, held unpublished with no module; a body carrying a module or section is refused (line 79, `v19.test.ts`).
- **A mark whose colour contradicts its word:** none (line 80, `statusMark.test.ts`).
- **The client's name or logo in a file, commit or the bundle:** none (`check_restricted.py`, lines 50, 77 and 82).
- **Writes to the client organisation:** none by the gate (line 83 and the independent read).

## Deviations

- Inputs taken from the product and an existing file, not placed files; nothing was deleted from `%USERPROFILE%` because nothing was placed there (DC-76).
- Draft 1 is not a v1.9 test; draft 2 and production used absolute paths and no function cache.
- Module pages list earlier register versions (DC-77 item 3).
- Lines 76 and 83 restated against a run-start read; line 84 added (DC-77).

## What waits on whom

- **The operator:** View as client on v1.9; T27 with the sign-ins; unpublish any earlier register version she does not want shown.
- **Sunray:** the OneDrive password file and possibly the password; `SESSION_SECRET` timed with the operator; the Anthropic key; the mini PC to pull master.

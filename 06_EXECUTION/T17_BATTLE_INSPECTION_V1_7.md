---
document: BATTLE_INSPECTION
job: CAST-0009 ASSURE
version: v1.7
status: DEPLOYED, GATE PASSED, MIGRATIONS RUN
authority: Seagull, executed by the build session under T02 A6 and FRAGO 07
---

# ASSURE battle inspection, v1.7, the working programme

- **URL:** https://assure.tessera-monitor.com. Site id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`.
- **Deployed:** 2026-10-13 at about 15:32 BST, production deploy `6ace40f03ee0582cff94f371`.
  - The order required it live by 1800 BST on Wednesday 15 October. It went live on Tuesday 13 October. v1.7 first went live at 14:38, and the deploy at 15:32 carries the gate's fix.
- **Spend:** no new money committed, and no new dependency.
- **Secrets:** no environment variable or secret changed.
- **Client name:** `check_restricted.py` found 0 hits before every commit and deploy. The built bundle is clean (gate line 50).

## The gate

**PASS, 209 of 209**, against the production address on run 2, after one fix pass. That is the static checks plus 69 live lines at three resolutions. Line 17 stays retired.

| Run | Result |
|---|---|
| Draft subsets | All new and changed lines passed after four fixes made before production |
| 1, production `6ace34e70174ad0de201286b` | 201 of 209 |
| Fix pass 1 | One product fix (Settings is bound to its organisation) and three gate fixes |
| 2, production `6ace40f03ee0582cff94f371` | **209 of 209** |

Unit and integration tests: **292 of 292**. 23 are new, in `v17.test.ts` and `guidePaths.test.ts`; the existing tests that checked twelve lines or a refused Ask were restated to the new rules.

## What the inspection should look at

1. **The race in the operator's Settings page.** Found by gate run 1 and fixed in fix pass 1. It predates v1.7.
   - If the organisation switch settled while Settings was loading, the page could show one organisation's settings and save to another.
   - Run 1's demo switch landed on the gate organisation.
   - The client organisation's audit shows nothing from it: its only writes today are the three migration entries, and its last settings change was on 1 October.
   - The page now binds to the organisation it loaded and refuses to save otherwise. Line 6 checks the stored value through the API.
2. **Quick questions runs on passages, and says so.**
   - The team-level key still reaches the site and is still refused (DC-19).
   - The page names the live path from the last real call to the model, not from whether a key variable is present.
   - The model path is proved by mocked unit tests and is ready for a working key.
3. **The test seat.**
   - Its writes are tagged test, left out of the Record, the counters and the Statement, and hidden from the client.
   - Accepting a test confirmation or upload changes nothing real.
   - Client view always serves the client's own seat.

## Migrations (counts in BUILD_REPORT v1.7)

| Migration | Organisation | Result |
|---|---|---|
| Line to module | Demo | 27 entries, 160 hours either side; seven modules in use; its module statuses kept |
| Line to module | Client organisation | No entries; module statuses written, all eight Available |
| Line to module | Gate organisation | 1 entry, 0 hours either side |
| Corpus | Client organisation | 9 files, 9 searchable, 2 to 20 passages each |
| Corpus | Demo, gate organisation | No files to read |

## Stop conditions

None was met.
- **The gate:** passed on run 2, after one fix pass.
- **Client uploads before acceptance:** no path shows one to the client as published, or counts it. `isLiveDocument` is the single rule, and lines 59 and 64 drive it.
- **Writes from the client side:** the new write is the upload FRAGO 07 authorises. Ask in client view writes nothing (line 63). "Send to MITMARK" raises the escalation the Guide already raises (DC-66, item 5).
- **Admin-only fields:** none in a preview response. The searchable marker is admin-only (line 67), and line 33 passes.
- **Cross-organisation reach:** none for a client (line 46). The Settings race was the operator's page, and is fixed.
- **Passwords:** none logged (line 51).
- **Netlify limits:** none forced a design change. The 4 MB cap stands.
- **The client name:** nowhere outside the restricted file.

## Deviations

- PDF text is not extracted on this deployment. A PDF is filed and marked "not searchable", and none has been filed.
- Six of the twelve lines have no module home, not four. The table is in `lines.ts` and the build report.
- The Confirm and upload refusals use their own verb in the order's sentence pattern.
- "Send to MITMARK" was added under a passages reply (DC-66, item 5).

## What waits on whom

- **Sunray:**
  - a working `ANTHROPIC_API_KEY` on the site (DC-19), for written answers;
  - Block 5 consent;
  - rotating `SESSION_SECRET` and disabling the two demo accounts once the operator is satisfied;
  - the Information Officer's password reset and hand-over, through the operator.
- **The operator:**
  - the organisation display name and the eight module statuses;
  - the numbers for the Statement (retainer, contract dates, backfill);
  - a walk through the product with a test seat (Users, "Test seat") before the meeting.
- **Closed:** the client organisation's "show illustrative" switch (DC-63) is off. It was put back on 1 October.

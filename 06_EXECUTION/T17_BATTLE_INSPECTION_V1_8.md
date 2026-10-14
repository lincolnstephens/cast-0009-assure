---
document: BATTLE_INSPECTION
job: CAST-0009 ASSURE
version: v1.8
status: DEPLOYED, CLIENT ORGANISATION CONFIGURED, GATE PASSED
authority: Seagull, executed by the build session under T02 A6 and FRAGO 08
---

# ASSURE battle inspection, v1.8, the client organisation ready

- **URL:** https://assure.tessera-monitor.com. Site id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`.
- **Deployed:** 2026-10-14 at about 11:08 BST, production deploy `6acf5487aa8f49901b804151`. The order required it live by 1800 BST on Wednesday 15 October.
- **Client organisation configured:** 2026-10-14 at 11:09 BST, through the API as the demo manager.
- **Spend:** no new money committed, and no new dependency.
- **Secrets:** no environment variable or secret changed. No real person's password was reset.
- **Client name and logo:** read at run time from `material/restricted/` and sent only to the client organisation's record in the store.
  - `check_restricted.py` found 0 hits before every commit and deploy, and over the job folder with the built bundle in it.
  - Line 50 finds no restricted term in the built bundle.
  - Line 77 finds the logo's bytes in no file outside `material/restricted/`.

## The gate

**PASS, 226 of 226**, against the production address on run 2, after one gate-only fix pass. That is the static checks plus 76 live lines at three resolutions. Line 17 stays retired.

| Run | Result |
|---|---|
| Draft 1 `6acf4f45990417f742d48ce9`, lines 7 and 71 to 75 | 2 of 9: the demo client seat is disabled, so every client sign-in was refused |
| Draft 2 `6acf52b43bbad75bb40e47b8`, the same lines plus 33, then 8 at 390, and 74 and 75 at 1366 and 390 | All pass except the client-logo half of 72 and 73, which waited on the configuration |
| 1, production `6acf5487aa8f49901b804151`, after configuration | 223 of 226: line 73's thumbnail measured before it loaded, at each width |
| Fix pass 1 | Gate only: wait for the image to load before measuring (lines 72 and 73) |
| 2, production `6acf5487aa8f49901b804151` | **226 of 226** |

Unit and integration tests: **301 of 301**. 9 are new, in `v18.test.ts`.

## What the inspection should look at

1. **The gate's client is no longer the demo client account.**
   - Sunray disabled `demo@demo.local` and re-enabled only the demo manager. I did not re-enable it.
   - The gate now drives the client side as its own seat on the demo organisation, `gate-demo-client@gate.invalid`. That seat is enabled with a fresh one-time password for each run and disabled again at its end (DC-70).
   - At rest, no demo client account can sign in.
2. **Client view now serves the active seat.** An organisation's active client seat is served ahead of a disabled one. This changes what View as client shows only when an organisation has more than one non-test client seat. The client organisation has one.
3. **The watermark's contrast is held by layout, not by luck.**
   - At 6 per cent, the mark's darkest colour would pull the house muted grey below 4.5:1, so the mark sits in a gutter the content never enters.
   - Line 75 measures every text element that could pass beneath the mark, against the page blended with the mark's darkest colour, on every client page at every width.
4. **The client organisation was only read by the gate.** No client view of it was opened, because that writes an audit row. Its audit since the configuration holds only the three configuration entries.

## The client organisation, as set (no name)

| Setting | Value |
|---|---|
| Organisation name, display name, Statement name | the client's trading name, all three equal |
| Information Officer | "Information Officer" |
| MITMARK contract lead | the operator, "..., Chief Information Security Officer, MITMARK Intelligence" |
| Module status 1 to 8 | Live |
| Retainer | not entered; the Statement says so |
| Hourly rate, day rate | £45, £650, unchanged house figures |
| Show illustrative | off |
| Journey stage, retention schedule, links | unchanged |
| Logo | the client's PNG, 37,934 bytes, version 1 |
| Tasks, documents | 19 and 11 before and after; workplan and documents identical by hash |

## Stop conditions

None was met.
- **The gate:** passed on run 2, after one gate-only fix pass.
- **The client's name or logo in a file or commit:** none. Both are checked by `check_restricted.py` and by lines 50 and 77.
- **Cross-organisation reach:** none. A logo is served only to its own organisation's seat and its client view (line 72). Line 46 still passes.
- **Writes from the client side:** none new.
- **Client uploads before acceptance:** unchanged since v1.7 (lines 59 and 64).
- **Admin-only fields:** none in a preview response (line 33). The logo's metadata is on the admin settings only.
- **Passwords:** none logged (line 51). No real person's password was reset.
- **Netlify limits:** none touched. The logo is capped at 500 KB.

## Deviations

- The gate's client seat is its own seat on the demo organisation, not `demo@demo.local` (DC-70).
- The hourly and day rates keep the house figures. The order says to leave rates blank; a rate cannot be blank, and the retainer, the fee the Statement turns on, is blank.
- The watermark sits in a reserved right-hand gutter, so the content area is 96px to 128px narrower from 640px wide.
- The organisation was configured before the full gate run rather than after it, because the gate's line 76 checks the configuration.

## What waits on whom

- **The operator:**
  - View as client;
  - confirm or change the module statuses and the Information Officer's name;
  - check the rates;
  - a test-seat walk through request, upload and Quick questions.
- **Sunray:**
  - rotate `SESSION_SECRET`;
  - Block 5 consent, then the Information Officer's password through the operator;
  - the Anthropic key (DC-19).
- **After the meeting:** the Statement's numbers.

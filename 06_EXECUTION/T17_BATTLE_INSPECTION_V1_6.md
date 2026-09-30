---
document: BATTLE_INSPECTION
job: CAST-0009 ASSURE
version: v1.6
status: DEPLOYED, GATE PASSED, ONE SETTING TO PUT BACK (see "What waits on whom")
authority: Seagull, executed by the build session under T02 A6 and FRAGO 06
---

# ASSURE battle inspection, v1.6, the module pages

- **URL:** https://assure.tessera-monitor.com. This is the site's production address; https://tessera-assure.netlify.app serves the same deploy. Site id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`.
- **Deployed:** 2026-09-30 at about 14:16 BST, production deploy `6abd0be1fabe2fb17880b662`.
  - FRAGO 06 was issued at 10:10. This session was tasked at 13:50, already past the order's four hours, and was live 26 minutes later.
- **Spend:** no new money committed. The work used build-session time, local compute, and three deploys on the existing Netlify plan (two drafts, one production). No new dependency.
- **Secrets:** no environment variable or secret changed.
- **Client name:** `check_restricted.py` finds 0 hits across 285 files before every deploy. The built bundle is clean (gate line 50).

## The gate

**PASS, 172 of 172**, against the production URL. That is the static checks plus 57 definition-of-done lines at 1920x1080, 1366x768 and 390x844. The two production runs printed "v1.5" in their header because the script's label had not been changed. They drove the v1.6 definition of done, and the label now reads v1.6.

| Run | Target | Result |
|---|---|---|
| Subset | Draft `6abd0b2beb07c4b29b9bfdff` | The new and changed lines (1, 3, 5, 13, 22, 25, 26, 52 to 57) at 1920x1080: 15 of 15 |
| 1 | Production `6abd0be1fabe2fb17880b662` | 168 of 172. Line 6 failed at all three resolutions; the cause was the gate, below. Line 54 failed once at 390 on a TLS drop in the gate's own HTTP call |
| Fix pass 1 (the only one) | Gate | Every operator sign-in in the gate now pins the admin switcher to the demo organisation, and refuses to go on if it cannot. No product change |
| 2 | Production `6abd0be1fabe2fb17880b662` | **172 of 172** |

The new lines 52 to 57 all pass:
- **Useful links (52).** Every tile opens something, the tiles are in the operator's order, and module 2 carries her five registers.
- **Milestones (53)** are the module's dated tasks and nothing else. There are 35 across the demo's eight modules.
- **Counters (54)** appear on modules 5 to 8 only. Each carries its basis, and an empty one reads "No data yet".
- **Figures and the retention schedule are operator-only (55).** The client is refused both on the API and in the browser. A reported figure reaches the client with its date and without the operator's id.
- **The Statement (56)** has the service, what MITMARK has done and what comes next, in order, with no comparison.
- **Register aliases (57).** "Vendor list" fills the Vendor log's place on Documents and on modules 7 and 2.

Four lines were rewritten for v1.6:
- **Line 3:** the admin views now include Figures.
- **Line 22:** the headline is the mean module score, checked against the API's module scores.
- **Line 25:** each tile shows its module's score.
- **Line 26:** the seven sections appear in order, each score adds up and matches its tile, with the basis in text and on hover.

## Found by the gate, and it matters

**The v1.5 gate, run today, changed a real organisation's setting.** The admin switcher defaults to the first organisation by name. Since 29 September that has been "Client organisation 01", which did not exist when v1.5 was gated. Gate lines 6 and 14 switch "show illustrative" off and back on in Settings. In run 1 they did this on the client organisation, not the demo, and left its switch **on**. An organisation is created with it off.
- The client organisation holds **no Record entries**, so nothing illustrative reached its portal, or could have.
- The audit shows 13 settings updates on it between 14:19 and 14:46 BST, all from the gate. Run 2, with the fix, made none.
- The build session tried to put the switch back off and was refused by its permission layer, so this waits on Sunray or the operator (DC-63).

## The client organisation, v2.1 additions

These were applied to org-f2b4afdf0d with the seed's new `--additions` mode, dry run first:
- 2 ICO links filed against module 1.
- A 7-row retention schedule set on module 3.
- A snapshot through the admin API before, after, and again after gate run 2 shows the 19 tasks and the 9 filed documents with identical digests.

The pages were rendered in View as client:
- **Module 1:** the two links.
- **Module 2:** five registers (two filed templates, three not yet filed).
- **Module 3:** seven retention tiles and the draft policy.
- **Module 4:** four policies, version 1 approved and three drafts.
- **Modules 5 to 8:** counters reading "No data yet".
- **Statement:** in three parts.
- **Front page:** "Compliance score: 100% (3 of 8 modules green)", nothing overdue.
- No console errors.

## Also inspected

- **269 unit and integration tests pass.** 27 are new, in `modulePages.test.ts`. They cover the score rule case by case, milestones, tiles, counters, the Figures route, the seed's additions (untouched tasks and documents, idempotent) and the Statement.
- **Web, server and shared type-check clean.**

## Stop conditions

None was met:
- The gate passed on its second run.
- The only client-side write is still confirm; Figures and the schedule are admin routes, refused to the client (line 55).
- No Netlify limit forced a design change.
- The client name is found nowhere outside the restricted file.
- No admin-only field is in a preview response: the operator's id stays server-side, and line 33 passed.
- No path between organisations (line 46).
- No password in a log (line 51).

## Deviations

- **Module descriptions are unchanged.** The operator's deck text is not in the job folder.
- **R01 starts at DC-62.** The order said DC-61, which was taken.
- **The score reads a seed-closed task as met on its date** (DC-62). Otherwise her "Completed" rows would score as late.
- **Module 8 shows its two counts side by side, not summed** (DC-62).

## What waits on whom

- **Sunray or the operator:** put "show illustrative" back **off** for Client organisation 01 (Settings, with that organisation selected). The gate switched it on (DC-63). There is no effect today, but it must be off before any Record entry is added there.
- **Sunray:** take the score rule (FRAGO 06 3.6, as built) to the operator's conversation. A different outcome is a short order.
- **The operator:**
  - the deck's module descriptions, if she wants them as the defaults;
  - the May agreed deliverables, for "what comes next";
  - her first monthly figures, in Figures.
- **Unchanged from v1.5:** rotating `SESSION_SECRET` (DC-51), and the Information Officer's password (Sunray).

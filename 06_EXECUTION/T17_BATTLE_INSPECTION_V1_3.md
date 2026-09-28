---
document: BATTLE_INSPECTION
job: CAST-0009 ASSURE
version: v1.3
status: DEPLOYED, GATE PASSED, AWAITING SUNRAY VISUAL CHECK
authority: Seagull, executed by the build session under T02 A6 and FRAGO 03
---

# ASSURE battle inspection, v1.3, the operator's dashboard

- URL: https://tessera-assure.netlify.app (site id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`, unlisted, noindex)
- Deployed: 2026-09-28, production deploy `6aba2719e5118b5c586c6971`, before 10:00 BST against a deadline of 18:00 BST.
- Source: `06_EXECUTION/build/maximus-src/`. The built output is in `06_EXECUTION/build/dist/`.
- Spend: no new money committed. What was spent: build-session time, compute on this machine, and four deploys on the existing Netlify plan (three drafts gated before production, then one production deploy). No new service and no new dependency.
- Client name: `check_restricted.py` passes (0 hits across 255 files). It is now also gate line 30.

## The gate

**PASS, 97 of 97**, against the production URL. Static 11 of 11; driven lines at 1920x1080, 1366x768 and 390x844.

The definition of done has 31 lines (`T14_DEFINITION_OF_DONE_V1_3.md`). Of v1.2's 22 lines, 7 are unchanged, 14 are updated for the new structure, and 1 is retired (L17, the KPI tiles, which no longer exist). Nine lines are new:

| # | The line | Result |
|---|---|---|
| 23 | The tracker has exactly three sections, Journey, Overall compliance status and Upcoming, and none of the removed elements | Pass |
| 24 | The journey names the current stage in words; five nodes in order; "Current" in text | Pass |
| 25 | Eight module tiles, each with its RAG and "{done} of {total} done", each opening its own module page | Pass |
| 26 | Every module page runs name, introduction, documents, compliance status, task table, module links; the page's count matches its tile | Pass |
| 27 | The Statement links to "The record behind this statement" at /value | Pass |
| 28 | Quick questions says what it does, in the order's words | Pass |
| 29 | The old module names appear nowhere on the client side | Pass |
| 30 | `check_restricted.py` passes | Pass |
| 31 | Value is on the operator's side with the way to the rates; Settings carries the journey and introductions | Pass |

The client's navigation now reads exactly tracker, documents, jobs, request, statement, guide (L18). Job management has three columns and no write control except confirm (L21).

## How it got there

1. **Run 1, draft `6aba210f6a0dcad7b496b357`: 91 of 97.** L24 and L26 failed at all three widths.
2. **Fix pass 1**, the only one used:
   - **Product:** the journey node, the module tiles and the document list ran their name and label together with no space, so a screen reader heard "Assessment and discoveryCurrent". Fixed.
   - **Product:** the module documents section lost its wrapper when nothing was filed, and the RAG label sat outside the status line. Fixed.
   - **Gate:** it demanded an href on every document. A policy opens in the policy panel as a button, as it already does on Compliance Documents. The gate now accepts either.
3. **Run 2, draft `6aba242b0b89b51750562659`: 96 of 97.** The one failure was the operator sign-in timing out on L31 at 390 wide. That line passed at every width in run 1 and at the other two widths in run 2, and the login route has no rate limit. Recorded as a harness flake and not changed (R01 DC-40).
4. **Production `6aba2719e5118b5c586c6971`: 97 of 97.**

## Also inspected

- **215 unit and integration tests pass.** Twelve are new (`trackerV13.test.ts`). They cover:
  - the journey derived, set, cleared, and with nothing dated
  - a stage outside 1 to 5 being refused
  - Upcoming's order, its limit of eight, and what it leaves out (overdue, done, the client's own, undated)
  - the module page's introduction, fraction and documents
  - the client being refused the settings route
  - the Waiting on you empty message
- **The rename was checked against the live store.** There were 65 tasks before the deploy and 65 after, by module 7, 11, 9, 8, 3, 6, 4, 17 both times. Tasks and documents carry the module id, never its name, so nothing had to move.
- Screenshots of the tracker, Job management and a module page at 1366 and 390 wide. At 390 the journey turns to run top to bottom and the tiles stack in one column, with no horizontal scroll.

## Against A7

- **No new system for her to maintain.** Confirming a task is still the client's only write. The journey stage and the module introductions are the operator's settings, and a test proves the client is refused. Holds.
- **No claim without a record.**
  - The score reads "Compliance score: 38% (3 of 8 obligations met)", with the as-at date and basis beneath it.
  - Every module page states "{done} of {total} done, {pct}%".
  - The Statement links to its record, now that Value has left the client menu.
  - Upcoming is built from the operator's workplan, not from a second list.
  - Holds.
- **No marketing to the CFO.** The statement is unchanged apart from the link at its foot. Holds.
- **The human service is not thinned.** Nothing was removed from the record. The obligation, how we do it, and the history stay on each module page, below the module links (DC-35). Holds.
- **No new money committed.** Holds.

## Known limits at this version

- **Tile contrast.** The order asks for white text on the status ramp. White on the house green and amber is below WCAG AA contrast. The build adds a text shadow and writes the RAG label on each tile, but a darker fill for tiles is the real fix, and that is a design decision for Sunray (DC-37).
- **The journey stage shows the derived value, Assessment and discovery.** The operator's deck says Implementation, and she sets it in Settings in one step (DC-38, T18 section 5h).
- **No documents were uploaded.** `material/lurong_documents/` was not in the folder. Module pages say "None filed yet" wherever nothing is filed. Policies in the pack appear against their modules (DC-39).
- **The Job management board is long on the demo data.** Not started holds 59 cards, because the whole year's workplan is applied. The module and owner filters narrow it.
- Unchanged from v1.2:
  - The file cap is 4 MB.
  - Procedures are unpublished.
  - The Anthropic key is still rejected, so Quick questions answers by matching the approved text. Its wording is true either way.

---
document: DEFINITION_OF_DONE
job: CAST-0009 ASSURE
version: v1.0
status: WRITTEN BEFORE THE ITERATION, gate is gate/g7_gate_assure_v1.py
authority: Seagull, executed by the build session under T02 A6
register_id: T14
---

# DEFINITION OF DONE, v1.0, OPERATION ASSURE

**Written by:** the build session, before the v1.0 iteration opened.
**Gate:** `06_EXECUTION/gate/g7_gate_assure_v1.py`.
**Machine-readable copy:** `06_EXECUTION/gate/DEFINITION_OF_DONE.json`, which the gate reads so the lines and the checks cannot drift apart.

The product is Tessera Assure v1.0: the MAXIMUS product shell carrying the ASSURE value layer, deployed to `tessera-assure`.

## The lines

| # | The line | How the gate drives it | Pass criterion | Applies to |
|---|---|---|---|---|
| 1 | A person opens the URL, signs in with the demo credentials, and arrives in the client portal. | Playwright loads the URL, fills the sign-in form and submits. | The client portal renders after sign-in. No error is shown. | 1920x1080, 1366x768, 390x844, deployed URL |
| 2 | Every view in the client portal loads and shows a heading: overview, guide, request, value, policies, posture. | Clicks each nav element carrying `data-view`, waits for the section, reads its heading. | All six views render a non-empty heading. None throws. | All three resolutions |
| 3 | Every view in the admin workspace loads and shows a heading: queue, record, clocks, policies, posture, settings, audit. | Enters the admin workspace, then clicks each admin `data-view` in turn. | All seven views render a non-empty heading. | All three resolutions |
| 4 | The Record in the client portal shows the work MITMARK did, one row per entry. | Reads `[data-testid="record-table"]` and counts its body rows. | At least one row. Every row carries a named reviewer. | All three resolutions |
| 5 | The Statement renders as a plain document and states its own limitations. | Reads `[data-testid="statement"]` text. | Contains the phrase "have not been independently verified". | All three resolutions |
| 6 | With "show illustrative" off, no illustrative entry reaches the client side. | Switches the demo toggle off in admin, returns to the client Statement, searches its text. | The word "illustrative" does not appear anywhere in the client-side Statement. | 1920x1080 |
| 7 | The Statement prints as a document, not as a screen. | `emulate_media(media="print")`, then reads visibility of the header, the navigation and the statement. | Header and navigation hidden. Statement visible. | 1920x1080 |
| 8 | The product is usable on a phone. | Sets the viewport to 390 wide and compares `document.scrollWidth` to the viewport on every view. | No view scrolls horizontally, at 390 wide, within one pixel. | 390x844 |
| 9 | Nothing in the console is broken. | Collects console errors and page errors across the whole run. | Zero console errors. Zero uncaught page errors. | Deployed URL |
| 10 | The beta is not indexable. | Reads the head of the deployed page and the response headers. | `noindex` is declared. | Deployed URL |

## Static lines, run against the source rather than the browser

| # | The line | Pass criterion |
|---|---|---|
| S1 | No banned term appears in the source or the built output. | `gate/banned_terms.txt` has zero hits. |
| S2 | The client's name and the Information Officer's name appear nowhere in the source, the built output, the store schema, the seed data or the logs. | Zero hits. The names are read at run time from `material/restricted/CLIENT.md` and are never printed by the gate or written to the report. |
| S3 | The retired house colours do not appear. | No hit on lavender `#626ba5` or olive `#b0bf62`. |
| S4 | A print stylesheet exists. | `@media print` is present in the source. |

## Notes on the standard

- Line 4 carries A3's rule directly: the saving must be visible as a record, not a claim. A Record with no rows fails whatever else passes.
- Line 6 carries A7's rule that no claim reaches the client without a record behind it. An illustrative entry is not a record of work done, so it must not reach the client side unless the operator has deliberately switched it on for a demo, and then the banner says so.
- Line 5 exists because the statement is the thing the Information Officer forwards unedited. A statement that does not state its own limitations is marketing, which A7 refuses.

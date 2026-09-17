---
document: DEFINITION_OF_DONE
job: CAST-0009 ASSURE
version: v1.1
status: WRITTEN DURING THE ITERATION, gate is gate/g7_gate_assure_v1.py
authority: Seagull, executed by the GATE lane under FRAGO 01, section 10(f)
register_id: T14
---

# DEFINITION OF DONE, v1.1, OPERATION ASSURE

**Written by:** the GATE lane, while the Compliance Tracker was still being built in
the other lanes.
**Gate:** `06_EXECUTION/gate/g7_gate_assure_v1.py`.
**Machine-readable copy:** `06_EXECUTION/gate/DEFINITION_OF_DONE.json`, which the gate
reads so the lines and the checks cannot drift apart.

The product is Tessera Assure v1.1: v1.0 unchanged, plus the Compliance Tracker
client home, the workplan layer and the eight area pages, per
`06_EXECUTION/FRAGO_01_TRACKER.md`. Lines 1 to 10 are v1.0's, three of them
extended to reach the new views; lines 11 to 17 are new.

## The lines

| # | The line | How the gate drives it | Pass criterion | Applies to |
|---|---|---|---|---|
| 1 | A person opens the URL, signs in with the demo credentials, and arrives in the client portal. | Playwright loads the URL, fills the sign-in form and submits. | The client portal renders after sign-in. No error is shown. | 1920x1080, 1366x768, 390x844, deployed URL |
| 2 | Every view in the client portal loads and shows a heading: guide, request, value, statement, posture, exposure, **tracker**. | Clicks each nav element carrying `data-view`, waits for the section, reads its heading. | All seven views render a non-empty heading. None throws. | All three resolutions |
| 3 | Every view in the admin workspace loads and shows a heading: queue, record, clocks, policies, posture, alerts, exports, settings, audit, **workplan**, **procedures**. | Enters the admin workspace, then clicks each admin `data-view` in turn. | All eleven views render a non-empty heading. | All three resolutions |
| 4 | The Record in the client portal shows the work MITMARK did, one row per entry. | Reads `[data-testid="record-table"]` and counts its body rows. | At least one row. | All three resolutions |
| 5 | The Statement renders as a plain document and states its own limitations. | Reads `[data-testid="statement"]` text. | Contains the phrase "have not been independently verified". | All three resolutions |
| 6 | With "show illustrative" off, no illustrative entry reaches the client's Statement. | Switches the demo toggle off in admin, returns to the client Statement, searches its text, puts the switch back. | The word "illustrative" does not appear anywhere in the client-side Statement. | All three resolutions |
| 7 | The Statement prints as a document, not as a screen. | `emulate_media(media="print")`, then reads visibility of the header, the navigation and the statement, resets to screen. | Header and navigation hidden. Statement visible. | All three resolutions |
| 8 | The product is usable on a phone. | Sets the viewport to 390 wide and compares `document.scrollWidth` to the viewport on every view, **including the tracker and an area page**. | No view scrolls horizontally, at 390 wide, within one pixel. | 390x844 |
| 9 | Nothing in the console is broken. | Collects console errors and page errors across the whole run. | Zero console errors. Zero uncaught page errors. | Deployed URL |
| 10 | The beta is not indexable. | Reads the head of the deployed page. | `noindex` is declared. | Deployed URL |
| 11 | The client's home is the Compliance Tracker and answers the six questions. | Signs in as the client, opens `[data-view="tracker"]`, waits for six named test ids. | `tracker-header`, `overall-status`, `journey-strip`, `kpi-row`, `area-tiles` and `for-you` are all present. A missing test id fails; it is never treated as a skip. | All three resolutions |
| 12 | Every task table shows the six questions, in order, and they are not renamed. | Finds every `[data-testid="task-table"]` on the client tracker, on an area page (reached by clicking the first tile in `area-tiles`), and on the admin Workplan page, reads its `th` cells. | Every table's header cells read exactly `What, How, Who, When, Done, Status`, in that order. | All three resolutions |
| 13 | No percentage is shown without its fraction beside it. | Walks the rendered text of the client tracker and an area page for `\d+%`, checks the same element's or its parent's text for `\d+ of \d+`. | No offending percentage found. Offending text is reported quoted; it is rendered UI copy, not restricted data. | All three resolutions |
| 14 | No illustrative figure is reachable on the client side of the tracker. | Same two-role pattern as line 6: switches the operator's show-illustrative toggle off, reads the client tracker and an area page, restores the switch. | The word "illustrative" does not appear anywhere on the client tracker or the area page. | All three resolutions |
| 15 | The client can confirm a task assigned to them and can do nothing else to the workplan. | Checks `[data-testid="confirm-task"]` exists inside `[data-testid="for-you"]`, then scans every button and link on the tracker and on every area tile in turn for accessible text matching edit, delete, remove, reopen, reprioritise, change status or mark done. | Confirm control present. No forbidden control found on the tracker or on any area page. | All three resolutions |
| 16 | An area page prints as a clean document. | `emulate_media(media="print")` on an area page, reads visibility of header/nav, the obligation text and the task table, resets to screen. | Header and nav hidden. Obligation and task table visible. | All three resolutions |
| 17 | "No data yet" is a state, not a blank. | Reads every tile inside `[data-testid="kpi-row"]` on the client tracker. | Every KPI tile renders non-empty text. None is blank. | All three resolutions |

## Static lines, run against the source rather than the browser

| # | The line | Pass criterion |
|---|---|---|
| S1 | No banned term appears in the source or the built output. | `gate/banned_terms.txt` has zero hits. |
| S2 | The client's name and the Information Officer's name appear nowhere in the source, the built output, the store schema, the seed data or the logs. | Zero hits. The names are read at run time from `material/restricted/CLIENT.md` and are never printed by the gate or written to the report. |
| S3 | The retired house colours do not appear. | No hit on lavender `#626ba5` or olive `#b0bf62`. |
| S4 | A print stylesheet exists. | `@media print` is present in the source. |
| S5 | `TASK_COLUMNS` in `packages/shared/src/tracker.ts` is exactly the six questions, in order. | The array literal reads `["What", "How", "Who", "When", "Done", "Status"]`. Checked at the source, so a rename cannot even reach the browser before the gate catches it; line 12 then checks the rendered result matches this same contract. |

**A static check for a bare percentage in a template literal was considered and
deliberately left out.** The source tree mixes CSS and Tailwind percentages
(`width: 100%`, opacity keyframes, grid track sizes) with the data percentages
FRAGO 4.2 governs, and a regex over source text cannot tell one from the
other, nor can it see whether the rendered fraction actually sits beside the
percentage in the DOM, which is the rule that matters. A check built on that
regex would either wave through real violations (the fraction computed and
placed elsewhere at render time) or fail on ordinary CSS, which is exactly
the "cries wolf" failure mode the gate exists to avoid. Line 13, driven,
checks the real rule against the rendered page instead, and is the
authoritative check for this rule in v1.1.

## Notes on the standard

- Line 4 carries A3's rule directly: the saving must be visible as a record, not a
  claim. A Record with no rows fails whatever else passes.
- Line 6 and line 14 carry A7's rule that no claim reaches the client without a
  record behind it. An illustrative entry is not a record of work done, so it must
  not reach the client side unless the operator has deliberately switched it on,
  and line 14 extends that rule to the new tracker surface: the KPI tiles, the
  journey strip and the area pages must not smuggle an illustrative figure past
  the same switch that gates the Statement.
- Line 5 exists because the statement is the thing the Information Officer
  forwards unedited. A statement that does not state its own limitations is
  marketing, which A7 refuses.
- **Line 13 exists because FRAGO section 4.2's stop condition is easy to lose in a
  redesign.** "Never show a percentage without the fraction beside it" reads as a
  style note until a KPI tile ships with a bald `67%` and no basis, at which point
  it is a client-facing number nobody can audit. The line makes the rule
  executable: every percentage the client can see must carry its `n of m` next to
  it, checked against the actual rendered page rather than trusted to survive the
  next refactor.
- **Line 15 exists because FRAGO section 12 names it directly: "any design that
  lets the client edit a task" is a stop condition.** The one rule in section 3 is
  "the workplan is MITMARK's workplan for the client"; the client's only write
  path is a confirmation, which is an audit-logged event, not a status change. A
  gate that only checked the confirm button existed would miss the more
  dangerous failure, an edit or delete control left reachable by accident, so
  this line is written the other way round: it asserts the negative, across
  every area page, not just the one the confirm control lives on. This is the
  most strictly written line in v1.1 because it is the one FRAGO names as an
  outright stop condition rather than a quality bar.

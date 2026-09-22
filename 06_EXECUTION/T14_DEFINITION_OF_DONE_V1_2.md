---
document: DEFINITION_OF_DONE
job: CAST-0009 ASSURE
version: v1.2
status: WRITTEN DURING THE ITERATION, gate is gate/g7_gate_assure_v1.py
authority: Seagull, executed by the GATE lane under FRAGO 02, section 8(e)
register_id: T14
---

# DEFINITION OF DONE, v1.2, OPERATION ASSURE

**Written by:** the GATE lane, while the other lanes were still restructuring the
client portal to Lurong's navigation.
**Gate:** `06_EXECUTION/gate/g7_gate_assure_v1.py`.
**Machine-readable copy:** `06_EXECUTION/gate/DEFINITION_OF_DONE.json`, which the gate
reads so the lines and the checks cannot drift apart.

The product is Tessera Assure v1.2: v1.1 unchanged in capability, restructured to
Lurong's own navigation, per `06_EXECUTION/FRAGO_02_LURONG.md`. Lines 1 to 17 are
v1.1's; five of them (2, 3, 8, 12, 15) are updated for the new navigation and the
two new pages. Line 1's success selector moves from `[data-view='guide']` to
`[data-view='tracker']`, because the Policy Guide is no longer a client nav item
and the Compliance Tracker is the constant home across both versions; this did
not change what line 1 tests, only which still-present element it waits for.
Lines 18 to 22 are new.

## The lines

| # | The line | How the gate drives it | Pass criterion | Applies to |
|---|---|---|---|---|
| 1 | A person opens the URL, signs in with the demo credentials, and arrives in the client portal. | Playwright loads the URL, fills the sign-in form and submits, then waits for `[data-view='tracker']`. | The client portal renders after sign-in. No error is shown. | 1920x1080, 1366x768, 390x844, deployed URL |
| 2 | Every view in the client portal loads and shows a heading: Compliance Tracker, Compliance Documents, Jobs, requests and clocks, Value, Statement. Posture and exposure have left the client navigation. | Clicks each nav element carrying `data-view`, waits for the section, reads its heading. | All six views render a non-empty heading. None throws. | All three resolutions |
| 3 | Every view in the admin workspace loads and shows a heading: queue, record, clocks, policies, **documents, jobs**, posture, alerts, exports, settings, audit, workplan, procedures. | Enters the admin workspace, then clicks each admin `data-view` in turn. | All thirteen views render a non-empty heading. | All three resolutions |
| 4 | The Record in the client portal shows the work MITMARK did, one row per entry. | Reads `[data-testid="record-table"]` and counts its body rows. | At least one row. | All three resolutions |
| 5 | The Statement renders as a plain document and states its own limitations. | Reads `[data-testid="statement"]` text. | Contains the phrase "have not been independently verified". | All three resolutions |
| 6 | With "show illustrative" off, no illustrative entry reaches the client's Statement. | Switches the demo toggle off in admin, returns to the client Statement, searches its text, puts the switch back. | The word "illustrative" does not appear anywhere in the client-side Statement. | All three resolutions |
| 7 | The Statement prints as a document, not as a screen. | `emulate_media(media="print")`, then reads visibility of the header, the navigation and the statement, resets to screen. | Header and navigation hidden. Statement visible. | All three resolutions |
| 8 | The product is usable on a phone, including the new client views. | Sets the viewport to 390 wide and compares `document.scrollWidth` to the viewport on every view, **now tracker, documents, jobs, request, value, statement and an area page**. | No view scrolls horizontally, at 390 wide, within one pixel. | 390x844 |
| 9 | Nothing in the console is broken. | Collects console errors and page errors across the whole run. | Zero console errors. Zero uncaught page errors. | Deployed URL |
| 10 | The beta is not indexable. | Reads the head of the deployed page. | `noindex` is declared. | Deployed URL |
| 11 | The client's home is the Compliance Tracker and answers the six questions. | Signs in as the client, opens `[data-view="tracker"]`, waits for six named test ids. | `tracker-header`, `overall-status`, `journey-strip`, `kpi-row`, `area-tiles` and `for-you` are all present. A missing test id fails; it is never treated as a skip. | All three resolutions |
| 12 | Every task table shows the six questions, in order, and they are not renamed. Checked on an area page, **on the client Jobs page**, and on the admin Workplan page. | Finds every `[data-testid="task-table"]` on an area page (reached by clicking the first tile in `area-tiles`), on the client Jobs page, and on the admin Workplan page, reads its `th` cells. | Every table's header cells read exactly `What, How, Who, When, Done, Status`, in that order. | All three resolutions |
| 13 | No percentage is shown without its fraction beside it. | Walks the rendered text of the client tracker and an area page for `\d+%`, checks the same element's or its parent's text for `\d+ of \d+`. | No offending percentage found. Offending text is reported quoted; it is rendered UI copy, not restricted data. | All three resolutions |
| 14 | No illustrative figure is reachable on the client side of the tracker. | Same two-role pattern as line 6: switches the operator's show-illustrative toggle off, reads the client tracker and an area page, restores the switch. | The word "illustrative" does not appear anywhere on the client tracker or the area page. | All three resolutions |
| 15 | The client can confirm a task assigned to them and can do nothing else to the workplan, **on the tracker, on Jobs or on Documents**. | Checks `[data-testid="confirm-task"]` exists inside `[data-testid="for-you"]`, then scans every button and link on the tracker, on every area tile, **on Jobs and on Documents** for accessible text matching edit, delete, remove, reopen, reprioritise, change status or mark done. | Confirm control present. No forbidden control found on any of the four surfaces. | All three resolutions |
| 16 | An area page prints as a clean document. | `emulate_media(media="print")` on an area page, reads visibility of header/nav, the obligation text and the task table, resets to screen. | Header and nav hidden. Obligation and task table visible. | All three resolutions |
| 17 | "No data yet" is a state, not a blank. | Reads every tile inside `[data-testid="kpi-row"]` on the client tracker. | Every KPI tile renders non-empty text. None is blank. | All three resolutions |
| 18 | **The client's navigation is Lurong's, in her order.** | Reads `nav [data-view]` (a single, specific selector; nothing is clicked) in DOM order. | The `data-view` values read exactly `tracker, documents, jobs, request, value, statement`, in that order. Neither `posture` nor `exposure` appears anywhere in the list. | All three resolutions |
| 19 | **The eight modules carry their v1.2 titles.** | Reads the name in every `[data-testid="area-tile-name"]` and every `[data-testid="module-nav-item"]` on the tracker. The expected eight names are read from `AREAS` in `packages/shared/src/tracker.ts` at run time. | Both lists match `AREAS`, in id order, exactly. | All three resolutions |
| 20 | **Compliance Documents shows the three sections and the client cannot write.** | Reads `[data-testid="documents"]` and counts `[data-testid="document-section"]`; checks for `input[type='file']`; reads (never clicks) every button and link's text. | `[data-testid="documents"]` present. Exactly three sections. No file input anywhere. No button or link with text matching `upload\|delete\|remove\|edit\|replace`. | All three resolutions |
| 21 | **Jobs shows every task in the three groups with the six questions.** | Reads `[data-testid="jobs"]`, the group headings, every `[data-testid="task-table"]`'s header cells, and checks for a confirm control. | `[data-testid="jobs"]` present. Headings include `Not started`, `In progress`, `Completed`. Every task table carries the six columns, in order. `[data-testid="confirm-task"]` exists on the page. | All three resolutions |
| 22 | **The overall figure says where the client stands.** | Reads `[data-testid="overall-status"]` text. | Contains `Nothing overdue` or a phrase matching `\d+ overdue or blocked`. If a percentage appears anywhere in that block, a fraction `\d+ of \d+` appears with it. | All three resolutions |

## Static lines, run against the source rather than the browser

| # | The line | Pass criterion |
|---|---|---|
| S1 | No banned term appears in the source or the built output. | `gate/banned_terms.txt` has zero hits. |
| S2 | The client's name and the Information Officer's name appear nowhere in the source, the built output, the store schema, the seed data or the logs. | Zero hits. The names are read at run time from `material/restricted/CLIENT.md` and are never printed by the gate or written to the report. |
| S3 | The retired house colours do not appear. | No hit on lavender `#626ba5` or olive `#b0bf62`. |
| S4 | A print stylesheet exists. | `@media print` is present in the source. |
| S5 | `TASK_COLUMNS` in `packages/shared/src/tracker.ts` is exactly the six questions, in order. | The array literal reads `["What", "How", "Who", "When", "Done", "Status"]`. |
| S6 | **The eight module names in `packages/shared/src/tracker.ts` match FRAGO 02 section 3 exactly, in order.** | `AREAS`'s eight `name` values read `DPO registration`, `Data tracker review`, `Data retention`, `Policy review`, `Data protection impact assessment`, `Data subject requests`, `Vendor data risk`, `Data breach and incident management`, hardcoded in the gate for this one check because the point of it is that the source agrees with the order the order itself set. |
| S7 | **No file outside `packages/server/src/lib/documents.ts` and the Blobs store (`packages/server/src/db/store.ts`) writes an uploaded file anywhere but the store.** | No occurrence, under `apps/web/` or `packages/`, of a file-write call shape (`writeFile`, `writeFileSync`, `appendFile`, `createWriteStream`, `fs.*write*`, or an S3 client) outside the two allowed files. |

**A static check for a bare percentage in a template literal was considered and
deliberately left out**, as in v1.1: the source tree mixes CSS and Tailwind
percentages with the data percentages FRAGO 4.2 governs, and a regex over source
text cannot tell one from the other. Line 13, driven, remains the authoritative
check for this rule.

**A static check for the two-role illustrative-switch machinery was not touched
and needed no v1.2 change.**

## Notes on the standard

- Line 4 carries A3's rule directly: the saving must be visible as a record, not a
  claim. A Record with no rows fails whatever else passes.
- Line 6 and line 14 carry A7's rule that no claim reaches the client without a
  record behind it.
- Line 5 exists because the statement is the thing the Information Officer
  forwards unedited.
- **Line 13 exists because FRAGO section 4.2's stop condition is easy to lose in a
  redesign.** Unchanged from v1.1; the rule now also governs line 22's overall
  figure, which is why line 22 checks the same fraction rule directly on the
  status block rather than assuming line 13 already covers it. The two lines
  overlap by design: line 13 sweeps the whole tracker and area page for any
  bare percentage, and line 22 pins down the one sentence that carries the
  client's headline standing, so a regression in either place is still caught
  even if the other line's selector happens to miss it.
- **Line 15 exists because FRAGO section 12 (now FRAGO 02 rule 1) names it
  directly: any design that lets the client edit a task, or upload, edit or
  delete a document, is a stop condition.** It is written the other way round
  from line 20: line 15 asserts the negative across the tracker, every area
  page, Jobs and Documents; line 20 asserts the same negative on Documents
  again, in Documents' own words (`upload`, `replace`), because a document
  repository's dangerous verb is different from a task list's. Together they
  are the belt and the braces for the one rule Lurong's brief calls a stop
  condition twice.
- **A pre-existing false positive in line 15's pattern was fixed while extending
  it to Jobs and Documents.** The forbidden-word regex matched bare substrings,
  so "removed" (ordinary copy: "flags any access that should be removed") was
  read as the control verb "remove". This was found by running the updated
  gate against production: the new employee access tracker review task's How
  text contains exactly that word. The pattern is now word-bounded
  (`\bremove\b`, not `remove`), for both line 15's task pattern and line 20's
  document pattern, so a real control label still matches and ordinary prose
  no longer does.

### Why lines 18 and 20 exist, specifically

**Line 18** exists because the navigation Lurong asked for is not a preference,
it is her own method, restated as the product's structure (FRAGO 02 section 4:
"Client navigation, in this order"). A menu that shows the right six items in
the wrong order, or that lets Posture or Exposure drift back in because a
future change re-adds a nav entry without reading this file, is a quiet
regression nobody demoing the product would notice by eye, because every
individual item still "works". The line is deliberately about order and
absence together: it does not just check the six expected items are present,
it checks nothing else is there and that DOM order matches, because both are
things a future change could break without anyone intending to.

**Line 20** exists because Compliance Documents is new in v1.2 and is, by
construction, a read-only mirror of something the operator writes to in
admin. A repository is the one kind of page where "read-only" is easy to get
right on day one and easy to lose on day two, the moment somebody adds a
"request a document" button or a convenience re-upload control for the
operator's own admin view that accidentally ships on the client route too.
FRAGO 02 rule 1 states plainly that the client cannot upload, edit or delete a
document, and section 10 lists "any change that lets the client upload, edit
or delete a document" as a stop condition on its own, separate from the
task-editing stop condition line 15 already covers. Line 20 makes that
specific promise executable and keeps it executable after every future
change to the Documents page, not just the one that ships with v1.2.

## On the file-write static check (S7)

Kept, not left out, but scoped deliberately narrow. The instruction was to grep
for `writeFile`, `fs.` and `S3` usage and fail on anything that looks like a
file being written outside the store. A bare `fs.` substring was rejected
because the Blobs store's own local-dev fallback
(`packages/server/src/db/store.ts`) legitimately reads with `fs` (`readFile`,
`readdir`, `mkdir`), and a check written against the substring alone would
either need to exclude the whole file (hiding a real write added to it later)
or fail today on ordinary reads. The check instead matches call shapes that
write (`writeFile(Sync)`, `appendFile(Sync)`, `createWriteStream(`,
`fs.*write*(`, or an S3 client constructor/command), and is scoped to
`apps/web/` and `packages/` only, excluding `netlify/functions/`: the deployed
function ships as a single bundled file that inlines the store's own
`writeFile` calls alongside unrelated vendor code, and on inspection that
bundle was found to contain the literal substring "S3" inside a compressed
font table from a PDF library, coincidentally, which would have made a hit
there noise rather than signal. Scanning the two hand-written source trees the
brief named, with the store and the documents module excluded by name, is
narrow enough to be reliable and still catches the failure mode that matters:
a new file-write call appearing anywhere else in the product.

---
document: BATTLE_INSPECTION
job: CAST-0009 ASSURE
version: v1.1
status: DEPLOYED, GATE PASSED, AWAITING SUNRAY VISUAL CHECK
authority: Seagull, executed by the build session under T02 A6 and FRAGO 01
---

# ASSURE battle inspection, v1.1, the Compliance Tracker

- URL: https://tessera-assure.netlify.app (Netlify project `tessera-assure`, site id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`, unlisted, noindex, no password)
- Deployed: 2026-09-17, production deploy `6aabf6eacfee0a56643c6915`
- Source: `06_EXECUTION/build/maximus-src/`, built output copied to `06_EXECUTION/build/dist/`
- Spend: £0. No new service, no new dependency.
- Client name: absent from the page, the source, the built output, the store, the seed data, the URL and the project name. Checked by `06_EXECUTION/gate/check_restricted.py`, which reads the names at run time and never prints them.

## The gate

`06_EXECUTION/gate/g7_gate_assure_v1.py` against the production URL: **PASS, 58 of 58**.

- Static, 8 of 8: source present, no banned term, no em dash, no retired house colour, no restricted name, no key value in source, print stylesheet present, and `TASK_COLUMNS` in source is exactly What, How, Who, When, Done, Status in order.
- Driven, 50 of 50, at 1920x1080, 1366x768 and 390x844, against the deployed product.

The eleven v1.0 lines still pass unchanged. Seven lines were added for v1.1.

| # | The line | Result |
|---|---|---|
| 11 | The client's home is the Compliance Tracker and answers the six questions | Pass. Header, overall status, five phases, six measures, eight areas and the "for you" panel all present |
| 12 | Every task table shows the six questions, in order, and they are not renamed | Pass on the client's area pages and on the admin Workplan. Operator-only columns sit around the six; the six are contiguous and in order |
| 13 | No percentage is shown without its fraction beside it | Pass on the tracker and every area page |
| 14 | No illustrative figure is reachable on the client side of the tracker | Pass with the operator's switch off |
| 15 | The client can confirm a task assigned to them and can do nothing else | Pass. A confirm control exists; no edit, delete, reopen, reprioritise or status control appears anywhere on the tracker or any of the eight area pages |
| 16 | An area page prints as a clean document | Pass. Header and navigation hidden, obligation and task table visible |
| 17 | "No data yet" is a state, not a blank | Pass. Every measure tile renders text |

## Also inspected by the build session

- 167 unit and integration tests pass, including 32 on the tracker's arithmetic and the denominator rule alone.
- The local end to end smoke test passes: applying the library, re-applying being additive only, the tracker home, an area page, a client confirmation, the 403 when a client tries to confirm MITMARK's own work, the operator accepting and reopening a confirmation, closing a task booking exactly one Record entry, and the statement carrying the obligations line.
- Screenshots of the client tracker, an area page and the admin Workplan at 1440 wide.
- The demo organisation: 54 tasks applied from 2026-09-01, 15 fallen due, 6 closed, 10 waiting on the client, six measures reading from tasks, clocks and settings.

## Against A7

- **No new system for the Information Officer to maintain.** Her only action in the whole tracker is confirming a task MITMARK has assigned to a client role, and attaching a link if she wants to. She cannot create, edit, reorder, close or reprioritise anything. Line 15 of the gate checks this by looking for the absence of every such control on every page she can reach. Holds.
- **No claim without a record.** Every figure on the tracker carries its basis and its as-at date. The overall figure states its fraction beside its percentage and names its denominator rule. A measure with nothing to count says "No data yet" and still names the basis it will use. Holds.
- **No marketing to the CFO.** The statement's wording is unchanged from v1.0 and now opens with the obligations line, which is a count with a basis. Holds.
- **The human service is not thinned.** The workplan is MITMARK's work, visible to the client. The client's confirmation is a claim awaiting a MITMARK decision, not a decision. Holds.
- **The client's name.** Absent. Holds.
- **Spend.** £0. Holds.

## Defects found by driving the product, and fixed

1. **The gate itself was destructive.** Its area-tile selector was written as a comma-separated list, which CSS reads as three separate selectors rather than one scoped one, so it matched every button on the page. Driving "area tiles" by index therefore clicked the client's Confirm buttons and left nine false confirmations in the demo. The selector is now the tile's own test id, the nine were reopened through the operator's review queue, and a re-run of the fixed gate was checked to leave the demo untouched.
2. **The operator had no answer to a client confirmation.** The first cut created the review item and stopped there, so a confirmation could be seen but neither accepted nor reopened. Accepting now closes the task and books the Record entry by the same path as closing it from the workplan; reopening clears the client's claim and leaves the task where it was.
3. **A closed task showed "Invalid Date" in the Done column.** The date helper only accepted a plain date, and a closing time is a full timestamp. It now takes either, and says "No date" rather than showing the reader a broken value.
4. The review queue's type list had no label for a client confirmation, which would have failed the build.

## Known limits at this version

- The task library is Seagull's draft and is marked as such. Lurong authenticates it: the wording, the owners, and how often each task really happens at this client.
- Always-on duties count in the denominator and read as unmet until the operator closes them for the cycle, which is what FRAGO 01 section 4.2 specifies. A freshly applied workplan therefore opens low. Whether an always-on duty being maintained should read as met is a question for Sunray, and it is the smallest next decision.
- Two measures, data requests on time and concerns reported, read "No data yet" because no statutory clock has been closed on the demo this year. They will fill as clocks close.
- Procedures are unpublished for all eight areas, so each area page shows the "Procedure to be published by MITMARK" card. No target date is set; setting one is an operator action.
- Areas 2, 5 and 7 have no matching approved policy in the six-policy pack, so their "How we do it" shows the procedure card alone. That is honest, and a policy for each is MITMARK's to write.
- The Policy Guide still answers from its deterministic fallback: the key reaching this site is rejected with 401. Unchanged from v1.0 and still the first decision for Sunray.

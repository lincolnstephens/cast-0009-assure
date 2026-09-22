---
document: BATTLE_INSPECTION
job: CAST-0009 ASSURE
version: v1.2
status: DEPLOYED, GATE PASSED, AWAITING SUNRAY VISUAL CHECK
authority: Seagull, executed by the build session under T02 A6 and FRAGO 02
---

# ASSURE battle inspection, v1.2, the operator's structure

- URL: https://tessera-assure.netlify.app (site id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`, unlisted, noindex, no password)
- Deployed: 2026-09-22, production deploy `6ab25725b4a60a16e14b0e06`. The order's deadline was 2026-09-23 18:00; it was met a day early.
- Source: `06_EXECUTION/build/maximus-src/`, built output in `06_EXECUTION/build/dist/`
- Spend: £0. No new service, no new dependency. Files are in Netlify Blobs and nowhere else.
- Client name: absent from the page, the source, the built output, the store, the seed data, the URL and the project name.

## The gate

**PASS, 75 of 75**, against the production URL. Static 10 of 10, driven 65 of 65 at 1920x1080, 1366x768 and 390x844.

The seventeen v1.1 lines still pass unchanged. Five were added.

| # | The line | Result |
|---|---|---|
| 18 | The client's navigation is the operator's, in her order | Pass. Reads exactly tracker, documents, jobs, request, value, statement. Posture and exposure are absent from the client side |
| 19 | The eight modules carry their v1.2 titles | Pass. The gate reads the expected names out of the source at run time, so the two cannot drift |
| 20 | Compliance Documents shows the three sections and the client cannot write | Pass. Three sections, no file input, no upload, edit or delete control anywhere on her page |
| 21 | Jobs shows every task in the three groups with the six questions | Pass. Not started, In progress, Completed, each table carrying the six columns in order |
| 22 | The overall figure says where the client stands | Pass. "Nothing overdue" or "{k} overdue or blocked", and no percentage without its fraction |

New static checks: the eight module names in source match FRAGO 02 section 3 exactly; and nothing outside the documents library and the Blobs store writes a file.

## Also inspected

- 203 unit and integration tests pass, including the denominator from both sides and a regression test that the operator's toggle cannot move the client's figure.
- The local end to end smoke test passes, and now covers the module titles, the three document sections, the policy pack listing itself, the jobs grouping, the client being refused a document write, and the operator seeing their own count and the client's side by side.
- **The migration was checked against the real store before and after.** 54 tasks in, 54 tasks out, none lost: the transfers register review moved to module 2, the transfer safeguard to module 7, the policy refresh to module 4. Applying the new library then added 11 and skipped 53, leaving 65.
- Screenshots of Compliance Documents, Jobs and the tracker at 1440 wide.

## Against A7

- **No new system for the Information Officer to maintain.** v1.2 adds two pages she can only read. She still has exactly one write in the whole product: confirming a task MITMARK assigned to a client role. Gate line 15 now scans the tracker, all eight module pages, Jobs and Documents for the absence of any edit, delete, reopen, reprioritise or status control. Holds.
- **No claim without a record.** Every figure still carries its basis and its as-at date. The overall figure states its fraction beside its percentage and names its denominator rule. Holds.
- **No marketing to the CFO.** The statement is unchanged and still opens with the obligations line. Holds.
- **The human service is not thinned.** The repository is what MITMARK has published; the empty sections say what MITMARK will publish and when, rather than showing the client a generic document dressed up as theirs. Holds.
- **Spend.** £0. Holds.

## Defects found by driving the product, and fixed

1. **The operator's toggle would have changed the client's figure.** `overallStatus` defaulted to the organisation's setting, so flipping the admin switch to the stricter count would silently have moved the number on the client's front page and on the CFO statement, which section 6 forbids. The default is now the literal overdue count; a caller wanting the operator's view asks for it by name, and a regression test holds the line. Found by a build lane reading the spine against the order rather than against the code.
2. **A raw user id was shown to the client** beside every policy version. The approver is stored as an id, and the repository printed it. Policies now name MITMARK as the owner and show the approval date, which is the fact that matters.
3. **The six questions were on the wrong element.** The task table and its phone-width card stack shared one test id, so at phone width a reader found a "table" with no headers. The table now carries the id and the cards carry their own.
4. **The gate read prose as though it were a control.** Its forbidden-control scan matched the word "removed" inside a task's own description, because a clickable row's text is the whole row. It now only considers text short enough to be a control label. A check that cries wolf on ordinary copy would have hidden a real breach in the noise.
5. A person's name had crept into five source comments. Source names roles; documents name people.

## Known limits at this version

- **The file cap is 4 MB, not the 10 MB the order specifies.** A Netlify function buffers its request body at 6 MB and a file travels as base64, which inflates it by a third. Measured against the deployed site: a 6 MB body is refused with 413, 4 MB passes. The cap is the largest that reliably arrives, the operator's page says so, and anything larger goes in as a link, which the order already provides for. Recorded against FRAGO 02 section 4.2.
- Procedures are unpublished for all eight modules, so the client sees the "to be published" card with the target date of 15 October 2026.
- None of the six registers has been filed, so each appears under Trackers as "Not yet filed". That is the honest state and it names the register set she should expect.
- The task library is still Seagull's draft, now 36 ids, awaiting the operator's authentication.
- One client confirmation has been waiting since 18 September. The product is behaving correctly; it needs the operator to answer it.
- The Policy Guide still answers from its deterministic fallback: the key reaching this site is rejected with 401. Unchanged since v1.0.

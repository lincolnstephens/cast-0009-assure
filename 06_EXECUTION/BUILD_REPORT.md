---
document: BUILD_REPORT
job: CAST-0009 ASSURE
version: v1.6
status: v1.6 BUILD COMPLETE, DEPLOYED, GATE PASSED
authority: Seagull, executed by the build session under T02 A6
---

# Tessera Assure v1.0, build report

**Live:** https://tessera-assure.netlify.app
**Production deploy:** `6aabe0ac5884128cb5314a12`, 2026-09-17
**Gate:** PASS, 36 of 36, against the production URL
**Spend:** £0

Sign in as the Information Officer with `demo@demo.local`, or as the operator with `operator@demo.local`. Both use the demo password currently set on the site.

## 1. What shipped

The MAXIMUS shell carrying the ASSURE value layer, as a single product.

**Kept from MAXIMUS, ported and working**
- The two-sided structure: a light client portal and a dark admin workspace, separated by sign-in and by role. The Information Officer's account cannot reach the operator's side at all.
- Statutory clocks. Her two intakes, a data request and a report of a concern, raise a clock (one month, or 72 hours) and an item in the review queue. The operator works them in admin.
- The policy pack, with draft and approved immutable versions, and the defence-file export with its officer approval step before generation.
- The Policy Guide, answering from approved policies only, with its three example prompts and its escalation path.
- The review queue and the audit log.
- Posture across five domains with the twelve-week trend, and exposure alerts, both still marked as demo data on screen.

**Kept from ASSURE v0.1, lifted into the shell**
- The Record: date, service line, what MITMARK did, outcome, statutory clock, the officer's hours replaced, the cost equivalent at her rate, the contractor equivalent at the day rate, the named reviewer, the illustrative flag.
- The CFO statement, printable and plain, with both comparators, the retainer ratio only when the fee is entered, and the limitations paragraph. **The wording is carried over verbatim.**
- The twelve service lines, ranked live first, then statutory clock, then hours per instance, with status set by the operator.
- Operator settings: rates, retainer fee, client display name, officer name or role, contract lead, line statuses, and the demo switch.
- The "Where spend would help" list.

**Wired together**
- The client portal's **Value** section is the Record, read only, and the Statement, with view, print and save as PDF. It replaces the prior build's undeveloped value snapshot, which is deleted.
- Admin gains **Record** (add, edit, delete, mark illustrative, mark reviewed, import a v0.1 export) and **Settings**.
- A closed statutory clock, an approved policy version, an answered Guide question released from the review queue, and a completed defence-file export each create a Record entry, with a default hours figure for its service line, editable, and reviewed by the admin who closed it.
- The Statement uses reviewed, non-illustrative entries only. Illustrative entries reach the client only when the operator has switched them on for a demo, and then the banner says so.
- Multi-tenant by organisation from the start. A second retained client is a second organisation document, not a second build.

## 2. The two decisions of consequence

**The store.** The prior build ran on Neon Postgres through Drizzle. Neon is not a prohibited connector, but a new database for this product needs a `DATABASE_URL` this session does not hold, and reusing the prior build's would have pointed Tessera Assure at the other product's live tenant data, which A7 forbids. The store is now a JSON document per organisation on **Netlify Blobs**, which the order names as acceptable, is on the existing plan, and needs no credential. Drizzle, `@neondatabase/serverless`, `pg` and `ws` are removed. Logged as DC-09.

**The function.** Netlify Blobs only reads with strong consistency inside a v2 function, and a v2 function loses this repository's workspace packages to the platform's file-tracing bundler. The server is therefore bundled into one file before deploy (`scripts/bundle-function.mjs`) and the v2 function imports that. Without this the operator and the client portal could hold different answers indefinitely. Logged as DC-12.

## 3. What the gate caught that reading the code did not

The gate drives the deployed product, and the product was then exercised by hand. Seven defects only appeared that way.

1. **Illustrative entries kept reaching the client after the operator switched them off.** The v1 function could not read the store strongly, so the two sides disagreed and never converged. This was the A7 breach in the build and the reason for the v2 change.
2. **A stale read could wipe an organisation.** The seeder treated one empty read as proof the organisation did not exist and wrote a fresh empty document over it. It now requires two agreeing reads, and a seed marker stops any re-seed over the operator's work.
3. **Concurrent sign-ins could lose each other.** Sessions lived as rows inside one shared document, read and rewritten on every sign-in. They are now one blob each.
4. **A signed-out first page load logged a console error.** The bootstrap probe now answers 200 with a null user.
5. **A stub Users page shipped as an empty screen.** Removed rather than left in.
6. **The first item to reach the review queue took the whole admin workspace down.** The queue renders detail about the thing being reviewed, and the ported API had stopped sending it, so the operator's side white-screened the moment the Information Officer raised a request. The API sends it again, and the queue now degrades to a thinner card rather than a blank page if it is ever missing.
7. **The Policy Guide told the officer it was busy, forever.** It called the Anthropic API with a model id that no longer exists and an assistant prefill that current models reject, and every failure was reported as "busy, try again in a few seconds". The model id is now `claude-opus-5`, the prefill is gone, and a permanent failure (a bad key, a bad request) falls back to the deterministic matcher instead of promising an answer that would never arrive. A genuine rate limit still says busy.

## 4. What was deferred, and why

- **The Anthropic API key reaching this site does not work.** No key is set on the site itself; a team-level `ANTHROPIC_API_KEY` is injected into every project on the Netlify team, and the Anthropic API rejects it with `401 invalid x-api-key`. The Policy Guide therefore answers from its deterministic keyword matching. It still answers from approved policies only, still cites them, and still escalates, so the behaviour is right and the answers are weaker. This is the smallest next decision, below.
- **Real content.** All fifteen Record entries are illustrative and say so. The record is real in structure and illustrative in content until Lurong enters real items, exactly as A9 anticipated. `00_INTENT/ASSURE_LIVE_REQUIREMENTS.md` lists what is needed; Block 1 alone makes it real and is a morning's work.
- **Rates and fee.** Defaults of £45 an hour and £650 a day stand, and the Statement says they are assumptions. The retainer fee is not entered, so no ratio is shown and the Statement says why.
- **Policy section editing.** The prior build stored policy sections as their own rows; the store holds one markdown body per version, with sections parsed out of it for display and citation. Editing a draft now means editing its body rather than a section at a time. The client-facing shape is unchanged.
- **Demo passwords.** Both accounts use a demo password. Change them before anything is shown outside MITMARK.
- **A second organisation** is supported by the data model but none is created. Adding one is configuration, not development.

## 5. Environment variables this build needs, by name

Values are not printed anywhere in this pack.

| Name | Set on the site | What it does |
|---|---|---|
| `SESSION_SECRET` | Yes | Signs the session cookie. Set fresh for this site. **Worth rotating in the Netlify UI**, because its value passed through the build session's transcript. |
| `SEED_CLIENT_PASSWORD` | Yes | The Information Officer demo account's password. |
| `SEED_OFFICER_PASSWORD` | Yes | The operator demo account's password. |
| `ANTHROPIC_API_KEY` | **Not on this site.** A team-level value is injected and is **rejected by the Anthropic API with 401**. | The Policy Guide. Unusable or absent, it falls back to keyword matching. |

`DATABASE_URL` is no longer read by anything and must not be set on this site.

## 6. Where the work is

| Path | What |
|---|---|
| `06_EXECUTION/build/maximus-src/` | The build. pnpm workspace: `apps/web`, `packages/shared`, `packages/server`, `netlify/functions`. |
| `06_EXECUTION/build/dist/` | The built output that was deployed. |
| `06_EXECUTION/build/site/` | v0.1, kept as the reference for the Statement's wording. |
| `06_EXECUTION/gate/g7_gate_assure_v1.py` | The gate. Run it against any URL. |
| `06_EXECUTION/gate/check_restricted.py` | The restricted-name check. Run before every commit and every deploy. |
| `06_EXECUTION/T14_DEFINITION_OF_DONE_V1.md` | The ten numbered lines and the four static checks. |
| `06_EXECUTION/T17_BATTLE_INSPECTION.md` | What was checked, and the result. |
| `07_HANDOVER/T18_OPERATOR_BRIEF.md` | For Lurong: rates, import, review, printing the statement. |

Commit as `Seagull <seagull@cast.local>` on `master` in this job folder. `material/restricted/` is excluded from git, so the client's name has never entered the history.

## 7. How to run it again

```
cd 06_EXECUTION/build/maximus-src
pnpm install
pnpm test                     # 102 tests
npx tsx scripts/smoke-api.mjs # end to end against a temporary local store
pnpm build                    # web build, then bundles the function
npx netlify deploy --prod --filter @maximus/web --dir=apps/web/dist --functions=netlify/functions
python ../../gate/g7_gate_assure_v1.py https://tessera-assure.netlify.app
```

The `--filter` is needed because the Netlify CLI otherwise stops to ask which workspace package it is building.

## 8. The smallest next decision for Sunray

**Set a working `ANTHROPIC_API_KEY` on `tessera-assure`, or say the Guide ships on keyword matching for this beta.**

The team-level key that reaches this site is rejected by the Anthropic API with `401 invalid x-api-key`, so it is not a matter of copying it across: a valid key has to be put on the project, which overrides the team value. It is one value, set once in the Netlify UI, and it is the difference between the Policy Guide answering the Information Officer's questions well and answering them adequately. Nothing else in the product is waiting on a decision.

The deterministic fallback is not a placeholder: on the three example questions it answers the letting-agent question green with a citation from the approved Data Protection Policy, escalates the CCTV retention question to the officer as amber, and opens the statutory process for the former-employee request as red. The model would answer the amber one rather than escalate it.

After that, in order: change the two demo passwords; and put Block 1 of `ASSURE_LIVE_REQUIREMENTS.md` in front of the contract lead, because the record is only illustrative until he fills it.

---

# v1.1, the Compliance Tracker

**Live:** https://tessera-assure.netlify.app
**Production deploy:** `6aabf6eacfee0a56643c6915`, 2026-09-17
**Gate:** PASS, 58 of 58, against the production URL
**Spend:** £0
**Built under:** `06_EXECUTION/FRAGO_01_TRACKER.md`

## What v1.1 adds

The client's front page is now the **Compliance Tracker**, which answers six questions about every task: what do I need to do, how, who, by when, is it done, and if not what is the status. Those six are the columns of every task table, on both sides of the product, and they are not renamed anywhere.

Top to bottom, her page carries the header (display name, jurisdiction, regulation, and when MITMARK last touched the workplan); the overall status as a fraction with its percentage and its basis; the five-phase journey strip with the current phase marked; six measures, each with its basis or a stated "No data yet"; the eight areas as tiles with RAG, owner, next due date and progress; and a "for you" panel of the tasks assigned to a client role.

Beneath it sit **eight area pages**, each with the obligation in plain English, the citation at the foot, the area's status and basis, the task table, "How we do it" (the approved policy and the procedure, or a card saying MITMARK has yet to publish one), a link to the Policy Guide, and the history with reviewers.

The operator gains **Workplan** (every field of every task, filters, the add and edit form, and apply-library) and **Procedures** (one card per area). Settings gains jurisdiction, staff in scope, staff trained, the client role list and the workplan target date.

## The rule the whole version turns on

The workplan is MITMARK's workplan for the client. The operator owns it.

A task assigned to a client role shows her a **Confirm** button and nothing else. Confirming is not a status change: it creates an item in the operator's review queue, and the operator accepts it (which closes the task and books the Record entry) or reopens it (which clears the claim). She cannot create, edit, reorder, close or reprioritise anything, anywhere.

This is what keeps A7 intact while still giving Rich the tracker he asked for. Permissions were built that way first and the interface followed. The gate checks it as a stop condition: line 15 looks for the **absence** of every edit, delete, reopen, reprioritise and status control on the tracker and all eight area pages.

## The denominator, and why it is stated the way it is

The overall figure reads, for example, "6 of 15 obligations met, 40%, as at 17 September 2026".

The denominator is every task due on or before today, plus every always-on duty, which is due continuously. Tasks marked not applicable drop out entirely. A task due next month is not counted, because it is not yet an obligation anyone has failed to meet.

**The fraction always travels with the percentage.** A bare percentage hides whether it rests on two obligations or two hundred, and a figure like that is exactly the claim A7 refuses. The rule is in the arithmetic, tested from every side, and checked on the rendered page by the gate.

One consequence worth Sunray's eye: an always-on duty reads as unmet until the operator closes it for the cycle, so a freshly applied workplan opens low. That is what the order specifies. Whether "being kept up" should count as met is the smallest next decision below.

## The task library

28 obligations across the eight areas, drawn from UK GDPR and the Data Protection Act 2018, expanded into 54 dated instances for the twelve months from 2026-09-01. Monthly becomes twelve, quarterly four, always-on stays one undated duty.

**Re-applying is additive only.** Identity is the library task plus its due date, so a re-apply adds what is missing and never touches an edit. Tested both ways.

It is **Seagull's draft and marked DRAFT**. Lurong authenticates the wording, the owners and the cadence.

## What the gate caught that reading the code did not

1. **The gate itself was confirming tasks.** Its area-tile selector was a comma-separated list, which CSS reads as three selectors, not one scoped selector, so it matched every button on the page and clicked the client's Confirm buttons while walking "tiles" by index. Nine false confirmations were left in the demo. The selector is now the tile's own test id, the nine were reopened through the operator's review queue, and a re-run was checked to leave the demo untouched. A test harness that mutates the product it is testing is worse than no harness, and this one did.
2. **The operator had no answer to a client confirmation.** The item was created and nothing could be done with it. Accept and reopen are now wired, and accepting books the Record entry by the same path as closing the task.
3. **A closed task showed "Invalid Date".** The date helper took a plain date; a closing time is a timestamp.

## What was deferred, and why

- **Procedures are unpublished** for all eight areas, so every area page shows the "to be published" card. Publishing them is MITMARK's content work, not a build step.
- **Areas 2, 5 and 7 have no matching approved policy** in the six-policy pack, so their "How we do it" shows the procedure card alone rather than pointing at a policy that does not exist.
- **Two measures read "No data yet"** because no statutory clock has closed on the demo this year. They fill as clocks close.
- **Jurisdiction** accepts five values; only the United Kingdom has a library and obligation text. The others are named so the field is honest about what it does not yet cover.
- **The Anthropic key** is still rejected with 401, so the Policy Guide answers from its deterministic fallback. Unchanged from v1.0.

## The demo organisation

54 tasks applied from 2026-09-01. Six always-on duties MITMARK genuinely maintains are closed, and the six Record entries those closures created are **marked illustrative**, as the fifteen seeded entries already are. A demo showing nothing done would misrepresent a working service as badly as one showing work that never happened; marking the generated entries keeps every fabricated figure flagged.

Ten tasks wait on the client, so the "for you" panel and the confirm path can both be driven.

## The smallest next decision for Sunray

**Should an always-on duty that is being kept up read as met, or only when the operator closes it for the cycle?**

As specified in FRAGO 01 section 4.2 it is the latter, which is what is built. The effect is that a client who is entirely up to date still opens on a low figure until the operator has been round the always-on duties and closed each one for the period. If Rich wants the front page to reflect "nothing is overdue" rather than "nothing has been signed off this cycle", that is a one-line change to the denominator and a different sentence beneath it. It is his call, not the build's.

After that, in order: Lurong authenticates the task library; MITMARK publishes the first procedures; and the Anthropic key is replaced.

---

# v1.2, the operator's structure

**Live:** https://tessera-assure.netlify.app
**Production deploy:** `6ab25725b4a60a16e14b0e06`, 2026-09-22
**Gate:** PASS, 75 of 75, against the production URL
**Spend:** £0
**Built under:** `06_EXECUTION/FRAGO_02_LURONG.md`. Deadline was 23 Sep 18:00; met a day early.

## What v1.2 adds

The operator returned written feedback and Sunray adopted it. Her three benefits were the test for every change: **compliance overview, document repository, consolidated actions**, with the CFO statement quantifying the service.

**The client portal is now her navigation, in her order:** Compliance Tracker, Compliance Documents, Jobs, Requests and clocks, Value, Statement for the CFO. Posture folded into the tracker's "Areas by status" panel, which was already there. Exposure moved to admin. The Policy Guide is no longer a menu item; it sits at the foot of Jobs, so questions and tasks are in one place, which is how she said she works.

**Compliance Documents** is the repository, in three sections. Policies fills itself from the approved pack, current version with its history, and nobody uploads it. Procedures comes from the operator's Procedures page. Trackers holds the six registers. The client reads and downloads; she cannot upload, edit or delete, and there is no control on her side suggesting otherwise.

**Jobs** is every task across all eight modules in one list, grouped in her words: Not started, In progress, Completed. A blocked task sits in In progress carrying a flag, because "blocked" is the word that gets it unblocked. Tasks marked not applicable are not listed but are counted, so nothing disappears silently.

**Two modules were re-scoped** and nothing was lost. Module 2 is now Data tracker review: the record of processing plus the employee access and international transfers registers. Module 4 is now Policy review: the pack reviewed one policy at a time, plus the privacy notice. The old cross-border work moved into modules 2 and 7 where it belongs, carried by its library id.

## The overall figure changed, and this was the point

It now reads "Nothing overdue" or "{k} overdue or blocked" beneath the fraction.

An always-on duty has no date and can never be overdue. Under v1.1 it counted as unmet until the operator signed it off for the period, so a client who was entirely up to date opened on a low number. That was the smallest next decision flagged at v1.1; Sunray took it. A continuous duty now counts only when something live is running against it: an open clock, or something waiting in the review queue.

The stricter "signed off this cycle" count remains, as a toggle in admin. **It is the operator's view and cannot reach the client**, and that is enforced rather than intended: the default is the literal overdue count, so a caller that forgets to specify gets the safe answer.

## What the build caught that the order could not have

1. **The toggle would have leaked.** The first wiring defaulted to the organisation's setting, so flipping the admin switch would have moved the client's front page and the CFO statement. Section 6 forbids exactly that. A build lane read the spine against the order rather than against the code, and found it.
2. **The client was shown a raw user id** beside every policy version, because the approver is stored as an id.
3. **The six questions sat on the wrong element**, so at phone width a reader found a table with no headers.
4. **The gate read prose as a control**, matching "removed" inside a task's own description. A check that cries wolf hides a real breach in the noise; it now only considers text short enough to be a label.

## The file cap: a deviation from the order, stated plainly

The order specifies a 10 MB cap per file. **It cannot be met, and the build does not pretend otherwise.**

A Netlify function buffers its request body at 6 MB, and a file travels as base64, which inflates it by a third. Measured against the deployed site: a 6 MB body is refused with 413; 4 MB passes. The cap is therefore 4 MB, the shared constant says 4 MB rather than an unreachable 10, the operator's page states the real limit, and an oversized file is refused before it is encoded rather than failing halfway through an upload.

The order already provides the answer for anything larger: it goes in as a link. That is usually better anyway, because a copied register goes stale the day it is uploaded.

## What was deferred, and why

- **Procedures are unpublished** for all eight modules; the client sees the "to be published" card with a target date of 15 October. Publishing them is MITMARK's content work.
- **None of the six registers has been filed**, so each shows as "Not yet filed". That names the register set she should expect and is the truth.
- **The module sub-navigation** sits on the tracker, not on each module page, because the module page component was owned by another lane this iteration. One click from the tracker rather than from anywhere.
- **The Anthropic key** is still rejected with 401. Unchanged since v1.0 and still outstanding.

## The demo organisation

The migration ran against the real store and was checked either side: 54 tasks in, 54 out, none lost, three moved to their new modules. Applying the new library added 11 and skipped 53, leaving 65 tasks across the eight renamed modules. The front page reads "3 of 8 obligations met, 38%" with "5 overdue or blocked" beneath.

The genuine client confirmation raised on 18 September is still there, waiting for the operator.

## The smallest next decision for Sunray

**Nothing in the product is waiting on a decision. The oldest open item is human: a client confirmation has been unanswered since 18 September.**

The whole design rests on MITMARK answering promptly. If a confirmation sitting for five days becomes the pattern rather than the exception, the client sees a system that asks her for things and then ignores her, which is worse than not asking. Before Wednesday's boardroom, that one should be cleared.

After that, in order: the operator authenticates the task library, now 36 tasks; MITMARK publishes the first procedure and files the first register, so the repository stops being all promises; and the Anthropic key is replaced.

---

# v1.3, the operator's dashboard

**Live:** https://tessera-assure.netlify.app
**Production deploy:** `6aba2719e5118b5c586c6971`, 2026-09-28
**Gate:** PASS, 97 of 97, against the production URL
**Spend:** no new money committed. Build-session time, local compute, and four deploys on the existing Netlify plan.
**Built under:** `06_EXECUTION/FRAGO_03_LURONG_DASHBOARD.md`. Deadline was 28 Sep 18:00 BST; live before 10:00.

## What v1.3 adds

The operator sent a second round of feedback, an email and a five-slide deck, and Sunray adopted it in full (DC-32). It simplifies what the client sees. Her three benefits are still the test: compliance overview, document repository, consolidated actions.

**The client menu has six items, in her order:** Compliance Tracker, Compliance Documents, Job management, Requests and clocks, Statement for the CFO, Quick questions. Value has left the menu. `/value` still works and the Statement links to it at its foot as "The record behind this statement", so every figure on the statement stays traceable to its record.

**The Compliance Tracker has three sections.**

- **Journey:** the current stage in words, one sentence, and the five phases drawn as a path. Done phases are green, the current one is amber and says "Current", and future phases are grey.
- **Overall compliance status:** "Compliance score: 38% (3 of 8 obligations met)", then the date, the basis, the overdue line and one fixed sentence, then the eight modules as tiles filled with their RAG colour. Each tile opens its module.
- **Upcoming:** the next eight dated open MITMARK tasks.

The six measures, the areas panel, the module strip and "For you" have left the front page.

**Module pages** open with an introduction, the relevant documents and trackers, and "Compliance status: {done} of {total} done, {pct}%". The task table follows, then links to every module, which closes the v1.2 deferral. The obligation, how we do it, and the history stay below.

**Job management** is a three-column board, Not started, In progress and Completed, with Waiting on you above it. The client's confirm is unchanged and is still her only write anywhere.

**Value** is on the operator's side, as an admin menu item that opens the Record with the way to the rates. **Quick questions** is the Guide under her name for it, and says plainly what it does.

**Three modules have her names:** Data tracker compliance, Data retention practice, and Data breach and incident response.

## Three calls the order left to the build

1. **Upcoming shows today onwards.** "Planned to roll out" cannot describe a task that is already late. Overdue work is in the overdue count and on Job management (DC-34).
2. **The module page keeps its record.** The order says what goes at the top and does not say remove the rest. The citation and the history are the record behind the module, so they stay below the module links (DC-35).
3. **The journey stage is the operator's to set.** Her deck says Implementation. The product shows the derived stage until she sets it, because setting it for her would put a claim on the client's page that nobody at MITMARK has made in the product (DC-38).

## What the gate caught that reading the code did not

The journey node, the tiles and the document list ran their words together with no space in the markup. A sighted reader never sees it. A screen reader, or anything that reads the page's text, got "Assessment and discoveryCurrent". The gate reads text content, not pixels, and failed on it.

## What was deferred, and why

- **Filling Compliance Documents.** The operator's files were not in the folder, so nothing was uploaded or invented (DC-39).
- **Tile contrast.** White on the house green and amber falls below WCAG AA contrast. A darker fill for tiles is a design decision, not a build one (DC-37).

## The demo organisation

There were 65 tasks before the deploy and 65 after, by module 7, 11, 9, 8, 3, 6, 4, 17 both times. The rename moved nothing, because tasks carry the module id. The front page reads "Compliance score: 38% (3 of 8 obligations met)" with "5 overdue or blocked".

## The smallest next decision for Sunray

**Whether module tiles take a darker fill.** Everything else open is the operator's to do in the product: set the journey stage, write the introductions if she wants her own, and file the documents she has already shared. Each is a Settings or Documents action on her side, and the page is truthful until she does them.

---

# v1.4, tile contrast and view as client

**Live:** https://tessera-assure.netlify.app
**Production deploy:** `6aba7af60408911991163ecf`, 2026-09-28 15:34 BST
**Gate:** PASS, 118 of 118, against the production URL
**Spend:** no new money committed. Build-session time, local compute, and two deploys on the existing Netlify plan.
**Built under:** `06_EXECUTION/FRAGO_04_CLIENT_VIEW.md`. **Deadline 15:00 BST; missed by 34 minutes.** The session started at 15:09 (DC-43).

## What v1.4 adds

**Every module tile is readable.** The fills are still the house status ramp. The text on each fill is whichever colour measures 4.5:1 or better against it: dark on green (9.08) and amber (7.24), white on red (4.64) and grey (4.83). There is no shadow. The gate measures the rendered tiles at all three widths.

**The operator sees what the client sees.** "View as client" at the foot of the admin menu opens the client portal for the selected account: her six menu items and every page beneath them, under a bar reading "Viewing as the client's Information Officer. Read only. Return to admin." Her controls are visible but disabled. The server refuses every write from that view, and one audit entry records that the operator looked.

## One deviation, stated plainly

The order says grey tiles take dark text. Dark text on the house grey measures 3.04:1, which fails the 4.5:1 the same order sets. The order also says the rule is applied by measurement, so grey takes white, at 4.83:1 (DC-44). A grey tile means a module with nothing open; there is none in the demo today.

## The design that makes a leak impossible rather than unlikely

The obvious build was an admin endpoint returning the client's data with the admin fields removed. That approach fails the day someone adds a field and forgets to remove it.

Instead, one guard sits on every client router. An operator carrying the marker is served **as the organisation's own client-seat user**, through the client's own handler, for reads only. There is no second code path, so there is nothing to keep in step (DC-45). The gate confirms it on the live site: 16 reads were compared byte for byte, with no field excused.

## What building it caught

- **The Guide wrote on every read.** Opening Quick questions rewrote the whole organisation document, even when nothing had changed. In client view that would have been a write made by a preview. It is now a pure read, and client view never creates the client's thread (DC-46).
- **Document links would have failed in client view.** A plain download link cannot carry a header, so the links carry the same read-only marker as a query parameter.

## What was deferred, and why

- **The organisation switcher.** Excluded by the order. The preview already names its organisation explicitly, so a second client needs a second account and nothing else.

## The smallest next decision for Sunray

**None in the product.** Before the operator is sent the link, MITMARK should do two things this order left out:
1. **Change the demo passwords and rotate `SESSION_SECRET`.** Anyone holding "demo" can now also open client view as the operator.
2. **Answer the client confirmation raised on 18 September.**


---

# v1.5, named accounts and organisations

**Live:** https://tessera-assure.netlify.app
**Production deploy:** `6aba92e001af288f634c999e`, 2026-09-28 17:16 BST (after `6aba899937e9ebb4ceeb7398` at 16:38; see below)
**Gate:** PASS, 154 of 154, against the production URL
**Spend:** no new money committed. Build-session time, local compute, and five deploys on the existing Netlify plan. No new dependency, and no environment variable changed.
**Built under:** `06_EXECUTION/FRAGO_05_ACCOUNTS.md`, issued 15:55 with four hours to go live, and amended during the run; live at 16:38, final at 17:16.

## What v1.5 adds

**People.** A manager can create users, reset their passwords, and disable or re-enable them from **Users**:
- A new or reset password is 20 random characters, shown once to the manager and held only as a hash. The product sends no email, and the screen says so.
- Whoever holds a one-time password can reach nothing but "Set your password" until they have chosen their own, of at least 12 characters. The server enforces this, so it is not just a screen.
- Changing a password, resetting it, or disabling the account ends every other session for that user.
- The last active manager cannot be disabled.
- Every action is audited by user id, never by email.

**Organisations.** **Organisations** lists and creates them, and applying the task library is a separate step that states its count first. A switcher in the admin header chooses the organisation every admin page and View as client act on. Admin requests carry the choice, and a request that names no organisation is refused rather than quietly served the demo.

**The seed.** `seed-organisation` gives one organisation its starting content from Seagull's manifest:
- It sets the organisation's settings, its tasks and their dated clocks, then files its documents one by one.
- It runs as a signed-in manager through the product's own routes.
- It reports counts either side, offers a dry run, and refuses a second run without `--replace`.

**The order changed while it was being built.** The manifest and the nine files were placed at 15:56, moments after the build had found the folder empty. FRAGO 05 was amended to say the command reads that manifest's shape, and T18 documents the format from the file. The first production deploy (16:38) had a format of its own, so the seed was reworked, re-tested and redeployed at 17:16.

Run against the real manifest and files as a dry run, the command reports 27 tasks and 9 of 9 documents: 26 tasks, plus one because the registration-renewal clock falls on a task already done. The format is in T18 section 5j.

## Two things found that were not in the order

1. **Session ids in the audit.** Since v1.0, every sign-in and sign-out wrote `session=<id>` to the organisation's audit log. A session id opens the account it belongs to. Both now write a one-way reference. Old entries stay, because the register is append-only; rotating `SESSION_SECRET`, already planned, makes them worthless (DC-51).
2. **The silent demo default.** Admin routes served the demo organisation when a request named none. With one organisation that was harmless. With two, a page that forgot its parameter would have shown or changed the demo while the switcher said "client". They now answer 400 (DC-52).

## One step of the order's section 7 will not work as written

Changing `SEED_CLIENT_PASSWORD` and `SEED_OFFICER_PASSWORD` in Netlify will not change the demo accounts' passwords. Those variables are read only by the very first seed of an empty store, and a marker stops that seed ever running again, which is what protects the operator's work from being overwritten. The new Users page is the way to change or retire the demo accounts. Rotating `SESSION_SECRET` still works and still matters (DC-54).

## What was not possible, and why

- **Seeding the client's organisation.** That is section 7 step 2, after the operator is in. The client organisation does not exist yet, and creating it is a manager's action.
- **Creating the operator's account.** The restricted file holds no email addresses. The account is created in Users by whoever holds her address, and the build never needed it.

## The smallest next decision for Sunray

**Who creates the operator's manager account, and when.** It takes one minute in Users. Everything else in section 7 follows from that.


---

# v1.6, the module pages as the operator drew them

**Live:** https://assure.tessera-monitor.com (the site's production address; https://tessera-assure.netlify.app serves the same deploy)
**Production deploy:** `6abd0be1fabe2fb17880b662`, 2026-09-30
**Gate:** PASS, 172 of 172, against the production URL, on the second run. The first run found a fault in the gate itself; see below.
**Spend:** no new money committed. Build-session time, local compute, and three deploys on the existing Netlify plan (two drafts, one production). No new dependency. No environment variable or secret changed.
**Built under:** `06_EXECUTION/FRAGO_06_MODULE_PAGES.md`, issued 10:10 (DC-61). This session was tasked at 13:50, which was already past the order's four hours. It was live at 14:17.

## What v1.6 adds

**Every module page follows the operator's deck.** The seven sections are:
1. The name and its one line.
2. **Useful links**, as tiles with a numbered list beneath.
3. **Compliance status**, under the 3.6 score rule.
4. **Compliance journey**, drawn from the module's dated tasks. There are at most six milestones and never one that is not a task.
5. **Counts**, on modules 5 to 8.
6. **Jobs**, in the six-question table.
7. What the law asks, how we do it, and history.

**Tiles open something, every one.**
- A filed file downloads, and a link redirects.
- A policy opens the policy panel.
- A register nobody has filed opens a "Not yet filed" card.
- A retention category opens a card with its period.

**The score (FRAGO 06 3.6)** is dated obligations met on time over dated obligations due, over the twelve months to today.
- A late completion counts 70 per cent within 30 days and 50 per cent beyond.
- Green is 90 and above, amber 60 to 89, red below 60.
- The front page shows the mean of the module scores with "k of 8 modules green". The eight tiles take the score and its colour, and the overdue count stays beneath.
- `lib/modulePage.ts` holds the rule. `modulePages.test.ts` tests it case by case.

**The Figures form** (admin, **Figures**) lets the operator report counts for DPIAs, project risk assessments, vendors and incidents.
- Each save is kept with who made it and when.
- The client sees "Reported by MITMARK on {date}", never who entered it. An empty count reads "No data yet".
- Data requests and reported concerns are counted from the product's own clocks: "From the request log, as at {date}".

**The retention schedule** is set in Settings and shown as seven tiles on module 3.

**The register list is the operator's.** The old titles are kept as aliases, so filed registers keep their place. The vendor log also shows on module 2.

**The Statement has three parts:** the service, what MITMARK has done (now also item by item, with hours and the cost of her time), and what comes next (the dated open tasks). The "n of m obligations met" opener is gone.

**The seed** reads manifest v2.1's `links` and `organisation.settings.retentionSchedule`. A new `--additions` mode applies only those to an organisation already seeded. It leaves tasks, documents and every other setting alone, and a second run adds nothing.

## Applied to the client organisation

On org-f2b4afdf0d, as the demo manager seat (the seat Seagull used for DC-59):
1. Dry run: "Would file 2 link(s) (0 already filed) and would set a retention schedule of 7 row(s)."
2. Real run: tasks 19 before and after; documents 9 before, 11 after.
3. A snapshot taken either side through the admin API showed the 19 tasks byte-identical (same digest) and the nine filed documents identical. The only change is the two ICO links.

The module pages were then rendered in View as client:
- **Module 1:** the two ICO links; milestones "done, next".
- **Module 2:** the five registers, two filed as templates and three not yet filed.
- **Module 3:** the seven retention periods and the draft Data Retention Policy.
- **Module 4:** the four policies, version 1 approved and three drafts.
- **Modules 5 to 8:** their counters, "No data yet" until the operator reports.
- **Statement:** in three parts with 12 items coming next.
- No console errors.

The front page reads "Compliance score: 100% (3 of 8 modules green)", with nothing overdue. Five modules have nothing dated that has fallen due yet.

## What the gate caught

The first production run failed line 6 at all three resolutions. The fault was in the gate, and it had touched live data.
- The admin switcher defaults to the first organisation by name, which since 29 September is the client's.
- The gate's Settings toggles (lines 6 and 14) therefore switched "show illustrative" off and back on for the client organisation, leaving it **on**.
- The client organisation has no Record entries, so nothing reached it.
- The gate now pins the switcher to the demo at every operator sign-in, and refuses to go on if it cannot. The second run passed 172 of 172 and made no change to the client organisation.
- Putting the client organisation's switch back off was refused to this session by its permission layer, so it waits on Sunray or the operator (DC-63, T17 v1.6).

## Calls the order left to the build (DC-62)

1. **Seed-closed tasks count as met on their date.** The seed closes a "Completed" row at the moment it runs, so without this reading the 2026 ICO renewal and the policy drafting would score as late (50 per cent). A task closed in the Workplan is dated the day it is closed.
2. **Module 4 shows all four policies**, whichever module each was filed against.
3. **Module 8 shows its two counts side by side**, the concerns logged in the product and the incidents the operator reports, rather than adding numbers with different bases.
4. **Operator figures live outside settings.** `/value/record` returns settings to the client, and the figures carry the operator's id.

## Deviations

- **Module descriptions are unchanged.** The order says the slide text becomes the default, but the deck is not in the job folder. The operator can type her own in Settings today.
- **R01 numbering.** The order says append from DC-61. DC-61 was already Seagull's, so the build appended from DC-62.
- **The gate's target** is the site's production address, which is now the custom domain. Earlier runs used the netlify.app address, and both serve the same deploy.

## The smallest next decision for Sunray

**Take the score rule to the operator.** The product implements FRAGO 06 3.6 as written. If her conversation settles different bands, the constants are all in `lib/modulePage.ts`, and the change is a short order.

---
document: FRAGMENTARY_ORDER
job: CAST-0009 ASSURE
frago: 02
version: v1.0
status: ISSUED BY SEAGULL, 2026-09-22, under T02 A6
supersedes: nothing; CLAUDE_CODE_INITIATING_PROMPT.md and FRAGO_01_TRACKER.md still apply except where this order changes them
usage: Paste as the first message of a Claude Code session in CAST_JOBS/CAST-0009_ASSURE. Builds v1.2 on the deployed v1.1 and redeploys to the same site. Deadline: live by 2026-09-23 18:00, ahead of the Wednesday 24 Sep boardroom with Rich, Lurong and Ed.
---

# FRAGO 02: Tessera Assure v1.2, Lurong's structure

## 1. Situation

v1.1 is live (deploy 6aabf6eacfee0a56643c6915). It has been driven by both seats since 17 Sep; one client confirmation has waited in the review queue since 18 Sep. Lurong, MITMARK's operator and the person whose method the product standardises, returned written feedback on 21 Sep. Sunray adopts it (DC-25). Her three stated user benefits are the test for every change in this order: **compliance overview, document repository, consolidated actions**, with the CFO statement quantifying the service.

Rules unchanged: A7 stop list, £0, no client or officer name anywhere, restricted-name grep before every commit and deploy, Seagull commits on master, sub-agents on the lowest viable model, lanes run concurrently. Append decisions to R01 from DC-26.

Read first: T02 (A3, A4, A7), BUILD_REPORT.md v1.1 section, T18, then this order.

## 2. Mission

Restructure the client portal to Lurong's navigation, rename two modules to her titles, add a document repository and a consolidated job list, and redeploy as v1.2 by 23 Sep 18:00. Keep every v1.1 capability and every v1.1 rule (six columns, fraction with percentage, client confirms only).

## 3. The eight modules, as Lurong names them

Rename and re-scope. Library task ids are stable; only their area assignment and the area titles change. Migrate existing tasks and Record entries by area id; nothing is deleted.

| # | v1.1 title | v1.2 title (Lurong) | Scope change |
|---|---|---|---|
| 1 | DPO registration and ICO | DPO registration | none |
| 2 | Data mapping and processing records | **Data tracker review** | RoPA tasks stay. Add: employee access tracker review (quarterly, M, 4h); international transfers register review (annual, M, 4h, moved from old area 4); DSAR log, breach register and vendor list are trackers and are linked from here as documents |
| 3 | Data retention | Data retention | none |
| 4 | Cross-border data transfers | **Policy review** | All policy review tasks move here: annual policy suite refresh (from area 3 cross-cutting) becomes one task per policy in the pack (six), annual, M, 2h each; privacy notice review, annual, M, 2h. The old cross-border tasks move to area 2 (register) and area 7 (DPA for new transfers) |
| 5 | Data protection impact assessments | Data protection impact assessment | none |
| 6 | Data subject requests | Data subject requests | none |
| 7 | Vendor data risk | Vendor data risk | gains "UK Addendum or IDTA in place for any new transfer" from old area 4 |
| 8 | Data breach and incident management | Data breach and incident management | none |

Obligation text for areas 2 and 4 is rewritten by the build to match the new scope, plain words, citation at the foot, marked DRAFT for Lurong like the rest of the library.

## 4. Client navigation, in this order

1. **Compliance Tracker.** The v1.1 home unchanged in content. Gains a sub-navigation listing the eight modules so each module page is one click from anywhere. Posture is folded in here as the "Areas by status" panel that already exists; the separate Posture menu item goes.
2. **Compliance Documents.** New. The repository. Three sections: Policies (the approved policy pack, current version, with version history), Procedures (per area, from the operator's Procedures page), Trackers (the registers: RoPA, employee access tracker, DSAR log, breach register, vendor list, transfers register). Each item: title, module, version or as-at date, owner, last updated, open or download. The operator uploads or links from admin; the client reads and downloads only. Files go to Netlify Blobs with a 10 MB cap per file; larger items are links. Empty state per section says what MITMARK will publish and when.
3. **Jobs.** New, replacing the Policy Guide menu item. Every task across all eight modules in one list, the six columns, grouped by status in Lurong's words: **Not started, In progress, Completed**. Internal statuses map: not started to Not started; in progress and blocked to In progress (blocked shows a labelled flag); done to Completed; not applicable hidden with a count. Filters: module, owner, due this month. The "for you" tasks sit at the top. The Policy Guide lives at the foot of this page as "Ask a question", scoped to all approved policies, so questions and tasks are in one place as she asked.
4. **Requests and clocks.** Unchanged.
5. **Value.** Unchanged.
6. **Statement for the CFO.** Unchanged.

Exposure leaves the client navigation; it stays in admin. The Policy Guide also stays reachable from each module page as in v1.1.

## 5. Admin additions

- **Documents.** Upload or link items into the three sections, assign module, set version or as-at date, publish or unpublish. Publishing an approved policy version from the policy pack lists it automatically under Policies.
- **Jobs** view mirrors the client's, with edit controls.
- Everything else as v1.1.

## 6. The overall figure (Sunray decision, DC-25)

Change the denominator to **overdue-based** as the default, so a client who is up to date does not open on a low number:
- m = tasks with a due date on or before today, plus always-on duties that have an open item raised against them (a clock, an intake, a review-queue item).
- n = those closed as complete.
- Sentence beneath: "Nothing overdue" when m equals n, otherwise "{m minus n} overdue or blocked".
- The fraction still travels with the percentage. The "signed off this cycle" view stays available to the operator as a toggle in admin, not to the client.

## 7. Denominator aside, nothing else in the arithmetic changes

Six measures, area RAG, journey strip, Record and Statement all as v1.1.

## 8. Lanes

(a) Library remap and migration, with a test that every existing task and Record entry still resolves to a module and no id is lost. (b) Client nav, module sub-nav, Jobs page. (c) Documents: model, Blobs storage, admin upload, client read. (d) Denominator change with tests both ways and the admin toggle. (e) Gate update: nav order, six columns on Jobs, fraction rule, client cannot write on Documents or Jobs, restricted-name grep, module titles match section 3 exactly.

## 9. Definition of done, v1.2

- Gate passes against production.
- Demo organisation migrated: 54 tasks resolve to the eight renamed modules; new area 2 and area 4 library tasks applied from 2026-09-01, additive.
- Documents section shows the six approved policies under Policies automatically; Procedures and Trackers show honest empty states.
- Jobs page shows every task in Lurong's three groups with the six columns; client can confirm and nothing else.
- Front page reads "Nothing overdue" or "{k} overdue or blocked" with the fraction.
- T17 v1.2, T18 sections for Documents and Jobs, BUILD_REPORT v1.2 section, R01 current, one or more commits on master as Seagull, tree clean.
- Deployed to site id 62b23338-2994-49ca-bc9e-0a4ba1cd5aaa by 2026-09-23 18:00.

## 10. Stop conditions

As before, plus: any change that lets the client upload, edit or delete a document or a task; any file stored outside Netlify Blobs; any spend.

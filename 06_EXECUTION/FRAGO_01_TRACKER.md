---
document: FRAGMENTARY_ORDER
job: CAST-0009 ASSURE
frago: 01
version: v1.0
status: ISSUED BY SEAGULL, 2026-09-17, under T02 A6
supersedes: nothing; CLAUDE_CODE_INITIATING_PROMPT.md section 1 to 3 and 5 to 8 still apply
usage: Paste as the first message of a Claude Code session in CAST_JOBS/CAST-0009_ASSURE. Builds v1.1 on top of the deployed v1.0 and redeploys to the same site.
---

# FRAGO 01: Tessera Assure v1.1, the Compliance Tracker

## 1. Situation

v1.0 is live at https://tessera-assure.netlify.app (deploy 6aabe0ac5884128cb5314a12, Netlify site id 62b23338-2994-49ca-bc9e-0a4ba1cd5aaa). The higher commander has seen v0.1 and returned revised intent by email on 17 Sep: the client's front page must answer, per task, **what do I need to do, how, who, by when, is it done, and if not what is the status**; the product is to become the SaaS MITMARK sells on recurring terms; Lurong's method is to be standardised in it. His reference mock shows a five-phase journey strip, a KPI row, and an overall status bar. His landscape slide names eight task areas.

Everything in the initiating prompt still holds: A7 stop list, £0, no client or officer name anywhere, restricted names grep before every commit and deploy, Seagull commits on master, sub-agents on the lowest viable model, you orchestrate and run lanes concurrently.

Read first: `00_INTENT/T02_HIGHER_COMMANDERS_INTENT.md` (A3, A4, A7 again), `06_EXECUTION/BUILD_REPORT.md`, `07_HANDOVER/T18_OPERATOR_BRIEF.md`, then this order. Append your decisions to R01 from DC-20.

## 2. Mission

Rebuild the client portal home as a Compliance Tracker that answers the six questions, add a workplan layer and per-area sub-pages beneath it, keep every v1.0 capability, and redeploy to the same URL as v1.1. Ready for Rich and Lurong to drive by 2026-09-19 12:00.

## 3. The one rule that reconciles Rich's intent with A7

The workplan is **MITMARK's workplan for the client**. The operator owns and updates it. Tasks whose owner is a client role are shown to the client as "for you", with a due date and a one-line ask; the client confirms completion with one click and may attach a file, and does nothing else. The client never creates, edits, reprioritises or closes a task. Status on the client side is always the operator's most recent setting. Build the permissions that way and the UI will follow.

## 4. Information architecture, client portal

Top to bottom on the home page. Every element derives from stored data; nothing is decorative.

**4.1 Header strip.** Client display name (from settings), "Compliance Tracker", jurisdiction and regulation set (UK, UK GDPR and DPA 2018 for now), as-at timestamp of the last operator update.

**4.2 Overall status.** Rich wants one figure. Show it with its basis, in this exact form: "**{n} of {m} obligations met**, {pct}% , as at {date}" followed by RAG counts by area. The denominator m is the count of tasks due on or before today plus tasks marked always-on; n is those closed as complete. Never show a percentage without the fraction beside it. Tooltip and sub-page state the rule.

**4.3 Journey strip.** Five phases as on Rich's mock: Assessment and discovery, Planning and strategy, Implementation, Ongoing monitoring, Reporting and review. Each task in the library carries a phase. The strip shows, per phase, the count of tasks open and done and the RAG of the worst open task. The phase with the earliest open due date is marked current. No icons that imply activity that is not in the data.

**4.4 KPI row.** Six tiles, each built from Record entries, clocks and tasks. Each tile shows its figure, its basis and its period, or "no data yet" with the basis it will use. Never an illustrative figure on the client side.
- DSARs on time: closed SAR clocks within one month / all closed SAR clocks, this year.
- Breaches: incidents logged this year; of which notified to the ICO; median hours from report to assessment.
- DPIAs: required (tasks in area 5) / complete.
- Training: staff trained / staff in scope, from the operator's settings; "not recorded" until set.
- RoPA: processing activities documented / identified, from area 2 tasks.
- Vendors: assessed / in scope, and count by RAG, from area 7 tasks.

**4.5 The eight areas.** A grid of tiles, one per area, in this order and with these names:
1. DPO registration and ICO
2. Data mapping and processing records
3. Data retention
4. Cross-border data transfers
5. Data protection impact assessments
6. Data subject requests
7. Vendor data risk
8. Data breach and incident management

Each tile: area name, RAG with label, owner of the next task (MITMARK or client role), next due date, open tasks count, progress bar of done / total for the current cycle. Click opens the area page.

**4.6 "For you" panel.** Tasks whose owner is a client role, due soonest first, with the one-line ask and a confirm button. Empty state: "Nothing needs your action. MITMARK is working {k} items."

**4.7 Value, one tab back.** The v1.0 Record and Statement unchanged, retitled "What MITMARK did and what it saved". The Statement gains one line at the top of "What was done": obligations met in the period, from 4.2.

## 5. Area sub-page

Same skeleton for all eight:
1. **The obligation, in plain words.** Three to five sentences, from the task library (section 8). No legal citations in the body; one line at the foot naming the article or section.
2. **Status.** RAG, basis, as-at.
3. **Tasks.** Table with the six columns: What, How (link), Who, When, Done, Status. Sorted open first by due date, then closed by close date. Each row expands to show notes, evidence links and the Record entry it produced.
4. **How we do it.** The approved policy for the area from the policy pack (link and section), the procedure and the process map. Where MITMARK has not yet supplied a procedure or map, show a clearly marked placeholder card "Procedure to be published by MITMARK" with the operator's target date, never a generic document presented as the client's.
5. **Ask the Guide.** The Policy Guide scoped to this area's policy.
6. **History.** Closed tasks and Record entries for the area, newest first, with reviewer.

## 6. Admin workspace additions

- **Workplan.** List and edit tasks: area, phase, title, the one-line "how", owner (MITMARK or a client role from a small list: Information Officer, HR, IT, Finance, Facilities, Board), due date, recurrence (once, monthly, quarterly, annual, always-on), status (not started, in progress, blocked, done, not applicable), progress percent, evidence links, notes. Closing a task as done creates a Record entry with the area's default hours, as v1.0 does for clocks.
- **Library.** Apply the seeded task library to an organisation, with a start date; recurrence expands into dated tasks for the next twelve months. Re-apply adds missing tasks only; it never overwrites edits.
- **Procedures.** Per area: upload or link the procedure and the process map, set the target date for the placeholder.
- **Settings** gains: jurisdiction (enum: UK, CH-MC, DIFC, SG, US; UK only has content), staff in scope, and the client role list.
- **Review queue** shows client confirmations of "for you" tasks for the operator to accept or reopen.

## 7. Data model additions

- `task`: id, org_id, area (1 to 8), phase (1 to 5), title, how (short text), how_link (policy section or procedure id), owner_type (mitmark or client), owner_role, due_at, recurrence, status, progress, evidence (list of links), notes, source (library id, clock id, or manual), record_entry_id, created_by, updated_by, updated_at, closed_at.
- `procedure`: id, org_id or null for MITMARK library, area, title, body or link, process_map_link, published_at, target_date.
- `library_task`: the seed from section 8, keyed by id, with area, phase, title, how, owner_type, owner_role, recurrence, default_hours, default_offset_days from cycle start.
- `organisation` gains jurisdiction, staff_in_scope, client_roles.
- Client confirmation of a task is an audit-logged event, not a status change; the operator's accept is the status change.

## 8. Task library v0 (Seagull's draft, UK GDPR, estate client; marked DRAFT until Lurong authenticates)

Owner M = MITMARK, C = client role in brackets. Recurrence in brackets. Phase in brackets. Hours = default Record hours on close.

**Area 1, DPO registration and ICO**
- Confirm ICO registration is current and the fee tier is right. M. Annual. Assessment. 1h.
- Confirm DPO appointment is recorded and the DPO contact is on the privacy notice and the ICO record. M. Annual. Assessment. 1h.
- Register or renew: pay the ICO fee. C (Finance). Annual. Implementation. 0h.

**Area 2, Data mapping and processing records**
- Maintain the record of processing activities: review every activity, legal basis, retention and recipients. M. Quarterly. Monitoring. 8h.
- Add any new system or supplier to the RoPA before go-live. M. Always-on. Implementation. 2h.
- Confirm the department list and system list are complete. C (Information Officer). Annual. Assessment. 0h.

**Area 3, Data retention**
- Review the retention and deletion schedule against operations and law. M. Annual. Planning. 10h.
- Run the scheduled deletions and record them. C (IT). Quarterly. Implementation. 0h.
- Verify deletions ran and record the evidence. M. Quarterly. Monitoring. 2h.

**Area 4, Cross-border data transfers**
- Identify every transfer outside the UK, its mechanism and its risk assessment. M. Annual. Assessment. 6h.
- Put the UK Addendum or IDTA in place for any new transfer before it starts. M. Always-on. Implementation. 4h.

**Area 5, Data protection impact assessments**
- Screen every new project or system for DPIA need. M. Always-on. Planning. 2h.
- Complete the DPIA where required, with sign-off and any ICO consultation flag. M. Always-on. Implementation. 16h.
- Approve the DPIA and its residual risk. C (Board or Information Officer). Always-on. Implementation. 0h.

**Area 6, Data subject requests**
- Handle every request within one month: acknowledge, search, redact, respond. M. Always-on. Monitoring. 6h.
- Forward any request received by staff to MITMARK the same day. C (Information Officer). Always-on. Monitoring. 0h.
- Review the DSAR log and response times. M. Quarterly. Reporting. 2h.

**Area 7, Vendor data risk**
- Assess every new supplier that processes personal data and put an Article 28 DPA in place before go-live. M. Always-on. Implementation. 5h.
- Review existing suppliers and DPAs, RAG each. M. Annual. Monitoring. 8h.
- Notify MITMARK of any new supplier before contract. C (Facilities or Finance). Always-on. Implementation. 0h.

**Area 8, Data breach and incident management**
- Assess every reported incident against the ICO threshold within 72 hours and record the decision. M. Always-on. Monitoring. 8h.
- Notify the ICO and individuals where required. M. Always-on. Monitoring. 6h.
- Report any suspected incident to MITMARK immediately. C (all staff, via Information Officer). Always-on. Monitoring. 0h.
- Test the incident response plan. M. Annual. Reporting. 6h.

**Cross-cutting (shown under the area they touch, phase Reporting)**
- Deliver staff data protection training and record completion. M. Annual. Implementation. 6h. Area 8.
- Prepare the quarterly board briefing on data protection. M. Quarterly. Reporting. 8h. Area 1.
- Issue the monthly threat and data protection report. M. Monthly. Reporting. 4h. Area 8.
- Annual policy suite refresh. M. Annual. Planning. 10h. Area 3.

## 9. UI and UX rules for this version

- House standard (Tessera tokens) throughout. Client portal is the day theme by default; admin is night. Rich's mock colours are not adopted; its structure is.
- The six questions are six columns, in that order, on every task table. Do not rename them.
- RAG is never colour alone. Label every mark.
- Every figure shows its basis and its as-at date on hover or beneath.
- "No data yet" is a state, styled, never blank and never a placeholder number.
- Phone width works: tiles stack, the task table becomes cards with the six labels.
- Empty client portal (no tasks applied) shows a single card: "MITMARK is preparing your workplan" with the operator's target date.
- Print of an area page produces a clean document.

## 10. Lanes to run concurrently

(a) Data model and API for task, procedure, library; migration of existing organisations. (b) Client home and area pages. (c) Admin workplan, library apply, procedures, settings. (d) KPI and overall status calculations with unit tests, including the denominator rule. (e) Library seed from section 8 as data, with a test that every library task has all fields. (f) Gate update: six-column check on every task table, no percentage without fraction, no illustrative figure reachable on the client side, restricted-name grep.

## 11. Definition of done, v1.1

- Gate passes against the production URL.
- Demo organisation has the library applied from 2026-09-01; client home shows real counts from it; KPI tiles show figures or "no data yet" correctly.
- Client account can confirm a "for you" task and can do nothing else to the workplan.
- v1.0 Record, Statement, clocks, policy pack, Guide, review queue, audit log all still work; v1.0 export still imports.
- T17 updated; T18 gains a section on the workplan and procedures; BUILD_REPORT.md v1.1 section; R01 current; commits on master as Seagull; working tree clean.
- Deployed to site id 62b23338-2994-49ca-bc9e-0a4ba1cd5aaa, same URL.

## 12. Stop conditions

As the initiating prompt section 8, plus: any design that lets the client edit a task; any client-side figure without a stored basis; any spend.

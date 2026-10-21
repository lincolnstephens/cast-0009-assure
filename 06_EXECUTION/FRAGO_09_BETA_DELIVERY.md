---
document: FRAGO_09_BETA_DELIVERY
job: CAST-0009 ASSURE
version: v1.0
status: ISSUED 2026-10-21 (R01 DC-72, DC-73). Product target: Tessera Assure v1.9, the version delivered to the client as its beta on 22 October 2026.
authority: Seagull, under T02 A6 and Sunray's standing delegation of 30 Sep. Source: the operator's fifth feedback (document with six screenshots, 15 Oct 2026, filed at material/restricted/operator_feedback_05_20261015.docx because its screenshots carry the client's name) and Sunray's decisions of 21 Oct (both logos; client beta delivery tomorrow).
supersedes: nothing. FRAGO 01 to 08 stand except where this order says otherwise.
---

# FRAGO 09. Four small points, then the client beta goes out

## 1. Situation

The operator walked v1.8 on 15 October with a test seat and passed it: "all the suggested actions work well". She returned four points, each small, and said she would present the product to the client once they are in. Sunray has set the client beta delivery for 22 October. This order closes her four points and prepares the hand-over material. The human sequence (secret rotation, consent, the Information Officer's password) stays with Sunray and is in section 7, not in this order.

Her four points, as she wrote them:
1. Review queue: Approve and Reject on data requests and client confirmations give her no way to tell the client why. (Reject on a request already takes a note, and the product throws it away: `rejectReviewItem` stores nothing and the client never sees it.)
2. Client upload form: the module dropdown should be a Category (Policy, Procedure, Tracker), because that is how the Compliance Documents page is structured.
3. Job status marks: a green tick for a completed job, grey circle for not started, amber circle for in progress. Rich asked for the tick.
4. Client portal branding: client logo only, or both logos? Sunray, 21 Oct: both.

T02 stands. The client still never edits the workplan; a decision note is MITMARK speaking to the client, which is the review queue doing what it has done since v1.0, with the reason attached. No percentage without its fraction; colour never carries meaning alone; the client's name stays in the store and in material/restricted.

## 2. Mission

Ship v1.9: decision notes on Approve and Reject that reach the client; a Category on the client's upload with the module set by the operator at acceptance; the status marks as the operator drew them under one rule; the client portal header carrying both marks; the client quick-start and the operator brief updated for hand-over. Deploy to the existing site, gate, report. No new money committed. Live by 1700 BST today, 21 October.

## 3. Execution

### 3.1 Decision notes (her point 1)

- **Where.** The review queue's Approve and Reject on items of type `intake` (data request and concern) and `task_confirmation`. One optional text field, "Note to the client (optional)", up to 300 characters, beneath the item, read by both buttons. Document submissions keep their existing Return reason unchanged; export requests and alerts are unchanged.
- **Stored.** On the review item (`decisionNote`) and on the record it refers to: the intake's clock, or the task's confirmation record. Never only in the audit.
- **Shown to the client.** On Requests and clocks beside the request's status, and on Job management on the confirmed task's card, as "MITMARK: {note}" with the decision date. Nothing is shown when no note was given. In View as client it shows as the client sees it.
- **Test seat.** A note to a test seat's item is tagged test like the item and reaches no client.
- **Audit.** The entry says a note was given; it does not repeat the note.
- **Wording when she leaves it blank.** Nothing changes from today.

### 3.2 Category on the client upload (her point 2)

- **Client form.** "Module" is replaced by "Category" with three options: Policy, Procedure, Tracker. Required. The stored submission carries `category`; `area` is left unset by the client.
- **Operator acceptance.** Accept pre-fills the section from the category (Policy to Policies, Procedure to Procedures, Tracker to Trackers), changeable, and requires the module (1 to 8), which the operator sets. A submission cannot be published without a module, because the module pages' "Relevant documents and trackers" depend on it.
- **Review queue card.** Shows the client's category and title. Her "new version of" choice is unchanged.
- **Existing records.** Submissions made before v1.9 that already carry a module keep it; the queue shows their module where there is no category.

### 3.3 Status marks (her point 3)

Applies to the client's Job management cards, the module pages' Jobs tables, the Workplan and the operator's Jobs board, wherever a task's status is marked.
- **Done:** green tick.
- **Not started:** grey circle.
- **In progress:** amber circle.
- **Overdue or blocked, in any state but done:** red mark with its word (Overdue, Blocked). The red mark replaces the state mark; the state is still named in words beside it.
- **One mark per task.** The separate RAG lamp beside the status column goes; its meaning moves into the mark and the words. The words are always present (Done, Not started, In progress, Overdue, Blocked), so colour never carries the meaning alone. The RAG_LABEL "Due soon" is kept as words only, after the state ("In progress, due soon"), never as a colour of its own.
- **Contrast.** Every mark measured at 3:1 or better against the page as a graphic, and the words at 4.5:1, at all three widths.
- **House tokens only.** The status ramp as it stands; no new colour.

### 3.4 Both marks on the client portal (her point 4, Sunray's decision)

- **Client logo once.** At the head of the client menu, as now. It leaves the page header, which is where her screenshot showed it twice.
- **MITMARK mark in the header.** The MitmarkLogo mark, right-aligned in the client page header at menu-text height, with the words "Delivered by MITMARK Intelligence" beside it from 768px and the mark alone beneath. Contrast 4.5:1 for the words.
- **Footer and watermark unchanged** (FRAGO 08 3.3).
- **With no client logo** the menu head shows the organisation's name as text, as now.
- **Admin workspace unchanged.** View as client shows the client's header exactly.

### 3.5 Hand-over material

- **T18** gains section 5n: decision notes, the Category and module at acceptance, the marks, the header.
- **New: `07_HANDOVER/T27_CLIENT_QUICK_START.md`.** One page for the Information Officer, in plain words, which the operator sends with the sign-in. Contents: what the portal is (one paragraph, no marketing), signing in for the first time and setting a password, the six menu items in one line each, what she can do (confirm a task, submit a request, upload a document, ask a question) and what MITMARK does with each, and who to contact (the operator, by role: "your MITMARK contract lead"). No client name, no person's name, no address, no codename anywhere in the file. The operator fills the sign-in address and her own name when she sends it.
- **T24 and T26** unchanged.

### 3.6 Gate

Extend for v1.9 and keep everything from v1.8 that still applies:
- A note given on Approve or Reject of an intake and of a task confirmation is stored and reaches the client on the right page; no note, nothing shown; a test seat's note reaches no client; the audit entry carries no note text.
- The client upload form offers Category and not Module; a submission carries its category; Accept pre-fills the section and refuses to publish without a module; a published submission appears on its module page.
- Every task status mark is one of the four marks with its word present; an overdue or blocked open task shows red with its word; no separate RAG lamp remains in a status column; mark contrast 3:1 and words 4.5:1 at all three widths.
- The client header shows the MITMARK mark and not the client logo; the client menu head shows the client logo (gate organisation: a neutral generated image, removed afterwards); footer and watermark present as v1.8; the admin workspace shows none of it.
- T27 exists and `check_restricted.py` passes on it and on the folder, including the built bundle.
- Gate pinned to the demo at every operator sign-in (DC-63); the client organisation is checked by reads only (DC-70 item 7); check its audit log before and after the run and report any write.

## 4. Service support

As FRAGO 03 section 4. Source `06_EXECUTION/build/maximus-src`; commit as `Seagull <seagull@cast.local>` on master; `check_restricted.py` before every commit; deploy to Netlify site `tessera-assure`, id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`; gate against https://assure.tessera-monitor.com. No new dependency, no environment variable or secret change, no real person's password reset. State what was spent. Tessera tokens, Inter and JetBrains Mono.

## 5. Command and signal

- Delete stale `.git/*.lock` first (one HEAD.lock from 14 Oct is present).
- Build session sole writer of R01 while it runs; append from DC-74. DC-72 and DC-73 are Seagull's and are already in.
- Write the v1.9 sections: BUILD_REPORT, `T14_DEFINITION_OF_DONE_V1_9.md`, `T17_BATTLE_INSPECTION_V1_9.md`, T18 5n, T27.
- Stop conditions as FRAGO 08, plus: any path by which a client could set a document's module or publish anything is a stop; any status mark whose colour contradicts its word is a stop; the client's name or logo in any file outside `material/restricted/` or in the bundle is a stop.
- Two fix passes on the gate. Report: deploy id, gate result, deviations, what waits on whom, and the client organisation's audit entries since 14 Oct 11:09 BST.

## 6. Timings

Issued 21 Oct. Live and gated by 1700 BST Wednesday 21 October, so the operator can look before the client beta is delivered on 22 October.

## 7. Not in this order (Sunray and the operator, before the client signs in)

- Sunray: rotate `SESSION_SECRET` in Netlify (every session ends; the operator signs in again).
- Sunray: Block 5 consent confirmed; then Reset the Information Officer's password in Users; the one-time password reaches her through the operator, never with the address in the same message.
- Sunray: the Anthropic key, when there is one (DC-19). Without it Quick questions shows cited passages and says so.
- The operator: check v1.9 in View as client; send T27 with the sign-in; module statuses, rates and the Statement's numbers after the meeting.

---
document: FRAGO_07_WORKING_PROGRAMME
job: CAST-0009 ASSURE
version: v1.0
status: ISSUED 2026-10-13 (R01 DC-65). Product target: Tessera Assure v1.7, the version used in the client meeting the week of 19 October.
authority: Seagull, under T02 A6 and Sunray's standing delegation of 30 Sep. Source: the operator's fourth feedback (document with six screenshots, received 13 Oct) and Sunray's instruction that the product is a working programme by the client meeting next week.
supersedes: nothing. FRAGO 01 to 06 stand except where this order says otherwise.
---

# FRAGO 07. From beta to working programme

## 1. Situation

The operator has used v1.6 and returned five points. Two of them are not faults: she tested "Submit request" and "Ask" while in View as client, where every write is refused by design (FRAGO 04), and read that as the functions being switched off. The other three are real changes: documents must move both ways (download on the admin side, upload from the client), tickets on Job management must be draggable for her monthly review with the client, and the Statement must speak in her eight modules, not the twelve-line catalogue from the archive. Her fifth point, Quick questions answering from every uploaded document, is bounded by the Anthropic key, which is still not set (DC-19).

A client meeting with the Information Officer falls next week. Sunray's requirement: a working programme by then. This order delivers the product side of that; section 7 lists the human side.

T02 stands. Two rules bend here and are stated plainly:
- "Anything that adds to her workload fails" (A3) and "the client never creates, edits or closes a task" (DC-04 rule). A client upload is an offer, not a duty: the Information Officer may upload a file; nothing is published until the operator accepts it in the review queue. The client still cannot touch the workplan.
- The twelve service lines were the archive's catalogue (T02 A9). The operator delivers the service as eight modules and the client knows it that way. The Statement and the Record now speak in modules; the twelve-line catalogue is retired from every client-facing surface.

## 2. Mission

Ship v1.7: document download and client upload with operator review; draggable Job management on the operator's side; Requests and Ask usable where they should be and explained where they are not; the Statement and Record in eight modules; Quick questions reading every published document. Deploy, gate, report. No new money committed.

## 3. Execution

### 3.1 Documents both ways

- **Admin Documents**: every filed file gets a Download control (the stored file, original name and type). Links open in a new tab. Audit entry per download ("document.download", document id, actor).
- **Client Compliance Documents**: the client can download any published document (already true; confirm and gate it) and gains **Upload a document**: file or link, title, which module, one line of what it is. The upload lands in a "Submitted by the client" state: it is visible to the client as "Submitted, awaiting MITMARK review" on the Documents page and to the operator in the review queue with Accept (choose section, publish) or Return (with a one-line reason the client sees). Nothing submitted is published or counted until accepted. 4 MB cap as DC-28; larger as a link. The client cannot edit, replace or delete anything once submitted or published; she can submit a new version, which goes through the same queue and, on acceptance, supersedes the earlier one with history kept.
- The review-queue rule from v1.0 stands: the system that asks the client for things must answer her. An item unreviewed for 5 working days shows an amber flag on the operator's queue and in T18's weekly routine.

### 3.2 Job management, draggable

- **Operator side**: the admin Job management page becomes the same three-column board as the client's (Not started, In progress, Completed), with the task cards draggable between columns. A drop changes status (with Blocked reachable from the card, not by drag), writes the audit entry, and updates the tracker. Keyboard equivalent: a status select on each card. Filters stay.
- **Client side**: unchanged, read only, no drag. The operator runs the monthly review from her own board with the client watching, or in View as client, where drag is disabled and the banner says so.
- The seed-closed rule (DC-64) stands; a drag to Completed records today's date as the completion date.

### 3.3 Requests and Ask

- **Ask** (Quick questions) is a pure read since DC-46 and is enabled in View as client. 
- **Submit request** stays refused in View as client, but the control now explains itself: "Read only in client view. The client submits requests from her own sign-in." The same message on Confirm.
- **Test as client** without touching the real client: each organisation may hold one additional client user flagged "test seat" (created on the Users page, labelled on screen and in the audit; its writes are tagged test and excluded from the Record, the counters and the Statement). This lets the operator try the request flow end to end before the client does. The flag cannot be removed; a test seat is disabled, not converted.

### 3.4 Eight modules, not twelve lines

- Record entries carry a module (area 1 to 8) instead of a service line. Migration: map each existing line to its module by the table the build writes into `packages/shared/src/lines.ts` (one line, one module; the four lines with no module home go to the nearest and the mapping is recorded in the build report). Existing demo entries migrate; counts checked either side.
- Settings: "Service line status" becomes "Module status": Live, Available, Recommended or Not in scope per module. The twelve-line list is removed from Settings, the Value page and the Statement.
- Statement, part 1 "The service": the eight modules with their status and one line each (the module introductions). Part 2 "What MITMARK has done": totals by module. Part 3 unchanged. "twelve service lines" and the word "lines" disappear from every client-facing string; the gate greps for them.
- The Value page and the Record admin page group by module.

### 3.5 Quick questions over every published document

- At upload (and once, as a migration, for every document already filed), extract text from .docx and .xlsx (and .pdf where text exists) into a per-document corpus stored beside the document. Links are not read. Extraction failures are logged and the document is marked "not searchable" on the admin side only.
- The Guide's corpus becomes: approved policies (as today) plus the published procedures and trackers' extracted text. Retrieval is deterministic (section-level keyword and phrase match, best passages cited by document and section). When `ANTHROPIC_API_KEY` is present, the model composes the answer from the retrieved passages only, citing them; when it is absent, the page shows the retrieved passages with their citations and the escalation line, and says so in one sentence. Both paths gated.
- Wording on the page stays true to whichever path is live.

### 3.6 Before the meeting (product-side hygiene in this order)

- The Information Officer's display name: the organisation display name is set by the operator in Settings before the meeting (Sunray's open decision on naming is hers to execute; the product does nothing).
- Client organisation module status: the operator sets the eight statuses; default stays "Available" for a new organisation, never "Live" (change the default in `emptyOrgDoc`; the demo organisation keeps its values).

### 3.7 Gate

Extend for v1.7: download on admin and client with audit; client upload lands in the queue and is not visible as published or counted until accepted; return with reason reaches the client; a superseding upload keeps history; operator drag changes status with audit and tracker update, and no drag exists on the client side or in client view; Ask works in client view and Submit request is refused with the stated message; test seat writes are excluded from Record, counters and Statement; no "service line" or "twelve" on any client page; Record totals equal before and after migration; corpus built for every filed document or marked not searchable; Guide answers cite document and section on both paths; everything from v1.6 that still applies; `check_restricted.py`.

## 4. Service support

As FRAGO 03 section 4. Text extraction with a pure-JS library already in the workspace or installable at £0 (mammoth for .docx, the existing xlsx dependency for .xlsx, pdf-parse for .pdf); no new paid service. Blob budget: corpus text per document capped at 200 KB.

## 5. Command and signal

Build session sole writer of R01 while it runs; append from DC-66. Write v1.7 sections: BUILD_REPORT, T14 V1_7, T17 V1_7, T18 update (download and upload review, the board, the test seat, module status, what the Guide reads). Stop conditions as FRAGO 05, plus: any path by which a client upload becomes visible to the client as published, or counted, before operator acceptance is a stop.

## 6. Timings

Issued 13 Oct. Live by 1800 BST Wednesday 15 Oct, leaving two working days for the operator to walk it before the meeting.

## 7. Not in this order (the human side of "working programme")

- Sunray: the Anthropic key on the project (the difference between passages and answers in Quick questions); Block 5 consent; rotate `SESSION_SECRET` and disable the two demo accounts in Users once the operator is satisfied; then the Information Officer's password reset and hand-over, through the operator, before the meeting.
- Operator: organisation display name; module statuses; the numbers for the Statement, which she plans to take from the meeting itself (Block 1: retainer, contract dates, backfill); walk the product with the test seat before the meeting.

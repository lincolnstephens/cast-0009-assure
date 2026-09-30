---
document: FRAGO_06_MODULE_PAGES
job: CAST-0009 ASSURE
version: v1.0
status: ISSUED 2026-09-30 10:10 (R01 DC-61). Product target: Tessera Assure v1.6.
authority: Seagull, under T02 A6. Source: the operator's third feedback (email and 14-slide deck, 29 Sep 2026).
supersedes: nothing. FRAGO 01 to 05 stand. Section 3.5 (the Statement's frame) is confirmed: Sunray delegated it to Seagull as operational on 30 Sep (DC-61); the Record's evidence per item is unchanged, so T02 A3 and A5 hold.
---

# FRAGO 06. The module pages as the operator drew them, and the Statement's frame

## 1. Situation

The operator has signed in, reset her password, and returned a page design for each of the eight modules plus the live job list per module. Her job list has already been loaded (R01 DC-60: 19 tasks replacing the 27 seeded from the March handover; four module-7 handover tasks kept, undated). Her design for a module page is consistent across all eight: title and one-line description; "Useful links" as a row of tiles (the module's documents, registers and external links); a compliance status figure with a rule for the colour; a compliance journey (dated milestones, done in green, next in grey); and the module's jobs in the six-question table. Modules 5 to 8 add counters (how many DPIAs, requests, vendors, incidents, by state or severity).

She also wants two things settled in conversation, not by order: how the compliance score is calculated (section 3.6 gives the position Sunray takes into that conversation), and the Statement's frame (3.5).

T02 stands. No percentage without its fraction; no client-side figure without a stored basis; the client never edits.

## 2. Mission

Ship v1.6: every module page laid out as the operator's deck, with links, milestones and counters drawn from stored data or from operator-entered figures that carry their date and author; the Trackers register list renamed to hers; the Statement reframed if Sunray confirms 3.5. Deploy, gate, report. No new money committed.

## 3. Execution

### 3.1 Module page layout (all eight)

In order, top to bottom:
1. Module name and the one-line description (the existing introduction, defaults as v1.3; hers on the slides may replace them, the build takes the slide text as the new default).
2. **Useful links**: a row of tiles. Each tile is a document filed against this module (policies, procedures, trackers, as today) or a link item. Link items are documents of kind "link" (already supported, DC-28) and are filed by the operator; the seed manifest v2.1 (Seagull) files the two ICO links for module 1. Tile order: registers and policies first, then links. Beneath the tiles the same items as a numbered list, for phones and screen readers.
3. **Compliance status**: "{pct}% ({n} of {m} {what})" with its RAG mark, calculated as 3.6 says, basis on hover and in text beneath.
4. **Compliance journey**: a horizontal line of milestones drawn from this module's dated tasks (done and open), oldest left, at most six, each labelled with the task's short title and month/year; done milestones green, the next open one amber if overdue, grey otherwise. Nothing is drawn that is not a task. When a module has no dated task, the section says "No dated milestones yet."
5. **Counters** (modules 5 to 8 only), per 3.3.
6. **Jobs**: the module's tasks in the six-question table, as today.
7. Legal basis, how we do it, history, as v1.3 (unchanged, below).

### 3.2 Module specifics from the deck

- Module 1: tiles Registration certificate (link to the ICO register search), ICO payments (link to the ICO fee page), Annual renewal tracker (the register, when filed). Milestones from the renewal tasks (2026 done, 2027 next).
- Module 2: tiles RoPA, Employee access tracker, Cross-border transfer assessment, Information security risk register, Vendor log. See 3.4 for the register list.
- Module 3: tiles are the seven data categories of the retention schedule (CCTV and access data; financial and transaction data; tenancy data and contracts; employee HR records; health and safety records; recruitment data; technical and usage data), each showing its retention period, read from the module's operator-entered schedule (Settings, per module: a short list of category and period, editable by the operator). Plus the Data Retention Policy tile.
- Module 4: tiles are the four policies, each carrying its version and status (approved or draft).
- Module 5: tiles DPIA template, Project risk assessment template, DPIA folder (link), Project risk assessment folder (link). Counters: DPIAs (total, started, in progress, completed) and project risk assessments (same four).
- Module 6: tiles Response template, DSR folder (link). Counters: requests (total, not yet picked up, in progress, blocked, addressed). These come from the existing data-request intakes and clocks, not from operator entry.
- Module 7: tiles Vendor management policy, Vendor log. Counters: vendors total; by severity (low, moderate, high); by compliance (compliant, non-compliant).
- Module 8: tiles Incident management policy, Business continuity policy, Incident form (link), Incident response folder (link). Counters: incidents total; by severity; by state (open, in progress, closed). Incidents come from the existing breach intakes and clocks where they exist; the remainder from operator entry.

### 3.3 Counters and their basis

Two sources, and the page says which:
- **From the product's own records**: data requests (module 6) and breaches (module 8) already exist as intakes with clocks; count them by state. Basis text: "From the request log, as at {date}."
- **Operator-entered figures** for DPIAs, project risk assessments, vendors and incidents that the product does not yet hold as records: a small per-module "Figures" form in the admin workspace with the named counts, saved with the operator's id and timestamp. Displayed with the basis "Reported by MITMARK on {date}." Never editable by the client. Empty figures show "No data yet", never zero.
- This order does not build structured registers for DPIAs, vendors or incidents. That is the next step if the operator wants the counters to come from records rather than from her monthly entry; record it in T23 sequels.

### 3.4 Trackers register list

`TRACKER_DOCUMENTS` becomes the operator's list: Record of processing activities (2); Employee access tracker (2, alias Employee access matrix); Cross-border transfer assessment (2, alias International transfers register); Information security risk register (2, new); Vendor log (7, alias Vendor list); Data request log (6); Breach register (8, alias Incident log). Existing filed documents keep matching through the aliases.

### 3.5 Statement for the CFO: the frame (confirmed, DC-61)

The operator's position: the Statement should not compare achievement against the March handover list. In May 2026 she and the client agreed a different, shorter set of deliverables, and some handover items may not go ahead. She wants the Statement to read as: an overview of the service; what has been done; what comes next.

Seagull's read: this is compatible with the higher commander's intent if the record behind "what has been done" keeps its time and cost per item (T02 A3: the saving visible as a record, not a claim). What changes is the frame and the comparator: the May agreed deliverables replace the handover list as the plan the client sees. Build it as follows:
- The Statement is restructured into three parts: the service (the twelve lines, live ones first, from Settings); what MITMARK has done (the Record entries, with hours and cost per item and the totals, as today); what comes next (the open tasks with dates, from the workplan). The handover comparison and any wording that reads as "planned versus achieved against the handover" is removed.
- The May agreed deliverables are not in the job folder. The operator supplies them; until then "what comes next" is the dated open tasks she loaded on 29 Sep, which is already her list.
- The Record still needs Block 1 to be real. Nothing in this change alters that.

### 3.6 Compliance score: position for the conversation, then the rule

The operator proposes bands per module (for example: green 100 per cent when renewed on time; amber 70 if late within 30 days; amber 50 beyond; for registers, green 90 to 100, amber 60 to 80, red below 50) and notes the score should reflect completion and review timeliness. Seagull's position for Sunray to take to her:
- One rule for all modules, so the figure means the same thing everywhere: module score = dated obligations met on time / dated obligations due, over the current cycle, shown as "{pct}% ({n} of {m} on time)". A late completion counts at 70 per cent if within 30 days of its date and 50 per cent beyond, which is her band, applied per obligation rather than per module. Undated tasks do not count, so the score cannot be moved by adding tasks without dates.
- Colour from the score: green at 90 and above, amber 60 to 89, red below 60. Her "amber below 50" is taken as red.
- Overall score = mean of module scores that have at least one dated obligation, shown with "{k} of 8 modules green" as its fraction. The overdue count stays beneath it as today.
- Every figure keeps its fraction and its basis. The build implements whichever rule the conversation settles; if it settles nothing, this one.

### 3.7 Gate

Extend for v1.6: every module page has the seven sections in order; every tile opens something (a filed document, a link, or the register's "Not yet filed" card); milestones equal the module's dated tasks; counters carry a basis and show "No data yet" when empty; client cannot reach the Figures form or the retention schedule editor; percentages carry fractions; register aliases resolve; the Statement has the three parts and no handover comparison; everything from v1.5 that still applies; `check_restricted.py`.

## 4. Service support

As FRAGO 03 section 4. Seed manifest v2.1 is in place at material/lurong_documents/manifest_v2.json and adds the module-1 ICO links and the module-3 retention schedule as data; the build's seed accepts a `links` list (title, url, area, section "procedures") and an `orgSettings.retentionSchedule` list.

## 5. Command and signal

Build session sole writer of R01 while it runs; append from DC-61. Write v1.6 sections: BUILD_REPORT, T14 V1_6, T17 V1_6, T18 update (Figures form, retention schedule, links). Stop conditions as FRAGO 05. Add to T23 sequels: structured registers for DPIAs, vendors, incidents.

## 6. Timings

On issue. Live within four hours of issue.

## 7. Not in this order

Structured registers for DPIAs, vendors and incidents; the Anthropic key; rotation of secrets (DC-48 sequence); the Information Officer's password.

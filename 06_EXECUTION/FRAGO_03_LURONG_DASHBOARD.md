---
document: FRAGO_03_LURONG_DASHBOARD
job: CAST-0009 ASSURE
version: v1.0
status: ISSUED 2026-09-28, for the build session. Product target: Tessera Assure v1.3, live today.
authority: Seagull, under T02 A6, on Sunray's order of 28 Sep 2026 (R01 DC-32)
supersedes: nothing. FRAGO 01 and FRAGO 02 stand except where this order changes them.
---

# FRAGO 03. The operator's dashboard

## 1. Situation

The operator returned a second round of written feedback on 28 Sep (an email and a five-slide deck, transcribed in section 8). It simplifies the client portal. Her test is unchanged: compliance overview, document repository, consolidated actions, with the CFO statement pricing the service. Sunray has adopted the feedback and wants it live today.

T02 stands in full. In particular A7: no new system for the client to maintain; no claim without a record; no percentage without its fraction; no client name outside `material/restricted/CLIENT.md`. The overall-figure rule from v1.2 stands: overdue-based by default, the signed-off view stays admin-only and cannot reach the client.

## 2. Mission

Ship Tessera Assure v1.3: the client portal restructured to the operator's six menu items, the Compliance Tracker reduced to three sections, Jobs rebuilt as a three-column Job management board, Value moved to the operator's side, the Guide restored to the menu as the place for quick questions. Deploy to the existing site, gate, report. No new money committed.

## 3. Execution

### 3.1 Client navigation, in this order and with these labels

1. Compliance Tracker (`/`, view `tracker`)
2. Compliance Documents (`/documents`, view `documents`)
3. Job management (`/jobs`, view `jobs`) (renamed from Jobs)
4. Requests and clocks (`/clocks`, view `request`) (unchanged)
5. Statement for the CFO (`/value/statement`, view `statement`)
6. Quick questions (`/guide`, view `guide`) (the Policy Guide, back on the menu)

Value leaves the client menu. `/value` stays routable and is linked from the Statement page as "The record behind this statement", because the statement's figures must stay traceable to their record (T02 A3). It is not a menu item.

### 3.2 Compliance Tracker: three sections only

Remove from the tracker page: ModuleNav, KpiRow (the six measures), AreaTiles as currently built, ForYouPanel, and the "Areas by status" list inside StatusBar. The header stays (client display name, title, jurisdiction, as-at line).

**Section 1. Journey.** Heading "Journey". A line "Current stage: {phase name}". One sentence beneath, operator-editable in Settings, default: "This shows where the organisation is on its data protection journey. The stage reflects the year's deliverables and is adjusted as they are met." Then the five phases drawn as a path: five nodes on a single line or gentle curve, left to right, in order (Assessment and discovery, Planning and strategy, Implementation, Ongoing monitoring, Reporting and review). A completed phase is green, the current phase is amber, a future phase is grey; use the house status tokens, no new colours. Each node carries its name; the current node carries the word "Current" in text, not by colour alone. Current stage: a new org setting `journeyPhase` (1 to 5, or null). When null, derive it as today (the phase holding the earliest open due date). The operator sets it in Settings; the client cannot.

**Section 2. Overall compliance status.** Heading "Overall compliance status". First line: "Compliance score: {pct}% ({n} of {m} obligations met)", then "as at {date}" on the next line, then the existing basis sentence. The percentage never appears without the fraction beside it; the existing `overall.sentence` may be re-ordered but not reduced. The standing line ("Nothing overdue" / "{k} overdue or blocked") stays beneath the score. One line of explanation, fixed text: "There are eight compliance modules under the data protection function. The score reflects their overall status. Open a module to see its tasks, documents and status." Then the eight modules as a grid of eight tiles (2 by 4 on desktop, 1 column on phones), each tile filled with its RAG colour (green, amber, red; grey when no data), the module name in white text, and beneath the name in smaller text "{done} of {total} done". Each tile links to its module page. Tile order is module id 1 to 8.

**Section 3. Upcoming.** Heading "Upcoming". One line: "Activities planned to roll out." Then a list of the next open tasks across all modules that carry a due date, ordered by date, at most eight, each as "{task title}, {month year}" with the module name beneath in muted text. Where the operator wants an activity to appear here (for example an awareness session or a registration renewal), she adds it to the workplan with a due date; no second data model. If no dated open task exists, show "Nothing scheduled yet." Tasks waiting on the client ("for you") are not listed here; they move to Job management (3.4).

### 3.3 Module names

Rename in `AREAS` (ids stable; nothing else changes):

| id | was | becomes |
|---|---|---|
| 1 | DPO registration | DPO registration |
| 2 | Data tracker review | Data tracker compliance |
| 3 | Data retention | Data retention practice |
| 4 | Policy review | Policy review |
| 5 | Data protection impact assessment | Data protection impact assessment |
| 6 | Data subject requests | Data subject requests |
| 7 | Vendor data risk | Vendor data risk |
| 8 | Data breach and incident management | Data breach and incident response |

Update the library, seed, procedures, gate fixtures and any text that carries the old names. Migrate the demo organisation by id, and check the count either side as at v1.2.

### 3.4 Module page (Area.tsx)

Top of every module page, in this order: module name; a one-paragraph introduction, operator-editable per module in Settings, with a plain default per module written by the build (what the module covers, one to two sentences, no marketing); "Relevant documents and trackers": the Compliance Documents items whose `area` is this module (policies, procedures, trackers), each linking to the document, or "None filed yet" when empty; "Compliance status: {done} of {total} done, {pct}%" with its RAG mark and label. Then the task table as today, then the module sub-navigation so the reader can move to the next module without returning to the tracker (this closes the v1.2 deferral).

### 3.5 Job management

Rename the page and menu item to "Job management". Layout: three columns, "Not started", "In progress", "Completed", each a column of task cards (title, module name, due date or "no date", RAG mark; a blocked task sits in In progress with its flag as at v1.2). On phones the three columns stack, each with its heading. Not applicable tasks stay counted and unlisted as at v1.2. Above the board, a strip "Waiting on you" carrying the client's "for you" tasks with the confirm control exactly as ForYouPanel had it; that is still the client's only write. Empty state for the strip: the existing forYouEmptyMessage. Remove the Guide from the foot of this page; it now has its own menu item. No create, edit, drag, reorder, close or delete control anywhere on this page.

### 3.6 Value to the operator's side

The client menu loses Value. The admin workspace already holds the Record page and Settings, which are the inputs to the statement; add a menu item "Value" in admin that opens the Record page with a link to Settings for the rates, so the operator finds "the input on the statement" under one name. The client-side Statement page gains, at its foot, the link "The record behind this statement" to `/value`. `/value` and `/value/statement` keep their role guards as today.

### 3.7 Quick questions

Menu item "Quick questions" opens the existing Guide page. Page heading "Quick questions"; the first line beneath states plainly what it does: "Answers come from the approved policies and procedures. Where they do not answer, the question goes to MITMARK." No claim of intelligence beyond what it does. The Anthropic key remains unset (R01 DC-19); the deterministic fallback stays the live behaviour and the page wording must be true under it. When a key is present the page wording does not change.

### 3.8 Operator brief and settings

Settings gains: `journeyPhase` (select, 1 to 5, or "derive from tasks"), `journeyNote` (one sentence), and per-module `introduction` (eight text fields). T18 gains a short section on each. All defaults must produce a truthful page with no operator input.

### 3.9 Gate

Extend `g7_gate_assure_v1.py` (and DEFINITION_OF_DONE.json) for v1.3: expected client nav list becomes `["tracker", "documents", "jobs", "request", "statement", "guide"]`; the tracker page must contain exactly the three section headings and none of the removed test ids (`kpi-row`, `area-tiles` as built, `for-you` on the tracker); every percentage on the client side has a fraction within the same element; the eight module tiles exist and each links to its module; the Job management page has three column headings and no write control other than confirm; the Statement page links to `/value`; the old module names appear nowhere on the client side; `check_restricted.py` passes. Keep every v1.2 check that still applies. Gate must pass on the deployed URL before the build reports done.

## 4. Service support

- Source: `06_EXECUTION/build/maximus-src`. Commit as `Seagull <seagull@cast.local>` on master. `check_restricted.py` before every commit.
- Deploy to Netlify site `tessera-assure`, id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`. Record the deploy id in T17, BUILD_REPORT and R01.
- Spend: none. State in the report what was spent (time, compute, Netlify plan).
- Design: Tessera tokens per the MITMARK design standard; day palette in the client portal; status colours for status only; the tile fills are the status ramp, nothing else. Inter and JetBrains Mono.
- Content the operator has already shared for Compliance Documents is not in the job folder. The build does not invent it. If Sunray places the files in `material/lurong_documents/` before the run, upload them under the operator seat with the module set; otherwise report the section as awaiting her files.

## 5. Command and signal

- The build session is the only writer of R01 while this build runs. Append DC-33 onward for build-time decisions. Seagull's DC-32 is already in.
- Write `06_EXECUTION/BUILD_REPORT.md` section v1.3, `T14_DEFINITION_OF_DONE_V1_3.md`, `T17_BATTLE_INSPECTION_V1_3.md`, and update `07_HANDOVER/T18_OPERATOR_BRIEF.md` to v1.3.
- Stop conditions: the gate fails after two fix passes; a change would let a client-side control write anything other than confirm; the file cap or any Netlify limit forces a design change; the client name is found anywhere outside the restricted file. On a stop, write what is done, what is not and why, one line each, and wait.
- Deviations that keep the intent are the build's to take and record; deviations that change what the client sees beyond this order are not.

## 6. Timings

H-hour: 2026-09-28, live by 1800 BST. Report to Sunray on deploy.

## 7. Not in this order

- Answering the 18 Sep client confirmation (the operator's).
- Changing demo passwords or rotating SESSION_SECRET (MITMARK's; do before the client sees it).
- The Anthropic key (Sunray's).
- Policies for modules 2, 5 and 7; second organisation; non-UK jurisdictions.

## 8. The operator's feedback, transcribed (28 Sep 2026)

Email: three sections only on the Compliance Tracker (Journey, Overall compliance status, Upcoming), other sections removed; documents for Compliance Documents already shared; Jobs to be renamed Job management with the board design; Requests and clocks all good; keep Statement for the CFO as the information to the CFO, and make Value the module on her account to give the input on the statement; add one more function, an AI assistant to help answer quick questions.

Deck, slide 1 (Journey): "Current stage: Implementation"; "Below chart reflects on where we are at the data protection maturity journey. The journey status is reflecting the (yearly) deliverables and will be adjusted accordingly."; a curved path with five nodes: Assessment and discovery (green), Planning and strategy (green), Implementation (orange), Ongoing monitoring (grey), Reporting and review (grey).

Slide 2 (Overall compliance status): "Compliance score: x% (metrics to reflect on the score), as at dd/mm/yyyy"; "There are 8 compliance modules under Data Protection function and the compliance score is reflecting their overall compliance status. Each module below can be expanded via clicking into it and the compliance of each module is reflected in the RAG status shown below."; eight rounded tiles in two rows of four, filled green, amber or red: DPO Registration, Data Tracker Compliance, Data Retention Practice, Policy Review, Data Protection Impact Assessment, Data Subject Requests, Vendor Data Risk, Data Breach and Incident Response.

Slide 3 (Upcoming): "Below are the activities that are planned to roll out." Examples: Data protection awareness session, planned in new year 2027; ICO renewal in May 2027.

Slide 4: a mock of the eight modules expanded, each card carrying Title, Introduction (one to two sentences), Relevant documents and trackers (three linked items each), and "Compliance status: {pct}% ({RAG label})" with a bar.

Slide 5 (Job management): three columns, Not started (Staff awareness training, Vendor risk assessment, ...), In progress (RoPA development, ...), Completed (Policy review, Employee access tracker development, ...).

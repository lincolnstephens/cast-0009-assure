---
document: OPERATOR_BRIEF
job: CAST-0009 ASSURE
product: Tessera Assure v1.3
version: v1.3
status: FOR THE MITMARK OPERATOR
authority: Seagull, written by the build session under T02 A6
register_id: T18
---

# Tessera Assure: operator brief

For the MITMARK data compliance officer who runs the client's DPO contract, and for the MITMARK contract lead.

**Address:** https://tessera-assure.netlify.app
**Who it is for:** you keep it. The client's Information Officer reads it. She enters nothing.

## 1. What this is

Tessera Assure is the record of what MITMARK does under the retained contract, and the statement that record produces. It has two sides.

- The **client portal** is what the Information Officer sees, in six places, in your order: Compliance Tracker, Compliance Documents, Job management, Requests and clocks, Statement for the CFO, and Quick questions. Her front page is the **Compliance Tracker**, in three sections: **Journey**, **Overall compliance status** (the score and the eight module tiles) and **Upcoming**. Each tile opens its module page. Anything waiting on her is at the top of **Job management**. The Statement links to the record behind it.
- The **admin workspace** is yours: the **Workplan**, **Jobs**, **Documents**, the review queue, the statutory clocks, the policies, the **Procedures**, the posture, the exposure alerts, **Value** (the Record, with the way to the rates), the **Record** and the **Settings**.

The product does not deliver the service. It records it, and now it also plans it, so that the Information Officer can see what she is getting, what is still to do, and what it is worth to her CFO.

The tracker answers six questions about every task, and they are the same six wherever you look: **what do I need to do, how, who, by when, is it done, and if not what is the status.**

## 2. Signing in

Two accounts exist on the demo organisation.

| Account | Sees |
|---|---|
| `demo@demo.local` | the client portal, as the Information Officer would |
| `operator@demo.local` | the admin workspace |

Both use the password set in the site's environment variables. Ask Sunray for the current value. Change them before anything is shown to the client.

## 3. The first thing to do: set the rates

Nothing on the Statement means anything until the rates are right. Go to **Settings** in the admin workspace.

| Field | What to put in it | If you leave it |
|---|---|---|
| Client display name | The name as it should appear on the Statement | It says "Demo Organisation" |
| Information Officer | Her name, or just "Information Officer" | A role is enough, and is safer |
| Her loaded hourly rate | Her salary cost per hour including on-costs | It uses £45, and the Statement says the rate is an assumption |
| Contractor day rate | What a contractor would charge for the same work, ex VAT | It uses £650, the December 2025 benchmark |
| Retainer fee per month | The monthly retainer, ex VAT | **The Statement shows no ratio at all** and says why |
| MITMARK contract lead | Who signs the Statement | It says "MITMARK contract lead" |

The retainer fee is the one that matters most. Without it the Statement cannot say what the work is worth against what the client pays, which is the whole argument.

Her rate is an assumption until she confirms it. Ask her for a band rather than a figure if she would rather; a band is enough. The Statement says plainly that rates are assumptions until the client confirms them, and it should keep saying so until she has.

## 4. Service line status

Also in **Settings**. Set each of the twelve lines to Live, Available, Recommended or Not in scope. This drives the order the lines appear in and tells the Information Officer what she is and is not getting. Set it honestly: "Live" means MITMARK is actually delivering it under the retainer.

## 5. Keeping the Record

**Record**, in the admin workspace.

Entries arrive two ways.

**Automatically.** Four things create an entry without you typing it:
- closing a statutory clock (a data request or a reported concern),
- approving a policy version,
- releasing an answered Policy Guide question from the review queue,
- completing a defence-file export.

Each arrives with a default hours figure for its service line and with you as the reviewer, because you closed the work. **Check the hours.** The default is MITMARK's assumption about how long it would have taken her, not a measurement. Edit it to what you actually believe.

**By hand.** Use "Add an entry" for everything else: the monthly report, an ad hoc question answered, a vendor DPA, a board briefing. One line, plain, past tense, what MITMARK did. Then the outcome, the hours of her time it replaced, and your name as reviewer.

Rules that the product enforces and you should not try to get round:
- An entry with no named reviewer does not reach the client.
- An entry marked illustrative does not reach the client unless you have switched on "show illustrative" for a demo, and then a banner says so on her screen.
- Every figure the Information Officer sees traces back to an entry with a reviewer. That is the point. A figure with no entry behind it is a claim, and claims are what the CFO is sceptical of.

## 5a. The workplan (v1.1)

**Workplan**, in the admin workspace. This is the heart of v1.1 and it is yours.

The workplan is **MITMARK's workplan for the client**. You own it. The client can see it, and can confirm the tasks you have assigned to a client role. The client cannot create, edit, reorder or close anything. That is deliberate and it is what keeps A7 intact: she has no system to maintain.

### Applying the library

The task library holds 28 obligations across the eight areas, drawn from UK GDPR and the Data Protection Act 2018. **Apply library** takes a start date and expands the recurring ones into dated tasks for the next twelve months. A monthly task becomes twelve, a quarterly one becomes four, an always-on duty stays as a single undated obligation.

Re-applying is safe. It adds what is missing and never overwrites an edit you have made. If you have changed a due date or a status, re-applying leaves it alone.

The library is marked DRAFT until Lurong has read it. Go through it once: the wording of each task, who owns it, and how often it really happens at this client. Change what is wrong. It is a starting point, not a standard.

### The six columns

Every task table, on your side and hers, shows the same six columns in the same order: **What, How, Who, When, Done, Status**. They answer the six questions Rich asked for. They are not renamed and not reordered.

- **How** is the one line she reads to know what the task actually involves. Write it in plain words. It is not a restatement of the title.
- **Who** is MITMARK or one of the client roles. Assign to a client role only when the client genuinely has to do it: paying the ICO fee, running a deletion, forwarding a request. Everything else is yours.
- **When** is the due date. An always-on duty has none, and that is correct.
- **Done** is the date you closed it.
- **Status** is yours. It is the only status the client ever sees.

### Closing a task

Closing a task as done creates a Record entry automatically, with the default hours for that task, reviewed by you. That is how the workplan feeds the Statement: work you do against the plan becomes value she can show her CFO, without you typing it twice.

Client-owned tasks book zero hours. MITMARK did not do that work and must not claim it.

### When the client confirms

A task you assigned to a client role shows her a **Confirm** button. When she uses it, the task does not change status. It appears in your **Review queue** as a client confirmation, and you accept it or reopen it. Your acceptance is what closes it.

This is the same rule as everywhere else in the product: nothing reaches the record without a MITMARK decision behind it.

## 5b. Procedures

**Procedures**, in the admin workspace. One card per area.

Each area page in the client portal has a "How we do it" section. Until you publish a procedure for that area, she sees a card saying **"Procedure to be published by MITMARK"** with your target date. That is honest and it is better than a generic document dressed up as hers.

Set the target date so the card says something. Publish the procedure when it is real.

## 5c. The tracker settings

**Settings** gains four things that feed the client's front page.

| Field | What it drives |
|---|---|
| Jurisdiction | The regulation line in the header. Only the United Kingdom has content in this version. |
| Staff in scope | The denominator of the Training tile. Blank means the tile says "not recorded", which is the truth. |
| Staff trained | The numerator. |
| Client roles | The list you can assign a task to. |
| Workplan target date | Shown on her portal while it is still empty. |

Do not guess the staffing numbers. A tile that says "not recorded" is worth more than a tile that says something you made up, and the whole product rests on that distinction.

### What the overall figure means

The front page says something like "12 of 18 obligations met, 67%, as at 17 September". The denominator is every task that has actually fallen due, plus the always-on duties. A task due next month is not counted, because it is not yet an obligation she has failed to meet. Tasks you mark **not applicable** drop out of the count entirely.

The fraction always appears beside the percentage. If anyone asks what the number rests on, the answer is on the page.

## 5d. Compliance Documents (v1.2)

**Documents**, in the admin workspace. The client sees the same repository read only.

Three sections, because they answer three different questions.

| Section | What goes in it | Who fills it |
|---|---|---|
| Policies | The approved policy pack, with its version history | **Nobody. It fills itself** from the policy pack as you approve versions |
| Procedures | How MITMARK does the work in each module, and the process map | You, from the Procedures page |
| Trackers | The registers: processing activities, employee access, data requests, breaches, vendors, transfers | You, here |

You add a tracker either as a **file** or as a **link**. A link is better for anything that changes weekly: link the live spreadsheet and the client always sees the current one. A file is a point-in-time copy, so give it an as-at date.

**There is a file size limit and it is lower than you might expect.** Files pass through the site's function layer, which rejects anything much over 4 MB once encoded. The interface tells you the working limit and refuses a file over it rather than failing halfway through an upload. Anything larger goes in as a link. That is not a shortcoming to work around: a 20 MB register is better linked than copied anyway, because the copy goes stale the day you upload it.

The client can open and download. She cannot upload, edit or delete anything, and there is no control on her side that suggests otherwise.

Set the **documents target date** in Settings. Until a section has anything in it, the client sees what MITMARK will publish there and when. An empty section with a date is a promise; an empty section without one looks like neglect.

## 5e. Jobs (v1.2)

**Jobs** is every task across all eight modules in one list, on both sides. It is the page Lurong asked for: one place to see what is outstanding rather than eight.

Three groups, in her words:

- **Not started**
- **In progress**. This includes blocked tasks, each carrying a "blocked" flag. Blocked is not a fourth column; it is a thing to go and unblock.
- **Completed**

Tasks marked **not applicable** are not listed to the client, but the count is shown, so nothing disappears silently.

The tasks waiting on the client sit at the top of her page with the confirm control. The rest she reads. The same six columns as everywhere else.

*Changed at v1.3: see 5h. The page is now a three-column board called Job management, and the Guide has its own menu item, Quick questions.*

## 5f. What changed in the modules at v1.2

Two modules were re-scoped. Nothing was deleted and no task was lost: existing tasks moved with their identity.

| Module | Was | Now |
|---|---|---|
| 2 | Data mapping and processing records | **Data tracker review**: the RoPA plus the registers: employee access and international transfers |
| 4 | Cross-border data transfers | **Policy review**: the pack reviewed one policy at a time, plus the privacy notice |

The old cross-border work did not vanish: the transfers register review moved into module 2, and the safeguard that must be in place before a new transfer starts moved into module 7 with the rest of the vendor and contract work.

The annual "policy suite refresh" was one task covering six policies, which is not how you actually work. It is now six tasks, one per policy, two hours each. The old task is retired from new applications but still exists, because live tasks point at it.

## 5g. The overall figure changed at v1.2

It now reads **"Nothing overdue"** or **"{k} overdue or blocked"** beneath the fraction.

The change is in how continuous duties count. A duty like "handle every request within one month" has no date, so it can never be overdue. Before, it counted as unmet until you signed it off for the period, which meant a client who was entirely up to date still opened on a low number. Now it counts only when there is something live against it: an open clock, or something waiting in your review queue.

The stricter view is still yours. **Settings** has a toggle: "Signed off this cycle" counts every continuous duty until you close it. Use it to see what you have not yet signed off. The client always sees the overdue view.

## 5h. What changed at v1.3 (your second round of feedback)

**Four things to do once, in Settings, under "Journey and module introductions".** Each has a sensible default, so the page is truthful even if you do none of them.

1. **Set the current stage of the journey.** Your deck says *Implementation*. Until you choose, the stage is worked out from the tasks: it is the phase holding the earliest open due date. Today that gives *Assessment and discovery*, because an early-phase task is still open. Choose "derive from tasks" to go back to that at any time. The client cannot change it.
2. **Check the sentence beneath the stage.** The default is: "This shows where the organisation is on its data protection journey. The stage reflects the year's deliverables and is adjusted as they are met."
3. **Write an introduction for each module**, one or two sentences. Each field shows its default beneath it. Leave it blank to keep the default.
4. **File the documents you have already shared.** They were not in the job folder, so nothing has been uploaded. Each document filed against a module under Documents appears on that module page under "Relevant documents and trackers". Until then the page says "None filed yet".

**The tracker is three sections.** The six measures, the areas panel and "For you" have gone from the front page.

- **Journey:** the five phases as a path. Done phases are green, the current one is amber and marked "Current", and future phases are grey.
- **Overall compliance status:** "Compliance score: 38% (3 of 8 obligations met)", then the date, the basis and the overdue line, as before. The percentage never appears without its fraction. Then the eight modules as coloured tiles, each showing "{done} of {total} done".
- **Upcoming:** the next eight open MITMARK tasks that are due today or later. **To put an activity here** (an awareness session, the ICO renewal), add it to the Workplan with a due date. There is no second list to keep. Overdue tasks are not shown here because they are not "planned". They are in the overdue count and on Job management.

**Module names.** Three modules have your wording: 2 is *Data tracker compliance*, 3 is *Data retention practice* and 8 is *Data breach and incident response*. Tasks carry the module number, not the name, so nothing moved. There were 65 tasks before and 65 after, in the same modules.

**Module pages** now open with the introduction, the relevant documents, and "Compliance status: {done} of {total} done, {pct}%". The task table follows, then links to the other seven modules. What the law asks, how we do it, and the history sit below those links.

**Job management** has three columns: Not started, In progress and Completed. Each card shows the task, its module, its due date and its status. A blocked task sits in In progress with a "Blocked" flag. **Waiting on you** sits above the board with the confirm control, which is still the only thing the client can do anywhere in the portal.

**Value** is now on your side. The admin menu item "Value" opens the Record with a link to the rates in Settings, because together they are the input to the statement. The client keeps the **Statement for the CFO**, which links at its foot to "The record behind this statement".

**Quick questions** is the Policy Guide under your name for it. It says what it does: answers come from the approved policies and procedures, and anything they do not answer goes to MITMARK. There is still no working API key, so it answers by matching the approved text, and the wording is true either way.

## 6. Importing the v0.1 export

If you have a record file from the earlier single-page version, **Record** has an import.

1. Open the old page and use "Export record (JSON)". You now have a `.json` file.
2. In **Record**, choose "Import record", and pick that file.
3. Read what it tells you. It reports how many entries it took, how many it skipped, and why it skipped them. Entries with no named reviewer are imported **unreviewed**: they will not reach the client until you review them.

The import also brings across the rates and the service line statuses from the old file. Check Settings afterwards.

## 7. Reviewing

**Review queue**, in the admin workspace. Amber Policy Guide answers, export requests, alerts and intakes wait here. Nothing reaches the client until you decide. Every decision is recorded under your name in the audit log.

This is the mandatory MITMARK review. It has not been relaxed and should not be.

## 8. The Statement

**Value** in the client portal, or **Record** then the statement view in admin.

The Statement is the thing she forwards to her CFO unedited. It states, for the period:
- what MITMARK did, by service line, with the hours of her time it replaced,
- what that would have cost two ways: her own time at her rate, and a contractor at the day rate,
- the retainer for the period, and the two comparators against it, **only if you have entered the fee**,
- the statutory and governance deadlines met,
- its own limitations.

Print it with "Print or save as PDF". It prints as a plain document: no navigation, no colour, no product furniture.

Do not edit its wording. It was written to be forwardable to a sceptical finance reader and it says what it does not know as plainly as what it does. That is why it is credible. If it reads as dry, that is deliberate.

## 9. What not to put in it

- **No client name** unless you have set the display name deliberately and Sunray has cleared it. The address, the page title and the source carry no client name.
- **No personal data of any data subject.** Entries describe the work, not the people. "Handled a data request from a former member of staff" is right. A name, a case reference or any detail that identifies the person is not.
- **No marketing.** The client side has none and should keep none.

## 10. A second client

The product is multi-tenant. A second retained client is a second organisation, not a second build and not a second site. Ask Sunray to have one added; it is a configuration step, not development.

## 11. What this version does not do

- Entries are held on the site, not in a shared spreadsheet, and there is no email digest yet. Both are on the "Where spend would help" list in the client portal, with what they would cost.
- The Policy Guide answers from the approved policies only. If the Anthropic API key is not set on the site it falls back to keyword matching, which is noticeably worse. Check with Sunray that the key is set before showing it to anyone.
- The posture and the exposure alerts carry demo data and say so on screen. Do not present them as live monitoring.

## 12. If something looks wrong

Nothing in the Record is deleted quietly. The audit log holds every decision under the name of whoever took it. If a figure looks wrong, find the entry behind it first; the entry is the record, and the page only shows it.

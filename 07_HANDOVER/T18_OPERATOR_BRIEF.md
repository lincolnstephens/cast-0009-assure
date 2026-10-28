---
document: OPERATOR_BRIEF
job: CAST-0009 ASSURE
product: Tessera Assure v1.10
version: v1.10
status: FOR THE MITMARK OPERATOR
authority: Seagull, written by the build session under T02 A6
register_id: T18
---

# Tessera Assure: operator brief

For the MITMARK data compliance officer who runs the client's DPO contract, and for the MITMARK contract lead.

**Address:** https://assure.tessera-monitor.com
**Who it is for:** you keep it. The client's Information Officer reads it. From v1.7 she may offer you a document, which nobody sees until you accept it; she still enters nothing else.

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

## 4. Module status

Also in **Settings**, under "Module status". Set each of the eight modules to one of four statuses:
- **Live**
- **Available**
- **Recommended**
- **Not in scope**

The Statement's first part lists the eight modules with these statuses and each module's one line, so the Information Officer can see what she is and is not getting. Set it honestly: "Live" means MITMARK is actually delivering that module under the retainer.

A new organisation starts with every module **Available**, never Live. The client organisation starts that way too, so set its eight statuses before the meeting.

Until v1.7 this was "Service line status", with twelve lines from the archive. The twelve lines are gone from every page the client sees. The Record now speaks in modules (see 5l).

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

## 5i. View as client (v1.4)

**What it is for:** seeing exactly what the Information Officer sees before you send her anything, or when she asks about something on her screen.

**How to open it:** choose the client account at the top of the admin workspace, then choose **View as client** at the foot of the menu. The client portal opens with her six menu items and every page beneath them, built from her data by the same code that serves her. A dark bar across the top reads "Viewing as the client's Information Officer. Read only." Choose **Return to admin** in that bar to go back. Going to any admin page also ends the view.

**It is read only.** Her confirm buttons, the Guide's Ask button and the request form's Submit are shown, so you can see they exist, but they are disabled and marked "Read only in client view". The server refuses any change made from this view, whatever the screen shows.

**It is logged.** Opening client view writes one entry to the organisation's audit log with your name, once per sign-in session, not once per page.

**Two things you may notice:**
- If she has never opened Quick questions, you see an empty conversation there, because she has none yet.
- The overall figure is always her figure. Your "Signed off this cycle" setting does not change what you see here, because it does not change what she sees.

**Module tile colours changed at v1.4.** Green and amber tiles now carry dark text and red tiles white text, so every tile is readable (4.5:1 or better). A grey tile, for a module with nothing open, also carries white text.

## 5j. People, organisations and the seed (v1.5)

### Creating a user and handing over the password

1. In the admin workspace, open **Users**.
2. Enter the email address and choose the role:
   - **Manager:** sees every organisation.
   - **Client user:** belongs to one organisation, which you choose.
3. Add a display name if you want one, then choose **Create user**.
4. A one-time password appears once, in a box marked "Shown once". **Tessera Assure does not send email.** Pass the password on yourself, by MITMARK's usual secure channel. It is never stored in readable form and cannot be shown again. If it is lost, choose **Reset password** on that user's row to get a new one.
5. **Disable** stops someone signing in and ends every session they have open. **Re-enable** lets them back in. There is no delete.
6. The product will not disable the last active manager.
7. Every one of these actions is written to the audit, naming you and the user's id. The audit never records a password or the user's email address.

### First sign-in

- **One-time password:** someone signing in with one sees only "Set your password" until they choose their own. The rule is stated on the screen: at least 12 characters. The server enforces it too, so nothing else opens until the password is set.
- **Changing a password later:** anyone can change their password from **Change password** in the header, on either side. Doing so signs them out everywhere else.

### Organisations and the switcher

- **Creating one:** **Organisations** lists every organisation with its users and tasks. Creating one takes a display name (as it should appear on the client's pages), a jurisdiction and, optionally, a regulation label for the tracker's header. A new organisation starts empty.
- **Applying the task library:** **Apply task library** is a separate step. It first tells you how many tasks it will create, and writes nothing until you confirm.
- **The switcher:** the **Organisation** select at the top of every admin page decides which organisation you are working on. Every admin page, and **View as client**, acts on the one selected. The choice is remembered until you close the browser tab. Each organisation has its own settings, including rates, journey stage and module introductions.

### Running the seed

The seed gives one organisation its starting content from a manifest file. You run it from the job's build folder on a machine with the source:

```
set ASSURE_SEED_EMAIL and ASSURE_SEED_PASSWORD to a manager account (in the shell only)
pnpm --filter @maximus/server seed-organisation -- --url https://tessera-assure.netlify.app --org <organisation id> --manifest <path>/manifest.json --dry-run
```

- **The dry run** reports how many tasks it would create, and which document files are present or missing. It writes nothing.
- **The real run:** run the same command without `--dry-run`. It writes the tasks and the journey stage, then files each document found next to the manifest, reporting counts before and after.
- **A missing file** is logged and skipped; you can file it later from **Documents**.
- **Running it twice:** the seed refuses to run against an organisation that already has tasks, unless you add `--replace`. That replaces the tasks, but it does not remove documents already filed, so re-running files them again. Delete duplicates from **Documents**.
- **The organisation id** is shown under each name on the **Organisations** page.

### The manifest format

The format is the one in Seagull's `material/lurong_documents/manifest.json` (FRAGO 05, as amended 28 Sep); the command reads that file as it is. It is one JSON file, placed next to the document files it names. Owners are roles, never people's names, and no title carries the client's name.

```
{
  "manifest": "a line saying what this is and who wrote it",
  "organisation": {
    "displayName": null,
    "jurisdiction": "UK",
    "regulation": "UK GDPR and Data Protection Act 2018",
    "settings": { "journeyPhase": 3, "journeyNote": "one sentence" }
  },
  "defaults": {
    "source": "handover-2026-03",
    "notesUndated": "note given to any open task with no date"
  },
  "tasks": [
    {
      "ref": "H01",
      "area": 4,
      "phase": 3,
      "title": "...",
      "how": "...",
      "ownerType": "mitmark",
      "ownerRole": "MITMARK data compliance officer",
      "dueAt": null,
      "recurrence": "once",
      "status": "not_started",
      "notes": "optional",
      "source": "optional"
    }
  ],
  "clocks": [
    { "ref": "C01", "kind": "registration_renewal", "dueAt": "2027-03-21", "note": "...", "taskRef": "H02" }
  ],
  "documents": [
    {
      "file": "P01_Data_Protection_Policy_v1_2026-03-31.docx",
      "title": "Data Protection Policy",
      "section": "policies",
      "area": 4,
      "status": "approved",
      "version": "1",
      "approvedAt": "2026-03-31",
      "description": "one plain line about the document's state"
    }
  ],
  "notSeeded": ["what the manifest deliberately leaves out, for the record"]
}
```

**Organisation:**
- `displayName: null` leaves the organisation's name as you created it.
- `regulation` becomes the regulation line on the client's tracker.
- `journeyPhase` and `journeyNote` set the journey.

**Tasks:**

| Field | Values |
|---|---|
| `ref` | Kept on the task (its source reads `<source>:<ref>`), so every task traces back to its line in the plan |
| `area` | The module, 1 to 8 |
| `phase` | 1 to 5 |
| `ownerType` | `mitmark` or `client` |
| `status` | `not_started`, `in_progress`, `blocked`, `done` or `not_applicable`. Nothing is marked `done` unless the source shows it done |
| `dueAt` | `YYYY-MM-DD` or `null`. An open task with no date takes `defaults.notesUndated` as its note, unless it has its own `notes` |
| `recurrence` | `once`, `monthly`, `quarterly`, `annual` or `always-on` |

**Clocks** are dated obligations that belong to a task (`taskRef`). They are not statutory clocks, which are reserved for data requests and breaches:
- If the task is open, the clock sets its due date and adds its note.
- If the task is already done, as with the March 2026 registration renewal, the clock becomes one new open task with the clock's date. That way the next renewal appears under Upcoming instead of sitting on a completed task. This is why the seed can create one more task than the manifest lists; the dry run reports the true number.

**Documents:**

| Field | Values |
|---|---|
| `section` | `policies`, `procedures` or `trackers` |
| `area` | 1 to 8, or `null` |
| `status` | `approved`, `draft`, `published` or `template` |
| `version`, `approvedAt` | For an approved document. The client sees "Version 1, approved 31 March 2026" |
| `description` | Shown to the client beneath the title, so a template or a draft reads as what it is |
| `clientVisible` | Optional; `false` files it on your side only. Default `true` |

A tracker filed as "Employee Access Matrix" is recognised as the employee access tracker register, so it does not also appear as "Not yet filed".

`06_EXECUTION/gate/fixtures/seed_manifest_fixture.json` is a copy of this manifest (it contains no client name), and the gate seeds its own test organisation from it on every run.

### What the client sees on day one

The organisation's own name on every page, and its own workplan and documents. The journey shows the stage from the manifest. There are no illustrative Record entries: a new organisation starts with "show illustrative" off, so the Record and the Statement are empty and say so until real entries are added. Nothing is sent to anyone. The client user's account exists only when a manager creates it, and her one-time password reaches her only by the route Sunray chooses.

### Two points about the secrets step that follows

- **Changing `SEED_CLIENT_PASSWORD` and `SEED_OFFICER_PASSWORD` in Netlify will not change the demo accounts' passwords.** Those variables are read only by the very first seed of an empty store, which has long since run and will not run again. To change or retire the demo accounts, use **Users**: reset their passwords, or disable them.
- **Rotating `SESSION_SECRET` signs everyone out, and that is intended.** Audit entries written before v1.5 contain raw session ids, and rotating the secret makes every one of them worthless. Since v1.5 the audit records only a one-way reference to a session.

## 5k. The module pages as you drew them (v1.6)

Every module page now follows your deck, top to bottom: the name and its one line; **Useful links**; **Compliance status**; **Compliance journey**; **Counts** (modules 5 to 8); **Jobs**; then what the law asks, how we do it and history. The descriptions under each name are still the v1.3 ones, because your deck's wording is not in the job folder. Send the slide text and it goes in as the default, or type your own now in **Settings**, module introductions.

### Useful links

The tiles are made from what you have filed. Nothing appears that is not stored.
- **Registers** come first. Each module shows the registers that belong to it. A register you have not filed yet still shows, marked "Not yet filed", and opens a card saying so. The list is yours now: Record of processing activities, Employee access tracker, Cross-border transfer assessment, Information security risk register (new), Vendor log, Data request log, Breach register. The Vendor log also shows on module 2, as on your slide. A register filed under its old name still fills its place: Employee access matrix, International transfers register, Vendor list and Incident log all count.
- **Policies** come next, each with its version and whether it is approved or a draft. Module 4 shows all four policies, whichever module each was filed against.
- **Other documents** you have filed against the module follow, such as templates and guidance.
- **Links** come last. To add one, file a document in **Documents**, choose "link", pick the module and give the address. The two ICO links on module 1 went in this way.

Beneath the tiles the same items are repeated as a numbered list, for phones and screen readers.

A document's status (approved, draft, template) is read from what you filed. The nine documents filed on 29 September carry it in their title or description line ("Draft.", "Approved policy, version 1"), and the page reads it from there.

### The retention schedule

**Settings**, "Retention schedule, module 3". Each row is a category of data and how long it is kept. Every row shows as a tile on Data retention practice, with the period on the tile and on the card it opens. Add, change or remove rows and press "Save schedule". The seven categories from your deck were loaded on 30 September. The client reads the schedule but cannot change it.

### The compliance status, and how it is worked out

Each module shows "{pct}% ({n} of {m} on time)", with "and {k} late" when any were late, and a colour with its word beside it. This is the rule Sunray is taking into your conversation about the score. It stands until that conversation settles something else.
- Only tasks with a date count. A task with no date is not in the score, so adding undated tasks cannot move it.
- A task counts once its date has passed, or once it is done, even if done early. Anything with a date more than twelve months ago drops out.
- Done on or before its date counts in full. Done late counts 70 per cent if within 30 days of its date and 50 per cent beyond. Still open after its date counts nothing.
- Green is 90 and above, amber 60 to 89, red below 60. With nothing dated, it says "No dated obligations yet".
- A task the seed closed (your "Completed" rows) counts as done on its date, because the seed records when it ran, not when the work was done. A task you close in **Workplan** is dated the day you close it. Close work on the day it is done, or the score will count it as late.

The front page takes the mean of the module scores and shows how many modules are green: "Compliance score: {pct}% ({k} of 8 modules green)". The eight tiles show each module's score in its colour. The overdue count is beneath, as before.

### The compliance journey

This line is made from the module's dated tasks and nothing else. There are at most six milestones, the oldest on the left. Done ones are green. The next one is amber if it is overdue and grey if not. Later ones are hollow. Date a task in **Workplan** and it joins the line. A module with no dated task says "No dated milestones yet."

### The Figures form

**Figures**, in the admin menu. Some counts are not records in the product yet: DPIAs and project risk assessments (module 5), vendors by severity and by compliance (module 7), and incidents by severity and by state (module 8). Enter these counts here, once a month or whenever they change.
- Each save is a new report, kept with your name and the time. The client sees the newest one with "Reported by MITMARK on {date}". She never sees your name there.
- Leave a count empty if you do not know it. The client then sees "No data yet", never a zero.
- Data subject requests (module 6) and concerns reported through the product (module 8) are counted from the product's own intakes and clocks, and say "From the request log". You do not enter those.
- The client can see the figures but cannot change them.

If you would rather these counts came from registers than from your monthly entry, that is the next step (T23).

## 5l. The working programme (v1.7)

v1.7 answers your fourth round of feedback. Two of your points were View as client working as designed: every write is refused there, so "Submit request" and "Ask" looked switched off. Those two now behave differently, as set out below. The other three were real changes, and are here too.

### Documents both ways

- **You download.** Every filed file on **Documents** has a Download control. It gives you the stored file with its original name and type, in a new tab. A link opens its address. Each download is written to the audit log.
- **The client uploads.** On her Compliance Documents page she has "Upload a document". She gives:
  - a file (up to 4 MB) or a link;
  - a title;
  - which module it belongs to;
  - one line of what it is.

  She can also say it is a new version of something already published.
- **Nothing she sends is published or counted until you accept it.** Until then it sits in two places:
  - on her page, as "Submitted, awaiting MITMARK review";
  - on yours, in the review queue, under "Submitted by the client" on **Documents**.
- **Deciding it.** In the review queue, download it and read it, then do one of two things:
  - **Accept and publish:** choose the section (Policies, Procedures or Trackers) and it is published there.
  - **Return:** give her a one-line reason, which she sees beside it.
- **New versions.** When you accept a new version, it replaces the earlier one on her side. The earlier one stays on yours, marked "Superseded by a newer version", with its history.
- **What she cannot do.** She cannot change, replace or delete anything she has sent or that you have published. A correction is a new upload, and it goes through the queue again.

### The review queue flags what has waited

Any item that has waited 5 working days or more shows an amber flag: "Waiting n working days". The rule from v1.0 stands: the system that asks the client for things must answer her. See the weekly routine below.

### Job management is a board you can drag

**Jobs**, in your menu, is now the same three-column board the client sees:
- **Not started**
- **In progress**
- **Completed**

**Moving a task.** Drag a card to another column and its status changes, the move is written to the audit log, and her tracker follows.
- Dropping on Completed dates the task today.
- Moving a task out of Completed clears its date until you close it again.
- A task books its work on the Record once only, however often it is moved.

**From the keyboard.** Each card has a status select that does the same as dragging.

**Blocked** is reached from the card ("Mark blocked") or the select, never by dragging.

**Workplan** keeps the table editor as before.

**The client's own board** is unchanged: she reads it and cannot drag. In View as client nothing can be dragged either, and the banner says so. Run the monthly review from your own board with her watching, or show her the board in View as client.

### Ask and Submit request in View as client

- **Ask works in View as client.** It answers exactly as it would answer her, and nothing is saved, sent or started.
  - A question that would go to you says "Client view: nothing was sent".
  - A question that would start a statutory clock says "Client view: nothing was started".
- **Submit request is still refused in View as client.** The page now says why: "Read only in client view. The client submits requests from her own sign-in." Confirm says the same of confirming.

### The test seat

To try her side end to end without touching her account, create a **test seat** for the organisation:
1. In **Users**, create a client user for the organisation.
2. Tick "Test seat".

The Users list shows it as "Test seat", and the audit log says so. Rules:
- There is **one active test seat per organisation**.
- The flag cannot be taken off. When you are finished with it, disable it.

Sign in as the test seat and do what she would: raise a request, confirm a task, ask a question, upload a document. Everything it does is tagged test:
- its requests show "Test seat" on **Intakes and clocks**, and closing one books nothing on the Record;
- its confirmations and uploads show "Test seat" in the review queue. Accepting a test confirmation changes nothing in the workplan. Accepting a test upload publishes it to no client;
- nothing it does reaches the Record, the counters, the tracker figures or the Statement;
- the client never sees anything it does.

Walk the product with it before the meeting.

### The Record in eight modules

Every Record entry now belongs to a module, 1 to 8. Entries made before v1.7 were moved from their archive line by a fixed table, one line to one module:

| Archive line | Module |
|---|---|
| DPIAs | 5 |
| ROPA management | 2 |
| Policy and procedure suite | 4 |
| DSAR support | 6 |
| Breach advisory | 8 |
| Vendor due diligence and DPAs | 7 |
| Staff training | 4 (nearest) |
| Monthly threat intelligence report | 8 (nearest) |
| Board briefing | 1 (nearest) |
| Quarterly log review | 8 (nearest) |
| Annual compliance cycle | 4 (nearest) |
| Ad hoc assurance and advisory | 1 (nearest) |

Counts and hours were checked either side and are the same. If an entry sits in the wrong module (for example, a retention schedule refresh booked under the old policy line now shows under module 4), change its module in **Record**.

The work the product books for you lands in modules as follows:
- a closed data request lands in module 6;
- a closed concern lands in module 8;
- an approved policy and the defence file land in module 4;
- an answered Guide question lands in module 1.

**Value** and **Record** group by module.

### What Quick questions reads

Quick questions now reads three things:
- the approved policies, as before;
- the published **procedures**;
- the published **trackers** (registers).

The text of every .docx and .xlsx you file is extracted when you file it. Your nine files were read on 13 October. Links are never read.

**Not searchable.** If a file cannot be read, it is still filed, and **Documents** marks it "Not searchable" with the reason, on your side only. A PDF is marked not searchable on this deployment (see 11).

**Policy files are not used.** The four policy files under Policies are read but not used for answers. Three are drafts, and the order limits answers to approved policies. The approved policy pack is what answers.

**How it answers.** Answers come from the matching passages, each cited by document and section. Today there is no working model key (11), so Quick questions shows the passages themselves under the line "No AI answer is switched on…", with where each comes from. Beneath them is "Send to MITMARK", which puts the question in your queue as any unanswered question would.

When a working key is set, the model writes the answer from those passages only and cites them. The page's own wording changes to match whichever is live.

### Weekly routine

Once a week, in this order:
1. **Review queue.** Clear anything with an amber flag first. Then decide the rest: submissions, confirmations, unanswered questions, requests.
2. **Documents.** Check for anything marked "Not searchable" and re-file it if it should be read.
3. **Jobs.** Move the board to where the work actually is. Close work on the day it is done.
4. **Figures.** Update the counts if they changed.

## 5m. The client's organisation, ready for her (v1.8)

### What has been set for you

On 14 October the build set the client's organisation for first use, as Sunray ordered:
- **Name.** The organisation's name, its display name and the name on the Statement are the client's trading name, as on its logo. Sunray decided this.
- **Information Officer.** Set to the role, "Information Officer". Change it to her name in **Settings** if she wants it.
- **Contract lead.** You, with your title, as the Statement's signatory.
- **Module status.** All eight are **Live**, because you have MITMARK work in every module. Confirm each one, or change it, in **Settings**.
- **Fee.** Nothing entered. The Statement keeps saying the fee is not entered until you enter it after the meeting. The hourly rate and the day rate still show the house figures (£45 and £650); check them when you enter the fee.
- **Logo.** The client's logo, on its account only.

Nothing else was touched. The 19 tasks, the 11 documents, the links, the journey stage and the retention schedule are as you left them. The three changes are in the audit log under the manager's name.

### Her logo, and how to change it

**Organisations** in the admin workspace now has a **Logo** column:
- **Upload logo**, **Replace logo** and **Remove logo** act on that row's organisation only, whatever the switcher says.
- A logo is a PNG or SVG of up to 500 KB.
- An SVG that carries scripts or links to outside files is refused; save it as a plain SVG or a PNG.

The logo is kept with the organisation, never at a public address. Only her own sign-in, and you in **View as client** for her organisation, can load it.

Her portal shows the logo at the top of the menu and in the page header, in place of the name. The name stays as its text alternative, and it is shown instead whenever no logo is set. The logo is shown as uploaded and is never recoloured. The organisation switcher stays as text.

### The MITMARK mark on her pages

Every client page now ends with "Delivered by MITMARK Intelligence" beside the MITMARK mark.

A faint MITMARK mark also sits at the bottom right of her pages, at about 6 per cent strength:
- It sits in a margin her pages keep clear, so it is never behind words, and the gate measures this on every page at every width.
- It is hidden on phones.
- It stays on the printed Statement, in the corner of the page.
- **View as client** shows it exactly as she will.
- Your admin pages carry neither the footer nor the mark.

### What to do before she signs in (FRAGO 08 3.4)

1. Open her organisation in **View as client** and read every page as she will see it.
2. In **Users**, create a test seat for her organisation. Sign in as it and walk a request, an upload and a Quick question. Accept or return what it sends; nothing it does reaches her figures.
3. Sunray rotates the session secret. Every signed-in session ends, yours included; sign in again.
4. After Sunray confirms Block 5 consent, reset her password in **Users** and give it to her yourself, in person or by phone, never in the same message as the address.

## 5n. Your four points from 15 October (v1.9)

### A note to the client when you decide

On the **Review queue**, a data request, a reported concern and a client confirmation now each have a box, **Note to the client (optional)**, beneath the item:
- Write up to 300 characters. **Approve** and **Reject** (for a confirmation, **Accept** and **Reopen**) both send it.
- She sees it as "MITMARK: your note", with the date:
  - for a request, on **Requests and clocks** beside the request;
  - for a confirmation, on the task's card in **Job management**.
- Leave it blank and nothing changes from before: she sees no note.
- A note on a test seat's item goes nowhere near her.
- The audit log records that you gave a note, not what it said.
- Document uploads keep their own **Return** reason, as before.

### Her uploads: she picks a Category, you pick the module

- Her upload form now asks for a **Category**: Policy, Procedure or Tracker. It no longer asks for a module. That matches how Compliance Documents is laid out.
- On the Review queue the card shows her category and title.
- **Accept** fills in the section from her category (Policy to Policies, Procedure to Procedures, Tracker to Trackers). You can change it.
- Accept also asks you for the **module**, 1 to 8. Nothing is published without one, because each module page lists its own documents.
- Anything she sent before v1.9 that already names a module keeps it, and the card shows that module.

### One mark per task

Wherever a task's status shows (her Job management, the module pages, your Workplan and your Jobs board):
- **Done** is a green tick.
- **Not started** is a grey circle.
- **In progress** is an amber circle.
- **Overdue** or **Blocked** is a red mark, with the word, and the state still named after it ("Overdue, in progress").
- "Due soon" is words only, after the state ("In progress, due soon"). It is never a colour of its own.

The separate coloured dot beside the status has gone. The words are always there, so colour never carries the meaning alone. Each mark has a thin dark edge, so it shows clearly on her light pages. A task marked not applicable shows a grey circle with the words "Not applicable".

### Both marks on her pages

- **Her logo** shows once, at the top of her menu. It is no longer repeated in the page header.
- **The MITMARK mark** sits at the right of her page header. On a laptop or larger it has the words "Delivered by MITMARK Intelligence" beside it; on a phone, the mark alone.
- The footer and the faint watermark are as in 5m.
- With no logo set, the top of the menu shows her organisation's name, as before.
- Your admin workspace is unchanged. **View as client** shows her header exactly as she sees it.

### More than one file for the same register (FRAGO 10)

The seven named registers on Compliance Documents (the record of processing activities, the employee access tracker and the rest) each have one slot. When you file a new version of a register under its own title:
- The slot shows the most recently updated one.
- Each earlier one stays beneath it, titled "(earlier version)", as earlier policies do.
- The module page opens the newest from the register's tile and lists the earlier version beside it.
- Nothing published is dropped. To take an old version off her view, set it to not published in **Documents**.

Until v1.9 the slot showed the first file and hid every later one. That is why her registers filed on 21 October did not show behind the 29 September templates.

### The test seat

A document the test seat uploads is published to no one, even after you accept it. To publish a real document, file it from Documents or accept the client's own upload.

### Sending her the portal

`07_HANDOVER/T27_CLIENT_QUICK_START.md` is a one-page quick start for her. Fill in the sign-in address and your own name at the top, then send it with her sign-in. Send the one-time password separately, never in the same message as the address.

## 5o. A second client, and the Global coverage tile (v1.10)

### The Jurisdictions setting

**Settings** has a new section, **Jurisdictions**. It lists the countries and financial centres an organisation operates in, one row each:
- **Id**: a short code of your choosing ("UK", "DIFC"). Each must be different.
- **Jurisdiction**: its name ("United Kingdom").
- **Hub**: the city where the client operates there ("London"). This is the label on the map.
- **Regulator** and **Law**: as the client would recognise them.
- **Filing duty**: what the jurisdiction asks of the client by way of registration or filing, as you understand it.
- **Latitude** and **longitude** of the hub, in decimal degrees (London is 51.51 and -0.13). They place the marker.
- **Status**: Not started, In progress, Done or Needs attention.

Use **Add a jurisdiction**, change any field, **Remove** a row, then **Save jurisdictions**. The whole list saves at once. The audit log records that the list was saved and how many entries it has, never what they say. Only MITMARK changes the list; the client reads it.

An organisation with no jurisdictions listed shows nothing new. The first client's organisation and the demo have none, so their pages are unchanged.

### The Global coverage tile

With jurisdictions listed, the client's **Compliance Tracker** shows a tile between Journey and Overall compliance status:
- It is titled **Global coverage** with two or more jurisdictions, **Coverage** with one.
- A world map has a marker on each hub, labelled with the hub's name. Each marker is the same mark as a task: grey circle not started, amber circle in progress, green tick done, red for needs attention. A key beneath the map names each mark.
- Beneath the map, the same entries as a table: hub, jurisdiction, regulator, law and status, the status always in words.
- Choosing a marker or a row opens a card with the name, hub, regulator, law and status, and the line "Filing duty (to be confirmed at mobilisation):" followed by the filing duty you entered.
- On a phone the map is hidden and the table carries the tile.

The status is MITMARK's work in that jurisdiction. Nothing on the tile says a filing or registration has been made. When you have done one, record it as work as usual and set that jurisdiction's status yourself; the tile does not move on its own (see the roadmap).

**Module 1 (DPO registration)** shows the same table under Useful links, titled **Registrations and filings by jurisdiction**, read from the same list.

### Creating a second organisation from a manifest

A new client is a new organisation on the same site, not a new build. The second client's organisation was set up this way on 28 October:
1. **Organisations**: create it with its trading name, the jurisdiction and the regulation line.
2. **Seed** it from a manifest file with the seed command, dry run first. The dry run lists what it would create and set, and writes nothing. The manifest can now carry, as well as tasks:
   - the **jurisdictions** list;
   - **show illustrative** (off for a real client);
   - the **Information Officer label**, a role ("Group Compliance Lead"), never a person;
   - **module status** for modules 1 to 8;
   - **rates**: the hourly rate, the day rate and the monthly retainer.
3. **Settings**: the name on the Statement, and the contract lead with title.
4. **Branding**: the client's accent colour, and its logo on the **Organisations** page. Check that the accent reads clearly on the light portal.
5. **Users**: one client user, named by role. Its one-time password is shown once; it goes to the person who will sign in, never in the same message as the address.

### Available, for a prospect

For a client whose work has not started, every module is **Available**, not Live, and the Record is empty. The Statement then says plainly that no work has yet been recorded. It sets out the service, the retainer and day rate, and "what comes next" from the dated workplan. It shows no comparators until there is work to compare. The workplan's dates are indicative until the engagement starts; move them at mobilisation.

### The restricted file

The client's identity is held in one restricted file, kept on the build machine and never shared. It now has a second entry, for the second client. The pre-commit name check reads every entry, so a second client's name is caught exactly as the first one's is. The product holds each client's name and logo in that client's own organisation only. The address, the page title, the source and the build carry no client name.

## 6. Importing the v0.1 export

If you have a record file from the earlier single-page version, **Record** has an import.

1. Open the old page and use "Export record (JSON)". You now have a `.json` file.
2. In **Record**, choose "Import record", and pick that file.
3. Read what it tells you. It reports how many entries it took, how many it skipped, and why it skipped them. Entries with no named reviewer are imported **unreviewed**: they will not reach the client until you review them.

The import also brings across the rates. Each imported entry is put in its module by the table in 5l. The old file's line statuses are kept as history only; set the module statuses yourself in **Settings**. Check Settings afterwards.

## 7. Reviewing

**Review queue**, in the admin workspace. These wait here:
- amber Policy Guide answers;
- export requests;
- alerts;
- intakes;
- the client's confirmations;
- from v1.7, her document submissions.

Nothing reaches the client until you decide. Every decision is recorded under your name in the audit log. Anything that has waited 5 working days or more carries an amber flag.

This is the mandatory MITMARK review. It has not been relaxed and should not be.

## 8. The Statement

**Value** in the client portal, or **Record** then the statement view in admin.

The Statement is the thing she forwards to her CFO unedited. Since v1.6 it has three parts, as you asked:
- **The service**: the eight modules, in order, each with its status from **Settings** and its one line.
- **What MITMARK has done**: each reviewed Record entry in the period with its module, its hours and the cost of her time, then the totals by module, what that would have cost two ways (her own time at her rate, and a contractor at the day rate), the retainer and the two comparators against it **only if you have entered the fee**, and the statutory and governance deadlines met.
- **What comes next**: the open dated tasks in the workplan, soonest first, as at the day it is printed.

Then its own limitations. It no longer opens with "n of m obligations met", and nothing in it compares what was done with the March handover plan. Until you supply the deliverables agreed in May, "what comes next" is the dated list you gave on 29 September.

Print it with "Print or save as PDF". It prints as a plain document: no navigation, no colour, no product furniture.

Do not edit its wording. It was written to be forwardable to a sceptical finance reader and it says what it does not know as plainly as what it does. That is why it is credible. If it reads as dry, that is deliberate.

## 9. What not to put in it

- **No client name** outside her own organisation's name, display name and logo, which Sunray cleared on 14 October. The address, the page title, the source and the build carry no client name. Do not put her name or the client's name in entries, task notes or document titles that could be forwarded beyond her.
- **No personal data of any data subject.** Entries describe the work, not the people. "Handled a data request from a former member of staff" is right. A name, a case reference or any detail that identifies the person is not.
- **No marketing.** The client side has none and should keep none.

## 10. A second client

The product is multi-tenant. A second client is a second organisation, not a second build and not a second site. It is a configuration step, not development; section 5o sets out how the second client's organisation was made.

## 11. What this version does not do

- Entries are held on the site, not in a shared spreadsheet, and there is no email digest yet. Both are on the "Where spend would help" list in the client portal, with what they would cost.
- **Quick questions has no working model key.** A key reaches the site from the Netlify team, and the Anthropic API refuses it (DC-19). So Quick questions shows the matching passages rather than a written answer, and says so in one sentence. It works, and it is honest. A written answer needs Sunray to set a working key on the site.
- **Uploaded PDFs are not read** on this deployment. They are filed and downloadable, and marked "Not searchable". Every file filed so far is a .docx or .xlsx.
- The posture and the exposure alerts carry demo data and say so on screen. Do not present them as live monitoring.
- **The logo is one image.** There is no separate version for dark backgrounds; the client portal is light and stays light.

## 12. If something looks wrong

Nothing in the Record is deleted quietly. The audit log holds every decision under the name of whoever took it. If a figure looks wrong, find the entry behind it first; the entry is the record, and the page only shows it.

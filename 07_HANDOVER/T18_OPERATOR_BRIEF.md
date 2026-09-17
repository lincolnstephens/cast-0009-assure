---
document: OPERATOR_BRIEF
job: CAST-0009 ASSURE
product: Tessera Assure v1.0
version: v1.0
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

- The **client portal** is what the Information Officer sees: the Policy Guide, the two intakes she already had, the policy pack, the posture, and the **Value** section, which is the Record and the Statement.
- The **admin workspace** is yours: the review queue, the statutory clocks, the policies, the posture, the **Record** and the **Settings**.

The product does not deliver the service. It records it, so that the Information Officer can see what she is getting and put a number on it for her CFO.

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

---
document: FRAGO_10_REGISTER_SLOTS
job: CAST-0009 ASSURE
version: v1.0
status: ISSUED 2026-10-23 (R01 DC-74). Product target: Tessera Assure v1.9, finished, with the register-slot fix folded in. The client is live on v1.8 with four client users since 22 Oct.
authority: Seagull, under T02 A6 and Sunray's standing delegation. Source: the operator's fault report of 23 Oct and the audit read of the same morning (DC-74).
supersedes: nothing. FRAGO 09 stands in full; this order adds one item to it and restarts the stalled build.
---

# FRAGO 10. The register slots, and v1.9 finished

## 1. Situation

The client meeting on 22 Oct went well. The operator has given sign-ins to three client staff; two have signed in and downloaded documents. The product they are using is v1.8. The v1.9 build (FRAGO 09) started 21 Oct and stalled with its code changed but uncommitted: no gate, no deploy, no report, no R01 rows. `git status` in the job folder lists the work in progress.

On 23 Oct the operator reported that uploaded documents do not show on the client portal from either side. Cause one is a product fault in `trackersSectionItems` (`packages/server/src/lib/documents.ts`): the seven named registers are matched to filed documents by title and the slot takes the first published match; every later match is dropped from the section. Her two registers filed 21 Oct were hidden behind the 29 Sep templates. Seagull closed it in the data (the templates set to not published, DC-74); the code still has the fault. Cause two is by design: the test seat's accepted uploads reach no client (DC-66 item 2).

## 2. Mission

Finish v1.9 as FRAGO 09 orders, plus the register-slot fix below. Deploy, gate, report. No new money committed. Live by 1500 BST today, 23 October.

## 3. Execution

### 3.1 Register slots (new)

- When more than one live document matches a named register, the slot takes the most recently updated one (`updatedAt`, then `asAt`), and every earlier match follows it in the section with " (earlier version)" appended to its title, as the Policies section already does for superseded policies. Nothing live is dropped.
- Module pages are unchanged: they already list every published document filed against the module.
- Unit test on the function with two and three matches; gate line: a register with two live matches shows the newest in the slot and the earlier one beneath it, at the API level, on the gate organisation.

### 3.2 FRAGO 09, sections 3.1 to 3.5, unchanged

Resume from the working tree. Check each FRAGO 09 item against the code before trusting that it is done; the stall left no record of what was finished.

### 3.3 Hand-over material

- T18 5n (FRAGO 09) plus one paragraph on the register slots and one on the test seat: "A document the test seat uploads is published to no one, even after you accept it. To publish a real document, file it from Documents or accept the client's own upload."
- T27 unchanged unless FRAGO 09 left it short.

### 3.4 Gate

FRAGO 09 3.6 plus 3.1 above. Before the run, read the client organisation's audit log and note the last entry; after the run, confirm no entry was added by the gate. The client is live: nothing in the gate may touch org-f2b4afdf0d beyond reads.

## 4. Service support, command and signal

As FRAGO 09 sections 4 and 5, with these changes: delete stale `.git/*.lock` first; append R01 from DC-75 (DC-74 is Seagull's); commit the work in progress in sensible pieces, not one commit; write `BUILD_REPORT.md` section v1.9, T14 V1_9, T17 V1_9. The gate's demo manager password is read as on 21 Oct: from `C:\Users\Bendy's Office PC\assure_gate_admin.txt` if Sunray has placed it again, never printed or written under the job folder, the file deleted at the end. If the file is absent, stop at the gate and report; do not deploy to production ungated.

## 5. Timings

Issued 23 Oct 09:50. Live and gated by 1500 BST. Report on deploy.

## 6. Not in this order

The decision note and category work beyond FRAGO 09; structured registers (T23); PDF extraction; the Anthropic key; SESSION_SECRET (Sunray; the client is already signed in, so rotation now signs the client out and must be timed with the operator).

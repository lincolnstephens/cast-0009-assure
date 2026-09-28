---
document: BATTLE_INSPECTION
job: CAST-0009 ASSURE
version: v1.5
status: DEPLOYED, GATE PASSED, AWAITING SUNRAY VISUAL CHECK
authority: Seagull, executed by the build session under T02 A6 and FRAGO 05
---

# ASSURE battle inspection, v1.5, named accounts and organisations

- URL: https://tessera-assure.netlify.app (site id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`)
- Deployed: 2026-09-28 at 17:16 BST, production deploy `6aba92e001af288f634c999e`. The order was issued at 15:55 and asked for "live within four hours".
  - A first production deploy at 16:38 (`6aba899937e9ebb4ceeb7398`, gate 154 of 154) implemented a seed format of the build's own.
  - FRAGO 05 had been amended during the run: the manifest and files were placed at 15:56, and the seed must read that manifest's shape.
  - The seed was reworked to it, and the product redeployed and re-gated.
- Spend: no new money committed. What was spent: build-session time, local compute, and five deploys on the existing Netlify plan (three drafts gated first, then two production). No new dependency; bcrypt was already in use.
- Secrets: no environment variable changed.
- Client name: `check_restricted.py` finds 0 hits across 277 files, and the built bundle is also clean (gate lines 30 and 50).

## The gate

**PASS, 154 of 154**, against the final production URL (deploy `6aba92e001af288f634c999e`). Static checks and 51 definition-of-done lines, at 1920x1080, 1366x768 and 390x844.

| Run | Target | Result |
|---|---|---|
| 1 | Draft `6aba8355ad82c37584eadd6b` | 148 of 154. L42 (Users) and L44 (switcher) failed: both tables rendered empty while loading, and the gate read them before their rows arrived |
| Fix pass 1 (the only one) | Product | Both tables now appear only once their rows have loaded. L42 and L44 were re-driven alone on draft `6aba892709c49cc43d798bf8` and passed |
| 2 | Production `6aba899937e9ebb4ceeb7398` | 154 of 154, with the build's own seed format |
| Amendment | Product | The seed now reads the supplied manifest's shape (tasks by `area` with `ref`, clocks, documents with status and description, `organisation.settings`). The gate fixture is now a copy of that manifest, which carries no client name. Lines 43, 46, 47 and 48 were re-driven on draft `6aba910e37e9eb00dfeb755c` and passed |
| 3 | Production `6aba92e001af288f634c999e` | **154 of 154** |

New lines 39 to 51, all passing:
- **Users (39):** create, reset, disable and re-enable, each with an audit entry naming the user id, never the email. The one-time password is found nowhere afterwards. A disabled user's live session and fresh sign-in are both refused.
- **Forced password change on the server (40):** until it is done, every non-auth route answers 403. The 12-character rule is enforced. The change ends the user's other sessions.
- **The change-password screen (41)**, holding a must-change user on both portals.
- **Users page (42):** the password is shown once, and gone after a reload.
- **Organisations (43):** create, library preview equal to what apply creates, 400 when no organisation is named, and settings isolated.
- **The switcher (44)** changes Workplan, Documents and Settings, and every admin request carries it.
- **Client view with an organisation (45).**
- **Isolation both ways (46):** every `orgId` a client seat receives is its own; no id crosses.
- **Seed (47):** the dry run writes nothing; counts match the manifest (26 tasks plus one for the done renewal, 27); a second run is refused without replace; the journey stage is set.
- **No restricted term in the seeded organisation (48).**
- **No session id in the login audit (49).**
- **Bundle scan (50).**
- **No password in any log or audit call (51).**

## Also inspected

- **242 unit and integration tests pass.** Seventeen are new, in `accounts.test.ts`, including the last-manager rule and invalid creates (which the gate cannot drive safely against the live store) and the clock rule.
- **The real seed command, dry run, against the gate organisation**, with Seagull's manifest and the nine files: "Would create 27 task(s) and file 9 of 9 document(s). Nothing written." 
- **The live store after the gate run:**
  - Both gate users are disabled.
  - The gate organisation holds the fixture's 27 tasks.
  - The demo organisation is unchanged: 65 tasks, the denominator on "overdue", and an empty journey note.

## Stop conditions

- **A client user reaching another organisation:** none found. Gate line 46 drives both seats both ways, and the unit tests add a record to one organisation and look for it from the other.
- **A password or one-time password in a log, an export or the audit:** none. Passwords are bcrypt only. Gate line 51 scans every `console` and `writeAudit` call, and the unit tests search both audits and both documents for the password strings.

## Found and fixed that the order did not name

- **Every sign-in and sign-out since v1.0 wrote the raw session id to the audit** (DC-51). It is now a one-way reference. Old rows keep their ids until `SESSION_SECRET` is rotated, which makes them worthless.
- **Admin routes fell back to the demo organisation when none was named** (DC-52). With a second organisation, that would have let a page act on the demo while the switcher showed the client. They now refuse.

## Deviations

- **The manifest's two clocks date the tasks they name, not statutory clocks** (DC-53, DC-57). Statutory clocks are for data requests and breaches. The registration-renewal clock names a task that is already done (the March 2026 renewal), so it becomes one new open task due 21 March 2027. Otherwise the next renewal would never show as due.
- **"Employee Access Matrix" is recognised as the employee access tracker register** (DC-57). Without that, the client would see the matrix filed and the named register still "Not yet filed".
- **The gate uses one fixed test organisation and two fixed users**, not a fresh throwaway each run, because there is no delete (DC-55). Managers will see them in the lists.

## What waits on whom

- **Sunray:**
  - Create the operator's manager account in Users (the restricted file holds no addresses), or place her address and have it done.
  - Read DC-54 before section 7 step 4: changing the `SEED_*` passwords in Netlify does nothing now; reset or disable the demo accounts in Users instead.
- **Seagull:** commit `material/lurong_documents/manifest.json` if wanted. It is the only file in that folder git can now see; the nine documents are ignored because they carry the client's name inside.
- **The operator, or Seagull under her seat:**
  1. Create the client organisation in Organisations.
  2. Run `seed-organisation`, dry run first, against it.
  3. Review it in View as client.

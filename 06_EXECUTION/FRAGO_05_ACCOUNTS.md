---
document: FRAGO_05_ACCOUNTS
job: CAST-0009 ASSURE
version: v1.0
status: ISSUED 2026-09-28 15:55, after v1.4 (deploy 6aba7af60408911991163ecf). Sunray decision R01 DC-48. Product target: Tessera Assure v1.5, the first version with named people in it.
authority: Seagull, under T02 A6, on Sunray's decision of 28 Sep 2026 (named accounts for the operator and the client's Information Officer)
supersedes: nothing. FRAGO 01 to 04 stand.
---

# FRAGO 05. Named accounts, the client's own organisation, and its real content

## 1. Situation

Everything in the product today runs on two seeded demo accounts in one demo organisation, created from environment variables, with no way to add a user, change a password, or add an organisation. Sunray has decided the next move is a manager account for the operator and a client account for the Information Officer. That cannot be done by hand today: there is no user management, no password change and no email. This order builds the smallest set of those things that lets two real people sign in safely, and gives the client its own organisation so the demo stays intact for showing prospects.

Nothing in this order sends anything to the client. Whether and when the Information Officer receives her sign-in is Sunray's (T02 A6: anything shown to the client). The store is multi-tenant already (every record carries orgId); the build uses that, it does not redesign it.

Rules that bind: no client name, no person's name and no email address in code, commits, seed files, environment variable names or this folder. Accounts are created through the product by a signed-in manager, so the addresses live only in the store. The two addresses are in `material/restricted/CLIENT.md`; read once, never copied.

## 2. Mission

Ship v1.5: manager-side user and organisation management with a first-sign-in password change, a second organisation for the client seeded from the pre-population plan, and the organisation switcher that FRAGO 04 deferred. Deploy, gate, report. No new money committed.

## 3. Execution

### 3.1 Roles

Keep the two roles. `mitmark_admin` with `orgId: null` is a manager and sees every organisation; `client` belongs to exactly one organisation. No third role in this order. The operator is a manager. The Information Officer is a client user of the client organisation.

### 3.2 Users (admin workspace, new page "Users")

- List users with role, organisation, status (active, disabled, must change password), last sign-in.
- Create user: email, role, organisation (required for client, none for manager), display name optional. On create the product generates a strong initial password, shows it once to the manager, and sets `mustChangePassword`. The product never emails it; the manager passes it on by whatever channel MITMARK uses. This is stated on the screen.
- Reset password: same mechanism, new one-time password, shown once.
- Disable and re-enable. Disabling ends the user's sessions. No delete.
- A manager cannot disable or demote the last active manager.
- Every action is an audit entry naming the acting manager and the affected user id (not the email in the free-text, the id).

### 3.3 First sign-in and password change

- A user with `mustChangePassword` is taken to a change-password screen before anything else, on both portals. Minimum 12 characters; the product shows the rule, not a strength meter.
- Any signed-in user can change their own password from the header menu (client portal and admin workspace).
- Changing a password ends every other session for that user.
- Session cookie and secret unchanged in code; rotating `SESSION_SECRET` is a Netlify environment change and is listed under section 7.

### 3.4 Organisations (admin workspace, new page "Organisations")

- List organisations with name, jurisdiction, user count, task count.
- Create organisation: display name (as it should appear on the client's pages), jurisdiction (UK only has content), regulation label. Creating an organisation creates its empty store document; it does not apply the demo library. A separate "Apply task library" button does that, with a confirmation that says how many tasks it will create.
- Each organisation has its own Settings (rates, retainer, journey stage, module introductions), as today.
- The organisation switcher: a select in the admin header, listing organisations by name, remembered per session. Every admin page and "View as client" act on the selected organisation. The gate proves no admin page can read or write another organisation's document than the selected one.

### 3.5 The client organisation and its content

- The build creates nothing named. It delivers a seed command `seed-organisation --manifest <path>` that a manager runs against the live store, taking the organisation id and a manifest. The manifest format is documented in T18.
- Seagull supplies `material/lurong_documents/manifest.json` from `00_INTENT/ASSURE_PREPOPULATION_PLAN.md` section 3: the 19 handover activities and the document-implied tasks (module, title, how, owner role, status, due date), the two clocks, the journey stage, and the document list (file, title without the client name, section, module, description) for whichever of the nine files are present in that folder.
- Sunray places the nine client files in `material/lurong_documents/` under the cleaned names in the manifest. If a file is missing the seed logs it and continues; documents can be filed later through the operator's Documents page.
- The seed refuses to run twice against the same organisation without `--replace`. It reports counts either side.
- The demo organisation is untouched.

### 3.6 View as client, with organisations

FRAGO 04's client view takes the selected organisation. Everything else in FRAGO 04 stands, including the response diff in its gate.

### 3.7 Gate

Extend for v1.5:
- Users page: create, reset, disable, re-enable each produce an audit entry; the initial password is shown exactly once and not retrievable afterwards; a disabled user's session is refused; the last manager cannot be disabled.
- First sign-in: a `mustChangePassword` user cannot reach any other page until changed; the rule is enforced server side, not only in the client.
- Password change ends other sessions (prove with two sessions).
- Organisations: create, apply library with count, per-organisation settings isolated; the switcher changes every admin page; a client user of organisation A never receives a record of organisation B (drive both seats).
- Seed: dry run against a throwaway organisation on a draft deploy; counts match the manifest; no name or address from the restricted file appears in any seeded field (grep the store export against the restricted terms).
- `check_restricted.py` on the folder, and the same terms against the built bundle.
- Everything in the v1.4 gate that still applies.

Gate must pass on the deployed URL before the build reports done.

### 3.8 Operator brief

T18 gains: creating a user and handing over the password; first sign-in; organisations and the switcher; running the seed; what the client sees on day one.

## 4. Service support

As FRAGO 03 section 4. No new dependency for email; none is authorised. Bcrypt or the existing hash for passwords; no plaintext anywhere, including logs and the audit log.

## 5. Command and signal

- Build session sole writer of R01 while it runs; append from the next free DC.
- Write the v1.5 sections: BUILD_REPORT, T14 V1_5, T17 V1_5, T18 update.
- Stop conditions as FRAGO 04, plus: any path by which a client user could reach another organisation's data is a stop; any path by which a password or one-time password is written to a log, an export or the audit log is a stop.

## 6. Timings

Issued when v1.4 lands. H-hour: live within four hours of issue.

## 7. After the build, in this order (not the build's)

Sunray's rule, 28 Sep: secrets stay as they are until the product is up and running with the operator in it. Rotation is the last step before the client, not the first.

1. Sunray or Seagull signs in as the demo manager, creates the operator's manager account, and the operator changes her password at first sign-in.
2. Sunray places the nine files; the operator (or Seagull under her seat) runs the seed against the client organisation.
3. The operator reviews the client organisation in "View as client" and works in it until she is satisfied.
4. Only then, and before any client sign-in exists: Sunray rotates `SESSION_SECRET` and sets new `SEED_CLIENT_PASSWORD` and `SEED_OFFICER_PASSWORD` in Netlify, then redeploys. The operator signs in again afterwards.
5. Sunray decides when the Information Officer's account is created and how her one-time password reaches her. Block 5 consent (client consent to a hosted record naming the officer) is confirmed before that step.

## 8. Not in this order

Email of any kind; self-service password reset; multi-factor authentication; a third role; the Anthropic key; the Record entries (Block 1); procedures.

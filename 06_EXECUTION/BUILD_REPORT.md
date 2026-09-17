---
document: BUILD_REPORT
job: CAST-0009 ASSURE
version: v1.0
status: BUILD COMPLETE, DEPLOYED, GATE PASSED
authority: Seagull, executed by the build session under T02 A6
---

# Tessera Assure v1.0, build report

**Live:** https://tessera-assure.netlify.app
**Production deploy:** `6aabd4f08da2e6146d2d98c7`, 2026-09-17
**Gate:** PASS, 36 of 36, against the production URL
**Spend:** £0

Sign in as the Information Officer with `demo@demo.local`, or as the operator with `operator@demo.local`. Both use the demo password currently set on the site.

## 1. What shipped

The MAXIMUS shell carrying the ASSURE value layer, as a single product.

**Kept from MAXIMUS, ported and working**
- The two-sided structure: a light client portal and a dark admin workspace, separated by sign-in and by role. The Information Officer's account cannot reach the operator's side at all.
- Statutory clocks. Her two intakes, a data request and a report of a concern, raise a clock (one month, or 72 hours) and an item in the review queue. The operator works them in admin.
- The policy pack, with draft and approved immutable versions, and the defence-file export with its officer approval step before generation.
- The Policy Guide, answering from approved policies only, with its three example prompts and its escalation path.
- The review queue and the audit log.
- Posture across five domains with the twelve-week trend, and exposure alerts, both still marked as demo data on screen.

**Kept from ASSURE v0.1, lifted into the shell**
- The Record: date, service line, what MITMARK did, outcome, statutory clock, the officer's hours replaced, the cost equivalent at her rate, the contractor equivalent at the day rate, the named reviewer, the illustrative flag.
- The CFO statement, printable and plain, with both comparators, the retainer ratio only when the fee is entered, and the limitations paragraph. **The wording is carried over verbatim.**
- The twelve service lines, ranked live first, then statutory clock, then hours per instance, with status set by the operator.
- Operator settings: rates, retainer fee, client display name, officer name or role, contract lead, line statuses, and the demo switch.
- The "Where spend would help" list.

**Wired together**
- The client portal's **Value** section is the Record, read only, and the Statement, with view, print and save as PDF. It replaces the prior build's undeveloped value snapshot, which is deleted.
- Admin gains **Record** (add, edit, delete, mark illustrative, mark reviewed, import a v0.1 export) and **Settings**.
- A closed statutory clock, an approved policy version, an answered Guide question released from the review queue, and a completed defence-file export each create a Record entry, with a default hours figure for its service line, editable, and reviewed by the admin who closed it.
- The Statement uses reviewed, non-illustrative entries only. Illustrative entries reach the client only when the operator has switched them on for a demo, and then the banner says so.
- Multi-tenant by organisation from the start. A second retained client is a second organisation document, not a second build.

## 2. The two decisions of consequence

**The store.** The prior build ran on Neon Postgres through Drizzle. Neon is not a prohibited connector, but a new database for this product needs a `DATABASE_URL` this session does not hold, and reusing the prior build's would have pointed Tessera Assure at the other product's live tenant data, which A7 forbids. The store is now a JSON document per organisation on **Netlify Blobs**, which the order names as acceptable, is on the existing plan, and needs no credential. Drizzle, `@neondatabase/serverless`, `pg` and `ws` are removed. Logged as DC-09.

**The function.** Netlify Blobs only reads with strong consistency inside a v2 function, and a v2 function loses this repository's workspace packages to the platform's file-tracing bundler. The server is therefore bundled into one file before deploy (`scripts/bundle-function.mjs`) and the v2 function imports that. Without this the operator and the client portal could hold different answers indefinitely. Logged as DC-12.

## 3. What the gate caught that reading the code did not

The gate drives the deployed product. Five defects only appeared that way.

1. **Illustrative entries kept reaching the client after the operator switched them off.** The v1 function could not read the store strongly, so the two sides disagreed and never converged. This was the A7 breach in the build and the reason for the v2 change.
2. **A stale read could wipe an organisation.** The seeder treated one empty read as proof the organisation did not exist and wrote a fresh empty document over it. It now requires two agreeing reads, and a seed marker stops any re-seed over the operator's work.
3. **Concurrent sign-ins could lose each other.** Sessions lived as rows inside one shared document, read and rewritten on every sign-in. They are now one blob each.
4. **A signed-out first page load logged a console error.** The bootstrap probe now answers 200 with a null user.
5. **A stub Users page shipped as an empty screen.** Removed rather than left in.

## 4. What was deferred, and why

- **The Anthropic API key is not set on this site.** The Policy Guide therefore answers from its deterministic keyword matching instead of the model. It still answers from approved policies only and still escalates, so the behaviour is right and the answers are weaker. The key was not copied across because the only bulk tool available would have carried the prior build's database credential onto this site with it. This is the smallest next decision, below.
- **Real content.** All fifteen Record entries are illustrative and say so. The record is real in structure and illustrative in content until Lurong enters real items, exactly as A9 anticipated. `00_INTENT/ASSURE_LIVE_REQUIREMENTS.md` lists what is needed; Block 1 alone makes it real and is a morning's work.
- **Rates and fee.** Defaults of £45 an hour and £650 a day stand, and the Statement says they are assumptions. The retainer fee is not entered, so no ratio is shown and the Statement says why.
- **Policy section editing.** The prior build stored policy sections as their own rows; the store holds one markdown body per version, with sections parsed out of it for display and citation. Editing a draft now means editing its body rather than a section at a time. The client-facing shape is unchanged.
- **Demo passwords.** Both accounts use a demo password. Change them before anything is shown outside MITMARK.
- **A second organisation** is supported by the data model but none is created. Adding one is configuration, not development.

## 5. Environment variables this build needs, by name

Values are not printed anywhere in this pack.

| Name | Set on the site | What it does |
|---|---|---|
| `SESSION_SECRET` | Yes | Signs the session cookie. Set fresh for this site. **Worth rotating in the Netlify UI**, because its value passed through the build session's transcript. |
| `SEED_CLIENT_PASSWORD` | Yes | The Information Officer demo account's password. |
| `SEED_OFFICER_PASSWORD` | Yes | The operator demo account's password. |
| `ANTHROPIC_API_KEY` | **No** | The Policy Guide. Absent, it falls back to keyword matching. |

`DATABASE_URL` is no longer read by anything and must not be set on this site.

## 6. Where the work is

| Path | What |
|---|---|
| `06_EXECUTION/build/maximus-src/` | The build. pnpm workspace: `apps/web`, `packages/shared`, `packages/server`, `netlify/functions`. |
| `06_EXECUTION/build/dist/` | The built output that was deployed. |
| `06_EXECUTION/build/site/` | v0.1, kept as the reference for the Statement's wording. |
| `06_EXECUTION/gate/g7_gate_assure_v1.py` | The gate. Run it against any URL. |
| `06_EXECUTION/gate/check_restricted.py` | The restricted-name check. Run before every commit and every deploy. |
| `06_EXECUTION/T14_DEFINITION_OF_DONE_V1.md` | The ten numbered lines and the four static checks. |
| `06_EXECUTION/T17_BATTLE_INSPECTION.md` | What was checked, and the result. |
| `07_HANDOVER/T18_OPERATOR_BRIEF.md` | For Lurong: rates, import, review, printing the statement. |

Commit as `Seagull <seagull@cast.local>` on `master` in this job folder. `material/restricted/` is excluded from git, so the client's name has never entered the history.

## 7. How to run it again

```
cd 06_EXECUTION/build/maximus-src
pnpm install
pnpm test                     # 102 tests
npx tsx scripts/smoke-api.mjs # end to end against a temporary local store
pnpm build                    # web build, then bundles the function
npx netlify deploy --prod --filter @maximus/web --dir=apps/web/dist --functions=netlify/functions
python ../../gate/g7_gate_assure_v1.py https://tessera-assure.netlify.app
```

The `--filter` is needed because the Netlify CLI otherwise stops to ask which workspace package it is building.

## 8. The smallest next decision for Sunray

**Set `ANTHROPIC_API_KEY` on `tessera-assure`, or say the Guide ships on keyword matching for this beta.**

It is one value, set once in the Netlify UI or by `netlify env:set`, and it is the difference between the Policy Guide answering the Information Officer's questions well and answering them adequately. Nothing else in the product is waiting on a decision.

After that, in order: change the two demo passwords; and put Block 1 of `ASSURE_LIVE_REQUIREMENTS.md` in front of the contract lead, because the record is only illustrative until he fills it.

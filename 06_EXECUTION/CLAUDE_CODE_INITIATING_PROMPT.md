---
document: CLAUDE_CODE_INITIATING_PROMPT
job: CAST-0009 ASSURE
version: v1.0
status: ISSUED BY SEAGULL, 2026-09-16
authority: Seagull, under T02 A6
usage: Paste as the first message of a Claude Code session opened in CAST_JOBS/CAST-0009_ASSURE. The session is the build; this folder is the source of truth.
---

# ASSURE build: MAXIMUS shell, ASSURE value layer

You are the build session for Cast job CAST-0009 ASSURE. Sunray is Linc. Seagull (Cowork) is chief of staff and issued this order. You read the folder, then build, then deploy. You do not take decisions Sunray has reserved.

## 1. Read first, in this order

1. `00_INTENT/T02_HIGHER_COMMANDERS_INTENT.md`. Annex A. Outranks everything below. A7 is your stop list.
2. `00_INTENT/ASSURE_BASELINE_KB.md`, including the MAXIMUS addendum at the end.
3. `00_INTENT/ASSURE_LIVE_REQUIREMENTS.md`. What real data will arrive later; build the fields for it.
4. `06_EXECUTION/build/site/index.html`. ASSURE v0.1, live at https://tessera-assure.netlify.app. This is the value layer you are keeping.
5. `06_EXECUTION/T17_BATTLE_INSPECTION.md`. What v0.1 was checked against.
6. `registers/R01_DECISION_LOG.md`. Append your own decisions there as you take them, ID DC-nn continuing the sequence, decided by "Build session", authority "delegated (A6)".
7. `material/restricted/CLIENT.md`. Read once. The names in it never appear in code, comments, commits, data, URLs, screens or logs. Grep for them before every commit and before every deploy.

## 2. Mission

Produce Tessera Assure v1.0: the MAXIMUS product shell carrying the ASSURE value layer, deployed to the existing Netlify site `tessera-assure` (site id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`, URL https://tessera-assure.netlify.app), replacing v0.1.

The user is one part-time Information Officer at a retained client; the audience is her sceptical CFO; the operator is MITMARK's data compliance officer. The product must take work off the officer, never add a system for her to feed, and must make MITMARK's saving to her visible as a record she can forward. Read A3 and A4 again before you design anything.

## 3. Locate MAXIMUS

MAXIMUS is the prior build: Vite and React, Tailwind 4, pnpm monorepo (`@maximus/web`, `@maximus/shared`), Netlify Functions API at `/api/*`, Anthropic API attached for the Policy Guide, deployed at `tessera-maximus.netlify.app`. Its source location is not recorded in this folder.

- Search this machine for it: a folder containing `apps/web`, `netlify/functions`, `DECISIONS.md`, and a `netlify.toml` with `pnpm --filter @maximus/web build`. Try `C:\Projects`, the user's repos, and `git remote -v` in any candidate.
- If found: copy it into `06_EXECUTION/build/maximus-src/` (do not build inside the original), read `DECISIONS.md`, and record the path in R01.
- If not found on this machine: stop and report to Sunray with the exact search you ran. Do not rebuild MAXIMUS from the bundle description. Sunray will point you at the repo (it may be on the home PC).

Read MAXIMUS's env requirements from its code. The Anthropic API key and any store credentials live in Netlify env vars on `tessera-maximus`; they must be copied to `tessera-assure` as env vars by Sunray or through the Netlify CLI with his auth, never into the repo. Identify MAXIMUS's data store. If it is Supabase, monday.com, Gmail, Canva or Twilio, stop and report: those connectors are prohibited for Cast. Netlify Blobs, Netlify Functions, a JSON store in Blobs, or a file are fine.

## 4. What to build

Keep from MAXIMUS (the shell):
- The two-sided structure: client portal (light) and admin workspace (dark), with sign-in.
- Statutory clocks (SAR one month, breach 72 hours) raised from the client portal and worked in admin. These become Record entries automatically when closed.
- Policy pack with draft and approved immutable versions, and the defence-file export.
- Policy Guide on the Anthropic API, answering the client from approved policies only, with the three example prompts.
- Review queue and audit log.
- Posture across five domains with the 12-week trend, if its data model is sound; otherwise defer and note it.

Keep from ASSURE v0.1 (the value layer), lifted into the shell:
- The Record: entries with date, service line (the twelve), what was done, outcome, statutory clock, officer hours replaced, cost equivalent at her rate, contractor equivalent at the day rate, named reviewer, illustrative flag.
- The CFO statement, printable, plain, with the two comparators, the retainer ratio only when the fee is entered, and the limitations paragraph. Preserve its wording; it was written to A7.
- The twelve service lines, ranked live first, then statutory clock, then hours per instance, status set by the operator.
- Operator settings: rates, retainer fee, client display name, officer name or role, contract lead, line statuses.
- The "Where spend would help" list.

Wire them together:
- Client portal gains a **Value** section: the Record (read only) and the Statement (view, print, download PDF). This replaces MAXIMUS's undeveloped value snapshot.
- Admin gains **Record** (add, edit, review, mark illustrative, import the v0.1 JSON export) and **Settings** (the operator fields).
- A closed statutory clock, an approved policy version, an answered Guide question in the review queue, and a completed defence-file export each create a Record entry with a default hours figure per service line, editable, reviewed by the admin who closed it.
- The Statement pulls only reviewed, non-illustrative entries. Illustrative entries never reach the client portal unless the admin has switched on "show illustrative" for a demo, and then the banner shows.
- Multi-tenant by organisation from the start: the second retained client is a second organisation, not a second build.

Design: apply the MITMARK house standard (Tessera tokens: night default, day theme, Inter and JetBrains Mono, square corners at night, severity colours only for status, no retired lavender or olive, no dual axis). MAXIMUS's HUD blue and client red are replaced by the tokens; the client portal's accent is the client's own colour only if the operator sets one.

## 5. Constraints (from T02 A3 and A7, and Cast standing rules)

- The Information Officer has no form to fill except the two intakes MAXIMUS already gives her (data request, report a concern). Nothing else asks her for input.
- No claim without a record. Every figure on the client side traces to an entry with a reviewer.
- No marketing language anywhere on the client side. The Statement's wording is the standard.
- £0 beyond the Anthropic API already attached and the existing Netlify plan. Any new paid service is a stop-and-report.
- No client name, no officer name, no data-subject personal data in the repo, the store schema, seed data, or logs. Seed data uses "Demo Organisation".
- Prohibited connectors: Gmail, Canva, monday.com, Supabase, Twilio.
- British English, no em dashes, plain and factual.

## 6. How to work

- You orchestrate. Sub-agents on the lowest viable model do the reading, the porting, the tests and the checks; you decide and integrate. Maximise concurrent sub-agent work; do not work in series when lanes are independent. Do not get caught watching the ball.
- Lanes that can run at once: (a) locate and read MAXIMUS; (b) port the ASSURE value layer into components with its logic unit-tested; (c) design tokens and theme swap; (d) data model for organisation, entry, settings, clock-to-entry link; (e) gate script from `06_EXECUTION/gate/g7_gate_template.py` adapted to this build (banned terms, client-name grep, no console errors, print output, mobile width).
- Commit as `Seagull <seagull@cast.local>` on `master` in this job folder's repo (run `git init` first if `.git` is absent; also `git init` is pending in the parent CAST_JOBS folder for `_JOB_INDEX.md`, leave that to Seagull). Small commits, named paths.
- Definition of done, v1.0: gate passes; `06_EXECUTION/T17_BATTLE_INSPECTION.md` updated with what was checked and the deploy id; R01 current; `07_HANDOVER/T18_OPERATOR_BRIEF.md` written for the MITMARK operator (how to set rates, import the v0.1 export, review entries, print the statement); the v0.1 JSON export format imports cleanly.

## 7. Deploy

- Target: Netlify site id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`, production. Unlisted, `noindex`, no password until Sunray says otherwise.
- Use the Netlify CLI linked to that site id with Sunray's auth (`netlify link --id ...`, `netlify deploy --prod`). If no auth is available in this session, build to `06_EXECUTION/build/dist/`, commit, and report; Seagull deploys from Cowork.
- Env vars (Anthropic key, store credentials) are set on the site in Netlify, not in the repo. Report which vars the build needs by name; do not print values.
- Before deploy: grep the built output for the restricted names; run the gate; open the deployed URL and check the five checks in T17.

## 8. Stop and report to Sunray when

- MAXIMUS source cannot be found.
- MAXIMUS depends on a prohibited connector or a paid service.
- Any step needs a credential you do not have.
- A MAXIMUS feature conflicts with A7 (for example, anything that asks the officer to maintain data).
- You are about to exceed £0.

Otherwise, run to deploy. Report by appending to R01 and writing `06_EXECUTION/BUILD_REPORT.md`: what shipped, what was deferred and why, the deploy id, and the smallest next decision for Sunray.

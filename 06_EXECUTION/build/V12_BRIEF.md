# Tessera Assure v1.2, Lurong's structure: shared brief for build lanes

Build root: `06_EXECUTION/build/maximus-src/`. All paths are relative to it.
The order is `06_EXECUTION/FRAGO_02_LURONG.md`. Read your lane's sections of it.

**Deadline: live by 2026-09-23 18:00.** Work to that.

## What is happening

v1.1 is live and every capability in it stays. v1.2 restructures the client
portal to the operator's own navigation, renames two modules, adds a document
repository and a consolidated job list, and changes how the overall figure
counts continuous duties.

Her three stated benefits are the test for every change: **compliance overview,
document repository, consolidated actions**, with the CFO statement quantifying
the service.

## Rules that have not changed and will not

1. **The client confirms a task and does nothing else.** No create, edit,
   reorder, close or reprioritise, anywhere, ever. She cannot upload, edit or
   delete a document either. Any design that lets her is a stop condition:
   stop and report rather than building it.
2. **The six columns** are `What, How, Who, When, Done, Status`, in that order,
   on every task table including the new Jobs page. Render from `TASK_COLUMNS`.
3. **A percentage never appears without its fraction beside it.**
4. **RAG is never colour alone**; every mark carries its label.
5. **Every figure carries its basis and its as-at date.**
6. **"No data yet" / an honest empty state** is a styled state, never blank and
   never a made-up number.
7. British English. No em dashes. No marketing language on the client side.
8. No client name, no officer name, no data subject's personal data anywhere.
9. No new dependency. No spend. Files go to Netlify Blobs and nowhere else.
10. Do not run `git`. Do not commit. Do not deploy. Edit only your lane's files.

## The spine, already written. Read it, do not edit it

- `packages/shared/src/tracker.ts` - the eight modules under their new titles,
  and the new contracts: `documentSchema`, `documentInputSchema`,
  `documentsResponseSchema`, `DOCUMENT_SECTIONS`, `TRACKER_DOCUMENTS`,
  `DOCUMENT_MAX_BYTES`, `jobsResponseSchema`, `jobGroupOf`, `JOB_GROUP_LABEL`,
  `denominatorModeSchema`.
- `packages/server/src/db/model.ts` - `DocumentRecord`, `OrgDoc.documents`,
  `OrgSettings.denominatorMode` and `.documentsTargetDate`.
- `packages/server/src/lib/tracker.ts` - the new denominator: `liveAreas`,
  `hasFallenDue(t, asAt, mode, live)`, `overallStatus(doc, now, mode)` which
  now also returns `standing` and `mode`.
- `packages/server/src/db/store.ts` - `migrateOrg` moves three library tasks to
  their new modules on read. Nothing needs a migration script.

## The eight modules at v1.2

| id | Title | Note |
|---|---|---|
| 1 | DPO registration | unchanged |
| 2 | Data tracker review | RoPA plus the registers; gains the transfers register review and a new employee access tracker review |
| 3 | Data retention | unchanged |
| 4 | Policy review | the policy pack reviewed one policy at a time, plus the privacy notice |
| 5 | Data protection impact assessment | unchanged |
| 6 | Data subject requests | unchanged |
| 7 | Vendor data risk | gains the safeguard for a new international transfer |
| 8 | Data breach and incident management | unchanged |

## Client navigation, in this exact order

1. Compliance Tracker (`/`) - the v1.1 home, plus a sub-navigation of the eight modules
2. Compliance Documents (`/documents`)
3. Jobs (`/jobs`)
4. Requests and clocks (`/clocks`)
5. Value (`/value`)
6. Statement for the CFO (`/value/statement`)

Posture and Exposure leave the client navigation. Posture's content is the
"Areas by status" panel already on the tracker. The Policy Guide is no longer a
menu item: it sits at the foot of Jobs and stays reachable from each module page.

## New API surface

Client (`requireRole("client")`):

| Method | Path | Returns |
|---|---|---|
| GET | `/api/tracker/documents` | `DocumentsResponse` |
| GET | `/api/tracker/documents/:id/download` | the file, or a redirect to the link |
| GET | `/api/tracker/jobs?module=&owner=&due=` | `JobsResponse` |

Admin (`requireRole("mitmark_admin")`):

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/documents?org=` | list |
| POST | `/api/admin/documents?org=` | create, body `documentInputSchema` |
| PATCH | `/api/admin/documents/:id?org=` | update |
| DELETE | `/api/admin/documents/:id?org=` | remove |
| GET | `/api/admin/jobs?org=` | the operator's mirror of Jobs |

## Checking your work

```
npx tsc --noEmit -p packages/server/tsconfig.json
npx tsc --noEmit -p apps/web/tsconfig.json
npx vitest run --root packages/server
npx tsx scripts/smoke-api.mjs
```

Fix only errors in files your lane owns. Report anything cross-lane.

# Tessera Assure v1.1, the Compliance Tracker: shared brief for build lanes

Build root: `06_EXECUTION/build/maximus-src/`. All paths below are relative to it.
The order is `06_EXECUTION/FRAGO_01_TRACKER.md`. Read it before your lane's section.

## What is being built

v1.0 is live and every capability in it stays. v1.1 rebuilds the client portal
home as a Compliance Tracker that answers six questions per task: **what do I
need to do, how, who, by when, is it done, and if not what is the status**. A
workplan layer and eight area sub-pages sit beneath it.

## The one rule everything else follows

The workplan is **MITMARK's workplan for the client**. The operator owns it.

- A task whose owner is a client role is shown to the client with a due date and
  a one-line ask. The client may **confirm** it and attach one link. Nothing else.
- The client **never** creates, edits, reprioritises, reorders or closes a task.
  There is no client-side write path to a task other than confirm.
- A client confirmation is an **audit-logged event and a review-queue item**. It
  is not a status change. The operator accepts it, and the operator's acceptance
  is what moves the status.
- Status shown to the client is always the operator's most recent setting.

Any design that lets the client edit a task is a stop condition. If your lane
seems to need one, stop and report rather than building it.

## The spine, already written. Read these first, do not edit them

- `packages/shared/src/tracker.ts` - every contract: areas, phases, task,
  procedure, library task, the home and area page shapes, RAG and status labels.
- `packages/server/src/db/model.ts` - `TaskRecord`, `ProcedureRecord`, the new
  `OrgSettings` fields (`jurisdiction`, `staffInScope`, `staffTrained`,
  `clientRoles`, `workplanTargetDate`), `ClockRecord.insideStatute` and
  `ClockRecord.icoNotified`, and `OrgDoc.tasks` / `OrgDoc.procedures`.
- `packages/server/src/lib/tracker.ts` - the arithmetic: `taskRag`, `worstRag`,
  `hasFallenDue`, `overallStatus`, `phaseSummaries`, `areaSummaries`, `forYou`,
  `kpis`, `ownerLabel`, `formatDate`.

**The denominator rule**, which the gate checks: the overall figure counts tasks
with a due date on or before today, plus always-on duties. Tasks marked not
applicable are excluded entirely. A percentage is never shown without the
fraction beside it.

## The API surface for v1.1

Client role (`requireRole("client")`), all under `/api/tracker`:

| Method | Path | Returns |
|---|---|---|
| GET | `/api/tracker/home` | `TrackerHome` |
| GET | `/api/tracker/areas/:area` | `AreaPage` |
| POST | `/api/tracker/tasks/:id/confirm` | `{ ok: true }`, body `taskConfirmSchema` |

Admin role (`requireRole("mitmark_admin")`), all under `/api/admin`:

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/workplan?org=&area=&status=` | list tasks |
| POST | `/api/admin/workplan?org=` | create, body `taskInputSchema` |
| PATCH | `/api/admin/workplan/:id?org=` | update, body partial `taskInputSchema` |
| DELETE | `/api/admin/workplan/:id?org=` | remove |
| POST | `/api/admin/workplan/apply-library?org=` | body `applyLibrarySchema` |
| GET | `/api/admin/procedures?org=` | list all eight |
| PUT | `/api/admin/procedures/:area?org=` | body `procedureInputSchema` |

Settings (`/api/admin/settings`) already exists and gains the new fields.
The review queue already exists and gains the `task_confirmation` item type.

## Rules that apply to every lane

1. **British English. No em dashes.** The gate fails on either.
2. **No client name, no officer name, no data subject's personal data** in code,
   comments, seed data or logs. Seed data uses "Demo Organisation".
3. **No new dependency.** The budget is nil.
4. **RAG is never colour alone.** Every mark carries its label from `RAG_LABEL`.
5. **Every figure carries its basis and its as-at date**, on hover or beneath.
6. **"No data yet" is a state**, styled, never blank and never a made-up number.
7. The six columns are `What, How, Who, When, Done, Status`, in that order, on
   every task table. Do not rename them. `TASK_COLUMNS` in `tracker.ts` is the
   source; render from it.
8. Import style is `from "./x.ts"` with the extension, as the tree already does.
9. Do not run `git`. Do not commit. Do not deploy.
10. Only edit the files your lane owns. Other lanes are working in the same tree.

## Checking your work

```
npx tsc --noEmit -p packages/server/tsconfig.json
npx tsc --noEmit -p apps/web/tsconfig.json
npx vitest run --root packages/server
```

Fix only errors in files your lane owns; report anything cross-lane rather than
reaching into another lane's files.

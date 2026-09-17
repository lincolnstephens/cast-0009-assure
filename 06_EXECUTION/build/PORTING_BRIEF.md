# Tessera Assure v1.0, porting brief for build lanes

Build root: `06_EXECUTION/build/maximus-src/`. All paths below are relative to it.

## What is happening

Tessera Assure v1.0 is the MAXIMUS product shell carrying the ASSURE value layer.
The shell is kept. Its Neon Postgres store is replaced by a JSON document store on
Netlify Blobs, because the build must cost nothing beyond the Anthropic API already
attached and must carry no database credential.

Drizzle ORM, `@neondatabase/serverless`, `pg` and `ws` are removed from the
dependencies and the files `packages/server/src/db/schema.ts` and
`packages/server/src/db/index.ts` are deleted. Anything importing them must be
ported to the new store.

## The new store

Two files, both already written. Read them before you start.

- `packages/server/src/db/model.ts` - the persisted shapes. One `OrgDoc` per
  organisation holds that tenant's policies, threads, messages, escalations,
  intakes, clocks, clock events, posture, posture history, alerts, review items,
  audit, exports and Record entries, plus its branding and operator settings.
  `UsersDoc` holds users and sessions.
- `packages/server/src/db/store.ts` - the accessors.

```ts
newId(): string                                   // uuid
readOrg(orgId): Promise<OrgDoc | null>
writeOrg(doc): Promise<void>
mutateOrg<T>(orgId, fn: (doc) => T): Promise<T>   // read, apply, write
listOrgIds(): Promise<string[]>
ensureOrg(orgId, name): Promise<OrgDoc>
readUsers(): Promise<UsersDoc>
writeUsers(doc): Promise<void>
mutateUsers<T>(fn: (doc) => T): Promise<T>
readExportBlob(exportId): Promise<Uint8Array | null>
writeExportBlob(exportId, bytes): Promise<void>
resetDriver(): void                                // test seam
```

The driver writes to Netlify Blobs on Netlify and to a local directory otherwise
(`ASSURE_DATA_DIR`, default `.data`), so tests and local runs need no network and
no credential.

## Porting rules

1. **Replace queries with array work.** A Drizzle `select ... where` becomes a
   `filter` over the relevant array on the `OrgDoc`. An `insert ... returning`
   becomes building the record with `newId()`, pushing it, and returning it. An
   `update` becomes finding the record and assigning. Do the whole of one request's
   reads and writes inside a single `mutateOrg` call so the document is written once.
2. **Dates are ISO strings** in the store, not `Date` objects. Convert at the
   boundary. The API responses must keep exactly the shapes the web app and the
   zod schemas in `packages/shared/src` already expect. Do not change the API
   contract or the shared schemas unless your lane says to.
3. **Every record carries `orgId`.** Scope every read to the signed-in user's
   organisation. An admin acts on the organisation named in the request.
4. **Keep the existing behaviour.** Same routes, same status codes, same error
   messages, same audit entries. This is a port, not a redesign.
5. **Preserve `import ... from "./x.ts"` extension style** used throughout.
6. British English in all comments and user-facing strings. No em dashes. No
   marketing language. Plain and factual.
7. Never write a client name, an officer name, or any data subject's personal
   data into code, comments, seed data or logs. Seed data uses "Demo Organisation".
8. Do not run `git` commands. Do not commit. Do not deploy.
9. Do not add a dependency. The budget is nil beyond what is installed.

## Checking your work

From the build root:

```
npx tsc --noEmit -p packages/server/tsconfig.json
npx tsc --noEmit -p apps/web/tsconfig.json
npx vitest run --root packages/server
```

Only fix errors in the files your lane owns. Other lanes are working in the same
tree at the same time; errors in files you do not own are theirs, and you must not
edit their files. Report any cross-lane problem rather than fixing it.

## The value layer being added

The Record is the list of what MITMARK did, each entry with date, service line,
what was done, outcome, statutory clock, the officer's hours it replaced, the cost
equivalent at her rate, the contractor equivalent at the day rate, a named reviewer
and an illustrative flag. The Statement is the printable, plain document the
Information Officer forwards to her CFO.

Closing a statutory clock, approving a policy version, an answered Guide question
leaving the review queue, and a completed defence-file export each create a Record
entry automatically, with a default hours figure for the service line, editable,
reviewed by the admin who closed it. The Statement uses reviewed, non-illustrative
entries only.

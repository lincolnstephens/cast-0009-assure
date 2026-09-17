# DECISIONS

Decisions taken where the spec and the deployment override are silent, per the
operating rules. Newest last.

## Phase 1 — Foundations

1. **Repo root.** The repository root is the `Proj MAXIMUS` folder containing
   `PROJECT_MAXIMUS_SPEC.md`.
2. **Router library.** The override replaces Fastify (Railway) with Netlify
   Functions; Fastify does not fit a functions runtime. The API uses **Hono**
   inside a single router entry function (`netlify/functions/api.ts`), which the
   override explicitly permits. Handlers live in `packages/server/src/routes/*`.
3. **netlify.toml base directory.** The override asks for `base = "apps/web"`,
   but Netlify resolves the `functions` directory *relative to the base*, which
   would force the functions under `apps/web/netlify/functions` and contradict
   the requirement that the API lives at repo-root `netlify/functions`. Base is
   therefore omitted (defaults to repo root); the build command and publish
   path target `apps/web` explicitly. All other override requirements stand:
   publish `apps/web/dist`, functions `netlify/functions`, `/api/*` redirect
   ordered before the SPA fallback.
4. **Database driver.** Deployed functions use Neon's serverless (WebSocket)
   driver as required. When `DATABASE_URL` points at localhost (local dev and
   tests use a Docker Postgres 16 container), the standard `pg` driver is used
   instead, because the serverless driver only speaks to Neon's proxy. Same
   Drizzle schema and migrations either way.
5. **Status/state columns** are `text` validated by zod at the API boundary
   rather than Postgres enums — avoids enum migration churn; the allowed values
   live in `packages/shared/src/enums.ts`.
6. **Primary keys** are UUIDs (`gen_random_uuid()`), simplest with multi-tenant
   data and non-guessable references.
7. **Sessions.** Postgres `sessions` table (functions are stateless); cookie
   value is `sessionId.HMAC(sessionId, SESSION_SECRET)` so forged ids are
   rejected before a DB lookup. TTL 7 days. Cookie: httpOnly, Secure,
   SameSite=Lax, Path=/.
8. **Named officer.** The spec requires a named MITMARK officer in the client
   top bar but defines no assignment model. Beta: the first `mitmark_admin`
   user is the officer for every account.
9. **Seed scope grows per phase.** Phase 1 seeds the client account and the two
   users; later phases add policies, clocks, posture, alerts as those features
   are built. The seed script is idempotent.
10. **Posture history** (12-week sparkline, §4.2) will use `audit_log` event
    rows rather than a dedicated history table (spec offers either).
11. **Routing library.** `react-router-dom` for the web app (spec pins no
    router); Zustand holds session state as pinned.
12. **Email normalisation.** Login lowercases the email before lookup; seed
    emails are stored lowercase.
13. **`[dev] framework = "vite"` in netlify.toml.** With only a custom dev
    command, the Netlify CLI applied the `/* → /index.html` SPA fallback to
    every request (including Vite module assets), serving HTML instead of JS.
    Declaring the framework makes the CLI defer to the Vite dev server and
    only apply redirects it cannot satisfy. Production behaviour is unchanged.
14. **`.npmrc shamefully-hoist=true`.** Netlify's dev function bundler keeps
    `node_modules` imports external; pnpm's strict layout hid `hono` etc. from
    the function's resolution path. Hoisting to the root `node_modules` fixes
    local function execution; deployed bundling is unaffected.
15. **Function entry is `api.mts`.** Node's native TypeScript execution in the
    functions dev server requires ESM (`.mts`) and explicit `.ts` extensions on
    relative imports across `packages/server` and `packages/shared`
    (`allowImportingTsExtensions` enabled).

## Phase 2 — Clock engine

16. **Luxon for Europe/London month arithmetic.** The SAR one-calendar-month
    rule needs IANA-zone-aware wall-clock maths (GMT/BST). Luxon's
    `plus({ months: 1 })` clamps to month end exactly as §3 requires. Server
    only; the spec pins no date library.
17. **Status thresholds shared.** `clockStatus` lives in `@maximus/shared` so
    the web countdown colours and the server use identical logic. Boundary
    reading of §3: exactly 50% remaining is amber (green is "> 50%"); exactly
    20% is amber (red is "< 20%").
18. **Clock reference format.** §4.3 displays a "reference" but defines none:
    `TYPE-XXXXXXXX` (first 8 hex chars of the intake id, uppercased), derived
    on read, no extra column.
19. **"Raise a request" mapping.** Form type "data request" → SAR intake +
    one-month clock; "report a concern" → breach intake + 72-hour clock,
    mirroring the chat red path's two intake types.
20. **Inside-statute flag.** Closing a SAR requires an explicit
    `insideStatute` boolean (400 without it); stored in `intakes.details`
    jsonb (the §3 schema has no column for it) for the Value Snapshot counter.
21. **403 vs 404.** A clock belonging to another tenant returns 403 (per §11);
    a non-existent id returns 404.
22. **Admin clock queries take an explicit `accountId`** (from the top-bar
    account switcher, now live), keeping admin reads tenant-explicit.
23. **Dev note.** The functions dev server does not hot-reload transitive
    imports from `packages/server`; restart `netlify dev` after server-side
    changes.

## Phase 3 — Policy pack

24. **`policies.version` is an integer** (migration `0001`); the spec showed
    no type and ordering/max arithmetic needs a number.
25. **Versioning semantics.** Approved versions are immutable: any mutation
    returns 409. "Editing an approved policy creates a new draft version" is
    an explicit snapshot action (`POST /admin/policies/:id/draft`) that copies
    the policy and all sections to version+1 as a draft. Clients and the
    Policy Guide read ONLY the latest approved version per code; drafts and
    superseded versions return 404 to clients. Draft versions may be deleted;
    approved versions are retained forever.
26. **Markdown sanitisation.** All policy markdown (client side panel and
    admin preview) renders through a single `Markdown` component using
    react-markdown + rehype-sanitize — officer-authored content is treated as
    untrusted; raw HTML is stripped.
27. **Citation versioning (for Phase 4).** Section refs are stable within a
    version; every policy read exposes `version`, and chat citations will be
    stored with the `policy_version` they validated against at send time.
28. **Seed corpus.** The six §7 policies live in
    `packages/server/scripts/policyPack.ts` as full documents (7–9 sections
    each) with deliberate cross-references (SAR one-month, breach 72h, CCTV
    30-day retention). DP-01 §5 clearly authorises sharing tenant contact
    details with the appointed letting agent (demo question 1 → green);
    CCTV-01 §1 governs only company-operated cameras, so a tenant's private
    camera in a communal hallway is deliberately not "clearly answered"
    (demo question 2 → amber).
29. **Policy code format** enforced as `XX-NN` (e.g. DP-01) via shared zod
    schema; duplicate codes per account rejected (409).

## Phase 4 — Policy Guide

30. **LLM transport.** Raw `fetch` to the Anthropic Messages API (no SDK) —
    dependency-light and gives direct control of `cache_control`. Model
    `claude-sonnet-4-20250514` per spec §2.
31. **Prompt caching.** The system prompt is two blocks: the verbatim §4.1
    rules, then `APPROVED POLICY SECTIONS:` + corpus with
    `cache_control: {type: "ephemeral"}` on the corpus block (caching the
    whole system prefix). Corpus rendering is byte-stable (sorted by code,
    then numeric section ref) so cache hits actually occur.
32. **JSON discipline.** Assistant response is prefilled with `{` to nudge
    bare JSON; parsing is defensive (fences stripped, first `{`…last `}`),
    zod-validated; any failure → amber per spec.
33. **429/529/5xx/network → fixed copy.** Mapped to one `GuideBusyError`,
    returned as 503 with "The Guide is busy right now. Give me a few seconds
    and ask that again." The UI shows that text with an "Ask again" retry
    button. Raw errors and stacks never reach the client. The model is called
    BEFORE the user message is persisted, so a busy reply leaves no
    half-state.
34. **LLM observability.** One structured log line per round-trip: model,
    HTTP status, latency, input/output tokens, cache read/creation tokens.
    Never message bodies (spec §8); bodies exist only in `chat_messages`.
35. **Enforcement order.** Parse-fail → amber; citations validated against
    the latest approved corpus and re-stamped server-side (policyId +
    policyVersion pinned from the corpus, not from model output); green with
    no surviving citations → amber; intake present → force red; red WITHOUT
    an intake → amber (nothing statutory to start — spec silent, logged
    here).
36. **Citation version pinning.** Citations store `policyVersion` and
    `policyId` of the serving version. To let chips resolve after
    supersession, the client `GET /policies/:id` now serves ANY approved
    version of the caller's account (drafts still 404; the list endpoint
    still returns latest-approved only). Phase 3 test updated accordingly.
37. **Red path plumbing.** Chat red calls the same `createIntakeWithClock`
    service as `POST /api/requests` (source `chat`) — clock, events, review
    item and audit come from the one implementation.
38. **Amber fixed copy** completes the spec's ellipsis with: "…here's what's
    useful to gather: dates, names, and any documents or messages involved."
39. **Rate limiting** (10 msg/min/user, spec §8) is counted from
    `chat_messages` in the DB, so it holds across stateless function
    instances; 429 copy is plain-English.
40. **Threads.** One thread per (user, account), created lazily on first
    Guide visit. Officer replies are polled every 12s while the tab is
    visible — no websockets in beta.
41. **Review queue (Phase 4 slice).** The admin landing page ships the amber
    escalation reply loop only (spec §9.4); intake/alert/export review items
    join in Phase 6 polish.

## Phase 5 — Posture + exposure

42. **Posture history table.** `posture_domain_history` is append-only;
    sparklines read from it, not from mutable `posture_domains` state. Every
    officer update writes a history row + audit row in one transaction via
    `recordPostureChange`.
43. **Officer note required.** `updatePostureSchema` enforces a non-empty
    note on every status change — empty/whitespace rejected (400).
44. **Seeded posture.** 3 green (policies, training, ropa), 2 amber
    (access_reviews, retention) per spec §7. Training domain history shows a
    visible amber→green improvement over 12 weeks (renewal argument).
45. **Demo alerts only.** `is_demo` defaults true on `exposure_alerts`.
    Admin create rejects any `isDemo` field in the request body (400) and
    always inserts `is_demo: true`. UI shows an unmissable "DEMO DATA" badge
    (amber border, bold caps) on every alert in both workspaces.
46. **Alert triage.** State transitions are officer-only, require
    `officerNote`, write `exposure.state_change` audit rows. Client exposure
    feed renders "Triaged/Actioned/Dismissed by [officer name]: [note]" —
    the officer note IS the product surface.
47. **Officer display on alerts.** Beta has one assigned officer; triage
    attribution uses the first `mitmark_admin` user's display name (same
    pattern as the top bar). No `triaged_by` column added — spec schema has
    only `officer_note`.

## Phase 6 — Value snapshot + defence-file export + review queue polish

48. **Value counters are always live.** `GET /value` runs SQL at request
    time; no cache table and no seeded headline numbers. Quarter boundaries
    use `Europe/London` via `packages/server/src/lib/quarters.ts`. SAR
    "inside statute" reads `intakes.details.inside_statute` set explicitly
    at SAR close (Phase 2). Zero counts return `0` in JSON — the UI never
    hides empty counters.
49. **Defence-file PDF: pdf-lib + JSZip.** Netlify Functions have no
    headless browser and no persistent disk. The summary PDF is built with
    **pdf-lib** (vector text, no HTML render); policies ship as markdown
    inside a **JSZip** archive. The zip bytes live in `exports.file_data`
    (`bytea`) for beta. Download is `GET /exports/:id/download` —
    session-authenticated, tenant-scoped for clients; admins may download
    any export they can reach by id. Rejecting an export review item
    deletes the `requested` row so the client can request again.
50. **Unified review queue.** `GET /admin/review` returns all pending
    `review_items` for the selected account, oldest first, optional `type`
    filter. Actions: `answer` (chat_amber), `approve` (export_request →
    generate file, alert/intake → resolve item), `reject` (all types).
    Review item states align to spec enums: `pending | approved | rejected`
    (replacing the Phase 4 `escalation` / `resolved` slice). Escalations
    answered via the legacy `/admin/escalations/:id/answer` route still
    resolve the linked review item.
51. **Export lifecycle audit.** `export.request` (client), `export.generate`
    + `review.approve` (officer on approve), `review.reject` on reject.
    Admin exports list is read-only status + download; approval happens in
    the review queue.

## Phase 7 — Hardening

52. **Playwright at repo root.** Smoke tests live in `e2e/` with
    `playwright.config.ts`; `globalSetup` runs `pnpm seed:reset` so each run
    starts from pristine demo data. `ANTHROPIC_API_KEY` is cleared for E2E so
    CI needs no Anthropic key (stub mode per §8).
53. **Demo-day reset.** `pnpm seed:reset` truncates all mutable demo tables
    (chat, clocks, policies, alerts, exports, audit, sessions) then re-runs
    the seed — users and `client_accounts` are preserved.
54. **Audit log viewer.** `GET /admin/audit` (filter by action/entity) and
    `GET /admin/audit/export.csv`; UI at `/admin/audit`. Replaces the Phase 6
    placeholder required by §11.

## Phase 8 — Client onboarding & branding (Demo Organisation)

55. **Tenant branding jsonb.** `client_accounts.branding` holds displayName,
    logo paths, colours, and poweredByText. `/auth/me` returns it for client
    sessions only; the admin workspace keeps the Tessera dark HUD.
56. **Client theme via CSS variables.** `.client-portal` remaps `--color-hud-*`
    tokens from `--client-*` set on the layout root — existing Tailwind classes
    work without per-page rewrites. Status lamp semantic colours unchanged.
57. **Logo swap.** Files under `apps/web/public/branding/{tenant}/`; missing
    assets fall back to an uppercase wordmark from `displayName`.
58. **Live tenant identity.** Demo Organisation Ltd; Information Officer Jackson (client);
    Lurong Chen (officer). Pemberton remains test-fixture-only.
59. **Seed passwords.** `SEED_CLIENT_PASSWORD` and `SEED_OFFICER_PASSWORD`
    required — seed aborts if unset. Renamed from `SEED_ADMIN_PASSWORD`.
60. **Seed modes.** `--clean` (default): account, users, draft policies,
    branding. `--demo` adds clocks, posture, demo alerts. `--reset` truncates
    then `--demo`. Policies are draft until the officer approves in-app.
61. **Empty corpus.** No approved policies → fixed amber Guide copy; no
    escalation or review item (onboarding state before approval).

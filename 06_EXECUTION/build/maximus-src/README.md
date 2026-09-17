# Project MAXIMUS

Client-facing compliance platform (vDPO/vCISO support) operated by MITMARK
Intelligence with a human-in-the-loop compliance officer.

Single source of truth: `PROJECT_MAXIMUS_SPEC.md` (with the Netlify deployment
override). Decisions where the spec is silent: `DECISIONS.md`. Phase checkpoints:
`CHECKPOINT.md`.

## Stack

- **Web:** Vite + React 18 + TypeScript + Tailwind CSS + Zustand (`apps/web`)
- **API:** Netlify Functions (TypeScript) — one router entry function
  (`netlify/functions/api.ts`, Hono) with handlers in `packages/server`.
  All routes under `/api/*` via `netlify.toml` redirects.
- **DB:** Neon Postgres (serverless driver in production) + Drizzle ORM,
  migrations committed in `packages/server/drizzle`
- **Shared types/schemas:** `packages/shared` (zod)

## Prerequisites

- Node 20+, pnpm 10 (`npm i -g pnpm`)
- Netlify CLI (`npm i -g netlify-cli`)
- A Postgres database:
  - **Local:** Docker — `docker run -d --name maximus-pg -e POSTGRES_PASSWORD=maximus_dev -e POSTGRES_DB=maximus -p 5544:5432 postgres:16-alpine`
  - **Hosted:** a Neon project (see below)

## Local setup (PowerShell)

```powershell
Copy-Item .env.example .env   # set DATABASE_URL, SESSION_SECRET, seed passwords
pnpm i
pnpm db:migrate
pnpm seed:demo                # or pnpm seed for clean onboarding state
pnpm dev                      # http://localhost:8888
```

`pnpm dev` runs `netlify dev --offline --filter @maximus/web` — Vite on 5173,
functions on the same origin at 8888. Restart after server-side changes in
`packages/server`.

### Live tenant: Demo Organisation Ltd

| Role | Email | Password |
|---|---|---|
| client | `Information Officer.jackson@DemoOrganisation.example` | `SEED_CLIENT_PASSWORD` in `.env` |
| MITMARK officer | `officer@mitmark.example` (Lurong Chen) | `SEED_OFFICER_PASSWORD` in `.env` |

Passwords are **never** committed or documented with example values. The seed
script exits with an error if either variable is unset.

### Seed modes

| Command | What you get |
|---|---|
| `pnpm seed` / `pnpm seed --clean` | Demo account, users, **six draft policies** (unapproved), branding — real onboarding starting point |
| `pnpm seed:demo` | Clean seed **plus** demo clocks, posture history, exposure alerts (DEMO badges) |
| `pnpm seed:reset` | Truncate mutable tables, then `seed:demo` — use before walkthroughs |

Until the officer approves policies, the Policy Guide returns a fixed amber
message (“Your policy pack is being prepared…”).

### Demo-day reset

```powershell
pnpm seed:reset
```

Clears chat, clocks, policies, alerts, exports, audit, and sessions — keeps
users and the Demo account. Sign in again after reset (sessions are truncated).

### Client branding assets

Drop official logos into `apps/web/public/branding/demo-organisation/` as
`logo-light.svg` (and optionally `logo-dark.svg`). Until files are present, the
client portal shows a **Demo Organisation** wordmark. No code change required to swap.

## Tests

```powershell
pnpm test
pnpm test:e2e:install
pnpm test:e2e            # requires SEED_* passwords in .env; runs seed:reset first
```

Unit tests use a fictional **Pemberton Estates** fixture — not shown in the live UI.

## Neon setup (production Postgres)

1. Create a project at https://neon.tech (Postgres 16+).
2. Copy the pooled connection string into `.env` as `DATABASE_URL`.
3. From your machine:

```powershell
pnpm db:migrate
pnpm seed:demo
```

## Deploy (Netlify)

Web + API on Netlify; Postgres on Neon.

1. Connect the repo; `netlify.toml` defines build, publish, functions, redirects.
2. Netlify environment: `DATABASE_URL`, `SESSION_SECRET`, optional `ANTHROPIC_API_KEY`.
3. Run migrations and seed from your machine against Neon.
4. Deploy.

## Environment variables

See `.env.example`: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `SESSION_SECRET`,
`SEED_CLIENT_PASSWORD`, `SEED_OFFICER_PASSWORD`.

## Demo script (spec §7 — verbatim)

**Policy Guide — three questions** (stub mode and LLM mode, after policies are approved):

1. "Can I share the tenant contact list with our letting agent?" → green, citing DP-01
2. "A tenant wants to put their own camera in the communal hallway — is that allowed?" → amber, escalated to the officer
3. "A former employee has emailed asking for everything we hold on them" → red, SAR clock

**Walkthrough:** officer approves draft policies → client Guide (all three) → Clocks → Review queue (answer amber) → client sees officer reply → Value / exports as needed.

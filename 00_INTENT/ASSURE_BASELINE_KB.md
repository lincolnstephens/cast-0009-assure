---
document: ASSURE_BASELINE_KB
job: CAST-0009 ASSURE
version: v1.0
status: BASELINE, authenticated by Seagull 2026-09-16, awaiting Sunray read
authority: Seagull
built_from: Maxima archive, read in place 2026-09-16 (see Source index)
usage: The single reference for prior work on this line. Read this before the archive. Search the archive only for a specific file named in the Source index.
---

# ASSURE baseline knowledge base

## Rule for archive searches

- This file is the knowledge base for prior work on the vDPO / data compliance line. It supersedes the Maxima archive as the thing you read.
- The Maxima folder (path in the Source index) is the **archive of record, defunct for working purposes**. Nothing in it is edited, moved or built on directly.
- Any search for "what did we do before on this" starts and ends here. Go to the archive only to open one specific file that this index names, and only when the fact needed is not already here.
- Anything not in this file and not in the archive is treated as absent (Lesson L6). Do not infer it.

## What the archive contains, in one paragraph

Three artefacts from one line of work, Sep to Dec 2025: a **service definition** for MITMARK's external Data Protection Officer as a Service (vDPO) written as an AI agent's core instructions (19 Nov 2025); a **client-facing visual set** of three military-themed infographics selling "Operation Data Compliance" with a five-phase roadmap and a day rate (Dec 2025); and a **software prototype** called Aegis (folder name Tessera_INFO_SEC, 5 Sep 2025), a FastAPI plus Next.js plus PostgreSQL compliance platform with risks, SWOT, policies, incidents, SARs, vendors and RoPA, in two cuts (a first prototype and a fuller Docker MVP). None of the three references the others. There is no client name, no contract, no delivery record and no evidence any of it was used with a client.

## 1. The service: vDPO (DPO as a Service)

**Source**: `20251119-MMI-vDPO-Core_Instructions.txt`, 39 KB, dated 19 Nov 2025. Written as a system prompt for an "External DPO Agent". It is the fullest statement of the service and reads as the intended scope of the offer.

**Scope: twelve service lines**

| # | Service | Cadence | Stated deliverable |
|---|---|---|---|
| 1 | DPIAs | Per project | 12 to 20 page report, risk matrix, ICO consultation flag |
| 2 | ROPA management | Annual or bi-annual | Audit-ready ROPA plus gap analysis |
| 3 | Policy and procedure suite | On onboarding, then annual refresh | Six core documents: DP policy, privacy notices, DSR procedure, retention schedule, breach procedure, international transfer policy |
| 4 | DSAR support | Per request | Acknowledgment, search checklist, response letter, deadline tracking (1 month, 2 month extension) |
| 5 | Breach advisory | Per incident | Art. 33 / 34 decision, ICO notification draft, 72 hour countdown, lessons report |
| 6 | Vendor due diligence and DPAs | Ad hoc | RAG vendor rating, Art. 28 DPA with UK Addendum |
| 7 | Staff training | Annual or bi-annual | 60 to 90 minute core module, role modules, materials pack |
| 8 | Monthly threat intelligence report | Monthly | 8 to 12 pages, data protection lens |
| 9 | Board briefing | Quarterly or bi-annual | 30 to 45 minute deck plus board pack summary |
| 10 | Quarterly log review | Quarterly, before board briefing | Log analysis report (SIEM, access, exceptions, DSAR, breach logs) |
| 11 | Annual compliance cycle | Annual | ISMS / SoA review, access review, BC / DR / IR test, policy refresh |
| 12 | Ad hoc assurance and advisory | On call | Security questionnaires (3 to 5 day turnaround), evidence packs, M&A DD, same or next day advice |

**Operating model as written**
- Legal frame: UK GDPR and DPA 2018 throughout; ICO as supervisory authority; UK Addendum to SCCs for transfers; PECR and NIS flagged as sector overlays.
- Onboarding: a structured initial call covering business context, current posture, regulatory obligations, service expectations and system access; output is an onboarding summary with SLA and initial work plan.
- Response times committed: breach assessment same day (4 hour target); DSAR triage 24 to 48 hours; routine advice 1 to 2 days; policy 5 to 10 days; DPIA 10 to 15 days; training 4 to 6 weeks.
- Quality gate: every deliverable reviewed by a "senior MITMARK InfoSec Manager" before release. This role is named but not defined; it is the human in the loop.
- Escalation to that manager: any notifiable breach or uncertainty about one, ICO contact, novel legal issue, conflict of interest, liability risk, high residual risk DPIA, non-adequate transfer, client complaint, SLA at risk.
- Human review mandatory before release: ICO notifications, board materials, complex-law policies, high-stakes advice, first-of-type deliverables.
- Risk language: RED / AMBER / GREEN with trend arrows, used consistently across breach, vendor, board and monthly reporting.
- Confidentiality: information barriers between clients, no cross-client detail.
- Citation rule: ground advice in ICO guidance with a citation format.

**Judgement**: this document is a service catalogue dressed as a prompt. It is broad (twelve lines) and generic (no sector, no client, no pricing, no capacity). It does not say which lines MITMARK can staff. The "senior InfoSec Manager" is a load-bearing role that does not exist in the archive.

## 2. The offer as sold: Operation Data Compliance

**Source**: `Data Compliance 1.png`, `2.png`, `3.png` (Dec 2025, approx 5 MB each, AI-generated infographics, military theme, Mitmark Intelligence Ltd branding) and `vDPO Service Visuals.pptx` (two slides, both the same image as `Data Compliance 1.png`, nothing else in the deck).

**Panel 1, the legal mandate and strategic defence**
- Hook: UK limited companies processing personal data must register with the ICO and pay the fee; failure is a criminal offence with fines to company and directors.
- Battlefield: storing customer details, payroll and bank records, marketing email, CCTV, website and app data collection.
- Threats used: ransomware with no backups; CCTV footage request failure; SAR failure with no inventory. Consequence cited: fines up to £17.5m or 4% of global turnover.
- Solution: four pillars, documented policies, role-based access control, defined response plan, regular reviews. Grounded in "GDPR and ISO 27001 best practices".

**Panel 2, the roadmap: five phases**

| Phase | Name | Content | Time |
|---|---|---|---|
| 1 | Reconnaissance and critical fixes (Assessment) | Identify processing, register with ICO, assess risks and gaps | approx 2 weeks, 4 consultancy days |
| 2 | Strategic planning (Policy design) | Documented policies, role-based access, response plan | approx 2 to 4 weeks, 8 consultancy days, runs in parallel with urgent actions |
| 3 | Deployment and fortification (Implementation) | Security measures, staff training, data inventory | Future, unscheduled |
| 4 | Inspection and review (Audit) | Regular reviews, response plan tests, compliance verification | Future, unscheduled |
| 5 | Garrison duty (Maintenance) | Ongoing adjustments, data requests, continuous improvement | Future, unscheduled |

**Panel 3, price**
- Standard day rate £800 ex VAT, shown struck through.
- Reduced rate £650 ex VAT, labelled "Strategic Alliance", with a callout "Rich's authorisation: ongoing relationship discount applied".
- Phases 1 and 2 priced by days: 4 plus 8 = 12 consultancy days. At £650 that is £7,800 ex VAT; at £800, £9,600 ex VAT. The panels do not state the totals; these are arithmetic on the stated figures.
- Phases 3 to 5 "scheduled according to internal priorities and resource availability, target high-risk items immediately".

**Judgement**
- Fact: this is a proposal to a specific prospect, not marketing. "Rich's authorisation" and "ongoing relationship discount" mean a client already known to Rich. The client is not named anywhere in the archive.
- Fact: the visuals sell an SME-scale entry engagement (ICO registration, policy set, response plan) rather than the twelve-line DPO retainer in the core instructions. The two documents describe different products at different scales.
- Uncertainty: whether the prospect took it. No follow-up, SOW or invoice in the archive.
- Judgement: the day-rate model and the phase 1 and 2 scope are the most reusable commercial content in the archive. Phases 3 to 5 map directly onto the retainer in section 1 (training, audit, maintenance), which is the natural upsell.

## 3. The software: Aegis (Tessera_INFO_SEC)

**Source**: `Tessera_INFO_SEC/`, a git repo, all files dated 5 Sep 2025. Two cuts inside one folder. The README title is "Aegis - Security & Compliance Platform"; the folder name is the only place "Tessera" appears. The repo is generic (MIT licence line, "Built with ❤️", CCPA / HIPAA / SOX options on the onboarding form); it reads as AI-generated scaffold, lightly adapted.

**Cut A: root prototype** (`backend/`, `frontend/`)
- FastAPI, async SQLAlchemy, PostgreSQL; Next.js 14, Tailwind, React Query.
- Magic-link login (link printed to console, no email service).
- Four routers: auth, risks (CRUD with likelihood and impact), dashboard (score and SWOT), policies (generates one Information Security Policy as a text file from a placeholder template).
- Status: skeleton. Not runnable without a database and env set-up; no tests.

**Cut B: `mvp/`** (Docker Compose, the fuller build)
- Services: Postgres 15, LocalStack (S3 for evidence, SQS for jobs), FastAPI backend, Celery worker, Next.js frontend. GitHub Actions CI file present. Two pytest files (health, risk engine).
- Data model, 20 tables: organisations, users (roles), assets, data_categories, vendors, processing_activities (RoPA), controls, assessments, findings, risks, tasks, evidence, policies, incidents, dpias, sars, training_records, audit_logs, plus two link tables.
- Fourteen API routers under `/api/v1`: auth (stub, `Bearer dev-token`), orgs, assets, vendors, ropa, assessments, risks, swot, tasks, evidence, policies, incidents, sars, exports.
- Frontend pages: 6-step onboarding (organisation, industry, scale, data types, frameworks, controls) which creates an "Initial Baseline Assessment"; dashboard; risks; policies; incidents; SARs; vendors; RoPA. RAG badge component.
- Logic that exists: risk score = likelihood x impact, RAG at <=8 green, <=15 amber, else red; incident ICO deadline = occurred_at + 72 hours; SAR due = received_at + 30 days; evidence hashed SHA-256 and BLAKE3 on upload; audit log service.
- Logic that is placeholder: SWOT is canned strings padded to three per quadrant; policy generation is three f-string templates (information security, data protection, incident response) with the organisation name substituted; exports router exists but DOCX and PDF generation is not wired (python-docx-template and WeasyPrint listed, no templates); Celery task is a stub.
- Seed data: "Demo Organisation", three users, three assets, two vendors, three risks, three tasks, two incidents, two SARs, two processing activities.

**Judgement**
- Fact: the MVP data model covers the same ground as service lines 1 to 6 and 11 of the core instructions (DPIA, RoPA, policies, DSAR, breach, vendor, evidence, training records). The instructions and the schema were plausibly generated from the same mental model, two months apart, but neither cites the other.
- Fact: there is no deployment, no domain, no client tenancy, no auth. It has not been run for a client.
- Judgement: the schema is a usable starting point for a client-facing compliance workspace; the business logic is not. The repo's value is the table design and the page list, not the code.

## 4. Consolidated position, September 2026

**What is settled (by the archive)**
- The product line is data protection compliance for UK SMEs, delivered by MITMARK, framed as an outsourced DPO plus an entry "assessment and policy design" engagement.
- Price anchors exist: £800 day rate standard, £650 relationship rate, 12 days for phases 1 and 2.
- The service catalogue (twelve lines) and the software model (20 tables) exist and agree with each other in substance.

**What is open (not in the archive)**
- The prospect behind the December 2025 proposal, and its outcome.
- Who the "senior InfoSec Manager" is, and MITMARK's actual capacity to staff any of the twelve lines.
- Whether the Aegis code is to be built on, or the schema lifted into a Tessera product and the code dropped.
- The product name. "vDPO", "Operation Data Compliance", "Aegis" and "Tessera_INFO_SEC" are all in play; none is decided.
- Pricing for the retainer (lines 7 to 12). Only the day-rate entry engagement is priced.
- Relationship to Tessera Shield and the wider Tessera family (not referenced anywhere in the archive).

**Material limitations of this KB**
- Three documents and one repo; the archive is thin, not large. The 28 MB is mostly images and git objects.
- The core instructions and the visuals were not authored by the same process and are not reconciled; where they differ, this KB reports both.
- Client and contract facts are absent, not merely unfound.

## Source index

Archive of record: `C:\Users\Bendy's Office PC\OneDrive\MITMARK\MITMARK Capabilities\Maxima\` (OneDrive, mini PC). Read only. Defunct for working purposes.

| File | Date | Size | One line |
|---|---|---|---|
| `20251119-MMI-vDPO-Core_Instructions.txt` | 19 Nov 2025 | 39 KB | Twelve-line vDPO service definition as an agent prompt; SLAs, escalation, onboarding script |
| `Data Compliance 1.png` | Dec 2025 | 5.2 MB | Proposal panel 1: legal mandate, threats, four-pillar solution |
| `Data Compliance 2.png` | Dec 2025 | 5.0 MB | Proposal panel 2: five-phase roadmap, 4 plus 8 consultancy days |
| `Data Compliance 3.png` | Dec 2025 | 5.1 MB | Proposal panel 3: £800 struck to £650 ex VAT day rate, phases 1 and 2 timeline |
| `vDPO Service Visuals.pptx` | Dec 2025 | 5.3 MB | Two slides, both panel 1 image only; no text, no notes |
| `Tessera_INFO_SEC/README.md` | 5 Sep 2025 | 5 KB | Aegis prototype (cut A) overview and endpoints |
| `Tessera_INFO_SEC/mvp/README.md` | 5 Sep 2025 | 10 KB | Aegis MVP (cut B) architecture, features, run instructions |
| `Tessera_INFO_SEC/mvp/infra/initdb/0001_base.sql` | 5 Sep 2025 | 13 KB | The 20-table schema; the most reusable artefact in the repo |
| `Tessera_INFO_SEC/mvp/backend/app/models.py` | 5 Sep 2025 | 16 KB | SQLAlchemy models matching the schema, with enums |
| `Tessera_INFO_SEC/mvp/backend/app/services/risk_engine.py` | 5 Sep 2025 | 1 KB | RAG thresholds |
| `Tessera_INFO_SEC/mvp/backend/app/services/policy_gen.py` | 5 Sep 2025 | 6 KB | Three f-string policy templates |
| `Tessera_INFO_SEC/mvp/frontend/app/onboarding/page.tsx` | 5 Sep 2025 | 13 KB | Six-step onboarding form and option lists |
| `Tessera_INFO_SEC/mvp/backend/seed.py` | 5 Sep 2025 | 16 KB | Demo data |
| `Tessera_INFO_SEC/.git/` | | approx 1,300 objects | Commit history not read (workspace down); dates from file mtimes |

Not read: `frontend/package-lock.json`, `.git` objects, Dockerfiles, config stubs, the empty `Information_Security_Policy.docx` placeholder (149 bytes).

## Smallest next decision

Sunray states the ASSURE intent against this baseline: which of the three artefacts is the seed (service catalogue, entry engagement, or schema), and whether the December 2025 prospect is still live.

## Addendum, 16 Sep 2026: MAXIMUS, the prior version

Sunray confirmed a prior build named MAXIMUS (Netlify project `tessera-maximus`, still deployed; key files supplied: netlify.toml, index.html, built CSS and JS). Read from the built bundle's UI strings, not from source:

- A two-sided web app: a **client portal** (white, client accent colour) and an **admin workspace** (dark HUD). Vite and React, Tailwind 4, Netlify Functions API at `/api/*`, pnpm monorepo (`@maximus/web`, `@maximus/shared`).
- Client side: **Policy Guide** (ask questions of the approved policies, with example prompts about CCTV retention, sharing tenant contacts, copies of data); **Raise a request** intake (data request or report a concern) that starts a **statutory clock** (SAR one month, breach 72 hours) and alerts the compliance officer; **Posture** across five compliance domains with a 12-week trend, set by the officer; **Value snapshot** ("work done and risk retired this quarter, everything logged and auditable"); **Policy pack** with a **defence-file export** (zip with summary PDF and every approved policy, officer-approved before generation).
- Admin side: **Review queue** (amber escalations, export requests, alerts, intakes, every decision audited under the reviewer's name); **Policies** with draft and approved immutable versions; **Posture control**; **Exposure alerts** with a demo-data flag ("always marked as demo data, cannot be presented as live monitoring"); **Audit log** with CSV export; sign-in with email and password.
- The wording ("tenant", "letting agent", "CCTV") shows it was already written for an estate client.

Bearing on ASSURE: MAXIMUS is the product surface the archive lacked. ASSURE v0.1's Record and Statement are the value layer MAXIMUS called a "value snapshot" and did not develop. The right sequel is to put the ASSURE record and statement inside the MAXIMUS shell rather than grow ASSURE into a second portal. Source code location for MAXIMUS is not yet known to Seagull; the netlify.toml refers to DECISIONS.md in its repo.

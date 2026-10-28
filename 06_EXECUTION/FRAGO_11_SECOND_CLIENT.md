---
document: FRAGO_11_SECOND_CLIENT
job: CAST-0009 ASSURE
version: v1.0
status: ISSUED 2026-10-28 (R01 DC-79, DC-80). Product target: Tessera Assure v1.10, the version shown to the second client at its pitch on Friday 30 October 2026, 1400 UK.
authority: Seagull, under T02 A6 and Sunray's standing delegation of 30 Sep. Source: Rich's email of 27 Oct (a branded account for the prospect; a globe tile with its jurisdictions), the operator's gap assessment of 27 Oct (filed in material/restricted), and Sunray's decision of 28 Oct 0950 (the prospect gets its own profile on the live product, like the first client).
supersedes: nothing. FRAGO 01 to 10 stand except where this order says otherwise.
---

# FRAGO 11. The second client's organisation, and the global coverage tile

## 1. Situation

The first client is live on v1.9. A second client, a prospect, meets MITMARK on Friday 30 Oct at 1400 UK for a second-chance pitch against one rival bid. The rival was favoured for operational depth: entity-by-entity coverage across eight jurisdictions, a four-week urgent remediation package, 32 hours a month with a 24-hour breach line, 22 numbered deliverables with acceptance terms. Rich will present; the operator is on leave all week; Sunray gives the product demonstration. Rich has asked for two things of the product: the prospect's own branded account, and a tile "featuring the globe" with the prospect's jurisdictions.

The product is already multi-tenant (T18 section 10): a second client is a second organisation, not a second build. What is new is the tile, and a seed that carries the proposed programme rather than a handover. The prospect's identity (name, website, colours, logo, contacts) is in `material/restricted/second_client/` on the mini PC and nowhere else. The seed manifest there carries no name.

T02 stands, read for a prospect: nothing shown may claim work that has not been done; no percentage without its fraction; colour never carries meaning alone; the client's name stays in the store and in material/restricted; no name in any URL (A7), so the address shown on Friday is https://assure.tessera-monitor.com and the brand appears after sign-in.

## 2. Mission

Ship v1.10: the second client's organisation created, branded, seeded from its manifest and given one role-named client seat; a Global coverage tile on the Compliance Tracker driven by a per-organisation jurisdictions list; the restricted check reading every `- Client:` line. Deploy, gate, report. No new money committed. Live and gated by 1700 GMT Thursday 29 October, so Sunray can walk it Thursday evening and Friday morning.

## 3. Execution

### 3.1 Restricted check, every client (first code change)

- `06_EXECUTION/gate/check_restricted.py` and the gate's `load_restricted_names` take every `- Client:` line in `material/restricted/CLIENT.md`, not the first, plus every `- Information Officer:` line. The terms list grows accordingly; the pass line reports the count.
- `ASSURE_RESTRICTED_NAMES` (FRAGO 10 section 7) stays as the override for machines without the restricted folder. This build runs on the mini PC, where the folder is present.
- Run the check before this commit and every commit after. The second client's name is already in two committed files (`07_HANDOVER/ASSURE_SESSION_HANDOFF_03.md` and `ASSURE_SESSION_INITIATING_PROMPT_03.md`, as a memory-file slug and a first name); Seagull scrubbed both in the commit that carries this order. The check must come back 0 hits over the folder before the first push.

### 3.2 The organisation (configuration, through the API, under the demo manager or Sunray's manager session)

- **Create** the organisation with display name from `material/restricted/second_client/BRAND.md` (the trading name), jurisdiction `UK` (the enum's nearest), and the regulation label from the manifest.
- **Name on the Statement** the same trading name. Information Officer label: the role in the manifest (`Group Compliance Lead`), not a person. Contract lead: the operator with her title, as on the first client.
- **Logo:** `material/restricted/second_client/client_logo.png` (navy on transparent). If it looks soft at the menu head at 1920 wide, use `client_logo_2x.png`. Never the white file. Logo bytes must appear in no file under the job folder outside `material/` and not in the bundle (gate line 77 extended to this organisation).
- **Accent:** `#1F2A44` through the client-accent route. Measure contrast of every accent use on the light portal at 4.5:1 for text and 3:1 for graphics; if any use fails, the house token stays for that use and the report says which.
- **Modules:** 1 to 8 `Available` (nothing is Live: no work has started). Module introductions default.
- **Rates and fee:** hourly 45 (house), day rate 850, retainer 5000, as the manifest. Show illustrative off. The Statement then shows the service, the fee, and "what comes next" from the dated workplan, and says plainly that no work has yet been recorded.
- **Seed:** `pnpm --filter @maximus/server seed-organisation` with the manifest, dry run first, then real. Expect 27 tasks, 0 documents, 0 clocks; journey phase 1. The seed must accept the new `jurisdictions` block (3.3) and the `settings` keys it does not yet know (`showIllustrative`, `moduleStatus`, `rates`, `informationOfficerLabel`); extend it rather than setting these by hand.
- **Users:** one client user on the organisation, display name `Group Compliance Lead`, not a test seat (its view is the one shown on Friday and must look like a client's). Its one-time password goes to Sunray in the build's chat report and nowhere in the folder. No manager account is created or changed.
- **Record:** empty. **Documents:** none. The retention schedule: empty (module 3 says "No schedule yet" rather than a borrowed one).

### 3.3 Global coverage tile (product change)

- **Data.** A new per-organisation settings list `jurisdictions`: id, name, hub, regulator, law, filingDuty, lat, lon, status (`not_started`, `in_progress`, `done`, `attention`). Shape as the manifest. Seeded for the second client; empty for every other organisation, where the tile does not appear. Editable in **Settings** under "Jurisdictions" (add, change, remove, save), by the operator only; the client reads it.
- **Where.** The Compliance Tracker, between Journey and Overall compliance status, as a full-width tile titled **Global coverage** when the list has two or more entries, and **Coverage** with one. Rich's word is "globe"; the tile is a world map, equirectangular, one static SVG land outline vendored into the web app from a public-domain source (Natural Earth 1:110m, simplified to under 120 KB), no tiles, no network, no new dependency. Land in the house muted surface tone, sea in the page background, markers in the status mark colours of v1.9 with the same edge rule, each marker labelled with the hub name.
- **Beneath the map,** the same entries as a table for phones and screen readers: hub, jurisdiction, regulator, law, status with its word. Choosing a marker or a row opens a card: name, hub, regulator, law, and "Filing duty (to be confirmed at mobilisation): …" with the filingDuty text, and the status. The card wording is the qualifier; nothing on the tile claims a filing has been made.
- **Module 1 (DPO registration)** page: the same table under Useful links, titled "Registrations and filings by jurisdiction", read from the same list.
- **Phone:** below 640px the map is hidden and the table carries the tile; above, both show. No horizontal scroll at 390.
- **Contrast and tokens:** house tokens only, Inter and JetBrains Mono, marks at 3:1 and words at 4.5:1 at the three widths. Colour never alone: every status has its word on the row and on the card.
- **Audit:** a change to the list writes one audit entry naming the count, never the entries.
- **View as client** shows the tile as the client sees it.

### 3.4 Hand-over material

- **T18** gains section 5o: the Jurisdictions setting and the Global coverage tile; creating a second organisation from a manifest with the extended seed; the Available status for a prospect; the restricted file's second entry (by role, no name).
- **T27** unchanged (role-only; sent by the operator when there is a client user).
- **T26 roadmap** gains one line: entity filings tracked as records (T23 class), so status on the tile moves from the work itself.

### 3.5 Gate (T14 v1.10)

Keep everything from v1.9 that still applies, plus:
- Restricted check: every `- Client:` line read; 0 hits over the folder and the bundle; the second client's logo bytes in no file outside `material/` and not in the bundle.
- The second organisation exists with the display name from the restricted file (restricted match, not printed); logo present; accent set; modules 1 to 8 Available; 27 tasks; 0 documents; journey phase 1; show illustrative off; fee 5000; one active client user, not a test seat; audit entries under the manager's id only.
- Global coverage tile on the second organisation's tracker at three widths: map present at 1366 and 1920, hidden at 390; eight markers with labels; the table beneath with eight rows; each card opens with the qualifier text; contrast measured.
- The tile absent on the first client's tracker and on the demo (empty lists). The first client organisation checked by reads only (DC-70 item 7); its audit read at run start and end; no entry by the gate.
- Settings "Jurisdictions" edit round-trips on the gate organisation (add one, change it, remove it), with one audit entry each.
- Module 1 page of the second organisation shows the registrations table.
- Gate pinned to the demo at every operator sign-in (DC-63). The second organisation's client view is driven as its own client seat only for the client-side lines; nothing the gate does on it changes a task, a document or a setting.

## 4. Service support

As FRAGO 03 section 4 and FRAGO 10 section 4. Build on the mini PC in the job folder (the restricted folder is there). Source `06_EXECUTION/build/maximus-src`; commit as `Seagull <seagull@cast.local>` on master; `check_restricted.py` before every commit; push to origin master after each commit; deploy to Netlify site `tessera-assure` (`62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`) with absolute paths and `--skip-functions-cache`; gate against https://assure.tessera-monitor.com at 1920x1080, 1366x768 and 390x844. No new dependency, no environment variable or secret change, no real person's password reset. The demo manager's password: as DC-76, read from an existing file, never printed or written under the job folder; if no file exists, use Sunray's manager session offered in chat, and if neither, stop at the gate and report.

## 5. Command and signal

- Delete stale `.git/*.lock` first (deletion permission is per session).
- Build session sole writer of R01 while it runs; append from DC-81. DC-79 and DC-80 are Seagull's and are in.
- Write BUILD_REPORT section v1.10, `T14_DEFINITION_OF_DONE_V1_10.md`, `T17_BATTLE_INSPECTION_V1_10.md`, T18 5o.
- Stop conditions as FRAGO 09 and 10, plus: the second client's name or logo bytes in any file outside `material/restricted/` or in the bundle is a stop; any status on the tile shown without its word is a stop; any claim on the tile or card that a filing or registration has been made is a stop; any write to the first client's organisation is a stop.
- Two fix passes on the gate. Report: deploy id, gate result, deviations, both client organisations' audit entries since 23 Oct 08:35 UTC, the client seat's one-time password (chat only), what waits on whom.

## 6. Timings

Issued 28 Oct 1000. Live and gated by 1700 GMT Thursday 29 October. Report on deploy. Sunray walks it Thursday evening; one fix pass Friday morning if needed; the pitch is Friday 1400 UK.

## 7. Not in this order

- The expanded Statement of Work, the SLAs and the 22 deliverables: Rich and the operator. The workplan in the seed mirrors the gap assessment so the product and the SoW agree; the SoW wording is theirs.
- A client-named address or subdomain (A7: none). Email. The Anthropic key. SESSION_SECRET. Structured registers (T23). PDF extraction.
- Who at the prospect gets a sign-in after Friday: Sunray, with Rich, after the meeting.

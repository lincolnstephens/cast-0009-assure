---
document: BATTLE_INSPECTION
job: CAST-0009 ASSURE
version: v1.0
status: DEPLOYED, GATE PASSED, AWAITING SUNRAY VISUAL CHECK
authority: Seagull, executed by the build session under T02 A6
---

# ASSURE battle inspection, v1.0

- URL: https://tessera-assure.netlify.app (Netlify project `tessera-assure`, site id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`, unlisted, noindex, no password)
- Deployed: 2026-09-17, production deploy `6aabd4f08da2e6146d2d98c7`
- Source: `06_EXECUTION/build/maximus-src/`, built output copied to `06_EXECUTION/build/dist/`
- Spend: £0. Netlify on the existing team plan, Netlify Blobs on the same plan, no database, no new service.
- Client name: absent from the page, the source, the built output, the store, the seed data, the URL and the project name. Checked by `06_EXECUTION/gate/check_restricted.py`, which reads the names at run time and never prints them.

## The gate

`06_EXECUTION/gate/g7_gate_assure_v1.py` against the production URL: **PASS, 36 of 36**. Full run in `06_EXECUTION/gate/GATE_RESULT.md`.

- Static, 7 of 7: source present, no banned term, no em dash, no retired house colour, no restricted name, no key value in source, print stylesheet present.
- Driven, 29 of 29, at 1920x1080, 1366x768 and 390x844, against the deployed product.

## The ten lines, as driven

| # | Line | Result |
|---|---|---|
| 1 | Sign in and arrive in the client portal | Pass at all three widths |
| 2 | Six client views load and show a heading | Pass. Policy Guide, requests and clocks, Value, Statement, posture, exposure |
| 3 | Nine admin views load and show a heading | Pass. The operator signs in separately; the Information Officer cannot reach the admin side at all |
| 4 | The Record shows one row per entry | Pass. 15 entry rows, each with a named reviewer |
| 5 | The Statement states its own limitations | Pass. "have not been independently verified" present |
| 6 | Illustrative entries do not reach the client when the switch is off | Pass. The word does not appear in the client statement |
| 7 | The Statement prints as a document | Pass. Header and navigation hidden, statement visible |
| 8 | No horizontal overflow at 390 wide | Pass on every view |
| 9 | Console clean | Pass. Zero console errors, zero page errors |
| 10 | Not indexable | Pass. `noindex` in the head and in the response headers |

## Also inspected by the build session

- Screenshots taken of the client Record, the client Statement, the Policy Guide, the admin Record, admin Settings and the review queue at 1440 wide.
- Client portal renders light, admin workspace dark, both from the Tessera tokens. Inter for text, JetBrains Mono for figures and labels. Square corners at night, 8px in day. Severity colours on status only. Neither retired colour anywhere.
- 102 unit and integration tests pass. A local end to end smoke test of the API passes: sign-in, the Record, the Statement, the illustrative rule, the v0.1 import, and clock-to-entry.
- The v0.1 JSON export format imports cleanly, takes the valid rows, and reports the rows it could not read rather than dropping them silently.

## Against A7

- **No new system for the Information Officer to maintain.** She has the two intakes she already had and nothing else. Every other form is on the operator's side, behind a separate account she cannot reach. Holds.
- **No claim without a record.** Every figure on the client side derives from an entry with a named reviewer. Entries created automatically by a closed clock, an approved policy, an answered Guide question or a completed export carry the name of the admin who closed the work. Holds.
- **No marketing to the CFO.** The Statement's wording is carried over verbatim from v0.1. It states its limitations, and states plainly when the retainer fee has not been entered and therefore no ratio is shown. Holds.
- **The human service is not thinned.** The product records the service; it does not deliver it. MITMARK review before anything reaches the client is unchanged. Holds.
- **The client's name.** Absent everywhere, and the prior build's branding assets and policy pack that carried it were deliberately not copied in. Holds.
- **Spend.** £0. Holds.

## Defects found by driving the product, and fixed

These were not visible from reading the code and are the reason the gate is driven.

1. The API ran as a Netlify v1 function, which is not given the uncached edge URL that Netlify Blobs needs for strong consistency. The operator could switch illustrative entries off, see it saved, and the client portal would go on showing them. Fixed by moving to a v2 function over a pre-bundled server.
2. A stale read could make the seeder treat a live organisation as missing and write an empty document over it. Fixed: an organisation is only created when two reads agree it is absent, and a seed marker stops any re-seed over the operator's work.
3. Two sign-ins at once could lose each other's write, because sessions lived in one shared document. Sessions are now their own blobs.
4. A signed-out visitor's first page load produced a console error. The session probe now answers 200.
5. The prior build's stub Users page shipped as an empty screen. Removed.

## Known limits at this version

- The record is seeded with fifteen illustrative entries and one open data request, all marked illustrative where they are entries. It is real in structure and illustrative in content until Lurong enters real items.
- Rates are defaults, £45 an hour and £650 a day, and the Statement says they are assumptions until the client confirms them. The retainer fee is not entered, so the Statement shows no ratio and says why.
- `ANTHROPIC_API_KEY` is not set on this site, so the Policy Guide answers from its deterministic keyword matching rather than the Anthropic API. It still answers from approved policies only. Setting the key is one step and is the smallest next decision for Sunray.
- Posture and exposure carry demo data and say so on screen.
- The two demo accounts use a demo password. Change both before anything is shown outside MITMARK.

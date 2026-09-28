---
document: BATTLE_INSPECTION
job: CAST-0009 ASSURE
version: v1.4
status: DEPLOYED, GATE PASSED, AWAITING SUNRAY VISUAL CHECK
authority: Seagull, executed by the build session under T02 A6 and FRAGO 04
---

# ASSURE battle inspection, v1.4, tile contrast and view as client

- URL: https://tessera-assure.netlify.app (site id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`, unlisted, noindex)
- Deployed: 2026-09-28 at 15:34 BST, production deploy `6aba7af60408911991163ecf`.
- **Late.** The order's H-hour was 15:00 BST, and the build session was started at 15:09, after it had passed. Work began at once and went live 34 minutes late (DC-43).
- Spend: no new money committed. What was spent: build-session time, local compute, and two deploys on the existing Netlify plan (one draft gated first, then one production).
- Client name: `check_restricted.py` finds 0 hits across 265 files. This is also gate line 30.

## The gate

**PASS, 118 of 118**, against the production URL, after passing 118 of 118 on draft `6aba76fa6f97d10099e10f3a` first time. No fix pass was needed.

Lines 1 to 31 are v1.3's, unchanged and passing. The new lines:

| # | The line | Result |
|---|---|---|
| 32 | Tile text at 4.5:1 or better against its fill, in every RAG state, at all three widths | Pass. Measured in the browser: green 9.08, amber 7.24, red 4.64, grey 4.83. Grey is measured on a probe tile, because no module is grey in the demo |
| 33 | In client view the operator receives exactly the client seat's response | Pass. 16 client reads compared byte for byte, and no field needed excluding as volatile |
| 34 | In client view every write is refused and the task is unchanged | Pass. Confirm, a Guide message and a request are all refused 403 "Read only in client view". The task is unchanged, and the operator is refused without the marker |
| 35 | For the client seat the preview marker does nothing | Pass. The same 16 reads, with the marker set to the client's own organisation and to a bogus one |
| 36 | The banner is on every client page in client view and on none for the client | Pass. Six client pages and a module page; writes are disabled; return lands in admin |
| 37 | The admin's stricter toggle does not change the client view figure | Pass. The toggle was set to "cycle", checked, and restored to "overdue" |
| 38 | One audit entry per client view session | Pass. Three reads wrote one `client_view.open` entry, with the operator as actor |

## Tile contrast, measured

The fills are the house status ramp, unchanged. The text colour is chosen by measurement, with no shadow.

| Fill | Dark text #1f2937 | White | Used | Ratio |
|---|---|---|---|---|
| Green #2ee6a6 | 9.08 | 1.62 | Dark | **9.08** |
| Amber #f5a623 | 7.24 | 2.03 | Dark | **7.24** |
| Red #d63a3a | 3.16 | 4.64 | White | **4.64** |
| Grey #6b7280 | 3.04 | 4.83 | White | **4.83** |

**Deviation.** The order names dark text for grey tiles, but dark on the house grey measures 3.04, below the 4.5 the same order requires. Grey therefore follows the order's own rule, applied by measurement, and takes white (DC-44).

## View as client: why a preview cannot leak

The preview is not an admin response trimmed down to look like the client's. It **is** the client's response. A single guard sits on every client router:

- **A client session** passes, and the marker means nothing to it.
- **An operator session** passes only with the marker `client:<orgId>`, and only for reads. It is then served as that organisation's own client-seat user.
- **Everything else** is refused before any handler runs.

The handler, the data and the computation are the client's, so no admin-only field can reach a preview response by construction (DC-45). The gate's byte-for-byte comparison confirms it on the live site.

Two faults found while building it (DC-46):
- **The Guide's thread read wrote the organisation document on every call.** It was fixed to be a pure read, and client view never creates the client's thread.
- **Download links cannot carry a header.** They now carry the same marker as a query parameter, still read only.

## Also inspected

- **225 unit and integration tests pass.** Ten are new, in `clientView.test.ts`. They cover:
  - identical reads
  - refused writes that leave the task and the review queue untouched
  - the stricter toggle having no effect
  - one audit entry per session, and a second session adding a second
  - no Guide thread being created
  - the marker doing nothing for the client, who can still confirm with it present
- **The draft was driven by hand at 1366 and 390 wide:**
  - The client sees no banner.
  - In client view all nine confirm controls are disabled with the read-only note beside them.
  - Return to admin ends the view.
  - There were no console errors.

## Against A7

- **No new system for her to maintain.** Holds: nothing changed on her side except tile legibility.
- **No claim without a record.** Holds: the operator now sees the same figures the client sees, from the same record.
- **No marketing to the CFO, and no spend.** Both hold.
- **The client's name** is not in the audit detail, which carries a session hash and the operator's name only. Holds.

## Known limits at this version

- **The gate leaves audit entries each time it runs:** client-view opens, and a settings update pair from line 37. The data is not changed.
- **No organisation switcher,** as ordered. The preview takes its organisation from the admin's selected account and carries the id explicitly, so a second client needs only a second account.
- **Unchanged from v1.3:** the journey stage is derived until the operator sets it; her documents are not filed; the file cap is 4 MB; the Anthropic key is rejected.

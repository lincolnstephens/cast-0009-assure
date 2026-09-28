---
document: FRAGO_04_CLIENT_VIEW
job: CAST-0009 ASSURE
version: v1.0
status: ISSUED 2026-09-28, for the build session. Product target: Tessera Assure v1.4, the version that goes to the operator.
authority: Seagull, under T02 A6, on Sunray's decisions of 28 Sep 2026 (R01 DC-42)
supersedes: nothing. FRAGO 01 to 03 stand.
---

# FRAGO 04. Tile contrast, and the operator sees what the client sees

## 1. Situation

v1.3 is live (deploy 6aba2719e5118b5c586c6971, gate 97 of 97). Two things stand between it and the operator's inbox. DC-37 left white text on the house green and amber tiles below the 4.5:1 contrast standard, and Sunray has now decided the fix. And the operator's standing requirement, not in her deck but stated by Sunray, is that as the manager of the DPO and vCISO service she must be able to see exactly the views her client's Information Officer sees, for this client and for every client after.

T02 stands in full. The rule that matters most here: what the client sees is computed for the client seat and nothing admin-only (the signed-off toggle, exposure, the workplan controls) may leak into it. A preview that shows the operator something the client does not get is worse than no preview.

## 2. Mission

Ship v1.4: module tiles readable at 4.5:1 or better in every state, and a read-only "View as client" for the operator that renders the client portal exactly as the client seat receives it. Deploy, gate, report. No new money committed.

## 3. Execution

### 3.1 Tile contrast (DC-42a)

- Tile fills stay the house status ramp. Text on green, amber and grey tiles becomes the dark house text colour (the client portal's `client-text` token), no shadow. Text on red tiles stays white if it passes 4.5:1 against the house red, otherwise dark text there too. One rule, applied by measurement, recorded in the build report with the measured ratios.
- The RAG label stays on the tile; colour never carries the meaning alone.
- Gate: measured contrast of tile text against tile fill at or above 4.5:1 for every RAG state, at all three widths, on the tracker page.

### 3.2 View as client (DC-42b)

**What the operator gets.** A menu item "View as client" in the admin workspace. It opens the client portal, the six client menu items and every page beneath them, rendered from the same components the client seat uses, with one addition: a fixed banner at the top, "Viewing as the client's Information Officer. Read only. Return to admin." with the return link. Nothing else differs. On phones the banner stacks and stays visible.

**How it must work, server side.** Client routes (`trackerRoutes` and the other `requireRole("client")` routers) accept a `mitmark_admin` session only when the request carries a preview marker the web client sets (header `X-Assure-Preview: client` or equivalent), and then:
- every read is served by the same code path and the same computation as the client seat, for the same organisation; the overall figure is the client mode (overdue-based) regardless of the admin toggle; nothing admin-only is added;
- every write (confirm, and anything else a client route might accept) is refused 403 in preview with a plain message ("Read only in client view"). The client's confirm button is rendered but disabled in preview, with that message beside it, so the operator sees the control exists without being able to press it as the client;
- the audit log records that an operator opened client view (one entry per session, not per request), so the record shows who looked and when.

**What must not happen.** The real client seat must never see the banner, the preview header must do nothing for a client session, and no admin-only field may appear in a preview response. The gate proves the first two; the third is proved by diffing responses (3.3).

**Multi-client.** The operator seat belongs to an organisation today. Build the preview against the operator's current organisation and keep the organisation id explicit in the preview marker, so that when the second organisation exists (handoff open item), "View as client" takes an organisation and nothing else changes. Do not build the organisation switcher in this order.

### 3.3 Gate

Extend the gate and DEFINITION_OF_DONE.json for v1.4:
- contrast line per 3.1;
- with the operator seat in client view, for every client GET the gate already drives (tracker home, each module, documents, jobs, clocks, statement, guide), the response body is identical to the client seat's response for the same organisation, allowing only a top-level `preview: true` flag if the build chooses to include one;
- with the operator seat in client view, the confirm request is refused 403 and the task's state is unchanged;
- with the client seat, a request carrying the preview header behaves exactly as without it;
- the banner is present in client view on every client page and absent on every page for the real client seat;
- the admin toggle set to the stricter mode does not change the client-view tracker figure;
- one audit entry is written on entering client view;
- everything in the v1.3 gate that still applies; `check_restricted.py` passes.

Gate must pass on the deployed URL before the build reports done.

### 3.4 Operator brief

T18 gains a short section: how to open client view, what it is for (see what she sees before you send her anything), that it is read only, and that it is logged.

## 4. Service support

As FRAGO 03 section 4. Source `06_EXECUTION/build/maximus-src`; commit as Seagull on master; `check_restricted.py` before every commit; deploy to site id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`; no new money committed and say what was spent; Tessera tokens only.

## 5. Command and signal

- The build session is the only writer of R01 while it runs; append from DC-43.
- Write the v1.4 section of `06_EXECUTION/BUILD_REPORT.md`, `T14_DEFINITION_OF_DONE_V1_4.md`, `T17_BATTLE_INSPECTION_V1_4.md`; update T18.
- Stop conditions as FRAGO 03, plus: any design under which a preview response could carry an admin-only field is a stop, not a deviation.
- Two fix passes on the gate, as before.

## 6. Timings

H-hour: 2026-09-28, live by 1500 BST. Report to Sunray on deploy.

## 7. Not in this order

Demo passwords and SESSION_SECRET (MITMARK, before the client sees the site); the Anthropic key; the operator's documents; the organisation switcher; the 18 Sep confirmation.

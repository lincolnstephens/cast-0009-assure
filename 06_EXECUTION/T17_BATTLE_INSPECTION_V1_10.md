---
document: BATTLE_INSPECTION
job: CAST-0009 ASSURE
version: v1.10
status: DEPLOYED, GATE PASSED, FIRST CLIENT ORGANISATION UNTOUCHED
authority: Seagull, executed by the build session under T02 A6 and FRAGO 11
---

# ASSURE battle inspection, v1.10, the second client's organisation and the Global coverage tile

- **URL:** https://assure.tessera-monitor.com. Site id `62b23338-2994-49ca-bc9e-0a4ba1cd5aaa`.
- **Deployed:** 2026-10-28, published 11:37 UTC, production deploy `6ae1de7d258acf6734eff856`. The order required it live and gated by 1700 GMT on Thursday 29 October; gated on 28 October.
- **Spend:** no new money committed, and no new dependency. Five deploys on the existing plan: four drafts and one production.
- **Secrets:** no environment variable or secret changed. No real person's password was reset. The second organisation's one client user was created with a one-time password, given to Sunray in the build's chat report only.
- **Client names and logos:** `material/restricted/` was present on this machine and read at run time; the second client's name, logo and manifest went into its own organisation in the product's store and nowhere else.
  - `check_restricted.py`: 3 names, 5 terms, 0 hits before every commit and over the folder with the built bundle in it.
  - Line 86 finds neither client's logo bytes in any file outside `material/restricted/` or in the bundle.

## The gate

**PASS, 266 of 266**, against the production address on run 1: the static checks plus the live lines at three resolutions, 1920x1080, 1366x768 and 390x844. Line 17 stays retired; lines 85 to 93 are new.

| Run | Result |
|---|---|
| Draft `6ae1cc64ae7f0aa5fa8cce37` | Not gated: the seed refused the supplied manifest (description over 500 characters) |
| Draft `6ae1ccec83e20962459719b4` | Not gated: used to configure and check the second organisation |
| Draft `6ae1cefba3d68ae7116e0540`, lines 83 and 85 to 93 | 31 of 34: line 93 at every width |
| Fix pass 1 | Product: View as client takes the previewed organisation's branding for every manager |
| Draft `6ae1d0c15d3ec654cdc60a5b`, lines 81, 83, 92 and 93 | 24 of 24 |
| Draft `6ae1d0c15d3ec654cdc60a5b`, full | 266 of 266 |
| 1, production `6ae1de7d258acf6734eff856` | **266 of 266** |

Unit and integration tests: **332 of 332**. 11 are new at v1.10, in `v110.test.ts`.

## What the inspection should look at

1. **The second organisation, in View as client.** Its name, logo and navy accent in the header; 27 tasks, all Not started; modules 1 to 8 Available; an empty Record.
2. **The Global coverage tile.** Eight markers, each a grey circle with its word in the table and the card. The card's filing line always reads "Filing duty (to be confirmed at mobilisation):". Nothing on the tile says a filing or registration has been made.
3. **On a phone** the map is hidden and the table stacks; nothing scrolls sideways.
4. **The Statement with nothing recorded.** It says so, gives the retainer and day rate, and shows no comparators. This applies to the first client's Statement too, which has no Record entries.
5. **Settings, Jurisdictions.** The gate's round trip (line 90) runs on the gate's own organisation only.

## The client organisations

**The first client (`org-f2b4afdf0d`), read only.** 114 audit entries at run start and at run end; the newest is `fce3270b` of 27 Oct 13:51:47 UTC both times. Six entries since 23 Oct 08:35 UTC, none by the build or the gate: two `document.update` (DC-74), one `client_view.open` by the operator, one `document.download` and two `chat.message` by a client user.

**The second client (`org-fb773095ba`).** 40 audit entries at run end, all under the demo manager's id:
- six configuration entries: `organisation.create`, `organisation.seed`, `settings.update`, `branding.update`, `branding.logo.set` and `user.create`;
- 34 `client_view.open`, from the build's checks and the gate's views (line 92).
No task, document or setting was changed by the gate (line 92).

## Stop conditions

None was met.
- **The second client's name or logo bytes outside `material/restricted/` or in the bundle:** none (`check_restricted.py`, lines 50 and 86).
- **A status on the tile without its word:** none (line 88).
- **A claim that a filing or registration has been made:** none (line 88).
- **A write to the first client's organisation:** none (line 83 and the independent reads).

## Deviations

- The Statement's empty-Record wording and module 3's "No schedule yet" apply to every organisation (DC-81 items 8 and 9).
- View as client branding changed for the demo manager's account (DC-81 item 10).
- Accent contrast is measured in View as client, not by signing in as the client user (DC-81 item 13).

## What waits on whom

- **Sunray:** sign in once as the second organisation's client user and set its password before Thursday's walk; walk the portal at 1366 and on a phone; the OneDrive password file; the repository made private; `SESSION_SECRET` and the Anthropic key.
- **Rich and the operator:** the Statement of Work wording, the SLAs and the deliverables; after mobilisation, each jurisdiction's filing duty and the workplan dates.

---
document: FRAGO_08_CLIENT_READY
job: CAST-0009 ASSURE
version: v1.0
status: ISSUED 2026-10-14 (R01 DC-69). Product target: Tessera Assure v1.8 plus the client organisation configured for its first use.
authority: Seagull, under T02 A6 and Sunray's standing delegation. Sunray's instruction 14 Oct: the client organisation as close to up and running for the client and its Information Officer as possible, as soon as possible; the client's logo on its account; a MITMARK Intelligence mark as a watermark on the client view.
supersedes: nothing. FRAGO 01 to 07 stand.
---

# FRAGO 08. The client organisation, ready for its Information Officer

## 1. Situation

v1.7 is live and gated. The client organisation holds the operator's workplan, documents, links and schedule, but its settings are still the defaults from creation: generic display name, every module "Available", no contract lead, no branding. Two accounts for real people exist (the operator, active; the Information Officer, with no usable password). Sunray has decided the display name: the client's trading name, as it appears on the logo now in `material/restricted/client_logo.png`.

The restricted rule holds in a new form here: the client's name and logo go into the product's store for this organisation only, through the API or the admin pages, read from `material/restricted/` at run time. Neither the name nor the logo file enters code, seed files, gate fixtures, commits or reports. The gate's own test organisation keeps a neutral name and no logo.

## 2. Mission

Configure the client organisation for first use and ship v1.8: per-organisation client branding (logo) and the MITMARK mark on the client view. Deploy, gate, report. No new money committed.

## 3. Execution

### 3.1 Configuration of the client organisation (org-f2b4afdf0d), by API or admin UI, not by code

Sign in as the demo manager (Sunray re-enabled it 14 Oct) and set, for this organisation only:
- Organisation name and client display name: the trading name, read from the first line of the logo's wordmark and from `material/restricted/CLIENT.md`. Never type it into any file in this folder.
- Information Officer name: "Information Officer" (the role; Sunray or the operator may change it to her name).
- MITMARK contract lead: the operator's full name and title as in `material/restricted/CLIENT.md` context (the manager account's display name is "MITMARK data compliance officer"; use "Lurong Chen, Chief Information Security Officer, MITMARK Intelligence").
- Module status: all eight "Live" (the operator has MITMARK work in every module; she confirms or adjusts).
- Rates and retainer: leave blank. The Statement must keep saying the fee is not entered.
- Journey stage, retention schedule, links, documents, tasks: leave as they are. Verify counts before and after (19 tasks, 11 documents) and that nothing else changed.
- Audit: every change appears under the manager's id.

### 3.2 Client branding (v1.8)

- Organisations gain a branding logo: an admin upload (PNG or SVG, 500 KB cap, stored in the organisation's blob, served through the API with the organisation guard, never a public URL). Shown in the client portal header and sidebar in place of the text name, with the text name as alt text and as the fallback when no logo is set. Light portal only; no inversion of the client's mark.
- Upload the client's logo from `material/restricted/client_logo.png` to the client organisation through that control. The file is read at run time; it is not copied anywhere in the repo or the build output. The demo and gate organisations get no logo; the gate proves a logo set on one organisation never appears on another.
- The admin workspace shows the logo on the Organisations list and the switcher stays text.

### 3.3 MITMARK mark on the client view (v1.8)

- Footer on every client page: "Delivered by MITMARK Intelligence" with the existing MitmarkLogo mark, small, house tokens, contrast 4.5:1 or better.
- Watermark: the MitmarkLogo at low opacity (about 6 per cent) fixed bottom-right of the client portal content area, never over text in a way that fails the contrast rule, hidden on phones below 640px, present on the Statement's print layout. Not on the admin workspace. In View as client the same mark shows, since the view is the client's.
- The gate measures text contrast on every client page with the watermark present.

### 3.4 Sequence after the build (human side; the build reports, it does not do these)

1. The operator reviews the organisation in View as client, creates a test seat in Users and walks request, upload and Quick questions.
2. Sunray rotates `SESSION_SECRET` in Netlify.
3. Sunray confirms Block 5 consent; the Information Officer's password is reset in Users and reaches her through the operator.
4. The Anthropic key on the project, when Sunray has it.

### 3.5 Gate

Extend for v1.8: logo upload size and type limits; logo served only to that organisation's sessions and client view; no logo on the gate or demo organisations; fallback to text when none; footer and watermark present on every client page and absent from admin; contrast at all three widths with the watermark; client organisation settings as 3.1 with counts unchanged; `check_restricted.py` on the folder and on the built bundle; everything from v1.7 that still applies.

## 4. Service support

As FRAGO 03 section 4. Images in Netlify Blobs beside the organisation document; no new dependency.

## 5. Command and signal

Build session sole writer of R01 while it runs; append from DC-70. Write v1.8 sections: BUILD_REPORT, T14 V1_8, T17 V1_8, T18 update (branding, what the client sees). Stop conditions as FRAGO 07, plus: the client's name or logo appearing in any file under the job folder other than `material/restricted/`, or in any commit, is a stop.

## 6. Timings

Issued 14 Oct. Live by 1800 BST Wednesday 15 Oct.

## 7. Not in this order

The Information Officer's password (Sunray and the operator, after Block 5); the Anthropic key; SESSION_SECRET; the Statement's numbers (from the meeting).

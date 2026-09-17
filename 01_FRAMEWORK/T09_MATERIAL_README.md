---
document: MATERIAL_README
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: T9
instantiated_by: Seagull, Phase 1
usage: Instantiate as material/README.md in the operation's session pack. It tells Sunray exactly what to place before the session starts and states the rule that absent means concept.
---

# material/

Sunray places these here before the session starts (Preloaded Decision D13). Anything absent is treated as absent; the part of the product that depended on it becomes concept and is marked as designed, not built. Nothing in this folder is fetched, requested or substituted by the staff.

*One line per item: the file or folder name, then what it is and which cell needs it. Keep the two-column shape. Mark optional items "optional" and say what the staff does instead when they are not there.*

- tessera-tokens.css          the house token file, from the design system. G6 uses it verbatim.
- {{DESIGN_SYSTEM_DOC}}       the full house standard. G6, G7, G9.
- {{WORDMARK_FILE}}           the firm's wordmark, SVG or PNG. G6.
- {{CAPABILITY_FOLDER}}/      corpus, methodology and one sample output for a capability governed by CM-02. Sample output on the firm's own footprint, never on {{SUBJECT}}. G2, G6.
- {{SUBJECT_MATERIAL}}        optional: what is already held about {{SUBJECT}}. Otherwise G2 sources it to the CM-01 evidence standard.
- repos/                      optional: any repository cloned here is available offline. Anything not cloned and not public is treated as absent. Licence hygiene applies: no source is copied from a codebase whose licence MITMARK does not intend to inherit.

**Never placed here.** Any document about {{SUBJECT}} that the build must not open. Any other client's data. Any key or secret value: key names go in `registers/KEY_REGISTER.md` and values live in the hosting environment only.

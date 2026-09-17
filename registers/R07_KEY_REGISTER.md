---
document: R7_KEY_REGISTER
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: R7
instantiated_by: G2 Intelligence with G4 Infrastructure, opened empty at Phase 1, kept current to Phase 6
usage: Every key or secret by name, source and where it lives. Names only. Never values. Append-only.
---

# KEY REGISTER

**Names only.** Values live in the hosting environment and nowhere else. Nothing in the repository, in any document, or on the product carries a value. A value that appears anywhere outside the hosting environment is a breakage fix and a decision, in that order.

Free-tier or already-held keys only, unless the cap allows otherwise and Sunray has authorised it.

## Columns

| Column | What goes in it |
|---|---|
| Key name | The environment variable name, exactly as it is set. Not a description. |
| Source it unlocks | The service or feed. |
| Found in | Where the key was already held, so its provenance is traceable. |
| Placed in the environment | Yes with the date, time and scope, or No. |
| Serves | The component or endpoint that uses it. Where nothing uses it, say so and say why it is registered anyway. |
| Status | In use; Registered, not placed; Not needed; Rotated on {{DATE}}; Revoked on {{DATE}}. |

## Rule for who appends

G2 maintains the register; G4 places and rotates the values. A cell that finds a key appends it by name and marks it Registered, not placed. Only G4 changes the Placed column, and only after a component actually uses it. Nobody appends a value, in any column, in any form, including a partial one. Rotation updates the row by name only and adds a new row for the rotation event.

## Rules

1. A key is placed only where a component uses it. Placing every key found widens the blast radius for no product.
2. The hosting environment is the only store. If a key is rotated, it is rotated there and this register is updated by name only.
3. The gate greps the repository for secret-shaped strings and fails on a hit outside the permitted data snapshots.
4. Keys are never committed, never rendered, and never quoted in a back-brief, a battle inspection or an operator brief.

## The register

| Key name | Source it unlocks | Found in | Placed in the environment | Serves | Status |
|---|---|---|---|---|---|
| {{KEY_NAME}} | {{SERVICE}} | {{WHERE_HELD}} | Yes, {{SCOPE}}, {{YYYY-MM-DD HH:MM}} | {{COMPONENT_OR_ENDPOINT}} | In use |

## Keyless sources in use, no key required

*Listed by name, separated by commas. A keyless source is preferred to a keyed one wherever both exist, and the estimate looks for the keyless path before any IRTB is raised.*

## Access and accounts

*Where the operation issues accounts to operate the product, they are recorded here by name, role and end date, with the statement that passwords are never stored and only hashes are held. One row per account. How to revoke an account without a deploy, and how to add one, in one line each.*

| Name | Role | Ends | Where held |
|---|---|---|---|
| {{ACCOUNT}} | {{ROLE}} | {{DATE_OR_NONE}} | Hosting environment only |

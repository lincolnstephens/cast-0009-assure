---
document: RESOURCE_ALLOCATION_RECORD
version: v0.1
status: DRAFT TEMPLATE
authority: Sunray
sits_beneath: CCP-001 Section 4, CAST-001 Section 4, Gate 2
usage: What Sunray actually allocates at Gate 2. Never store a secret value itself here: name the credential, connector or capability granted and where it is held, not the key.
---

# {{CONTROL_NO}} {{CODENAME}} GATE 2: RESOURCE ALLOCATION

| Field | Entry |
|---|---|
| Date and time | |
| Time condition (H-hour) | |
| Financial condition (spend ceiling) | |
| Capabilities allocated, by name, from R11 | |
| Where each credential is held | {{never the key itself}} |
| Permission envelope, final | {{reference PHASE0_SELECTOR.md and any widening granted since}} |

Nothing outside this record runs during execution.

---
document: DESIGN_BACKBRIEF
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: T12
instantiated_by: Seagull, Phase 2 Design, at the close of the estimate
usage: One page to Sunray when the estimate closes and the Operation Order issues. It is the whole design compressed to what Sunray must read to confirm or correct in one sitting. Sunray confirms or corrects; silence past the silence interval is confirmation.
---

# DESIGN BACK-BRIEF, OPERATION {{CODENAME}}

**To:** Sunray. **From:** Seagull. **Time:** {{TIME}}. **Order:** `outputs/OPORD.md`, issued {{ISSUE_TIME}}. **Estimate:** `outputs/ESTIMATE.md`, closed {{ESTIMATE_CLOSE_TIME}}. **Decision required by:** {{DECISION_BY_TIME}}.

*Instruction: one page. If it runs to two, cut the tables before the prose. Everything here already exists in the estimate and the order; nothing new is introduced.*

## 1. Mission

*Instruction: the mission statement verbatim from the order, one sentence. Do not paraphrase it here; the point of the back-brief is that Sunray reads the same words the cells were given.*

{{MISSION_STATEMENT}}

## 2. Seagull's intent

*Instruction: purpose, method, end state, three sentences, verbatim from paragraph 3a. Add one line naming the main effort and what it beats when capacity is short.*

## 3. Task organisation

*Instruction: one row per cell, the task in a short phrase, not the full task from 3d. Status is where the cell is now, not what it will be.*

| Cell | Model | Task | Hands to | Status |
|---|---|---|---|---|
| G1 People | | | | |
| G2 Intelligence | | | | |
| G3 Operations | | | | |
| G4 Infrastructure | | | | |
| G5 Plans | | | | |
| G6 Engineering | | | | |
| G7 Readiness | | | | |
| G8 Commercial | | | | |
| G9 Client and narrative | | | | |

## 4. Synchronisation matrix

*Instruction: the matrix from estimate Q6, reduced to the slots between now and the next gate. Cells across, time down, hand-offs in the cells. Blank means that cell is not working in that slot.*

| Time | G2 | G3 | G6 | G7 | G8 | G9 | Seagull |
|---|---|---|---|---|---|---|---|
| {{SLOT_1}} | | | | | | | |
| {{SLOT_2}} | | | | | | | |
| {{SLOT_3}} | | | | | | | |

## 5. Decision points

*Instruction: only those still open, plus any Sunray took while asleep or absent so he can see them. Latest time is the time past which the decision makes no difference.*

| DP | Decision | Latest time | Taken by | Result or open |
|---|---|---|---|---|
| | | | | |

## 6. Risks

*Instruction: the top five from the risk register, no more. Earliest point it bites is the column that decides the order.*

| Risk | Owner | Earliest point it bites | Treatment |
|---|---|---|---|
| | | | |

## 7. Critical information requirements

*Instruction: the CIRs that are Sunray's to answer come first, numbered as in the register, with the latest time each can be used. State the assumption the build is running on until each is answered, so Sunray can see the cost of not answering.*

| CIR | What is needed | Owner | Latest time of use | Assumption in force meanwhile |
|---|---|---|---|---|
| CIR-1 | | Sunray | | |

## 8. What Sunray confirms

*Instruction: a short numbered list of the things this back-brief is asking for, each answerable in one word or one line, and each with Seagull's recommendation. The last item states the default on silence. Keep it to five items or fewer; anything beyond that is Seagull's to decide and does not belong here.*

1. *Confirm or correct the Operation Order. Seagull: no correction expected.*
2. *{{DECISION}}. Seagull recommends {{RECOMMENDATION}}.*
3. *{{MATERIAL_OR_ACCESS_NEEDED}}.*
4. *Anything in Annex A this design has read wrongly.*
5. *Nothing else. The rest is Seagull's until {{NEXT_GATE}}. Silence past {{SILENCE_INTERVAL}} is confirmation and the build proceeds on the recommendations above.*

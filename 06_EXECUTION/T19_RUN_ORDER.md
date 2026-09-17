---
document: T19_RUN_ORDER
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: T19
instantiated_by: G3 Operations, Phase 3, on the final iteration
usage: The sequence of the delivery. Every step with the component it uses, the effect it serves, one sentence, one ask, its timing and the keyboard and mouse path to reach it. G7 builds the operator brief from it and G6 builds the product to it.
---

# THE RUN: {{CODENAME}}

*Frontmatter for the instantiated document also carries: cell G3 Operations; status ISSUED and who it hands to; date; h_hour {{H_HOUR}}; operator {{HIGHER_COMMANDER}}, alone, on an untested screen, without rehearsal support; target {{RUN_LENGTH}}, with the ask reached at {{ASK_TIME}}; constraint, being the standing constraints on what may be said, listed as one line each.*

## 0. How this document is used

Left to right, top to bottom, once. {{HIGHER_COMMANDER}} reads it once and then works from the operator brief, which G7 builds from sections 1 to {{LAST_RUN_SECTION}}.

**{{KEY_COUNT}} keys. Nothing else.**

| Key | What it does |
|---|---|
| **{{KEY_NEXT}}** | Advances one step in the run. It always advances. There is no backtracking. |
| **{{KEY_BACK}}** | Goes back one step. *State how often it is used in the whole run and where.* |
| **{{KEY_EXPAND}}** | Expands the component the operator is on. |
| **{{KEY_RETURN}}** | Returns to the whole picture. |

Focus order is the run order, not the layout order. The operator never has to think about which component is next to which. {{KEY_NEXT}} is next.

**Three rules for the operator.**

1. One sentence, one ask, then move. Do not explain a component twice.
2. If a component is wrong, say the break line once and move. No diagnosis, no apology, no fixing it live.
3. At the ask, stop talking.

**If the room takes the time**, drop in this order and say nothing about it: *the in-run cut order, most droppable first.* Never drop *the steps that carry the decisive conditions, named.*

---

## 1. The opening

*The opening state: what is on screen, what is selected, which bands are visible. It opens the same way every time.*

The operator, before touching a key:

> "{{OPENING_WORDS}}"

**Why these words, and not others.** *One or two sentences. Which audience question this answers, and how early it has to be answered before everything after it is discounted.*

**If the presentation surface is wrong at open**, colours off, layout broken, resolution odd:

> "The screen is not doing what it does on mine. What is on it is right; how it looks is not. I will carry on."

**Elapsed {{FROM}} to {{TO}}.**

---

## 2. {{BAND_OR_SECTION}}

*One section per band or grouping of the product. Repeat section 2 for as many bands as the product has. Where the operator says a band line as the focus drops into it, give that line verbatim before the first component.*

### {{COMPONENT_ID}}, {{COMPONENT_NAME}}. {{LIVE_OR_CONCEPT}}.

**Effect served.** *Which decisive condition or which line of operation this step exists for. One line. A step that serves no effect is cut here, not in the room.*

**Key.** {{KEYBOARD_PATH}}. **Mouse.** {{MOUSE_PATH}}.

> "{{SENTENCE}}"

**He asks for.**

> "{{ASK}}"

**On screen with it.** *What is beside the words: the source line, the mark, the state. Say why it is there where it is doing work rather than decoration.*

**Note for the operator, not on screen.** *Anything he needs to hold in his head: what not to claim, what to concede first, what a question here is really asking. Omit the heading where there is nothing.*

**If he is asked {{LIKELY_QUESTION}}**, the honest extra sentence, which he can say alone:

> "{{HONEST_EXTRA}}"

**Break line.**

> "{{BREAK_LINE}}"

**Elapsed {{FROM}} to {{TO}}.**

---

## {{N}}. The reconfigure moment

*Where the run includes a moment in which the audience watches the engine move rather than the content change, it gets its own section and a keystroke table. This is normally the only place the run goes backwards, and it is normally where one decisive condition is achieved on its own.*

The operator returns to {{START_COMPONENT}} and says the frame first:

> "{{FRAME_LINE}}"

**Keystroke by keystroke.**

| # | Key | What happens | What the operator says |
|---|---|---|---|
| 1 | **{{KEY}}** | *What the product does. Any rule this places on G6 goes here in bold.* | *nothing, or the line verbatim* |

**Note for the operator.** *What is loaded and what is not, and what he says if asked for something outside the loaded set.*

**Break line, if it does not move.**

> "{{BREAK_LINE}}"

**Elapsed {{FROM}} to {{TO}}.**

---

## {{N}}. The ask

### {{ASK_COMPONENT}}, the ask. Expanded. Nothing else on screen.

**Key.** {{KEY_NEXT}}. Then the operator says the line into the ask **over the whole picture, before he expands.** This is the last time he speaks about anything other than the ask.

> "{{LINE_INTO_THE_ASK}}"

Then **{{KEY_EXPAND}}**. The component fills the screen. Everything else is gone.

**The sentence. Verbatim. Not to be rewritten.**

> "{{ASK_SENTENCE}}"

**The ask. Verbatim. Not to be rewritten.**

> "{{ASK_QUESTION}}"

**Then silence.** He asks it once and stops. *The blanks on screen, and nothing else in the whole run, are designed to change on the day. He writes into them or says them aloud when he gets them.*

**If the answer is smaller than the ask**, he takes the smaller thing without shrinking the {{PHASE_NAME}}:

> "{{SMALLER_ASK}}"

*State what he does with a partial answer, in one line each: a name with no date, a date with no name, neither. He does not reduce the offer, discount it, or offer to do any part of it unpaid.*

**Break line. This component must never be cut, so it has an offline form.**

> "The panel is not up, so I will just say it."

Then the sentence and the ask, unchanged. The ask survives total failure of the screen, which is the point of it being short.

**Elapsed {{FROM}} to {{TO}}.**

---

## {{N}}. After the answer

**The ask is the last thing the operator says unprompted.** Nothing in this section is spoken until somebody else has spoken first. The product does not move again.

**The silence.** He asks the question once and stops. He does not qualify it, soften it, add a reassurance, or fill the pause. This is an instruction, not a preference.

**When an answer comes**, of any kind, he records it or says it back to confirm it, and then closes warmly and immediately. No recap, no summary of benefits, no second ask.

> "{{CLOSING_SENTENCE}}"

That sentence is a promise T24 LEAVE_BEHIND is built to keep. The follow-up goes the same day, in one of the forms at T25 FOLLOW_UP_DRAFT.

**Elapsed {{FROM}} to {{TO}}. {{SLACK}} of slack against the {{RUN_LENGTH}} target.**

---

## {{N}}. The freeze point

**After the G7 gate passes, only gate-passed breakage fixes go into this iteration. Everything else goes through Sunray at the next inspection.**

- A **breakage fix** is a change without which a component does not render, does not open, or states something untrue. Those three and nothing else.
- Everything else is a change for the next iteration, including anything that would make a component better, clearer, faster or prettier. Those are written down and go to Sunray with the battle inspection.
- Every breakage fix is passed by G7 before it goes in, and Seagull is told on each one. No fix goes in on G3's word alone.
- The run order, the key model, the sentences and the asks are frozen with the build. A sentence change is a next-iteration change, not a breakage fix, unless the sentence is untrue, in which case it is a breakage fix and G7 passes the new words.
- The reason is that it must open the same way every time. After the freeze hour, every improvement is a risk to that, and the ask is worth more than any of them.

Notified to Seagull and the cells with this document. Logged in R1 DECISION_LOG.

---

## {{N}}. Held against the tests

*Numbered, one per test in the operation's Interpretation Note quality bar. State the evidence in this document, then Pass or the shortfall. Do not write Pass without the evidence.*

---

## {{N}}. To G6, with this document

- *Where the sentences and asks are held as data for the build, keyed to component ids, and the statement that they match sections 1 to {{LAST_RUN_SECTION}} exactly.*
- *Character limits on sentences and asks, and which one exception exists.*
- *Character rules: no em dashes, no double quotes, so every string drops straight into markup.*
- **Build to the run order, not the layout order.** {{KEY_NEXT}} advances {{RUN_SEQUENCE}}. {{KEY_RETURN}} always returns focus to {{HOME_COMPONENT}}.
- *Any rule the reconfigure places on selection, wrapping or re-render.*

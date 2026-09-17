---
document: T18_OPERATOR_BRIEF
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: T18
instantiated_by: G7 with G3, Phase 3, on the final iteration
usage: One side of A4 the higher commander carries into the room. How to open, the run with one sentence and one ask per step, the keys, the fallback, and what to say when it breaks.
---

# OPERATOR BRIEF: {{CODENAME}}

*One side of A4. It is printed. It is read once before H-hour and then held, not read from. Everything on it is sayable by {{HIGHER_COMMANDER}} alone, on an untested screen, without support. Nothing on it needs Seagull, Sunray or a cell at H-hour.*

**Status.** FROZEN at {{FREEZE_TIME}}. Words change only through G9 and a logged decision.

---

## 1. How to open it

**Primary** {{PRIMARY_ADDRESS}} · **Fallback** {{FALLBACK_ADDRESS}} · **Offline** {{OFFLINE_FILE}}

*One line. The address or file that carries the product, then the fallback, then the offline copy that needs nothing. Give the fallback in a form that can be typed from the card by hand.*

**Keys** {{KEY_NEXT}} next · {{KEY_BACK}} back · {{KEY_EXPAND}} expand · {{KEY_RETURN}} whole picture.
**Mouse** *One line: the two or three mouse paths that reach the same places as the keys, for an operator who abandons the keyboard.*

**Opening state.** *What is on screen before a key is pressed: which view, which selection, which bands visible. It opens the same way every time.*

**The opening words.** *Verbatim. Four sentences at most, said before any key is pressed. It states what the thing is, what question it answers, and where the line between what is live and what is designed falls.*

> "{{OPENING_WORDS}}"

---

## 2. The run

*One row per step, in run order, not layout order. One sentence, one ask, then move. Do not explain a step twice. Copy the sentence and the ask verbatim from T19 RUN_ORDER and T22 ON_SCREEN_COPY; they are not paraphrased here.*

**{{STEP_N}} · {{COMPONENT}} · {{LEVEL_OR_BAND}} · {{LIVE_OR_DESIGNED}}.** *{{PATH}}* "{{SENTENCE}}" / "{{ASK}}" / *Break:* {{BREAK_LINE}}.

*Repeat for every step in the run. Mark each step LIVE or DESIGNED in those words. Where a step carries a hand-over to a named person in the room, put the hand-over sentence in bold so it is not missed under pressure.*

**{{RECONFIGURE_STEP}}.** *Where the run includes a moment that shows the engine moving rather than the content, give the key sequence in full and one line of speech per move. This is normally the only place the run goes backwards.*

**{{ASK_STEP}} · THE ASK.** *{{PATH}}* First the line into the ask, then the ask itself:

> "{{ASK_SENTENCE}}"
> "{{ASK_QUESTION}}"

---

## 3. The closing rule

**At the ask, stop talking.** Ask once. Do not qualify it, soften it, add a reassurance or fill the pause. The silence is doing the work and the operator is the only person in the room who can spoil it.

**A smaller answer.** *The smallest thing the room can say yes to without spending anything or asking anyone, in one spoken line.* A name and no date: take the name and propose the date. A date and no name: take the date and ask who attends. Do not leave with neither.

**Dead screen at the ask.** "The panel is not up, so I will just say it," then the two lines above, unchanged. The ask survives total failure of the product, which is why it is four lines long.

**After they speak.** *One sentence of thanks and the promise the leave-behind is built to keep, verbatim.*

---

## 4. Keys and access

*Names only, never values. What the operator needs to get in: an account name, a device, a printed code. Where the values live is in R7 KEY_REGISTER and is not on this card.*

| What | Where it is | Who holds it |
|---|---|---|
| {{ACCESS_ITEM}} | {{LOCATION}} | {{HOLDER}} |

---

## 5. Fallback, in order

1. {{FALLBACK_1}} *The first thing to try, normally turning the device round.*
2. {{FALLBACK_2}} *The offline copy that needs no network.*
3. {{FALLBACK_3}} *The address, typed by hand.*
4. This card. Everything on the product is on this card and the operator knows where every figure came from.

---

## 6. What to say when it breaks

*The short forms. The full branches are T20 ACTIONS_ON, which is read once beforehand and not carried.*

*Screen fails:* device round, offline file, address, this card. *No network, said once at the start:* "everything here is a snapshot with the time it was taken printed on it." *A number:* "I will not guess. The {{PHASE_NAME}} produces the price." *Cannot answer:* "I don't know, and I won't guess. You will have it by {{TIME}}." *What is this, can we buy it:* "{{PRODUCT}} is our engine, built by us. Not a licence I am selling today."

**Standing rules.** Say the honest thing before they find it. Concede what is true, first and fast. Never guess a number, a figure or a date. Never claim a person or a team MITMARK does not have. Every answer ends on the ask, and after the ask, stop talking.

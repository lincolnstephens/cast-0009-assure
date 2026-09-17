---
document: T22_ON_SCREEN_COPY
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: T22
instantiated_by: G9 Client and narrative, Phase 3, on the final iteration
usage: Every word the audience sees, in the approved voice, with the empty, loading, error and snapshot state of every string. G6 builds to it character for character and G7's gate reads it as fixed values.
---

# ON SCREEN COPY: {{CODENAME}}

*Frontmatter for the instantiated document also carries: cell G9; status ISSUED and who it hands to; date; h_hour {{H_HOUR}}; authority, being G9's hold on tone, language and positioning of everything the audience sees, and the note that ask copy is G8's and is reproduced verbatim.*

This file is the complete set of words that appear on the product. If a word is not in this file it does not go on the product. G6 builds to these strings character for character. G7's gate may read them as fixed values.

---

## 1. Voice rules

*These nine are standing. Add operation-specific rules beneath them; do not remove one.*

1. British English. Plain and factual.
2. No sales language. No superlatives. No exclamation marks.
3. No em dashes. The separator on screen is a middot, never a dash.
4. Apostrophes are typographic. No text is set in italics.
5. Titles state what a thing is. Noun phrases, no verbs, no benefits, no adjectives, under eight words.
6. No numeric content on anything marked designed.
7. Every live or snapshot component carries its source and the time it was taken. That is a claim about the whole product and it must be true of every component.
8. Where a source conflicts with another source, the product shows the conflict and does not silently pick one.
9. An absence is stated as a fact about data, never as a benefit and never filled in.

**Operation rules.** *Any further rule this operation's Interpretation Note or control measures impose on words: a subject not to be characterised, a claim not to be made, a term of art that must be used exactly.*

---

## 2. Fixed strings, not by component

| Slot | Text | Note |
|---|---|---|
| Mark | `MITMARK` | Wordmark, single colour from the house system. |
| Engine | `{{PRODUCT}}` | |
| Shape | `{{THREE_WORDS}}` | |
| Clock | `{{DATE_AND_TIME}}` | Live clock; falls back to the baked date and time if the clock cannot run. |
| Header, as one string | `MITMARK · {{PRODUCT}} · {{THREE_WORDS}}` | |
| Classification line | `{{CLASSIFICATION_LINE}}` | *Says what the artefact is, what may be done with it, and dates it. Accurate rather than theatrical.* |

**Not on the header.** No client or subject name. No codename. No strapline. No version number. Nothing is branded on a guess.

**Band or level titles.**

| Band | Title | Sub-label |
|---|---|---|
| {{BAND}} | `{{TITLE}}` | `{{SUB_LABEL}}` |

*State which sub-labels change with selection and what they change to.*

---

## 3. The standing state language

Every component uses the same words for the same state, by rule and not by taste.

| State | Label | Use |
|---|---|---|
| Live, fetched at open | `LIVE` | The source answered. |
| Snapshot, offline or fallback | `SNAPSHOT {{HH:MM}}` | 24-hour clock. The time the snapshot was taken, not the time it is being shown. |
| Source tried and failed at open | `SNAPSHOT {{HH:MM}} · live source did not answer` | Breaking honestly. The operator can say why. |
| Loading | `{{LOADING_STRING}}` | *One string, the same everywhere. It states what is being fetched, not that something is happening.* |
| Empty, and the source has no data | `{{EMPTY_STRING}}` | The source answered and there is nothing. Distinct from the next row. |
| Empty, and no source exists | `No public source · {{PLACE_OR_SUBJECT}}` | *Followed by the honest-absence lines below.* |
| Designed, not built | `DESIGNED · what the money buys` | No variation. Not "concept", not "future state", not "roadmap", not "coming soon". Paired with the dashed border and no numeric content. |
| Designed, one further line | `Nothing on this panel is running today.` | Exactly this form and no other. |

The failure label is deliberate. A blank component is a bug; a labelled snapshot is a design decision.

**The honest-absence lines.**

> `No public source · {{PLACE_OR_SUBJECT}}`
>
> `There is no {{SOURCE_KIND}} of this kind here. Nothing has been filled in. This is one of the things your own feeds would answer.`

The second sentence is load-bearing and is not to be softened. The third is the only place an absence is connected to the ask. Short form, where the space will not take three sentences: `No public source. Nothing filled in.`

**The source line format.** One line, at the foot of every live and snapshot component, in tertiary text.

> `Source: {{publisher}}, {{data date}} · retrieved {{retrieval date}}`

Where a caveat is required by the data, it follows as a second line in the same style, stated flatly. **Designed components carry no source line.** They carry the designed mark instead. A source line on a designed component would be the single most damaging thing on the product.

**The key legend.** Always visible.

> `KEY`
>
> `Solid border · running today`
>
> `Dashed border · designed, not built`
>
> `Every panel carries its source and the time it was taken`

G7 fails the gate if any component lacks a source line.

---

## 4. Every string, by component

*One row per component, in run order. Title and sub-title are the words on it at rest. The four state columns carry the exact string shown in that state, or `n/a` where the state cannot occur, which is normally the case for the loading, error and snapshot states of a designed component. Nothing here is a paraphrase.*

| # | Component | Title | Sub-title | Live | Loading | Empty | Error or snapshot |
|---|---|---|---|---|---|---|---|
| {{ID}} | {{NAME}} | `{{TITLE}}` | `{{SUB_TITLE}}` | `{{LIVE_STRING}}` | `{{LOADING_STRING}}` | `{{EMPTY_STRING}}` | `{{ERROR_OR_SNAPSHOT_STRING}}` |

*Where a sub-title is a control rather than a caption, say so beneath the table and say what it is controlling against. Where a component's empty state carries a different meaning from every other component's, say so.*

---

## 5. The ask copy

Verbatim from T21 THE_ASK (a), G8's copy, not to be altered by anyone including G9. It carries no source line and no designed mark, because it is not a claim, it is a request.

> *The ask copy, reproduced exactly.*

The blanks are the only things on the whole product meant to change on the day. The rules are drawn long enough to read as fields expecting an answer.

---

## 6. Words that do not appear anywhere

*Checked by G7 as a string test against the built asset. One list, separated by middots. It carries: any other client's name; any individual's name; the standing sales vocabulary; any word the operation's guardrails prohibit; any figure or currency amount where the operation forbids figures; any exclamation mark; any em dash.*

`{{PROHIBITED_STRINGS}}`

---

## 7. Held against the tests

*Numbered, one per test in the operation's Interpretation Note quality bar. State the evidence in this document, then Pass or the shortfall.*

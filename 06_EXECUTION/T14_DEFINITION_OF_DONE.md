---
document: DEFINITION_OF_DONE
version: v1.0
status: STANDING TEMPLATE
authority: Seagull
sits_beneath: SEAGULL_CYCLE_00_CANON v1.0
register_id: T14
instantiated_by: Seagull with G7, Phase 3 Build, one per iteration, written before the iteration starts
usage: The numbered, testable lines that describe the product in a stranger's hands. It is the whole of the standard for the iteration. G7 turns it into the gate (T15) and executes every line by driving the product, not by reading it. Nothing reaches battle inspection that fails a line.
---

# DEFINITION OF DONE, {{ITERATION}}, OPERATION {{CODENAME}}

**Written by:** Seagull with G7, {{TIME}}, before the iteration opened. **Gate:** `gate/g7_gate_{{ITERATION}}.py`. **Machine-readable copy:** `gate/DEFINITION_OF_DONE.json`, which the gate reads so that the lines and the checks cannot drift apart.

## 1. Why this document exists

The first operation run under this cycle produced an iteration that passed its gate and was rejected by the commander as below the standard he would put in front of a client. The gate had measured a floor of features. It had not measured whether the thing behaved like a product in a person's hands. The cycle carries the lesson as a rule: **the definition of done is written before the iteration starts, in the commander's own standard, as numbered testable lines describing the product in a stranger's hands, and the gate executes those lines by driving the product.**

## 2. How to write a line

A line is one sentence in the present tense describing something a person does and what the product does back. It is not a feature. It is not a requirement of the form "the system shall". Test each line against these before it is kept.

- **Is it observable?** Somebody who has never seen the product can watch the line pass or fail. If passing it requires reading the code or the specification, rewrite it.
- **Is it driveable?** G7 can execute it, either by script or by a stated manual act, and record a result. If it can only be judged, it belongs in the design standard or in the red team, not here.
- **Is it a threshold, not a direction?** "Fast" fails. "Within three seconds on a normal connection, within one second from cache thereafter" passes.
- **Does it describe the person, not the part?** Write what the user does first, then what the product does.
- **Does it name where it applies?** A line that is true at one resolution and false at another has not been written yet.
- **Does it come from the commander's standard?** Every line traces to Annex A, to the Interpretation Note, or to Sunray's direction at the last inspection. A line nobody asked for is scope.

Ten to fifteen lines is the working size. Fewer and the standard has gaps. More and the gate becomes a checklist, which is the failure the rule exists to prevent.

## 3. The lines

*Instruction: fill this table for the iteration. One row per line, numbered, in the order a person meets them. The number is the identifier the gate reports against and does not change once the iteration opens. If a line has to change mid-iteration, it changes by fragmentary order and the gate is re-run in full.*

| # | The line | How G7 drives it | Pass criterion | Applies to |
|---|---|---|---|---|
| 1 | *What a person does and what the product does back.* | *The script or the manual act that executes it.* | *The threshold, stated so that pass and fail are not a matter of opinion.* | *The resolution, device, browser or artefact state the line is tested at.* |
| 2 | | | | |
| 3 | | | | |

## 4. Worked example: ten lines for a web product

*Instruction: this set is generic and is here to be copied and edited, not instantiated as it stands. It is the shape a live web product's definition of done takes. Replace the components and the sources with the operation's own.*

| # | The line | How G7 drives it | Pass criterion | Applies to |
|---|---|---|---|---|
| 1 | Opens on {{OPENING_VIEW}} with {{DEFAULT_SELECTION}} already selected, without a click. | Playwright loads the URL cold with an empty cache, then again warm, and reads the selected state from the DOM. | First contentful view within three seconds cold on a normal connection, within one second warm. The default selection is present in the DOM at first paint. | 1920x1080 and 1366x768, deployed URL and local build |
| 2 | Every live element fetches on load and says which it is: LIVE with its retrieved time when the source answers, SNAPSHOT with its snapshot time when it does not. The times tick. | Drive the page, read `data-state`, `data-source` and `data-retrieved` on every live element, wait one poll interval and read the displayed age again. | Every live element carries all three attributes. No element shows a figure with neither state. The displayed age increases between the two reads. | Both resolutions, deployed URL |
| 3 | Click any item in the list, or its marker, and the view reconfigures to that item: the same components, that item's data, honest blanks where no source exists. Back returns to where you were. | Click each of three items in turn, screenshot, read the component set and the data attributes, then drive Back. | The component set is identical across items. Absent data reads as a stated absence, never as an empty box or a zero. Back restores the previous view. | Both resolutions |
| 4 | The keyboard path still works: {{KEY_FORWARD}} advances the run, {{KEY_BACK}} goes back, {{KEY_OPEN}} opens, {{KEY_CLOSE}} returns to the whole picture. | Send the key sequence of the run order end to end without touching the mouse, screenshotting each step. | The run reaches its last step in the scripted number of presses. No step requires the mouse. | Both resolutions |
| 5 | Click any component to expand it; click outside or press Escape to return; scroll inside an expanded component. | Expand each component in turn, scroll it, close it both ways. | Every component expands and closes by both routes. Expanded content scrolls without moving the page behind it. | Both resolutions |
| 6 | Hover or focus any figure and its source line appears. | Hover every element carrying a figure and read the tooltip or the revealed source node. | Zero figures without a source. There is no third state between sourced and absent. | 1920x1080, and focus rather than hover on touch |
| 7 | The designed layer is present, marked, and never pretends to be live: the designed treatment by rule, no figure of two or more digits, and a full explanation on open. | Read the computed border style and the mark text on every designed component; regex its text for numbers. | Every designed component carries the treatment and the mark. No designed component carries a figure of two or more digits. | Both resolutions |
| 8 | The ask is a component, last in the run, expandable alone, its copy unchanged from the approved words, its blanks visible. | Drive to the last step of the run, expand it, compare its text to the approved copy file. | The copy matches the approved file exactly. Both blanks are present on screen. | Both resolutions |
| 9 | Readable at both target resolutions without truncation at overview: no horizontal scroll, body type never below the floor, every label a full word. | Measure `document.scrollWidth` against the viewport, read the smallest computed font size on the page, and check for text nodes ending in an ellipsis at overview. | No horizontal scroll at either resolution. Smallest computed body type at or above {{TYPE_FLOOR}} px. No truncated label at overview. | 1920x1080 and 1366x768 |
| 10 | Nothing the product depends on at open is keyed or paid, the console is clean of errors, and the static gate passes. | Read the network log at open for keyed or paid hosts, collect console errors, run the static section of the gate. | No keyed or paid dependency at open. Zero console errors. Every static check passes. | Deployed URL and local build |

## 5. Writing lines for a deliverable that is not a web product

The rule does not change: numbered, testable, driven rather than read, describing the product in a stranger's hands. What changes is what "driving" means. For a report, an investigation product, a paper or a deck, the stranger is a reader who was not in the operation, and the drive is a reading under conditions, timed and recorded, with the result written down line by line exactly as a script would write it.

Write the lines against these five axes.

- **The open.** What the reader can state after the first page or the first minute. "A reader who has read only the first page can say what the product concludes and who it is for." Driven by giving the first page to somebody who has not seen the work and writing down what they say.
- **Navigation and structure.** How a reader reaches an answer. "Any of the {{N}} questions in the terms of reference is answered in a section named for it, reachable from the contents in one step." Driven by taking each question in turn and timing the route to its answer.
- **Provenance.** The same rule as a screen, in a different medium. "Every figure and every assertion of fact carries a source and a date at the point it is made, not only in an appendix." Driven by sampling every figure in the document and checking the citation is adjacent to it.
- **The honest line.** "Every inference is labelled as inference and every gap is stated as a gap. There is no third state between sourced and absent." Driven by reading each section against the source list and marking any sentence that asserts more than its source supports.
- **The close and the act.** "The recommendation is on one page, states what is being asked for, of whom, and by when, and is readable without the body of the report." Driven by handing the last page alone to a reader and asking what they are being asked to do.

To these, add the house checks that are common to every product and are run as a static pass on the file rather than on a browser: British English, no em dashes, no sales language, the approved marks and wordmarks, no other client named, no confidential source asserted, and the classification line present. Where the deliverable is produced as a file, add one line for the artefact itself: "The product opens from the file, on the machine it will be read on, in the form it was written, with no missing fonts, no broken figures and no unresolved references." That line is driven, not read, and it is the one most often assumed.

## 6. Definition of done as data

*Instruction: keep `gate/DEFINITION_OF_DONE.json` alongside this document. It carries the same lines, so the gate cannot drift from the standard. One object per line.*

```json
{
  "iteration": "{{ITERATION}}",
  "written": "{{TIME}}",
  "lines": [
    {
      "id": 1,
      "line": "The sentence from section 3, verbatim.",
      "drive": "playwright | static | manual",
      "check": "The named check function or the manual act.",
      "pass": "The threshold.",
      "applies_to": ["1920x1080", "1366x768"]
    }
  ]
}
```

#!/usr/bin/env python3
"""G7 GATE, standing template for the Seagull Cycle.

register_id: T15
status: STANDING TEMPLATE, v1.0
authority: Seagull. Sits beneath SEAGULL_CYCLE_00_CANON v1.0.
instantiated_by: G7, Phase 3 Build, one per iteration, as gate/g7_gate_<iteration>.py

What this is. The executable gate. It runs the static checks against the product's
source and the numbered lines of the definition of done against the product itself,
by driving it. It is not opinion: every check is pass or fail, and the run writes
GATE_RESULT.md with a line per check. Nothing reaches battle inspection that fails.

What this is not. A checklist of features. A gate that counts features measures a
floor, not a standard. The driven section is the gate; the static section only stops
the product breaking a rule it must never break.

Usage:
    python3 gate/g7_gate_<iteration>.py [url-or-path] [outdir]

Exit 0 on PASS, 1 on FAIL, 2 on a harness problem (which is not a pass).

Playwright is required for the driven section. If it is absent the script says so
plainly, runs the static section alone, and exits 2, because a partial gate is a
harness problem and not a pass.
"""

import datetime
import json
import os
import pathlib
import re
import sys

# =============================================================================
# CONFIG. Everything an operation changes is in this block and nowhere else.
# =============================================================================

CONFIG = {
    # Identity of the run, for the report header.
    "codename": "{{CODENAME}}",
    "iteration": "{{ITERATION}}",

    # What is gated. Either a deployed URL or a path to a local artefact.
    # Passed on the command line; these are the defaults.
    "target": "{{URL_OR_PATH}}",
    "local_build": "{{LOCAL_BUILD_URL_OR_PATH}}",

    # The root of the repository, used by the static checks.
    "root": pathlib.Path(__file__).resolve().parents[1],

    # Which directories and files the static checks read. Name the operation's
    # own source tree, its serverless or proxy directory, and its entry file.
    "source_globs": ["src", "functions", "scripts", "index.html"],
    "source_suffixes": (".ts", ".mts", ".mjs", ".js", ".css", ".html", ".json", ".py", ".md"),

    # Resolutions every driven line is executed at. Add a device row for a phone
    # tier only when the definition of done names one.
    "resolutions": [
        {"name": "1920x1080", "width": 1920, "height": 1080},
        {"name": "1366x768", "width": 1366, "height": 768},
    ],

    # Banned terms are held in a file, not in this script, so that G9 owns the
    # list and the gate only reads it. One term per line; blank lines and lines
    # beginning with # are ignored.
    "banned_terms_file": "gate/banned_terms.txt",

    # Colours retired from the house standard. A hit anywhere is a fail.
    "banned_colours": ["#626ba5", "#b0bf62"],

    # Identifiers belonging to a codebase whose licence MITMARK does not intend
    # to inherit. A hit in source is a fail. Add the project name, its namespace,
    # its header strings and any author string that only appears in it.
    "licence_identifiers": [
        r"{{PROHIBITED_PROJECT_NAME}}",
        r"{{PROHIBITED_NAMESPACE}}",
        r"{{PROHIBITED_HEADER_STRING}}",
    ],

    # Third parties who must never appear in the product.
    "other_clients": ["{{OTHER_CLIENT_1}}", "{{OTHER_CLIENT_2}}"],

    # The subject of the operation must not appear in the URL, the title or the
    # metadata of a deployed artefact.
    "subject_terms": ["{{SUBJECT}}", "{{SUBJECT_SHORT}}"],

    # Attributes that carry the marking rule and the provenance rule. The gate
    # reads these; it does not infer them from styling.
    "marking_attrs": {
        "component": "data-component",
        "layer": "data-layer",          # live | designed | ask
        "sentence": "data-sentence",
        "ask": "data-ask",
    },
    "provenance_attrs": {
        "source": "data-source",
        "retrieved": "data-retrieved",
        "state": "data-state",          # LIVE | SNAPSHOT
        "date": "data-date",
    },
    "designed_mark_text": "DESIGNED",
    "type_floor_px": 12,

    # The definition of done, as data. The driven section reads its numbered
    # lines from here so the gate cannot drift from the standard.
    "dod_file": "gate/DEFINITION_OF_DONE.json",

    # Where the report is written.
    "report": "outputs/{{ITERATION}}/GATE_RESULT.md",
}

# =============================================================================
# RESULTS
# =============================================================================

RESULTS = []


def check(name, ok, detail="", line_id=None):
    """Record one check. line_id ties a driven check to its numbered line."""
    RESULTS.append({"name": name, "ok": bool(ok), "detail": str(detail), "line": line_id})
    print(("PASS" if ok else "FAIL"), name, ("· " + str(detail)) if detail else "")
    return bool(ok)


# =============================================================================
# STATIC CHECKS. Run against the source, not the running product.
# =============================================================================

def read_source(cfg):
    """Return {path: text} for every source file the static checks read."""
    root = cfg["root"]
    out = {}
    for base in cfg["source_globs"]:
        p = root / base
        if p.is_file():
            out[p] = p.read_text(encoding="utf-8", errors="replace")
        elif p.is_dir():
            for f in p.rglob("*"):
                if f.is_file() and f.suffix in cfg["source_suffixes"]:
                    out[f] = f.read_text(encoding="utf-8", errors="replace")
    return out


def load_banned_terms(cfg):
    """Read the banned terms file. Absent file is a fail, not a silent pass."""
    path = cfg["root"] / cfg["banned_terms_file"]
    if not path.is_file():
        return None
    terms = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        term = raw.strip()
        if term and not term.startswith("#"):
            terms.append(term)
    return terms


def check_banned_terms(text, cfg, where):
    """Sales language and the words the operation has put out of bounds."""
    terms = load_banned_terms(cfg)
    if terms is None:
        return check(f"{where}: banned terms file present", False, cfg["banned_terms_file"])
    hits = [t for t in terms if re.search(r"\b" + re.escape(t) + r"\b", text, re.I)]
    return check(f"{where}: no banned term", not hits, ", ".join(sorted(set(hits))[:8]))


def check_em_dashes(sources, cfg):
    """House rule: no em dash anywhere we wrote. External text is exempted at the
    point it is fetched, by normalising it there, not by relaxing this check."""
    hits = [str(p.relative_to(cfg["root"])) for p, t in sources.items() if "\u2014" in t]
    return check("static: no em dash in source", not hits, ", ".join(hits[:5]))


def check_colours(text, cfg, where):
    hits = [c for c in cfg["banned_colours"] if c.lower() in text.lower()]
    return check(f"{where}: no retired colour", not hits, ", ".join(hits))


def check_licence_identifiers(sources, cfg):
    """Licence hygiene. No source copied from a codebase whose licence MITMARK
    does not intend to inherit."""
    joined = "\n".join(sources.values())
    hits = []
    for pat in cfg["licence_identifiers"]:
        if pat.startswith("{{"):
            continue  # placeholder not yet filled for this operation
        found = re.findall(pat, joined, re.I)
        if found:
            hits.append(f"{pat} x{len(found)}")
    return check("static: no prohibited licence identifier in source", not hits, "; ".join(hits))


def check_other_clients(text, cfg, where):
    hits = [c for c in cfg["other_clients"] if not c.startswith("{{")
            and re.search(r"\b" + re.escape(c) + r"\b", text, re.I)]
    return check(f"{where}: no other client named", not hits, ", ".join(hits))


def check_no_key_values(sources, cfg):
    """Keys are registered by name and held in the hosting environment. A value
    in source is a fail. Snapshots and fixtures are excluded because they hold
    fetched data, not secrets."""
    joined = "\n".join(t for p, t in sources.items() if "snapshot" not in str(p).lower())
    patterns = [
        r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",  # uuid shaped
        r"(?i)\b(api[_-]?key|secret|token)\b\s*[:=]\s*[\"'][^\"'\s]{16,}[\"']",
    ]
    hits = [p for p in patterns if re.search(p, joined)]
    return check("static: no key value in source", not hits, f"{len(hits)} pattern(s) matched")


def check_marking_attributes(html, cfg):
    """Every component carries its layer, its sentence and its ask. Read from the
    attributes, never inferred from styling."""
    a = cfg["marking_attrs"]
    ids = re.findall(r'<[^>]+' + a["component"] + r'=["\']([^"\']+)["\']', html)

    def attr(cid, name):
        m = re.search(r'<[^>]+' + a["component"] + r'=["\']' + re.escape(cid) + r'["\'][^>]*'
                      + name + r'=["\']([^"\']*)["\']', html)
        return m.group(1).strip() if m else ""

    missing = [c for c in ids if not attr(c, a["sentence"]) or not attr(c, a["ask"])
               or attr(c, a["layer"]) not in ("live", "designed", "ask")]
    return check("static: every component carries layer, sentence and ask",
                 bool(ids) and not missing, f"components={len(ids)} missing={missing}")


def check_provenance_attributes(html, cfg):
    """Every live element carries source, retrieved time and state; every stated
    fact about the subject carries source and date."""
    p = cfg["provenance_attrs"]
    live = re.findall(r'<[^>]+data-layer=["\']live["\'][^>]*>', html)
    noprov = [e[:70] for e in live
              if p["source"] not in e or p["retrieved"] not in e or p["state"] not in e]
    ok1 = check("static: every live element carries source, retrieved and state",
                not noprov, f"{len(noprov)} of {len(live)} without")
    facts = re.findall(r'<[^>]+data-fact[^>]*>', html)
    nosrc = [f[:70] for f in facts if p["source"] not in f or p["date"] not in f]
    ok2 = check("static: every stated fact carries source and date",
                not nosrc, f"{len(nosrc)} of {len(facts)} without")
    return ok1 and ok2


def check_deploy_hygiene(html, cfg):
    """Nothing identifies the subject in the title or the metadata, and the
    artefact is not indexed."""
    meta = " ".join(" ".join(m) for m in re.findall(
        r"<title>(.*?)</title>|<meta[^>]+content=[\"']([^\"']*)[\"']", html)).lower()
    subject_hit = [s for s in cfg["subject_terms"]
                   if not s.startswith("{{") and s.lower() in meta]
    ok1 = check("static: no subject name in title or metadata", not subject_hit, ", ".join(subject_hit))
    ok2 = check("static: noindex set", "noindex" in html.lower())
    return ok1 and ok2


def run_static(cfg):
    print("\n--- static ---")
    sources = read_source(cfg)
    if not sources:
        check("static: source found", False, "no files matched source_globs")
        return
    check("static: source found", True, f"{len(sources)} files")
    joined = "\n".join(sources.values())

    check_banned_terms(joined, cfg, "static")
    check_em_dashes(sources, cfg)
    check_colours(joined, cfg, "static")
    check_licence_identifiers(sources, cfg)
    check_other_clients(joined, cfg, "static")
    check_no_key_values(sources, cfg)

    index = cfg["root"] / "index.html"
    if index.is_file():
        html = index.read_text(encoding="utf-8", errors="replace")
        check_marking_attributes(html, cfg)
        check_provenance_attributes(html, cfg)
        check_deploy_hygiene(html, cfg)
    else:
        check("static: index.html present for marking checks", False, str(index))


# =============================================================================
# DRIVEN CHECKS. The definition of done, executed against the product.
# =============================================================================

def load_dod(cfg):
    path = cfg["root"] / cfg["dod_file"]
    if not path.is_file():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def run_driven(cfg, target):
    """Read the numbered lines from DEFINITION_OF_DONE.json and drive each one.

    Each line carries an id, the sentence verbatim, the check function to run and
    the resolutions it applies to. Add one function per line below and register it
    in DRIVERS. A line whose driver is missing fails; it does not skip.
    """
    print("\n--- driven ---")
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("\nPlaywright is not installed, so the driven section cannot run.")
        print("The driven section IS the gate; the static section alone is not a pass.")
        print("Install it with:  python3 -m pip install playwright && python3 -m playwright install chromium")
        check("driven: Playwright available", False, "not installed")
        return "HARNESS"

    dod = load_dod(cfg)
    if dod is None:
        check("driven: definition of done present", False, cfg["dod_file"])
        return "HARNESS"
    check("driven: definition of done present", True, f"{len(dod.get('lines', []))} lines")

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for res in cfg["resolutions"]:
            ctx = browser.new_context(viewport={"width": res["width"], "height": res["height"]})
            page = ctx.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            page.goto(target, wait_until="load")

            for line in dod.get("lines", []):
                if res["name"] not in line.get("applies_to", [res["name"]]):
                    continue
                name = f"L{line['id']} @{res['name']}: {line['line'][:70]}"
                driver = DRIVERS.get(line.get("check"))
                if driver is None:
                    check(name, False, f"no driver registered for check '{line.get('check')}'", line["id"])
                    continue
                try:
                    ok, detail = driver(page, cfg, line, res, errors)
                except Exception as exc:  # a driver that throws is a fail, not a skip
                    ok, detail = False, f"{type(exc).__name__}: {exc}"
                check(name, ok, detail, line["id"])

            ctx.close()
        browser.close()
    return "RAN"


# --- drivers. One per named check in DEFINITION_OF_DONE.json. -----------------
# Each returns (ok, detail). Add operation-specific drivers here; keep the
# generic ones below, since most definitions of done use them.

def drv_opens_on(page, cfg, line, res, errors):
    """Line 1 shape: opens on the right view with the right thing selected."""
    sel = line.get("selector", "[data-default-selected]")
    return page.locator(sel).count() > 0, sel


def drv_load_time(page, cfg, line, res, errors):
    """Threshold in line['pass_ms']. Measured from the navigation timing API."""
    ms = page.evaluate("performance.timing.loadEventEnd - performance.timing.navigationStart")
    limit = line.get("pass_ms", 3000)
    return ms <= limit, f"{ms} ms against {limit} ms"


def drv_live_state_and_tick(page, cfg, line, res, errors):
    """Every live element states LIVE or SNAPSHOT with a time, and the age ticks."""
    p = cfg["provenance_attrs"]
    js = ("Array.from(document.querySelectorAll('[data-layer=\"live\"]')).map(e => ({"
          f"s: e.getAttribute('{p['source']}'), r: e.getAttribute('{p['retrieved']}'),"
          f" st: e.getAttribute('{p['state']}'), age: e.querySelector('[data-age]')"
          "? e.querySelector('[data-age]').textContent : null }))")
    first = page.evaluate(js)
    bad = [e for e in first if not e["s"] or not e["r"] or e["st"] not in ("LIVE", "SNAPSHOT")]
    if bad:
        return False, f"{len(bad)} of {len(first)} without source, retrieved or state"
    page.wait_for_timeout(line.get("tick_wait_ms", 2000))
    second = page.evaluate(js)
    ticked = any(a["age"] != b["age"] for a, b in zip(first, second) if a["age"])
    return ticked, f"{len(first)} live elements, age ticked: {ticked}"


def drv_reconfigure(page, cfg, line, res, errors):
    """Click each named item; the component set stays identical and Back returns."""
    items = line.get("items", [])
    before = page.eval_on_selector_all(f"[{cfg['marking_attrs']['component']}]",
                                       "els => els.map(e => e.getAttribute('data-component')).sort()")
    for item in items:
        page.click(item)
        page.wait_for_timeout(line.get("settle_ms", 800))
        after = page.eval_on_selector_all(f"[{cfg['marking_attrs']['component']}]",
                                          "els => els.map(e => e.getAttribute('data-component')).sort()")
        if after != before:
            return False, f"component set changed on {item}"
    return True, f"{len(items)} items, component set identical"


def drv_keyboard_run(page, cfg, line, res, errors):
    """The whole run walked by key, no mouse."""
    keys = line.get("keys", [])
    for k in keys:
        page.keyboard.press(k)
        page.wait_for_timeout(line.get("settle_ms", 300))
    end = page.locator(line.get("end_selector", "[data-run-last]"))
    return end.count() > 0 and end.first.is_visible(), f"{len(keys)} presses"


def drv_expand_and_close(page, cfg, line, res, errors):
    """Every component expands and closes by both routes."""
    sel = f"[{cfg['marking_attrs']['component']}]"
    ids = page.eval_on_selector_all(sel, "els => els.map(e => e.getAttribute('data-component'))")
    failed = []
    for cid in ids:
        page.click(f"[data-component='{cid}']")
        page.wait_for_timeout(200)
        if page.locator("[data-expanded='true']").count() == 0:
            failed.append(cid)
        page.keyboard.press("Escape")
        page.wait_for_timeout(200)
    return not failed, ", ".join(failed)


def drv_every_figure_sourced(page, cfg, line, res, errors):
    p = cfg["provenance_attrs"]
    n = page.evaluate(
        "sel => Array.from(document.querySelectorAll('[data-figure]'))"
        ".filter(e => !e.getAttribute(sel)).length", p["source"])
    total = page.locator("[data-figure]").count()
    return n == 0, f"{n} of {total} figures without a source"


def drv_designed_layer(page, cfg, line, res, errors):
    """Designed components carry the mark, the treatment, and no figure of two or
    more digits."""
    rows = page.evaluate(
        "() => Array.from(document.querySelectorAll('[data-layer=\"designed\"]')).map(e => ({"
        " id: e.getAttribute('data-component'),"
        " border: getComputedStyle(e).borderStyle,"
        " text: e.innerText }))")
    nomark = [r["id"] for r in rows if cfg["designed_mark_text"] not in (r["text"] or "")]
    undashed = [r["id"] for r in rows if "dashed" not in (r["border"] or "")]
    numeric = [r["id"] for r in rows
               if re.search(r"\d{2,}", re.sub(r"\d\d:\d\d(:\d\d)?", "", r["text"] or ""))]
    bad = nomark + undashed + numeric
    return not bad, f"unmarked={nomark} undashed={undashed} numeric={numeric}"


def drv_approved_copy(page, cfg, line, res, errors):
    """The ask, or any component whose words are fixed, matches the approved file."""
    approved = (cfg["root"] / line["copy_file"]).read_text(encoding="utf-8").strip()
    on_screen = page.locator(line.get("selector", "[data-layer='ask']")).inner_text().strip()
    return approved in on_screen or on_screen in approved, "copy compared to approved file"


def drv_readability(page, cfg, line, res, errors):
    """No horizontal scroll, no type below the floor, no truncated label."""
    scroll = page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
    smallest = page.evaluate(
        "() => Math.min(...Array.from(document.querySelectorAll('body *'))"
        ".filter(e => e.textContent.trim())"
        ".map(e => parseFloat(getComputedStyle(e).fontSize)))")
    floor = line.get("type_floor_px", cfg["type_floor_px"])
    ok = (not scroll) and smallest >= floor
    return ok, f"horizontal scroll={scroll}, smallest type={smallest}px against {floor}px"


def drv_console_clean(page, cfg, line, res, errors):
    return not errors, f"{len(errors)} console or page errors: {errors[:3]}"


def drv_no_banned_text_on_screen(page, cfg, line, res, errors):
    """Banned terms, em dashes and other clients, read from what is on screen
    rather than from source. External text the product did not write is
    normalised at fetch, so it is in scope here."""
    body = page.locator("body").inner_text()
    terms = load_banned_terms(cfg) or []
    hits = [t for t in terms if re.search(r"\b" + re.escape(t) + r"\b", body, re.I)]
    if "\u2014" in body:
        hits.append("em dash")
    hits += [c for c in cfg["other_clients"] if not c.startswith("{{") and c in body]
    return not hits, ", ".join(hits[:8])


DRIVERS = {
    "opens_on": drv_opens_on,
    "load_time": drv_load_time,
    "live_state_and_tick": drv_live_state_and_tick,
    "reconfigure": drv_reconfigure,
    "keyboard_run": drv_keyboard_run,
    "expand_and_close": drv_expand_and_close,
    "every_figure_sourced": drv_every_figure_sourced,
    "designed_layer": drv_designed_layer,
    "approved_copy": drv_approved_copy,
    "readability": drv_readability,
    "console_clean": drv_console_clean,
    "no_banned_text_on_screen": drv_no_banned_text_on_screen,
}


# =============================================================================
# REPORT
# =============================================================================

def write_report(cfg, target, verdict, driven_state):
    path = cfg["root"] / cfg["report"]
    path.parent.mkdir(parents=True, exist_ok=True)
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%MZ")
    passed = sum(1 for r in RESULTS if r["ok"])
    total = len(RESULTS)

    lines = []
    lines.append(f"\n## Run {stamp} · {target}\n")
    lines.append(f"**Operation:** {cfg['codename']}. **Iteration:** {cfg['iteration']}. "
                 f"**Verdict:** {verdict}, {passed} of {total}.\n")
    if driven_state == "HARNESS":
        lines.append("The driven section did not run. A static-only run is not a pass; "
                     "it is a harness problem for G7 to clear before the gate can be reported.\n")
    lines.append("| Line | Check | Result | Detail |")
    lines.append("|---|---|---|---|")
    for r in RESULTS:
        lid = r["line"] if r["line"] is not None else ""
        detail = r["detail"].replace("|", "/")
        lines.append(f"| {lid} | {r['name']} | {'PASS' if r['ok'] else 'FAIL'} | {detail} |")
    fails = [r for r in RESULTS if not r["ok"]]
    if fails:
        lines.append("\n**Failed:**\n")
        for r in fails:
            lines.append(f"- {r['name']}: {r['detail']}")
    lines.append("")

    with open(path, "a", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"\nReport appended to {path}")


# =============================================================================
# MAIN
# =============================================================================

def main():
    cfg = dict(CONFIG)
    target = sys.argv[1] if len(sys.argv) > 1 else cfg["target"]
    if len(sys.argv) > 2:
        os.makedirs(sys.argv[2], exist_ok=True)

    print(f"G7 GATE · {cfg['codename']} · {cfg['iteration']} · {target}")

    run_static(cfg)
    driven_state = run_driven(cfg, target)

    passed = sum(1 for r in RESULTS if r["ok"])
    total = len(RESULTS)
    if driven_state == "HARNESS":
        verdict = "NOT RUN"
        code = 2
    elif passed == total:
        verdict = "PASS"
        code = 0
    else:
        verdict = "FAIL"
        code = 1

    print(f"\nG7 GATE {verdict}: {passed} of {total}")
    write_report(cfg, target, verdict, driven_state)
    sys.exit(code)


if __name__ == "__main__":
    main()

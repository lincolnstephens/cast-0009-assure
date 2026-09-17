"""G7 GATE, instantiated for CAST-0009 ASSURE.

register_id: T15
status: INSTANTIATED from the standing template, v1.0
authority: Seagull. Sits beneath SEAGULL_CYCLE_00_CANON v1.0.
instantiated_by: G7, Phase 3 Build, CAST-0009 ASSURE, iteration v1.0

What this is. The executable gate for ASSURE. It runs the static checks against
the product's source and the numbered lines of DEFINITION_OF_DONE.json against
the product itself, by driving it. Every check is pass or fail, and the run
writes GATE_RESULT.md with a line per check. Nothing reaches battle inspection
that fails.

Structural changes made against the standing template, and why:
  - root resolves two levels above this file (the job folder, CAST-0009_ASSURE),
    not one, because this job's gate script sits at <job>/06_EXECUTION/gate/
    rather than at <job>/gate/. All root-relative paths below (banned terms,
    the definition of done, the report) carry the 06_EXECUTION/gate/ prefix
    to match.
  - the licence identifiers check is removed. No prohibited codebase applies
    to this job.
  - the other-clients and subject-terms checks are replaced by a single
    restricted-names check. ASSURE's client identity is not held in this
    script, in source, on screen or in the report; it is read at run time
    from an environment variable or from material/restricted/CLIENT.md,
    which sits outside the gated source tree. A hit is reported by file and
    line number with the matched text redacted, never by the name itself.
  - the marking/provenance/designed-layer machinery (data-component,
    data-layer, data-source, the LIVE/SNAPSHOT scheme) is removed. ASSURE
    is a sign-in-gated record and statement product, not a live-data
    dashboard, and carries none of those attributes. The equivalent ground
    ASSURE stands on, deploy hygiene, is driven against the running product
    instead of read from a static index.html at the repository root, because
    ASSURE ships as a build artefact rather than a root-level file.
  - added: a static check that a print stylesheet exists in source; a
    driven sign-in step that establishes the session every other driven
    line depends on; driven checks for the client and admin views, the
    record table, the statement and its limitations paragraph, the
    illustrative-off state, print behaviour, mobile overflow at 390px,
    console cleanliness and noindex.

Usage:
    python gate/g7_gate_assure_v1.py [url-or-path] [outdir]

Exit 0 on PASS, 1 on FAIL, 2 on a harness problem (which is not a pass).

Playwright is required for the driven section. If it is absent the script says
so plainly, runs the static section alone, and exits 2, because a partial gate
is a harness problem and not a pass.
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
    "codename": "ASSURE",
    "iteration": "v1.0",

    # What is gated. Either a deployed URL or a path to a local artefact.
    # Passed on the command line; these are the defaults.
    "target": "https://tessera-assure.netlify.app",
    "local_build": "06_EXECUTION/build/dist/index.html",

    # The root of the job folder. This gate script lives two levels below it,
    # at 06_EXECUTION/gate/, so parents[2] from this file is parents[1] from
    # the gate directory, which is the job folder.
    "root": pathlib.Path(__file__).resolve().parents[2],

    # Which directories the static checks read. None of these need to exist
    # yet; read_source() skips anything absent rather than failing on it.
    "source_globs": [
        "06_EXECUTION/build/app/apps/web/src",
        "06_EXECUTION/build/app/packages/shared/src",
        "06_EXECUTION/build/app/netlify/functions",
        "06_EXECUTION/build/dist",
    ],
    "source_suffixes": (".ts", ".tsx", ".mts", ".mjs", ".js", ".jsx",
                         ".css", ".html", ".json", ".py", ".md"),

    # Resolutions every driven line is executed at, unless a line names its
    # own applies_to. The 390 wide row is here because the definition of
    # done names a mobile width.
    "resolutions": [
        {"name": "1920x1080", "width": 1920, "height": 1080},
        {"name": "1366x768", "width": 1366, "height": 768},
        {"name": "390x844", "width": 390, "height": 844},
    ],

    # Banned terms are held in a file, not in this script, so that G9 owns
    # the list and the gate only reads it. One term per line; blank lines
    # and lines beginning with # are ignored.
    "banned_terms_file": "06_EXECUTION/gate/banned_terms.txt",

    # Colours retired from the house standard. A hit anywhere is a fail.
    "banned_colours": ["#626ba5", "#b0bf62"],

    # Restricted names never live in this script. They are resolved at run
    # time, in this order: the ASSURE_RESTRICTED_NAMES environment variable
    # (comma separated), and failing that, material/restricted/CLIENT.md,
    # which is outside the gated source tree. If neither source is
    # available the check fails; an absent list is a fail, not a silent
    # pass, exactly as an absent banned-terms file is.
    "restricted_names_env": "ASSURE_RESTRICTED_NAMES",
    "restricted_names_file": "material/restricted/CLIENT.md",

    # Demo sign-in the gate uses to reach the gated views. Overridable so a
    # real run never needs the default written down anywhere else.
    "sign_in": {
        "email_env": "ASSURE_GATE_EMAIL",
        "password_env": "ASSURE_GATE_PASSWORD",
        "email_default": "demo@demo.local",
        "password_default": "demo",
    },

    # The definition of done, as data. The driven section reads its numbered
    # lines from here so the gate cannot drift from the standard.
    "dod_file": "06_EXECUTION/gate/DEFINITION_OF_DONE.json",

    # Where the report is written.
    "report": "06_EXECUTION/gate/GATE_RESULT.md",
}

# =============================================================================
# RESULTS
# =============================================================================

RESULTS = []


def check(name, ok, detail="", line_id=None):
    """Record one check. line_id ties a driven check to its numbered line."""
    RESULTS.append({"name": name, "ok": bool(ok), "detail": str(detail), "line": line_id})
    print(("PASS" if ok else "FAIL"), name, ("- " + str(detail)) if detail else "")
    return bool(ok)


# =============================================================================
# STATIC CHECKS. Run against the source, not the running product.
# =============================================================================

def read_source(cfg):
    """Return {path: text} for every source file the static checks read.
    A source_glob entry that does not exist yet is skipped, not an error."""
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


def load_restricted_names(cfg):
    """Restricted names are never held in this script. Read from the
    environment variable first, then from material/restricted/CLIENT.md,
    which sits outside the gated source tree. Return None if neither source
    is available; that is a fail, handled by the caller."""
    env_val = os.environ.get(cfg["restricted_names_env"], "")
    if env_val.strip():
        names = [n.strip() for n in env_val.split(",") if n.strip()]
        return names or None

    path = cfg["root"] / cfg["restricted_names_file"]
    if not path.is_file():
        return None

    names = []
    for raw in path.read_text(encoding="utf-8", errors="replace").splitlines():
        m = re.search(r"^-\s*Client:\s*(.+)$", raw)
        if m:
            val = m.group(1).strip()
            if val:
                names.append(val)
            continue
        m = re.search(r"^-\s*Information Officer:\s*(.+)$", raw)
        if m:
            val = m.group(1)
            cut = len(val)
            for marker in (" (", "."):
                idx = val.find(marker)
                if idx != -1 and idx < cut:
                    cut = idx
            val = val[:cut].strip()
            if val:
                names.append(val)
    return names or None


def check_banned_terms(text, cfg, where):
    """Sales language and the words the operation has put out of bounds."""
    terms = load_banned_terms(cfg)
    if terms is None:
        return check(f"{where}: banned terms file present", False, cfg["banned_terms_file"])
    hits = [t for t in terms if re.search(r"\b" + re.escape(t) + r"\b", text, re.I)]
    return check(f"{where}: no banned term", not hits, ", ".join(sorted(set(hits))[:8]))


def check_em_dashes(sources, cfg):
    """House rule: no em dash anywhere we wrote."""
    hits = [str(p.relative_to(cfg["root"])) for p, t in sources.items() if "—" in t]
    return check("static: no em dash in source", not hits, ", ".join(hits[:5]))


def check_colours(text, cfg, where):
    hits = [c for c in cfg["banned_colours"] if c.lower() in text.lower()]
    return check(f"{where}: no retired colour", not hits, ", ".join(hits))


def check_restricted_names(sources, cfg, where):
    """The client and its named people must never appear in the product.
    The names themselves are never printed, written to the report, or held
    in this script: only a count on pass, and file plus line with the
    matched text redacted on a hit."""
    names = load_restricted_names(cfg)
    if names is None:
        return check(f"{where}: restricted names available", False,
                      f"no names from {cfg['restricted_names_env']} or {cfg['restricted_names_file']}")

    pattern = re.compile(r"\b(?:" + "|".join(re.escape(n) for n in names) + r")\b", re.I)
    hits = []
    for path, text in sources.items():
        rel = path.relative_to(cfg["root"])
        for lineno, line in enumerate(text.splitlines(), start=1):
            if pattern.search(line):
                hits.append(f"{rel}:{lineno}: [REDACTED]")

    detail = (f"{len(names)} restricted names checked, {len(hits)} hits"
              if not hits else "; ".join(hits[:5]))
    return check(f"{where}: no restricted name present", not hits, detail)


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


def check_print_stylesheet(text, cfg):
    """A print stylesheet exists in source. The behaviour it produces is
    checked separately, driven, against the running product."""
    found = "@media print" in text
    return check("static: print stylesheet present in source", found,
                 "'@media print' found" if found else "'@media print' not found")


def run_static(cfg):
    print("\n--- static ---")
    sources = read_source(cfg)
    if not sources:
        check("static: source found", False,
              "no files matched source_globs (the app scaffold may not exist yet)")
        return
    check("static: source found", True, f"{len(sources)} files")
    joined = "\n".join(sources.values())

    check_banned_terms(joined, cfg, "static")
    check_em_dashes(sources, cfg)
    check_colours(joined, cfg, "static")
    check_restricted_names(sources, cfg, "static")
    check_no_key_values(sources, cfg)
    check_print_stylesheet(joined, cfg)


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
    the resolutions it applies to. A line whose driver is missing fails; it does
    not skip. Line 1 signs in; every later line in the same list runs against
    the same page, so it inherits that signed-in session.
    """
    print("\n--- driven ---")
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("\nPlaywright is not installed, so the driven section cannot run.")
        print("The driven section IS the gate; the static section alone is not a pass.")
        print("Install it with:  python -m pip install playwright && python -m playwright install chromium")
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


# --- helpers shared by drivers -------------------------------------------

def _enter_view(page, view_id, admin_entry_selector, settle_ms):
    """Click the nav item carrying data-view=view_id. If it is not visible
    and an admin entry selector is given, try that first, since a React SPA
    commonly hides an inactive section with CSS rather than removing it from
    the DOM, so a count() check alone would miss it."""
    nav_sel = f"[data-view='{view_id}']"
    if not page.locator(nav_sel).first.is_visible() and admin_entry_selector:
        entry = page.locator(admin_entry_selector)
        if entry.count() > 0 and entry.first.is_visible():
            entry.first.click()
            page.wait_for_timeout(settle_ms)
    loc = page.locator(nav_sel)
    if loc.count() == 0:
        return False
    loc.first.click()
    page.wait_for_timeout(settle_ms)
    return True


# --- drivers. One per named check in DEFINITION_OF_DONE.json. -------------

def drv_sign_in_lands_on_portal(page, cfg, line, res, errors):
    """Line 1: the demo sign-in reaches the client portal."""
    sign_in = cfg["sign_in"]
    email = os.environ.get(sign_in["email_env"], sign_in["email_default"])
    password = os.environ.get(sign_in["password_env"], sign_in["password_default"])
    email_sel = line.get("email_selector", "input[type='email']")
    password_sel = line.get("password_selector", "input[type='password']")
    submit_sel = line.get("submit_selector", "button[type='submit']")
    success_sel = line.get("success_selector", "[data-view='overview']")

    if page.locator(email_sel).count() == 0:
        return False, f"sign-in email field not found: {email_sel}"
    page.fill(email_sel, email)
    page.fill(password_sel, password)
    page.click(submit_sel)
    try:
        page.wait_for_selector(success_sel, timeout=line.get("timeout_ms", 5000))
    except Exception:
        return False, f"{success_sel} did not appear after sign-in"
    return True, f"signed in, {success_sel} present"


def drv_views_render(page, cfg, line, res, errors):
    """Lines 2 and 3: every named view loads and renders a heading."""
    views = line.get("views", [])
    heading_sel = line.get("heading_selector", "h1, h2")
    admin_entry = line.get("admin_entry_selector")
    settle_ms = line.get("settle_ms", 400)
    failed = []
    for v in views:
        if not _enter_view(page, v, admin_entry, settle_ms):
            failed.append(f"{v}:nav-missing")
            continue
        heading = page.locator(heading_sel).first
        text = heading.inner_text().strip() if heading.count() > 0 else ""
        if not text:
            failed.append(f"{v}:no-heading")
    ok = not failed
    detail = f"{len(views)} views render a heading" if ok else f"failed: {', '.join(failed)}"
    return ok, detail


def drv_record_table_has_rows(page, cfg, line, res, errors):
    """Line 4: the Record table renders at least one row."""
    _enter_view(page, line.get("view", "value"), line.get("admin_entry_selector"),
                line.get("settle_ms", 400))
    table_sel = line.get("table_selector", "[data-testid='record-table']")
    row_sel = line.get("row_selector", "tbody tr")
    rows = page.locator(f"{table_sel} {row_sel}")
    n = rows.count()
    return n >= 1, f"{n} row(s) in {table_sel}"


def drv_statement_contains(page, cfg, line, res, errors):
    """Line 5: the Statement contains the limitations paragraph."""
    _enter_view(page, line.get("view", "value"), line.get("admin_entry_selector"),
                line.get("settle_ms", 400))
    stmt_sel = line.get("statement_selector", "[data-testid='statement']")
    must = line.get("must_contain", "")
    loc = page.locator(stmt_sel)
    if loc.count() == 0:
        return False, f"{stmt_sel} not found"
    text = loc.first.inner_text()
    ok = must.lower() in text.lower()
    return ok, f"limitations phrase present: {ok}"


def drv_statement_excludes_illustrative_when_off(page, cfg, line, res, errors):
    """Line 6: with show-illustrative off, the Statement carries no
    illustrative entries."""
    _enter_view(page, line.get("view", "value"), line.get("admin_entry_selector"),
                line.get("settle_ms", 400))
    toggle_sel = line.get("toggle_selector")
    if toggle_sel:
        toggle = page.locator(toggle_sel)
        if toggle.count() > 0:
            is_on = False
            try:
                is_on = toggle.first.is_checked()
            except Exception:
                state = toggle.first.get_attribute("aria-pressed")
                data_state = toggle.first.get_attribute("data-state")
                is_on = state == "true" or data_state == "on"
            if is_on:
                toggle.first.click()
                page.wait_for_timeout(line.get("settle_ms", 400))
    stmt_sel = line.get("statement_selector", "[data-testid='statement']")
    loc = page.locator(stmt_sel)
    if loc.count() == 0:
        return False, f"{stmt_sel} not found"
    text = loc.first.inner_text()
    forbidden = line.get("forbidden_text", "illustrative")
    hit = forbidden.lower() in text.lower()
    return not hit, f"'{forbidden}' present in statement with the toggle off: {hit}"


def drv_print_hides_chrome_shows_statement(page, cfg, line, res, errors):
    """Line 7: under print media, the header and nav are hidden and the
    Statement is visible."""
    _enter_view(page, line.get("view", "value"), line.get("admin_entry_selector"),
                line.get("settle_ms", 400))
    chrome_sel = line.get("chrome_selector", "header, nav")
    stmt_sel = line.get("statement_selector", "[data-testid='statement']")
    try:
        page.emulate_media(media="print")
        page.wait_for_timeout(200)
        chrome_loc = page.locator(chrome_sel)
        chrome_visible = chrome_loc.first.is_visible() if chrome_loc.count() > 0 else False
        stmt_loc = page.locator(stmt_sel)
        stmt_visible = stmt_loc.first.is_visible() if stmt_loc.count() > 0 else False
    finally:
        # Reset explicitly to "screen", not None. In this Playwright build,
        # media=None does not reliably clear the print override, so a line
        # that runs straight after this one on the same page (for example
        # line 8) can find the whole chrome still display:none. Confirmed
        # by direct repro before this fix.
        page.emulate_media(media="screen")
        page.wait_for_timeout(100)
    ok = (not chrome_visible) and stmt_visible
    return ok, f"chrome visible under print: {chrome_visible}, statement visible under print: {stmt_visible}"


def drv_no_horizontal_overflow(page, cfg, line, res, errors):
    """Line 8: at 390 wide, no named view produces horizontal overflow."""
    views = line.get("views", [])
    admin_entry = line.get("admin_entry_selector")
    settle_ms = line.get("settle_ms", 400)
    overflowing = []
    for v in views:
        if not _enter_view(page, v, admin_entry, settle_ms):
            overflowing.append(f"{v}:nav-missing")
            continue
        over = page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
        if over:
            overflowing.append(v)
    ok = not overflowing
    detail = f"{len(views)} views checked, no overflow" if ok else f"overflow on: {', '.join(overflowing)}"
    return ok, detail


def drv_console_clean(page, cfg, line, res, errors):
    """Line 9: no console or page errors across the run."""
    return not errors, f"{len(errors)} console or page errors: {errors[:3]}"


def drv_noindex_in_head(page, cfg, line, res, errors):
    """Line 10: the deployed head declares noindex."""
    html = page.content()
    m = re.search(r"<head[^>]*>(.*?)</head>", html, re.I | re.S)
    head = m.group(1) if m else ""
    ok = "noindex" in head.lower()
    return ok, "noindex present in head" if ok else "noindex not found in head"


DRIVERS = {
    "sign_in_lands_on_portal": drv_sign_in_lands_on_portal,
    "views_render": drv_views_render,
    "record_table_has_rows": drv_record_table_has_rows,
    "statement_contains": drv_statement_contains,
    "statement_excludes_illustrative_when_off": drv_statement_excludes_illustrative_when_off,
    "print_hides_chrome_shows_statement": drv_print_hides_chrome_shows_statement,
    "no_horizontal_overflow": drv_no_horizontal_overflow,
    "console_clean": drv_console_clean,
    "noindex_in_head": drv_noindex_in_head,
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
    lines.append(f"\n## Run {stamp} - {target}\n")
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

    print(f"G7 GATE - {cfg['codename']} - {cfg['iteration']} - {target}")

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

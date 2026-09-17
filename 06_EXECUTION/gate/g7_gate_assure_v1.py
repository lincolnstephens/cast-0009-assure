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
    "iteration": "v1.1",

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
        "06_EXECUTION/build/maximus-src/apps/web/src",
        "06_EXECUTION/build/maximus-src/apps/web/index.html",
        "06_EXECUTION/build/maximus-src/packages/shared/src",
        "06_EXECUTION/build/maximus-src/packages/server/src",
        "06_EXECUTION/build/maximus-src/packages/server/scripts",
        "06_EXECUTION/build/maximus-src/netlify/functions",
        "06_EXECUTION/build/maximus-src/apps/web/dist",
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
        # The admin workspace is a different account, not a control inside the
        # client portal. The Information Officer must never be able to reach
        # the operator's side, so the gate signs in again to check it.
        "admin_email_env": "ASSURE_GATE_ADMIN_EMAIL",
        "admin_password_env": "ASSURE_GATE_ADMIN_PASSWORD",
        "admin_email_default": "operator@demo.local",
        "admin_password_default": "demo",
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


# "placeholder" is on the banned list because unfinished copy must not ship.
# It is also the name of a standard HTML input attribute, its React prop and a
# CSS pseudo-element, none of which is copy. Those forms are excluded by shape,
# so a bare use of the word as text anywhere still fails.
INNOCENT_FORMS = [
    re.compile(r"placeholder\s*[=:]", re.I),
    re.compile(r"::\s*placeholder", re.I),
    re.compile(r"placeholder\\+:", re.I),  # the Tailwind variant class, escaped in CSS
    re.compile(r"placeholder(Text|Color|Shown)", re.I),
]


def _strip_innocent_forms(text):
    """Blank out the attribute and property spellings before matching."""
    for pattern in INNOCENT_FORMS:
        text = pattern.sub("_", text)
    return text


def check_banned_terms(text, cfg, where):
    """Sales language and the words the operation has put out of bounds."""
    terms = load_banned_terms(cfg)
    if terms is None:
        return check(f"{where}: banned terms file present", False, cfg["banned_terms_file"])
    scanned = _strip_innocent_forms(text)
    hits = [t for t in terms if re.search(r"\b" + re.escape(t) + r"\b", scanned, re.I)]
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


# v1.1. Added for the Compliance Tracker: the six task-table columns are a
# contract (FRAGO section 9, tracker.ts's own comment), and the gate reads the
# same source of truth the product renders from so a rename in one place is
# caught here rather than discovered by a driven line failing lower down.
TASK_COLUMNS_SOURCE = "06_EXECUTION/build/maximus-src/packages/shared/src/tracker.ts"
TASK_COLUMNS_EXPECTED = ["What", "How", "Who", "When", "Done", "Status"]


def check_task_columns_contract(sources, cfg):
    """TASK_COLUMNS in tracker.ts is exactly the six questions, in order.
    This is a source check so the contract cannot drift before it ever
    reaches the browser; drv_task_table_columns checks the rendered result
    separately, driven."""
    target = cfg["root"] / TASK_COLUMNS_SOURCE
    text = None
    for p, t in sources.items():
        if p == target:
            text = t
            break
    if text is None:
        return check("static: TASK_COLUMNS contract present", False,
                      f"{TASK_COLUMNS_SOURCE} not found in scanned source")
    m = re.search(r"TASK_COLUMNS\s*=\s*\[([^\]]*)\]", text)
    if not m:
        return check("static: TASK_COLUMNS contract present", False,
                      "TASK_COLUMNS declaration not found in tracker.ts")
    found = re.findall(r'"([^"]*)"', m.group(1))
    ok = found == TASK_COLUMNS_EXPECTED
    return check("static: TASK_COLUMNS is What, How, Who, When, Done, Status in order",
                 ok, "matches exactly" if ok else f"found {found}")


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
    check_task_columns_contract(sources, cfg)

    # A static check for a bare percentage in a template literal was
    # considered for v1.1 and deliberately left out. See
    # T14_DEFINITION_OF_DONE_V1_1.md, "static checks", for why: the source
    # tree mixes CSS/Tailwind percentages (width, opacity, grid tracks) with
    # data percentages, and a regex over source text cannot see whether the
    # rendered fraction sits beside a given percentage in the DOM, which is
    # the actual rule (FRAGO section 4.2). Line 13, driven, checks the real
    # rule against the rendered page instead.


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

    cfg["_target"] = target

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

def _credentials(cfg, role):
    """The account the gate signs in as for a given side of the product."""
    s = cfg["sign_in"]
    if role == "admin":
        return (
            os.environ.get(s["admin_email_env"], s["admin_email_default"]),
            os.environ.get(s["admin_password_env"], s["admin_password_default"]),
        )
    return (
        os.environ.get(s["email_env"], s["email_default"]),
        os.environ.get(s["password_env"], s["password_default"]),
    )


def _sign_in(page, cfg, role, target):
    """Sign out if signed in, then sign in as the account for `role`."""
    email, password = _credentials(cfg, role)
    page.goto(target.rstrip("/") + "/login", wait_until="domcontentloaded")
    try:
        page.wait_for_selector("input[type='email']", timeout=6000)
    except Exception:
        # Already signed in as somebody; sign out and come back.
        out = page.locator("button:has-text('Sign out'), button:has-text('Log out')")
        if out.count() > 0:
            out.first.click()
            page.wait_for_timeout(800)
        page.goto(target.rstrip("/") + "/login", wait_until="domcontentloaded")
        try:
            page.wait_for_selector("input[type='email']", timeout=6000)
        except Exception:
            return False
    page.fill("input[type='email']", email)
    page.fill("input[type='password']", password)
    page.click("button[type='submit']")
    page.wait_for_timeout(1200)
    return True


def _ensure_role(page, cfg, role, target):
    """Make sure the signed-in account is the one that can see `role`'s views."""
    if role is None:
        return True
    probe = "[data-view='queue']" if role == "admin" else "[data-view='guide']"
    if page.locator(probe).count() > 0:
        return True
    return _sign_in(page, cfg, role, target)


def _wait_for(page, selector, timeout_ms=8000):
    """Wait for a selector to exist. Returns True if it appeared."""
    try:
        page.wait_for_selector(selector, timeout=timeout_ms, state="attached")
        return True
    except Exception:
        return False


def _enter_view(page, view_id, admin_entry_selector, settle_ms, cfg=None, role=None):
    """Click the nav item carrying data-view=view_id. If it is not visible
    and an admin entry selector is given, try that first, since a React SPA
    commonly hides an inactive section with CSS rather than removing it from
    the DOM, so a count() check alone would miss it."""
    nav_sel = f"[data-view='{view_id}']"
    if cfg is not None and role is not None and page.locator(nav_sel).count() == 0:
        _ensure_role(page, cfg, role, cfg["_target"])
        page.wait_for_timeout(settle_ms)
    if page.locator(nav_sel).count() > 0 and not page.locator(nav_sel).first.is_visible() and admin_entry_selector:
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


# v1.1. Area pages are not top-level nav items (FRAGO 4.5: they open from a
# tile on the tracker home, not from the sidebar), so they cannot be reached
# by _enter_view's data-view lookup. These two helpers reach them by clicking
# into the area-tiles grid instead, and are shared by every new driver that
# needs "an area page" or "every area page".

AREA_TILE_SELECTOR = "[data-testid='area-tile']"


def _area_tile_count(page, cfg, settle_ms):
    """Sign in as the client, open the tracker, and count the clickable
    tiles inside area-tiles. Returns 0 if the tracker or the tiles are not
    reachable, which a caller treats as a driver failure, not a skip."""
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return 0
    if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        return 0
    tiles_sel = "[data-testid='area-tiles']"
    if not _wait_for(page, tiles_sel, 6000):
        return 0
    return page.locator(AREA_TILE_SELECTOR).count()


def _enter_area_page(page, cfg, settle_ms, index=0):
    """Sign in as the client, open the tracker, and click the tile at
    `index` inside area-tiles. Returns False if any step fails."""
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False
    if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        return False
    tiles_sel = "[data-testid='area-tiles']"
    if not _wait_for(page, tiles_sel, 6000):
        return False
    tiles = page.locator(AREA_TILE_SELECTOR)
    if tiles.count() <= index:
        return False
    tiles.nth(index).click()
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

    page.goto(cfg["_target"].rstrip("/") + "/login", wait_until="domcontentloaded")
    try:
        page.wait_for_selector(email_sel, timeout=line.get("timeout_ms", 5000))
    except Exception:
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
    role = line.get("role")
    settle_ms = line.get("settle_ms", 400)
    if role and not _ensure_role(page, cfg, role, cfg["_target"]):
        return False, f"could not sign in as the {role} account"
    failed = []
    for v in views:
        if not _enter_view(page, v, admin_entry, settle_ms, cfg, role):
            failed.append(f"{v}:nav-missing")
            continue
        _wait_for(page, heading_sel, 6000)
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
                line.get("settle_ms", 400), cfg, line.get("role"))
    table_sel = line.get("table_selector", "[data-testid='record-table']")
    _wait_for(page, table_sel)
    row_sel = line.get("row_selector", "tbody tr")
    rows = page.locator(f"{table_sel} {row_sel}")
    n = rows.count()
    return n >= 1, f"{n} row(s) in {table_sel}"


def drv_statement_contains(page, cfg, line, res, errors):
    """Line 5: the Statement contains the limitations paragraph."""
    _enter_view(page, line.get("view", "value"), line.get("admin_entry_selector"),
                line.get("settle_ms", 400), cfg, line.get("role"))
    stmt_sel = line.get("statement_selector", "[data-testid='statement']")
    _wait_for(page, stmt_sel)
    must = line.get("must_contain", "")
    loc = page.locator(stmt_sel)
    if loc.count() == 0:
        return False, f"{stmt_sel} not found"
    text = loc.first.inner_text()
    ok = must.lower() in text.lower()
    return ok, f"limitations phrase present: {ok}"


def drv_statement_excludes_illustrative_when_off(page, cfg, line, res, errors):
    """Line 6: with show-illustrative off, nothing illustrative reaches the
    client. The switch is the operator's, so this signs in as the operator to
    turn it off, then signs back in as the Information Officer to read what she
    would actually see."""
    settle_ms = line.get("settle_ms", 400)
    toggle_sel = line.get("toggle_selector", "[data-testid='toggle-illustrative']")

    if not _ensure_role(page, cfg, "admin", cfg["_target"]):
        return False, "could not sign in as the operator account"
    if not _enter_view(page, line.get("settings_view", "settings"), None, settle_ms, cfg, "admin"):
        return False, "the operator's settings view was not reachable"

    # The switch renders before the operator's settings have arrived, so its
    # checked state is not meaningful until the page has its data. Wait for it
    # to be visible, then set it to off explicitly rather than reading it first
    # and deciding: uncheck() is a no-op when it is already off.
    if not _wait_for(page, toggle_sel):
        return False, f"{toggle_sel} not found in the operator's settings"
    toggle = page.locator(toggle_sel).first
    try:
        toggle.wait_for(state="visible", timeout=6000)
        page.wait_for_timeout(600)
        toggle.uncheck(timeout=6000)
    except Exception as exc:
        return False, f"could not switch the demo setting off: {type(exc).__name__}"
    # The switch saves itself over the network. Signing out before that request
    # has finished would abort it and leave the setting unchanged, so wait for
    # the page to go quiet rather than guessing at a delay.
    try:
        page.wait_for_load_state("networkidle", timeout=10000)
    except Exception:
        page.wait_for_timeout(settle_ms * 5)
    if toggle.is_checked():
        return False, "the demo switch did not stay off"

    if not _sign_in(page, cfg, "client", cfg["_target"]):
        return False, "could not sign back in as the Information Officer"
    if not _enter_view(page, line.get("view", "statement"), None, settle_ms, cfg, "client"):
        return False, "the client statement view was not reachable"

    stmt_sel = line.get("statement_selector", "[data-testid='statement']")
    _wait_for(page, stmt_sel)
    loc = page.locator(stmt_sel)
    if loc.count() == 0:
        return False, f"{stmt_sel} not found"
    text = loc.first.inner_text()
    forbidden = line.get("forbidden_text", "illustrative")
    hit = forbidden.lower() in text.lower()

    restored = False
    # Put the demo switch back as it was. The store is shared across the whole
    # run, and the seeded record is entirely illustrative, so leaving the switch
    # off would empty the Record for every later line and resolution.
    if _ensure_role(page, cfg, "admin", cfg["_target"]) and _enter_view(
        page, line.get("settings_view", "settings"), None, settle_ms, cfg, "admin"
    ):
        if _wait_for(page, toggle_sel):
            restore = page.locator(toggle_sel).first
            try:
                restore.wait_for(state="visible", timeout=6000)
                page.wait_for_timeout(600)
                restore.check(timeout=6000)
                try:
                    page.wait_for_load_state("networkidle", timeout=10000)
                except Exception:
                    page.wait_for_timeout(settle_ms * 5)
                restored = restore.is_checked()
            except Exception:
                restored = False

    if not restored:
        return False, "the demo switch could not be put back on after the check"
    return not hit, f"'{forbidden}' in the client statement with the switch off: {hit}"


def drv_print_hides_chrome_shows_statement(page, cfg, line, res, errors):
    """Line 7: under print media, the header and nav are hidden and the
    Statement is visible."""
    _enter_view(page, line.get("view", "value"), line.get("admin_entry_selector"),
                line.get("settle_ms", 400), cfg, line.get("role"))
    chrome_sel = line.get("chrome_selector", "header, nav")
    stmt_sel = line.get("statement_selector", "[data-testid='statement']")
    _wait_for(page, stmt_sel)
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
    """Line 8: at 390 wide, no named view produces horizontal overflow.
    v1.1 adds "area" as a pseudo-view name: since an area page has no
    data-view nav item (FRAGO 4.5), it is reached via _enter_area_page
    instead of _enter_view. cfg and role are now passed into _enter_view too,
    so a view is re-reached correctly even if the session role has drifted;
    previously this was omitted, which happened to work only because line 7
    always leaves the session on the client role immediately before this
    line runs."""
    views = line.get("views", [])
    admin_entry = line.get("admin_entry_selector")
    settle_ms = line.get("settle_ms", 400)
    role = line.get("role")
    overflowing = []
    for v in views:
        entered = (
            _enter_area_page(page, cfg, settle_ms)
            if v == "area"
            else _enter_view(page, v, admin_entry, settle_ms, cfg, role)
        )
        if not entered:
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


# --- v1.1 drivers, for the Compliance Tracker. --------------------------

def drv_tracker_home_elements(page, cfg, line, res, errors):
    """Line 11: the client's home is the Compliance Tracker and answers the
    six questions. Every named test id must be present; a missing one is a
    fail, not a skip, exactly as line 11's own wording says."""
    settle_ms = line.get("settle_ms", 400)
    testids = line.get("testids", [])
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        return False, "the client tracker view was not reachable"
    missing = [t for t in testids if not _wait_for(page, f"[data-testid='{t}']", 6000)]
    ok = not missing
    return ok, (f"all {len(testids)} test ids present" if ok
                else f"missing: {', '.join(missing)}")


def drv_task_table_columns(page, cfg, line, res, errors):
    """Line 12: every task table shows the six questions, in order, and they
    are not renamed.

    The six must appear as a contiguous run, in order. A table may carry extra
    operator-only columns around them: the admin workplan adds area, phase,
    progress and actions, which the client never sees. What the rule forbids is
    renaming one of the six, dropping one, or reordering them.
    """
    settle_ms = line.get("settle_ms", 400)
    expected = [c.upper() for c in line.get("columns", ["What", "How", "Who", "When", "Done", "Status"])]
    table_sel = line.get("table_selector", "[data-testid='task-table']")
    problems = []
    checked = 0

    def headers_of(scope_label):
        nonlocal checked
        tables = page.locator(table_sel)
        count = tables.count()
        if count == 0:
            problems.append(f"{scope_label}: {table_sel} not found")
            return
        for i in range(count):
            cells = tables.nth(i).locator("th")
            got = [cells.nth(j).inner_text().strip().upper() for j in range(cells.count())]
            if not got:
                problems.append(f"{scope_label} table[{i}]: no header cells")
                continue
            checked += 1
            joined = "|".join(got)
            run = "|".join(expected)
            if run not in joined:
                problems.append(f"{scope_label} table[{i}]: {got}")

    # The client's area page carries a task table. The tracker home does not:
    # it is tiles and a "for you" list, and the order does not put a table there.
    if _enter_area_page(page, cfg, settle_ms):
        headers_of("client:area")
    else:
        problems.append("client:area: no area page reachable")

    if _ensure_role(page, cfg, "admin", cfg["_target"]) and _enter_view(
        page, "workplan", None, settle_ms, cfg, "admin"
    ):
        _wait_for(page, table_sel, 6000)
        headers_of("admin:workplan")
    else:
        problems.append("admin:workplan: view not reachable")

    ok = not problems
    detail = (
        f"{checked} task table(s) carry the six questions in order"
        if ok
        else "; ".join(problems[:4])
    )
    return ok, detail


def _find_percentages_without_fraction(page):
    """Runs in the browser. Walks the text nodes of the page, and for any
    text containing a bare N%, checks whether the fraction "N of M" appears
    in the same element's text or its parent's text. Returns the offending
    snippets, trimmed; this is rendered UI copy, not restricted data, so it
    may be quoted in the report."""
    return page.evaluate(
        """
        () => {
          const pctRe = /\\d+%/;
          const fracRe = /\\d+\\s+of\\s+\\d+/;
          const offenders = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode())) {
            const raw = node.textContent;
            if (!pctRe.test(raw)) continue;
            const el = node.parentElement;
            if (!el) continue;
            const nearby = el.textContent + " " + (el.parentElement ? el.parentElement.textContent : "");
            if (!fracRe.test(nearby)) {
              offenders.push(raw.trim().slice(0, 120));
            }
          }
          return offenders;
        }
        """
    )


def drv_percentage_has_fraction(page, cfg, line, res, errors):
    """Line 13: no percentage is shown without its fraction beside it, on
    every client tracker and area page."""
    settle_ms = line.get("settle_ms", 400)
    offenders = []

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        offenders.append("tracker: view not reachable")
    else:
        page.wait_for_timeout(settle_ms)
        for f in _find_percentages_without_fraction(page):
            offenders.append(f'tracker: "{f}"')

    if not _enter_area_page(page, cfg, settle_ms):
        offenders.append("area: view not reachable")
    else:
        page.wait_for_timeout(settle_ms)
        for f in _find_percentages_without_fraction(page):
            offenders.append(f'area: "{f}"')

    ok = not offenders
    return ok, ("no bare percentage found" if ok else "; ".join(offenders[:8]))


def _restore_illustrative_switch(page, cfg, toggle_sel, settle_ms):
    """Sign back in as the operator and switch show-illustrative back on.
    Shared by line 6's driver logic and the v1.1 tracker equivalent, kept as
    a separate copy in each driver rather than a shared refactor of line 6,
    so line 6's working behaviour is not touched by this addition."""
    if not _ensure_role(page, cfg, "admin", cfg["_target"]):
        return False
    if not _enter_view(page, "settings", None, settle_ms, cfg, "admin"):
        return False
    if not _wait_for(page, toggle_sel):
        return False
    toggle = page.locator(toggle_sel).first
    try:
        toggle.wait_for(state="visible", timeout=6000)
        page.wait_for_timeout(600)
        toggle.check(timeout=6000)
        try:
            page.wait_for_load_state("networkidle", timeout=10000)
        except Exception:
            page.wait_for_timeout(settle_ms * 5)
        return toggle.is_checked()
    except Exception:
        return False


def drv_tracker_excludes_illustrative_when_off(page, cfg, line, res, errors):
    """Line 14: with the operator's show-illustrative switch off, no
    illustrative figure is reachable on the client side of the tracker. Same
    two-role pattern as line 6: turn the switch off as the operator, read the
    client side, then put the switch back before returning, whatever the
    result, so later lines and resolutions are not left with an empty demo
    Record."""
    settle_ms = line.get("settle_ms", 400)
    toggle_sel = line.get("toggle_selector", "[data-testid='toggle-illustrative']")
    forbidden = line.get("forbidden_text", "illustrative")

    if not _ensure_role(page, cfg, "admin", cfg["_target"]):
        return False, "could not sign in as the operator account"
    if not _enter_view(page, line.get("settings_view", "settings"), None, settle_ms, cfg, "admin"):
        return False, "the operator's settings view was not reachable"
    if not _wait_for(page, toggle_sel):
        return False, f"{toggle_sel} not found in the operator's settings"
    toggle = page.locator(toggle_sel).first
    try:
        toggle.wait_for(state="visible", timeout=6000)
        page.wait_for_timeout(600)
        toggle.uncheck(timeout=6000)
    except Exception as exc:
        return False, f"could not switch the demo setting off: {type(exc).__name__}"
    try:
        page.wait_for_load_state("networkidle", timeout=10000)
    except Exception:
        page.wait_for_timeout(settle_ms * 5)
    if toggle.is_checked():
        return False, "the demo switch did not stay off"

    hits = []
    if not _sign_in(page, cfg, "client", cfg["_target"]):
        hits.append("could not sign back in as the client account")
    else:
        if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
            hits.append("tracker: view not reachable")
        else:
            page.wait_for_timeout(settle_ms)
            body_text = page.locator("body").inner_text()
            if forbidden.lower() in body_text.lower():
                hits.append("tracker")

        if not _enter_area_page(page, cfg, settle_ms):
            hits.append("area: view not reachable")
        else:
            page.wait_for_timeout(settle_ms)
            body_text = page.locator("body").inner_text()
            if forbidden.lower() in body_text.lower():
                hits.append("area")

    restored = _restore_illustrative_switch(page, cfg, toggle_sel, settle_ms)
    if not restored:
        return False, "the demo switch could not be put back on after the check"

    ok = not hits
    return ok, (f"'{forbidden}' not found on the client tracker or area page" if ok
                else f"'{forbidden}' found on: {', '.join(hits)}")


_FORBIDDEN_TASK_CONTROL_RE = re.compile(
    r"edit|delete|remove|reopen|reprioritise|change status|mark done", re.I
)


def drv_client_read_only_workplan(page, cfg, line, res, errors):
    """Line 15: the client can confirm a task assigned to them and can do
    nothing else to the workplan. This is FRAGO section 12's stop condition
    made executable, so it is deliberately strict: a confirm control must
    exist in for-you, and no button or link anywhere on the tracker or any
    area page may offer to edit, delete, reprioritise or change status."""
    settle_ms = line.get("settle_ms", 400)
    for_you_sel = line.get("for_you_selector", "[data-testid='for-you']")
    confirm_sel = line.get("confirm_selector", "[data-testid='confirm-task']")
    pattern = _FORBIDDEN_TASK_CONTROL_RE

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        return False, "the client tracker view was not reachable"
    if not _wait_for(page, for_you_sel, 6000):
        return False, f"{for_you_sel} not found"
    for_you = page.locator(for_you_sel)
    if for_you.locator(confirm_sel).count() == 0:
        return False, f"{confirm_sel} not found inside {for_you_sel}"

    offenders = []

    def scan(label):
        controls = page.locator("button, a")
        for i in range(controls.count()):
            try:
                text = controls.nth(i).inner_text().strip()
            except Exception:
                continue
            if text and pattern.search(text):
                offenders.append(f"{label}: '{text}'")

    scan("tracker")

    tile_count = _area_tile_count(page, cfg, settle_ms)
    for idx in range(tile_count):
        if not _enter_area_page(page, cfg, settle_ms, idx):
            offenders.append(f"area[{idx}]: view not reachable")
            continue
        scan(f"area[{idx}]")

    ok = not offenders
    detail = ("confirm control present; no edit/delete/reprioritise control found"
              if ok else f"confirm present; forbidden controls: {'; '.join(offenders[:8])}")
    return ok, detail


def drv_area_print_clean(page, cfg, line, res, errors):
    """Line 16: an area page prints as a clean document. Header and nav are
    hidden; the obligation text and the task table remain visible. Reset to
    screen explicitly afterwards, as line 7 already does, for the same
    reason: media=None does not reliably clear the override in this
    Playwright build."""
    settle_ms = line.get("settle_ms", 400)
    if not _enter_area_page(page, cfg, settle_ms):
        return False, "no area page reachable"
    chrome_sel = line.get("chrome_selector", "header, nav")
    obligation_sel = line.get("obligation_selector", "[data-testid='obligation']")
    table_sel = line.get("table_selector", "[data-testid='task-table']")
    _wait_for(page, table_sel, 6000)
    try:
        page.emulate_media(media="print")
        page.wait_for_timeout(200)
        chrome_loc = page.locator(chrome_sel)
        chrome_visible = chrome_loc.first.is_visible() if chrome_loc.count() > 0 else False
        obligation_loc = page.locator(obligation_sel)
        obligation_visible = obligation_loc.first.is_visible() if obligation_loc.count() > 0 else False
        table_loc = page.locator(table_sel)
        table_visible = table_loc.first.is_visible() if table_loc.count() > 0 else False
    finally:
        page.emulate_media(media="screen")
        page.wait_for_timeout(100)
    ok = (not chrome_visible) and obligation_visible and table_visible
    return ok, (f"chrome visible under print: {chrome_visible}, "
                f"obligation visible: {obligation_visible}, task table visible: {table_visible}")


def drv_kpi_tiles_never_blank(page, cfg, line, res, errors):
    """Line 17: "no data yet" is a state, not a blank. Every KPI tile on the
    client tracker must render non-empty text."""
    settle_ms = line.get("settle_ms", 400)
    row_sel = line.get("kpi_row_selector", "[data-testid='kpi-row']")
    tile_sel = line.get("kpi_tile_selector", "[data-testid='kpi-tile']")

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        return False, "the client tracker view was not reachable"
    if not _wait_for(page, row_sel, 6000):
        return False, f"{row_sel} not found"

    tiles = page.locator(f"{row_sel} {tile_sel}")
    n = tiles.count()
    if n == 0:
        return False, f"no {tile_sel} found inside {row_sel}"

    blanks = [str(i) for i in range(n) if not tiles.nth(i).inner_text().strip()]
    ok = not blanks
    return ok, (f"{n} KPI tile(s), all non-empty" if ok
                else f"{n} KPI tile(s), blank at index: {', '.join(blanks)}")


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
    # v1.1, the Compliance Tracker.
    "tracker_home_elements": drv_tracker_home_elements,
    "task_table_columns": drv_task_table_columns,
    "percentage_has_fraction": drv_percentage_has_fraction,
    "tracker_excludes_illustrative_when_off": drv_tracker_excludes_illustrative_when_off,
    "client_read_only_workplan": drv_client_read_only_workplan,
    "area_print_clean": drv_area_print_clean,
    "kpi_tiles_never_blank": drv_kpi_tiles_never_blank,
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

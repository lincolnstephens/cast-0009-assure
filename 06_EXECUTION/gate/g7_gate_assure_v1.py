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

v1.3 (FRAGO 03, the operator's dashboard). The client nav becomes six items
(Value leaves it, Quick questions returns), the tracker is reduced to three
sections, Jobs becomes a three-column Job management board, modules 2, 3 and
8 are renamed, and Value gains an admin menu item. Lines the order
invalidates carry "status": "retired" in DEFINITION_OF_DONE.json with the
reason beside them; run_driven reports them as retired and does not count
them. Lines with "drive": "static" run in the static section, once, not per
resolution (line 30, check_restricted.py).

v1.4 (FRAGO 04, tile contrast and "View as client"). Line 32 measures tile
text against tile fill (WCAG relative luminance, 4.5:1) in every RAG state,
using a probe tile for a state the live data does not show. Lines 33 to 35
and 37 to 38 are API level, with a separate cookie jar per seat; they run
once, at the first resolution, and prove that client view serves the client
seat's own responses, refuses every write, is ignored for a client session,
does not follow the admin toggle, and is audited once per session. Line 36
drives the banner in the browser. Nothing is confirmed, posted or raised as
the client, and the one setting changed (denominatorMode) is restored in a
finally block. client-view is not added to line 3: it redirects out of the
admin workspace, so line 36 covers it instead.

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
    "iteration": "v1.4",

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
    # v1.3: the character is written as an escape so this file carries none.
    hits = [str(p.relative_to(cfg["root"])) for p, t in sources.items() if "\u2014" in t]
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


# v1.2. AREAS lives in the same file as TASK_COLUMNS. This check is the
# opposite way round from line 19, driven: line 19 reads AREAS at run time so
# the gate cannot drift from the source; this static check hardcodes the
# eight names from the order on purpose, because here the point is that the
# source agrees with the order the order itself sets out, not that the gate
# reads its own contract back to itself.
# v1.3: the names are now FRAGO 03 section 3.3's (modules 2, 3 and 8 renamed).
FRAGO_AREA_NAMES_EXPECTED = [
    "DPO registration",
    "Data tracker compliance",
    "Data retention practice",
    "Policy review",
    "Data protection impact assessment",
    "Data subject requests",
    "Vendor data risk",
    "Data breach and incident response",
]

# v1.3. The three retired module names, which must appear nowhere on the
# client side (line 29). Matched case-sensitively, on purpose: the policy
# pack carries a real policy titled "Data Retention Schedule" (capital R),
# which a case-insensitive match on "Data retention" would flag. The old
# module 3 name is matched as "Data retention" NOT followed by " practice",
# so the new name "Data retention practice" does not trip it either. Known
# limit: ordinary prose that begins a sentence "Data retention ..." (lower
# case r, any word but "practice") would be flagged; on the client side that
# wording is the old module name in all but name, so it is treated as a hit.
OLD_AREA_NAME_PATTERNS = [
    ("Data tracker review", re.compile(r"Data tracker review")),
    ("Data breach and incident management", re.compile(r"Data breach and incident management")),
    ("Data retention (not followed by ' practice')", re.compile(r"Data retention(?! practice)")),
]


def _find_areas_array(text):
    """Return the raw text inside AREAS = [ ... ] as const, or None."""
    m = re.search(r"export const AREAS\s*=\s*\[(.*?)\]\s*as const", text, re.S)
    return m.group(1) if m else None


def check_area_names_match_frago(sources, cfg):
    """The eight module names in tracker.ts match FRAGO 03 section 3.3
    exactly, in order."""
    target = cfg["root"] / TASK_COLUMNS_SOURCE
    text = None
    for p, t in sources.items():
        if p == target:
            text = t
            break
    if text is None:
        return check("static: AREAS contract present", False,
                      f"{TASK_COLUMNS_SOURCE} not found in scanned source")
    body = _find_areas_array(text)
    if body is None:
        return check("static: AREAS contract present", False,
                      "AREAS declaration not found in tracker.ts")
    found = re.findall(r'name:\s*"([^"]*)"', body)
    ok = found == FRAGO_AREA_NAMES_EXPECTED
    return check("static: the eight module names match FRAGO 03 section 3.3, in order",
                 ok, "matches exactly" if ok else f"found {found}")


# v1.2. Documents are stored in Netlify Blobs and nowhere else (FRAGO 02
# rule 9; V12_BRIEF "No new dependency. No spend. Files go to Netlify Blobs
# and nowhere else."). This check is deliberately narrow: it matches call
# shapes that write a file (writeFile, writeFileSync, appendFile,
# createWriteStream, fs.*write*, or an S3 client) rather than a bare "fs."
# substring, which would also catch the Blobs store's own local-dev fallback
# reads (fs.readFile, fs.readdir, fs.stat) and flag them as false positives.
# Scope is apps/web and packages only, as asked; netlify/functions is out of
# scope on purpose because the deployed function is a bundled build artefact
# that inlines the store's own writeFile calls (legitimate) alongside
# unrelated vendor code (a compressed font table was found, on inspection, to
# contain the literal substring "S3" by coincidence) that would make a hit
# there meaningless rather than a signal.
FILE_WRITE_PATTERNS = [
    re.compile(r"\bwriteFile(Sync)?\s*\("),
    re.compile(r"\bcreateWriteStream\s*\("),
    re.compile(r"\bappendFile(Sync)?\s*\("),
    re.compile(r"\bfs\.\w*[Ww]rite\w*\s*\("),
    re.compile(r"\bS3Client\b|\bPutObjectCommand\b|@aws-sdk/client-s3"),
]

# The only two places allowed to write an uploaded file: the documents lane's
# own module, and the Blobs store itself (packages/server/src/db/store.ts,
# which already carries the local-dev filesystem fallback the driver uses
# when no Netlify Blobs context is available).
FILE_WRITE_ALLOWED = {
    "06_EXECUTION/build/maximus-src/packages/server/src/lib/documents.ts",
    "06_EXECUTION/build/maximus-src/packages/server/src/db/store.ts",
}

FILE_WRITE_SCAN_PREFIXES = (
    "06_EXECUTION/build/maximus-src/apps/web/",
    "06_EXECUTION/build/maximus-src/packages/",
)


def check_no_file_writes_outside_store(sources, cfg):
    """No file under apps/web or packages writes an uploaded file anywhere
    but the store. A hit outside the two allowed files is a fail; an absent
    hit anywhere is silently fine, since most files never touch a filesystem
    at all."""
    hits = []
    for path, text in sources.items():
        rel = str(path.relative_to(cfg["root"])).replace("\\", "/")
        if rel in FILE_WRITE_ALLOWED:
            continue
        if not rel.startswith(FILE_WRITE_SCAN_PREFIXES):
            continue
        for lineno, line in enumerate(text.splitlines(), start=1):
            if any(pat.search(line) for pat in FILE_WRITE_PATTERNS):
                hits.append(f"{rel}:{lineno}")
    ok = not hits
    return check("static: no file write outside documents.ts and the Blobs store",
                 ok, "no hits" if ok else "; ".join(hits[:8]))


# v1.3. FRAGO 03 section 3.9: check_restricted.py passes. The script is
# called as it stands, not copied, so the gate and the pre-commit check cannot
# disagree about what counts as a hit. It reads the names itself at run time;
# this function never sees them. Its output is captured and only its closing
# summary line (a count of terms, files and hits, no name and no path) is
# kept, because its HIT lines carry paths, which are not echoed here.
CHECK_RESTRICTED_SCRIPT = "06_EXECUTION/gate/check_restricted.py"


def sdrv_check_restricted_passes(cfg, line):
    import subprocess
    rel = line.get("script", CHECK_RESTRICTED_SCRIPT)
    script = cfg["root"] / rel
    if not script.is_file():
        return False, f"{rel} not found"
    try:
        proc = subprocess.run(
            [sys.executable, str(script), str(cfg["root"])],
            capture_output=True, text=True, encoding="utf-8", errors="replace",
            timeout=line.get("timeout_s", 600),
        )
    except Exception as exc:
        return False, f"check_restricted.py did not complete: {type(exc).__name__}"
    summary = next((ln.strip() for ln in reversed(proc.stdout.splitlines())
                    if "restricted terms checked" in ln), "")
    if proc.returncode == 0:
        return True, summary or "exit 0"
    if proc.returncode == 2:
        return False, "the restricted names could not be read (exit 2); an absent list is not a pass"
    return False, (summary or "no summary line") + f" (exit {proc.returncode})"


STATIC_DRIVERS = {
    "check_restricted_passes": sdrv_check_restricted_passes,
}


def run_static_dod_lines(cfg):
    """v1.3. Run the definition-of-done lines whose drive is "static". They
    run once, here, not once per resolution, because they read files, not
    the page. A static line with no registered driver fails; it does not skip."""
    dod = load_dod(cfg)
    if dod is None:
        check("static: definition of done present", False, cfg["dod_file"])
        return
    for line in dod.get("lines", []):
        if line.get("drive") != "static" or line.get("status") == "retired":
            continue
        name = f"L{line['id']} static: {line['line'][:70]}"
        driver = STATIC_DRIVERS.get(line.get("check"))
        if driver is None:
            check(name, False, f"no static driver registered for check '{line.get('check')}'", line["id"])
            continue
        try:
            ok, detail = driver(cfg, line)
        except Exception as exc:
            ok, detail = False, f"{type(exc).__name__}: {exc}"
        check(name, ok, detail, line["id"])


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
    check_area_names_match_frago(sources, cfg)
    check_no_file_writes_outside_store(sources, cfg)
    run_static_dod_lines(cfg)

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
    for line in dod.get("lines", []):
        if line.get("status") == "retired":
            print(f"RETIRED L{line['id']}: {line.get('retired_reason', 'no reason given')}")

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
                # v1.3: a retired line is reported once, above, and never
                # driven; a static line has already run in the static section.
                if line.get("status") == "retired" or line.get("drive") == "static":
                    continue
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
    # v1.4: a "View as client" left in sessionStorage must not carry into
    # the next sign-in. Clear it and reload so the app starts without it.
    try:
        held = page.evaluate(
            "() => { try { const v = sessionStorage.getItem('assure.clientView');"
            " sessionStorage.removeItem('assure.clientView'); return v !== null; }"
            " catch (e) { return false; } }")
    except Exception:
        held = False
    if held:
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
    # v1.2: the client probe was [data-view='guide'] because Policy Guide was
    # a top-level client nav item in v1.1. It no longer is (FRAGO 02 section
    # 4: it moves to the foot of Jobs), so the probe now uses 'tracker',
    # which is the client's home in both v1.1 and v1.2 and was never removed.
    # v1.3: 'guide' is back in the client nav (Quick questions), but 'tracker'
    # is still the home and still the safer probe; unchanged.
    probe = "[data-view='queue']" if role == "admin" else "[data-view='tracker']"
    # v1.4: in "View as client" the operator sees the client nav, so the
    # tracker probe alone would take the operator's preview for the client
    # seat. The banner marks the preview; with it present, sign in afresh.
    if role == "client" and page.locator("[data-testid='client-view-banner']").count() > 0:
        return _sign_in(page, cfg, role, target)
    if page.locator(probe).count() > 0:
        return True
    return _sign_in(page, cfg, role, target)


def _text(locator):
    """v1.3. An element's textContent with whitespace collapsed. Used where
    the gate compares words the order fixes (names, headings, labels), so a
    CSS text-transform or a line break in the markup cannot change the
    reading."""
    return " ".join((locator.text_content() or "").split())


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
    if page.locator(nav_sel).count() == 0:
        # The app may still be booting after a sign-in; give the item a chance
        # to appear rather than reading a half-rendered page as an absence.
        _wait_for(page, nav_sel, 6000)
    loc = page.locator(nav_sel)
    if loc.count() == 0:
        return False
    try:
        loc.first.click(timeout=6000)
    except Exception:
        return False
    page.wait_for_timeout(settle_ms)
    return True


# v1.1. Area pages are not top-level nav items (FRAGO 4.5: they open from a
# tile on the tracker home, not from the sidebar), so they cannot be reached
# by _enter_view's data-view lookup. These two helpers reach them by clicking
# a tile on the tracker instead, and are shared by every driver that needs
# "an area page" or "every area page".
#
# v1.3 (FRAGO 03 section 3.2): area-tiles and area-tile are removed from the
# tracker. The eight tiles now sit in the "Overall compliance status" section
# as module-tile links to /tracker/areas/{1..8}, so both helpers wait for
# tracker-overall and click module-tile instead.

AREA_TILE_CONTAINER = "[data-testid='tracker-overall']"
AREA_TILE_SELECTOR = "[data-testid='module-tile']"


def _area_tile_count(page, cfg, settle_ms):
    """Sign in as the client, open the tracker, and count the module tiles.
    Returns 0 if the tracker or the tiles are not reachable, which a caller
    treats as a driver failure, not a skip."""
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return 0
    if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        return 0
    if not _wait_for(page, AREA_TILE_SELECTOR, 6000):
        return 0
    return page.locator(AREA_TILE_SELECTOR).count()


def _enter_area_page(page, cfg, settle_ms, index=0):
    """Sign in as the client, open the tracker, and click the module tile at
    `index` (0 is module 1). Returns False if any step fails."""
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False
    if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        return False
    if not _wait_for(page, AREA_TILE_SELECTOR, 6000):
        return False
    tiles = page.locator(AREA_TILE_SELECTOR)
    if tiles.count() <= index:
        return False
    tiles.nth(index).click()
    page.wait_for_timeout(settle_ms)
    # The module page is loaded when its h1 is; the task table and intro
    # arrive with the same response.
    _wait_for(page, "[data-testid='module-progress']", 6000)
    return True


def _enter_client_value(page, cfg, settle_ms):
    """v1.3. Value has left the client nav (FRAGO 03 section 3.6) but /value
    still routes for the client, reached from the Statement page's link "The
    record behind this statement". This reaches it that way, by the link the
    client actually has, rather than by typing a URL she would not."""
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False
    if not _enter_view(page, "statement", None, settle_ms, cfg, "client"):
        return False
    link_sel = "[data-testid='statement-record-link']"
    if not _wait_for(page, link_sel, 6000):
        return False
    try:
        page.locator(link_sel).first.click(timeout=6000)
    except Exception:
        return False
    page.wait_for_timeout(settle_ms)
    return True


def _enter_any(page, cfg, view, admin_entry, settle_ms, role):
    """v1.3. Reach a named view, a module page or the client Value page.
    "area" is module 1; "area:N" is module N (1 to 8); "value" on the client
    side goes through the Statement's link, since it is no longer a nav item.
    Anything else is a nav data-view, as before."""
    if view == "area":
        return _enter_area_page(page, cfg, settle_ms, 0)
    if view.startswith("area:"):
        return _enter_area_page(page, cfg, settle_ms, int(view.split(":", 1)[1]) - 1)
    if view == "value" and role == "client":
        return _enter_client_value(page, cfg, settle_ms)
    return _enter_view(page, view, admin_entry, settle_ms, cfg, role)


def _client_surface_views(line):
    """The client views a whole-client-side line walks: every nav view, the
    Value page behind the Statement's link, and all eight module pages."""
    return line.get("views", [
        "tracker", "documents", "jobs", "request", "statement", "guide", "value",
        "area:1", "area:2", "area:3", "area:4", "area:5", "area:6", "area:7", "area:8",
    ])


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
        # v1.3: _enter_any, so a line may name "area:N" or the client "value".
        if not _enter_any(page, cfg, v, admin_entry, settle_ms, role):
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
    """Line 4: the Record table renders at least one row.
    v1.3: Value is no longer a client nav item, so the client reaches it
    through the Statement's "The record behind this statement" link
    (_enter_any's "value" case). The rule itself is unchanged."""
    if not _enter_any(page, cfg, line.get("view", "value"), line.get("admin_entry_selector"),
                      line.get("settle_ms", 400), line.get("role")):
        return False, f"the {line.get('view', 'value')} view was not reachable"
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
        # v1.3: _enter_any also covers the client "value" page, now reached
        # only through the Statement's link, and "area:N".
        entered = _enter_any(page, cfg, v, admin_entry, settle_ms, role)
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
                # The card stack below the phone breakpoint carries its own id
                # now; anything here without headers is a hidden table, not a
                # renamed one.
                continue
            checked += 1
            joined = "|".join(got)
            run = "|".join(expected)
            if run not in joined:
                problems.append(f"{scope_label} table[{i}]: {got}")

    # v1.3: the places a task table must appear are read from the line's
    # "targets" rather than hardcoded. The client Jobs target is retired:
    # FRAGO 03 section 3.5 replaces the Jobs task tables with a three-column
    # card board, so there is no table there to check (line 21 now checks
    # the board, and that no task table is left on it). The area page and the
    # admin Workplan keep their tables and stay checked.
    targets = line.get("targets", [
        {"role": "client", "view": "area"},
        {"role": "admin", "view": "workplan"},
    ])
    for t in targets:
        role, view = t.get("role"), t.get("view")
        label = f"{role}:{view}"
        # The table is in the DOM at every width, hidden by CSS below the
        # phone breakpoint. Wait for it rather than reading a page mid-render.
        if _ensure_role(page, cfg, role, cfg["_target"]) and _enter_any(
            page, cfg, view, None, settle_ms, role
        ):
            _wait_for(page, table_sel, 6000)
            headers_of(label)
        else:
            problems.append(f"{label}: view not reachable")

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
    """Line 13: no percentage is shown without its fraction beside it.
    v1.3 (FRAGO 03 section 3.9, "every percentage on the client side"): the
    walk is extended from the tracker and one area page to every client view
    in the line's "views" (tracker, all eight module pages, Job management,
    Statement and the rest of the client side). The in-page rule is unchanged
    from v1.1: the fraction must be in the text node's own element or that
    element's parent, which tolerates a percentage wrapped in its own <span>
    inside the sentence that carries the fraction."""
    settle_ms = line.get("settle_ms", 400)
    offenders = []
    views = _client_surface_views(line)

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    for v in views:
        if not _enter_any(page, cfg, v, None, settle_ms, "client"):
            offenders.append(f"{v}: view not reachable")
            continue
        page.wait_for_timeout(settle_ms)
        for f in _find_percentages_without_fraction(page):
            offenders.append(f'{v}: "{f}"')

    ok = not offenders
    return ok, (f"no bare percentage found across {len(views)} client views" if ok
                else "; ".join(offenders[:8]))


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


# v1.2: word-bounded. The bare substring version matched "remove" inside
# ordinary copy such as "access that should be removed" (the new employee
# access tracker review task's How text), which is not a control at all. A
# real control is an imperative label ("Edit", "Remove"), never a past
# participle in a sentence, so \b...\b is strictly tighter without losing
# anything the line is meant to catch.
_FORBIDDEN_TASK_CONTROL_RE = re.compile(
    r"\b(edit|delete|remove|reopen|reprioritise)\b|change status|mark done", re.I
)


def drv_client_read_only_workplan(page, cfg, line, res, errors):
    """Line 15: the client can confirm a task assigned to them and can do
    nothing else to the workplan. This is FRAGO section 12's stop condition
    made executable, so it is deliberately strict: a confirm control must
    exist in for-you, and no button or link anywhere on the tracker or any
    area page may offer to edit, delete, reprioritise or change status."""
    settle_ms = line.get("settle_ms", 400)
    # v1.3 (FRAGO 03 section 3.5): the "for you" rows and their confirm
    # control move off the tracker into the "Waiting on you" strip at the top
    # of Job management, so the confirm control is looked for there. The
    # strip may legitimately hold no open row (every task confirmed, or none
    # assigned); then for-you-empty or for-you-confirmed stands in, and the
    # detail says which, so a pass without a live confirm control is visible.
    for_you_sel = line.get("for_you_selector", "[data-testid='waiting-on-you']")
    for_you_view = line.get("for_you_view", "jobs")
    confirm_sel = line.get("confirm_selector", "[data-testid='confirm-task']")
    empty_sel = line.get("for_you_empty_selector",
                         "[data-testid='for-you-empty'], [data-testid='for-you-confirmed']")
    pattern = _FORBIDDEN_TASK_CONTROL_RE

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, for_you_view, None, settle_ms, cfg, "client"):
        return False, f"the client {for_you_view} view was not reachable"
    if not _wait_for(page, for_you_sel, 6000):
        return False, f"{for_you_sel} not found"
    # The strip renders before its rows arrive; wait for a row's control or
    # an explicit empty or confirmed state before deciding which it is.
    _wait_for(page, ", ".join(
        f"{for_you_sel} {s}" for s in
        (confirm_sel, "[data-testid='for-you-empty']", "[data-testid='for-you-confirmed']")
    ), 6000)
    for_you = page.locator(for_you_sel)
    confirm_state = "confirm control present"
    if for_you.locator(confirm_sel).count() == 0:
        if for_you.locator(empty_sel).count() == 0:
            return False, f"neither {confirm_sel} nor an empty or confirmed state inside {for_you_sel}"
        confirm_state = "no open row to confirm (empty or confirmed state shown)"

    offenders = []

    # A control's label is short. A clickable row's text is the whole row, which
    # is prose, and prose says things like "access that should be removed". Only
    # text short enough to be a label is treated as one; anything longer is
    # content, and content is not a control.
    LABEL_MAX_CHARS = 48

    def scan(label):
        controls = page.locator("button, a")
        for i in range(controls.count()):
            try:
                text = " ".join(controls.nth(i).inner_text().split())
            except Exception:
                continue
            if not text or len(text) > LABEL_MAX_CHARS:
                continue
            if pattern.search(text):
                offenders.append(f"{label}: '{text}'")

    scan(for_you_view)

    if _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        scan("tracker")
    else:
        offenders.append("tracker: view not reachable")

    tile_count = _area_tile_count(page, cfg, settle_ms)
    if tile_count == 0:
        offenders.append("tracker: no module tile to open")
    for idx in range(tile_count):
        if not _enter_area_page(page, cfg, settle_ms, idx):
            offenders.append(f"area[{idx}]: view not reachable")
            continue
        scan(f"area[{idx}]")

    # v1.2. Jobs and Documents are the two new surfaces that could grow a
    # write control by accident: Jobs is a consolidated task list, and
    # Documents is a repository the operator publishes into. Both are
    # scanned with the same forbidden-word sweep as the tracker and every
    # area page.
    # v1.3: Jobs is already scanned above (it is where the confirm control
    # now lives), so only Documents is added here.
    if _ensure_role(page, cfg, "client", cfg["_target"]) and _enter_view(
        page, "documents", None, settle_ms, cfg, "client"
    ):
        scan("documents")
    else:
        offenders.append("documents: view not reachable")

    ok = not offenders
    detail = (f"{confirm_state}; no edit/delete/reprioritise control found"
              if ok else f"{confirm_state}; problems: {'; '.join(offenders[:8])}")
    return ok, detail


def drv_area_print_clean(page, cfg, line, res, errors):
    """Line 16: an area page prints as a clean document. Header and nav are
    hidden; the obligation text and the task table remain visible. Reset to
    screen explicitly afterwards, as line 7 already does, for the same
    reason: media=None does not reliably clear the override in this
    Playwright build.

    v1.3: the text that must survive print is now the module introduction
    (module-intro), which FRAGO 03 section 3.4 puts at the top of every
    module page; the obligation block is not in the v1.3 page contract. The
    selector is read from the line's obligation_selector, which the
    definition of done now sets to module-intro."""
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
        if not table_visible:
            cards = page.locator("[data-testid='task-cards']")
            table_visible = cards.first.is_visible() if cards.count() > 0 else False
    finally:
        page.emulate_media(media="screen")
        page.wait_for_timeout(100)
    ok = (not chrome_visible) and obligation_visible and table_visible
    return ok, (f"chrome visible under print: {chrome_visible}, "
                f"{obligation_sel} visible: {obligation_visible}, tasks visible: {table_visible}")


def drv_kpi_tiles_never_blank(page, cfg, line, res, errors):
    """Line 17: "no data yet" is a state, not a blank. Every KPI tile on the
    client tracker must render non-empty text.

    RETIRED at v1.3: FRAGO 03 section 3.2 removes KpiRow from the tracker, so
    there is no kpi-row to read. Line 17 carries status "retired" and is not
    driven; this function stays only so an older definition of done still
    resolves. The "never blank" rule moves to the module tiles (line 25:
    every tile carries "{done} of {total} done")."""
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


# --- v1.2 drivers, Lurong's structure. -------------------------------

def drv_client_nav_order(page, cfg, line, res, errors):
    """Line 18: the client's navigation is Lurong's, in her order. Reads the
    nav elements carrying data-view in DOM order with a single selector (a
    scoped attribute selector, not a comma list), so this can only ever read
    the nav, never click anything in it."""
    settle_ms = line.get("settle_ms", 400)
    nav_sel = line.get("nav_selector", "nav [data-view]")
    expected = line.get("expected", ["tracker", "documents", "jobs", "request", "value", "statement"])
    forbidden = line.get("forbidden", ["posture", "exposure"])

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    page.wait_for_timeout(settle_ms)
    if not _wait_for(page, nav_sel, 6000):
        return False, f"{nav_sel} not found"

    items = page.locator(nav_sel)
    n = items.count()
    got = [items.nth(i).get_attribute("data-view") for i in range(n)]

    order_ok = got == list(expected)
    present_forbidden = [v for v in forbidden if v in got]

    # v1.3 (FRAGO 03 section 3.1): the labels are part of the order too, so
    # when the line names them they are read (textContent, whitespace
    # collapsed, so a label hidden by CSS at one width still reads) and
    # compared exactly, in the same order.
    labels_expected = line.get("expected_labels")
    labels_ok = True
    got_labels = []
    if labels_expected:
        got_labels = [" ".join((items.nth(i).text_content() or "").split()) for i in range(n)]
        labels_ok = got_labels == list(labels_expected)

    ok = order_ok and not present_forbidden and labels_ok
    if ok:
        detail = f"nav reads {got}, in order, labels match, with none of {forbidden}"
    elif not order_ok:
        detail = f"expected {expected}, got {got}"
    elif present_forbidden:
        detail = f"forbidden view(s) present in client nav: {present_forbidden}"
    else:
        detail = f"labels expected {labels_expected}, got {got_labels}"
    return ok, detail


def _load_tracker_areas(cfg):
    """Read AREAS from packages/shared/src/tracker.ts at run time, so line 19
    is checked against the same source of truth the product renders from and
    the two cannot drift apart. Returns the eight names in id order, or None
    if the array cannot be found."""
    path = cfg["root"] / TASK_COLUMNS_SOURCE
    if not path.is_file():
        return None
    text = path.read_text(encoding="utf-8", errors="replace")
    body = _find_areas_array(text)
    if body is None:
        return None
    names = re.findall(r'name:\s*"([^"]*)"', body)
    return names or None


def drv_module_titles_match_areas(page, cfg, line, res, errors):
    """Line 19: the eight modules carry their v1.3 titles. Checks the module
    tiles on the tracker and the module sub-navigation against AREAS, read
    from tracker.ts at run time rather than hardcoded here, so the gate
    cannot drift from the source."""
    settle_ms = line.get("settle_ms", 400)
    expected = _load_tracker_areas(cfg)
    if not expected:
        return False, f"could not read AREAS from {TASK_COLUMNS_SOURCE}"

    # v1.3: the tile names are module-tile-name inside the new
    # tracker-overall section (area-tiles is gone), and the module
    # sub-navigation has moved off the tracker onto every module page
    # (FRAGO 03 section 3.4), so it is read on module 1's page.
    tile_sel = line.get("tile_selector", "[data-testid='module-tile-name']")
    subnav_sel = line.get("subnav_selector", "[data-testid='module-nav-item']")

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        return False, "the client tracker view was not reachable"

    problems = []

    if not _wait_for(page, tile_sel, 6000):
        problems.append(f"{tile_sel} not found")
    else:
        tiles = page.locator(tile_sel)
        # textContent, not innerText: the name is compared as written in
        # the DOM, so a CSS text-transform cannot make a right name read wrong.
        tile_names = [_text(tiles.nth(i)) for i in range(tiles.count())]
        if tile_names != list(expected):
            problems.append(f"tiles read {tile_names}")

    if not _enter_area_page(page, cfg, settle_ms, 0):
        problems.append("module 1 page not reachable for the sub-navigation")
    elif not _wait_for(page, subnav_sel, 6000):
        problems.append(f"{subnav_sel} not found")
    else:
        subnav = page.locator(subnav_sel)
        # The sub-navigation numbers its entries ("1. DPO registration"). The
        # rule is that the titles match, not that they are unadorned.
        subnav_names = [
            re.sub(r"^\s*\d+\.\s*", "", _text(subnav.nth(i)))
            for i in range(subnav.count())
        ]
        if subnav_names != list(expected):
            problems.append(f"sub-nav reads {subnav_names}")

    ok = not problems
    detail = (f"{len(expected)} module names match AREAS on tiles and sub-nav"
              if ok else "; ".join(problems))
    return ok, detail


# Word-bounded for the same reason as _FORBIDDEN_TASK_CONTROL_RE above: a
# bare substring would flag ordinary copy ("replacement", "edited", "removed
# from the pack") rather than an actual control.
_FORBIDDEN_DOCUMENT_CONTROL_RE = re.compile(r"\b(upload|delete|remove|edit|replace)\b", re.I)


def drv_documents_read_only(page, cfg, line, res, errors):
    """Line 20: Compliance Documents shows the three sections and the client
    cannot write. Every control found is only ever read with inner_text(),
    never clicked, so this driver cannot mutate what it inspects."""
    settle_ms = line.get("settle_ms", 400)
    page_sel = line.get("page_selector", "[data-testid='documents']")
    section_sel = line.get("section_selector", "[data-testid='document-section']")

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, "documents", None, settle_ms, cfg, "client"):
        return False, "the client documents view was not reachable"
    if not _wait_for(page, page_sel, 6000):
        return False, f"{page_sel} not found"

    problems = []

    sections = page.locator(section_sel)
    n = sections.count()
    if n != 3:
        problems.append(f"expected 3 {section_sel}, found {n}")

    if page.locator("input[type='file']").count() > 0:
        problems.append("input[type='file'] present")

    controls = page.locator("button, a")
    for i in range(controls.count()):
        try:
            text = controls.nth(i).inner_text().strip()
        except Exception:
            continue
        if text and _FORBIDDEN_DOCUMENT_CONTROL_RE.search(text):
            problems.append(f"forbidden control: '{text}'")

    ok = not problems
    detail = ("three sections present, no upload input, no write control"
              if ok else "; ".join(problems[:8]))
    return ok, detail


def drv_jobs_page(page, cfg, line, res, errors):
    """Line 21: Job management is the operator's three-column board, and the
    client's only write on it is confirm.

    v1.3 (FRAGO 03 section 3.5) rewrites this line. The v1.2 version looked
    for three grouped task tables; the order replaces them with a board of
    cards, so the table half is inverted (no task table may remain on the
    page) and the board is checked instead: one h1 "Job management", the
    "Waiting on you" strip with its rows or its empty state, exactly three
    job-column blocks named Not started, In progress, Completed in that order,
    every card carrying a module name and a RAG label, and a blocked card
    only ever in In progress. The Guide has left the foot of the page.

    "No write control other than confirm" is checked by shape, inside the
    page container only (the sidebar's Sign out is outside it): every button
    must be confirm-task; inputs may only be text or checkbox (the evidence
    field and the "Due this month" filter); selects are allowed because they
    are view filters; nothing may be draggable or contenteditable. Every
    control is read, never clicked."""
    settle_ms = line.get("settle_ms", 400)
    page_sel = line.get("page_selector", "[data-testid='jobs']")
    strip_sel = line.get("strip_selector", "[data-testid='waiting-on-you']")
    board_sel = line.get("board_selector", "[data-testid='job-board']")
    column_sel = line.get("column_selector", "[data-testid='job-column']")
    column_name_sel = line.get("column_name_selector", "[data-testid='job-column-name']")
    card_sel = line.get("card_selector", "[data-testid='job-card']")
    blocked_sel = line.get("blocked_selector", "[data-testid='job-blocked']")
    confirm_testid = line.get("confirm_testid", "confirm-task")
    title = line.get("title", "Job management")
    strip_heading = line.get("strip_heading", "Waiting on you")
    expected_columns = line.get("column_names", ["Not started", "In progress", "Completed"])
    allowed_input_types = set(line.get("allowed_input_types", ["text", "search", "checkbox", ""]))

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, "jobs", None, settle_ms, cfg, "client"):
        return False, "the client jobs view was not reachable"
    if not _wait_for(page, page_sel, 6000):
        return False, f"{page_sel} not found"
    # The board is drawn once the tasks arrive; absence checks below are only
    # meaningful after that.
    if not _wait_for(page, f"{board_sel} {column_sel}", 6000):
        return False, f"{board_sel} with its columns not found"

    problems = []
    root = page.locator(page_sel).first
    areas = _load_tracker_areas(cfg) or []
    rag_labels = list(_load_rag_labels(cfg).values())

    h1s = page.locator("h1")
    h1_texts = [_text(h1s.nth(i)) for i in range(h1s.count())]
    if h1_texts != [title]:
        problems.append(f"h1 reads {h1_texts}, expected ['{title}']")

    if not _wait_for(page, strip_sel, 6000):
        problems.append(f"{strip_sel} not found")
    else:
        strip = page.locator(strip_sel).first
        heads = strip.locator("h1, h2, h3, h4")
        if strip_heading not in [_text(heads.nth(i)) for i in range(heads.count())]:
            problems.append(f"'{strip_heading}' heading not found in {strip_sel}")
        state_sel = ", ".join(f"{strip_sel} [data-testid='{t}']"
                              for t in ("for-you-row", "for-you-empty", "for-you-confirmed"))
        if not _wait_for(page, state_sel, 6000):
            problems.append(f"{strip_sel} shows neither a row nor its empty state")

    cols = page.locator(f"{board_sel} {column_sel}")
    n_cols = cols.count()
    if n_cols != len(expected_columns):
        problems.append(f"expected {len(expected_columns)} {column_sel}, found {n_cols}")
    got_columns = []
    for i in range(n_cols):
        name = cols.nth(i).locator(column_name_sel)
        got_columns.append(_text(name.first) if name.count() > 0 else "")
        blocked_here = cols.nth(i).locator(blocked_sel).count()
        if blocked_here and i != 1:
            problems.append(f"{blocked_here} blocked card(s) outside In progress (column {i + 1})")
    if got_columns != list(expected_columns):
        problems.append(f"column names read {got_columns}")

    cards = page.locator(f"{board_sel} {card_sel}")
    n_cards = cards.count()
    for i in range(n_cards):
        t = _text(cards.nth(i))
        if not t:
            problems.append(f"card[{i}] is blank")
            continue
        if areas and not any(a in t for a in areas):
            problems.append(f"card[{i}] carries no module name: '{t[:60]}'")
        if rag_labels and not any(r in t for r in rag_labels):
            problems.append(f"card[{i}] carries no RAG label: '{t[:60]}'")

    if page.locator("[data-testid='task-table'], [data-testid='task-cards']").count() > 0:
        problems.append("a task table is still on Job management")
    if page.locator("[data-testid='quick-questions-intro']").count() > 0 or root.locator("textarea").count() > 0:
        problems.append("the Guide (or its question box) is still on Job management")

    buttons = root.locator("button, [role='button'], input[type='submit'], input[type='button'], input[type='reset']")
    for i in range(buttons.count()):
        b = buttons.nth(i)
        if b.get_attribute("data-testid") != confirm_testid:
            problems.append(f"write-capable control other than confirm: '{_text(b)[:40]}'")
    inputs = root.locator("input")
    for i in range(inputs.count()):
        typ = (inputs.nth(i).get_attribute("type") or "").lower()
        if typ in ("submit", "button", "reset"):
            continue  # already reported with the buttons above
        if typ not in allowed_input_types:
            problems.append(f"input of type '{typ}' on Job management")
    if root.locator("[draggable='true']").count() > 0:
        problems.append("a draggable element is on Job management")
    if root.locator("[contenteditable='true'], [contenteditable='']").count() > 0:
        problems.append("a contenteditable element is on Job management")

    ok = not problems
    detail = (f"board of 3 columns {got_columns}, {n_cards} card(s), strip present, "
              f"no task table, no Guide, no write control but confirm"
              if ok else "; ".join(problems[:8]))
    return ok, detail


def _dom_order(page, selectors):
    """v1.3. True if the first element matching each selector exists and each
    follows the one before it in document order. Returns (ok, detail)."""
    result = page.evaluate(
        """
        (sels) => {
          const els = sels.map((s) => document.querySelector(s));
          const missing = sels.filter((s, i) => !els[i]);
          if (missing.length) return {ok: false, detail: "missing: " + missing.join(", ")};
          for (let i = 1; i < els.length; i++) {
            if (!(els[i - 1].compareDocumentPosition(els[i]) & Node.DOCUMENT_POSITION_FOLLOWING)) {
              return {ok: false, detail: sels[i] + " does not follow " + sels[i - 1]};
            }
          }
          return {ok: true, detail: "in order"};
        }
        """,
        list(selectors),
    )
    return bool(result.get("ok")), result.get("detail", "")


def drv_overall_status_wording(page, cfg, line, res, errors):
    """Line 22: the overall figure says where the client stands (DC-25's
    overdue-based denominator, FRAGO 02 section 6).

    v1.3 (FRAGO 03 section 3.2, section 2 of the tracker): the single
    overall-status block is split into named parts, and the wording is now
    fixed by the order, so each part is read and matched: the score sentence
    ("Compliance score: {pct}% ({n} of {m} obligations met)", or "Compliance
    score: nothing has fallen due yet" when nothing has fallen due), "as at
    {date}", the basis sentence, the standing line ("Nothing overdue" or "{k}
    overdue or blocked") and the fixed explainer, in that order. The
    percentage must agree with its own fraction to within rounding."""
    settle_ms = line.get("settle_ms", 400)
    sel = {k: line.get(f"{k}_selector", f"[data-testid='overall-{k}']")
           for k in ("sentence", "asat", "basis", "standing", "explainer")}
    explainer_text = line.get("explainer_text", "")

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        return False, "the client tracker view was not reachable"
    if not _wait_for(page, sel["sentence"], 6000):
        return False, f"{sel['sentence']} not found"

    problems = []

    def read(k):
        loc = page.locator(sel[k])
        return _text(loc.first) if loc.count() > 0 else None

    sentence = read("sentence")
    m = re.fullmatch(r"Compliance score: (\d+)% \((\d+) of (\d+) obligations met\)", sentence or "")
    if m:
        pct, n, total = (int(g) for g in m.groups())
        if total == 0 or n > total:
            problems.append(f"score fraction is not a real one: '{sentence}'")
        elif abs(pct - 100.0 * n / total) >= 1:
            problems.append(f"score {pct}% does not agree with {n} of {total}")
    elif sentence != "Compliance score: nothing has fallen due yet":
        problems.append(f"score sentence reads '{sentence}'")

    asat = read("asat")
    if asat is None or not re.fullmatch(r"as at \S.*", asat):
        problems.append(f"as-at line reads '{asat}'")
    if not read("basis"):
        problems.append(f"{sel['basis']} missing or empty")
    standing = read("standing")
    if standing is None or not re.fullmatch(r"(Nothing overdue|\d+ overdue or blocked)\.?", standing):
        problems.append(f"standing line reads '{standing}'")
    explainer = read("explainer")
    if explainer_text and explainer != explainer_text:
        problems.append(f"explainer reads '{explainer}'")

    order_ok, order_detail = _dom_order(page, [sel[k] for k in
                                                ("sentence", "asat", "basis", "standing", "explainer")])
    if not order_ok:
        problems.append(f"order: {order_detail}")

    ok = not problems
    return ok, (f"'{sentence}'; standing '{standing}'; parts in order" if ok
                else "; ".join(problems[:6]))


# --- v1.3 drivers, the operator's dashboard (FRAGO 03). --------------------

def _load_tracker_const_names(cfg, const):
    """Read the name fields of an `export const X = [ ... ] as const` array
    from tracker.ts at run time (AREAS, PHASES), for the same reason line 19
    reads AREAS there: the gate and the source cannot drift apart."""
    path = cfg["root"] / TASK_COLUMNS_SOURCE
    if not path.is_file():
        return None
    text = path.read_text(encoding="utf-8", errors="replace")
    m = re.search(r"export const " + re.escape(const) + r"\s*=\s*\[(.*?)\]\s*as const", text, re.S)
    if not m:
        return None
    return re.findall(r'name:\s*"([^"]*)"', m.group(1)) or None


def _load_rag_labels(cfg):
    """RAG_LABEL from tracker.ts, as {rag: label}. Empty if not found."""
    path = cfg["root"] / TASK_COLUMNS_SOURCE
    if not path.is_file():
        return {}
    text = path.read_text(encoding="utf-8", errors="replace")
    m = re.search(r"export const RAG_LABEL[^=]*=\s*\{(.*?)\}", text, re.S)
    if not m:
        return {}
    return dict(re.findall(r'(\w+):\s*"([^"]*)"', m.group(1)))


def _wait_tracker_loaded(page, settle_ms):
    """The tracker is loaded when its three sections and its tiles are in
    the DOM. Absence checks are only meaningful after that."""
    ok = all(_wait_for(page, f"[data-testid='{t}']", 6000)
             for t in ("tracker-journey", "tracker-overall", "tracker-upcoming"))
    ok = _wait_for(page, AREA_TILE_SELECTOR, 6000) and ok
    page.wait_for_timeout(settle_ms)
    return ok


def drv_tracker_three_sections(page, cfg, line, res, errors):
    """Line 23 (new at v1.3): the tracker is three sections only (FRAGO 03
    section 3.2). Exactly three h2 on the page, reading Journey, Overall
    compliance status, Upcoming, each inside its own section, in that order;
    none of the removed test ids anywhere on the page; Upcoming lists at most
    eight items or says "Nothing scheduled yet."."""
    settle_ms = line.get("settle_ms", 400)
    sections = line.get("sections", [
        ["tracker-journey", "Journey"],
        ["tracker-overall", "Overall compliance status"],
        ["tracker-upcoming", "Upcoming"],
    ])
    absent = line.get("absent_testids", [])
    max_upcoming = line.get("max_upcoming", 8)
    empty_text = line.get("upcoming_empty_text", "Nothing scheduled yet.")

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        return False, "the client tracker view was not reachable"
    if not _wait_tracker_loaded(page, settle_ms):
        return False, "the tracker's three sections and tiles did not all render"

    problems = []
    h2s = page.locator("h2")
    got = [_text(h2s.nth(i)) for i in range(h2s.count())]
    want = [h for _, h in sections]
    if got != want:
        problems.append(f"h2 headings read {got}, expected {want}")
    for tid, heading in sections:
        inner = page.locator(f"[data-testid='{tid}'] h2")
        if inner.count() != 1 or _text(inner.first) != heading:
            problems.append(f"'{heading}' is not the one h2 inside {tid}")
    order_ok, order_detail = _dom_order(page, [f"[data-testid='{t}']" for t, _ in sections])
    if not order_ok:
        problems.append(f"section order: {order_detail}")

    present = [t for t in absent if page.locator(f"[data-testid='{t}']").count() > 0]
    if present:
        problems.append(f"removed test id(s) still on the tracker: {present}")

    items = page.locator("[data-testid='upcoming-item']").count()
    empty = page.locator("[data-testid='upcoming-empty']")
    if items > max_upcoming:
        problems.append(f"{items} upcoming items, more than {max_upcoming}")
    if items == 0:
        if empty.count() == 0 or _text(empty.first) != empty_text:
            problems.append(f"no upcoming item and no '{empty_text}'")
    elif empty.count() > 0:
        problems.append("upcoming items and the empty state are both shown")

    ok = not problems
    return ok, (f"three sections {want} in order, none of {len(absent)} removed ids, "
                f"{items} upcoming item(s)" if ok else "; ".join(problems[:6]))


def drv_journey_section(page, cfg, line, res, errors):
    """Line 24 (new at v1.3): the Journey section (FRAGO 03 section 3.2). A
    "Current stage: ..." line naming a phase or "not yet set"; a non-empty
    note; five nodes in PHASES order (read from tracker.ts), each with a
    valid data-state, the states running done, then at most one current,
    then future; the current node, if any, is the phase the stage line
    names and says "Current" in text, not by colour alone."""
    settle_ms = line.get("settle_ms", 400)
    phases = _load_tracker_const_names(cfg, "PHASES")
    if not phases:
        return False, f"could not read PHASES from {TASK_COLUMNS_SOURCE}"
    unset = line.get("unset_text", "not yet set")

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        return False, "the client tracker view was not reachable"
    if not _wait_for(page, "[data-testid='journey-node']", 6000):
        return False, "[data-testid='journey-node'] not found"

    problems = []
    cur = page.locator("[data-testid='journey-current']")
    cur_text = _text(cur.first) if cur.count() > 0 else ""
    m = re.fullmatch(r"Current stage: (.+)", cur_text)
    stage = m.group(1).rstrip(".") if m else None
    if stage is None or (stage != unset and stage not in phases):
        problems.append(f"stage line reads '{cur_text}'")
    note = page.locator("[data-testid='journey-note']")
    if note.count() == 0 or not _text(note.first):
        problems.append("journey-note missing or empty")

    nodes = page.locator("[data-testid='journey-node']")
    n = nodes.count()
    if n != len(phases):
        problems.append(f"{n} journey nodes, expected {len(phases)}")
    states = []
    current_idx = []
    for i in range(n):
        node = nodes.nth(i)
        st = node.get_attribute("data-state") or ""
        states.append(st)
        t = _text(node)
        if st not in ("done", "current", "future"):
            problems.append(f"node {i + 1} data-state '{st}'")
        if i < len(phases) and phases[i] not in t:
            problems.append(f"node {i + 1} does not carry '{phases[i]}'")
        has_word = re.search(r"\bCurrent\b", t) is not None
        if st == "current":
            current_idx.append(i)
            if not has_word:
                problems.append(f"current node {i + 1} does not say 'Current' in text")
        elif has_word:
            problems.append(f"node {i + 1} says 'Current' but is {st}")
    if not re.fullmatch(r"(done,)*(current,)?(future,)*", "".join(s + "," for s in states)):
        problems.append(f"states out of order: {states}")
    if len(current_idx) > 1:
        problems.append(f"{len(current_idx)} current nodes")
    if stage and stage != unset and stage in phases:
        if current_idx != [phases.index(stage)]:
            problems.append(f"stage line names '{stage}' but the current node is {current_idx}")
    elif stage == unset and current_idx:
        problems.append("stage is not set but a node is marked current")

    ok = not problems
    return ok, (f"'{cur_text}'; states {states}" if ok else "; ".join(problems[:6]))


def drv_module_tiles_link(page, cfg, line, res, errors):
    """Line 25 (new at v1.3): eight module tiles, each a link to its module
    (FRAGO 03 section 3.2). Exactly eight module-tile inside tracker-overall,
    each an <a> with href /tracker/areas/{1..8} in id order, a valid
    data-rag, the module name, and "{done} of {total} done" (which also
    carries line 17's "never blank" rule, retired with the KPI row). Then
    every tile is clicked and must land on /tracker/areas/N with the module
    name as the page's h1."""
    settle_ms = line.get("settle_ms", 400)
    expected = _load_tracker_areas(cfg)
    if not expected:
        return False, f"could not read AREAS from {TASK_COLUMNS_SOURCE}"
    rags = set(line.get("rag_values", ["green", "amber", "red", "grey"]))

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        return False, "the client tracker view was not reachable"
    if not _wait_for(page, AREA_TILE_SELECTOR, 6000):
        return False, f"{AREA_TILE_SELECTOR} not found"

    problems = []
    tiles = page.locator(f"{AREA_TILE_CONTAINER} {AREA_TILE_SELECTOR}")
    n = tiles.count()
    if n != len(expected) or page.locator(AREA_TILE_SELECTOR).count() != n:
        problems.append(f"{n} tiles inside tracker-overall, "
                        f"{page.locator(AREA_TILE_SELECTOR).count()} on the page, expected {len(expected)}")
    for i in range(min(n, len(expected))):
        tile = tiles.nth(i)
        tag = tile.evaluate("el => el.tagName.toLowerCase()")
        href = tile.get_attribute("href") or ""
        if tag != "a" or not re.search(rf"/tracker/areas/{i + 1}/?$", href):
            problems.append(f"tile {i + 1} is <{tag}> href '{href}'")
        if (tile.get_attribute("data-rag") or "") not in rags:
            problems.append(f"tile {i + 1} data-rag '{tile.get_attribute('data-rag')}'")
        name = tile.locator("[data-testid='module-tile-name']")
        if name.count() == 0 or _text(name.first) != expected[i]:
            problems.append(f"tile {i + 1} name '{_text(name.first) if name.count() else ''}'")
        count = tile.locator("[data-testid='module-tile-count']")
        cm = re.fullmatch(r"(\d+) of (\d+) done", _text(count.first) if count.count() else "")
        if not cm or int(cm.group(1)) > int(cm.group(2)):
            problems.append(f"tile {i + 1} count '{_text(count.first) if count.count() else ''}'")

    from urllib.parse import urlparse
    for i in range(len(expected)):
        if not _enter_area_page(page, cfg, settle_ms, i):
            problems.append(f"tile {i + 1} could not be clicked")
            continue
        path = urlparse(page.url).path.rstrip("/")
        h1s = page.locator("h1")
        h1_texts = [_text(h1s.nth(j)) for j in range(h1s.count())]
        if path != f"/tracker/areas/{i + 1}" or expected[i] not in h1_texts:
            problems.append(f"tile {i + 1} landed on '{path}' with h1 {h1_texts}")

    ok = not problems
    return ok, (f"{n} tiles, each links to its module and lands on the matching h1" if ok
                else "; ".join(problems[:6]))


def drv_module_page_structure(page, cfg, line, res, errors):
    """Line 26 (new at v1.3): every module page follows FRAGO 03 section 3.4,
    in order: h1 module name, introduction, "Relevant documents and
    trackers" (links, or "None filed yet"), "Compliance status: {done} of
    {total} done, {pct}%" with its RAG label in text, the task table, then
    the eight-item module sub-navigation. The status figures must agree with
    the module's own tile on the tracker and the percentage with its own
    fraction."""
    settle_ms = line.get("settle_ms", 400)
    expected = _load_tracker_areas(cfg)
    if not expected:
        return False, f"could not read AREAS from {TASK_COLUMNS_SOURCE}"
    rag_labels = list(_load_rag_labels(cfg).values())
    empty_text = line.get("documents_empty_text", "None filed yet")

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        return False, "the client tracker view was not reachable"
    if not _wait_for(page, "[data-testid='module-tile-count']", 6000):
        return False, "module tile counts not found on the tracker"
    counts = page.locator("[data-testid='module-tile-count']")
    tile_counts = []
    for i in range(counts.count()):
        cm = re.fullmatch(r"(\d+) of (\d+) done", _text(counts.nth(i)))
        tile_counts.append((int(cm.group(1)), int(cm.group(2))) if cm else None)

    problems = []
    for i, name in enumerate(expected):
        label = f"module {i + 1}"
        if not _enter_area_page(page, cfg, settle_ms, i):
            problems.append(f"{label}: not reachable")
            continue
        h1s = page.locator("h1")
        if h1s.count() == 0 or _text(h1s.first) != name:
            problems.append(f"{label}: h1 '{_text(h1s.first) if h1s.count() else ''}'")
        intro = page.locator("[data-testid='module-intro']")
        if intro.count() == 0 or not _text(intro.first):
            problems.append(f"{label}: module-intro missing or empty")

        docs = page.locator("[data-testid='module-documents']")
        if docs.count() == 0:
            problems.append(f"{label}: module-documents missing")
        else:
            links = docs.first.locator("[data-testid='module-doc']")
            empty = docs.first.locator("[data-testid='module-documents-empty']")
            if links.count() == 0:
                if empty.count() == 0 or _text(empty.first).rstrip(".") != empty_text:
                    problems.append(f"{label}: no document and no '{empty_text}'")
            else:
                if empty.count() > 0:
                    problems.append(f"{label}: documents and the empty state both shown")
                # A policy opens in the policy panel, as it does on Compliance
                # Documents, so it is a button; every other item is a link. Fix
                # pass 1: the first cut demanded an href of both.
                for j in range(links.count()):
                    el = links.nth(j)
                    tag = el.evaluate("e => e.tagName.toLowerCase()")
                    if tag == "a" and not el.get_attribute("href"):
                        problems.append(f"{label}: module-doc {j + 1} is a link with no href")
                    elif tag not in ("a", "button"):
                        problems.append(f"{label}: module-doc {j + 1} opens nothing")

        prog = page.locator("[data-testid='module-progress']")
        ptext = _text(prog.first) if prog.count() > 0 else ""
        pm = re.search(r"Compliance status: (\d+) of (\d+) done, (\d+)%", ptext)
        if not pm:
            problems.append(f"{label}: progress reads '{ptext[:80]}'")
        else:
            done, total, pct = (int(g) for g in pm.groups())
            if done > total or (total and abs(pct - 100.0 * done / total) >= 1):
                problems.append(f"{label}: '{pm.group(0)}' does not add up")
            if i < len(tile_counts) and tile_counts[i] and tile_counts[i] != (done, total):
                problems.append(f"{label}: page says {done} of {total}, tile says "
                                f"{tile_counts[i][0]} of {tile_counts[i][1]}")
            if rag_labels and not any(r in ptext for r in rag_labels):
                problems.append(f"{label}: no RAG label in text beside the status")

        nav_items = page.locator("[data-testid='module-nav'] [data-testid='module-nav-item']")
        if nav_items.count() != len(expected):
            problems.append(f"{label}: {nav_items.count()} module-nav items")
        else:
            for j in range(nav_items.count()):
                if not nav_items.nth(j).get_attribute("href"):
                    problems.append(f"{label}: module-nav item {j + 1} is not a link")
                    break

        table = ("[data-testid='task-table']" if page.locator("[data-testid='task-table']").count()
                 else "[data-testid='task-cards']")
        order_ok, order_detail = _dom_order(page, [
            "h1", "[data-testid='module-intro']", "[data-testid='module-documents']",
            "[data-testid='module-progress']", table, "[data-testid='module-nav']",
        ])
        if not order_ok:
            problems.append(f"{label}: order: {order_detail}")

    ok = not problems
    return ok, (f"{len(expected)} module pages carry the order's structure, in order" if ok
                else "; ".join(problems[:6]))


def drv_statement_record_link(page, cfg, line, res, errors):
    """Line 27 (new at v1.3): the Statement links to its record (FRAGO 03
    section 3.6, T02 A3). statement-record-link has href /value and the
    order's text; the old Record/CFO statement tab strip is gone; following
    the link lands on /value with the Record table rendered."""
    settle_ms = line.get("settle_ms", 400)
    link_sel = line.get("link_selector", "[data-testid='statement-record-link']")
    link_text = line.get("link_text", "The record behind this statement")
    href_want = line.get("href", "/value")

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, "statement", None, settle_ms, cfg, "client"):
        return False, "the client statement view was not reachable"
    if not _wait_for(page, link_sel, 6000):
        return False, f"{link_sel} not found"

    problems = []
    link = page.locator(link_sel).first
    href = link.get_attribute("href") or ""
    from urllib.parse import urlparse
    if urlparse(href).path.rstrip("/") != href_want:
        problems.append(f"href '{href}'")
    if _text(link) != link_text:
        problems.append(f"link text '{_text(link)}'")
    if page.locator("[role='tablist']").count() > 0:
        problems.append("a tab strip is still on the Statement page")

    try:
        link.click(timeout=6000)
        page.wait_for_timeout(settle_ms)
    except Exception as exc:
        problems.append(f"link could not be followed: {type(exc).__name__}")
    else:
        path = urlparse(page.url).path.rstrip("/")
        if path != href_want:
            problems.append(f"link landed on '{path}'")
        elif not _wait_for(page, "[data-testid='record-table']", 6000):
            problems.append("the Record table did not render behind the link")

    ok = not problems
    return ok, (f"'{link_text}' links to {href_want}, the Record renders there, no tab strip" if ok
                else "; ".join(problems))


def drv_quick_questions(page, cfg, line, res, errors):
    """Line 28 (new at v1.3): Quick questions (FRAGO 03 section 3.7). The
    guide view's h1 reads "Quick questions" and its first line is the order's
    plain statement of what the page does, which must stay true without an
    API key; the gate checks the words, not the answering."""
    settle_ms = line.get("settle_ms", 400)
    title = line.get("title", "Quick questions")
    intro_text = line.get("intro_text", "")

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, "guide", None, settle_ms, cfg, "client"):
        return False, "the client guide view was not reachable"
    if not _wait_for(page, "[data-testid='quick-questions-intro']", 6000):
        return False, "[data-testid='quick-questions-intro'] not found"

    problems = []
    h1s = page.locator("h1")
    h1_texts = [_text(h1s.nth(i)) for i in range(h1s.count())]
    if h1_texts != [title]:
        problems.append(f"h1 reads {h1_texts}")
    intro = _text(page.locator("[data-testid='quick-questions-intro']").first)
    if intro != intro_text:
        problems.append(f"intro reads '{intro}'")
    ok = not problems
    return ok, (f"h1 '{title}', intro matches" if ok else "; ".join(problems))


def _client_visible_words(page):
    """Every word the client can read on the page: text nodes outside
    script, style and noscript, plus title, aria-label and alt attributes and
    the document title. Hidden-by-CSS text is included on purpose; it is in
    the client's page all the same."""
    return page.evaluate(
        """
        () => {
          const parts = [document.title];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode())) {
            const p = node.parentElement;
            if (p && ["SCRIPT", "STYLE", "NOSCRIPT"].includes(p.tagName)) continue;
            parts.push(node.textContent);
          }
          for (const el of document.querySelectorAll("[title], [aria-label], [alt]")) {
            for (const a of ["title", "aria-label", "alt"]) {
              const v = el.getAttribute(a);
              if (v) parts.push(v);
            }
          }
          return parts.join(" ").replace(/\\s+/g, " ");
        }
        """
    )


def drv_old_module_names_absent(page, cfg, line, res, errors):
    """Line 29 (new at v1.3): the three retired module names appear nowhere
    on the client side (FRAGO 03 sections 3.3 and 3.9). Walks every client
    nav view, the Value page behind the Statement's link and all eight module
    pages, and matches OLD_AREA_NAME_PATTERNS (case-sensitive; see the
    comment there for the "Data retention" rule and the policy title it is
    shaped around)."""
    settle_ms = line.get("settle_ms", 400)
    views = _client_surface_views(line)
    problems = []

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    for v in views:
        if not _enter_any(page, cfg, v, None, settle_ms, "client"):
            problems.append(f"{v}: view not reachable")
            continue
        page.wait_for_timeout(settle_ms)
        words = _client_visible_words(page)
        for label, pattern in OLD_AREA_NAME_PATTERNS:
            if pattern.search(words):
                problems.append(f"{v}: '{label}'")

    ok = not problems
    return ok, (f"no retired module name across {len(views)} client views" if ok
                else "; ".join(problems[:8]))


def drv_admin_value_page(page, cfg, line, res, errors):
    """Line 31 (new at v1.3): Value on the operator's side (FRAGO 03 sections
    3.6 and 3.8). The admin nav item value-admin opens the Record page (its
    Record table renders) with value-settings-link to /admin/settings; the
    Settings page carries the "Journey and module introductions" section
    with a journey-phase select that offers "derive from tasks"."""
    settle_ms = line.get("settle_ms", 400)
    section_heading = line.get("settings_section_heading", "Journey and module introductions")
    derive_text = line.get("derive_option_text", "derive from tasks")

    if not _ensure_role(page, cfg, "admin", cfg["_target"]):
        return False, "could not sign in as the operator account"
    if not _enter_view(page, "value-admin", None, settle_ms, cfg, "admin"):
        return False, "the admin value-admin view was not reachable"

    problems = []
    if not _wait_for(page, "[data-testid='record-table']", 6000):
        problems.append("the Record table did not render under Value")
    link = page.locator("[data-testid='value-settings-link']")
    if link.count() == 0:
        problems.append("value-settings-link not found")
    else:
        from urllib.parse import urlparse
        href = link.first.get_attribute("href") or ""
        if urlparse(href).path.rstrip("/") != "/admin/settings":
            problems.append(f"value-settings-link href '{href}'")

    if not _enter_view(page, "settings", None, settle_ms, cfg, "admin"):
        problems.append("settings view not reachable")
    else:
        heads = page.locator("h1, h2, h3, h4")
        _wait_for(page, "h2, h3", 6000)
        texts = [_text(heads.nth(i)) for i in range(heads.count())]
        if section_heading not in texts:
            problems.append(f"'{section_heading}' heading not on Settings")
        has_derive = page.evaluate(
            """(want) => Array.from(document.querySelectorAll("select option"))
                 .some((o) => o.textContent.toLowerCase().includes(want.toLowerCase()))""",
            derive_text,
        )
        if not has_derive:
            problems.append(f"no select offers '{derive_text}'")

    ok = not problems
    return ok, ("Value opens the Record with a Settings link; Settings carries the journey section"
                if ok else "; ".join(problems))


# --- v1.4 (FRAGO 04): tile contrast and "View as client". -----------------
#
# Lines 32 to 38. The contrast and banner lines drive the browser. The
# response-identity, write-refusal, header, toggle and audit lines are API
# level: they sign in over HTTP with a separate cookie jar per seat, so the
# client seat and the operator seat never share a session. They run against
# the live store, so none of them may leave a lasting change: nothing is
# confirmed, posted or raised as the client, write probes carry an empty body
# so a middleware fault would meet validation rather than create a record,
# and the one setting the toggle line changes is put back in a finally block
# and read again to prove it.

PREVIEW_HEADER = "X-Assure-Preview"
PREVIEW_READ_ONLY = "Read only in client view"
PREVIEW_STORAGE_KEY = "assure.clientView"

# The client GETs the gate already drives (FRAGO 04 section 3.3). The chat
# thread is called as the client first everywhere, because the client's own
# first visit is what creates the thread.
PREVIEW_IDENTITY_PATHS = (
    ["/tracker/home"]
    + [f"/tracker/areas/{n}" for n in range(1, 9)]
    + ["/tracker/documents", "/tracker/jobs", "/clocks", "/value/record",
       "/value/statement", "/chat/thread", "/policies"]
)


class _ApiSeat:
    """One signed-in seat over HTTP, with its own cookie jar."""

    def __init__(self, cfg, role):
        import http.cookiejar
        import urllib.request
        self.base = cfg["_target"].rstrip("/") + "/api"
        self.jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar))
        self.user = None
        email, password = _credentials(cfg, role)
        status, body = self.call("POST", "/auth/login", {"email": email, "password": password})
        if status != 200 or not isinstance(body, dict) or not body.get("user"):
            raise RuntimeError(f"{role} API sign-in returned {status}")
        self.user = body["user"]

    def call(self, method, path, body=None, preview=None):
        import urllib.error
        import urllib.request
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(self.base + path, data=data, method=method)
        req.add_header("Accept", "application/json")
        if data is not None:
            req.add_header("Content-Type", "application/json")
        if preview is not None:
            req.add_header(PREVIEW_HEADER, f"client:{preview}")
        try:
            with self.opener.open(req, timeout=30) as resp:
                status, raw = resp.status, resp.read()
        except urllib.error.HTTPError as exc:
            status, raw = exc.code, exc.read()
        try:
            return status, json.loads(raw.decode("utf-8") or "null")
        except ValueError:
            return status, {"_raw": raw[:200].decode("utf-8", "replace")}


def _preview_org_id(operator):
    """The first organisation in the operator's account list."""
    status, body = operator.call("GET", "/admin/accounts")
    accounts = (body or {}).get("accounts") or [] if status == 200 else []
    if not accounts:
        raise RuntimeError(f"GET /api/admin/accounts returned {status} with no accounts")
    return accounts[0]["id"]


def _json_diff_paths(a, b, path=""):
    """Every path at which two JSON values differ. Dicts and equal-length
    lists are walked; anything else that differs is reported at its path."""
    if isinstance(a, dict) and isinstance(b, dict):
        out = []
        for k in sorted(set(a) | set(b), key=str):
            p = f"{path}.{k}" if path else str(k)
            if k not in a or k not in b:
                out.append(p)
            else:
                out.extend(_json_diff_paths(a[k], b[k], p))
        return out
    if isinstance(a, list) and isinstance(b, list) and len(a) == len(b):
        out = []
        for i, (x, y) in enumerate(zip(a, b)):
            out.extend(_json_diff_paths(x, y, f"{path}[{i}]"))
        return out
    return [] if a == b else [path or "(root)"]


def _under(path, prefixes):
    return any(path == p or path.startswith(p + ".") or path.startswith(p + "[") for p in prefixes)


def _identity_against_client(client, other, paths, other_preview):
    """For each path: two consecutive client-seat calls as a control, then
    `other` (with `other_preview` as its marker, or none). Returns
    (problems, volatile) where volatile maps path -> the fields that moved
    between the two control calls and were therefore excluded. A top-level
    "preview": true is allowed in the other response and nothing else."""
    problems, volatile = [], {}
    for p in paths:
        s1, c1 = client.call("GET", p)
        s2, c2 = client.call("GET", p)
        if s1 != 200 or s2 != 200:
            problems.append(f"{p}: client seat returned {s1}/{s2}")
            continue
        moving = _json_diff_paths(c1, c2)
        if moving:
            volatile[p] = moving
        so, o = other.call("GET", p, preview=other_preview)
        if so != 200:
            problems.append(f"{p}: returned {so}")
            continue
        if isinstance(o, dict) and o.get("preview") is True:
            o = {k: v for k, v in o.items() if k != "preview"}
        diffs = [d for d in _json_diff_paths(c2, o) if not _under(d, moving)]
        if diffs:
            problems.append(f"{p}: differs at {', '.join(diffs[:4])}")
    return problems, volatile


def _volatile_note(volatile):
    if not volatile:
        return "no volatile fields excluded"
    return "volatile fields excluded: " + "; ".join(
        f"{p} {', '.join(v)}" for p, v in volatile.items())


def _api_only_once(line, res):
    """API-level lines do not depend on the viewport; they run at the first
    resolution they name and report 'not repeated' at the others."""
    return res["name"] == line.get("applies_to", [res["name"]])[0]


_CONTRAST_JS = r"""
(args) => {
  const probeFor = args.probe;
  const canvas = document.createElement('canvas');
  canvas.width = 1; canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  // Any CSS colour (rgb, oklch, color-mix) to sRGB, text composited over
  // the fill so a translucent colour is measured as it is seen.
  const px = (fill, over) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = fill; ctx.fillRect(0, 0, 1, 1);
    if (over) { ctx.fillStyle = over; ctx.fillRect(0, 0, 1, 1); }
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  const lum = (rgb) => {
    const c = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const alphaOf = (col) => { const m = /rgba?\(([^)]+)\)/.exec(col); if (!m) return 1; const p = m[1].split(/[ ,\/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1; };
  const measure = (tile) => {
    const tcs = getComputedStyle(tile);
    const bgCol = tcs.backgroundColor;
    const out = { rag: tile.getAttribute('data-rag'), bg: bgCol, spans: [], shadows: [], transparent: alphaOf(bgCol) === 0 };
    const bg = px(bgCol);
    if (tcs.textShadow && tcs.textShadow !== 'none') out.shadows.push('tile: ' + tcs.textShadow);
    const spans = Array.from(tile.querySelectorAll('span')).filter((s) => (s.textContent || '').trim());
    for (const s of spans) {
      const cs = getComputedStyle(s);
      const fg = px(bgCol, cs.color);
      out.spans.push({ id: s.getAttribute('data-testid') || 'rag-label', color: cs.color, ratio: Math.round(ratio(fg, bg) * 100) / 100 });
      if (cs.textShadow && cs.textShadow !== 'none') out.shadows.push((s.getAttribute('data-testid') || 'rag-label') + ': ' + cs.textShadow);
    }
    return out;
  };
  const tiles = Array.from(document.querySelectorAll("[data-testid='module-tile']"));
  if (!probeFor) return tiles.map(measure);
  const FILL = { green: 'bg-status-green', amber: 'bg-status-amber', red: 'bg-status-red', grey: 'bg-client-muted' };
  const TEXT = { green: 'text-client-text', amber: 'text-client-text', red: 'text-white', grey: 'text-white' };
  const src = tiles[0];
  if (!src) return [];
  const clone = src.cloneNode(true);
  for (const c of Array.from(clone.classList)) {
    if (/^bg-status-/.test(c) || c === 'bg-client-muted' || /^text-/.test(c)) clone.classList.remove(c);
  }
  clone.classList.add(FILL[probeFor], TEXT[probeFor]);
  clone.setAttribute('data-rag', probeFor);
  clone.setAttribute('data-testid', 'module-tile-probe');
  clone.removeAttribute('href');
  src.parentElement.appendChild(clone);
  try {
    const m = measure(clone);
    m.probe = true;
    return [m];
  } finally {
    clone.remove();
  }
}
"""


def drv_tile_contrast(page, cfg, line, res, errors):
    """Line 32 (new at v1.4, FRAGO 04 section 3.1): every tile's three text
    spans measure at least 4.5:1 against the tile's own fill, by WCAG
    relative luminance, with no text shadow. States absent from the live
    data are measured on a probe tile cloned from a real one, given that
    state's fill and text classes, measured and removed."""
    settle_ms = line.get("settle_ms", 400)
    minimum = float(line.get("min_ratio", 4.5))
    states = line.get("rag_values", ["green", "amber", "red", "grey"])
    if _area_tile_count(page, cfg, settle_ms) == 0:
        return False, "the client tracker's module tiles were not reachable"
    measured = page.evaluate(_CONTRAST_JS, {"probe": None})
    present = sorted({m["rag"] for m in measured}, key=lambda r: states.index(r) if r in states else 9)
    for state in states:
        if state not in present:
            measured.extend(page.evaluate(_CONTRAST_JS, {"probe": state}))
    problems, worst = [], {}
    for m in measured:
        label = f"{m['rag']}{' (probe)' if m.get('probe') else ''}"
        if m.get("transparent"):
            problems.append(f"{label}: tile background is transparent")
        if len(m["spans"]) < 3:
            problems.append(f"{label}: {len(m['spans'])} text spans, expected 3")
        for s in m["spans"]:
            worst[label] = min(worst.get(label, 99.0), s["ratio"])
            if s["ratio"] < minimum:
                problems.append(f"{label} {s['id']}: {s['ratio']}:1")
        problems.extend(f"{label} text-shadow {sh}" for sh in m["shadows"])
    missing = [s for s in states if not any(m["rag"] == s for m in measured)]
    if missing:
        problems.append(f"no measurement for {', '.join(missing)}")
    summary = (f"present {', '.join(present) or 'none'}; lowest ratio per state: "
               + ", ".join(f"{k} {v}" for k, v in worst.items()))
    return (not problems), (summary if not problems else "; ".join(problems[:8]) + f" ({summary})")


def drv_preview_response_identity(page, cfg, line, res, errors):
    """Line 33 (new at v1.4, FRAGO 04 section 3.3): with the operator seat in
    client view, every client GET is identical to the client seat's, allowing
    only a top-level "preview": true."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    client = _ApiSeat(cfg, "client")
    operator = _ApiSeat(cfg, "admin")
    org = _preview_org_id(operator)
    problems, volatile = _identity_against_client(client, operator, PREVIEW_IDENTITY_PATHS, org)
    note = _volatile_note(volatile)
    ok = not problems
    return ok, (f"{len(PREVIEW_IDENTITY_PATHS)} GETs identical; {note}" if ok
                else "; ".join(problems[:6]) + f" ({note})")


def _client_task_state(client, task_id):
    status, body = client.call("GET", "/tracker/jobs")
    if status != 200:
        return None
    for g in (body or {}).get("groups", []):
        for t in g.get("tasks", []):
            if str(t.get("id")) == str(task_id):
                return {"status": t.get("status"), "clientConfirmedAt": t.get("clientConfirmedAt")}
    return None


def drv_preview_writes_refused(page, cfg, line, res, errors):
    """Line 34 (new at v1.4): in client view the confirm request, a Guide
    message and a raised request are refused 403 "Read only in client view",
    and the task is unchanged; an operator session without the marker is
    refused on a client route. Write probes carry an empty body."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    client = _ApiSeat(cfg, "client")
    operator = _ApiSeat(cfg, "admin")
    org = _preview_org_id(operator)
    problems = []

    status, jobs = client.call("GET", "/tracker/jobs")
    tasks = [t for g in (jobs or {}).get("groups", []) for t in g.get("tasks", [])] if status == 200 else []
    open_for_you = [t for t in tasks if t.get("forYou") and not t.get("clientConfirmedAt")
                    and t.get("status") not in ("done", "completed", "not_applicable")]
    pick = (open_for_you or [t for t in tasks if t.get("forYou")] or tasks or [None])[0]
    if pick is None:
        return False, f"no task found on the client's Job management (GET /tracker/jobs {status})"
    task_id = pick["id"]
    before = _client_task_state(client, task_id)

    probes = [
        ("POST", f"/tracker/tasks/{task_id}/confirm", "confirm"),
        ("POST", "/chat/messages", "Guide message"),
        ("POST", "/requests", "raise request"),
    ]
    for method, path, label in probes:
        s, body = operator.call(method, path, {}, preview=org)
        err = (body or {}).get("error") if isinstance(body, dict) else None
        if s != 403 or err != PREVIEW_READ_ONLY:
            problems.append(f"{label}: {s} '{err}'")

    after = _client_task_state(client, task_id)
    if before is None or after != before:
        problems.append(f"task {task_id} changed: {before} -> {after}")

    s, _ = operator.call("GET", "/tracker/home")
    if s != 403:
        problems.append(f"operator without the marker on /tracker/home: {s}")

    ok = not problems
    which = "an open for-you task" if open_for_you else "a task (no open for-you row)"
    return ok, (f"confirm on {which}, Guide message and request refused 403 '{PREVIEW_READ_ONLY}'; "
                f"task state unchanged; unmarked operator refused 403" if ok else "; ".join(problems))


def drv_preview_header_ignored_for_client(page, cfg, line, res, errors):
    """Line 35 (new at v1.4): the client seat carrying the preview marker,
    for its own organisation and for a bogus one, gets exactly what it gets
    without it. GET only; the gate never writes as the client."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    client = _ApiSeat(cfg, "client")
    operator = _ApiSeat(cfg, "admin")
    org = _preview_org_id(operator)
    bogus = line.get("bogus_org", "gate-no-such-org")
    problems, notes = [], []
    for marker in (org, bogus):
        p, volatile = _identity_against_client(client, client, PREVIEW_IDENTITY_PATHS, marker)
        which = "own org" if marker == org else "bogus org"
        problems.extend(f"{which}: {x}" for x in p)
        notes.append(f"{which}: {_volatile_note(volatile)}")
    ok = not problems
    return ok, ((f"{len(PREVIEW_IDENTITY_PATHS)} GETs unchanged with the marker; " if ok
                 else "; ".join(problems[:6]) + " (") + " | ".join(notes) + ("" if ok else ")"))


def drv_client_view_banner(page, cfg, line, res, errors):
    """Line 36 (new at v1.4): the operator enters client view from the admin
    nav; on the six client pages and module 1 the banner is present, visible
    and inside the viewport; confirm, Ask and Submit request are disabled;
    Return to admin lands in /admin with the banner gone. For the client
    seat the banner is absent on the same pages."""
    from urllib.parse import urlparse
    settle_ms = line.get("settle_ms", 600)
    banner_sel = line.get("banner_selector", "[data-testid='client-view-banner']")
    return_sel = line.get("return_selector", "[data-testid='client-view-return']")
    banner_text = line.get("banner_text", "Viewing as the client's Information Officer. Read only.")
    return_text = line.get("return_text", "Return to admin.")
    views = line.get("views", ["tracker", "documents", "jobs", "request", "statement", "guide"])
    problems = []

    def banner_ok(where):
        if not _wait_for(page, banner_sel, 6000):
            problems.append(f"{where}: banner absent")
            return
        b = page.locator(banner_sel).first
        box = b.bounding_box()
        vh = page.viewport_size["height"]
        if not b.is_visible() or box is None or box["y"] < -1 or box["y"] + box["height"] > vh + 1:
            problems.append(f"{where}: banner not visible in the viewport ({box})")
        if banner_text not in _text(b):
            problems.append(f"{where}: banner reads '{_text(b)[:80]}'")

    def open_module_1():
        if not _enter_view(page, "tracker", None, settle_ms):
            return False
        if not _wait_for(page, AREA_TILE_SELECTOR, 6000):
            return False
        page.locator(AREA_TILE_SELECTOR).first.click()
        page.wait_for_timeout(settle_ms)
        return _wait_for(page, "[data-testid='module-progress']", 6000)

    try:
        if not _sign_in(page, cfg, "admin", cfg["_target"]):
            return False, "could not sign in as the operator"
        if not _enter_view(page, "client-view", None, settle_ms, cfg, "admin"):
            return False, "admin nav item data-view='client-view' not found"
        if not _wait_for(page, banner_sel, 8000):
            return False, "client view opened without the banner"
        if urlparse(page.url).path.rstrip("/") != "":
            problems.append(f"client view landed on '{urlparse(page.url).path}', expected /")
        ret = page.locator(return_sel)
        if ret.count() == 0 or _text(ret.first) != return_text:
            problems.append(f"return control reads '{_text(ret.first) if ret.count() else ''}'")

        for v in views:
            if not _enter_view(page, v, None, settle_ms):
                problems.append(f"{v}: client nav item missing in client view")
                continue
            banner_ok(v)
            if v == "jobs":
                confirms = page.locator("[data-testid='confirm-task']")
                n = confirms.count()
                enabled = sum(1 for i in range(n) if confirms.nth(i).is_enabled())
                if enabled:
                    problems.append(f"jobs: {enabled} of {n} confirm controls enabled")
                if n and page.locator("[data-testid='preview-read-only']").count() == 0:
                    problems.append("jobs: no preview-read-only note beside confirm")
                if n and page.locator("[data-testid='preview-read-only']").count() and \
                        PREVIEW_READ_ONLY not in _text(page.locator("[data-testid='preview-read-only']").first):
                    problems.append("jobs: preview-read-only note wording")
            if v in ("guide", "request"):
                pattern = r"^\s*Ask\s*$" if v == "guide" else r"^\s*Submit request\s*$"
                btns = page.locator("button").filter(has_text=re.compile(pattern))
                if any(btns.nth(i).is_enabled() for i in range(btns.count())):
                    problems.append(f"{v}: submit control enabled in client view")
        if open_module_1():
            banner_ok("module 1")
        else:
            problems.append("module 1: not reachable in client view")

        if page.locator(return_sel).count():
            page.locator(return_sel).first.click()
            page.wait_for_timeout(settle_ms * 2)
            path = urlparse(page.url).path.rstrip("/")
            if not path.startswith("/admin"):
                problems.append(f"return landed on '{path}'")
            if page.locator(banner_sel).count():
                problems.append("banner still present after return")
        else:
            problems.append("return control absent at the end")

        # The real client seat: no banner anywhere.
        _sign_in(page, cfg, "client", cfg["_target"])
        _wait_for(page, "[data-view='tracker']", 6000)
        for v in views:
            if not _enter_view(page, v, None, settle_ms):
                problems.append(f"client {v}: nav item missing")
                continue
            if page.locator(banner_sel).count():
                problems.append(f"client {v}: banner present for the client seat")
        if open_module_1():
            if page.locator(banner_sel).count():
                problems.append("client module 1: banner present for the client seat")
        else:
            problems.append("client module 1: not reachable")
    finally:
        # Leave the page as later lines expect: the client seat, no preview
        # held in sessionStorage for a later operator sign-in to inherit.
        was_previewing = page.locator(banner_sel).count() > 0
        try:
            page.evaluate(f"() => sessionStorage.removeItem('{PREVIEW_STORAGE_KEY}')")
        except Exception:
            pass
        if was_previewing:
            _sign_in(page, cfg, "client", cfg["_target"])

    ok = not problems
    return ok, (f"banner on {len(views)} client pages and module 1, writes disabled, "
                f"return lands in /admin; absent for the client seat" if ok else "; ".join(problems[:8]))


def drv_preview_ignores_admin_toggle(page, cfg, line, res, errors):
    """Line 37 (new at v1.4): with denominatorMode set to the stricter
    "cycle", client view's overall figure equals the client seat's. The
    original value is read first and restored in a finally block, then read
    again to prove the restore."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    client = _ApiSeat(cfg, "client")
    operator = _ApiSeat(cfg, "admin")
    org = _preview_org_id(operator)
    mode = line.get("strict_mode", "cycle")
    s, body = operator.call("GET", f"/admin/settings?org={org}")
    if s != 200 or "denominatorMode" not in ((body or {}).get("settings") or {}):
        return False, f"could not read denominatorMode (GET settings {s})"
    original = body["settings"]["denominatorMode"]
    problems = []
    restored = None
    try:
        s, _ = operator.call("PUT", f"/admin/settings?org={org}", {"denominatorMode": mode})
        if s != 200:
            problems.append(f"PUT denominatorMode={mode} returned {s}")
        s1, c1 = client.call("GET", "/tracker/home")
        s2, c2 = client.call("GET", "/tracker/home")
        sp, pv = operator.call("GET", "/tracker/home", preview=org)
        if s1 != 200 or s2 != 200 or sp != 200:
            problems.append(f"tracker home returned client {s1}/{s2}, preview {sp}")
        else:
            moving = _json_diff_paths((c1 or {}).get("overall"), (c2 or {}).get("overall"), "overall")
            diffs = [d for d in _json_diff_paths(c2.get("overall"), pv.get("overall"), "overall")
                     if not _under(d, moving)]
            if diffs:
                problems.append(f"preview overall differs from the client's at {', '.join(diffs[:4])}")
    finally:
        operator.call("PUT", f"/admin/settings?org={org}", {"denominatorMode": original})
        s, body = operator.call("GET", f"/admin/settings?org={org}")
        restored = ((body or {}).get("settings") or {}).get("denominatorMode") if s == 200 else None
    if restored != original:
        problems.append(f"denominatorMode not restored: was '{original}', now '{restored}'")
    ok = not problems
    return ok, (f"with denominatorMode '{mode}' the preview overall equals the client's; "
                f"restored to '{original}'" if ok else "; ".join(problems))


def drv_client_view_audit(page, cfg, line, res, errors):
    """Line 38 (new at v1.4): a fresh operator session making three preview
    GETs writes exactly one client_view.open entry, naming the operator."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    operator = _ApiSeat(cfg, "admin")
    org = _preview_org_id(operator)
    q = f"/admin/audit?accountId={org}&action=client_view.open"

    def entries():
        s, body = operator.call("GET", q)
        if s != 200:
            raise RuntimeError(f"GET audit returned {s}")
        return [e for e in (body or {}).get("entries", []) if e.get("action") == "client_view.open"]

    before = {e["id"] for e in entries()}
    for p in ("/tracker/home", "/tracker/jobs", "/tracker/documents"):
        s, _ = operator.call("GET", p, preview=org)
        if s != 200:
            return False, f"preview GET {p} returned {s}"
    new = [e for e in entries() if e["id"] not in before]
    problems = []
    if len(new) != 1:
        problems.append(f"{len(new)} new client_view.open entries, expected 1")
    if new and str(new[0].get("actorId")) != str(operator.user.get("id")):
        problems.append(f"entry actor '{new[0].get('actorId')}', expected the operator")
    ok = not problems
    return ok, ("three preview GETs wrote one client_view.open entry, actor the operator" if ok
                else "; ".join(problems))


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
    # Retired at v1.3 with line 17 (KpiRow removed by FRAGO 03 section 3.2);
    # kept registered so an older definition of done still resolves.
    "kpi_tiles_never_blank": drv_kpi_tiles_never_blank,
    # v1.2, Lurong's structure.
    "client_nav_order": drv_client_nav_order,
    "module_titles_match_areas": drv_module_titles_match_areas,
    "documents_read_only": drv_documents_read_only,
    "jobs_page": drv_jobs_page,
    "overall_status_wording": drv_overall_status_wording,
    # v1.3, the operator's dashboard.
    "tracker_three_sections": drv_tracker_three_sections,
    "journey_section": drv_journey_section,
    "module_tiles_link": drv_module_tiles_link,
    "module_page_structure": drv_module_page_structure,
    "statement_record_link": drv_statement_record_link,
    "quick_questions": drv_quick_questions,
    "old_module_names_absent": drv_old_module_names_absent,
    "admin_value_page": drv_admin_value_page,
    # v1.4, tile contrast and "View as client" (FRAGO 04).
    "tile_contrast": drv_tile_contrast,
    "preview_response_identity": drv_preview_response_identity,
    "preview_writes_refused": drv_preview_writes_refused,
    "preview_header_ignored_for_client": drv_preview_header_ignored_for_client,
    "client_view_banner": drv_client_view_banner,
    "preview_ignores_admin_toggle": drv_preview_ignores_admin_toggle,
    "client_view_audit": drv_client_view_audit,
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

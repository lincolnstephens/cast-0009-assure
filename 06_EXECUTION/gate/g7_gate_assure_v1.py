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

v1.5 (FRAGO 05, named accounts, organisations and seed). Lines 39 to 49 drive
user management, the first-sign-in password change, organisations, the
organisation switcher, client isolation, the seed endpoint and the audit
hygiene of sign-in; lines 50 and 51 are static (restricted terms against the
built bundle, and no password logged or audited in server source). The gate
runs against the live store, where nothing can be deleted, so every
organisation and user it creates is find-or-create under fixed identities
(GATE_ORG_NAME, GATE_CLIENT_EMAIL, GATE_MANAGER_EMAIL), nothing is ever created
in the demo organisation, and every gate user is disabled again in a finally
block, per line and once more at the end of the driven section. The v1.4
lines that used "the first organisation in the account list" now use the demo
client seat's own organisation, since the list holds more than one.

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
    "iteration": "v1.9",

    # What is gated. Either a deployed URL or a path to a local artefact.
    # Passed on the command line; these are the defaults.
    "target": "https://assure.tessera-monitor.com",
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


# v1.5. The restricted terms, read at run time by the same function
# check_restricted.py uses (imported, not copied), so the gate and the
# pre-commit check agree on what a term is. Email addresses in the restricted
# file are added, since FRAGO 05 section 3.7 speaks of "no name or address".
# The terms are never printed, returned in a detail or written to the report.
_RESTRICTED_CACHE = {}


def _restricted_terms_runtime(cfg):
    if "terms" in _RESTRICTED_CACHE:
        return _RESTRICTED_CACHE["terms"]
    import importlib.util
    terms = []
    script = cfg["root"] / CHECK_RESTRICTED_SCRIPT
    try:
        spec = importlib.util.spec_from_file_location("_gate_check_restricted", str(script))
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        terms = list(mod.restricted_terms(str(cfg["root"])))
    except Exception:
        terms = list(load_restricted_names(cfg) or [])
    path = cfg["root"] / cfg["restricted_names_file"]
    if not os.environ.get(cfg["restricted_names_env"], "").strip() and path.is_file():
        text = path.read_text(encoding="utf-8", errors="replace")
        terms.extend(re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text))
    terms = sorted({t for t in terms if t.strip()})
    _RESTRICTED_CACHE["terms"] = terms or None
    return _RESTRICTED_CACHE["terms"]


def _restricted_hit_count(text, terms):
    """How many distinct terms occur in text, case-insensitive. Never which."""
    low = text.lower()
    return sum(1 for t in terms if t.lower() in low)


BUNDLE_PATHS = (
    "06_EXECUTION/build/maximus-src/apps/web/dist",
    "06_EXECUTION/build/maximus-src/netlify/functions/_api-bundle.mjs",
)


def sdrv_restricted_in_bundle(cfg, line):
    """Line 50 (new at v1.5): the restricted terms against the built web
    bundle and the built function bundle. Hits are reported as file and
    line number, redacted."""
    terms = _restricted_terms_runtime(cfg)
    if not terms:
        return False, "the restricted terms could not be read; an absent list is not a pass"
    files, missing = [], []
    for rel in line.get("paths", BUNDLE_PATHS):
        p = cfg["root"] / rel
        if p.is_file():
            files.append(p)
        elif p.is_dir():
            files.extend(f for f in p.rglob("*") if f.is_file())
        else:
            missing.append(rel)
    if missing:
        return False, "bundle not found: " + ", ".join(missing)
    hits = []
    for f in files:
        try:
            text = f.read_bytes().decode("utf-8", errors="replace")
        except OSError:
            continue
        if not _restricted_hit_count(text, terms):
            continue
        rel = str(f.relative_to(cfg["root"])).replace("\\", "/")
        for n, ln in enumerate(text.splitlines(), start=1):
            if _restricted_hit_count(ln, terms):
                hits.append(f"{rel}:{n}: [REDACTED]")
    if hits:
        return False, f"{len(hits)} hit(s): " + "; ".join(hits[:5])
    return True, f"{len(terms)} restricted terms checked against {len(files)} bundle files, 0 hits"


# v1.5. No password reaches a log or the audit log (FRAGO 05 sections 4 and
# 5). String literal text is blanked first (template-literal ${...}
# expressions are kept), so prose such as the action name "user.reset_password"
# does not trip it; what is flagged is a password-bearing identifier among the
# arguments of a console.* or writeAudit call.
PASSWORD_IDENTIFIERS = re.compile(
    r"\b(password|oneTimePassword|newPassword|currentPassword|passwordHash)\b")
LOG_CALL_START = re.compile(r"\bconsole\.(log|info|warn|error|debug|trace)\s*\(|\bwriteAudit\s*\(")
SERVER_SRC = "06_EXECUTION/build/maximus-src/packages/server/src"


def _blank_string_literals(src):
    """Replace the content of '...', "..." and `...` literals with spaces,
    keeping ${...} expressions inside template literals, and keeping the
    length so offsets still map to line numbers."""
    out, i, n = [], 0, len(src)
    stack = []  # "`" while inside a template literal's text, "{" inside ${ }
    depth = []
    while i < n:
        ch = src[i]
        in_tpl = stack and stack[-1] == "`"
        if in_tpl:
            if ch == "\\" and i + 1 < n:
                out.append("  "); i += 2; continue
            if ch == "`":
                stack.pop(); out.append(ch); i += 1; continue
            if ch == "$" and i + 1 < n and src[i + 1] == "{":
                stack.append("{"); depth.append(0); out.append("${"); i += 2; continue
            out.append("\n" if ch == "\n" else " "); i += 1; continue
        if ch in "'\"":
            j = i + 1
            while j < n and src[j] != ch and src[j] != "\n":
                j += 2 if src[j] == "\\" else 1
            out.append(ch + " " * max(0, min(j, n) - i - 1) + (src[j] if j < n else ""))
            i = j + 1; continue
        if ch == "`":
            stack.append("`"); out.append(ch); i += 1; continue
        if stack and stack[-1] == "{":
            if ch == "{":
                depth[-1] += 1
            elif ch == "}":
                if depth[-1] == 0:
                    stack.pop(); depth.pop(); out.append(ch); i += 1; continue
                depth[-1] -= 1
        if ch == "/" and i + 1 < n and src[i + 1] == "/":
            j = src.find("\n", i)
            j = n if j == -1 else j
            out.append(" " * (j - i)); i = j; continue
        out.append(ch); i += 1
    return "".join(out)


def sdrv_no_password_logging(cfg, line):
    """Line 51 (new at v1.5)."""
    base = cfg["root"] / line.get("path", SERVER_SRC)
    if not base.is_dir():
        return False, f"{line.get('path', SERVER_SRC)} not found"
    hits, calls = [], 0
    for f in base.rglob("*"):
        if not f.is_file() or f.suffix not in (".ts", ".mts", ".js", ".mjs", ".tsx"):
            continue
        raw = f.read_text(encoding="utf-8", errors="replace")
        text = _blank_string_literals(raw)
        for m in LOG_CALL_START.finditer(text):
            calls += 1
            k, d = m.end(), 1
            while k < len(text) and d:
                d += {"(": 1, ")": -1}.get(text[k], 0)
                k += 1
            args = text[m.end():k]
            if PASSWORD_IDENTIFIERS.search(args):
                rel = str(f.relative_to(cfg["root"])).replace("\\", "/")
                hits.append(f"{rel}:{raw.count(chr(10), 0, m.start()) + 1}")
    if hits:
        return False, "password-bearing argument in a log or audit call at " + "; ".join(hits[:8])
    return True, f"{calls} console.* and writeAudit calls read, none passes a password"


STATIC_DRIVERS = {
    "check_restricted_passes": sdrv_check_restricted_passes,
    "restricted_in_bundle": sdrv_restricted_in_bundle,
    "no_password_logging": sdrv_no_password_logging,
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

    try:
        _run_driven_browser(cfg, target, dod, sync_playwright)
    finally:
        # v1.5: whatever happened above, no gate user is left able to sign in.
        _final_gate_cleanup(cfg)
    return "RAN"


def _run_driven_browser(cfg, target, dod, sync_playwright):
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
    # v1.8: the demo client seat (demo@demo.local) is disabled by Sunray and
    # stays so. Unless an account is named in the environment, the client
    # side is driven as the gate's own seat on the demo organisation, enabled
    # for the run and disabled again at its end (_final_gate_cleanup).
    if not os.environ.get(s["email_env"]):
        return _gate_demo_client(cfg)
    return (
        os.environ.get(s["email_env"], s["email_default"]),
        os.environ.get(s["password_env"], s["password_default"]),
    )


def _sign_in(page, cfg, role, target):
    """Sign out if signed in, then sign in as the account for `role`."""
    email, password = _credentials(cfg, role)
    ok = _sign_in_with(page, target, email, password)
    if ok and role == "admin":
        _pin_demo_org(page, cfg)
    return ok


def _pin_demo_org(page, cfg):
    """v1.6 fix. The switcher defaults to the first organisation by name, and
    since 29 Sep that is the client's own. Every admin page, Settings above
    all, acts on the switcher's choice, so an operator sign-in in the gate
    pins it to the demo before any line toggles anything: the gate must never
    change a real organisation. Lines 44 and 45 move it on purpose and pick
    their own organisation. Fails loudly if the demo cannot be selected."""
    demo = _preview_org_id(_ApiSeat(cfg, "admin"))
    sw = page.locator("[data-testid='org-switcher']")
    if not _wait_for(page, "[data-testid='org-switcher']", 8000) or sw.count() == 0:
        raise RuntimeError("the organisation switcher is not on the admin page; refusing to go on")
    sw.first.select_option(value=demo)
    page.wait_for_timeout(600)
    if sw.first.input_value() != demo:
        raise RuntimeError("could not pin the admin switcher to the demo organisation")


def _sign_in_with(page, target, email, password):
    """v1.5: the body of _sign_in, for an explicit account (the gate's own
    test users). Behaviour for the two demo seats is unchanged."""
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
    email, password = _credentials(cfg, "client")
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
    # v1.7 (DC-67): prove the switch that moved is the demo's. Gate run 1
    # found the Settings page could act on another organisation while a
    # switch of organisation was loading.
    try:
        _op = _ApiSeat(cfg, "admin")
        _demo = _preview_org_id(_op)
        _st, _body = _op.call("GET", f"/admin/settings?org={_demo}")
        _stored = ((_body or {}).get("settings") or {}).get("showIllustrative")
    except Exception as exc:
        _stored = type(exc).__name__
    sw = page.locator("[data-testid='org-switcher']")
    _shown = sw.first.input_value() if sw.count() else None
    if _stored is not False:
        _wrong = f"the demo's stored switch is {_stored} after switching it off (switcher shows {_shown})"
        _sign_in(page, cfg, "admin", cfg["_target"])
        _ApiSeat(cfg, "admin").call("PUT", f"/admin/settings?org={_preview_org_id(_ApiSeat(cfg, 'admin'))}", {"showIllustrative": True})
        return False, _wrong

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
    diag = ""
    if hit:
        i = text.lower().find(forbidden.lower())
        try:
            st, body = _ApiSeat(cfg, "admin").call("GET", f"/admin/settings?org={_preview_org_id(_ApiSeat(cfg, 'admin'))}")
            stored = ((body or {}).get("settings") or {}).get("showIllustrative")
        except Exception as exc:
            stored = type(exc).__name__
        diag = f" [stored showIllustrative={stored}; url {page.url}; text: ...{' '.join(text[max(0, i - 160):i + 60].split())}...]"

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
    return not hit, f"'{forbidden}' in the client statement with the switch off: {hit}{diag}"


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

    # v1.7 (FRAGO 07 3.1): the client may offer a document through the
    # upload form, and nothing else on the page writes. A file input or an
    # upload control outside that form fails; edit, delete, remove and
    # replace fail anywhere.
    form = "[data-testid='client-upload-form']"
    if page.locator("input[type='file']").count() > page.locator(f"{form} input[type='file']").count():
        problems.append("input[type='file'] present outside the upload form")
    if page.locator("[data-testid='client-upload-form']").count() != 1:
        problems.append("no single client-upload-form")

    controls = page.locator("button, a")
    for i in range(controls.count()):
        try:
            if controls.nth(i).evaluate("e => !!e.closest(\"[data-testid='client-upload-form']\")"):
                continue
            text = controls.nth(i).inner_text().strip()
        except Exception:
            continue
        if text and _FORBIDDEN_DOCUMENT_CONTROL_RE.search(text):
            problems.append(f"forbidden control: '{text}'")

    ok = not problems
    detail = ("three sections present, the upload form the only write, no edit, delete or replace control"
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
    # v1.9 (FRAGO 09 3.3): the separate Blocked badge is gone; a blocked task
    # carries the red mark with the word Blocked.
    blocked_sel = line.get("blocked_selector", "[data-testid='status-mark'][data-word='Blocked']")
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
        # v1.9 (FRAGO 09 3.3): one status mark with its word replaces the RAG label.
        marks = cards.nth(i).locator("[data-testid='status-mark']")
        if marks.count() != 1 or not _text(marks.first.locator("[data-testid='status-word']")):
            problems.append(f"card[{i}] carries no single status mark with its word: '{t[:60]}'")

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
    # v1.6 (FRAGO 06 3.6): the headline is the mean of the module scores, with
    # the modules scoring green as its fraction. It is checked against the
    # module scores the client's own API returns.
    m = re.fullmatch(r"Compliance score: (\d+)% \((\d+) of 8 modules green\)", sentence or "")
    try:
        s_home, home = _ApiSeat(cfg, "client").call("GET", "/tracker/home")
    except RuntimeError as exc:
        s_home, home = None, None
        problems.append(str(exc))
    areas = (home or {}).get("areas") or []
    scored = [a["score"]["pct"] for a in areas if (a.get("score") or {}).get("pct") is not None]
    greens = sum(1 for a in areas if (a.get("score") or {}).get("rag") == "green")
    if m:
        pct, green = int(m.group(1)), int(m.group(2))
        if not scored or abs(pct - sum(scored) / len(scored)) >= 1:
            problems.append(f"score {pct}% is not the mean of the module scores {scored}")
        if green != greens:
            problems.append(f"{green} modules green in the headline, {greens} in the module scores")
    elif sentence != "Compliance score: no dated obligations yet" or scored:
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
        # v1.6: the tile states its module's score (FRAGO 06 3.6).
        count = tile.locator("[data-testid='module-tile-count']")
        bad = _score_problem(_text(count.first) if count.count() else "")
        if bad:
            problems.append(f"tile {i + 1}: {bad}")

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
    # v1.7 (FRAGO 07 3.5): the wording follows the live path, named on the
    # element; each path has its own fixed sentence.
    el = page.locator("[data-testid='quick-questions-intro']").first
    path = el.get_attribute("data-path") or ""
    want = line.get(f"intro_text_{path}", intro_text)
    intro = _text(el)
    if intro != want:
        problems.append(f"intro on the '{path}' path reads '{intro}'")
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

    def __init__(self, cfg, role, email=None, password=None, login=True):
        """v1.5: email and password may be given for the gate's own users,
        and login=False makes a seat that has not signed in (for proving a
        refused sign-in). The demo seats are signed in exactly as before."""
        import http.cookiejar
        import urllib.request
        self.cfg = cfg
        self.base = cfg["_target"].rstrip("/") + "/api"
        self.jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar))
        self.user = None
        self.login_status = None
        self.login_body = None
        if email is None:
            email, password = _credentials(cfg, role)
        if not login:
            return
        status, body = self.login(email, password)
        if status != 200 or not isinstance(body, dict) or not body.get("user"):
            raise RuntimeError(f"{role or 'gate user'} API sign-in returned {status}")

    def login(self, email, password):
        status, body = self.call("POST", "/auth/login", {"email": email, "password": password})
        self.login_status, self.login_body = status, body
        if status == 200 and isinstance(body, dict) and body.get("user"):
            self.user = body["user"]
        return status, body

    def cookies(self):
        return sorted((c.name, c.value) for c in self.jar)

    def call(self, method, path, body=None, preview=None, headers=None):
        import urllib.error
        import urllib.request
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(self.base + path, data=data, method=method)
        req.add_header("Accept", "application/json")
        if data is not None:
            req.add_header("Content-Type", "application/json")
        if preview is not None:
            req.add_header(PREVIEW_HEADER, f"client:{preview}")
        for k, v in (headers or {}).items():
            req.add_header(k, v)
        try:
            with self.opener.open(req, timeout=30) as resp:
                status, raw = resp.status, resp.read()
        except urllib.error.HTTPError as exc:
            status, raw = exc.code, exc.read()
        try:
            return status, json.loads(raw.decode("utf-8") or "null")
        except ValueError:
            return status, {"_raw": raw[:200].decode("utf-8", "replace")}


def _user_org(user):
    """A user's organisation, under either field name the API uses."""
    user = user or {}
    return user.get("orgId") or user.get("clientAccountId")


def _preview_org_id(operator):
    """The demo organisation. Until v1.4 this was the first entry of
    GET /admin/accounts; from v1.5 the list holds the gate's own organisation
    too (and any real one), so it is the demo client seat's organisation."""
    if not _GATE.get("demo_org"):
        seat = _ApiSeat(operator.cfg, "client")
        org = _user_org(seat.user)
        if not org:
            raise RuntimeError("the demo client seat carries no organisation id")
        _GATE["demo_org"] = org
    return _GATE["demo_org"]


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

    # v1.7 (FRAGO 07 3.3): each refusal states why; Ask is let through as a
    # pure read (line 63), so an empty Guide message is refused as invalid
    # and writes nothing.
    probes = [
        ("POST", f"/tracker/tasks/{task_id}/confirm", "confirm", 403,
         "Read only in client view. The client confirms from her own sign-in."),
        ("POST", "/requests", "raise request", 403,
         "Read only in client view. The client submits requests from her own sign-in."),
        ("POST", "/tracker/documents", "upload", 403,
         "Read only in client view. The client uploads documents from her own sign-in."),
        ("POST", "/chat/messages", "empty Guide message", 400, "Type a question first."),
    ]
    for method, path, label, want_status, want_err in probes:
        s, body = operator.call(method, path, {}, preview=org)
        err = (body or {}).get("error") if isinstance(body, dict) else None
        if s != want_status or err != want_err:
            problems.append(f"{label}: {s} '{err}'")

    after = _client_task_state(client, task_id)
    if before is None or after != before:
        problems.append(f"task {task_id} changed: {before} -> {after}")

    s, _ = operator.call("GET", "/tracker/home")
    if s != 403:
        problems.append(f"operator without the marker on /tracker/home: {s}")

    ok = not problems
    which = "an open for-you task" if open_for_you else "a task (no open for-you row)"
    return ok, (f"confirm on {which}, request and upload refused 403 with their stated messages; empty Ask 400; "
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
            # v1.7 (FRAGO 07 3.3): Ask is enabled in client view (line 63);
            # Submit request stays disabled and says why.
            if v == "request":
                pattern = r"^\s*Submit request\s*$"
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


# --- v1.5 (FRAGO 05): named accounts, organisations, seed -------------------
#
# The live store has no delete. Everything the gate makes is find-or-create
# under a fixed identity, so a second run reuses what the first made: one
# organisation, one client user of it, one manager user. Nothing is created in
# the demo organisation, and the demo's data, users and settings are only read
# (line 37's toggle-and-restore is v1.4's and unchanged). A gate user is made
# usable for the length of a line (enabled, reset, password changed) and is
# disabled again in that line's finally block, and once more at the end of the
# driven section. The one-time passwords and the per-run passwords the gate
# sets are never printed or written to the report.

GATE_ORG_NAME = "Gate test organisation"
GATE_ORG_JURISDICTION = "UK"
GATE_ORG_JOURNEY_NOTE = "Gate test organisation journey note."
GATE_CLIENT_EMAIL = "gate-client@gate.invalid"
GATE_MANAGER_EMAIL = "gate-manager@gate.invalid"
# v1.7: the gate organisation's test seat (FRAGO 07 3.3) is disabled with the rest.
GATE_DEMO_CLIENT_EMAIL = "gate-demo-client@gate.invalid"
DEMO_ORG_ID = "demo"
GATE_EMAILS = (GATE_CLIENT_EMAIL, GATE_MANAGER_EMAIL, "gate-test-seat@gate.invalid", "gate-second-seat@gate.invalid")
SEED_FIXTURE = "06_EXECUTION/gate/fixtures/seed_manifest_fixture.json"
PASSWORD_REQUIRED_CODE = "password_change_required"
PASSWORD_REQUIRED_ERROR = "Change your password to continue."
ORG_STORAGE_KEY = "assure.org"
ORG_HEADER = "X-Assure-Org"
SESSION_ID_IN_DETAIL = re.compile(r"session=[0-9a-f-]{20,}", re.I)

# Admin routes that do not act on one organisation, so carry no selection.
ORG_FREE_ADMIN_PATHS = ("/api/admin/organisations", "/api/admin/users", "/api/admin/accounts")

_GATE = {"demo_org": None, "org": None, "org_created": None}


def _ok(status, body, *codes):
    return status in (codes or (200,)) and isinstance(body, dict)


def _gate_org(operator):
    """Find or create the gate's organisation. Returns (organisation, created)."""
    s, body = operator.call("GET", "/admin/organisations")
    if not _ok(s, body):
        raise RuntimeError(f"GET /admin/organisations returned {s}")
    for o in body.get("organisations") or []:
        if o.get("name") == GATE_ORG_NAME:
            if _GATE["org_created"] is None:
                _GATE["org_created"] = False
            _GATE["org"] = o["id"]
            return o, False
    s, body = operator.call("POST", "/admin/organisations",
                            {"name": GATE_ORG_NAME, "jurisdiction": GATE_ORG_JURISDICTION})
    if s != 201 or not (body or {}).get("organisation", {}).get("id"):
        raise RuntimeError(f"POST /admin/organisations returned {s}")
    _GATE["org"] = body["organisation"]["id"]
    _GATE["org_created"] = True
    operator.call("PUT", f"/admin/settings?org={_GATE['org']}", {"journeyNote": GATE_ORG_JOURNEY_NOTE})
    return body["organisation"], True


def _admin_users(operator):
    s, body = operator.call("GET", "/admin/users")
    if not _ok(s, body):
        raise RuntimeError(f"GET /admin/users returned {s}")
    return body.get("users") or []


def _find_user(operator, email):
    for u in _admin_users(operator):
        if str(u.get("email", "")).lower() == email.lower():
            return u
    return None


def _gate_user(operator, email, role, org_id):
    """Find or create a gate user, enable it if disabled, and give it a
    fresh one-time password. Returns (user, one_time_password, actions),
    actions being the audit actions this call should have written."""
    actions = []
    u = _find_user(operator, email)
    if u is None:
        payload = {"email": email, "role": role, "displayName": "Gate " + role.replace("_", " ")}
        if role == "client":
            payload["orgId"] = org_id
        s, body = operator.call("POST", "/admin/users", payload)
        if s != 201 or not (body or {}).get("oneTimePassword"):
            raise RuntimeError(f"POST /admin/users for a gate {role} returned {s}")
        return body["user"], body["oneTimePassword"], ["user.create"]
    if u.get("status") == "disabled":
        s, _ = operator.call("POST", f"/admin/users/{u['id']}/enable")
        if s != 200:
            raise RuntimeError(f"enable gate {role} returned {s}")
        actions.append("user.enable")
    s, body = operator.call("POST", f"/admin/users/{u['id']}/reset-password")
    if s != 200 or not (body or {}).get("oneTimePassword"):
        raise RuntimeError(f"reset-password for the gate {role} returned {s}")
    actions.append("user.reset_password")
    return u, body["oneTimePassword"], actions


def _new_password():
    import secrets
    return "Gate-" + secrets.token_urlsafe(18)


def _gate_seat(cfg, operator, email, role, org_id):
    """A signed-in seat for a gate user, past its first-sign-in change.
    Returns (seat, user, password)."""
    user, otp, _ = _gate_user(operator, email, role, org_id)
    seat = _ApiSeat(cfg, None, email=email, password=otp)
    pw = _new_password()
    s, _ = seat.call("POST", "/auth/password", {"currentPassword": otp, "newPassword": pw})
    if s != 200:
        raise RuntimeError(f"first-sign-in password change for the gate {role} returned {s}")
    return seat, user, pw


def _gate_client_seat(cfg, operator):
    org, _ = _gate_org(operator)
    seat, user, _ = _gate_seat(cfg, operator, GATE_CLIENT_EMAIL, "client", org["id"])
    return seat, org["id"]


def _disable_gate_users(operator):
    """Disable every gate user not already disabled. Returns the emails
    still not disabled afterwards (empty when clean)."""
    left = []
    for u in _admin_users(operator):
        if str(u.get("email", "")).lower() not in GATE_EMAILS:
            continue
        if u.get("status") != "disabled":
            operator.call("POST", f"/admin/users/{u['id']}/disable")
    for u in _admin_users(operator):
        if str(u.get("email", "")).lower() in GATE_EMAILS and u.get("status") != "disabled":
            left.append(u.get("email"))
    return left


def _safe_disable(cfg, operator=None):
    try:
        return _disable_gate_users(operator or _ApiSeat(cfg, "admin"))
    except Exception as exc:
        return [f"cleanup failed: {type(exc).__name__}"]


def _gate_demo_client(cfg):
    """v1.8. The gate's client seat on the demo organisation: found or
    created, enabled, given a one-time password and past its first-sign-in
    change, once per run. It is not among GATE_EMAILS, which lines disable
    mid-run; it is disabled at the end of the run instead."""
    if _GATE.get("demo_client"):
        return _GATE["demo_client"]
    operator = _ApiSeat(cfg, "admin")
    s, body = operator.call("GET", "/admin/organisations")
    if not _ok(s, body) or DEMO_ORG_ID not in {o.get("id") for o in body.get("organisations") or []}:
        raise RuntimeError("the demo organisation is not listed")
    _, otp, _ = _gate_user(operator, GATE_DEMO_CLIENT_EMAIL, "client", DEMO_ORG_ID)
    seat = _ApiSeat(cfg, None, email=GATE_DEMO_CLIENT_EMAIL, password=otp)
    pw = _new_password()
    s, _ = seat.call("POST", "/auth/password", {"currentPassword": otp, "newPassword": pw})
    if s != 200:
        raise RuntimeError(f"first-sign-in password change for the gate demo seat returned {s}")
    _GATE["demo_client"] = (GATE_DEMO_CLIENT_EMAIL, pw)
    return _GATE["demo_client"]


def _disable_gate_demo_client(cfg):
    try:
        operator = _ApiSeat(cfg, "admin")
        u = _find_user(operator, GATE_DEMO_CLIENT_EMAIL)
        if u is None:
            return []
        if u.get("status") != "disabled":
            operator.call("POST", f"/admin/users/{u['id']}/disable")
        u = _find_user(operator, GATE_DEMO_CLIENT_EMAIL)
        return [] if u is None or u.get("status") == "disabled" else [GATE_DEMO_CLIENT_EMAIL]
    except Exception as exc:
        return [f"demo seat cleanup failed: {type(exc).__name__}"]


def _final_gate_cleanup(cfg):
    if "_target" not in cfg:
        return
    left = _safe_disable(cfg) + _disable_gate_demo_client(cfg)
    check("driven: every gate user disabled at the end of the run", not left,
          "none left enabled" if not left else ", ".join(left))


def _audit_entries(seat, path):
    s, body = seat.call("GET", path)
    if not _ok(s, body):
        raise RuntimeError(f"GET {path} returned {s}")
    return body.get("entries") or []


def _walk(obj, fn, key=None):
    fn(key, obj)
    if isinstance(obj, dict):
        for k, v in obj.items():
            _walk(v, fn, k)
    elif isinstance(obj, list):
        for v in obj:
            _walk(v, fn, key)


def drv_users_lifecycle_audit(page, cfg, line, res, errors):
    """Line 39 (new at v1.5, FRAGO 05 sections 3.2 and 3.7)."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    operator = _ApiSeat(cfg, "admin")
    demo_client = _ApiSeat(cfg, "client")
    problems, notes, otps = [], [], []
    try:
        for p in ("/admin/users", "/admin/organisations", "/admin/users/audit"):
            s, _ = demo_client.call("GET", p)
            if s != 403:
                problems.append(f"client seat GET {p}: {s}, expected 403")
        org, _ = _gate_org(operator)
        org_id = org["id"]
        before = {e["id"] for e in _audit_entries(operator, "/admin/users/audit")}
        org_before = {e["id"] for e in _audit_entries(operator, f"/admin/audit?accountId={org_id}")}

        cu, otp1, acts_c = _gate_user(operator, GATE_CLIENT_EMAIL, "client", org_id)
        mu, otp2, acts_m = _gate_user(operator, GATE_MANAGER_EMAIL, "mitmark_admin", None)
        otps += [otp1, otp2]
        s, _ = operator.call("POST", "/admin/users",
                             {"email": GATE_CLIENT_EMAIL, "role": "client", "orgId": org_id})
        if s != 409:
            problems.append(f"create with an existing email returned {s}, expected 409")

        # The client seat, signed in, is refused once disabled.
        seat = _ApiSeat(cfg, None, email=GATE_CLIENT_EMAIL, password=otp1)
        pw = _new_password()
        s, _ = seat.call("POST", "/auth/password", {"currentPassword": otp1, "newPassword": pw})
        if s != 200:
            problems.append(f"gate client password change returned {s}")
        s, _ = operator.call("POST", f"/admin/users/{cu['id']}/disable")
        if s != 200:
            problems.append(f"disable returned {s}")
        s, _ = seat.call("GET", "/auth/me")
        if s != 401:
            problems.append(f"disabled user's live session got {s} on /auth/me, expected 401")
        s, _ = _ApiSeat(cfg, None, email=GATE_CLIENT_EMAIL, password=pw, login=False).login(GATE_CLIENT_EMAIL, pw)
        if s != 401:
            problems.append(f"disabled user's sign-in returned {s}, expected 401")
        s, _ = operator.call("POST", f"/admin/users/{cu['id']}/enable")
        if s != 200:
            problems.append(f"enable returned {s}")
        s, _ = _ApiSeat(cfg, None, login=False, email="", password="").login(GATE_CLIENT_EMAIL, pw)
        if s != 200:
            problems.append(f"re-enabled user's sign-in returned {s}")
        s, body = operator.call("POST", f"/admin/users/{cu['id']}/reset-password")
        if s != 200 or not (body or {}).get("oneTimePassword"):
            problems.append(f"reset-password returned {s}")
        else:
            otps.append(body["oneTimePassword"])
        s, _ = operator.call("POST", f"/admin/users/{cu['id']}/disable")
        s2, _ = operator.call("POST", f"/admin/users/{mu['id']}/disable")
        if s != 200 or s2 != 200:
            problems.append(f"final disables returned {s}/{s2}")

        # Audit: each action present, naming the user id, never the email or a password.
        new = [e for e in _audit_entries(operator, "/admin/users/audit") if e["id"] not in before]
        expected = {
            cu["id"]: set(acts_c) | {"user.disable", "user.enable", "user.reset_password"},
            mu["id"]: set(acts_m) | {"user.disable"},
        }
        for uid, acts in expected.items():
            got = {e.get("action") for e in new if uid in str(e.get("detail", ""))}
            missing = acts - got
            if missing:
                problems.append(f"user {uid}: no audit entry for {', '.join(sorted(missing))}")
        for e in new:
            if not str(e.get("action", "")).startswith("user."):
                continue
            d = str(e.get("detail", ""))
            if any(m.lower() in d.lower() for m in GATE_EMAILS):
                problems.append(f"audit entry {e['id']} names an email")
            if str(e.get("actorId")) != str(operator.user.get("id")):
                problems.append(f"audit entry {e['id']} actor '{e.get('actorId')}', expected the operator")
        org_new = [e for e in _audit_entries(operator, f"/admin/audit?accountId={org_id}")
                   if e["id"] not in org_before]
        org_keys = {(e.get("action"), e.get("detail")) for e in org_new} | {e["id"] for e in org_new}
        for e in new:
            if cu["id"] in str(e.get("detail", "")) and str(e.get("action", "")).startswith("user."):
                if e["id"] not in org_keys and (e.get("action"), e.get("detail")) not in org_keys:
                    problems.append(f"{e.get('action')} for the client user not in the organisation's audit")

        # The one-time passwords are nowhere after the response that carried them.
        for p in ("/admin/users", "/admin/users/audit", f"/admin/audit?accountId={org_id}"):
            s, body = operator.call("GET", p)
            text = json.dumps(body)
            if any(o and o in text for o in otps):
                problems.append(f"a one-time password appears in GET {p}")

        # The last active manager cannot be disabled. Proved only when the
        # operator seat is the sole active manager; with more than one active
        # manager the gate would have to disable a real one, which it never does.
        active = [u for u in _admin_users(operator)
                  if u.get("role") == "mitmark_admin" and u.get("status") != "disabled"]
        if len(active) == 1 and str(active[0].get("id")) == str(operator.user.get("id")):
            s, body = operator.call("POST", f"/admin/users/{active[0]['id']}/disable")
            err = str((body or {}).get("error", ""))
            if s != 409 or "last active manager" not in err:
                problems.append(f"disabling the last active manager returned {s} '{err[:60]}'")
                if s == 200:
                    operator.call("POST", f"/admin/users/{active[0]['id']}/enable")
            else:
                notes.append("last active manager refused 409")
        else:
            notes.append(f"last-manager rule not driven: {len(active)} active managers, "
                         f"and the gate never disables a real one")
    finally:
        left = _safe_disable(cfg, operator)
        if left:
            problems.append("gate users left enabled: " + ", ".join(left))
    ok = not problems
    return ok, ("create or reset, disable, enable and reset audited by user id with the operator as actor; "
                "client entries mirrored in the organisation's audit; 409 on a repeat email; disabled "
                "session and sign-in refused 401; no one-time password in any later response; "
                + "; ".join(notes)) if ok else "; ".join(problems[:8])


def drv_password_change_enforced(page, cfg, line, res, errors):
    """Line 40 (new at v1.5, FRAGO 05 section 3.3)."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    operator = _ApiSeat(cfg, "admin")
    problems = []
    blocked_paths = line.get("blocked_paths", ["/tracker/home", "/tracker/jobs", "/tracker/documents",
                                               "/clocks", "/policies", "/value/statement"])
    try:
        org, _ = _gate_org(operator)
        _, otp, _ = _gate_user(operator, GATE_CLIENT_EMAIL, "client", org["id"])
        a = _ApiSeat(cfg, None, email=GATE_CLIENT_EMAIL, password=otp)
        b = _ApiSeat(cfg, None, email=GATE_CLIENT_EMAIL, password=otp)
        if (a.login_body or {}).get("user", {}).get("mustChangePassword") is not True:
            problems.append("login response user.mustChangePassword is not true")
        for p in ("/auth/session", "/auth/me"):
            s, body = a.call("GET", p)
            if s != 200 or ((body or {}).get("user") or {}).get("mustChangePassword") is not True:
                problems.append(f"GET {p}: {s}, mustChangePassword not true")
        for p in blocked_paths:
            s, body = a.call("GET", p)
            if s != 403 or (body or {}).get("code") != PASSWORD_REQUIRED_CODE \
                    or (body or {}).get("error") != PASSWORD_REQUIRED_ERROR:
                problems.append(f"must-change client GET {p}: {s} {str((body or {}).get('code'))}")

        _, motp, _ = _gate_user(operator, GATE_MANAGER_EMAIL, "mitmark_admin", None)
        m = _ApiSeat(cfg, None, email=GATE_MANAGER_EMAIL, password=motp)
        for p in ("/admin/users", "/admin/organisations", f"/admin/workplan?org={org['id']}"):
            s, body = m.call("GET", p)
            if s != 403 or (body or {}).get("code") != PASSWORD_REQUIRED_CODE:
                problems.append(f"must-change manager GET {p}: {s}")

        s, body = a.call("POST", "/auth/password", {"currentPassword": otp, "newPassword": "short-pw"})
        if s != 400 or "12 characters" not in str((body or {}).get("error", "")):
            problems.append(f"an 8-character password returned {s} '{str((body or {}).get('error', ''))[:50]}'")
        before = a.cookies()
        pw = _new_password()
        s, _ = a.call("POST", "/auth/password", {"currentPassword": otp, "newPassword": pw})
        if s != 200:
            problems.append(f"password change returned {s}")
        if a.cookies() == before:
            problems.append("no fresh session cookie after the change")
        s, body = a.call("GET", "/auth/me")
        if s != 200 or ((body or {}).get("user") or {}).get("mustChangePassword") is not False:
            problems.append(f"after the change /auth/me {s}, mustChangePassword not false")
        s, _ = a.call("GET", "/tracker/home")
        if s != 200:
            problems.append(f"after the change /tracker/home {s}")
        for p in ("/auth/me", "/tracker/home"):
            s, _ = b.call("GET", p)
            if s != 401:
                problems.append(f"the other session got {s} on {p}, expected 401")
        s, _ = _ApiSeat(cfg, None, login=False, email="", password="").login(GATE_CLIENT_EMAIL, otp)
        if s != 401:
            problems.append(f"the used one-time password still signs in ({s})")
    finally:
        left = _safe_disable(cfg, operator)
        if left:
            problems.append("gate users left enabled: " + ", ".join(left))
    ok = not problems
    return ok, (f"must-change refused 403 {PASSWORD_REQUIRED_CODE} on {len(blocked_paths)} client and 3 admin "
                "routes; under 12 characters refused 400; the change issues a fresh cookie, clears the flag "
                "and ends the other session (401)" if ok else "; ".join(problems[:8]))


def drv_change_password_web(page, cfg, line, res, errors):
    """Line 41 (new at v1.5): a must-change user is held on /change-password
    whatever she opens; the form and the rule are there; after the change the
    portal opens; both portals carry the header link."""
    from urllib.parse import urlparse
    settle_ms = line.get("settle_ms", 600)
    target = cfg["_target"].rstrip("/")
    form_sel = "form[data-testid='change-password-form']"
    link_sel = "[data-testid='change-password-link']"
    operator = _ApiSeat(cfg, "admin")
    problems = []
    try:
        org, _ = _gate_org(operator)
        _, otp, _ = _gate_user(operator, GATE_CLIENT_EMAIL, "client", org["id"])
        _sign_in_with(page, target, GATE_CLIENT_EMAIL, otp)
        _wait_for(page, form_sel, 8000)
        for path in ["", "/"] + line.get("probe_paths", ["/jobs", "/documents", "/statement", "/admin"]):
            if path:
                page.goto(target + path, wait_until="domcontentloaded")
                page.wait_for_timeout(settle_ms)
                _wait_for(page, form_sel, 6000)
            at = urlparse(page.url).path.rstrip("/")
            if at != "/change-password":
                problems.append(f"opening '{path or 'after sign-in'}' landed on '{at}'")
            if page.locator("[data-view='tracker']").count() and page.locator("[data-view='tracker']").first.is_visible():
                problems.append(f"'{path or 'after sign-in'}': client nav visible before the change")
        form = page.locator(form_sel)
        if form.count() == 0:
            return False, "; ".join(problems + ["change-password form absent"])[:600]
        for n in ("currentPassword", "newPassword", "confirmPassword"):
            if form.locator(f"input[name='{n}']").count() == 0:
                problems.append(f"input name='{n}' missing")
        rule = page.locator("[data-testid='password-rule']")
        if rule.count() == 0 or "At least 12 characters." not in _text(rule.first):
            problems.append(f"password rule reads '{_text(rule.first) if rule.count() else ''}'")
        pw = _new_password()
        form.locator("input[name='currentPassword']").fill(otp)
        form.locator("input[name='newPassword']").fill(pw)
        form.locator("input[name='confirmPassword']").fill(pw)
        form.locator("button[type='submit']").first.click()
        page.wait_for_timeout(settle_ms * 2)
        if not _wait_for(page, "[data-view='tracker']", 8000):
            problems.append(f"after the change the portal did not open (at '{urlparse(page.url).path}')")
        link = page.locator(link_sel)
        if link.count() == 0:
            problems.append("client portal: change-password-link absent")
        elif (link.first.get_attribute("href") or "").rstrip("/") not in ("/change-password", target + "/change-password"):
            problems.append(f"client portal link href '{link.first.get_attribute('href')}'")
        _sign_in(page, cfg, "admin", cfg["_target"])
        if not _wait_for(page, link_sel, 8000):
            problems.append("admin workspace: change-password-link absent")
    finally:
        left = _safe_disable(cfg, operator)
        if left:
            problems.append("gate users left enabled: " + ", ".join(left))
        _sign_in(page, cfg, "client", cfg["_target"])
    ok = not problems
    return ok, ("held on /change-password from every path tried; form, three inputs and the rule present; "
                "portal opens after the change; header link on both portals" if ok else "; ".join(problems[:8]))


def drv_users_page_one_time_password(page, cfg, line, res, errors):
    """Line 42 (new at v1.5): the Users page lists users in users-table;
    a reset shows the one-time password once, with the two statements, and a
    reload does not show it again."""
    settle_ms = line.get("settle_ms", 600)
    table_sel = "[data-testid='users-table']"
    otp_sel = "[data-testid='one-time-password']"
    operator = _ApiSeat(cfg, "admin")
    problems = []
    accept = lambda d: d.accept()
    page.on("dialog", accept)
    try:
        org, _ = _gate_org(operator)
        u = _find_user(operator, GATE_CLIENT_EMAIL)
        if u is None:
            _gate_user(operator, GATE_CLIENT_EMAIL, "client", org["id"])
        u = _find_user(operator, GATE_CLIENT_EMAIL)
        if u.get("status") == "disabled":
            operator.call("POST", f"/admin/users/{u['id']}/enable")
        if not _sign_in(page, cfg, "admin", cfg["_target"]):
            return False, "could not sign in as the operator"
        nav = page.locator("[data-view='users']")
        if not _enter_view(page, "users", None, settle_ms, cfg, "admin"):
            return False, "admin nav item data-view='users' not found"
        if _text(nav.first) != "Users":
            problems.append(f"nav label reads '{_text(nav.first)}'")
        if not _wait_for(page, table_sel, 8000):
            return False, "users-table absent"
        row = page.locator(f"{table_sel} tr").filter(has_text=GATE_CLIENT_EMAIL)
        if row.count() == 0:
            return False, "the gate client's row is not in users-table"
        btn = row.first.locator("button").filter(has_text=re.compile(r"reset", re.I))
        if btn.count() == 0:
            return False, "no reset control on the gate client's row"
        btn.first.click()
        page.wait_for_timeout(settle_ms)
        if page.locator(otp_sel).count() == 0:
            confirm = page.locator("[role='dialog'] button, [role='alertdialog'] button").filter(
                has_text=re.compile(r"^\s*(reset|confirm|yes|continue)", re.I))
            if confirm.count():
                confirm.first.click()
        if not _wait_for(page, otp_sel, 8000):
            return False, "one-time-password not shown after the reset"
        n = page.locator(otp_sel).count()
        if n != 1:
            problems.append(f"{n} one-time-password elements, expected 1")
        shown = page.locator(otp_sel).first
        body_text = " ".join((page.locator("body").text_content() or "").split())
        for phrase in ("Shown once", "Tessera Assure does not send email"):
            if phrase not in body_text:
                problems.append(f"'{phrase}' not on the page with the password")
        tokens = [t for t in _text(shown).split() if len(t) >= 12]
        secret = max(tokens, key=len) if tokens else None
        page.reload(wait_until="domcontentloaded")
        page.wait_for_timeout(settle_ms * 2)
        if page.locator(otp_sel).count():
            problems.append("one-time-password shown again after a reload")
        if secret and secret in (page.content() or ""):
            problems.append("the one-time password is in the page after a reload")
        if not secret:
            problems.append("could not read a password of 12 or more characters from one-time-password")
    finally:
        page.remove_listener("dialog", accept)
        left = _safe_disable(cfg, operator)
        if left:
            problems.append("gate users left enabled: " + ", ".join(left))
    ok = not problems
    return ok, ("Users page and users-table present; a reset shows the one-time password once with "
                "both statements; gone after a reload" if ok else "; ".join(problems[:8]))


def drv_organisations_api(page, cfg, line, res, errors):
    """Line 43 (new at v1.5, FRAGO 05 section 3.4)."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    import datetime as _dt
    operator = _ApiSeat(cfg, "admin")
    demo = _preview_org_id(operator)
    problems, notes = [], []
    org, created = _gate_org(operator)
    gid = org["id"]
    s, body = operator.call("GET", "/admin/organisations")
    listed = {o.get("id"): o for o in (body or {}).get("organisations") or []}
    for oid in (gid, demo):
        o = listed.get(oid)
        if not o:
            problems.append(f"organisation {oid} not listed")
            continue
        missing = [k for k in ("id", "name", "jurisdiction", "regulationLabel", "userCount", "taskCount") if k not in o]
        if missing:
            problems.append(f"organisation {oid} lacks {', '.join(missing)}")
    if created or _GATE["org_created"]:
        if (listed.get(gid) or {}).get("taskCount") != 0:
            problems.append(f"a new organisation has {(listed.get(gid) or {}).get('taskCount')} tasks, expected 0")
        else:
            notes.append("created this run with 0 tasks")
    else:
        notes.append("existing gate organisation reused, so the 0-task rule was proved on its first run only")

    start = _dt.date.today().isoformat()
    s, prev = operator.call("GET", f"/admin/workplan/apply-library/preview?org={gid}&startDate={start}")
    s2, applied = operator.call("POST", f"/admin/workplan/apply-library?org={gid}", {"startDate": start})
    if s != 200 or s2 != 200:
        problems.append(f"apply-library preview {s}, apply {s2}")
    elif (prev or {}).get("willCreate") != (applied or {}).get("created"):
        problems.append(f"preview said {(prev or {}).get('willCreate')}, apply created {(applied or {}).get('created')}")
    else:
        notes.append(f"apply library: preview {prev.get('willCreate')} = created {applied.get('created')}")

    for p in ("/admin/workplan", "/admin/settings", "/admin/documents", "/admin/record"):
        s, _ = operator.call("GET", p)
        if s != 400:
            problems.append(f"GET {p} with no organisation returned {s}, expected 400")
    s, body = operator.call("GET", "/admin/settings", headers={ORG_HEADER: gid})
    s_q, body_q = operator.call("GET", f"/admin/settings?org={gid}")
    s_a, body_a = operator.call("GET", f"/admin/settings?accountId={gid}")
    if not (s == s_q == s_a == 200) or not (body == body_q == body_a):
        problems.append(f"org, accountId and {ORG_HEADER} do not select the same settings ({s}/{s_q}/{s_a})")

    s, demo_before = operator.call("GET", f"/admin/settings?org={demo}")
    s2, gate_before = operator.call("GET", f"/admin/settings?org={gid}")
    if s != 200 or s2 != 200:
        problems.append(f"GET settings demo {s}, gate {s2}")
    else:
        original = ((gate_before or {}).get("settings") or {}).get("journeyNote", "")
        try:
            s, _ = operator.call("PUT", f"/admin/settings?org={gid}", {"journeyNote": "gate isolation"})
            if s != 200:
                problems.append(f"PUT gate settings {s}")
            s, demo_after = operator.call("GET", f"/admin/settings?org={demo}")
            if demo_after != demo_before:
                problems.append("the demo's settings changed when the gate organisation's were written")
            s, g = operator.call("GET", f"/admin/settings?org={gid}")
            if ((g or {}).get("settings") or {}).get("journeyNote") != "gate isolation":
                problems.append("the gate organisation's journeyNote did not take the write")
        finally:
            operator.call("PUT", f"/admin/settings?org={gid}", {"journeyNote": original or GATE_ORG_JOURNEY_NOTE})
    ok = not problems
    return ok, ("list carries the six fields; no-organisation admin GETs refused 400; org, accountId and "
                f"{ORG_HEADER} agree; settings isolated and restored; " + "; ".join(notes)) if ok \
        else "; ".join(problems[:8])


def _select_org(page, label, settle_ms):
    sw = page.locator("[data-testid='org-switcher']")
    if sw.count() == 0:
        return False
    sw.first.select_option(label=label)
    page.wait_for_timeout(settle_ms * 2)
    return True


def _org_params(url, headers):
    from urllib.parse import urlparse, parse_qs
    q = parse_qs(urlparse(url).query)
    vals = q.get("org", []) + q.get("accountId", [])
    h = {k.lower(): v for k, v in (headers or {}).items()}
    if ORG_HEADER.lower() in h:
        vals.append(h[ORG_HEADER.lower()])
    return vals


def drv_org_switcher(page, cfg, line, res, errors):
    """Line 44 (new at v1.5, FRAGO 05 section 3.4)."""
    from urllib.parse import urlparse
    settle_ms = line.get("settle_ms", 600)
    operator = _ApiSeat(cfg, "admin")
    demo = _preview_org_id(operator)
    org, _ = _gate_org(operator)
    gid = org["id"]
    s, body = operator.call("GET", "/admin/organisations")
    orgs = {o["id"]: o for o in (body or {}).get("organisations") or []}
    demo_name = orgs.get(demo, {}).get("name")
    info = {}
    for oid in (gid, demo):
        _, st = operator.call("GET", f"/admin/settings?org={oid}")
        _, docs = operator.call("GET", f"/admin/documents?org={oid}")
        _, wp = operator.call("GET", f"/admin/workplan?org={oid}")
        info[oid] = {"note": ((st or {}).get("settings") or {}).get("journeyNote", ""),
                     "docs": len((docs or {}).get("documents") or []),
                     "tasks": len((wp or {}).get("tasks") or []),
                     "taskCount": orgs.get(oid, {}).get("taskCount")}
    problems, captured = [], []

    def on_request(req):
        if "/api/admin" in req.url:
            captured.append((req.url, req.headers))

    def page_checks(oid, who):
        g = info[oid]
        if _enter_view(page, "workplan", None, settle_ms, cfg, "admin"):
            _wait_for(page, "[data-testid='task-row']", 5000)
            page.wait_for_timeout(settle_ms)
            n = page.locator("[data-testid='task-row']").count()
            if n != g["taskCount"]:
                problems.append(f"{who} Workplan shows {n} task rows, taskCount {g['taskCount']}")
        else:
            problems.append(f"{who}: workplan nav missing")
        if _enter_view(page, "documents-admin", None, settle_ms, cfg, "admin"):
            page.wait_for_timeout(settle_ms)
            n = page.locator("[data-testid='document-row']").count()
            if n != g["docs"]:
                problems.append(f"{who} Documents shows {n} rows, API has {g['docs']}")
        if _enter_view(page, "settings", None, settle_ms, cfg, "admin"):
            _wait_for(page, "[name='journeyNote']", 5000)
            f = page.locator("[name='journeyNote']")
            v = f.first.input_value() if f.count() else None
            if v != g["note"]:
                problems.append(f"{who} Settings journey note does not match that organisation's")
        if not _enter_view(page, "record", None, settle_ms, cfg, "admin"):
            problems.append(f"{who}: record nav missing")

    try:
        if not _sign_in(page, cfg, "admin", cfg["_target"]):
            return False, "could not sign in as the operator"
        _wait_for(page, "[data-view='queue']", 8000)
        if not _enter_view(page, "organisations", None, settle_ms, cfg, "admin"):
            problems.append("admin nav item data-view='organisations' not found")
        else:
            if _text(page.locator("[data-view='organisations']").first) != "Organisations":
                problems.append("organisations nav label")
            if not _wait_for(page, "[data-testid='organisations-table']", 6000):
                problems.append("organisations-table absent")
            elif GATE_ORG_NAME not in _text(page.locator("[data-testid='organisations-table']").first):
                problems.append("the gate organisation is not in organisations-table")
        sw = page.locator("[data-testid='org-switcher']")
        if sw.count() == 0:
            return False, "; ".join(problems + ["org-switcher absent"])
        labels = [" ".join(t.split()) for t in sw.first.locator("option").all_text_contents()]
        for name in (GATE_ORG_NAME, demo_name):
            if name not in labels:
                problems.append(f"switcher lacks '{name}'")
        page.on("request", on_request)
        _select_org(page, GATE_ORG_NAME, settle_ms)
        held = page.evaluate(f"() => sessionStorage.getItem('{ORG_STORAGE_KEY}')")
        if held != gid:
            problems.append(f"sessionStorage {ORG_STORAGE_KEY} holds '{held}', expected the gate organisation")
        page_checks(gid, "gate org")
        page.reload(wait_until="domcontentloaded")
        page.wait_for_timeout(settle_ms * 2)
        _wait_for(page, "[data-testid='org-switcher']", 6000)
        if page.evaluate(f"() => sessionStorage.getItem('{ORG_STORAGE_KEY}')") != gid:
            problems.append("selection not remembered across a reload")
        page.remove_listener("request", on_request)
        stray, carried = [], 0
        for url, headers in captured:
            path = urlparse(url).path
            if any(path == p or path.startswith(p + "/") for p in ORG_FREE_ADMIN_PATHS):
                continue
            vals = _org_params(url, headers)
            if vals and all(v == gid for v in vals):
                carried += 1
            else:
                stray.append(f"{path} {vals}")
        if stray:
            problems.append(f"{len(stray)} admin requests not bound to the gate organisation: " + "; ".join(stray[:4]))
        if carried == 0:
            problems.append("no organisation-bound admin request captured")
        _select_org(page, demo_name, settle_ms)
        page_checks(demo, "demo")
    finally:
        try:
            page.remove_listener("request", on_request)
        except Exception:
            pass
        try:
            if demo_name:
                _select_org(page, demo_name, settle_ms)
            page.evaluate(f"() => sessionStorage.setItem('{ORG_STORAGE_KEY}', '{demo}')")
        except Exception:
            pass
    ok = not problems
    return ok, (f"switcher lists both; with the gate organisation Workplan, Documents and Settings show its "
                f"data and all {carried} organisation-bound admin requests carry it; remembered across a "
                "reload; demo data back after switching" if ok else "; ".join(problems[:8]))


def drv_client_view_follows_org(page, cfg, line, res, errors):
    """Line 45 (new at v1.5, FRAGO 05 section 3.6)."""
    settle_ms = line.get("settle_ms", 600)
    operator = _ApiSeat(cfg, "admin")
    demo = _preview_org_id(operator)
    problems, note, headers_seen = [], "", []
    try:
        gate_client, gid = _gate_client_seat(cfg, operator)
        if _api_only_once(line, res):
            p, volatile = _identity_against_client(gate_client, operator, PREVIEW_IDENTITY_PATHS, gid)
            problems.extend(f"API {x}" for x in p)
            note = f"{len(PREVIEW_IDENTITY_PATHS)} preview GETs equal the gate client seat's; {_volatile_note(volatile)}"
        s, body = operator.call("GET", "/admin/organisations")
        demo_name = {o["id"]: o["name"] for o in (body or {}).get("organisations") or []}.get(demo)

        def on_request(req):
            h = {k.lower(): v for k, v in req.headers.items()}
            if PREVIEW_HEADER.lower() in h:
                headers_seen.append(h[PREVIEW_HEADER.lower()])

        _sign_in(page, cfg, "admin", cfg["_target"])
        _wait_for(page, "[data-view='queue']", 8000)
        if not _select_org(page, GATE_ORG_NAME, settle_ms):
            problems.append("org-switcher absent")
        page.on("request", on_request)
        try:
            if not _enter_view(page, "client-view", None, settle_ms, cfg, "admin"):
                problems.append("client-view nav item not found")
            elif not _wait_for(page, "[data-testid='client-view-banner']", 8000):
                problems.append("client view opened without the banner")
            page.wait_for_timeout(settle_ms * 2)
        finally:
            page.remove_listener("request", on_request)
        wrong = [h for h in headers_seen if h != f"client:{gid}"]
        if not headers_seen:
            problems.append("no preview request captured in client view")
        if wrong:
            problems.append(f"{len(wrong)} preview requests for another organisation")
        ret = page.locator("[data-testid='client-view-return']")
        if ret.count():
            ret.first.click()
            page.wait_for_timeout(settle_ms * 2)
        if demo_name:
            _select_org(page, demo_name, settle_ms)
    finally:
        try:
            page.evaluate(f"() => {{ sessionStorage.removeItem('{PREVIEW_STORAGE_KEY}');"
                          f" sessionStorage.setItem('{ORG_STORAGE_KEY}', '{demo}'); }}")
        except Exception:
            pass
        left = _safe_disable(cfg, operator)
        if left:
            problems.append("gate users left enabled: " + ", ".join(left))
        _sign_in(page, cfg, "client", cfg["_target"])
    ok = not problems
    return ok, (f"client view with the gate organisation selected sends {len(headers_seen)} preview requests, "
                f"all for it; {note or 'API identity run at the first resolution'}" if ok else "; ".join(problems[:8]))


# The client GETs FRAGO 05 names for isolation are exactly line 33's set.
ISOLATION_PATHS = PREVIEW_IDENTITY_PATHS
# Ids shorter than this are not searched for as substrings (a short id such
# as "t1" would match inside unrelated text and report a false leak).
MIN_LEAK_ID_LEN = 8


def _record_ids(body):
    """Task and document ids in a response: the id of every object in a list
    held under a key named tasks or documents, at any depth."""
    ids = set()

    def fn(key, obj):
        if key in ("tasks", "documents") and isinstance(obj, list):
            for x in obj:
                if isinstance(x, dict) and x.get("id"):
                    ids.add(str(x["id"]))
    _walk(body, fn)
    return ids


def _foreign_org_ids(body, own):
    bad = []

    def fn(key, obj):
        if isinstance(obj, dict) and "orgId" in obj and obj["orgId"] is not None and str(obj["orgId"]) != str(own):
            bad.append(str(obj["orgId"]))
    _walk(body, fn)
    return bad


def drv_client_isolation(page, cfg, line, res, errors):
    """Line 46 (new at v1.5, FRAGO 05 section 3.7): a client of one
    organisation never receives a record of another. Both seats driven."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    operator = _ApiSeat(cfg, "admin")
    demo_seat = _ApiSeat(cfg, "client")
    demo = _user_org(demo_seat.user)
    problems = []
    try:
        gate_seat, gid = _gate_client_seat(cfg, operator)
        seats = {"gate": (gate_seat, gid), "demo": (demo_seat, demo)}
        got, ids = {}, {}
        for name, (seat, own) in seats.items():
            got[name], ids[name] = {}, set()
            for p in ISOLATION_PATHS:
                s, body = seat.call("GET", p)
                if s != 200:
                    problems.append(f"{name} client GET {p}: {s}")
                    continue
                got[name][p] = json.dumps(body)
                ids[name] |= _record_ids(body)
                bad = _foreign_org_ids(body, own)
                if bad:
                    problems.append(f"{name} client GET {p}: {len(bad)} object(s) of another organisation")
        for a, b in (("gate", "demo"), ("demo", "gate")):
            leaked = {i for i in ids[b] if len(i) >= MIN_LEAK_ID_LEN
                      and any(f'"{i}"' in t for t in got[a].values())}
            if leaked:
                problems.append(f"{len(leaked)} {b} task or document id(s) in the {a} client's responses")
        if gid == demo:
            problems.append("the gate client resolves to the demo organisation")
    finally:
        left = _safe_disable(cfg, operator)
        if left:
            problems.append("gate users left enabled: " + ", ".join(left))
    ok = not problems
    return ok, (f"{len(ISOLATION_PATHS)} client GETs per seat: every orgId is the seat's own; "
                f"{len(ids.get('demo', ()))} demo and {len(ids.get('gate', ()))} gate task or document ids, "
                "none crossing" if ok else "; ".join(problems[:8]))


def _load_seed_fixture(cfg):
    p = cfg["root"] / SEED_FIXTURE
    if not p.is_file():
        return None
    return json.loads(p.read_text(encoding="utf-8"))


def drv_seed_manifest(page, cfg, line, res, errors):
    """Line 47 (new at v1.5, FRAGO 05 sections 3.5 and 3.7), on the gate's
    own organisation, never the demo's."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    manifest = _load_seed_fixture(cfg)
    if manifest is None:
        return False, f"{SEED_FIXTURE} not found"
    # v1.5, amended FRAGO 05 3.5: the manifest is Seagull's shape. A clock whose
    # task is already done becomes one extra open task, so the expected count is
    # tasks plus those clocks, worked out here from the file, not taken from the
    # product's answer.
    tasks = manifest.get("tasks") or []
    done_refs = {t.get("ref") for t in tasks if t.get("status") == "done"}
    n = len(tasks) + sum(1 for c in (manifest.get("clocks") or []) if c.get("taskRef") in done_refs)
    phase = (((manifest.get("organisation") or {}).get("settings") or {}).get("journeyPhase"))
    operator = _ApiSeat(cfg, "admin")
    org, _ = _gate_org(operator)
    gid = org["id"]
    if gid == _preview_org_id(operator):
        return False, "refusing to seed: the gate organisation resolved to the demo"
    problems = []
    seed = f"/admin/organisations/{gid}/seed?org={gid}"

    def tasks_now():
        s, body = operator.call("GET", f"/admin/workplan?org={gid}")
        return len((body or {}).get("tasks") or []) if s == 200 else None

    t0 = tasks_now()
    s, dry = operator.call("POST", seed, {"manifest": manifest, "dryRun": True, "replace": True})
    if s != 200:
        problems.append(f"dry run returned {s}")
    else:
        if (dry.get("wouldCreate") or {}).get("tasks") != n:
            problems.append(f"dry run wouldCreate.tasks {(dry.get('wouldCreate') or {}).get('tasks')}, manifest {n}")
        if dry.get("after") != dry.get("before") or dry.get("dryRun") is not True:
            problems.append("dry run reports a change")
        if tasks_now() != t0:
            problems.append(f"dry run changed the workplan ({t0} -> {tasks_now()})")
    s, real = operator.call("POST", seed, {"manifest": manifest, "replace": True})
    if s != 200:
        problems.append(f"seed with replace returned {s}")
    else:
        if (real.get("after") or {}).get("tasks") != n:
            problems.append(f"after.tasks {(real.get('after') or {}).get('tasks')}, manifest {n}")
        if tasks_now() != n:
            problems.append(f"workplan holds {tasks_now()} tasks after the seed, manifest {n}")
    s, _ = operator.call("POST", seed, {"manifest": manifest})
    if s != 409:
        problems.append(f"a second seed without replace returned {s}, expected 409")
    if phase is not None:
        s, st = operator.call("GET", f"/admin/settings?org={gid}")
        got = ((st or {}).get("settings") or {}).get("journeyPhase")
        if got != phase:
            problems.append(f"journeyPhase {got}, manifest {phase}")
    ok = not problems
    return ok, (f"dry run would create {n} and changed nothing; replace seeded {n}; repeat refused 409; "
                "journey stage as the manifest" if ok else "; ".join(problems[:8]))


def drv_seeded_org_no_restricted(page, cfg, line, res, errors):
    """Line 48 (new at v1.5): no restricted term in any field of the seeded
    organisation, read through the admin API and the gate client's seat.
    Counts only; a term is never named."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    terms = _restricted_terms_runtime(cfg)
    if not terms:
        return False, "the restricted terms could not be read; an absent list is not a pass"
    operator = _ApiSeat(cfg, "admin")
    problems, read = [], 0
    try:
        seat, gid = _gate_client_seat(cfg, operator)
        sources = [(operator, f"/admin/{p}?org={gid}") for p in ("workplan", "settings", "documents")]
        sources += [(seat, "/tracker/home"), (seat, "/tracker/jobs")]
        for who, p in sources:
            s, body = who.call("GET", p)
            if s != 200:
                problems.append(f"GET {p}: {s}")
                continue
            read += 1
            hits = _restricted_hit_count(json.dumps(body, ensure_ascii=False), terms)
            if hits:
                problems.append(f"GET {p}: {hits} restricted term(s) [REDACTED]")
    finally:
        left = _safe_disable(cfg, operator)
        if left:
            problems.append("gate users left enabled: " + ", ".join(left))
    ok = not problems
    return ok, (f"{len(terms)} restricted terms against {read} responses, 0 hits" if ok else "; ".join(problems[:6]))


def drv_auth_login_audit_no_session(page, cfg, line, res, errors):
    """Line 49 (new at v1.5, FRAGO 05 section 4): auth.login entries written
    from now on carry no session id. Entries older than this run predate the
    rule and are not read."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    import datetime as _dt
    t0 = (_dt.datetime.now(_dt.timezone.utc) - _dt.timedelta(seconds=line.get("skew_s", 120))).isoformat()
    _ApiSeat(cfg, "client")
    operator = _ApiSeat(cfg, "admin")
    demo = _preview_org_id(operator)
    problems, seen = [], 0
    for p in (f"/admin/audit?accountId={demo}&action=auth.login", "/admin/users/audit"):
        for e in _audit_entries(operator, p):
            if e.get("action") != "auth.login" or str(e.get("createdAt", "")) < t0.replace("+00:00", ""):
                continue
            seen += 1
            if SESSION_ID_IN_DETAIL.search(str(e.get("detail", ""))):
                problems.append(f"{p.split('?')[0]} entry {e.get('id')} carries a session id")
    if seen == 0:
        problems.append("no auth.login entry written by this run's sign-ins was found")
    ok = not problems
    return ok, (f"{seen} auth.login entries from this run, none with a session id" if ok else "; ".join(problems[:6]))


# --- v1.6 drivers, the module pages as the operator drew them (FRAGO 06). ---

SCORE_SENTENCE_RE = r"(\d+)% \((\d+) of (\d+) on time(?:, (\d+) late)?\)"
SCORE_EMPTY = "No dated obligations yet"
SCORE_LABELS = ("On time", "Partly on time", "Behind", "Nothing dated yet")
TILE_KIND_ORDER = ["retention", "register", "policy", "file", "link"]
COUNTER_BASIS_RE = (r"(From the request log, as at .+\.|Reported by MITMARK on .+\."
                    r"|Reported by MITMARK in the monthly figures\. Nothing reported yet\.)")


def _score_problem(sentence):
    """None when a module score sentence is well formed and adds up, else
    what is wrong. On time counts in full and a late one between 50 and 70
    per cent, so the percentage must sit inside that band."""
    if sentence == SCORE_EMPTY:
        return None
    m = re.fullmatch(SCORE_SENTENCE_RE, sentence or "")
    if not m:
        return f"score reads '{sentence}'"
    pct, on_time, total = int(m.group(1)), int(m.group(2)), int(m.group(3))
    late = int(m.group(4) or 0)
    if total == 0 or on_time + late > total:
        return f"'{sentence}' is not a real fraction"
    low = 100.0 * (on_time + 0.5 * late) / total
    high = 100.0 * (on_time + 0.7 * late) / total
    if not (low - 1 <= pct <= high + 1):
        return f"'{sentence}': {pct}% outside {low:.0f} to {high:.0f}"
    return None


def _load_tracker_documents(cfg):
    """The register list, read from the shared source: key, title, area,
    aliases and alsoAreas for each entry."""
    src = (cfg["root"] / TASK_COLUMNS_SOURCE).read_text(encoding="utf-8")
    m = re.search(r"export const TRACKER_DOCUMENTS[^=]*=\s*\[(.*?)\n\];", src, re.S)
    if not m:
        return []
    out = []
    for entry in re.finditer(r"\{\s*key:.*?\}", m.group(1), re.S):
        e = entry.group(0)
        title = re.search(r'title:\s*"([^"]+)"', e)
        area = re.search(r"area:\s*(\d+)", e)
        aliases = re.search(r"aliases:\s*\[([^\]]*)\]", e)
        also = re.search(r"alsoAreas:\s*\[([^\]]*)\]", e)
        if title and area:
            out.append({
                "title": title.group(1),
                "area": int(area.group(1)),
                "aliases": re.findall(r'"([^"]+)"', aliases.group(1)) if aliases else [],
                "alsoAreas": [int(x) for x in re.findall(r"\d+", also.group(1))] if also else [],
            })
    return out


def drv_module_page_sections(page, cfg, line, res, errors):
    """Line 26, rewritten at v1.6 (FRAGO 06 section 3.1): every module page
    has the seven sections in order: name and introduction; Useful links;
    Compliance status; Compliance journey; Counters (modules 5 to 8 only);
    Jobs; then what the law asks, how we do it and history. The status reads
    "{pct}% ({n} of {m} on time[, {k} late])" or "No dated obligations yet",
    adds up under the 3.6 rule, carries its label in words and its basis in
    text and on hover, and matches the module's tile on the tracker."""
    settle_ms = line.get("settle_ms", 400)
    expected = _load_tracker_areas(cfg)
    if not expected:
        return False, f"could not read AREAS from {TASK_COLUMNS_SOURCE}"

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    if not _enter_view(page, "tracker", None, settle_ms, cfg, "client"):
        return False, "the client tracker view was not reachable"
    if not _wait_for(page, "[data-testid='module-tile-count']", 6000):
        return False, "module tile scores not found on the tracker"
    counts = page.locator("[data-testid='module-tile-count']")
    tile_scores = [_text(counts.nth(i)) for i in range(counts.count())]

    problems = []
    for i, name in enumerate(expected):
        area = i + 1
        label = f"module {area}"
        if not _enter_area_page(page, cfg, settle_ms, i):
            problems.append(f"{label}: not reachable")
            continue
        h1s = page.locator("h1")
        if h1s.count() == 0 or _text(h1s.first) != name:
            problems.append(f"{label}: h1 '{_text(h1s.first) if h1s.count() else ''}'")
        intro = page.locator("[data-testid='module-intro']")
        if intro.count() == 0 or not _text(intro.first):
            problems.append(f"{label}: introduction missing or empty")

        score = page.locator("[data-testid='module-score']")
        sentence = _text(score.first) if score.count() else ""
        bad = _score_problem(sentence)
        if bad:
            problems.append(f"{label}: {bad}")
        if i < len(tile_scores) and tile_scores[i] != sentence:
            problems.append(f"{label}: page says '{sentence}', tile says '{tile_scores[i]}'")
        prog = page.locator("[data-testid='module-progress']")
        ptext = _text(prog.first) if prog.count() else ""
        if not any(lbl in ptext for lbl in SCORE_LABELS):
            problems.append(f"{label}: no score label in words beside the status")
        basis = page.locator("[data-testid='module-score-basis']")
        if basis.count() == 0 or not _text(basis.first):
            problems.append(f"{label}: no basis in text beneath the status")
        card = page.locator("[data-testid='module-progress-card']")
        if card.count() == 0 or not (card.first.get_attribute("title") or "").strip():
            problems.append(f"{label}: no basis on hover")

        counters = page.locator("[data-testid='module-counters']").count()
        if area >= 5 and counters == 0:
            problems.append(f"{label}: counters missing")
        if area < 5 and counters > 0:
            problems.append(f"{label}: counters shown on a module without them")

        table = ("[data-testid='task-table']" if page.locator("[data-testid='task-table']").count()
                 else "[data-testid='task-cards']")
        if page.locator(f"[data-testid='module-jobs'] {table}").count() == 0:
            problems.append(f"{label}: the six-question table is not inside Jobs")
        order = ["h1", "[data-testid='module-intro']", "[data-testid='module-links']",
                 "[data-testid='module-progress']", "[data-testid='module-journey']"]
        if area >= 5:
            order.append("[data-testid='module-counters']")
        order += ["[data-testid='module-jobs']", "[data-testid='obligation']", "#how-we-do-it",
                  "[data-testid='module-history']", "[data-testid='module-nav']"]
        order_ok, order_detail = _dom_order(page, order)
        if not order_ok:
            problems.append(f"{label}: order: {order_detail}")

    ok = not problems
    return ok, (f"{len(expected)} module pages carry the seven sections in order; each score adds up "
                "and matches its tile" if ok else "; ".join(problems[:6]))


def drv_module_useful_links(page, cfg, line, res, errors):
    """Line 52 (new at v1.6, FRAGO 06 3.1 item 2, 3.2 and 3.4): on every
    module page, Useful links shows its tiles in the order retention,
    registers, policies, other filed items, links, and the same items as a
    numbered list beneath. Every tile opens something: a download or link
    answers 200 or a redirect, a policy opens the policy panel, a register
    not yet filed or a retention category opens its card showing the tile's
    detail. Module 2 carries the operator's five registers, each by its
    title or one of its aliases."""
    settle_ms = line.get("settle_ms", 400)
    expected = _load_tracker_areas(cfg)
    registers = _load_tracker_documents(cfg)
    if not expected or not registers:
        return False, f"could not read AREAS or TRACKER_DOCUMENTS from {TASK_COLUMNS_SOURCE}"
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"

    problems = []
    opened = {"download": 0, "card": 0, "policy": 0}
    for i in range(len(expected)):
        area = i + 1
        label = f"module {area}"
        if not _enter_area_page(page, cfg, settle_ms, i):
            problems.append(f"{label}: not reachable")
            continue
        links = page.locator("[data-testid='module-links']")
        if links.count() == 0:
            problems.append(f"{label}: Useful links missing")
            continue
        tiles = links.first.locator("[data-testid='module-link-tile']")
        items = links.first.locator("[data-testid='module-doc-item']")
        n = tiles.count()
        if n == 0:
            empty = links.first.locator("[data-testid='module-documents-empty']")
            if empty.count() == 0:
                problems.append(f"{label}: no tile and no empty state")
            continue
        if items.count() != n:
            problems.append(f"{label}: {n} tiles but {items.count()} items in the numbered list")
        kinds = [tiles.nth(j).get_attribute("data-kind") or "" for j in range(n)]
        ranks = [TILE_KIND_ORDER.index(k) if k in TILE_KIND_ORDER else -1 for k in kinds]
        if -1 in ranks or ranks != sorted(ranks):
            problems.append(f"{label}: tile order {kinds}")
        titles = [_text(tiles.nth(j).locator("span").nth(1)) for j in range(n)]
        for reg in registers:
            if reg["area"] != area and area not in reg["alsoAreas"]:
                continue
            names = [reg["title"].lower()] + [a.lower() for a in reg["aliases"]]
            if not any(t.lower() in names for t, k in zip(titles, kinds) if k == "register"):
                problems.append(f"{label}: register '{reg['title']}' has no tile")

        for j in range(n):
            tile = tiles.nth(j)
            opens = tile.get_attribute("data-opens") or ""
            what = f"{label} tile {j + 1} ({kinds[j]})"
            if opens == "download":
                href = tile.get_attribute("href") or ""
                if tile.evaluate("e => e.tagName.toLowerCase()") != "a" or "/api/tracker/documents/" not in href:
                    problems.append(f"{what}: download tile with href '{href}'")
                    continue
                try:
                    r = page.request.get(cfg["_target"].rstrip("/") + href if href.startswith("/") else href,
                                         max_redirects=0)
                    if r.status not in (200, 301, 302, 303, 307, 308):
                        problems.append(f"{what}: opens to {r.status}")
                    else:
                        opened["download"] += 1
                except Exception as exc:
                    problems.append(f"{what}: {type(exc).__name__}")
            elif opens == "card":
                detail = tile.locator("[data-testid='module-tile-detail']")
                want = _text(detail.first) if detail.count() else ""
                tile.click()
                page.wait_for_timeout(150)
                card = page.locator("[data-testid='module-tile-card-detail']")
                got = _text(card.first) if card.count() else None
                if got is None or got != want:
                    problems.append(f"{what}: card shows '{got}', tile says '{want}'")
                else:
                    opened["card"] += 1
                if page.locator("[data-testid='module-tile-card']").count():
                    tile.click()
                    page.wait_for_timeout(100)
            elif opens == "policy":
                tile.click()
                if not _wait_for(page, "[data-testid='policy-panel']", 5000):
                    problems.append(f"{what}: the policy panel did not open")
                else:
                    opened["policy"] += 1
                    page.locator("[data-testid='policy-panel-close']").first.click()
                    page.wait_for_timeout(150)
            else:
                problems.append(f"{what}: data-opens '{opens}'")

    ok = not problems
    return ok, (f"every tile opens: {opened['download']} downloads or links, {opened['card']} cards, "
                f"{opened['policy']} policies; order and module 2's registers as the order"
                if ok else "; ".join(problems[:6]))


def drv_module_milestones(page, cfg, line, res, errors):
    """Line 53 (new at v1.6, FRAGO 06 3.1 item 4): the compliance journey on
    each module is its dated tasks and nothing else: as many milestones as
    dated tasks up to six, each one a dated task of that module with the
    same date, oldest first, done exactly when the task is done, at most one
    marked next; "No dated milestones yet." when there are none. Read from
    the client's own API and matched against the rendered page."""
    settle_ms = line.get("settle_ms", 400)
    expected = _load_tracker_areas(cfg)
    try:
        client = _ApiSeat(cfg, "client")
    except RuntimeError as exc:
        return False, str(exc)
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"

    problems = []
    total = 0
    for i in range(len(expected)):
        area = i + 1
        label = f"module {area}"
        s, body = client.call("GET", f"/tracker/areas/{area}")
        if s != 200 or not isinstance(body, dict):
            problems.append(f"{label}: API returned {s}")
            continue
        tasks = {t["id"]: t for t in body.get("tasks") or []}
        dated = [t for t in tasks.values() if t.get("dueAt") and t.get("status") != "not_applicable"]
        ms = body.get("milestones") or []
        total += len(ms)
        if len(ms) != min(6, len(dated)):
            problems.append(f"{label}: {len(ms)} milestones for {len(dated)} dated tasks")
        dates = [m.get("dueAt") for m in ms]
        if dates != sorted(dates):
            problems.append(f"{label}: milestones not oldest first")
        if sum(1 for m in ms if m.get("state") in ("next", "overdue")) > 1:
            problems.append(f"{label}: more than one next milestone")
        for m in ms:
            t = tasks.get(m.get("taskId"))
            if not t or t.get("dueAt") != m.get("dueAt") or t.get("title") != m.get("title"):
                problems.append(f"{label}: milestone '{m.get('title')}' is not one of the module's dated tasks")
                break
            if (m.get("state") == "done") != (t.get("status") == "done"):
                problems.append(f"{label}: '{m.get('title')}' state {m.get('state')}, task {t.get('status')}")
                break

        if not _enter_area_page(page, cfg, settle_ms, i):
            problems.append(f"{label}: page not reachable")
            continue
        drawn = page.locator("[data-testid='module-milestone']")
        if drawn.count() != len(ms):
            problems.append(f"{label}: page draws {drawn.count()} milestones, API has {len(ms)}")
        elif ms:
            titles = [_text(drawn.nth(j).locator("[data-testid='module-milestone-title']")) for j in range(drawn.count())]
            if titles != [m.get("title") for m in ms]:
                problems.append(f"{label}: drawn titles differ from the API's")
        else:
            empty = page.locator("[data-testid='module-journey-empty']")
            if empty.count() == 0 or _text(empty.first) != "No dated milestones yet.":
                problems.append(f"{label}: no milestones and no 'No dated milestones yet.'")

    ok = not problems
    return ok, (f"{total} milestones across {len(expected)} modules, each a dated task, drawn as the API has them"
                if ok else "; ".join(problems[:6]))


def drv_module_counters(page, cfg, line, res, errors):
    """Line 54 (new at v1.6, FRAGO 06 3.3): modules 5 to 8 carry counters and
    modules 1 to 4 none. Every counter group states its basis ("From the
    request log, as at ..." for records, "Reported by MITMARK on ..." for the
    operator's figures), and an empty group shows "No data yet", never a
    zero. Checked on the page and in the client's API."""
    settle_ms = line.get("settle_ms", 400)
    expected = _load_tracker_areas(cfg)
    try:
        client = _ApiSeat(cfg, "client")
    except RuntimeError as exc:
        return False, str(exc)
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"

    problems = []
    groups_seen = 0
    for i in range(len(expected)):
        area = i + 1
        label = f"module {area}"
        s, body = client.call("GET", f"/tracker/areas/{area}")
        api_groups = (body or {}).get("counters") or [] if s == 200 else None
        if api_groups is None:
            problems.append(f"{label}: API returned {s}")
            continue
        if (area >= 5) != bool(api_groups):
            problems.append(f"{label}: {len(api_groups)} counter groups in the API")
        for g in api_groups:
            if not re.fullmatch(COUNTER_BASIS_RE, g.get("basis") or ""):
                problems.append(f"{label}: basis '{g.get('basis')}'")
            if g.get("source") == "records" and not (g.get("basis") or "").startswith("From the request log"):
                problems.append(f"{label}: a records group without the request-log basis")
            if g.get("source") == "operator" and g.get("noData") and any(
                    it.get("value") is not None for it in g.get("items") or []):
                problems.append(f"{label}: an empty operator group carries a value")

        if not _enter_area_page(page, cfg, settle_ms, i):
            problems.append(f"{label}: page not reachable")
            continue
        groups = page.locator("[data-testid='counter-group']")
        if groups.count() != len(api_groups):
            problems.append(f"{label}: page shows {groups.count()} groups, API {len(api_groups)}")
            continue
        for j in range(groups.count()):
            g = groups.nth(j)
            groups_seen += 1
            basis = g.locator("[data-testid='counter-basis']")
            if basis.count() == 0 or not re.fullmatch(COUNTER_BASIS_RE, _text(basis.first)):
                problems.append(f"{label} group {j + 1}: basis on the page '{_text(basis.first) if basis.count() else ''}'")
            if g.get_attribute("data-nodata") == "true":
                if g.locator("[data-testid='counter-nodata']").count() == 0 or g.locator("[data-testid='counter-item']").count():
                    problems.append(f"{label} group {j + 1}: empty but not shown as 'No data yet'")

    ok = not problems
    return ok, (f"{groups_seen} counter groups on modules 5 to 8, each with its basis; none on 1 to 4"
                if ok else "; ".join(problems[:6]))


def drv_figures_operator_only(page, cfg, line, res, errors):
    """Line 55 (new at v1.6, FRAGO 06 3.3 and 3.2): the Figures form and the
    retention schedule editor are the operator's alone. The client seat is
    refused on the figures routes and on settings, and in the browser the
    client never reaches the Figures page. On the gate's own organisation the
    operator reports a figure: the client's module page then shows it with
    "Reported by MITMARK on ..." and leaves an unreported count as no data,
    and never carries who entered it."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    problems = []
    try:
        demo_client = _ApiSeat(cfg, "client")
        operator = _ApiSeat(cfg, "admin")
    except RuntimeError as exc:
        return False, str(exc)
    demo = _user_org(demo_client.user) or _preview_org_id(operator)
    for method, path, body in (
        ("GET", f"/admin/figures?org={demo}", None),
        ("PUT", f"/admin/figures/5?org={demo}", {"groups": {"dpia": {"total": 1}}}),
        ("PUT", f"/admin/settings?org={demo}", {"retentionSchedule": {"3": []}}),
    ):
        s, _ = demo_client.call(method, path, body)
        if s not in (401, 403):
            problems.append(f"client {method} {path.split('?')[0]} returned {s}")

    seat = None
    try:
        seat, gid = _gate_client_seat(cfg, operator)
        s, _ = operator.call("PUT", f"/admin/figures/8?org={gid}", {"groups": {"incidents": {"total": 2, "open": 1}}})
        if s != 200:
            problems.append(f"operator PUT figures returned {s}")
        s, page_body = seat.call("GET", "/tracker/areas/8")
        groups = {g.get("key"): g for g in (page_body or {}).get("counters") or []}
        inc = groups.get("incidents")
        if not inc or inc.get("noData") or not (inc.get("basis") or "").startswith("Reported by MITMARK on "):
            problems.append(f"client sees incidents as {inc}")
        else:
            values = {it["key"]: it["value"] for it in inc.get("items") or []}
            if values.get("total") != 2 or values.get("severity_high") is not None:
                problems.append(f"incident values {values}")
        if operator.user and operator.user.get("id") and operator.user["id"] in json.dumps(page_body):
            problems.append("the client's page carries the operator's id")
    except RuntimeError as exc:
        problems.append(str(exc))
    finally:
        _safe_disable(cfg, operator)

    if _ensure_role(page, cfg, "client", cfg["_target"]):
        page.goto(cfg["_target"].rstrip("/") + "/admin/figures")
        page.wait_for_timeout(line.get("settle_ms", 400) + 600)
        if page.locator("[data-testid='figures-form']").count() or page.locator("[data-testid='retention-editor']").count():
            problems.append("the client's browser reached the Figures form")
    else:
        problems.append("could not sign in as the client in the browser")

    ok = not problems
    return ok, ("client refused on figures and settings, and kept out in the browser; a reported figure "
                "reaches the client with its date and without the operator's id" if ok
                else "; ".join(problems[:6]))


def drv_register_aliases_resolve(page, cfg, line, res, errors):
    """Line 57 (new at v1.6, FRAGO 06 3.4): a register filed under one of
    its old names still fills its slot. On the gate's organisation a
    register is filed as "Vendor list" (the old name of the Vendor log); the
    client then sees it filed in the Vendor log's place on Compliance
    Documents and as a filed register tile on modules 7 and 2, where the
    order puts the vendor log. The document is removed afterwards."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    problems = []
    try:
        operator = _ApiSeat(cfg, "admin")
        seat, gid = _gate_client_seat(cfg, operator)
    except RuntimeError as exc:
        return False, str(exc)
    doc_id = None
    try:
        s, body = operator.call("POST", f"/admin/documents?org={gid}", {
            "section": "trackers", "area": 7, "title": "Vendor list", "kind": "link",
            "url": "https://example.org/gate-vendor-list", "published": True,
        })
        doc_id = ((body or {}).get("document") or {}).get("id") or (body or {}).get("id")
        if s not in (200, 201) or not doc_id:
            return False, f"filing the register returned {s}"
        s, docs = seat.call("GET", "/tracker/documents")
        trackers = next((x for x in (docs or {}).get("sections") or [] if x.get("id") == "trackers"), {})
        ids = [it.get("id") for it in trackers.get("items") or []]
        if doc_id not in ids or "tracker-unfiled:vendor" in ids:
            problems.append("Compliance Documents does not put the aliased register in the Vendor log's place")
        for area in (7, 2):
            s, pg = seat.call("GET", f"/tracker/areas/{area}")
            tile = next((t for t in (pg or {}).get("tiles") or [] if t.get("ref") == doc_id), None)
            if not tile or tile.get("kind") != "register" or not tile.get("filed"):
                problems.append(f"module {area}: no filed register tile for it ({tile})")
            if any(t.get("id") == "register:vendor" for t in (pg or {}).get("tiles") or []):
                problems.append(f"module {area}: still shows the Vendor log as not yet filed")
    finally:
        if doc_id:
            operator.call("DELETE", f"/admin/documents/{doc_id}?org={gid}")
        _safe_disable(cfg, operator)
    ok = not problems
    return ok, ("'Vendor list' fills the Vendor log's slot on Documents and on modules 7 and 2" if ok
                else "; ".join(problems[:6]))


def drv_statement_three_parts(page, cfg, line, res, errors):
    """Line 56 (new at v1.6, FRAGO 06 3.5): the Statement reads in three
    parts, in order: the service (the twelve lines), what MITMARK has done,
    what comes next. The planned-against-achieved opener is gone and no text
    compares achievement with the handover or with obligations met."""
    settle_ms = line.get("settle_ms", 400)
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    page.goto(cfg["_target"].rstrip("/") + "/value/statement")
    if not _wait_for(page, "[data-testid='statement']", 8000):
        return False, "the Statement did not render"
    page.wait_for_timeout(settle_ms)
    problems = []
    order_ok, detail = _dom_order(page, ["[data-testid='statement-service']", "[data-testid='statement-done']",
                                         "[data-testid='statement-next']"])
    if not order_ok:
        problems.append(f"parts: {detail}")
    # v1.7 (FRAGO 07 3.4): the service is the eight modules.
    modules = page.locator("[data-testid='statement-module']").count()
    if modules != 8:
        problems.append(f"{modules} modules in the service, expected 8")
    if page.locator("[data-testid='statement-obligations']").count():
        problems.append("the obligations opener is still there")
    text = _text(page.locator("[data-testid='statement']").first).lower()
    for phrase in ("handover", "planned versus", "against the plan"):
        if phrase in text:
            problems.append(f"the Statement says '{phrase}'")
    if re.search(r"\d+ of \d+ obligations met", text):
        problems.append("the Statement counts obligations met against the plan")
    ok = not problems
    return ok, ("the service, what MITMARK has done and what comes next, in order; no comparison" if ok
                else "; ".join(problems[:6]))


# =============================================================================
# v1.7 (FRAGO 07, the working programme). Lines 58 to 70.
#
# Every write goes to the gate's own organisation, through the gate's own
# seats (the gate client, and from v1.7 the gate test seat). Nothing is
# created in the demo organisation or in any real one. Documents the gate
# files are removed again; gate users are disabled at the end as before. The
# migrations are read in dry-run mode against every organisation, which
# writes nothing.
# =============================================================================

GATE_TEST_SEAT_EMAIL = "gate-test-seat@gate.invalid"
PREVIEW_SUBMIT_MESSAGE = "Read only in client view. The client submits requests from her own sign-in."
PREVIEW_CONFIRM_MESSAGE = "Read only in client view. The client confirms from her own sign-in."
PREVIEW_UPLOAD_MESSAGE = "Read only in client view. The client uploads documents from her own sign-in."
DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
GATE_DOC_PHRASE = "The gate visitor ledger is retained for twenty months and then shredded."


def _gate_docx_b64(heading="Gate ledger", paragraph=GATE_DOC_PHRASE):
    """A minimal .docx built here, so the gate needs no fixture file: an
    opening paragraph, then a heading with one paragraph under it. Quick
    questions reads it as two sections; the second is the heading's."""
    import base64
    import io
    import zipfile
    def p(t, style=""):
        ppr = f'<w:pPr><w:pStyle w:val="{style}"/></w:pPr>' if style else ""
        return f"<w:p>{ppr}<w:r><w:t>{t}</w:t></w:r></w:p>"
    xml = ('<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
           f"<w:body>{p('Gate document.')}{p(heading, 'Heading1')}{p(paragraph)}</w:body></w:document>")
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr("word/document.xml", xml)
    return base64.b64encode(buf.getvalue()).decode("ascii")


def _file_gate_doc(operator, gid, title, section="procedures", area=3, b64=None, file_name="gate-ledger.docx",
                   content_type=DOCX_TYPE, published=True):
    s, body = operator.call("POST", f"/admin/documents?org={gid}", {
        "section": section, "area": area, "title": title, "kind": "file", "published": published,
        "fileBase64": b64 or _gate_docx_b64(), "fileName": file_name, "contentType": content_type,
    })
    doc_id = (body or {}).get("id")
    if s != 201 or not doc_id:
        raise RuntimeError(f"filing a gate document returned {s}")
    return body


def _raw_get(seat, path, preview=None, follow=True):
    """GET returning (status, headers, bytes), for downloads."""
    import urllib.error
    import urllib.request
    req = urllib.request.Request(seat.base + path, method="GET")
    if preview is not None:
        req.add_header(PREVIEW_HEADER, f"client:{preview}")
    opener = seat.opener
    if not follow:
        class _NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *a, **k):
                return None
        opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(seat.jar), _NoRedirect)
    try:
        with opener.open(req, timeout=30) as resp:
            return resp.status, dict(resp.headers), resp.read()
    except urllib.error.HTTPError as exc:
        return exc.code, dict(exc.headers or {}), exc.read()


def _pending(operator, gid, type_=None):
    q = f"/admin/review?accountId={gid}" + (f"&type={type_}" if type_ else "")
    s, body = operator.call("GET", q)
    if not _ok(s, body):
        raise RuntimeError(f"GET {q} returned {s}")
    return body.get("items") or []


def _client_doc_ids(seat):
    s, body = seat.call("GET", "/tracker/documents")
    if not _ok(s, body):
        raise RuntimeError(f"GET /tracker/documents returned {s}")
    return [i.get("id") for sec in body.get("sections") or [] for i in sec.get("items") or []], body


def _submit_as(seat, title, area=None, supersedes=None, kind="file", category="tracker"):
    """v1.9 (FRAGO 09 3.2): the client sends a Category and never a module;
    `area` is sent only to prove it is refused."""
    payload = {"title": title, "note": "Gate submission, one line.", "kind": kind, "supersedes": supersedes}
    if category is not None:
        payload["category"] = category
    if area is not None:
        payload["area"] = area
    if kind == "file":
        payload.update({"fileBase64": _gate_docx_b64(), "fileName": "gate-submission.docx", "contentType": DOCX_TYPE})
    else:
        payload["url"] = "https://example.org/gate-submission"
    return seat.call("POST", "/tracker/documents", payload)


def _remove_gate_docs(operator, gid, prefix="Gate v1.7"):
    s, body = operator.call("GET", f"/admin/documents?org={gid}")
    for d in (body or {}).get("documents") or []:
        if str(d.get("title", "")).startswith(prefix):
            operator.call("DELETE", f"/admin/documents/{d['id']}?org={gid}")


def drv_documents_download(page, cfg, line, res, errors):
    """Line 58: the operator downloads every filed file (stored bytes, the
    original name and type) and a link redirects; each download is audited
    as document.download; the client downloads a published document and is
    refused an unpublished one."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    problems = []
    try:
        operator = _ApiSeat(cfg, "admin")
        seat, gid = _gate_client_seat(cfg, operator)
    except RuntimeError as exc:
        return False, str(exc)
    try:
        pub = _file_gate_doc(operator, gid, "Gate v1.7 download", file_name="Gate ledger é.docx")
        hidden = _file_gate_doc(operator, gid, "Gate v1.7 unpublished", published=False)
        s, link = operator.call("POST", f"/admin/documents?org={gid}", {
            "section": "procedures", "area": 3, "title": "Gate v1.7 link", "kind": "link",
            "url": "https://example.org/gate-link", "published": True})
        before = len(_audit_entries(operator, f"/admin/audit?accountId={gid}&action=document.download"))
        st, hd, data = _raw_get(operator, f"/admin/documents/{pub['id']}/download?org={gid}")
        hd = {k.lower(): v for k, v in hd.items()}
        if st != 200 or hd.get("content-type") != DOCX_TYPE or "filename*=UTF-8''Gate%20ledger%20%C3%A9.docx" not in hd.get("content-disposition", ""):
            problems.append(f"operator file download: {st} {hd.get('content-type')} {hd.get('content-disposition')}")
        if len(data) != pub.get("sizeBytes"):
            problems.append(f"downloaded {len(data)} bytes, filed {pub.get('sizeBytes')}")
        st, hd, _ = _raw_get(operator, f"/admin/documents/{(link or {}).get('id')}/download?org={gid}", follow=False)
        if st != 302:
            problems.append(f"operator link download: {st}, expected a redirect")
        after = len(_audit_entries(operator, f"/admin/audit?accountId={gid}&action=document.download"))
        if after - before != 2:
            problems.append(f"{after - before} document.download audit entries, expected 2")
        st, _, data = _raw_get(seat, f"/tracker/documents/{pub['id']}/download")
        if st != 200 or len(data) != pub.get("sizeBytes"):
            problems.append(f"client download of a published file: {st}")
        st, _, _ = _raw_get(seat, f"/tracker/documents/{hidden['id']}/download")
        if st != 404:
            problems.append(f"client download of an unpublished file: {st}, expected 404")
    except RuntimeError as exc:
        problems.append(str(exc))
    finally:
        _remove_gate_docs(operator, gid)
        _safe_disable(cfg, operator)
    ok = not problems
    return ok, ("operator downloads file (name, type, bytes) and link, each audited; client gets published, not unpublished"
                if ok else "; ".join(problems[:6]))


def drv_client_upload_queue(page, cfg, line, res, errors):
    """Line 59: a client upload lands in the review queue and is not visible
    as published nor counted until accepted; a return with its reason reaches
    the client; an acceptance publishes it under the section the operator
    chose; a superseding upload keeps the earlier version's history. The
    queue states working days waited and flags amber at five."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    problems = []
    try:
        operator = _ApiSeat(cfg, "admin")
        seat, gid = _gate_client_seat(cfg, operator)
    except RuntimeError as exc:
        return False, str(exc)
    try:
        area_before = seat.call("GET", "/tracker/areas/3")[1] or {}
        s, b = _submit_as(seat, "Gate v1.7 first")
        if s != 201 or (b or {}).get("stateLabel") != "Submitted, awaiting MITMARK review":
            return False, f"client upload returned {s} {b}"
        first_id = b["id"]
        s, b2 = _submit_as(seat, "Gate v1.7 returned", kind="link")
        second_id = (b2 or {}).get("id")

        ids, docs = _client_doc_ids(seat)
        if first_id in ids or second_id in ids:
            problems.append("a submission is listed in a section before acceptance")
        subs = {x.get("id"): x for x in docs.get("submissions") or []}
        if (subs.get(first_id) or {}).get("state") != "submitted":
            problems.append("the client does not see her submission as awaiting review")
        if _raw_get(seat, f"/tracker/documents/{first_id}/download")[0] != 404:
            problems.append("a submission downloads before acceptance")
        area_now = seat.call("GET", "/tracker/areas/3")[1] or {}
        if len(area_now.get("tiles") or []) != len(area_before.get("tiles") or []) or \
                len(area_now.get("documents") or []) != len(area_before.get("documents") or []):
            problems.append("module 3's tiles or documents changed before acceptance (counted)")

        items = {i["context"].get("documentId"): i for i in _pending(operator, gid, "document_submission")}
        it1, it2 = items.get(first_id), items.get(second_id)
        if not it1 or not it2:
            return False, "the submissions are not in the operator's review queue"
        for it in (it1, it2):
            wd = it.get("workingDaysWaiting")
            if not isinstance(wd, int) or it.get("overdue") is not (wd >= 5):
                problems.append(f"queue item {it['id']}: workingDaysWaiting {wd}, overdue {it.get('overdue')}")

        s, _ = operator.call("POST", f"/admin/review/{it2['id']}/return-document", {"reason": "Gate: send the signed copy."})
        s1, _ = operator.call("POST", f"/admin/review/{it1['id']}/accept-document", {"section": "trackers", "area": 3})
        if s != 200 or s1 != 200:
            problems.append(f"return {s}, accept {s1}")
        ids, docs = _client_doc_ids(seat)
        subs = {x.get("id"): x for x in docs.get("submissions") or []}
        trackers = next((x for x in docs.get("sections") or [] if x.get("id") == "trackers"), {})
        if first_id not in [i.get("id") for i in trackers.get("items") or []]:
            problems.append("the accepted document is not published under the chosen section")
        if (subs.get(second_id) or {}).get("returnReason") != "Gate: send the signed copy." or second_id in ids:
            problems.append("the return and its reason did not reach the client, or it was published")

        s, b3 = _submit_as(seat, "Gate v1.7 second version", supersedes=first_id)
        third_id = (b3 or {}).get("id")
        it3 = next((i for i in _pending(operator, gid, "document_submission")
                    if i["context"].get("documentId") == third_id), None)
        if not it3 or it3["context"].get("supersedesTitle") != "Gate v1.7 first":
            problems.append("the new version's queue item does not name the version it supersedes")
        else:
            operator.call("POST", f"/admin/review/{it3['id']}/accept-document", {"section": "trackers", "area": 3})
        ids, _ = _client_doc_ids(seat)
        if third_id not in ids or first_id in ids:
            problems.append("after acceptance the new version does not replace the earlier one for the client")
        s, body = operator.call("GET", f"/admin/documents?org={gid}")
        earlier = next((d for d in (body or {}).get("documents") or [] if d.get("id") == first_id), None)
        if not earlier or earlier.get("supersededBy") != third_id:
            problems.append("the earlier version is not kept with its supersededBy history")
    except RuntimeError as exc:
        problems.append(str(exc))
    finally:
        _remove_gate_docs(operator, gid)
        _safe_disable(cfg, operator)
    ok = not problems
    return ok, ("queued, unpublished and uncounted until accepted; return reason reaches the client; accept publishes "
                "under the chosen section; supersede keeps history; working days and amber flag stated"
                if ok else "; ".join(problems[:6]))


def drv_documents_pages(page, cfg, line, res, errors):
    """Line 60: in the browser, the operator's Documents page has a download
    control per filed item opening in a new tab; the client's Documents page
    has the upload form and her submissions; in client view the form is
    disabled with the stated message."""
    settle_ms = line.get("settle_ms", 500)
    problems = []
    if not _ensure_role(page, cfg, "admin", cfg["_target"]):
        return False, "could not sign in as the operator"
    try:
        operator = _ApiSeat(cfg, "admin")
        org, _ = _gate_org(operator)
        _file_gate_doc(operator, org["id"], "Gate v1.7 page")
        _select_org(page, GATE_ORG_NAME, settle_ms)
        page.goto(cfg["_target"].rstrip("/") + "/admin/documents")
        if not _wait_for(page, "[data-testid='admin-doc-download']", 8000):
            problems.append("operator Documents: no admin-doc-download control")
        else:
            a = page.locator("[data-testid='admin-doc-download']").first
            href, tgt = a.get_attribute("href") or "", a.get_attribute("target")
            if "/api/admin/documents/" not in href or "/download" not in href or f"org={org['id']}" not in href or tgt != "_blank":
                problems.append(f"operator download control: href '{href}', target '{tgt}'")
    finally:
        _pin_demo_org(page, cfg)
        _remove_gate_docs(operator, org["id"])
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    page.goto(cfg["_target"].rstrip("/") + "/documents")
    if not _wait_for(page, "[data-testid='client-upload-form']", 8000):
        problems.append("client Documents: no upload form")
    else:
        for name in ("title", "category", "note"):
            if page.locator(f"[data-testid='client-upload-form'] [name='{name}']").count() == 0:
                problems.append(f"upload form has no '{name}' field")
        if page.locator("[data-testid='client-upload-submit']").count() == 0:
            problems.append("upload form has no submit control")
    if not _sign_in(page, cfg, "admin", cfg["_target"]):
        return False, "could not sign in as the operator"
    if not _enter_view(page, "client-view", None, settle_ms, cfg, "admin"):
        return False, "admin nav item data-view='client-view' not found"
    page.goto(cfg["_target"].rstrip("/") + "/documents")
    if not _wait_for(page, "[data-testid='client-upload-readonly']", 8000):
        problems.append("client view: no read-only line on the upload form")
    else:
        if _text(page.locator("[data-testid='client-upload-readonly']").first) != PREVIEW_UPLOAD_MESSAGE:
            problems.append("client view: upload read-only line wording")
        if page.locator("[data-testid='client-upload-submit']").first.is_enabled():
            problems.append("client view: upload submit enabled")
    _leave_client_view(page, settle_ms)
    ok = not problems
    return ok, ("operator download opens in a new tab; client upload form present; disabled in client view with the stated line"
                if ok else "; ".join(problems[:6]))


def _leave_client_view(page, settle_ms):
    ret = page.locator("[data-testid='client-view-return']")
    if ret.count():
        ret.first.click()
        page.wait_for_timeout(settle_ms * 2)


def drv_operator_board_drag(page, cfg, line, res, errors):
    """Line 61: on the operator's Job management board a card dragged to
    another column changes the task's status, writes the audit entry and
    moves the client's tracker; Completed dates it today; the status select
    is the keyboard equivalent. Run on the gate organisation, at the first
    resolution only, and the task is put back afterwards."""
    if res["name"] != line.get("applies_to", [res["name"]])[0]:
        return True, "drag runs once, at the first resolution"
    settle_ms = line.get("settle_ms", 700)
    problems = []
    if not _ensure_role(page, cfg, "admin", cfg["_target"]):
        return False, "could not sign in as the operator"
    operator = _ApiSeat(cfg, "admin")
    seat, gid = _gate_client_seat(cfg, operator)
    task_id, original = None, None
    try:
        s, body = operator.call("GET", f"/admin/workplan?org={gid}")
        tasks = (body or {}).get("tasks") or []
        pick = next((t for t in tasks if t.get("status") == "not_started"), None)
        if not pick:
            return False, "the gate organisation has no not-started task to drag"
        task_id, original = pick["id"], pick["status"]
        home_before = (seat.call("GET", "/tracker/jobs")[1] or {})
        _select_org(page, GATE_ORG_NAME, settle_ms)
        page.goto(cfg["_target"].rstrip("/") + "/admin/jobs")
        if not _wait_for(page, "[data-testid='admin-board']", 8000):
            return False, "no admin-board on /admin/jobs"
        card = f"[data-testid='board-card'][data-task-id='{task_id}']"
        target = "[data-testid='board-column'][data-group='in_progress']"
        if page.locator(card).count() == 0:
            return False, "the task's card is not on the board"
        if page.locator(card).first.get_attribute("draggable") != "true":
            problems.append("the card is not draggable")
        audit_before = len(_audit_entries(operator, f"/admin/audit?accountId={gid}&action=workplan.edit"))
        page.drag_and_drop(card, target)
        page.wait_for_timeout(settle_ms * 3)
        s, body = operator.call("GET", f"/admin/workplan?org={gid}")
        now = next((t for t in (body or {}).get("tasks") or [] if t["id"] == task_id), {})
        if now.get("status") != "in_progress":
            problems.append(f"after the drop the status is {now.get('status')}, expected in_progress")
        if page.locator(f"{target} {card}").count() == 0:
            problems.append("the card is not in the In progress column after the drop")
        audits = _audit_entries(operator, f"/admin/audit?accountId={gid}&action=workplan.edit")
        if len(audits) <= audit_before or not any("Not started to In progress" in str(a.get("detail")) for a in audits):
            problems.append("no audit entry for the move")
        jobs_after = seat.call("GET", "/tracker/jobs")[1] or {}
        def group_of(j):
            for g in j.get("groups") or []:
                if any(t.get("id") == task_id for t in g.get("tasks") or []):
                    return g.get("id")
        if group_of(jobs_after) != "in_progress" or group_of(home_before) != "not_started":
            problems.append(f"the client's tracker did not follow ({group_of(home_before)} to {group_of(jobs_after)})")
        # Keyboard equivalent, to Completed: dated today.
        sel = page.locator(f"{card} [data-testid='card-status']")
        if sel.count() == 0:
            problems.append("no status select on the card")
        else:
            sel.first.select_option("done")
            page.wait_for_timeout(settle_ms * 3)
            s, body = operator.call("GET", f"/admin/workplan?org={gid}")
            now = next((t for t in (body or {}).get("tasks") or [] if t["id"] == task_id), {})
            today = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
            if now.get("status") != "done" or str(now.get("closedAt", ""))[:10] != today:
                problems.append(f"status select to Completed: {now.get('status')}, closed {now.get('closedAt')}")
    finally:
        if task_id:
            operator.call("PATCH", f"/admin/workplan/{task_id}?org={gid}", {"status": original})
        _pin_demo_org(page, cfg)
        _safe_disable(cfg, operator)
    ok = not problems
    return ok, ("drag moves status, audits it and moves the client's tracker; status select closes it dated today"
                if ok else "; ".join(problems[:6]))


def drv_no_drag_client_side(page, cfg, line, res, errors):
    """Line 62: no drag exists on the client's Job management or in client
    view, where the banner says so."""
    settle_ms = line.get("settle_ms", 500)
    problems = []
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    page.goto(cfg["_target"].rstrip("/") + "/jobs")
    page.wait_for_timeout(settle_ms * 2)
    if page.locator("[draggable='true']").count():
        problems.append("client Job management has draggable elements")
    if not _sign_in(page, cfg, "admin", cfg["_target"]):
        return False, "could not sign in as the operator"
    if not _enter_view(page, "client-view", None, settle_ms, cfg, "admin"):
        return False, "admin nav item data-view='client-view' not found"
    page.goto(cfg["_target"].rstrip("/") + "/jobs")
    page.wait_for_timeout(settle_ms * 2)
    if page.locator("[draggable='true']").count():
        problems.append("client view Job management has draggable elements")
    banner = _text(page.locator("[data-testid='client-view-banner']").first) if page.locator("[data-testid='client-view-banner']").count() else ""
    if "Cards cannot be dragged here." not in banner:
        problems.append("the client-view banner does not say cards cannot be dragged")
    _leave_client_view(page, settle_ms)
    ok = not problems
    return ok, "no draggable element for the client or in client view; the banner says so" if ok else "; ".join(problems)


def drv_ask_in_client_view(page, cfg, line, res, errors):
    """Line 63: Ask works in client view as a pure read (it answers; no
    thread, message, escalation, intake, clock or review item is created),
    and Submit request is refused with the stated message, in the API and on
    the page."""
    settle_ms = line.get("settle_ms", 500)
    problems = []
    operator = _ApiSeat(cfg, "admin")
    org = _preview_org_id(operator)
    if _api_only_once(line, res):
        def counts():
            q = len(_pending(operator, org))
            s, c = operator.call("GET", f"/admin/clocks?accountId={org}")
            t = operator.call("GET", "/chat/thread", preview=org)[1] or {}
            return q, len((c or {}).get("clocks") or []), len(t.get("messages") or [])
        before = counts()
        for q in ("What should I do if my laptop was stolen?", "How long do we keep CCTV recordings?"):
            s, body = operator.call("POST", "/chat/messages", {"body": q}, preview=org)
            msgs = (body or {}).get("messages") or []
            if s != 200 or not (body or {}).get("preview") or len(msgs) != 2 or not msgs[1].get("body"):
                problems.append(f"Ask in client view: {s}")
        after = counts()
        if after != before:
            problems.append(f"Ask in client view wrote something: queue, clocks, thread {before} to {after}")
        s, body = operator.call("POST", "/requests", {"type": "data_request", "details": "gate"}, preview=org)
        if s != 403 or (body or {}).get("error") != PREVIEW_SUBMIT_MESSAGE:
            problems.append(f"Submit request in client view: {s} '{(body or {}).get('error')}'")
    if not _sign_in(page, cfg, "admin", cfg["_target"]):
        return False, "could not sign in as the operator"
    if not _enter_view(page, "client-view", None, settle_ms, cfg, "admin"):
        return False, "admin nav item data-view='client-view' not found"
    if _enter_view(page, "guide", None, settle_ms):
        page.fill("input[aria-label='Ask a quick question']", "How long do we keep CCTV recordings?")
        ask = page.locator("button[type='submit']").filter(has_text=re.compile(r"^\s*Ask\s*$"))
        if ask.count() == 0 or not ask.first.is_enabled():
            problems.append("Ask is not enabled in client view")
    else:
        problems.append("guide: client nav item missing in client view")
    if _enter_view(page, "request", None, settle_ms):
        _wait_for(page, "[data-testid='request-readonly']", 8000)
        ro = page.locator("[data-testid='request-readonly']")
        if ro.count() == 0 or _text(ro.first) != PREVIEW_SUBMIT_MESSAGE:
            problems.append("request: the stated read-only line is missing or worded differently")
        raise_btn = page.locator("button").filter(has_text=re.compile(r"^\s*Raise a request\s*$"))
        if raise_btn.count():
            raise_btn.first.click()
            page.wait_for_timeout(settle_ms)
            sub = page.locator("button").filter(has_text=re.compile(r"^\s*Submit request\s*$"))
            if sub.count() == 0 or sub.first.is_enabled():
                problems.append("request form: Submit request missing or enabled in client view")
            ro2 = page.locator("[data-testid='request-readonly-form']")
            if ro2.count() == 0 or _text(ro2.first) != PREVIEW_SUBMIT_MESSAGE:
                problems.append("request form: the stated read-only line is missing")
            page.keyboard.press("Escape")
        else:
            problems.append("request: no Raise a request control")
    _leave_client_view(page, settle_ms)
    ok = not problems
    return ok, ("Ask answers in client view and writes nothing; Submit request refused with the stated message"
                if ok else "; ".join(problems[:6]))


def _gate_test_seat(cfg, operator, gid):
    """Find or create the gate organisation's test seat, past its first
    sign-in. Returns (seat, user)."""
    u = _find_user(operator, GATE_TEST_SEAT_EMAIL)
    if u is None:
        s, body = operator.call("POST", "/admin/users", {"email": GATE_TEST_SEAT_EMAIL, "role": "client",
                                                          "orgId": gid, "testSeat": True, "displayName": "Gate test seat"})
        if s != 201:
            raise RuntimeError(f"creating the gate test seat returned {s} {body}")
    seat, user, _ = _gate_seat(cfg, operator, GATE_TEST_SEAT_EMAIL, "client", gid)
    return seat, user


def drv_test_seat_excluded(page, cfg, line, res, errors):
    """Line 64: a test seat's writes are tagged test and kept out of the
    Record, the counters and the Statement; the client never sees them; one
    active test seat per organisation; the flag shows on the Users page's
    data and in the audit."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    problems = []
    try:
        operator = _ApiSeat(cfg, "admin")
        client, gid = _gate_client_seat(cfg, operator)
        tseat, tuser = _gate_test_seat(cfg, operator, gid)
    except RuntimeError as exc:
        return False, str(exc)
    try:
        u = _find_user(operator, GATE_TEST_SEAT_EMAIL) or {}
        if not u.get("testSeat"):
            problems.append("the Users list does not flag the test seat")
        s, _ = operator.call("POST", "/admin/users", {"email": "gate-second-seat@gate.invalid", "role": "client",
                                                       "orgId": gid, "testSeat": True})
        if s != 409:
            problems.append(f"a second active test seat was not refused ({s})")
        rec_before = operator.call("GET", f"/admin/record?org={gid}")[1] or {}
        stmt_before = client.call("GET", "/value/statement")[1] or {}
        home_before = client.call("GET", "/tracker/home")[1] or {}
        area6_before = client.call("GET", "/tracker/areas/6")[1] or {}
        s, body = tseat.call("POST", "/requests", {"type": "data_request", "details": "Gate test seat request"})
        clock_id = (body or {}).get("clockId")
        if s != 201 or not clock_id:
            return False, f"test seat request returned {s}"
        c_list = client.call("GET", "/clocks")[1] or {}
        if any(c.get("id") == clock_id for c in (c_list.get("active") or []) + (c_list.get("closed") or [])):
            problems.append("the client sees the test seat's request")
        s, adm = operator.call("GET", f"/admin/clocks?accountId={gid}")
        row = next((c for c in (adm or {}).get("clocks") or [] if c.get("id") == clock_id), {})
        if not row.get("test"):
            problems.append("the operator's clock list does not tag the request test")
        s, _ = operator.call("POST", f"/admin/clocks/{clock_id}/close", {"outcome": "Gate test seat close.", "insideStatute": True})
        if s != 200:
            problems.append(f"closing the test clock returned {s}")
        rec_after = operator.call("GET", f"/admin/record?org={gid}")[1] or {}
        stmt_after = client.call("GET", "/value/statement")[1] or {}
        home_after = client.call("GET", "/tracker/home")[1] or {}
        area6_after = client.call("GET", "/tracker/areas/6")[1] or {}
        if len(rec_after.get("entries") or []) != len(rec_before.get("entries") or []):
            problems.append("closing the test clock booked a Record entry")
        if (stmt_after.get("totals") or {}) != (stmt_before.get("totals") or {}):
            problems.append("the Statement's totals moved")
        if home_after.get("kpis") != home_before.get("kpis"):
            problems.append("the tracker's figures moved")
        if area6_after.get("counters") != area6_before.get("counters"):
            problems.append("module 6's counters moved")
        audits = _audit_entries(operator, f"/admin/audit?accountId={gid}&action=intake.create")
        if not any("test seat (test)" in str(a.get("detail")) for a in audits):
            problems.append("the audit does not tag the test seat's request")
    finally:
        _safe_disable(cfg, operator)
        if tuser and tuser.get("id"):
            operator.call("POST", f"/admin/users/{tuser['id']}/disable")
    ok = not problems
    return ok, ("test seat flagged and single; its request is tagged test, hidden from the client, and books nothing; "
                "Record, Statement, tracker figures and counters unchanged" if ok else "; ".join(problems[:6]))


LINES_WORDS = re.compile(r"service lines?|\btwelve\b|\blines\b", re.I)


def drv_no_service_lines_wording(page, cfg, line, res, errors):
    """Line 65: no 'service line', 'twelve' or 'lines' on any client page,
    for the client and in client view; the Statement lists the eight
    modules."""
    settle_ms = line.get("settle_ms", 500)
    problems = []
    paths = line.get("paths", ["/", "/documents", "/jobs", "/clocks", "/guide", "/value", "/value/statement",
                               "/tracker/areas/1", "/tracker/areas/4", "/tracker/areas/8"])
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    for p in paths:
        page.goto(cfg["_target"].rstrip("/") + p)
        page.wait_for_timeout(settle_ms * 2)
        text = page.locator("body").inner_text()
        m = LINES_WORDS.search(text)
        if m:
            problems.append(f"{p}: '{m.group(0)}'")
    page.goto(cfg["_target"].rstrip("/") + "/value/statement")
    if _wait_for(page, "[data-testid='statement-module']", 8000):
        n = page.locator("[data-testid='statement-module']").count()
        if n != 8:
            problems.append(f"the Statement lists {n} modules, expected 8")
    else:
        problems.append("the Statement has no statement-module rows")
    ok = not problems
    return ok, (f"{len(paths)} client pages carry no 'service line', 'twelve' or 'lines'; the Statement lists 8 modules"
                if ok else "; ".join(problems[:6]))


def drv_migration_counts_equal(page, cfg, line, res, errors):
    """Line 66: the line-to-module migration has run on every organisation
    with Record counts and hours equal either side. A dry run per
    organisation (which writes nothing) shows nothing left to migrate and
    the two counts equal; the demo's client-facing totals by module add up
    to its items."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    problems = []
    operator = _ApiSeat(cfg, "admin")
    s, body = operator.call("GET", "/admin/migrations/v1-7/organisations")
    orgs = (body or {}).get("organisations") or []
    if s != 200 or not orgs:
        return False, f"listing organisations for the migration returned {s}"
    for oid in orgs:
        s, m = operator.call("POST", f"/admin/migrations/v1-7/modules?org={oid}&dryRun=1")
        if s != 200 or not (m or {}).get("equal"):
            problems.append(f"{oid}: {s} equal={(m or {}).get('equal')}")
            continue
        b, a = m["before"], m["after"]
        if b["entries"] != a["entries"] or abs(b["hours"] - a["hours"]) > 1e-9:
            problems.append(f"{oid}: {b['entries']}/{b['hours']} to {a['entries']}/{a['hours']}")
        if b["withModule"] != b["entries"] or not b.get("moduleStatusSet"):
            problems.append(f"{oid}: not yet migrated ({b['withModule']} of {b['entries']} entries carry a module)")
    client = _ApiSeat(cfg, "client")
    rec = client.call("GET", "/value/record?period=all")[1] or {}
    t = rec.get("totals") or {}
    if sum(x.get("items", 0) for x in t.get("byModule") or []) != t.get("items"):
        problems.append("the demo's totals by module do not add up to its items")
    ok = not problems
    return ok, (f"{len(orgs)} organisations: every entry carries a module, counts and hours equal either side"
                if ok else "; ".join(problems[:6]))


def drv_corpus_every_file(page, cfg, line, res, errors):
    """Line 67: every filed file in every organisation is either searchable
    (its text extracted) or marked not searchable; links are not read; the
    marker is the operator's alone."""
    if not _api_only_once(line, res):
        return True, "API level; run once, at the first resolution"
    problems = []
    operator = _ApiSeat(cfg, "admin")
    orgs = (operator.call("GET", "/admin/migrations/v1-7/organisations")[1] or {}).get("organisations") or []
    files = searchable = 0
    for oid in orgs:
        s, body = operator.call("GET", f"/admin/documents?org={oid}")
        for d in (body or {}).get("documents") or []:
            if d.get("kind") == "file":
                files += 1
                if d.get("searchable") == "yes":
                    searchable += 1
                elif d.get("searchable") != "no":
                    problems.append(f"{oid}: file {d.get('id')} neither searchable nor marked")
            elif d.get("kind") == "link" and d.get("searchable"):
                problems.append(f"{oid}: link {d.get('id')} carries a searchable marker")
    client = _ApiSeat(cfg, "client")
    raw = json.dumps(client.call("GET", "/tracker/documents")[1] or {})
    if "searchNote" in raw or '"searchable"' in raw:
        problems.append("the client's documents response carries the searchable marker")
    ok = not problems
    return ok, (f"{files} filed files across {len(orgs)} organisations: {searchable} searchable, {files - searchable} marked not searchable"
                if ok else "; ".join(problems[:6]))


def drv_guide_cites_documents(page, cfg, line, res, errors):
    """Line 68: Quick questions answers from a published document and cites
    it by document and section on the live path (passages, no key set);
    the model path is gated by the unit tests (guidePaths.test.ts), run here
    and required to pass; the page's wording names the live path."""
    problems = []
    settle_ms = line.get("settle_ms", 500)
    if _api_only_once(line, res):
        try:
            operator = _ApiSeat(cfg, "admin")
            seat, gid = _gate_client_seat(cfg, operator)
        except RuntimeError as exc:
            return False, str(exc)
        try:
            d = _file_gate_doc(operator, gid, "Gate v1.7 guide ledger")
            if d.get("searchable") != "yes":
                problems.append(f"the gate document was not made searchable ({d.get('searchNote')})")
            thread = seat.call("GET", "/chat/thread")[1] or {}
            path = thread.get("guidePath")
            s, body = seat.call("POST", "/chat/messages", {"body": "How long is the gate visitor ledger retained before it is shredded?"})
            msgs = (body or {}).get("messages") or []
            reply = msgs[1] if len(msgs) == 2 else {}
            cites = reply.get("citations") or []
            hit = next((c for c in cites if c.get("policyId") == d["id"]), None)
            if s != 200 or reply.get("status") != "green" or not hit:
                problems.append(f"no cited answer from the document ({s}, {reply.get('status')}, {len(cites)} citations)")
            elif hit.get("sourceKind") != "document" or hit.get("sectionRef") != "2" or hit.get("title") != "Gate v1.7 guide ledger":
                problems.append(f"citation not by document and section: {hit}")
            want_mode = "passages" if path == "passages" else "answer"
            if reply.get("mode") != want_mode:
                problems.append(f"reply mode {reply.get('mode')} on the {path} path")
            if path == "passages" and not str(reply.get("body", "")).startswith("No AI answer is switched on"):
                problems.append("the passages reply does not say no AI answer is switched on")
        finally:
            _remove_gate_docs(operator, gid)
            _safe_disable(cfg, operator)
        import subprocess
        server = cfg["root"] / "06_EXECUTION/build/maximus-src/packages/server"
        try:
            run = subprocess.run("npx vitest run test/guidePaths.test.ts", cwd=str(server), shell=True,
                                 capture_output=True, text=True, timeout=300)
            if run.returncode != 0:
                problems.append("guidePaths.test.ts failed (model path)")
        except Exception as exc:
            problems.append(f"could not run guidePaths.test.ts: {type(exc).__name__}")
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    page.goto(cfg["_target"].rstrip("/") + "/guide")
    if _wait_for(page, "[data-testid='quick-questions-intro']", 8000):
        intro = page.locator("[data-testid='quick-questions-intro']").first
        path_attr = intro.get_attribute("data-path")
        words = _text(intro)
        expect = "shows the passages" if path_attr == "passages" else "Answers are written"
        if path_attr not in ("passages", "model") or expect not in words:
            problems.append(f"the intro does not match the live path ({path_attr}: '{words[:60]}')")
    else:
        problems.append("no quick-questions-intro on the page")
    ok = not problems
    return ok, ("live path cites the document by section; model path passes its unit tests; the page names the live path"
                if ok else "; ".join(problems[:6]))


def drv_review_queue_page(page, cfg, line, res, errors):
    """Line 69: in the browser, a client submission on the operator's review
    queue offers download, a section choice, Accept, and Return with a
    reason that is required."""
    settle_ms = line.get("settle_ms", 600)
    problems = []
    operator = _ApiSeat(cfg, "admin")
    seat, gid = _gate_client_seat(cfg, operator)
    try:
        s, b = _submit_as(seat, "Gate v1.7 queue page")
        if s != 201:
            return False, f"client upload returned {s}"
        if not _ensure_role(page, cfg, "admin", cfg["_target"]):
            return False, "could not sign in as the operator"
        _select_org(page, GATE_ORG_NAME, settle_ms)
        page.goto(cfg["_target"].rstrip("/") + "/admin")
        item = "[data-testid='review-item'][data-type='document_submission']"
        if not _wait_for(page, item, 8000):
            return False, "no document_submission item on the review queue page"
        it = page.locator(item).filter(has_text="Gate v1.7 queue page").first
        for tid in ("accept-section", "accept-module", "accept-document", "return-reason", "return-document"):
            if it.locator(f"[data-testid='{tid}']").count() == 0:
                problems.append(f"no {tid}")
        if it.locator("[data-testid='return-document']").count() and it.locator("[data-testid='return-document']").first.is_enabled():
            problems.append("Return is enabled before a reason is typed")
        if it.get_attribute("data-overdue") not in ("true", "false"):
            problems.append("the item does not state data-overdue")
    finally:
        for i in _pending(operator, gid, "document_submission"):
            if str(i["context"].get("title", "")).startswith("Gate v1.7"):
                operator.call("POST", f"/admin/review/{i['id']}/return-document", {"reason": "Gate clean-up."})
        _remove_gate_docs(operator, gid)
        _pin_demo_org(page, cfg)
        _safe_disable(cfg, operator)
    ok = not problems
    return ok, "submission offers section, Accept, and Return that waits for a reason" if ok else "; ".join(problems[:6])


def drv_new_org_modules_available(page, cfg, line, res, errors):
    """Line 70: a new organisation's eight module statuses default to
    Available, never Live; Settings shows one Module status control per
    module and no twelve-line list. Read on the gate organisation (created
    by the gate) and in the browser on the demo's Settings."""
    settle_ms = line.get("settle_ms", 500)
    problems = []
    if _api_only_once(line, res):
        operator = _ApiSeat(cfg, "admin")
        org, created = _gate_org(operator)
        s, body = operator.call("GET", f"/admin/settings?org={org['id']}")
        ms = ((body or {}).get("settings") or {}).get("moduleStatus") or {}
        if sorted(ms.keys()) != [str(i) for i in range(1, 9)] or (created and set(ms.values()) != {"Available"}):
            problems.append(f"gate organisation module status: {ms}")
        if "Live" in ms.values() and created:
            problems.append("a new organisation starts with a module Live")
    if not _ensure_role(page, cfg, "admin", cfg["_target"]):
        return False, "could not sign in as the operator"
    page.goto(cfg["_target"].rstrip("/") + "/admin/settings")
    _wait_for(page, "[data-testid='module-status-8']", 10000)
    page.wait_for_timeout(settle_ms)
    n = sum(page.locator(f"[data-testid='module-status-{i}']").count() for i in range(1, 9))
    if n != 8:
        problems.append(f"{n} module status controls, expected 8")
    text = page.locator("body").inner_text()
    if re.search(r"service line", text, re.I):
        problems.append("Settings still says 'service line'")
    ok = not problems
    return ok, "eight Module status controls; a new organisation's modules are Available" if ok else "; ".join(problems[:6])


# =============================================================================
# v1.8 (FRAGO 08). Client branding, the MITMARK footer and watermark, and the
# client organisation configured for first use.
#
# The client organisation is read, never written, by these lines: a client
# view of it would itself write an audit row there, so the positive logo case
# is proved on the gate's own organisation with a neutral generated image,
# which is removed again before the line ends. The client's own logo is only
# ever fetched to compare its length and hash; its bytes are never written.
# =============================================================================

CLIENT_ORG_ID = "org-f2b4afdf0d"
CLIENT_ORG_TASKS = 19
CLIENT_ORG_DOCUMENTS = 11
CLIENT_IO_NAME = "Information Officer"
CLIENT_LEAD_TITLE = "Chief Information Security Officer, MITMARK Intelligence"
FOOTER_TEXT = "Delivered by MITMARK Intelligence"
LOGO_MAX_BYTES = 500 * 1024
RESTRICTED_LOGO = "material/restricted/client_logo.png"


def _gate_png(width=48, height=16, rgb=(90, 90, 90)):
    """A small neutral PNG for the gate organisation's test logo."""
    import struct
    import zlib

    def chunk(kind, data):
        return (struct.pack(">I", len(data)) + kind + data
                + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF))
    row = b"\x00" + bytes(rgb) * width
    raw = row * height
    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw))
            + chunk(b"IEND", b""))


def _b64(data):
    import base64
    if isinstance(data, str):
        data = data.encode("utf-8")
    return base64.b64encode(data).decode("ascii")


def _raw_bytes(seat, path, preview_query=None):
    """GET a binary API path with the seat's cookies. Returns (status, bytes, content-type)."""
    import urllib.error
    import urllib.request
    url = seat.base + path
    if preview_query:
        url += ("&" if "?" in url else "?") + "preview=" + urllib.request.quote(f"client:{preview_query}")
    req = urllib.request.Request(url, method="GET")
    try:
        with seat.opener.open(req, timeout=30) as resp:
            return resp.status, resp.read(), resp.headers.get("Content-Type", "")
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read(), exc.headers.get("Content-Type", "")


def _org_rows(operator):
    s, body = operator.call("GET", "/admin/organisations")
    if not _ok(s, body):
        raise RuntimeError(f"GET /admin/organisations returned {s}")
    return {o["id"]: o for o in body.get("organisations") or []}


def _set_gate_logo(operator, gid):
    s, body = operator.call("PUT", f"/admin/organisations/{gid}/logo",
                            {"fileName": "gate-logo.png", "dataBase64": _b64(_gate_png())})
    if s != 200 or not (body or {}).get("logo"):
        raise RuntimeError(f"setting the gate organisation's test logo returned {s}")
    return body["logo"]


def _clear_gate_logo(operator, gid):
    operator.call("DELETE", f"/admin/organisations/{gid}/logo")


def _gate_client_browser(page, cfg, operator):
    """Sign the browser in as the gate organisation's client seat."""
    gid = _gate_org(operator)[0]["id"]
    _, _, pw = _gate_seat(cfg, operator, GATE_CLIENT_EMAIL, "client", gid)
    if not _sign_in_with(page, cfg["_target"], GATE_CLIENT_EMAIL, pw):
        return False
    return _wait_for(page, "[data-view='tracker']", 10000)


def _img_width(loc, timeout_ms=8000):
    """An image's natural width once it has finished loading (0 if it failed, -1 if it never finished)."""
    try:
        loc.scroll_into_view_if_needed(timeout=timeout_ms)
        return loc.evaluate("""(el) => new Promise((resolve) => {
          const done = () => resolve(el.naturalWidth || 0);
          if (el.complete) return done();
          el.addEventListener('load', done, { once: true });
          el.addEventListener('error', () => resolve(0), { once: true });
          setTimeout(() => resolve(el.complete ? el.naturalWidth : -1), %d);
        })""" % timeout_ms)
    except Exception:
        return -1


def drv_logo_upload_limits(page, cfg, line, res, errors):
    """Line 71: the logo upload takes PNG or SVG up to 500 KB, refuses any
    other type, an unsafe SVG and an oversize file, is a manager's action
    only, and the Organisations page offers the control."""
    settle_ms = line.get("settle_ms", 500)
    problems = []
    operator = _ApiSeat(cfg, "admin")
    gid = _gate_org(operator)[0]["id"]
    if _api_only_once(line, res):
        try:
            png = _gate_png()
            big = png + b"\x00" * (LOGO_MAX_BYTES + 1 - len(png))
            cases = [
                ("GIF", _b64(b"GIF89a" + b"\x00" * 32), 400),
                ("plain text named .png", _b64("not an image"), 400),
                ("SVG with a script", _b64('<svg xmlns="http://www.w3.org/2000/svg"><script>1</script></svg>'), 400),
                ("SVG with a handler", _b64('<svg xmlns="http://www.w3.org/2000/svg" onload="x()"></svg>'), 400),
                ("PNG of 500 KB and one byte", _b64(big), 413),
            ]
            for label, data, want in cases:
                s, _ = operator.call("PUT", f"/admin/organisations/{gid}/logo", {"fileName": "x.png", "dataBase64": data})
                if s != want:
                    problems.append(f"{label}: {s}, expected {want}")
            if _org_rows(operator)[gid].get("logoVersion") is not None:
                problems.append("a refused upload left a logo on the gate organisation")
            svg = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="40" height="10"><rect width="40" height="10" fill="#777"/></svg>'
            s, body = operator.call("PUT", f"/admin/organisations/{gid}/logo", {"fileName": "g.svg", "dataBase64": _b64(svg)})
            if s != 200 or ((body or {}).get("logo") or {}).get("contentType") != "image/svg+xml":
                problems.append(f"a plain SVG: {s}")
            s2, raw, ctype = _raw_bytes(operator, f"/admin/organisations/{gid}/logo")
            if s2 != 200 or not ctype.startswith("image/svg+xml"):
                problems.append(f"the SVG served back: {s2} {ctype}")
            s, body = operator.call("PUT", f"/admin/organisations/{gid}/logo", {"fileName": "g.png", "dataBase64": _b64(_gate_png())})
            if s != 200 or ((body or {}).get("logo") or {}).get("contentType") != "image/png":
                problems.append(f"a PNG: {s}")
            seat, _ = _gate_client_seat(cfg, operator)
            s, _ = seat.call("PUT", f"/admin/organisations/{gid}/logo", {"dataBase64": _b64(_gate_png())})
            if s not in (401, 403):
                problems.append(f"a client seat setting a logo: {s}")
        finally:
            _clear_gate_logo(operator, gid)
        if _org_rows(operator)[gid].get("logoVersion") is not None:
            problems.append("the gate organisation kept a logo after the line")
    if not _ensure_role(page, cfg, "admin", cfg["_target"]):
        return False, "could not sign in as the operator"
    page.goto(cfg["_target"].rstrip("/") + "/admin/organisations")
    _wait_for(page, "[data-testid='organisation-row']", 10000)
    page.wait_for_timeout(settle_ms)
    inputs = page.locator("[data-testid='org-logo-input']")
    if inputs.count() == 0:
        problems.append("no logo upload control on the Organisations page")
    else:
        accept = inputs.first.get_attribute("accept") or ""
        if "png" not in accept or "svg" not in accept:
            problems.append(f"the upload control accepts '{accept}'")
    ok = not problems
    return ok, ("PNG and SVG taken; GIF, text, unsafe SVG and 500 KB + 1 refused; manager only; control on Organisations"
                if ok else "; ".join(problems[:6]))


def drv_logo_isolation(page, cfg, line, res, errors):
    """Line 72: a logo set on one organisation is served to that
    organisation's sessions and its client view only. Proved on the gate
    organisation with a neutral test logo, removed afterwards; the client
    organisation's logo is checked to reach neither the demo nor the gate
    organisation, without opening a client view of it."""
    settle_ms = line.get("settle_ms", 600)
    problems = []
    operator = _ApiSeat(cfg, "admin")
    gid = _gate_org(operator)[0]["id"]
    demo = _preview_org_id(operator)
    demo_seat = _ApiSeat(cfg, "client")
    try:
        logo = _set_gate_logo(operator, gid)
        expected = _gate_png()
        if _api_only_once(line, res):
            gate_seat, _ = _gate_client_seat(cfg, operator)
            s, raw, ctype = _raw_bytes(gate_seat, "/branding/logo")
            if s != 200 or raw != expected or not ctype.startswith("image/png"):
                problems.append(f"gate seat's own logo: {s}")
            me = gate_seat.call("GET", "/auth/me")[1] or {}
            if ((me.get("branding") or {}).get("logoLight") or "") != f"/branding/logo?v={logo['version']}":
                problems.append("the gate seat's branding does not carry its logo path")
            for label, seat, pq in (("demo seat", demo_seat, None), ("demo seat naming the gate organisation", demo_seat, gid)):
                s, raw, _ = _raw_bytes(seat, "/branding/logo", pq)
                if s == 200 or raw == expected:
                    problems.append(f"{label} received a logo ({s})")
            if ((demo_seat.call("GET", "/auth/me")[1] or {}).get("branding") or {}).get("logoLight"):
                problems.append("the demo seat's branding carries a logo")
            s, raw, _ = _raw_bytes(operator, "/branding/logo", gid)
            if s != 200 or raw != expected:
                problems.append(f"client view of the gate organisation: {s}")
            s, raw, _ = _raw_bytes(operator, "/branding/logo", demo)
            if s == 200:
                problems.append("client view of the demo served a logo")
            s, raw, _ = _raw_bytes(operator, "/branding/logo")
            if s == 200:
                problems.append("the operator outside client view was served a client logo")
            # The client organisation's own logo: present, and served to no other organisation.
            rows = _org_rows(operator)
            client_row = rows.get(CLIENT_ORG_ID)
            if client_row is None or client_row.get("logoVersion") is None:
                problems.append("the client organisation has no logo set")
            else:
                s, client_logo, _ = _raw_bytes(operator, f"/admin/organisations/{CLIENT_ORG_ID}/logo")
                for label, seat, pq in (("demo seat", demo_seat, None), ("gate seat", gate_seat, None),
                                        ("demo seat naming the client organisation", demo_seat, CLIENT_ORG_ID)):
                    s2, raw, _ = _raw_bytes(seat, "/branding/logo", pq)
                    if s2 == 200 and raw == client_logo:
                        problems.append(f"{label} received the client organisation's logo")
            for oid in (demo,):
                if rows.get(oid, {}).get("logoVersion") is not None:
                    problems.append("the demo organisation has a logo")
        # In the browser: the gate seat sees its logo at the head of the menu,
        # alt is the name. v1.9 (FRAGO 09 3.4): once only; the page header
        # carries the MITMARK mark instead, never the client's logo.
        if not _gate_client_browser(page, cfg, operator):
            return False, "could not sign in as the gate client seat"
        page.wait_for_timeout(settle_ms)
        if page.locator("[data-testid='client-logo-header']").count():
            problems.append("gate seat: the client logo is still in the page header")
        if page.locator("header [data-testid='header-mitmark']").count() != 1:
            problems.append("gate seat: the page header does not carry the MITMARK mark")
        for place in ("sidebar",):
            img = page.locator(f"[data-testid='client-logo-{place}']")
            if img.count() == 0:
                problems.append(f"gate seat: no logo in the {place}")
                continue
            w = _img_width(img.first)
            alt = img.first.get_attribute("alt") or ""
            if w <= 0:
                problems.append(f"gate seat: {place} logo did not load")
            if not alt.strip():
                problems.append(f"gate seat: {place} logo has no alt text")
            if (img.first.evaluate("(el) => getComputedStyle(el).filter") or "none") != "none":
                problems.append(f"gate seat: {place} logo is filtered")
            src = img.first.get_attribute("src") or ""
            if not src.startswith("/api/branding/logo"):
                problems.append(f"gate seat: {place} logo is not served through the API")
    finally:
        _clear_gate_logo(operator, gid)
    # The demo seat in the browser: no logo, the name as text.
    _sign_in(page, cfg, "client", cfg["_target"])
    _wait_for(page, "[data-view='tracker']", 10000)
    page.wait_for_timeout(settle_ms)
    if page.locator("[data-testid^='client-logo-']").count():
        problems.append("the demo seat's portal shows a logo")
    if _org_rows(operator)[gid].get("logoVersion") is not None:
        problems.append("the gate organisation kept its test logo")
    ok = not problems
    return ok, ("logo served to its own organisation's seat and client view only; the client organisation's logo "
                "reaches neither the demo nor the gate organisation; gate test logo removed"
                if ok else "; ".join(problems[:6]))


def drv_logo_fallback_text(page, cfg, line, res, errors):
    """Line 73: with no logo, the portal shows the display name as text in
    the sidebar and header; the admin Organisations list shows a set logo as
    a thumbnail and the switcher stays text."""
    settle_ms = line.get("settle_ms", 500)
    problems = []
    if not _sign_in(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the demo client"
    _enter_view(page, "tracker", None, settle_ms, cfg, "client")
    _wait_for(page, "[data-testid='client-name-fallback']", 8000)
    side = page.locator("[data-testid='client-name-fallback']")
    head = page.locator("[data-testid='client-name-fallback-header']")
    if side.count() == 0 or not _text(side.first):
        problems.append("no text name in the sidebar")
    # v1.9 (FRAGO 09 3.4): the header carries the MITMARK mark, not the name.
    if head.count():
        problems.append("the name is still repeated in the page header")
    if page.locator("[data-testid^='client-logo-']").count():
        problems.append("a logo is shown with none set")
    if not _ensure_role(page, cfg, "admin", cfg["_target"]):
        return False, "could not sign in as the operator"
    page.goto(cfg["_target"].rstrip("/") + "/admin/organisations")
    _wait_for(page, "[data-testid='organisation-row']", 10000)
    page.wait_for_timeout(settle_ms)
    row = page.locator(f"[data-testid='organisation-row'][data-org-id='{CLIENT_ORG_ID}']")
    if row.count() == 0:
        problems.append("the client organisation is not on the Organisations list")
    else:
        thumb = row.first.locator("[data-testid='org-logo-thumb']")
        if thumb.count() == 0:
            problems.append("the client organisation's logo is not on the Organisations list")
        elif _img_width(thumb.first) <= 0:
            problems.append("the Organisations list thumbnail did not load")
    demo = _preview_org_id(_ApiSeat(cfg, "admin"))
    drow = page.locator(f"[data-testid='organisation-row'][data-org-id='{demo}']")
    if drow.count() and drow.first.locator("[data-testid='org-logo-none']").count() == 0:
        problems.append("the demo row does not say None")
    sw = page.locator("[data-testid='org-switcher']")
    if sw.count() == 0:
        problems.append("no organisation switcher")
    elif sw.first.locator("img").count() or sw.first.evaluate("(el) => el.tagName") != "SELECT":
        problems.append("the switcher is not plain text")
    ok = not problems
    return ok, ("name as text in sidebar and header with no logo; the logo on the Organisations list; switcher text"
                if ok else "; ".join(problems[:6]))


def _watermark_state(page):
    return page.evaluate("""() => {
      const w = document.querySelector("[data-testid='mitmark-watermark']");
      if (!w) return { present: false };
      const img = w.querySelector('img');
      const r = w.getBoundingClientRect();
      let op = 1;
      for (let el = img || w; el && el !== document.documentElement; el = el.parentElement) {
        op *= parseFloat(getComputedStyle(el).opacity || '1');
      }
      const visible = getComputedStyle(w).display !== 'none' && r.width > 0 && r.height > 0;
      return { present: true, visible, opacity: op, right: window.innerWidth - r.right,
               bottom: window.innerHeight - r.bottom, loaded: !!img && img.complete && img.naturalWidth > 0 };
    }""")


def _footer_ok(page):
    f = page.locator("[data-testid='client-footer']")
    if f.count() == 0:
        return "no footer"
    if FOOTER_TEXT not in _text(f.first):
        return f"footer reads '{_text(f.first)[:60]}'"
    if f.first.locator("img").count() == 0:
        return "no MITMARK mark in the footer"
    return None


def drv_footer_watermark(page, cfg, line, res, errors):
    """Line 74: every client page carries the footer and, from 640px, the
    watermark at about 6 per cent bottom right; neither is on an admin page;
    the same mark shows in View as client; the printed Statement keeps it."""
    settle_ms = line.get("settle_ms", 450)
    wide = res["width"] >= 640
    problems = []
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the demo client"
    views = _client_surface_views(line)
    for v in views:
        if not _enter_any(page, cfg, v, None, settle_ms, "client"):
            problems.append(f"{v}: not reached")
            continue
        _wait_for(page, "[data-testid='client-footer']", 6000)
        bad = _footer_ok(page)
        if bad:
            problems.append(f"{v}: {bad}")
        st = _watermark_state(page)
        if not st.get("present"):
            problems.append(f"{v}: no watermark")
        elif wide:
            if not st["visible"] or not st["loaded"]:
                problems.append(f"{v}: watermark not shown")
            elif not (0.04 <= st["opacity"] <= 0.08):
                problems.append(f"{v}: watermark opacity {st['opacity']:.3f}")
            elif st["right"] > 40 or st["bottom"] > 40:
                problems.append(f"{v}: watermark not bottom right ({st['right']:.0f}, {st['bottom']:.0f})")
        elif st["visible"]:
            problems.append(f"{v}: watermark shown below 640px")
    if wide:
        _enter_view(page, "statement", None, settle_ms, cfg, "client")
        _wait_for(page, "[data-testid='statement']", 6000)
        try:
            page.emulate_media(media="print")
            page.wait_for_timeout(200)
            st = _watermark_state(page)
            if not st.get("visible"):
                problems.append("the printed Statement has no watermark")
        finally:
            page.emulate_media(media="screen")
            page.wait_for_timeout(100)
    if not _ensure_role(page, cfg, "admin", cfg["_target"]):
        return False, "could not sign in as the operator"
    for path in line.get("admin_paths", ["/admin", "/admin/organisations", "/admin/settings", "/admin/jobs", "/admin/documents"]):
        page.goto(cfg["_target"].rstrip("/") + path)
        _wait_for(page, "[data-view='queue']", 8000)
        page.wait_for_timeout(settle_ms)
        if page.locator("[data-testid='mitmark-watermark'], [data-testid='client-footer']").count():
            problems.append(f"admin {path}: client footer or watermark present")
    if not _enter_view(page, "client-view", None, settle_ms, cfg, "admin"):
        problems.append("could not open View as client")
    else:
        _wait_for(page, "[data-testid='client-view-banner']", 8000)
        _wait_for(page, "[data-testid='client-footer']", 6000)
        st = _watermark_state(page)
        if _footer_ok(page):
            problems.append(f"View as client: {_footer_ok(page)}")
        if not st.get("present") or (wide and not st.get("visible")):
            problems.append("View as client: no watermark")
        _leave_client_view(page, settle_ms)
    ok = not problems
    return ok, (f"{len(views)} client pages carry the footer and the watermark"
                f"{' (shown, about 6%, bottom right; on the printed Statement)' if wide else ' (hidden below 640px)'};"
                " none on admin pages; same in View as client" if ok else "; ".join(problems[:6]))


_WATERMARK_CONTRAST_JS = r"""
async () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1; canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const rgba = (col) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000'; ctx.fillStyle = col; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const over = (top, under) => { const a = top[3]; return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)); };
  const lum = (rgb) => {
    const c = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

  const wm = document.querySelector("[data-testid='mitmark-watermark']");
  const content = document.querySelector("[data-testid='client-content']");
  const main = content ? content.closest('main') : null;
  let wmRect = null, wmOpacity = 0, worst = null;
  if (wm && getComputedStyle(wm).display !== 'none') {
    const img = wm.querySelector('img');
    wmRect = wm.getBoundingClientRect();
    wmOpacity = 1;
    for (let el = img || wm; el && el !== document.documentElement; el = el.parentElement) wmOpacity *= parseFloat(getComputedStyle(el).opacity || '1');
    // The darkest colour in the mark, read from the mark itself: the worst case under any glyph.
    try {
      const svg = await (await fetch(img.getAttribute('src'))).text();
      const cols = Array.from(new Set((svg.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || [])));
      for (const c of cols) { const v = rgba(c); if (!worst || lum(v) < lum(worst)) worst = v; }
    } catch (e) { worst = [0, 0, 0, 1]; }
    if (!worst) worst = [0, 0, 0, 1];
  }

  // The element's background as composited, and whether that background lies
  // above the watermark (inside the content layer) or beneath it.
  const backdrop = (el) => {
    const layers = [];
    let n = el, aboveMark = false;
    for (; n && n.nodeType === 1; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) layers.push(c);
      if (c[3] >= 0.999) { aboveMark = !!content && content.contains(n) ; break; }
    }
    let base = [255, 255, 255];
    for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
    return { base, aboveMark };
  };

  const out = { measured: 0, overlapping: 0, minOverlap: null, footer: null, fails: [] };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    if (!t.textContent.trim()) continue;
    const el = t.parentElement;
    if (!el || seen.has(el)) continue;
    seen.add(el);
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (el.closest("[aria-hidden='true'], .sr-only")) continue;
    const { base, aboveMark } = backdrop(el);
    const fg = over(rgba(cs.color), base);
    const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const isFooter = !!el.closest("[data-testid='client-footer']");
    let overlaps = false;
    if (wmRect && !aboveMark) {
      const xo = r.left < wmRect.right && r.right > wmRect.left;
      const yo = r.top < wmRect.bottom && r.bottom > wmRect.top;
      // Inside the scrolling content area any element in the mark's column
      // can pass beneath it; outside it, only one that already overlaps.
      overlaps = (main && main.contains(el)) ? xo : (xo && yo);
    }
    if (!overlaps && !isFooter) continue;
    out.measured += 1;
    const bg = overlaps ? over([worst[0], worst[1], worst[2], wmOpacity], base) : base;
    const ratioNow = Math.round(ratio(fg, bg) * 100) / 100;
    const need = isFooter ? 4.5 : (large ? 3 : 4.5);
    if (overlaps) {
      out.overlapping += 1;
      out.minOverlap = out.minOverlap === null ? ratioNow : Math.min(out.minOverlap, ratioNow);
    }
    if (isFooter) out.footer = out.footer === null ? ratioNow : Math.min(out.footer, ratioNow);
    if (ratioNow < need) out.fails.push(`'${t.textContent.trim().slice(0, 30)}' ${ratioNow}:1`);
  }
  out.watermark = !!wmRect;
  return out;
}
"""


def drv_watermark_contrast(page, cfg, line, res, errors):
    """Line 75: with the watermark present, text on every client page keeps
    4.5:1 (3:1 for large text) wherever the mark can lie beneath it,
    measured against the page blended with the mark's darkest colour at the
    mark's opacity; the footer text is 4.5:1 or better."""
    settle_ms = line.get("settle_ms", 450)
    problems, overlapping, footer_min = [], 0, None
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the demo client"
    views = _client_surface_views(line)
    for v in views:
        if not _enter_any(page, cfg, v, None, settle_ms, "client"):
            problems.append(f"{v}: not reached")
            continue
        _wait_for(page, "[data-testid='client-footer']", 6000)
        m = page.evaluate(_WATERMARK_CONTRAST_JS)
        overlapping += m["overlapping"]
        if m["footer"] is None:
            problems.append(f"{v}: footer text not measured")
        else:
            footer_min = m["footer"] if footer_min is None else min(footer_min, m["footer"])
        if res["width"] >= 640 and not m["watermark"]:
            problems.append(f"{v}: no watermark to measure against")
        for f in m["fails"]:
            problems.append(f"{v}: {f}")
    ok = not problems
    return ok, (f"{len(views)} pages; {overlapping} text element(s) in the mark's column, none below the rule; "
                f"footer lowest {footer_min}:1" if ok else "; ".join(problems[:6]))


def drv_client_org_ready(page, cfg, line, res, errors):
    """Line 76: the client organisation is configured as FRAGO 08 3.1, read
    only: the name is the client's trading name (proved by the restricted
    list, never printed) in all three places; the Information Officer is
    the role; the contract lead carries the title; all eight modules are
    Live; no fee; 19 tasks and 11 documents; its logo is a PNG and the
    restricted file's own bytes."""
    import hashlib
    if not _api_only_once(line, res):
        return True, "not repeated (API)"
    problems = []
    operator = _ApiSeat(cfg, "admin")
    s, body = operator.call("GET", f"/admin/settings?org={CLIENT_ORG_ID}")
    if not _ok(s, body):
        return False, f"GET /admin/settings for the client organisation returned {s}"
    st, br, name = body.get("settings") or {}, body.get("branding") or {}, body.get("name") or ""
    terms = _restricted_terms_runtime(cfg) or []
    if not terms:
        problems.append("restricted list unreadable")
    elif not name or not _restricted_hit_count(name, terms):
        problems.append("the organisation name is not the client's trading name")
    if not (name == br.get("displayName") == st.get("clientName")):
        problems.append("name, display name and statement name differ")
    if st.get("ioName") != CLIENT_IO_NAME:
        problems.append("the Information Officer is not the role")
    lead = st.get("lead") or ""
    if not lead.endswith(", " + CLIENT_LEAD_TITLE) or not lead[: -len(CLIENT_LEAD_TITLE) - 2].strip():
        problems.append("the contract lead is not a name with the title")
    ms = st.get("moduleStatus") or {}
    if sorted(ms) != [str(i) for i in range(1, 9)] or set(ms.values()) != {"Live"}:
        problems.append(f"module status {ms}")
    if st.get("retainer") not in ("", None):
        problems.append("a retainer is entered")
    if st.get("showIllustrative"):
        problems.append("show illustrative is on")
    row = _org_rows(operator).get(CLIENT_ORG_ID) or {}
    if row.get("taskCount") != CLIENT_ORG_TASKS:
        problems.append(f"{row.get('taskCount')} tasks, expected {CLIENT_ORG_TASKS}")
    s, docs = operator.call("GET", f"/admin/documents?org={CLIENT_ORG_ID}")
    n_docs = len((docs or {}).get("documents") or []) if _ok(s, docs) else None
    if n_docs != CLIENT_ORG_DOCUMENTS:
        problems.append(f"{n_docs} documents, expected {CLIENT_ORG_DOCUMENTS}")
    logo = br.get("logo") or {}
    if logo.get("contentType") != "image/png":
        problems.append("no PNG logo set")
    else:
        s, raw, _ = _raw_bytes(operator, f"/admin/organisations/{CLIENT_ORG_ID}/logo")
        src = cfg["root"] / RESTRICTED_LOGO
        if s != 200:
            problems.append(f"the logo is not served to the operator ({s})")
        elif src.is_file() and hashlib.sha256(raw).digest() != hashlib.sha256(src.read_bytes()).digest():
            problems.append("the logo set is not the restricted file")
    ok = not problems
    return ok, ("name set (restricted match, not printed); Information Officer role; lead with title; "
                f"8 modules Live; no fee; {CLIENT_ORG_TASKS} tasks, {CLIENT_ORG_DOCUMENTS} documents; logo PNG"
                if ok else "; ".join(problems[:8]))


def sdrv_logo_file_nowhere_else(cfg, line):
    """Line 77: the client's logo file exists only in material/restricted:
    no file under the job folder outside it, and nothing in the built
    bundle, has the same bytes. Compared by hash; nothing is printed."""
    import hashlib
    src = cfg["root"] / RESTRICTED_LOGO
    if not src.is_file():
        return False, "the restricted logo file is not readable; an absent file is not a pass"
    want = src.read_bytes()
    digest, size = hashlib.sha256(want).digest(), len(want)
    skip = {".git", "node_modules", "material", "__pycache__", ".netlify", ".vite", "test-results", "playwright-report"}
    hits, scanned = [], 0
    for dirpath, dirnames, filenames in os.walk(cfg["root"]):
        dirnames[:] = [d for d in dirnames if d not in skip]
        for fn in filenames:
            p = pathlib.Path(dirpath) / fn
            try:
                st = p.stat()
            except OSError:
                continue
            scanned += 1
            if st.st_size < size:
                continue
            data = p.read_bytes()
            if (st.st_size == size and hashlib.sha256(data).digest() == digest) or (
                    st.st_size > size and want in data):
                hits.append(str(p.relative_to(cfg["root"])).replace("\\", "/"))
    for rel in BUNDLE_PATHS:
        if not (cfg["root"] / rel).exists():
            hits.append(f"bundle missing: {rel}")
    if hits:
        return False, f"{len(hits)} file(s) carry the client's logo: " + "; ".join(hits[:5])
    return True, f"{scanned} files under the job folder (bundle included) checked; the logo is only in material/restricted"


STATIC_DRIVERS["logo_file_nowhere_else"] = sdrv_logo_file_nowhere_else


# =============================================================================
# v1.9 (FRAGO 09). Decision notes, the upload Category, status marks, both
# marks in the client header, the client quick start, and a quiet client
# organisation.
# =============================================================================

RUN_STARTED_AT = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
DECISION_NOTE_PREFIX = "MITMARK: "
UPLOAD_CATEGORIES = [("policy", "Policy"), ("procedure", "Procedure"), ("tracker", "Tracker")]
CATEGORY_SECTION = {"policy": "policies", "procedure": "procedures", "tracker": "trackers"}
MARK_KINDS = {"done", "not_started", "in_progress", "red", "not_applicable"}
QUICK_START = "07_HANDOVER/T27_CLIENT_QUICK_START.md"
QUICK_START_MAX_WORDS = 650
QUICK_START_FORBIDDEN = re.compile(
    r"assure|\bcast\b|cast-\d|seagull|sunray|\brich\b|roberts|lurong|@|https?://|tessera-monitor", re.I)
CLIENT_MENU_LABELS = ("Compliance Tracker", "Compliance Documents", "Job management",
                      "Requests and clocks", "Statement for the CFO", "Quick questions")


def _mark_word_ok(kind, word):
    """The colour of a mark never contradicts its word (FRAGO 09 3.3)."""
    if kind == "done":
        return word == "Done"
    if kind == "not_started":
        return word in ("Not started", "Not started, due soon")
    if kind == "in_progress":
        return word in ("In progress", "In progress, due soon")
    if kind == "red":
        return word in ("Blocked", "Overdue, not started", "Overdue, in progress")
    if kind == "not_applicable":
        return word == "Not applicable"
    return False


_MARK_CONTRAST_JS = r"""
(args) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1; canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const rgba = (col) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = col; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const over = (top, bottom) => {
    const a = top[3];
    return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a)).concat([1]);
  };
  // The colour seen behind an element: its ancestors' backgrounds composited
  // from the page up.
  const backdrop = (el) => {
    const stack = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) stack.push(c);
      if (c[3] >= 1) break;
    }
    let col = [255, 255, 255, 1];
    for (let i = stack.length - 1; i >= 0; i--) col = over(stack[i], col);
    return col;
  };
  const lum = (rgb) => {
    const c = rgb.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const out = [];
  for (const m of Array.from(document.querySelectorAll(args.root + " [data-testid='status-mark']"))) {
    if (!visible(m)) continue;
    const bg = backdrop(m);
    const edge = m.querySelector("[data-testid='status-mark-edge']");
    const word = m.querySelector("[data-testid='status-word']");
    const row = { kind: m.getAttribute('data-mark'), dataWord: m.getAttribute('data-word'),
                  word: word ? (word.textContent || '').trim() : null, edge: null, words: null,
                  hasIcon: !!m.querySelector("[data-testid='status-mark-icon']") };
    if (edge) {
      const s = getComputedStyle(edge).stroke;
      const c = rgba(s && s !== 'none' ? s : getComputedStyle(edge).color);
      row.edge = Math.round(ratio(over(c, bg), bg) * 100) / 100;
    }
    if (word) {
      const c = rgba(getComputedStyle(word).color);
      row.words = Math.round(ratio(over(c, bg), bg) * 100) / 100;
    }
    out.push(row);
  }
  return out;
}
"""


def _marks_on(page, root, label, problems, min_edge=3.0, min_words=4.5):
    """Every visible status mark under `root`: one of the marks, its word
    present and agreeing with its colour, edge 3:1 and words 4.5:1."""
    rows = page.evaluate(_MARK_CONTRAST_JS, {"root": root})
    if not rows:
        problems.append(f"{label}: no status marks")
        return rows
    for r in rows:
        kind, word = r.get("kind"), r.get("word")
        if kind not in MARK_KINDS:
            problems.append(f"{label}: unknown mark '{kind}'")
        if not word or word != r.get("dataWord"):
            problems.append(f"{label}: mark '{kind}' has no word, or it differs from data-word")
        elif not _mark_word_ok(kind, word):
            problems.append(f"{label}: mark '{kind}' reads '{word}' (colour contradicts word)")
        if not r.get("hasIcon"):
            problems.append(f"{label}: mark '{kind}' has no icon")
        if r.get("edge") is None or r["edge"] < min_edge:
            problems.append(f"{label}: mark '{kind}' edge {r.get('edge')}:1, below {min_edge}:1")
        if r.get("words") is None or r["words"] < min_words:
            problems.append(f"{label}: words '{word}' {r.get('words')}:1, below {min_words}:1")
    return rows


def drv_decision_notes(page, cfg, line, res, errors):
    """Line 78: a note given on Approve or Reject of a request and of a task
    confirmation is stored and reaches the client on the right page; no note,
    nothing shown; a test seat's note reaches no client; the audit entry says
    a note was given and never repeats it. Proved on the gate organisation,
    once, at the first resolution (API and browser)."""
    if not _api_only_once(line, res):
        return True, "API and browser level; run once, at the first resolution"
    settle_ms = line.get("settle_ms", 600)
    problems = []
    tag = datetime.datetime.now().strftime("%H%M%S")
    notes = {k: f"Gate v1.9 {k} note {tag}." for k in ("approve", "reject", "task", "reopen", "test_task", "test_req")}
    created_tasks = []
    clocks_to_close = []
    tuser = None
    try:
        operator = _ApiSeat(cfg, "admin")
        seat, gid = _gate_client_seat(cfg, operator)
        tseat, tuser = _gate_test_seat(cfg, operator, gid)
    except RuntimeError as exc:
        return False, str(exc)
    try:
        # Requests: approve with a note, reject with a note, approve with none.
        raised = {}
        for key, kind in (("approve", "data_request"), ("reject", "concern"), ("none", "data_request")):
            s, b = seat.call("POST", "/requests", {"type": kind, "details": f"Gate v1.9 request {key} {tag}"})
            if s != 201:
                return False, f"raising a request returned {s}"
            raised[key] = b
            clocks_to_close.append(b["clockId"])
        s, b = tseat.call("POST", "/requests", {"type": "data_request", "details": f"Gate v1.9 test request {tag}"})
        if s != 201:
            return False, f"the test seat's request returned {s}"
        raised["test"] = b
        clocks_to_close.append(b["clockId"])
        pend = {i["refId"]: i for i in _pending(operator, gid, "intake")}
        for key, action, note in (("approve", "approve", notes["approve"]), ("reject", "reject", notes["reject"]),
                                  ("none", "approve", None), ("test", "approve", notes["test_req"])):
            item = pend.get(raised[key]["intakeId"])
            if not item:
                problems.append(f"request '{key}' is not in the queue")
                continue
            s, _ = operator.call("POST", f"/admin/review/{item['id']}/{action}", {"note": note} if note else {})
            if s != 200:
                problems.append(f"{action} of request '{key}' returned {s}")
        lst = seat.call("GET", "/clocks")[1] or {}
        by_id = {c.get("id"): c for c in (lst.get("active") or []) + (lst.get("closed") or [])}
        for key, want in (("approve", notes["approve"]), ("reject", notes["reject"]), ("none", None)):
            row = by_id.get(raised[key]["clockId"]) or {}
            got = (row.get("decisionNote") or {}).get("text")
            if got != want:
                problems.append(f"request '{key}': the client's list carries note {got!r}, expected {want!r}")
            det = seat.call("GET", f"/clocks/{raised[key]['clockId']}")[1] or {}
            if (det.get("decisionNote") or {}).get("text") != want:
                problems.append(f"request '{key}': the client's detail does not carry the note as given")
        if raised["test"]["clockId"] in by_id or notes["test_req"] in json.dumps(lst):
            problems.append("the client sees the test seat's request or its note")

        # Task confirmations: accept with a note, reopen with a note, and a test
        # seat's confirmation whose note must not reach the real task.
        due = (datetime.date.today() + datetime.timedelta(days=40)).isoformat()
        tasks = {}
        for key in ("accept", "reopen"):
            s, t = operator.call("POST", f"/admin/workplan?org={gid}", {
                "area": 3, "phase": 1, "title": f"Gate v1.9 client task {key} {tag}", "ownerType": "client",
                "ownerRole": "Information Officer", "dueAt": due, "recurrence": "once", "status": "in_progress"})
            if s != 201:
                return False, f"creating a gate task returned {s}"
            tasks[key] = t["id"]
            created_tasks.append(t["id"])
            s, _ = seat.call("POST", f"/tracker/tasks/{t['id']}/confirm", {"note": "Gate: done."})
            if s not in (200, 201):
                problems.append(f"the client's confirmation of task '{key}' returned {s}")
        pend = {i["refId"]: i for i in _pending(operator, gid, "task_confirmation") if not i.get("test")}
        for key, action, note in (("accept", "approve", notes["task"]), ("reopen", "reject", notes["reopen"])):
            item = pend.get(tasks[key])
            if not item:
                problems.append(f"task '{key}' confirmation is not in the queue")
                continue
            s, _ = operator.call("POST", f"/admin/review/{item['id']}/{action}", {"note": note})
            if s != 200:
                problems.append(f"{action} of task '{key}' returned {s}")
        s, _ = tseat.call("POST", f"/tracker/tasks/{tasks['reopen']}/confirm", {"note": "Gate test seat."})
        titem = next((i for i in _pending(operator, gid, "task_confirmation")
                      if i.get("test") and i.get("refId") == tasks["reopen"]), None)
        if not titem:
            problems.append("the test seat's confirmation is not in the queue")
        else:
            operator.call("POST", f"/admin/review/{titem['id']}/approve", {"note": notes["test_task"]})
        jobs = seat.call("GET", "/tracker/jobs")[1] or {}
        jt = {t.get("id"): t for g in jobs.get("groups") or [] for t in g.get("tasks") or []}
        for key, want in (("accept", notes["task"]), ("reopen", notes["reopen"])):
            got = ((jt.get(tasks[key]) or {}).get("mitmarkNote") or {}).get("text")
            if got != want:
                problems.append(f"task '{key}': the client's Job management carries {got!r}, expected {want!r}")
        if notes["test_task"] in json.dumps(jobs):
            problems.append("the test seat's note reached the client's Job management")

        # The audit says a note was given and never repeats it.
        entries = _audit_entries(operator, f"/admin/audit?accountId={gid}")
        text = json.dumps(entries)
        for k, n in notes.items():
            if n in text:
                problems.append(f"the audit repeats the {k} note")
        if not any("with a note to the client" in str(e.get("detail")) for e in entries):
            problems.append("no audit entry says a note was given")

        # In the browser, as the client sees it.
        if not _gate_client_browser(page, cfg, operator):
            problems.append("could not sign in as the gate client seat")
        else:
            page.goto(cfg["_target"].rstrip("/") + "/clocks")
            if not _wait_for(page, "[data-testid='decision-note-client']", 8000):
                problems.append("Requests and clocks shows no decision note")
            else:
                shown = [_text(x) for x in page.locator("[data-testid='decision-note-client']").all()]
                if DECISION_NOTE_PREFIX + notes["approve"] not in shown:
                    problems.append(f"Requests and clocks reads {shown[:3]}")
                if page.locator("[data-testid='decision-note-date']").count() < len(shown):
                    problems.append("a decision note on Requests and clocks has no date")
            page.goto(cfg["_target"].rstrip("/") + "/jobs")
            if not _wait_for(page, "[data-testid='job-card'] [data-testid='decision-note-client']", 8000):
                problems.append("Job management shows no decision note on a card")
            else:
                shown = [_text(x) for x in page.locator("[data-testid='job-card'] [data-testid='decision-note-client']").all()]
                if DECISION_NOTE_PREFIX + notes["task"] not in shown:
                    problems.append(f"Job management reads {shown[:3]}")
            page.wait_for_timeout(settle_ms)
    except RuntimeError as exc:
        problems.append(str(exc))
    finally:
        for tid in created_tasks:
            operator.call("DELETE", f"/admin/workplan/{tid}?org={gid}")
        for cid in clocks_to_close:
            operator.call("POST", f"/admin/clocks/{cid}/close", {"outcome": "Gate v1.9 close.", "insideStatute": True})
        _safe_disable(cfg, operator)
        if tuser and tuser.get("id"):
            operator.call("POST", f"/admin/users/{tuser['id']}/disable")
    ok = not problems
    return ok, ("notes on approve and reject of requests and task confirmations reach the client's Requests and clocks "
                "and Job management; no note shows nothing; the test seat's notes reach no client; the audit never "
                "repeats a note" if ok else "; ".join(problems[:6]))


def drv_upload_category(page, cfg, line, res, errors):
    """Line 79: the client's upload form offers Category (Policy, Procedure,
    Tracker) and no module; a submission carries its category and cannot
    carry a module; Accept pre-fills the section from the category and
    refuses to publish without a module; a published submission appears on
    its module page. The form is read at every width; the API and the
    operator's Accept form once, at the first resolution, on the gate
    organisation."""
    settle_ms = line.get("settle_ms", 500)
    problems = []
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    page.goto(cfg["_target"].rstrip("/") + "/documents")
    if not _wait_for(page, "[data-testid='client-upload-form']", 8000):
        return False, "client Documents: no upload form"
    form = page.locator("[data-testid='client-upload-form']").first
    sel = form.locator("[data-testid='upload-category']")
    if sel.count() != 1:
        problems.append("the upload form has no single Category control")
    else:
        opts = sel.first.evaluate("(el) => Array.from(el.options).filter(o => o.value).map(o => [o.value, o.textContent.trim()])")
        if [tuple(o) for o in opts] != UPLOAD_CATEGORIES:
            problems.append(f"Category options read {opts}")
        if not sel.first.evaluate("(el) => el.required"):
            problems.append("Category is not required")
    if form.locator("[name='area'], [name='module'], [data-testid='upload-module']").count():
        problems.append("the upload form still offers a module")
    if "Module" in [_text(x) for x in form.locator("label").all()]:
        problems.append("the upload form still labels a field Module")
    if not _api_only_once(line, res):
        ok = not problems
        return ok, ("Category with Policy, Procedure, Tracker, required; no module on the form"
                    if ok else "; ".join(problems[:6]))

    try:
        operator = _ApiSeat(cfg, "admin")
        seat, gid = _gate_client_seat(cfg, operator)
    except RuntimeError as exc:
        return False, str(exc)
    try:
        s, b = _submit_as(seat, "Gate v1.9 module refused", area=3, category="tracker")
        if s != 400:
            problems.append(f"a client submission carrying a module returned {s}, expected 400")
        s, b = _submit_as(seat, "Gate v1.9 no category", category=None)
        if s != 400:
            problems.append(f"a client submission with no category returned {s}, expected 400")
        s, b = _submit_as(seat, "Gate v1.9 category", category="procedure")
        if s != 201:
            return False, f"a client submission with a category returned {s} {b}"
        doc_id = b["id"]
        docs = operator.call("GET", f"/admin/documents?org={gid}")[1] or {}
        d = next((x for x in docs.get("documents") or [] if x.get("id") == doc_id), {})
        if d.get("category") != "procedure" or d.get("area") is not None or d.get("published"):
            problems.append(f"the stored submission: category {d.get('category')}, area {d.get('area')}, "
                            f"published {d.get('published')}")
        item = next((i for i in _pending(operator, gid, "document_submission")
                     if i["context"].get("documentId") == doc_id), None)
        if not item or item["context"].get("category") != "procedure":
            problems.append("the queue item does not carry the client's category")
        else:
            # The operator's Accept form, in the browser: section pre-filled
            # from the category, module empty and required.
            if _ensure_role(page, cfg, "admin", cfg["_target"]):
                try:
                    _select_org(page, GATE_ORG_NAME, settle_ms)
                    page.goto(cfg["_target"].rstrip("/") + "/admin")
                    if not _wait_for(page, "[data-testid='submission-category']", 8000):
                        problems.append("the review queue card shows no category")
                    else:
                        card = page.locator("[data-testid='review-item'][data-type='document_submission']").filter(
                            has_text="Gate v1.9 category").first
                        if "Procedure" not in _text(card.locator("[data-testid='submission-category']").first):
                            problems.append("the queue card does not name the category Procedure")
                        sec = card.locator("[data-testid='accept-section']")
                        mod = card.locator("[data-testid='accept-module']")
                        if sec.count() == 0 or sec.first.input_value() != "procedures":
                            problems.append("Accept does not pre-fill the section from the category")
                        if mod.count() == 0 or mod.first.input_value() != "":
                            problems.append("Accept has no empty module control")
                finally:
                    _pin_demo_org(page, cfg)
            s, b = operator.call("POST", f"/admin/review/{item['id']}/accept-document", {"section": "procedures"})
            if s != 400:
                problems.append(f"accept without a module returned {s}, expected 400")
            area_docs_before = seat.call("GET", "/tracker/areas/5")[1] or {}
            if doc_id in json.dumps(area_docs_before):
                problems.append("module 5 lists the submission before acceptance")
            s, b = operator.call("POST", f"/admin/review/{item['id']}/accept-document",
                                 {"section": "procedures", "area": 5})
            if s != 200:
                problems.append(f"accept with a module returned {s}")
            area = seat.call("GET", "/tracker/areas/5")[1] or {}
            if doc_id not in json.dumps(area.get("documents") or area):
                problems.append("the published submission is not on its module page (module 5)")
    except RuntimeError as exc:
        problems.append(str(exc))
    finally:
        _remove_gate_docs(operator, gid, prefix="Gate v1.9")
        _safe_disable(cfg, operator)
    ok = not problems
    return ok, ("Category required with Policy, Procedure, Tracker and no module; a module or no category is refused; "
                "the queue shows the category; Accept pre-fills the section and refuses without a module; the "
                "published document is on its module page" if ok else "; ".join(problems[:6]))


def drv_status_marks(page, cfg, line, res, errors):
    """Line 80: on the client's Job management and a module page's Jobs
    table, the operator's Workplan and Jobs board, every task status mark is
    one of the marks with its word, the word agrees with the colour, an
    overdue or blocked open task is red, no RAG lamp sits in a task row or
    card, and every mark edge measures 3:1 and every word 4.5:1 against the
    page."""
    settle_ms = line.get("settle_ms", 600)
    task_scopes = line.get("task_scopes", ["[data-testid='job-card']", "[data-testid='task-row']",
                                           "[data-testid='board-card']",
                                           "[data-testid='for-you-row']"])
    problems = []
    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"

    def no_lamps(label):
        for sc in task_scopes:
            if page.locator(f"{sc} [data-testid='rag-mark']").count():
                problems.append(f"{label}: a RAG lamp remains in {sc}")

    # Client Job management, checked against the API's own reading.
    if not _enter_view(page, "jobs", None, settle_ms, cfg, "client") or \
            not _wait_for(page, "[data-testid='job-card'] [data-testid='status-mark']", 8000):
        problems.append("Job management: no status marks on the cards")
    else:
        rows = _marks_on(page, "[data-testid='job-board']", "Job management", problems)
        no_lamps("Job management")
        api = _ApiSeat(cfg, "client").call("GET", "/tracker/jobs")[1] or {}
        open_tasks = [t for g in api.get("groups") or [] if g.get("id") != "completed" for t in g.get("tasks") or []]
        want_red = sum(1 for t in open_tasks if t.get("rag") == "red")
        got_red = sum(1 for r in rows if r.get("kind") == "red")
        if want_red != got_red:
            problems.append(f"Job management: {got_red} red marks on the board, {want_red} open tasks overdue or blocked")
        if page.locator("[data-testid='job-card']").count() != page.locator(
                "[data-testid='job-card'] [data-testid='status-mark']").count():
            problems.append("Job management: a card does not carry exactly one status mark")
    # A module page's Jobs table (module 1, then any with tasks).
    seen_table = False
    for i in range(8):
        if not _enter_area_page(page, cfg, settle_ms, i):
            continue
        if _wait_for(page, "[data-testid='task-row'] [data-testid='status-mark']", 3000):
            _marks_on(page, "main", f"module {i + 1} page", problems)
            no_lamps(f"module {i + 1} page")
            seen_table = True
            break
    if not seen_table:
        problems.append("no module page shows a task with a status mark")
    # The operator's Workplan and Jobs board, on the demo.
    if not _ensure_role(page, cfg, "admin", cfg["_target"]):
        return False, "could not sign in as the operator"
    for path, label, scope in (("/admin/workplan", "Workplan", "main"), ("/admin/jobs", "operator Jobs board", "main")):
        page.goto(cfg["_target"].rstrip("/") + path)
        if not _wait_for(page, f"{scope} [data-testid='status-mark']", 10000):
            problems.append(f"{label}: no status marks")
            continue
        page.wait_for_timeout(settle_ms)
        _marks_on(page, scope, label, problems)
        no_lamps(label)
    ok = not problems
    return ok, ("one mark per task with its word on Job management, a module page, the Workplan and the operator's "
                "board; red agrees with overdue or blocked; no RAG lamp in a task row; edges 3:1, words 4.5:1"
                if ok else "; ".join(list(dict.fromkeys(problems))[:6]))


def drv_header_both_marks(page, cfg, line, res, errors):
    """Line 81: the client page header carries the MITMARK mark, right-
    aligned, with "Delivered by MITMARK Intelligence" from 768px (4.5:1) and
    the mark alone beneath, and never the client's logo or name; the menu
    head carries the client's mark or name; the admin workspace has none of
    it; View as client shows the client's header exactly."""
    settle_ms = line.get("settle_ms", 500)
    problems = []

    def check_header(label):
        hdr = page.locator("header:has([data-testid='header-mitmark'])")
        if hdr.count() != 1:
            problems.append(f"{label}: the page header does not carry the MITMARK mark once")
            return
        mark = hdr.first.locator("[data-testid='header-mitmark']")
        img = mark.locator("img")
        if img.count() != 1 or _img_width(img.first) <= 0:
            problems.append(f"{label}: the MITMARK mark did not load")
        hb, mb = hdr.first.bounding_box(), mark.first.bounding_box()
        if hb and mb and (hb["x"] + hb["width"]) - (mb["x"] + mb["width"]) > 48:
            problems.append(f"{label}: the MITMARK mark is not right-aligned")
        words = mark.locator("[data-testid='header-mitmark-words']")
        shown = words.count() == 1 and words.first.is_visible()
        if res["width"] >= 768:
            if not shown or _text(words.first) != FOOTER_TEXT:
                problems.append(f"{label}: the words '{FOOTER_TEXT}' are not beside the mark")
            else:
                ratio = words.first.evaluate(_TEXT_RATIO_JS)
                if ratio < 4.5:
                    problems.append(f"{label}: the header words measure {ratio}:1")
        elif shown:
            problems.append(f"{label}: the words show below 768px")
        if hdr.first.locator("[data-testid='client-logo-header'], [data-testid='client-name-fallback-header']").count():
            problems.append(f"{label}: the client's logo or name is in the page header")
        if page.locator("aside [data-testid='client-logo-sidebar'], aside [data-testid='client-name-fallback']").count() != 1:
            problems.append(f"{label}: the menu head does not carry the client's mark once")

    if not _ensure_role(page, cfg, "client", cfg["_target"]):
        return False, "could not sign in as the client account"
    _enter_view(page, "tracker", None, settle_ms, cfg, "client")
    _wait_for(page, "[data-testid='header-mitmark']", 8000)
    page.wait_for_timeout(settle_ms)
    check_header("client portal")
    if not _ensure_role(page, cfg, "admin", cfg["_target"]):
        return False, "could not sign in as the operator"
    page.goto(cfg["_target"].rstrip("/") + "/admin")
    _wait_for(page, "[data-testid='org-switcher']", 8000)
    page.wait_for_timeout(settle_ms)
    if page.locator("[data-testid='header-mitmark'], [data-testid='client-footer'], [data-testid='mitmark-watermark']").count():
        problems.append("the admin workspace carries the client header mark, footer or watermark")
    if not _enter_view(page, "client-view", None, settle_ms, cfg, "admin"):
        problems.append("View as client was not reachable")
    else:
        _wait_for(page, "[data-testid='header-mitmark']", 8000)
        page.wait_for_timeout(settle_ms)
        check_header("View as client (demo)")
        _leave_client_view(page, settle_ms)
    ok = not problems
    return ok, ("header carries the MITMARK mark right-aligned, words from 768px at 4.5:1 or better, no client logo "
                "in the header and one in the menu head; none on the admin side; View as client the same"
                if ok else "; ".join(problems[:6]))


_TEXT_RATIO_JS = r"""
(el) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1; canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const rgba = (col) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = col; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const over = (t, b) => [0, 1, 2].map((i) => t[i] * t[3] + b[i] * (1 - t[3])).concat([1]);
  const stack = [];
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    const c = rgba(getComputedStyle(n).backgroundColor);
    if (c[3] > 0) stack.push(c);
    if (c[3] >= 1) break;
  }
  let bg = [255, 255, 255, 1];
  for (let i = stack.length - 1; i >= 0; i--) bg = over(stack[i], bg);
  const fg = over(rgba(getComputedStyle(el).color), bg);
  const lum = (rgb) => { const c = rgb.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const x = lum(fg), y = lum(bg);
  return Math.round(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)) * 100) / 100;
}
"""


def drv_quick_start(page, cfg, line, res, errors):
    """Line 82: the client quick start exists, is one page, names the six
    menu items, is role-only (no codename, no address, no link, no
    restricted name), and check_restricted.py passes on the folder,
    including the built bundle."""
    if not _api_only_once(line, res):
        return True, "file level; run once, at the first resolution"
    import subprocess
    problems = []
    path = cfg["root"] / QUICK_START
    if not path.is_file():
        return False, f"{QUICK_START} does not exist"
    text = path.read_text(encoding="utf-8")
    words = len(re.findall(r"\b\w+\b", text))
    if words > QUICK_START_MAX_WORDS:
        problems.append(f"{words} words, more than one page ({QUICK_START_MAX_WORDS})")
    hit = QUICK_START_FORBIDDEN.search(text)
    if hit:
        problems.append(f"carries '{hit.group(0)}'")
    for label in CLIENT_MENU_LABELS:
        if label not in text:
            problems.append(f"does not name the menu item '{label}'")
    if "your MITMARK contract lead" not in text:
        problems.append("does not name the contact by role ('your MITMARK contract lead')")
    for name in (load_restricted_names(cfg) or []):
        if name and name.lower() in text.lower():
            problems.append("carries a restricted name")
            break
    bundle = cfg["root"] / "06_EXECUTION/build/maximus-src/netlify/functions"
    web = cfg["root"] / "06_EXECUTION/build/maximus-src/apps/web/dist"
    if not web.is_dir():
        problems.append("the built web bundle is not present to scan")
    run = subprocess.run([sys.executable, str(cfg["root"] / "06_EXECUTION/gate/check_restricted.py")],
                         cwd=str(cfg["root"]), capture_output=True, text=True)
    tail = (run.stdout or "").strip().splitlines()[-1:] or [""]
    if run.returncode != 0 or not tail[0].endswith(" 0 hits"):
        problems.append(f"check_restricted.py: exit {run.returncode}, '{tail[0]}'")
    ok = not problems
    return ok, (f"{QUICK_START}: {words} words, six menu items, contact by role, no codename, address, link or "
                f"restricted name; check_restricted.py '{tail[0]}' (bundle {'present' if bundle.exists() or web.is_dir() else 'absent'})"
                if ok else "; ".join(problems[:6]))


def drv_client_org_quiet(page, cfg, line, res, errors):
    """Line 83: the gate wrote nothing to the client organisation. Its audit
    log carries no entry made since this run began. Checked by a read, at
    the last resolution, after every other line."""
    if res["name"] != line.get("applies_to", [res["name"]])[-1]:
        return True, "checked once, at the last resolution, after every other line"
    try:
        operator = _ApiSeat(cfg, "admin")
        entries = _audit_entries(operator, f"/admin/audit?accountId={CLIENT_ORG_ID}")
    except RuntimeError as exc:
        return False, str(exc)
    since = [e for e in entries if str(e.get("createdAt", "")) >= RUN_STARTED_AT]
    if since:
        return False, f"{len(since)} entries since {RUN_STARTED_AT}Z: " + ", ".join(
            f"{e.get('createdAt')} {e.get('action')}" for e in since[:5])
    return True, f"no audit entry on the client organisation since the run began ({RUN_STARTED_AT}Z); {len(entries)} in all"


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
    # v1.5, named accounts, organisations and seed (FRAGO 05).
    "users_lifecycle_audit": drv_users_lifecycle_audit,
    "password_change_enforced": drv_password_change_enforced,
    "change_password_web": drv_change_password_web,
    "users_page_one_time_password": drv_users_page_one_time_password,
    "organisations_api": drv_organisations_api,
    "org_switcher": drv_org_switcher,
    "client_view_follows_org": drv_client_view_follows_org,
    "client_isolation": drv_client_isolation,
    "seed_manifest": drv_seed_manifest,
    "seeded_org_no_restricted": drv_seeded_org_no_restricted,
    "auth_login_audit_no_session": drv_auth_login_audit_no_session,
    # v1.6 (FRAGO 06)
    "module_page_sections": drv_module_page_sections,
    "module_useful_links": drv_module_useful_links,
    "module_milestones": drv_module_milestones,
    "module_counters": drv_module_counters,
    "figures_operator_only": drv_figures_operator_only,
    "statement_three_parts": drv_statement_three_parts,
    "register_aliases_resolve": drv_register_aliases_resolve,
    # v1.7 (FRAGO 07)
    "documents_download": drv_documents_download,
    "client_upload_queue": drv_client_upload_queue,
    "documents_pages": drv_documents_pages,
    "operator_board_drag": drv_operator_board_drag,
    "no_drag_client_side": drv_no_drag_client_side,
    "ask_in_client_view": drv_ask_in_client_view,
    "test_seat_excluded": drv_test_seat_excluded,
    "no_service_lines_wording": drv_no_service_lines_wording,
    "migration_counts_equal": drv_migration_counts_equal,
    "corpus_every_file": drv_corpus_every_file,
    "guide_cites_documents": drv_guide_cites_documents,
    "review_queue_page": drv_review_queue_page,
    "new_org_modules_available": drv_new_org_modules_available,
    # v1.8 (FRAGO 08)
    "logo_upload_limits": drv_logo_upload_limits,
    "logo_isolation": drv_logo_isolation,
    "logo_fallback_text": drv_logo_fallback_text,
    "footer_watermark": drv_footer_watermark,
    "watermark_contrast": drv_watermark_contrast,
    "client_org_ready": drv_client_org_ready,
    # v1.9 (FRAGO 09)
    "decision_notes": drv_decision_notes,
    "upload_category": drv_upload_category,
    "status_marks": drv_status_marks,
    "header_both_marks": drv_header_both_marks,
    "quick_start": drv_quick_start,
    "client_org_quiet": drv_client_org_quiet,
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

#!/usr/bin/env python
"""Restricted-name check, run before every commit and every deploy.

The names live only in material/restricted/CLIENT.md, which is outside git.
This script reads them at run time, scans the working tree, and never prints a
name: a hit is reported as a path and a line number with the match redacted.

An absent or unreadable source of names is a FAIL, not a silent pass.

Usage:
    python 06_EXECUTION/gate/check_restricted.py [root]

Exit 0 when clean, 1 on a hit, 2 when the names could not be read.
"""

import os
import re
import sys

SKIP_DIRS = {
    ".git",
    "node_modules",
    "material",
    ".data",
    ".netlify",
    "__pycache__",
    ".vite",
    "test-results",
    "playwright-report",
}

# Words that are too generic to be identifying on their own. A term is only
# treated as restricted if it is distinctive; a common noun inside a company
# name would otherwise flag every ordinary use of that noun.
GENERIC = {
    "estates",
    "estate",
    "group",
    "holdings",
    "limited",
    "ltd",
    "partners",
    "partner",
    "company",
    "properties",
    "property",
    "services",
    "trust",
}


def restricted_names(root: str) -> list[str]:
    """Names from the environment, else from the restricted file. Never printed."""
    env = os.environ.get("ASSURE_RESTRICTED_NAMES")
    raw: list[str] = []
    if env:
        raw = [t.strip() for t in env.split(",") if t.strip()]
    else:
        path = os.path.join(root, "material", "restricted", "CLIENT.md")
        try:
            text = open(path, encoding="utf-8").read()
        except OSError:
            return []
        # FRAGO 11 3.1: every client entry, not the first. A Client line may
        # carry a note in brackets after the name; only the name is taken.
        for m in re.finditer(r"^- Client:\s*([^(\n]+)", text, re.M):
            if m.group(1).strip():
                raw.append(m.group(1).strip())
        for m in re.finditer(r"^- Information Officer:\s*([^(.\n]+)", text, re.M):
            if m.group(1).strip():
                raw.append(m.group(1).strip())
    return raw


def names_count(root: str) -> int:
    return len(restricted_names(root))


def restricted_terms(root: str) -> list[str]:
    """Each name, plus each distinctive word in it. Never printed."""
    raw = restricted_names(root)
    terms: set[str] = set()
    for name in raw:
        terms.add(name)
        for word in name.split():
            if len(word) > 3 and word.lower() not in GENERIC:
                terms.add(word)
    return sorted(terms)


def main() -> int:
    root = sys.argv[1] if len(sys.argv) > 1 else "."
    terms = restricted_terms(root)
    if not terms:
        print("FAIL: no restricted names could be read. An absent list is not a pass.")
        return 2

    patterns = [re.compile(re.escape(t), re.I) for t in terms]
    hits = 0
    scanned = 0

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            path = os.path.join(dirpath, name)
            scanned += 1
            for pattern in patterns:
                if pattern.search(path):
                    print(f"HIT path: {path} [REDACTED]")
                    hits += 1
                    break
            try:
                text = open(path, encoding="utf-8", errors="ignore").read()
            except OSError:
                continue
            for number, line in enumerate(text.splitlines(), 1):
                for pattern in patterns:
                    if pattern.search(line):
                        print(f"HIT content: {path}:{number} [REDACTED]")
                        hits += 1
                        break

    print(f"{len(terms)} restricted terms from {names_count(root)} names checked across {scanned} files, {hits} hits")
    return 1 if hits else 0


if __name__ == "__main__":
    sys.exit(main())

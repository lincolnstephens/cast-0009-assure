import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? "test-secret";

// Safety net: point the store at a throwaway directory before any test runs,
// so nothing ever touches the real `.data` directory even if a suite forgets
// to call freshStore() itself. Suites that need per-test isolation still call
// freshStore() (see test/helpers.ts) in their own beforeEach.
process.env.ASSURE_DATA_DIR = mkdtempSync(path.join(tmpdir(), "assure-setup-"));

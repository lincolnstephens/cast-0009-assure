import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

// The Postgres build's seed script refused to run without
// SEED_CLIENT_PASSWORD / SEED_OFFICER_PASSWORD set, because there was no
// other way to sign in to the demo. This build's gate needs to work with no
// credential configured at all (see PORTING_BRIEF.md), so the intent has
// reversed: the seed script now falls back to the literal password "demo"
// for both accounts when the env vars are unset, and must never print a
// configured password to the log.

let dataDir: string;

beforeEach(() => {
  dataDir = mkdtempSync(path.join(tmpdir(), "assure-seed-test-"));
});

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

function runSeed(env: Record<string, string>, args = "--clean"): string {
  return execSync(`pnpm --filter @maximus/server exec tsx scripts/seed.ts ${args}`, {
    cwd: root,
    env: { ...process.env, ASSURE_DATA_DIR: dataDir, ...env },
    encoding: "utf8",
    stdio: "pipe",
  });
}

describe("seed credential fallback", () => {
  it("falls back to the demo password for both accounts when the env vars are unset", () => {
    const output = runSeed({ SEED_CLIENT_PASSWORD: "", SEED_OFFICER_PASSWORD: "" });
    expect(output).toContain("Seed complete");

    const usersDoc = JSON.parse(readFileSync(path.join(dataDir, "users.json"), "utf8"));
    const client = usersDoc.users.find((u: { email: string }) => u.email === "demo@demo.local");
    const officer = usersDoc.users.find(
      (u: { email: string }) => u.email === "operator@demo.local",
    );
    expect(client).toBeTruthy();
    expect(officer).toBeTruthy();
    expect(bcrypt.compareSync("demo", client.passwordHash)).toBe(true);
    expect(bcrypt.compareSync("demo", officer.passwordHash)).toBe(true);
  }, 30000);

  it("never prints a configured password to stdout", () => {
    const output = runSeed({
      SEED_CLIENT_PASSWORD: "a-configured-client-secret",
      SEED_OFFICER_PASSWORD: "a-configured-officer-secret",
    });
    expect(output).toContain("Seed complete");
    expect(output).not.toContain("a-configured-client-secret");
    expect(output).not.toContain("a-configured-officer-secret");
  }, 30000);
});

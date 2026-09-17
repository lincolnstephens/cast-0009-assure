import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Restore pristine demo data before smoke tests (stub mode, no chat history). */
export default async function globalSetup() {
  execSync("pnpm seed:reset", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ANTHROPIC_API_KEY: "" },
  });
}

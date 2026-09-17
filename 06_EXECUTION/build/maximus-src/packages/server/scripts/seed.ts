import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../.env"),
});
config();

import { seedAll } from "../src/lib/seedData.ts";

/**
 * Command-line entry point. The actual seeding lives in
 * src/lib/seedData.ts, which is also called from the request path
 * (see ensureSeeded, wired into app.ts) so a fresh Netlify Blobs store
 * seeds itself on first request. This script is a thin wrapper that keeps
 * the historical --clean / --demo / --reset flags working from the shell.
 */
async function main(): Promise<void> {
  const isReset = process.argv.includes("--reset");
  const isDemo = process.argv.includes("--demo");
  const isClean = process.argv.includes("--clean") || (!isDemo && !isReset);
  const mode = isReset ? "reset" : isDemo ? "demo" : isClean ? "clean" : "clean";

  await seedAll({ reset: isReset });
  console.log(`(mode: ${mode})`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

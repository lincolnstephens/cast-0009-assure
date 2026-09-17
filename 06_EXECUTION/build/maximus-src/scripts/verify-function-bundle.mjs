/**
 * Local check that the api function is classified as v1 (so esbuild applies) and
 * that zip-it-and-ship-it's esbuild pass inlines runtime dependencies.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundleJsFile } from "@netlify/zip-it-and-ship-it/dist/runtimes/node/bundlers/esbuild/bundler.js";
import { getExternalAndIgnoredModulesFromSpecialCases } from "@netlify/zip-it-and-ship-it/dist/runtimes/node/bundlers/esbuild/special_cases.js";
import { parseFile } from "@netlify/zip-it-and-ship-it/dist/runtimes/node/in_source_config/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "netlify/functions");
const mainFile = path.join(srcDir, "api.mts");

const analysis = await parseFile(mainFile, { functionName: "api" });
if (analysis.runtimeAPIVersion === 2) {
  console.error(
    "api.mts is classified as Netlify Functions v2; node_bundler = esbuild is ignored (NFT is forced).",
  );
  process.exit(1);
}

const { externalModules, ignoredModules } = await getExternalAndIgnoredModulesFromSpecialCases({
  config: {},
  srcDir,
});

const result = await bundleJsFile({
  additionalModulePaths: [],
  config: {},
  externalModules,
  featureFlags: {},
  ignoredModules,
  mainFile,
  name: "api",
  srcDir,
  srcFile: mainFile,
  runtimeAPIVersion: 1,
});

const bundlePath = [...result.bundlePaths.keys()][0];
const content = await readFile(bundlePath, "utf8");
await result.cleanTempFiles();

const MUST_INLINE = [
  "zod",
  "hono",
  "drizzle-orm",
  "@neondatabase/serverless",
  "@maximus/shared",
  "pdf-lib",
  "jszip",
  "bcryptjs",
  "luxon",
];

const importFrom = (pkg) =>
  new RegExp(`^import\\s+.+\\s+from\\s+["']${pkg.replace("/", "\\/")}["']`, "m").test(content);

const stillExternal = MUST_INLINE.filter((pkg) => importFrom(pkg));
if (stillExternal.length > 0) {
  console.error("Runtime packages not inlined by esbuild:", stillExternal.join(", "));
  process.exit(1);
}

const otherBareImports = [
  ...content.matchAll(/^import\s+.+?\s+from\s+["']([^"']+)["']/gm),
]
  .map((match) => match[1])
  .filter((specifier) => !specifier.startsWith(".") && !specifier.startsWith("node:"));
if (otherBareImports.length > 0) {
  console.error("Unexpected bare ESM imports in bundle:", [...new Set(otherBareImports)].join(", "));
  process.exit(1);
}

if (!content.includes("app.fetch")) {
  console.error("Bundle does not contain the Hono app entry.");
  process.exit(1);
}

console.log(
  `OK: api function is v1, esbuild bundle is ${(content.length / 1024 / 1024).toFixed(1)} MiB with no bare runtime imports`,
);

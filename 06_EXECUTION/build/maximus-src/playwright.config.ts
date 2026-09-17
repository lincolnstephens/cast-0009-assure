import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  globalSetup: "./e2e/global-setup.mjs",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8888",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:8888/api/health",
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === "true",
    timeout: 300_000,
    env: {
      ...process.env,
      ANTHROPIC_API_KEY: "",
    },
  },
});

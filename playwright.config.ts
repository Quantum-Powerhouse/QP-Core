import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests for QPIT's pointer physics — things unit tests can't cover:
 * real pointer events, rAF-driven transforms, hydration, and that QPIT
 * never blocks normal page interaction.
 *
 * Runs against a dev server on port 3111 (chosen to never collide with
 * other local Next apps). `npm run test:e2e`.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3111",
    ...devices["Desktop Chrome"],
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- -p 3111",
    url: "http://localhost:3111",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

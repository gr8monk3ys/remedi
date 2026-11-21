/**
 * Playwright E2E Testing Configuration
 *
 * Configures end-to-end testing for the Remedi application.
 * Tests critical user flows including search, authentication, and favorites.
 *
 * @see https://playwright.dev/docs/test-configuration
 */

import { defineConfig, devices } from "@playwright/test";

const playwrightPort = Number(process.env.PLAYWRIGHT_PORT || "3105");
const baseURL =
  process.env.PLAYWRIGHT_TEST_BASE_URL || `http://localhost:${playwrightPort}`;
const configuredWorkers = Number(process.env.PLAYWRIGHT_WORKERS || "2");

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",

  // Local E2E runs against a Next dev server and external APIs; allow extra room
  // to reduce false failures from startup and transient I/O slowness.
  timeout: 45_000,

  /* Tests can run in parallel; they share one E2E user session. */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* CI runs serially; local defaults to PLAYWRIGHT_WORKERS (4). */
  workers: process.env.CI ? 1 : configuredWorkers,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html", { open: "never" }],
    process.env.CI ? ["github"] : ["list"],
    // Read by scripts/verify_summary.py for the VERIFY evidence line.
    ["json", { outputFile: "reports/e2e.json" }],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* CI keeps a trace and a screenshot of every test as the ui-evidence
       artifact; locally only on retry/failure. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? "on" : "on-first-retry",
    screenshot: process.env.CI ? "on" : "only-on-failure",

    /* Video on failure */
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    // Creates the E2E user and its session (e2e/auth.setup.ts).
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },

    // Uncomment to test on more browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command:
      process.env.PLAYWRIGHT_WEBSERVER_COMMAND ||
      `export PORT=${playwrightPort} BETTER_AUTH_URL=${baseURL} E2E_DISABLE_SENTRY=true; npm run dev -- --webpack --port ${playwrightPort}`,
    url: baseURL,
    cwd: process.cwd(),
    reuseExistingServer: true,
    stdout: "ignore",
    stderr: "pipe",
    timeout: 120 * 1000,
  },
});

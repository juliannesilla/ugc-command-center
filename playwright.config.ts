import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the UGC Command Center dashboard.
 *
 * Default base URL is http://localhost:3000 (Next dev server). Override via
 * PLAYWRIGHT_BASE_URL to point at a Vercel preview / static-export server.
 *
 * Run locally:
 *   npm run test:e2e            # headless
 *   npm run test:e2e -- --ui    # interactive UI mode
 *   npm run test:e2e -- --debug # step-through debug
 *
 * Browsers must be installed once:
 *   npx playwright install --with-deps chromium
 */
export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Only auto-start dev server when running locally (not when targeting a
  // preview URL). Set PLAYWRIGHT_SKIP_WEBSERVER=1 to disable explicitly.
  webServer:
    process.env.PLAYWRIGHT_BASE_URL || process.env.PLAYWRIGHT_SKIP_WEBSERVER
      ? undefined
      : {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
});

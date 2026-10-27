import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/setup.ts',
  // Multi-board championships include dozens of UI actions. Keep their overall
  // budget separate from the tighter action/assertion limits below.
  timeout: 60_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  // Keep browser load predictable on developer machines as well as CI.
  // Six simultaneous browsers can exhaust the per-test timeout during startup.
  workers: process.env.PLAYWRIGHT_WORKERS === '1' ? 1 : 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4192/MarioTriviaQuiz/',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'webkit-phone',
      // Reuse behavioural assertions, not weaker Safari-only copies. Physical
      // iPhone/Safari and Home Screen acceptance testing is still required.
      testMatch: /(?:phone-flow|countdown|resume|shared-board-replay|simple-points|championship-header|timed-match-results|difficulty-controls|clue-track-feedback|discovery-feedback)\.spec\.ts$/,
      use: { ...devices['iPhone 13'], browserName: 'webkit' },
    },
  ],
});

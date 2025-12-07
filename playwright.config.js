import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['html'], ['list'], ['allure-playwright']]
    : 'html',

  // Snapshot configuration for visual comparisons
  snapshotDir: './e2e/fixtures/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',

  // Expect configuration
  expect: {
    toHaveScreenshot: {
      threshold: 0.1,
      maxDiffPixels: 100,
    },
    toMatchSnapshot: {
      threshold: 0.1,
    },
  },

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',

    // PDF download configuration
    acceptDownloads: true,
  },

  // Output directories
  outputDir: './e2e/test-results',

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Only start local server if BASE_URL is not provided (local development)
  webServer: process.env.BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});

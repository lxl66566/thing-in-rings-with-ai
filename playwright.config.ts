import process from 'node:process';

import { defineConfig, devices } from '@playwright/test';

const port = 3000;
// vite.config.ts sets a public base path; the dev server only serves under it.
const appPath = '/thing-in-rings-with-ai/';
const baseURL = `http://localhost:${String(port)}${appPath}`;

export default defineConfig({
  fullyParallel: true,
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13 mini'] } },
  ],
  reporter: 'list',
  retries: process.env.CI ? 2 : 0,
  testDir: './e2e',
  // *.e2e.ts so vitest (which runs every *.spec.ts) does not pick these up.
  testMatch: '**/*.e2e.ts',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev -- --port 3000 --strictPort',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: baseURL,
  },
});

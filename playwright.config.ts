import * as os from 'os';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    [
      'allure-playwright',
      {
        outputFolder: 'allure-results',
        detail: false,
        suiteTitle: true,
        environmentInfo: {
          os_platform: os.platform(),
          os_version: os.version(),
          node_version: process.version,
        },
      },
    ],
  ],
  testDir: './',

  use: {
    trace: 'retain-on-failure',
    actionTimeout: 30000,
    navigationTimeout: 60000,
    headless: true,
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'ui-tests',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

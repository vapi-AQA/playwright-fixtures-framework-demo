import { test as baseTest, expect, Page } from '@playwright/test';
import { wrapPageWithAllure } from '../ui/index.js';

export const test = baseTest.extend<{
  page: Page;
}>({
  page: async ({ page }, use) => {
    wrapPageWithAllure(page);
    await use(page);
  },
});

export { expect };

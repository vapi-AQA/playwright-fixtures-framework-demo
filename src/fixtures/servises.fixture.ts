import { test as baseTest } from '@playwright/test';
import { GoogleService } from '../api/service/google.service.js';

declare global {
  namespace PlaywrightTestArgs {
    interface Fixtures {
      googleService: GoogleService;
    }
  }
}

export const test = baseTest.extend<{
  googleService: GoogleService;
}>({
  googleService: async ({}, use) => {
    await use(new GoogleService());
  },
});


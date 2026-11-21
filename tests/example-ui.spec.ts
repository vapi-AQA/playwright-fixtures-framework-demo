import { test, expect } from '../src/fixtures/merge.fixtures';
import { allure } from 'allure-playwright';

test.describe('NavbarFragment @ui', () => {
  test.beforeEach(async ({ mainPage, page }) => {
    allure.label('epic', 'UI Components');
    allure.label('feature', 'Navigation Bar');
    await page.goto('https://playwright.dev/', { waitUntil: 'domcontentloaded' });
    await page.locator('html[data-has-hydrated="true"]').waitFor();
  });

  test('goToDocs @smoke', async ({ mainPage, page }) => {
    allure.label('story', 'Documentation Navigation');
    allure.severity('blocker');
    allure.tag('smoke');

    await test.step('Переходим в документацию', async () => {
      await mainPage.navbar.goToDocs();
      const screenshot = await page.screenshot();
      await allure.attachment('screenshot', screenshot, {
        contentType: 'image/png',
      });
    });

    await test.step('Проверяем URL', async () => {
      const url = page.url();
      allure.parameter('Current URL', url);
      expect(url).toContain('/docs/intro');
    });
  });

  test('goToApi', async ({ mainPage, page }) => {
    await mainPage.navbar.goToApi();
    await expect(page).toHaveURL(/\/docs\/api\/class-playwright/);
  });

  test('goToCommunity', async ({ mainPage, page }) => {
    await mainPage.navbar.goToCommunity();
    await expect(page).toHaveURL(/\/community\/ambassadors/);
  });

  test('openGithub', async ({ mainPage, page }) => {
    const popupPromise = page.waitForEvent('popup');
    await mainPage.navbar.openGithub();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(/github\.com\/microsoft\/playwright/);
  });

  test('openDiscord', async ({ mainPage, page }) => {
    const popupPromise = page.waitForEvent('popup');
    await mainPage.navbar.openDiscord();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(/discord/);
  });

  test('search', async ({ mainPage, page }) => {
    await mainPage.navbar.search();
    const searchInput = page.getByPlaceholder('Search docs');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await expect(searchInput).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(searchInput).toBeHidden();
  });

  test('toggleTheme', async ({ mainPage, page }) => {
    const html = page.locator('html');
    const themeBefore = await html.getAttribute('data-theme-choice');
    await mainPage.navbar.toggleTheme();
    await expect(html).not.toHaveAttribute('data-theme-choice', themeBefore ?? '');
  });

  test('navbar shows the Playwright title and logo', async ({ mainPage }) => {
    await expect(mainPage.navbar.logo).toBeVisible();
    expect(await mainPage.navbar.getTitleText()).toBe('Playwright');
  });

  test('selectLanguage switches the site to Python', async ({ mainPage, page }) => {
    await mainPage.navbar.selectLanguage('Python');
    await expect(page).toHaveURL(/\/python\//);
  });

  test('logo returns to the home page', async ({ mainPage, page }) => {
    await mainPage.navbar.goToDocs();
    await expect(page).toHaveURL(/\/docs\/intro/);
    await mainPage.navbar.goHome();
    await expect(page).toHaveURL('https://playwright.dev/');
  });

  test('goToMcp', async ({ mainPage, page }) => {
    await mainPage.navbar.goToMcp();
    await expect(page).toHaveURL(/\/mcp\/introduction/);
  });
});

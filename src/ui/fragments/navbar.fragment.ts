import { BaseFragment } from './base.fragment.js';
import { allure } from 'allure-playwright';

export class NavbarFragment extends BaseFragment {
  protected initLocators(): void {
    this.locators = {
      logo: this.page.getByRole('link', { name: 'Playwright logo Playwright' }),
      title: this.page.getByRole('navigation', { name: 'Main' }).getByText('Playwright', { exact: true }),
      docsLink: this.page.getByRole('link', { name: 'Docs' }),
      apiLink: this.page.getByRole('link', { name: 'API' }),
      mcpLink: this.page.getByRole('link', { name: 'MCP', exact: true }),
      // Пункта Community в текущей версии сайта в навбаре нет, ссылка ведёт в раздел /community
      communityLink: this.page.getByRole('link', { name: 'Ambassadors' }),
      languageMenuTrigger: this.page.getByRole('button', { name: 'Node.js' }),
      languageMenu: this.page.locator('.dropdown__menu'),
      pythonLink: this.page.getByText('Python'),
      javaLink: this.page.getByText('Java'),
      dotnetLink: this.page.getByText('.NET'),
      githubLink: this.page.getByLabel('GitHub repository'),
      discordLink: this.page.getByLabel('Discord server'),
      themeToggle: this.page.getByLabel('Switch between dark and light mode'),
      searchButton: this.page.getByRole('button', { name: /^Search \(/ }),
      dropdownMenu: this.page.locator('.dropdown__menu'),
    };
  }

  get languageMenuTrigger() {
    return this.locators.languageMenuTrigger;
  }

  get logo() {
    return this.locators.logo;
  }

  async goHome() {
    await allure.step('Возврат на главную через логотип Navbar', async () => {
      await this.locators.logo.click();
    });
  }

  async goToMcp() {
    await allure.step('Переход в MCP через Navbar', async () => {
      await this.locators.mcpLink.click();
    });
  }

  async goToDocs() {
    await allure.step('Переход в Docs через Navbar', async () => {
      await this.locators.docsLink.click();
    });
  }

  async goToApi() {
    await allure.step('Переход в API через Navbar', async () => {
      await this.locators.apiLink.click();
    });
  }

  async goToCommunity() {
    await allure.step('Переход в Community через Navbar', async () => {
      await this.locators.communityLink.click();
    });
  }

  async openGithub() {
    await allure.step('Открытие GitHub через Navbar', async () => {
      await this.locators.githubLink.click();
    });
  }

  async openDiscord() {
    await allure.step('Открытие Discord через Navbar', async () => {
      await this.locators.discordLink.click();
    });
  }

  async search() {
    await allure.step('Открытие поиска через Navbar', async () => {
      await this.locators.searchButton.click();
    });
  }

  async getTitleText(): Promise<string | null> {
    return await allure.step('Получение текста заголовка Navbar', async () => {
      return this.locators.title.textContent();
    });
  }

  async selectLanguage(language: 'Node.js' | 'Python' | 'Java' | '.NET') {
    await allure.step(`Выбор языка ${language} через Navbar`, async () => {
      await this.locators.languageMenuTrigger.click();
      const langLocator = this.locators.dropdownMenu.getByText(language);
      await langLocator.click();
    });
  }

  async toggleTheme() {
    await allure.step('Переключение темы через Navbar', async () => {
      await this.locators.themeToggle.click();
    });
  }
}

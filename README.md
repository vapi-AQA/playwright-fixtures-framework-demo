# Playwright Fixtures Framework

Фреймворк для автоматизированного тестирования UI и API на Playwright. Проект дает готовую среду: все тесты пишутся через фикстуры, Page Object и Fragment Object, все действия и HTTP-запросы сами записываются в Allure-отчет, а образ инструмента запускается в Docker.

## Что делает фреймворк

- Фикстуры Playwright вместо постоянного переиспользования `page` вручную: `mainPage`, `googleService`, `page` (обернутый для Allure).
- Объединение фикстур и матчеров: `merge.fixtures` создает один `test` для всех тестов.
- Page Object: `MainPage` с `NavbarFragment`: переиспользуемые действия навигации, локаторы, проверки текста.
- API-слой: `GoogleService` и `httpRequest` для HTTP-запросов с автоматическими вложениями в Allure.
- Матчеры типов: `toBeNumber`, `toBeString`, `toBeBoolean`, `toBeObject`, `toBeArray`, `toBeNull`, `toBeUndefined`.
- CI-интеграция: прогон тестов и публикация Allure-отчета на GitHub Pages.
- Docker-инструмент: сборка и запуск тестов в контейнере на базе Playwright.

## Почему это хорошо

- Все настройки в одном месте: POM-классы дают новым сотрудникам один стиль написания тестов.
- Allure по умолчанию: каждое действие (клик, переход по URL, запрос) пишется шагом в отчет, запросы и ответы прикрепляются автоматически.
- Все запросы через `httpRequest` попадают в Allure с заголовками, телами и статусами.
- Типы добавляются без исправления существующих импортов: `PlaywrightTestArgs` и `PlaywrightTest.Matchers`.
- Обновлять тесты при смене сайта удобно: меняется только локатор в `NavbarFragment`.

## Требования

- Node.js 20+
- npm 8+
- Playwright 1.52+

## Установка

```bash
npm install
npx playwright install
```

## Структура

```
src/
  api/
    service/          GoogleService: пример API-сервиса
    allureReport.ts   шаги и вложения Allure
    http_methods.ts   httpRequest, APIOptions, базовый класс API
  fixtures/           фикстуры тестов (test, expect, merge)
  ui/
    pages/            BasePage, MainPage
    fragments/        BaseFragment, NavbarFragment
    decorators/       обертки: шаги для click/fill, шаги для URL/моков, враппер page
    index.ts          wrapPageWithAllure
  utils/              format.utils: строки, формат селекторов, Helpers
tests/                example-ui, example-api, api
.github/workflows/    Playwright + Allure + GitHub Pages
Dockerfile
.dockerignore
```

## Команды

| Команда | Что делает |
| --- | --- |
| `npm test` | Прогнать все тесты |
| `npm run test:ui` | UI-режим Playwright |
| `npm run test:debug` | Отладка теста |
| `npm run build` | Собрать `dist/` из `src/` |
| `npm run allure:generate` | Собрать Allure-отчет в `allure-report/` |
| `npm run allure:open` | Открыть собранный отчет |
| `npm run test:report` | Тесты + отчет + открытие отчета |

## Фикстуры

Тесты импортируют `test` и `expect` из `src/fixtures/merge.fixtures`:

```typescript
import { test, expect } from '../src/fixtures/merge.fixtures';

test('открыть документацию', async ({ mainPage, page }) => {
  await page.goto('https://playwright.dev/');
  await mainPage.navbar.goToDocs();
  await expect(page).toHaveURL(/\/docs\/intro/);
});
```

Доступные фикстуры:

| Фикстура | Что дает |
| --- | --- |
| `page` | Playwright-браузер с добавленными шагами Allure |
| `mainPage` | Экземпляр `MainPage` |
| `googleService` | Экземпляр `GoogleService` |

## Page Object

```typescript
await mainPage.goto('https://playwright.dev/');
await mainPage.navbar.goToDocs();
await mainPage.navbar.selectLanguage('Python');
await mainPage.navbar.toggleTheme();
await expect(await mainPage.navbar.getTitleText()).toBe('Playwright');
```

Методы навбара: `goToDocs`, `goToApi`, `goToCommunity`, `goToMcp`, `goHome`, `openGithub`, `openDiscord`, `search`, `selectLanguage`, `toggleTheme`, `getTitleText`.

Новая страница: создайте класс от `BasePage` и добавьте его в `src/fixtures/pom-fixture.ts` (генерик `extend` и фикстуру).

## API

Сервис наследуется от базового класса `API` и вызывает `httpRequest`; возвращается объект `{ promise: APIResponse, json }`:

```typescript
import { httpRequest, APIOptions } from '../src/api/http_methods';

const options: APIOptions = {
  url: 'https://api.example.com',
  path: '/users',
  method: 'GET',
  params: { page: 1, limit: 10 },
};

const response = await httpRequest('Получить пользователей', options);

expect(response.promise.status()).toBe(200);
expect(response.json).toBeObject();
```

`data` уходит как JSON, `FormData` отправляется через `multipart` (границу задает Playwright). Параметры `params` добавляются в URL. API-слой покрыт тестами против локального сервера в `tests/api.spec.ts`.

## Docker

```bash
docker build -t playwright-fixtures-framework .
docker run --rm playwright-fixtures-framework
docker run --rm playwright-fixtures-framework npx playwright test tests/api.spec.ts
```

Внутри контейнера выставлен `CI=true` (один воркер). Результаты Allure остаются в `/app/allure-results`.

## Allure и CI

После прогона создается `allure-results/`; собрать и открыть отчет:

```bash
npm run allure:generate
npm run allure:open
```

Workflow `.github/workflows/playwright-allure.yml` гоняет тесты в контейнере Playwright и публикует Allure-отчет на GitHub Pages для веток `main` и `master`.

import { Page } from '@playwright/test';
import { allure } from 'allure-playwright';

function tryParseJson(input: string | null): any {
  if (!input) return null;
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

export function wrapNetworkActions(page: Page): void {
  const originalWaitForResponse = page.waitForResponse.bind(page);
  page.waitForResponse = async function (urlOrPredicate, options?) {
    const urlDescription = typeof urlOrPredicate === 'string' ? urlOrPredicate : '<предикат>';

    return await allure.step(`Ожидание ответа: ${urlDescription}`, async () => {
      const response = await originalWaitForResponse(urlOrPredicate, options);
      const request = response.request();

      const method = request.method();
      const url = request.url();
      const status = response.status();
      const statusText = response.statusText();

      const stepName = `${method} ${url} - ${status} ${statusText}`;
      await allure.step(stepName, async () => {
        allure.attachment('Заголовки запроса', JSON.stringify(request.headers(), null, 2), 'application/json');

        const postData = await request.postData();
        if (postData) {
          const parsedPostData = tryParseJson(postData);
          allure.attachment('Тело запроса', JSON.stringify(parsedPostData, null, 2), 'application/json');
        }

        allure.attachment('Заголовки ответа', JSON.stringify(response.headers(), null, 2), 'application/json');

        const responseBody = await response.text();
        const parsedResponseBody = tryParseJson(responseBody);
        allure.attachment('Тело ответа', JSON.stringify(parsedResponseBody, null, 2), 'application/json');
      });

      return response;
    });
  };

  const originalRoute = page.route.bind(page);
  page.route = async function (url, handler) {
    return await originalRoute(url, async (route, request) => {
      const actualUrl = request.url();
      const isMatched = typeof url === 'string' ? actualUrl === url : true;

      if (!isMatched) {
        return await handler(route, request);
      }

      const method = request.method();
      const stepName = `Мок запроса: ${actualUrl}`;

      return await allure.step(stepName, async () => {
        allure.attachment('Заголовки запроса', JSON.stringify(request.headers(), null, 2), 'application/json');

        const postData = await request.postData();
        if (postData) {
          const parsedPostData = tryParseJson(postData);
          allure.attachment('Тело запроса', JSON.stringify(parsedPostData, null, 2), 'application/json');
        }

        const originalFulfill = route.constructor.prototype.fulfill;

        route.fulfill = async function (response) {
          const status = response.status || 200;
          const statusText = response.statusText || 'OK';

          const fullStatusStep = `${method} ${actualUrl} - ${status} ${statusText}`;
          return await allure.step(fullStatusStep, async () => {
            allure.attachment('Заголовки ответа', JSON.stringify(response.headers || {}), 'application/json');

            const body = typeof response.body === 'string' ? response.body : response.body?.toString() || '';

            const parsedResponseBody = tryParseJson(body);

            allure.attachment('Тело ответа', JSON.stringify(parsedResponseBody, null, 2), 'application/json');

            return await originalFulfill.call(this, response);
          });
        };

        return await handler(route, request);
      });
    });
  };
}

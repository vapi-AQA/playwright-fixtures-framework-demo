export { test, expect } from './fixtures/merge.fixtures.js';
export { test as baseTest } from './fixtures/base.fixture.js';
export { test as pomTest } from './fixtures/pom-fixture.js';
export { test as serviceTest } from './fixtures/servises.fixture.js';
export { expect as typeExpect } from './fixtures/expect.js';

export { BasePage } from './ui/pages/base.page.js';
export { MainPage } from './ui/pages/main.page.js';
export { BaseFragment } from './ui/fragments/base.fragment.js';
export { NavbarFragment } from './ui/fragments/navbar.fragment.js';
export { wrapPageWithAllure } from './ui/index.js';

export { API, httpRequest } from './api/http_methods.js';
export type { APIOptions } from './api/http_methods.js';
export { GoogleService } from './api/service/google.service.js';

export { Helpers, format, formatSelector } from './utils/format.utils.js';

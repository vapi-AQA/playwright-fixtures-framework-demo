import { wrapPageWithAllureSteps } from './decorators/page.decorators.js';
import { wrapNetworkActions } from './decorators/network.decorators.js';

export function wrapPageWithAllure(page: any) {
  wrapPageWithAllureSteps(page);
  wrapNetworkActions(page);
}

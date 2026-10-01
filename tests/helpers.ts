import type { Page } from '@playwright/test';

export async function fillWithLongOutput(page: Page) {
  await page.getByLabel('Max chars').fill('50');
  await page.locator('#useNumbering').uncheck();
  await page.locator('#input').fill('word '.repeat(200));
}

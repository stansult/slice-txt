import { expect, test } from '@playwright/test';
import { textCases } from './fixtures/text-cases';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Max chars').fill('280');
  await page.locator('#useNumbering').uncheck();
  await page.getByRole('button', { name: 'Advanced' }).click();
  await page.locator('#perPartMaxOverride').check();
});

test('per-part limit changes splitting and clamps to global and minimum limits', async ({ page }) => {
  const input = 'x'.repeat(600);
  const parts = page.locator('.chunk .content');
  const firstPartLimit = page.locator('.part-max-input').first();

  await page.locator('#input').fill(input);
  await expect(parts).toHaveText(['x'.repeat(280), 'x'.repeat(280), 'x'.repeat(40)]);

  await firstPartLimit.fill('50');
  await firstPartLimit.press('Enter');
  await expect(parts).toHaveText(['x'.repeat(50), 'x'.repeat(280), 'x'.repeat(270)]);
  await expect(page.locator('.chunk .len')).toHaveText(['50', '280', '270']);

  await page.locator('.part-max-input').first().fill('10');
  await page.locator('.part-max-input').first().press('Enter');
  await expect(page.locator('.part-max-input').first()).toHaveValue('50');

  await page.locator('.part-max-input').first().fill('500');
  await page.locator('.part-max-input').first().press('Enter');
  await expect(page.locator('.part-max-input').first()).toHaveValue('280');
  await expect(parts).toHaveText(['x'.repeat(280), 'x'.repeat(280), 'x'.repeat(40)]);
});

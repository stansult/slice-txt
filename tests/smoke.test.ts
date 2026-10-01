import { expect, test } from '@playwright/test';

test('opens the app and renders its main UI', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Thread Splitter' })).toBeVisible();
});

import { test } from '@playwright/test';

test('opens the app', async ({ page }) => {
  await page.goto('/');
});

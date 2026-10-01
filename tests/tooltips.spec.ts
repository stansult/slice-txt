import { expect, test } from '@playwright/test';

test('tooltips appear on hover and keyboard focus on desktop', { tag: '@desktop' }, async ({ page }) => {
  await page.goto('/');

  await page.locator('#maxChars').hover();
  await expect(page.locator('#maxCharsTip')).toBeVisible();
  await expect(page.locator('#maxCharsTip')).toHaveText('Maximum characters per part.');

  await page.locator('#useNumbering').focus();
  await expect(page.locator('#counterTip')).toBeVisible();
});

test('mobile info buttons open and dismiss tooltips without activating controls', { tag: '@mobile' }, async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Advanced' }).tap();

  const perPartLimit = page.locator('#perPartMaxOverride');
  const infoButton = page.getByRole('button', { name: 'Individual part limit details' });
  const tooltip = page.locator('#perPartMaxTip');

  await expect(infoButton).toBeVisible();
  await expect(perPartLimit).not.toBeChecked();
  await infoButton.tap();
  await expect(tooltip).toBeVisible();
  await expect(perPartLimit).not.toBeChecked();

  await perPartLimit.tap();
  await expect(perPartLimit).toBeChecked();
  await expect(tooltip).toBeHidden();

  await infoButton.tap();
  await expect(tooltip).toBeVisible();
  await page.getByRole('heading', { name: 'Options' }).tap();
  await expect(tooltip).toBeHidden();
});

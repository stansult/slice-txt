import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { textCases } from './fixtures/text-cases';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Max chars').fill('50');
  await page.locator('#useNumbering').uncheck();
});

test('output action buttons reflect whether output exists', async ({ page }) => {
  await expect(page.locator('#copyAllBtn')).toBeDisabled();
  await expect(page.locator('#exportJsonBtn')).toBeDisabled();

  await page.locator('#input').fill(textCases.wordBoundary.input);

  await expect(page.locator('#copyAllBtn')).toBeEnabled();
  await expect(page.locator('#exportJsonBtn')).toBeEnabled();
  await expect(page.locator('.copyBtn')).toHaveCount(textCases.wordBoundary.expectedParts.length);
});

test('Copy and Copy all place the expected text on the clipboard', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.locator('#input').fill(textCases.wordBoundary.input);

  await page.locator('.copyBtn').first().click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(textCases.wordBoundary.expectedParts[0]);

  await page.locator('#copyAllBtn').click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(textCases.wordBoundary.expectedParts.join('\n\n'));
});

test('JSON export downloads the generated parts', async ({ page }) => {
  await page.locator('#input').fill(textCases.wordBoundary.input);

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#exportJsonBtn').click();
  const download = await downloadPromise;
  const path = await download.path();

  expect(download.suggestedFilename()).toBe('thread.json');
  expect(path).not.toBeNull();
  expect(JSON.parse(await readFile(path!, 'utf8'))).toEqual(textCases.wordBoundary.expectedParts);
});

test('emoji length tip explains grapheme-aware counting', async ({ page }) => {
  await page.locator('#input').fill(textCases.graphemeBoundary.input);

  await expect(page.locator('#lengthTip')).toHaveText('Tip: The counter uses emoji-aware grapheme length.');
});

test('URL length tip explains URL weighting', async ({ page }) => {
  await page.getByLabel('Max chars').fill('280');
  await page.locator('#input').fill(textCases.urlNearWeightedLimit.input);

  await expect(page.locator('#lengthTip')).toHaveText('Tip: URLs are counted as 23 characters (like on X/Twitter).');
});

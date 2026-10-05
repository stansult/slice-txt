import { expect, test } from '@playwright/test';
import { textCases } from './fixtures/text-cases';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Max chars').fill('50');
  await page.locator('#useNumbering').uncheck();
});

test('auto-split updates the parts while typing', async ({ page }) => {
  await expect(page.locator('#autoBtn')).toHaveAttribute('aria-pressed', 'true');

  await page.locator('#input').fill(textCases.wordBoundary.input);

  await expect(page.locator('.chunk .content')).toHaveText(textCases.wordBoundary.expectedParts);
});

test('input character count tracks raw graphemes regardless of output options', async ({ page }) => {
  const inputText = 'A "b" -> https://x.co\n👨‍👩‍👧‍👦';

  await expect(page.locator('#inputCharCount')).toHaveText('0 characters');
  await page.getByRole('button', { name: 'Advanced' }).click();
  await page.locator('#useTypography').check();
  await page.locator('#input').fill(inputText);

  await expect(page.locator('#inputCharCount')).toHaveText('23 characters');

  await page.locator('#urlAs23').uncheck();
  await expect(page.locator('#inputCharCount')).toHaveText('23 characters');

  await page.locator('#input').fill('a'.repeat(1_234));
  const formattedCount = await page.evaluate(() => new Intl.NumberFormat().format(1_234));
  await expect(page.locator('#inputCharCount')).toHaveText(`${formattedCount} characters`);

  await page.locator('#clearBtn').click();
  await expect(page.locator('#inputCharCount')).toHaveText('0 characters');
});

test('manual mode waits for Split before creating parts', async ({ page }) => {
  await page.locator('#autoBtn').click();
  await expect(page.locator('#autoBtn')).toHaveAttribute('aria-pressed', 'false');

  await page.locator('#input').fill(textCases.wordBoundary.input);
  await expect(page.locator('.chunk')).toHaveCount(0);
  await expect(page.locator('#splitBtn')).toBeEnabled();

  await page.locator('#splitBtn').click();

  await expect(page.locator('.chunk .content')).toHaveText(textCases.wordBoundary.expectedParts);
});

test('switching back to auto mode resumes splitting while typing', async ({ page }) => {
  await page.locator('#autoBtn').click();
  await page.locator('#input').fill(textCases.wordBoundary.input);
  await page.locator('#splitBtn').click();
  await expect(page.locator('.chunk .content')).toHaveText(textCases.wordBoundary.expectedParts);

  await page.locator('#autoBtn').click();
  await expect(page.locator('#autoBtn')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#input').pressSequentially(' twelve');

  await expect(page.locator('.chunk .content')).toHaveText([
    textCases.wordBoundary.expectedParts[0],
    'eleven twelve',
  ]);
});

test('Clear removes the input and generated parts', async ({ page }) => {
  await page.locator('#input').fill(textCases.wordBoundary.input);
  await expect(page.locator('.chunk .content')).toHaveText(textCases.wordBoundary.expectedParts);

  await page.locator('#clearBtn').click();

  await expect(page.locator('#input')).toHaveValue('');
  await expect(page.locator('.chunk')).toHaveCount(0);
  await expect(page.locator('#summary')).toHaveText('Nothing yet.');
});

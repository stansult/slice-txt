import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('blank-line option starts a new part at paragraph breaks', async ({ page }) => {
  await page.locator('#useNumbering').uncheck();
  await page.locator('#input').fill('First paragraph\n\nSecond paragraph');

  await expect(page.locator('.chunk .content')).toHaveText(['First paragraph\n\nSecond paragraph']);

  await page.locator('#doubleBreakNewPost').check();

  await expect(page.locator('.chunk .content')).toHaveText(['First paragraph', 'Second paragraph']);
});

test('typography option transforms quotes, ellipses, and arrows only when enabled', async ({ page }) => {
  const originalText = 'He said "hello" and "привет"... -> done';

  await page.getByRole('button', { name: 'Advanced' }).click();
  await page.locator('#useNumbering').uncheck();
  await page.locator('#input').fill(originalText);

  await expect(page.locator('.chunk .content')).toHaveText([originalText]);

  await page.locator('#useTypography').check();

  await expect(page.locator('.chunk .content')).toHaveText(['He said “hello” and «привет»… → done']);
});

test('typography cleanup preserves line breaks and URLs while normalizing spacing and dashes', async ({ page }) => {
  const inputText = '  -  item   one .\n  --  item   two ;\n2025 -2026, 2027 - 2028; A - B - C... -> "привет" at https://example.com/a...->b';

  await page.getByRole('button', { name: 'Advanced' }).click();
  await page.locator('#useNumbering').uncheck();
  await page.locator('#input').fill(inputText);
  await page.locator('#useTypography').check();

  await expect(page.locator('.chunk .content')).toHaveText([
    '– item one.\n– item two;\n2025–2026, 2027 – 2028; A – B – C… → «привет» at https://example.com/a...->b',
  ]);
});

test('Reset restores the default option values', async ({ page }) => {
  await page.getByRole('button', { name: 'Advanced' }).click();
  await page.locator('#maxChars').fill('140');
  await page.locator('#counterPlacement').selectOption('before');
  await page.locator('#counterParen').check();
  await page.locator('#counterNewline').check();
  await page.locator('#useNumbering').uncheck();
  await page.locator('#doubleBreakNewPost').check();
  await page.locator('#useContinuation').check();
  await page.locator('#continuationMarker').selectOption('ellipsis');
  await page.locator('#perPartMaxOverride').check();
  await page.locator('#urlAs23').uncheck();
  await page.locator('#useTypography').check();
  await page.locator('#input').fill('x'.repeat(600));
  await page.locator('.part-max-input').first().fill('50');
  await page.locator('.part-max-input').first().press('Enter');
  await expect(page.locator('.part-max-input').first()).toHaveValue('50');

  await page.locator('#optionsResetBtn').click();

  await expect(page.locator('#maxChars')).toHaveValue('280');
  await expect(page.locator('#useNumbering')).toBeChecked();
  await expect(page.locator('#counterPlacement')).toHaveValue('after');
  await expect(page.locator('#counterParen')).not.toBeChecked();
  await expect(page.locator('#counterNewline')).not.toBeChecked();
  await expect(page.locator('#doubleBreakNewPost')).not.toBeChecked();
  await expect(page.locator('#useContinuation')).not.toBeChecked();
  await expect(page.locator('#continuationMarker')).toHaveValue('arrow');
  await expect(page.locator('#perPartMaxOverride')).not.toBeChecked();
  await expect(page.locator('#urlAs23')).toBeChecked();
  await expect(page.locator('#useTypography')).not.toBeChecked();
  await expect(page.locator('#advBtn')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.chunk .content')).toHaveText([
    `${'x'.repeat(276)} 1/3`,
    `${'x'.repeat(276)} 2/3`,
    `${'x'.repeat(48)} 3/3`,
  ]);
  await expect(page.locator('.chunk .cap')).toHaveText(['280', '280', '280']);
});

test('selected options persist after reloading the page', async ({ page }) => {
  await page.getByRole('button', { name: 'Advanced' }).click();
  await page.locator('#maxChars').fill('175');
  await page.locator('#counterPlacement').selectOption('before');
  await page.locator('#doubleBreakNewPost').check();
  await page.locator('#urlAs23').uncheck();
  await page.locator('#useTypography').check();

  await page.reload();

  await expect(page.locator('#maxChars')).toHaveValue('175');
  await expect(page.locator('#counterPlacement')).toHaveValue('before');
  await expect(page.locator('#doubleBreakNewPost')).toBeChecked();
  await expect(page.locator('#urlAs23')).not.toBeChecked();
  await expect(page.locator('#useTypography')).toBeChecked();
  await expect(page.locator('#advBtn')).toHaveAttribute('aria-pressed', 'true');
});

import { expect, test } from '@playwright/test';

test('large input is fully split within the character limit', async ({ page }) => {
  const largeInput = 'stressword '.repeat(4_000).trim();

  await page.goto('/');
  await page.locator('#useNumbering').uncheck();
  await page.locator('#input').fill(largeInput);

  const parts = await page.locator('.chunk .content').allTextContents();
  const displayedLengths = (await page.locator('.chunk .len').allTextContents()).map(Number);

  expect(parts.length).toBeGreaterThan(1);
  expect(parts.join(' ')).toBe(largeInput);
  expect(displayedLengths.every(length => length <= 280)).toBe(true);
});

test('rapid option changes leave large-input output consistent', async ({ page }) => {
  const repeatCount = 1_760;
  const originalText = 'He said "hello" -> done. '.repeat(repeatCount).trim();
  const typographicText = 'He said “hello” → done. '.repeat(repeatCount).trim();

  async function expectSplitText(
    expectedText: string,
    decorationPattern?: RegExp,
    includeFinalPart = false,
  ) {
    const parts = await page.locator('.chunk .content').allTextContents();
    const displayedLengths = (await page.locator('.chunk .len').allTextContents()).map(Number);
    const textParts = parts.map((part, index) => (
      decorationPattern && (index < parts.length - 1 || includeFinalPart)
        ? part.replace(decorationPattern, '')
        : part
    ));

    expect(parts.length).toBeGreaterThan(1);
    expect(textParts.join(' ')).toBe(expectedText);
    expect(displayedLengths.every(length => length <= 280)).toBe(true);
  }

  await page.goto('/');
  await page.getByRole('button', { name: 'Advanced' }).click();
  await page.locator('#useNumbering').uncheck();
  await page.locator('#input').fill(originalText);
  await expectSplitText(originalText);

  await page.locator('#useTypography').check();
  await expectSplitText(typographicText);
  await page.locator('#useTypography').uncheck();
  await expectSplitText(originalText);

  await page.locator('#useContinuation').check();
  const continuationParts = await page.locator('.chunk .content').allTextContents();
  expect(continuationParts.slice(0, -1).every(part => part.endsWith(' →'))).toBe(true);
  await expectSplitText(originalText, / →$/);
  await page.locator('#useContinuation').uncheck();
  await expectSplitText(originalText);

  await page.locator('#useNumbering').check();
  const numberedParts = await page.locator('.chunk .content').allTextContents();
  expect(numberedParts.every(part => /\s\d+\/\d+$/.test(part))).toBe(true);
  await expectSplitText(originalText, /\s\d+\/\d+$/, true);
  await page.locator('#useNumbering').uncheck();
  await expectSplitText(originalText);
});

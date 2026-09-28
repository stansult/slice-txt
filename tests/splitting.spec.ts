import { expect, test } from '@playwright/test';
import { splittingRuns } from './fixtures/text-cases';

for (const run of splittingRuns) {
  test(`${run.name}: ${run.data.name}`, async ({ page }) => {
    await page.goto('/');

    const { maxChars, useNumbering, useContinuation, counterNewline } = run.options;
    await page.getByLabel('Max chars').fill(String(maxChars));
    await page.locator('#useNumbering').setChecked(useNumbering);
    if ('counterPlacement' in run.options) {
      await page.locator('#counterPlacement').selectOption(run.options.counterPlacement);
    }

    if (useContinuation || counterNewline || 'counterParens' in run.options || 'urlAs23' in run.options) {
      await page.getByRole('button', { name: 'Advanced' }).click();
      if (useContinuation) {
        await page.locator('#useContinuation').check();
      }
      if ('continuationMarker' in run.options) {
        await page.locator('#continuationMarker').selectOption(run.options.continuationMarker);
      }
      if (counterNewline) {
        await page.locator('#counterNewline').check();
      }
      if ('counterParens' in run.options) {
        await page.locator('#counterParen').setChecked(run.options.counterParens);
      }
      if ('urlAs23' in run.options) {
        await page.locator('#urlAs23').setChecked(run.options.urlAs23);
      }
    }

    await page.locator('#input').fill(run.data.input);

    const parts = await page.locator('.chunk .content').allTextContents();
    expect(parts.length).toBeGreaterThan(1);
    for (const part of parts) {
      expect(part.length).toBeLessThanOrEqual(maxChars);
    }

    if (useContinuation) {
      const marker = 'continuationMarker' in run.options && run.options.continuationMarker === 'ellipsis'
        ? '…'
        : '→';
      if (useNumbering && counterNewline) {
        expect(parts[0]).toContain(` ${marker}\n`);
        expect(parts[0]).toMatch(/\n\d+\/\d+$/);
      } else {
        expect(parts[0].endsWith(` ${marker}`)).toBe(true);
      }
    }

    if ('requiredSubstrings' in run.data) {
      for (const substring of run.data.requiredSubstrings) {
        expect(parts.some(part => part.includes(substring))).toBe(true);
      }
    }
  });
}

import { expect, test } from '@playwright/test';

const helpText = [
  'Your text is processed in your browser and isn’t sent or uploaded anywhere.',
  'Fills each part up to your character limit, keeping words together when possible and splitting long words only when needed.',
  'Counts length using emoji-aware graphemes; optionally counts URLs as 23 characters (like on Twitter).',
  'Split automatically as you type or manually with the Split button.',
  'Optional counter before or after the text, with parentheses or a new line; blank lines can start a new part.',
  'Optional continuation marker (→ or …) on non-final parts and per-part limits shorter than the global limit.',
  'Optional typography cleanup for quotes, dashes, spacing, ellipses, and arrows.',
  'Copy individual parts or all parts, or export them as JSON.',
];

const pageStates = [
  { name: 'empty page', manyParts: false },
  { name: 'page with many parts', manyParts: true },
] as const;

const advancedStates = [
  { name: 'Advanced options off', enabled: false },
  { name: 'Advanced options on', enabled: true },
] as const;

for (const pageState of pageStates) {
  for (const advancedState of advancedStates) {
    test(`What this tool does works on ${pageState.name} with ${advancedState.name}`, async ({ page }) => {
      await page.goto('/');

      if (advancedState.enabled) {
        await page.getByRole('button', { name: 'Advanced' }).click();
      }
      await expect(page.locator('#advBtn')).toHaveAttribute(
        'aria-pressed',
        advancedState.enabled ? 'true' : 'false',
      );

      if (pageState.manyParts) {
        await page.getByLabel('Max chars').fill('50');
        await page.locator('#useNumbering').uncheck();
        await page.locator('#input').fill('word '.repeat(200));

        const parts = page.locator('#chunks .chunk');
        await expect(parts).not.toHaveCount(0);
        expect(await parts.count()).toBeGreaterThanOrEqual(10);
      }

      const helpSection = page.locator('details');
      await helpSection.scrollIntoViewIfNeeded();
      if (pageState.manyParts) {
        expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
      }

      await helpSection.locator('summary').click();
      await expect(helpSection).toHaveAttribute('open', '');
      await expect(helpSection.locator('li')).toHaveText(helpText);
    });
  }
}

import { expect, test, type Page } from '@playwright/test';
import { fillWithLongOutput } from './helpers';

async function openHelpAndExpectVisible(page: Page) {
  await page.getByRole('button', { name: 'Open help: What this tool does' }).click();

  const helpDetails = page.locator('#helpDetails');
  const helpTitle = page.locator('#helpTitle');

  await expect(helpDetails).toHaveAttribute('open', '');
  await expect(helpTitle).toBeInViewport();
  await expect(helpDetails.locator('ul')).toBeVisible();

  return helpTitle;
}

test('help button opens help and scrolls its title into view on desktop', { tag: '@desktop' }, async ({ page }) => {
  await page.goto('/');
  await openHelpAndExpectVisible(page);
});

test('help button aligns its title as high as possible on mobile', { tag: '@mobile' }, async ({ page }) => {
  await page.goto('/');
  await fillWithLongOutput(page);

  const helpTitle = await openHelpAndExpectVisible(page);

  const verticalPosition = await helpTitle.evaluate(title => {
    const titleTop = title.getBoundingClientRect().top;
    const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
    return {
      actualTop: titleTop,
      bestPossibleTop: Math.max(0, titleTop + window.scrollY - maxScrollTop),
    };
  });

  expect(Math.abs(verticalPosition.actualTop - verticalPosition.bestPossibleTop)).toBeLessThanOrEqual(1);
});

import { expect, test } from '../../src/test';

test('an unknown path renders the styled not-found page', async ({ page }) => {
  const response = await page.goto('/no-page-lives-here');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'No page at this address.' })).toBeVisible();
  // the text Next renders when app/not-found.tsx is missing or broken
  await expect(page.getByText('This page could not be found')).toHaveCount(0);
});

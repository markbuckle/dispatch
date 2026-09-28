import { expect, test } from '../../src/test';

test('the landing page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Email for developers' })).toBeVisible();
});

for (const { name, path } of [
  { name: 'Log in', path: '/login' },
  { name: 'Sign up', path: '/signup' },
  { name: 'Get an API key', path: '/signup' },
]) {
  test(`${name} leads to the auth form`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name, exact: true }).click();

    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByLabel('Email')).toBeVisible();
  });
}

test('the dashboard sends a signed-out visitor to log in', async ({ page }) => {
  await page.goto('/dashboard/api-keys');
  await expect(page).toHaveURL(/\/login$/);
});

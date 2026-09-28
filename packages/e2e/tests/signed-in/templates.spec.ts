import { expect, test } from '../../src/test';

test('a template can be created, edited and deleted', async ({ page }) => {
  const name = `e2e template ${Date.now()}`;

  await page.goto('/dashboard/templates');
  // the empty state repeats the header's button, so a fresh account shows two
  await page.getByRole('link', { name: 'New template' }).first().click();

  await page.getByLabel('Name', { exact: true }).fill(name);
  await page.getByLabel('Subject', { exact: true }).fill('Welcome, {{name}}');
  await page.getByLabel('HTML', { exact: true }).fill('<p>Hi {{name}}</p>');
  await page.getByLabel('Text', { exact: true }).fill('Hi {{name}}');
  await page.getByRole('button', { name: 'Save template' }).click();

  await expect(page).toHaveURL(/\/dashboard\/templates$/);
  const row = page.getByRole('row').filter({ hasText: name });
  await expect(row).toContainText('Welcome, {{name}}');

  await row.getByRole('link', { name }).click();
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  await page.getByLabel('Subject', { exact: true }).fill('Welcome back, {{name}}');
  await page.getByRole('button', { name: 'Save template' }).click();

  await expect(page).toHaveURL(/\/dashboard\/templates$/);
  await expect(row).toContainText('Welcome back, {{name}}');

  await row.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete template' }).click();

  await expect(row).toHaveCount(0);
});

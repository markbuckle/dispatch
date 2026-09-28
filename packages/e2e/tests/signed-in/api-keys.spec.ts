import { expect, test } from '../../src/test';

test('an api key is revealed once and can be revoked', async ({ page }) => {
  const name = `e2e key ${Date.now()}`;

  await page.goto('/dashboard/api-keys');
  await page.getByRole('button', { name: 'Create API key' }).click();

  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name').fill(name);
  await dialog.getByText('Sending access', { exact: true }).click();
  await dialog.getByRole('button', { name: 'Create key' }).click();

  await expect(dialog.getByRole('heading', { name: 'API key created' })).toBeVisible();
  const key = await dialog.getByText(/^dispatch_(live|test)_/).innerText();
  expect(key).toMatch(/^dispatch_(live|test)_\S{20,}$/);
  await dialog.getByRole('button', { name: 'Close' }).click();

  // the reveal is the only time the full key exists outside its hash
  await page.reload();
  const row = page.getByRole('row').filter({ hasText: name });
  await expect(row).toBeVisible();
  await expect(page.getByText(key)).toHaveCount(0);

  await row.getByRole('button', { name: 'Revoke' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Revoke key' }).click();

  await expect(row).toContainText('Revoked');
  await expect(row.getByRole('button', { name: 'Revoke' })).toHaveCount(0);
});

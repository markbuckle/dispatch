import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { accountPath, sessionPath } from '../src/paths';
import { createConfirmedUser } from '../src/supabase-admin';
import { expect, test as setup } from '../src/test';

setup('create a throwaway account and log in', async ({ page }) => {
  // unique per run, so two PRs testing at once never share rows
  const email = `e2e+${randomUUID()}@example.com`;
  const password = randomUUID();
  const id = await createConfirmedUser(email, password);

  await mkdir(dirname(accountPath), { recursive: true });
  // written before the login can fail, so teardown can always find the account to delete
  await writeFile(accountPath, JSON.stringify({ id }));

  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();

  await expect(page).toHaveURL(/\/dashboard\/emails$/);
  await page.context().storageState({ path: sessionPath });
});

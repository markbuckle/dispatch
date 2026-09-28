import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { accountPath } from '../src/paths';
import { deleteUser, readUserId } from '../src/supabase-admin';
import { test as teardown } from '../src/test';

// the cascade from auth.users takes the account's keys and templates with it
teardown('delete the throwaway account', async () => {
  // setup failed before creating anyone, so there is nothing to delete
  if (!existsSync(accountPath)) return;

  const id = readUserId(JSON.parse(await readFile(accountPath, 'utf8')));
  await deleteUser(id);
});

import { fileURLToPath } from 'node:url';

export const sessionPath = fileURLToPath(new URL('../.auth/session.json', import.meta.url));

export const accountPath = fileURLToPath(new URL('../.auth/account.json', import.meta.url));

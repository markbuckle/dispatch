import { randomBytes } from 'node:crypto';
import { hashApiKey } from './hash';

export type ApiKeyEnvironment = 'live' | 'test';

export type GeneratedApiKey = {
  key: string;
  keyPrefix: string;
  hashedKey: string;
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// 43 base62 characters carry about 256 bits, matching the SHA-256 that stores them
const SECRET_LENGTH = 43;

// enough to tell two keys apart in a list without meaningfully narrowing a brute force
const PREFIX_SECRET_LENGTH = 8;

// 248 is the largest multiple of 62 under 256, so higher bytes are dropped, not folded
const UNBIASED_CEILING = 248;

function randomBase62(length: number): string {
  let secret = '';
  while (secret.length < length) {
    for (const byte of randomBytes(length)) {
      if (byte >= UNBIASED_CEILING) continue;
      secret += ALPHABET.charAt(byte % ALPHABET.length);
      if (secret.length === length) break;
    }
  }
  return secret;
}

export function generateApiKey(environment: ApiKeyEnvironment = 'live'): GeneratedApiKey {
  const secret = randomBase62(SECRET_LENGTH);
  const key = `dispatch_${environment}_${secret}`;

  return {
    key,
    keyPrefix: `dispatch_${environment}_${secret.slice(0, PREFIX_SECRET_LENGTH)}`,
    hashedKey: hashApiKey(key),
  };
}

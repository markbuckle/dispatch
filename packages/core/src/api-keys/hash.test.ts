import { describe, expect, it } from 'vitest';
import { generateApiKey } from './generate';
import { hashApiKey, verifyApiKey } from './hash';

describe('hashApiKey', () => {
  it('returns the same hash for the same key every time', () => {
    const { key } = generateApiKey();

    expect(hashApiKey(key)).toBe(hashApiKey(key));
  });

  it('returns a 64 character lowercase hex digest', () => {
    expect(hashApiKey(generateApiKey().key)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns a different hash for keys differing by one character', () => {
    const key = `dispatch_live_${'a'.repeat(43)}`;
    const nearMiss = `dispatch_live_${'a'.repeat(42)}b`;

    expect(hashApiKey(key)).not.toBe(hashApiKey(nearMiss));
  });
});

describe('verifyApiKey', () => {
  it('accepts the key that produced the stored hash', () => {
    const { key, hashedKey } = generateApiKey();

    expect(verifyApiKey(key, hashedKey)).toBe(true);
  });

  it('rejects an unrelated key against the same hash', () => {
    const { hashedKey } = generateApiKey();
    const other = generateApiKey();

    expect(verifyApiKey(other.key, hashedKey)).toBe(false);
  });

  it('rejects a key that differs from the real one by a single character', () => {
    const { key, hashedKey } = generateApiKey();
    const nearMiss = `${key.slice(0, -1)}${key.endsWith('a') ? 'b' : 'a'}`;

    expect(verifyApiKey(nearMiss, hashedKey)).toBe(false);
  });

  it('rejects the displayable prefix on its own', () => {
    const { keyPrefix, hashedKey } = generateApiKey();

    expect(verifyApiKey(keyPrefix, hashedKey)).toBe(false);
  });

  it('rejects a key presented against an empty or truncated hash', () => {
    const { key, hashedKey } = generateApiKey();

    expect(verifyApiKey(key, '')).toBe(false);
    expect(verifyApiKey(key, hashedKey.slice(0, 32))).toBe(false);
  });

  it('rejects a live key against the hash of the matching test key', () => {
    const secret = 'a'.repeat(43);

    expect(verifyApiKey(`dispatch_live_${secret}`, hashApiKey(`dispatch_test_${secret}`))).toBe(
      false,
    );
  });
});

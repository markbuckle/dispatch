import { describe, expect, it } from 'vitest';
import { generateApiKey } from './generate';
import { hashApiKey } from './hash';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const LIVE_PREFIX = 'dispatch_live_';
const SECRET_LENGTH = 43;
const COLLISION_SAMPLE_SIZE = 1000;

// at this size fair draws stay under 5% skew while modulo bias lands above 20%
const DISTRIBUTION_SAMPLE_SIZE = 8000;

describe('generateApiKey', () => {
  it('formats a live key as an environment segment and 43 base62 characters', () => {
    expect(generateApiKey().key).toMatch(/^dispatch_live_[A-Za-z0-9]{43}$/);
  });

  it('formats a test key with the test environment segment', () => {
    expect(generateApiKey('test').key).toMatch(/^dispatch_test_[A-Za-z0-9]{43}$/);
  });

  it('returns a prefix that is the displayable head of the full key', () => {
    const { key, keyPrefix } = generateApiKey();

    expect(keyPrefix).toBe(key.slice(0, LIVE_PREFIX.length + 8));
    expect(key.startsWith(keyPrefix)).toBe(true);
  });

  it('returns a prefix short enough to leave the secret unguessable', () => {
    const { key, keyPrefix } = generateApiKey();

    expect(keyPrefix.length).toBeLessThan(key.length);
    expect(key.slice(keyPrefix.length).length).toBe(SECRET_LENGTH - 8);
  });

  it('returns the hash of the full key, not of the secret alone', () => {
    const { key, hashedKey } = generateApiKey();

    expect(hashedKey).toBe(hashApiKey(key));
    expect(hashedKey).not.toBe(hashApiKey(key.slice(LIVE_PREFIX.length)));
  });

  it('never repeats a key or its hash across a large sample', () => {
    const keys = new Set<string>();
    const hashes = new Set<string>();

    for (let i = 0; i < COLLISION_SAMPLE_SIZE; i += 1) {
      const { key, hashedKey } = generateApiKey();
      keys.add(key);
      hashes.add(hashedKey);
    }

    expect(keys.size).toBe(COLLISION_SAMPLE_SIZE);
    expect(hashes.size).toBe(COLLISION_SAMPLE_SIZE);
  });

  it('draws every alphabet character at a near uniform rate', () => {
    const counts = new Map<string, number>();
    for (const char of ALPHABET) counts.set(char, 0);

    for (let i = 0; i < DISTRIBUTION_SAMPLE_SIZE; i += 1) {
      for (const char of generateApiKey().key.slice(LIVE_PREFIX.length)) {
        counts.set(char, (counts.get(char) ?? 0) + 1);
      }
    }

    expect(counts.size).toBe(ALPHABET.length);

    const expected = (DISTRIBUTION_SAMPLE_SIZE * SECRET_LENGTH) / ALPHABET.length;
    for (const [char, count] of counts) {
      expect(Math.abs(count - expected) / expected, `frequency of ${char}`).toBeLessThan(0.1);
    }
  });
});

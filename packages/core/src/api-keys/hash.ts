import { createHash, timingSafeEqual } from 'node:crypto';

// keys are 256-bit random strings, so a slow hash would add request latency and no safety
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key, 'utf8').digest('hex');
}

export function verifyApiKey(presentedKey: string, storedHash: string): boolean {
  const presented = Buffer.from(hashApiKey(presentedKey), 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  // timingSafeEqual throws on a length mismatch, and a wrong-length hash is already a reject
  if (presented.length !== stored.length) return false;
  return timingSafeEqual(presented, stored);
}

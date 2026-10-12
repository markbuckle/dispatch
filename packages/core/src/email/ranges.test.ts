import { describe, expect, it } from 'vitest';
import { emailRangeStart } from './ranges';

describe('emailRangeStart', () => {
  it('reaches back the whole number of days the range names', () => {
    const now = Date.parse('2026-10-12T12:00:00Z');

    expect(emailRangeStart('7d', now).toISOString()).toBe('2026-10-05T12:00:00.000Z');
    expect(emailRangeStart('30d', now).toISOString()).toBe('2026-09-12T12:00:00.000Z');
  });
});

import type { Domain } from '@dispatch/db';
import { describe, expect, it } from 'vitest';
import { apiDomainSchema, toApiDomain } from './domains';

const domain: Domain = {
  id: '3c1f9a2e-7b4d-4e6a-8c5f-1d2e3f4a5b6c',
  userId: '0b6c3f7e-2d4a-4e8b-9f1c-5a7d3e2b1c90',
  name: 'mail.harborline.co',
  status: 'verified',
  dkimTokens: ['abc123', 'def456', 'ghi789'],
  dkimHostedZone: 'dkim.amazonses.com',
  createdAt: new Date('2026-09-01T00:00:00Z'),
  lastCheckedAt: new Date('2026-09-01T00:05:00Z'),
  verifiedAt: new Date('2026-09-01T00:05:00Z'),
};

describe('toApiDomain', () => {
  it('lists the DKIM records the dashboard shows, labelled the way Resend labels them', () => {
    expect(toApiDomain(domain).records).toEqual([
      {
        record: 'DKIM',
        type: 'CNAME',
        name: 'abc123._domainkey.mail.harborline.co',
        value: 'abc123.dkim.amazonses.com',
      },
      {
        record: 'DKIM',
        type: 'CNAME',
        name: 'def456._domainkey.mail.harborline.co',
        value: 'def456.dkim.amazonses.com',
      },
      {
        record: 'DKIM',
        type: 'CNAME',
        name: 'ghi789._domainkey.mail.harborline.co',
        value: 'ghi789.dkim.amazonses.com',
      },
    ]);
  });

  it('matches its schema with a domain that has never been checked', () => {
    const detail = toApiDomain({
      ...domain,
      status: 'pending',
      lastCheckedAt: null,
      verifiedAt: null,
    });

    expect(detail.last_checked_at).toBeNull();
    expect(apiDomainSchema.parse(detail)).toEqual(detail);
  });
});

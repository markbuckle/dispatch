import type { Email } from '@dispatch/db';
import { describe, expect, it } from 'vitest';
import {
  apiEmailSchema,
  apiEmailSummarySchema,
  emailFiltersQuerySchema,
  toApiEmail,
  toApiEmailSummary,
} from './emails';

const email: Email = {
  id: '8f14e45f-ceea-467a-9f1a-7b0d1e3a4c52',
  userId: '0b6c3f7e-2d4a-4e8b-9f1c-5a7d3e2b1c90',
  to: ['someone@example.com'],
  from: 'receipts@yourdomain.com',
  subject: 'Your receipt',
  html: '<p>Thanks for your order.</p>',
  text: null,
  status: 'bounced',
  providerMessageId: '0100018f-ses-message-id',
  error: null,
  createdAt: new Date('2026-10-12T09:14:03.512Z'),
  sentAt: null,
};

describe('emailFiltersQuerySchema', () => {
  it('applies no filter when none is given', () => {
    expect(emailFiltersQuerySchema.parse({})).toEqual({});
  });

  it('reads a status and a range', () => {
    expect(emailFiltersQuerySchema.parse({ status: 'bounced', range: '7d' })).toEqual({
      status: 'bounced',
      range: '7d',
    });
  });

  it('refuses an unknown status instead of falling back like the dashboard', () => {
    const parsed = emailFiltersQuerySchema.safeParse({ status: 'lost' });

    expect(parsed.error?.issues[0]?.message).toMatch(/^Use one of queued, sent, .* for status\.$/);
  });

  it('refuses an unknown range', () => {
    expect(emailFiltersQuerySchema.safeParse({ range: '1y' }).success).toBe(false);
  });
});

describe('toApiEmailSummary', () => {
  it('leaves the bodies and the provider id out of a list item', () => {
    const summary = toApiEmailSummary(email);

    expect(summary).toEqual({
      id: email.id,
      from: 'receipts@yourdomain.com',
      to: ['someone@example.com'],
      subject: 'Your receipt',
      status: 'bounced',
      created_at: '2026-10-12T09:14:03.512Z',
    });
    expect(apiEmailSummarySchema.parse(summary)).toEqual(summary);
  });
});

describe('toApiEmail', () => {
  it('leads with the object type and matches its schema', () => {
    const detail = toApiEmail(email);

    expect(Object.keys(detail)[0]).toBe('object');
    expect(detail).not.toHaveProperty('provider_message_id');
    expect(apiEmailSchema.parse(detail)).toEqual(detail);
  });

  it('writes sent_at as an ISO timestamp once there is one', () => {
    const sent = toApiEmail({ ...email, sentAt: new Date('2026-10-12T09:14:04Z') });

    expect(sent.sent_at).toBe('2026-10-12T09:14:04.000Z');
  });
});

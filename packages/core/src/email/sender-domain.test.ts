import { describe, expect, it } from 'vitest';
import { senderDomain } from './sender-domain';

describe('senderDomain', () => {
  it('takes everything after the @', () => {
    expect(senderDomain('receipts@mail.harborline.co')).toBe('mail.harborline.co');
  });

  it('lowercases, so an address typed in capitals still matches the stored domain', () => {
    expect(senderDomain('Receipts@MAIL.Harborline.co')).toBe('mail.harborline.co');
  });

  it('keeps a subdomain whole rather than reducing it to the domain it sits under', () => {
    expect(senderDomain('receipts@eu.mail.harborline.co')).toBe('eu.mail.harborline.co');
  });
});

import { describe, expect, it } from 'vitest';
import { canAdvanceTo, type EmailStatus, emailStatusRank } from './email-status-rank';

const EVERY_STATUS: EmailStatus[] = [
  'queued',
  'sent',
  'failed',
  'delivered',
  'bounced',
  'complained',
  'delivery_delayed',
];

describe('emailStatusRank', () => {
  it('ranks every status the column can hold', () => {
    for (const status of EVERY_STATUS) {
      expect(emailStatusRank(status), status).toBeTypeOf('number');
    }
  });

  it('orders the happy path', () => {
    expect(emailStatusRank('queued')).toBeLessThan(emailStatusRank('sent'));
    expect(emailStatusRank('sent')).toBeLessThan(emailStatusRank('delivered'));
  });
});

describe('canAdvanceTo', () => {
  it('lets a send progress through the states it really passes through', () => {
    expect(canAdvanceTo('queued', 'sent')).toBe(true);
    expect(canAdvanceTo('sent', 'delivered')).toBe(true);
    expect(canAdvanceTo('sent', 'bounced')).toBe(true);
  });

  it('refuses a late sent that arrives after the delivery notification', () => {
    expect(canAdvanceTo('delivered', 'sent')).toBe(false);
  });

  it('refuses a delivery notification that arrives after a bounce', () => {
    expect(canAdvanceTo('bounced', 'delivered')).toBe(false);
  });

  it('accepts a complaint after a delivery, because that is the real order', () => {
    expect(canAdvanceTo('delivered', 'complained')).toBe(true);
  });

  it('treats a delay as passing through rather than as an outcome', () => {
    expect(canAdvanceTo('sent', 'delivery_delayed')).toBe(true);
    expect(canAdvanceTo('delivery_delayed', 'delivered')).toBe(true);
    expect(canAdvanceTo('delivery_delayed', 'bounced')).toBe(true);
    expect(canAdvanceTo('delivered', 'delivery_delayed')).toBe(false);
  });

  it('refuses to repeat a status it already holds', () => {
    for (const status of EVERY_STATUS) {
      expect(canAdvanceTo(status, status), status).toBe(false);
    }
  });

  it('holds every terminal status against the others', () => {
    for (const terminal of ['bounced', 'complained', 'failed'] as const) {
      for (const next of EVERY_STATUS) {
        expect(canAdvanceTo(terminal, next), `${terminal} -> ${next}`).toBe(false);
      }
    }
  });

  it('never allows a move that the reverse move also allows', () => {
    for (const from of EVERY_STATUS) {
      for (const to of EVERY_STATUS) {
        if (canAdvanceTo(from, to)) {
          expect(canAdvanceTo(to, from), `${from} -> ${to}`).toBe(false);
        }
      }
    }
  });
});

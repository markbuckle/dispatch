import { type Email, emailStatus } from './emails';

export type EmailStatus = Email['status'];

// SES reports out of order, so a status is only ever allowed to move up this list, never back down
const RANK: Record<EmailStatus, number> = {
  queued: 0,
  sent: 1,
  // a delay is not an outcome, so a message that later lands still reads as delivered
  delivery_delayed: 2,
  // a complaint follows a successful delivery, so the two below outrank this rather than merely ending it
  delivered: 3,
  // equal on purpose: whichever lands first stands, and a message that both bounced and drew a complaint is pathological
  bounced: 4,
  complained: 4,
  // not a later stage, it means the message never left, so markEmailFailed keeps its stricter queued-only guard
  failed: 4,
};

export function emailStatusRank(status: EmailStatus): number {
  return RANK[status];
}

export function canAdvanceTo(current: EmailStatus, next: EmailStatus): boolean {
  return RANK[next] > RANK[current];
}

// the same rule as a set, so an update can check it in SQL and read and write without a gap between them
export function statusesBehind(next: EmailStatus): EmailStatus[] {
  return emailStatus.enumValues.filter((current) => canAdvanceTo(current, next));
}

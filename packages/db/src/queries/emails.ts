import { and, eq, gte, inArray, sql } from 'drizzle-orm';
import { getDb } from '../client';
import { type EmailStatus, statusesBehind } from '../schema/email-status-rank';
import { type Email, emails, type NewEmail } from '../schema/emails';
import {
  type Page,
  type PageRequest,
  pageCursor,
  pageLimit,
  pageOrder,
  settlePage,
} from './pagination';

// a list never needs the bodies, and selecting the row would carry every one across the wire
export type EmailSummary = Pick<Email, 'id' | 'from' | 'to' | 'subject' | 'status' | 'createdAt'>;

export type EmailListFilters = { status?: EmailStatus; since?: Date };

export async function listEmailsForUser(
  userId: string,
  { status, since }: EmailListFilters,
  page: PageRequest,
): Promise<Page<EmailSummary>> {
  const rows = await getDb()
    .select({
      id: emails.id,
      from: emails.from,
      to: emails.to,
      subject: emails.subject,
      status: emails.status,
      createdAt: emails.createdAt,
    })
    .from(emails)
    .where(
      and(
        eq(emails.userId, userId),
        status ? eq(emails.status, status) : undefined,
        since ? gte(emails.createdAt, since) : undefined,
        pageCursor(emails, userId, page),
      ),
    )
    .orderBy(...pageOrder(emails, page))
    .limit(pageLimit(page));

  return settlePage(emails, userId, page, rows);
}

// an empty filtered list cannot tell a quiet fortnight from an account that has never sent
export async function hasAnyEmailForUser(userId: string): Promise<boolean> {
  const [email] = await getDb()
    .select({ id: emails.id })
    .from(emails)
    .where(eq(emails.userId, userId))
    .limit(1);

  return email !== undefined;
}

// the owner is part of the match, so a guessed id from another account finds nothing
export async function findEmailForUser(id: string, userId: string): Promise<Email | undefined> {
  const [email] = await getDb()
    .select()
    .from(emails)
    .where(and(eq(emails.id, id), eq(emails.userId, userId)));

  return email;
}

export async function insertEmail(values: NewEmail): Promise<Email> {
  const [email] = await getDb().insert(emails).values(values).returning();
  if (!email) throw new Error(`Insert returned no row for ${values.subject}`);

  return email;
}

// the send job runs as the system rather than on behalf of a request, so there is no owner to match on
export async function findEmail(id: string): Promise<Email | undefined> {
  const [email] = await getDb().select().from(emails).where(eq(emails.id, id));

  return email;
}

// SES identifies a message only by the id it issued, which is the one thing its notifications carry
export async function findEmailByProviderMessageId(
  providerMessageId: string,
): Promise<Email | undefined> {
  const [email] = await getDb()
    .select()
    .from(emails)
    .where(eq(emails.providerMessageId, providerMessageId));

  return email;
}

// the rank as a set the row's current status has to be in, so the check and the write are one statement
function behind(status: EmailStatus) {
  return inArray(emails.status, statusesBehind(status));
}

// nothing is returned because the row's bodies would then be stored in Inngest's step memo
export async function markEmailSent(id: string, providerMessageId: string): Promise<void> {
  await getDb()
    .update(emails)
    .set({ status: 'sent', providerMessageId, sentAt: sql`now()` })
    // SES can report a delivery before this write lands, and a late sent must not walk that back
    .where(and(eq(emails.id, id), behind('sent')));
}

export async function advanceEmailStatus(id: string, status: EmailStatus): Promise<void> {
  await getDb()
    .update(emails)
    .set({ status })
    .where(and(eq(emails.id, id), behind(status)));
}

// still-queued guard, so a send that succeeded while the caller gave up cannot be overwritten as failed
export async function markEmailFailed(id: string, error: string): Promise<void> {
  await getDb()
    .update(emails)
    .set({ status: 'failed', error })
    .where(and(eq(emails.id, id), eq(emails.status, 'queued')));
}

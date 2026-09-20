import { and, desc, eq, sql } from 'drizzle-orm';
import { getDb } from '../client';
import { type Email, emails, type NewEmail } from '../schema/emails';

// the table shows four columns, and selecting the row would carry every body across the wire
export type EmailSummary = Pick<Email, 'id' | 'to' | 'subject' | 'status' | 'createdAt'>;

// capped rather than paginated, so a busy account sees its newest 100 and nothing older
const LIST_LIMIT = 100;

export async function listEmailsForUser(userId: string): Promise<EmailSummary[]> {
  return getDb()
    .select({
      id: emails.id,
      to: emails.to,
      subject: emails.subject,
      status: emails.status,
      createdAt: emails.createdAt,
    })
    .from(emails)
    .where(eq(emails.userId, userId))
    .orderBy(desc(emails.createdAt))
    .limit(LIST_LIMIT);
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

// nothing is returned because the row's bodies would then be stored in Inngest's step memo
export async function markEmailSent(id: string, providerMessageId: string): Promise<void> {
  await getDb()
    .update(emails)
    .set({ status: 'sent', providerMessageId, sentAt: sql`now()` })
    .where(eq(emails.id, id));
}

// still-queued guard, so a send that succeeded while the caller gave up cannot be overwritten as failed
export async function markEmailFailed(id: string, error: string): Promise<void> {
  await getDb()
    .update(emails)
    .set({ status: 'failed', error })
    .where(and(eq(emails.id, id), eq(emails.status, 'queued')));
}

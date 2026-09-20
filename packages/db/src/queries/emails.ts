import { and, eq, sql } from 'drizzle-orm';
import { getDb } from '../client';
import { type Email, emails, type NewEmail } from '../schema/emails';

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

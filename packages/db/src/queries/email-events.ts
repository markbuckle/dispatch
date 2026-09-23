import { eq } from 'drizzle-orm';
import { getDb } from '../client';
import { type EmailEvent, emailEvents, type NewEmailEvent } from '../schema/email-events';

// the send pipeline runs as the system rather than on behalf of a request, so there is no owner to match on
export async function insertEmailEvent(values: NewEmailEvent): Promise<EmailEvent> {
  const [event] = await getDb().insert(emailEvents).values(values).returning();
  if (!event) throw new Error(`Insert returned no row for ${values.type}`);

  return event;
}

// the fan-out job reads the event it was handed, so this is unscoped for the same reason
export async function findEmailEvent(id: string): Promise<EmailEvent | undefined> {
  const [event] = await getDb().select().from(emailEvents).where(eq(emailEvents.id, id));

  return event;
}

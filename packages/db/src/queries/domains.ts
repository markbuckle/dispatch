import { and, desc, eq, sql } from 'drizzle-orm';
import { getDb } from '../client';
import { type Domain, domains, type NewDomain } from '../schema/domains';

export async function listDomainsForUser(userId: string): Promise<Domain[]> {
  return getDb()
    .select()
    .from(domains)
    .where(eq(domains.userId, userId))
    .orderBy(desc(domains.createdAt));
}

// the owner is part of every match, so a guessed id from another account finds nothing
export async function findDomainForUser(id: string, userId: string): Promise<Domain | undefined> {
  const [domain] = await getDb()
    .select()
    .from(domains)
    .where(and(eq(domains.id, id), eq(domains.userId, userId)));

  return domain;
}

export async function insertDomain(values: NewDomain): Promise<Domain> {
  const [domain] = await getDb().insert(domains).values(values).returning();
  if (!domain) throw new Error(`Insert returned no row for ${values.name}`);

  return domain;
}

export async function recordDomainCheckForUser(
  id: string,
  userId: string,
  status: Domain['status'],
): Promise<Domain | undefined> {
  const [domain] = await getDb()
    .update(domains)
    .set({
      status,
      lastCheckedAt: sql`now()`,
      // coalesce keeps the first verification time, so a later check never moves it
      verifiedAt: status === 'verified' ? sql`coalesce(${domains.verifiedAt}, now())` : undefined,
    })
    .where(and(eq(domains.id, id), eq(domains.userId, userId)))
    .returning();

  return domain;
}

export async function deleteDomainForUser(id: string, userId: string): Promise<boolean> {
  const deleted = await getDb()
    .delete(domains)
    .where(and(eq(domains.id, id), eq(domains.userId, userId)))
    .returning({ id: domains.id });

  return deleted.length > 0;
}

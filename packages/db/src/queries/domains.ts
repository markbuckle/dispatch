import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { getDb } from '../client';
import { type Domain, domains, type NewDomain } from '../schema/domains';
import {
  type Page,
  type PageRequest,
  pageCursor,
  pageLimit,
  pageOrder,
  settlePage,
} from './pagination';

// verified and failed are terminal; the rest can still change without anyone asking again
const UNSETTLED: Domain['status'][] = ['not_started', 'pending', 'temporary_failure'];

export function isDomainUnsettled(status: Domain['status']): boolean {
  return UNSETTLED.includes(status);
}

export async function listUnsettledDomainsForUser(userId: string): Promise<Domain[]> {
  return getDb()
    .select()
    .from(domains)
    .where(and(eq(domains.userId, userId), inArray(domains.status, UNSETTLED)));
}

export async function listDomainsForUser(userId: string): Promise<Domain[]> {
  return getDb()
    .select()
    .from(domains)
    .where(eq(domains.userId, userId))
    .orderBy(desc(domains.createdAt));
}

// the DNS records belong to one domain's detail, so a list leaves the tokens behind
export type DomainSummary = Pick<Domain, 'id' | 'name' | 'status' | 'createdAt'>;

export async function listDomainPageForUser(
  userId: string,
  page: PageRequest,
): Promise<Page<DomainSummary>> {
  const rows = await getDb()
    .select({
      id: domains.id,
      name: domains.name,
      status: domains.status,
      createdAt: domains.createdAt,
    })
    .from(domains)
    .where(and(eq(domains.userId, userId), pageCursor(domains, userId, page)))
    .orderBy(...pageOrder(domains, page))
    .limit(pageLimit(page));

  return settlePage(domains, userId, page, rows);
}

// the owner is part of every match, so a guessed id from another account finds nothing
export async function findDomainForUser(id: string, userId: string): Promise<Domain | undefined> {
  const [domain] = await getDb()
    .select()
    .from(domains)
    .where(and(eq(domains.id, id), eq(domains.userId, userId)));

  return domain;
}

// owner and status are both in the match, so another account's verified domain answers the same as an unknown one
export async function hasVerifiedDomainForUser(name: string, userId: string): Promise<boolean> {
  const [domain] = await getDb()
    .select({ id: domains.id })
    .from(domains)
    .where(and(eq(domains.name, name), eq(domains.userId, userId), eq(domains.status, 'verified')));

  return domain !== undefined;
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

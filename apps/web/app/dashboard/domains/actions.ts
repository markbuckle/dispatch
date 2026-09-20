'use server';

import {
  createDomainIdentity,
  DomainAlreadyExistsError,
  DomainNotFoundError,
  deleteDomainIdentity,
  getDomainIdentity,
} from '@dispatch/core';
import {
  type Domain,
  deleteDomainForUser,
  findDomainForUser,
  insertDomain,
  listDomainsForUser,
  listUnsettledDomainsForUser,
  recordDomainCheckForUser,
} from '@dispatch/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUserId } from '../../../lib/supabase/require-user-id';

const DOMAINS_PATH = '/dashboard/domains';

// SES accepts any string as an identity, so a typo would become an identity that can never verify
const HOSTNAME =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

const createDomainSchema = z.object({
  name: z
    .string()
    .trim()
    .toLowerCase()
    .regex(HOSTNAME, 'Enter a domain like mail.harborline.co, without https:// or a path.'),
});

export type CreateDomainInput = z.input<typeof createDomainSchema>;

type Rejected = { status: 'rejected'; message: string };

export type CreateDomainResult = { status: 'created'; domain: Domain } | Rejected;

export type CheckDomainStatusResult = { status: 'checked'; domain: Domain } | Rejected;

export type RemoveDomainResult = { status: 'removed' } | Rejected;

const MISSING_DOMAIN: Rejected = { status: 'rejected', message: 'That domain no longer exists.' };

export async function listDomains(): Promise<Domain[]> {
  return listDomainsForUser(await requireUserId());
}

export async function createDomain(input: CreateDomainInput): Promise<CreateDomainResult> {
  const userId = await requireUserId();
  const parsed = createDomainSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'rejected', message: parsed.error.issues[0]?.message ?? 'Check the domain.' };
  }
  const { name } = parsed.data;

  const identity = await createDomainIdentity(name).catch((error: unknown) => {
    if (error instanceof DomainAlreadyExistsError) return null;
    throw error;
  });
  if (!identity) {
    return { status: 'rejected', message: `${name} has already been added.` };
  }

  const domain = await insertDomain({
    userId,
    name,
    status: identity.status,
    dkimTokens: identity.dkimTokens,
    dkimHostedZone: identity.dkimHostedZone,
  }).catch(async (error: unknown) => {
    // without a row nobody owns the identity, and SES would refuse this name to everyone from now on
    await deleteDomainIdentity(name);
    throw error;
  });
  revalidatePath(DOMAINS_PATH);

  return { status: 'created', domain };
}

// polled from the domains page; the page stops rendering the poller once nothing is left unsettled
export async function recheckPendingDomains(): Promise<void> {
  const userId = await requireUserId();

  // one at a time, because an account with many pending domains would otherwise burst SES on every tick
  for (const domain of await listUnsettledDomainsForUser(userId)) {
    const identity = await getDomainIdentity(domain.name).catch((error: unknown) => {
      if (error instanceof DomainNotFoundError) return null;
      throw error;
    });
    if (identity) await recordDomainCheckForUser(domain.id, userId, identity.status);
  }

  revalidatePath(DOMAINS_PATH);
}

export async function checkDomainStatus(id: string): Promise<CheckDomainStatusResult> {
  const userId = await requireUserId();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return MISSING_DOMAIN;

  const domain = await findDomainForUser(parsed.data, userId);
  if (!domain) return MISSING_DOMAIN;

  const identity = await getDomainIdentity(domain.name).catch((error: unknown) => {
    if (error instanceof DomainNotFoundError) return null;
    throw error;
  });
  if (!identity) {
    return {
      status: 'rejected',
      message: `SES has no identity for ${domain.name}. Remove it and add it again.`,
    };
  }

  const checked = await recordDomainCheckForUser(domain.id, userId, identity.status);
  if (!checked) return MISSING_DOMAIN;
  revalidatePath(DOMAINS_PATH);

  return { status: 'checked', domain: checked };
}

export async function removeDomain(id: string): Promise<RemoveDomainResult> {
  const userId = await requireUserId();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return MISSING_DOMAIN;

  const domain = await findDomainForUser(parsed.data, userId);
  if (!domain) return MISSING_DOMAIN;

  // SES first, so a failed delete leaves the row in place to retry rather than an orphaned identity
  await deleteDomainIdentity(domain.name);
  await deleteDomainForUser(domain.id, userId);
  revalidatePath(DOMAINS_PATH);

  return { status: 'removed' };
}

import { type Domain, type DomainSummary, domainStatus } from '@dispatch/db';
import { z } from 'zod';
import { dkimRecords } from '../domains/dkim-records';
import { apiListSchema } from './list';

export const apiDomainSummarySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  status: z.enum(domainStatus.enumValues),
  created_at: z.iso.datetime(),
});

export const apiDnsRecordSchema = z.object({
  // labelled by purpose as Resend's are, so a record that is not DKIM can join the list without a new field
  record: z.literal('DKIM'),
  type: z.literal('CNAME'),
  name: z.string(),
  value: z.string(),
});

export const apiDomainSchema = z.object({
  object: z.literal('domain'),
  ...apiDomainSummarySchema.shape,
  last_checked_at: z.iso.datetime().nullable(),
  verified_at: z.iso.datetime().nullable(),
  records: z.array(apiDnsRecordSchema),
});

export const apiDomainListSchema = apiListSchema(apiDomainSummarySchema);

export type ApiDomainSummary = z.infer<typeof apiDomainSummarySchema>;
export type ApiDomain = z.infer<typeof apiDomainSchema>;

export function toApiDomainSummary(domain: DomainSummary): ApiDomainSummary {
  return {
    id: domain.id,
    name: domain.name,
    status: domain.status,
    created_at: domain.createdAt.toISOString(),
  };
}

export function toApiDomain(domain: Domain): ApiDomain {
  return {
    object: 'domain',
    ...toApiDomainSummary(domain),
    last_checked_at: domain.lastCheckedAt?.toISOString() ?? null,
    verified_at: domain.verifiedAt?.toISOString() ?? null,
    records: dkimRecords(domain).map((record) => ({ record: 'DKIM', ...record })),
  };
}

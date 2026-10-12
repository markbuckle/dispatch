import type { Domain } from '@dispatch/db';

export type DkimRecord = { type: 'CNAME'; name: string; value: string };

// one derivation for the api and the dashboard, because these are the records a user pastes into their DNS
export function dkimRecords({
  name,
  dkimTokens,
  dkimHostedZone,
}: Pick<Domain, 'name' | 'dkimTokens' | 'dkimHostedZone'>): DkimRecord[] {
  return dkimTokens.map((token) => ({
    type: 'CNAME',
    name: `${token}._domainkey.${name}`,
    value: `${token}.${dkimHostedZone}`,
  }));
}

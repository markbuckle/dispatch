import type { Domain } from '@dispatch/db';
import type { ReactNode } from 'react';
import { formatRelative, formatUtc } from '../format-time';
import { CheckDomainButton } from './check-domain-button';
import { DnsRecordsButton } from './dns-records-button';
import { DomainStatusPill } from './domain-status-pill';
import { RemoveDomainButton } from './remove-domain-button';

export function DomainsTable({ domains }: { domains: Domain[] }) {
  const now = Date.now();

  return (
    <div className="overflow-hidden rounded-lg border border-border-default">
      <table className="w-full border-collapse text-body">
        <thead className="bg-subtle">
          <tr>
            <Th>Domain</Th>
            <Th>Status</Th>
            <Th>Last checked</Th>
            <th className="h-header-row px-5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {domains.map((domain) => (
            <tr
              key={domain.id}
              className="dispatch-transition border-b border-border-subtle last:border-b-0 hover:bg-surface"
            >
              <td className="h-row px-5 align-middle text-text-primary">{domain.name}</td>
              <td className="h-row px-5 align-middle">
                <DomainStatusPill status={domain.status} />
              </td>
              <td className="h-row px-5 align-middle text-text-muted">
                {domain.lastCheckedAt ? (
                  <time
                    dateTime={domain.lastCheckedAt.toISOString()}
                    title={formatUtc(domain.lastCheckedAt)}
                  >
                    {formatRelative(domain.lastCheckedAt, now)}
                  </time>
                ) : (
                  'Never'
                )}
              </td>
              <td className="h-row px-5 align-middle">
                <div className="flex items-center justify-end gap-2">
                  {domain.status !== 'verified' && <CheckDomainButton id={domain.id} />}
                  <DnsRecordsButton
                    name={domain.name}
                    dkimTokens={domain.dkimTokens}
                    dkimHostedZone={domain.dkimHostedZone}
                  />
                  <RemoveDomainButton id={domain.id} name={domain.name} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th
      scope="col"
      className="h-header-row whitespace-nowrap px-5 text-left text-meta font-medium text-text-secondary"
    >
      {children}
    </th>
  );
}

import type { Domain } from '@dispatch/db';
import type { ReactNode } from 'react';
import { CheckDomainButton } from './check-domain-button';
import { DnsRecordsButton } from './dns-records-button';
import { DomainStatusPill } from './domain-status-pill';
import { RemoveDomainButton } from './remove-domain-button';

// relative in tables, absolute UTC on hover, per foundations/voice.md
function formatRelative(value: Date, now: number): string {
  const minutes = Math.floor((now - value.getTime()) / 60_000);
  if (minutes < 1) return '<1m';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function formatUtc(value: Date): string {
  return value.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

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

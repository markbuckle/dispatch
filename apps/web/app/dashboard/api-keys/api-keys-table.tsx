import type { ApiKeySummary } from '@dispatch/db';
import type { ReactNode } from 'react';
import { permissionLabels } from './permissions';
import { RevokeApiKeyButton } from './revoke-api-key-button';

// UTC so a row reads the same date wherever the server runs
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

// en-GB renders September as Sept, the one month it abbreviates to four letters
function formatDate(value: Date): string {
  return dateFormat
    .formatToParts(value)
    .map((part) => (part.type === 'month' ? part.value.slice(0, 3) : part.value))
    .join('');
}

export function ApiKeysTable({ keys }: { keys: ApiKeySummary[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border-default">
      <table className="w-full border-collapse text-body">
        <thead className="bg-subtle">
          <tr>
            <Th>Name</Th>
            <Th>Key</Th>
            <Th>Permission</Th>
            <Th>Last used</Th>
            <Th>Created</Th>
            <th className="h-header-row px-5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr
              key={key.id}
              className="dispatch-transition border-b border-border-subtle last:border-b-0 hover:bg-surface"
            >
              <td
                className={`h-row px-5 align-middle ${key.revokedAt ? 'text-text-muted' : 'text-text-primary'}`}
              >
                {key.name}
              </td>
              <td className="h-row px-5 align-middle font-mono text-mono text-text-secondary">
                {key.keyPrefix}…
              </td>
              <td className="h-row px-5 align-middle text-text-secondary">
                {permissionLabels[key.permission]}
              </td>
              <td className="h-row px-5 align-middle text-text-muted">
                {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}
              </td>
              <td className="h-row px-5 align-middle text-text-muted">
                {formatDate(key.createdAt)}
              </td>
              <td className="h-row px-5 text-right align-middle">
                {key.revokedAt ? (
                  <span className="text-meta text-text-muted">
                    Revoked {formatDate(key.revokedAt)}
                  </span>
                ) : (
                  <RevokeApiKeyButton id={key.id} keyPrefix={key.keyPrefix} />
                )}
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

import type { RequestLog } from '@dispatch/db';
import type { ReactNode } from 'react';
import { formatRelative, formatUtc } from '../format-time';
import { StatusPill } from './status-pill';

export function LogsTable({ logs }: { logs: RequestLog[] }) {
  const now = Date.now();

  return (
    <div className="overflow-hidden rounded-lg border border-border-default">
      <table className="w-full border-collapse text-body">
        <thead className="bg-subtle">
          <tr>
            <Th>Method</Th>
            <Th>Path</Th>
            <Th>Status</Th>
            <Th>Duration</Th>
            <Th>Created</Th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className="dispatch-transition border-b border-border-subtle last:border-b-0 hover:bg-surface"
            >
              <td className="h-row px-5 align-middle font-mono text-mono text-text-secondary">
                {log.method}
              </td>
              <td className="h-row px-5 align-middle font-mono text-mono text-text-primary">
                {log.path}
              </td>
              <td className="h-row px-5 align-middle">
                <StatusPill status={log.status} />
              </td>
              <td className="h-row px-5 align-middle text-text-secondary tabular-nums">
                {log.durationMs} ms
              </td>
              <td className="h-row px-5 align-middle text-text-muted">
                <time dateTime={log.createdAt.toISOString()} title={formatUtc(log.createdAt)}>
                  {formatRelative(log.createdAt, now)}
                </time>
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

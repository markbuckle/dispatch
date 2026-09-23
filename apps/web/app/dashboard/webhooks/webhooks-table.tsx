'use client';

import type { WebhookSummary } from '@dispatch/db';
import Link from 'next/link';
import { Fragment, type ReactNode, useId, useState, useTransition } from 'react';
import { smallButton } from '../button-styles';
import { CopyField } from '../copy-field';
import { formatRelative, formatUtc } from '../format-time';
import { revealWebhookSecret } from './actions';
import { DeleteWebhookButton } from './delete-webhook-button';
import { eventLabels } from './events';

function omit(source: Record<string, string>, key: string): Record<string, string> {
  const next = { ...source };
  delete next[key];
  return next;
}

export function WebhooksTable({ webhooks }: { webhooks: WebhookSummary[] }) {
  const panelId = useId();
  const now = Date.now();
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [renderedWebhooks, setRenderedWebhooks] = useState(webhooks);
  const [, startTransition] = useTransition();

  // a new list means the server re-rendered, and a revealed secret must not stay open across that
  if (renderedWebhooks !== webhooks) {
    setRenderedWebhooks(webhooks);
    setSecrets({});
    setErrors({});
  }

  function handleToggle(id: string, isExpanded: boolean) {
    if (isExpanded) {
      setSecrets((current) => omit(current, id));
      setErrors((current) => omit(current, id));
      return;
    }

    setPendingId(id);
    startTransition(async () => {
      const result = await revealWebhookSecret(id);
      setPendingId(null);
      if (result.status === 'rejected') {
        setErrors((current) => ({ ...current, [id]: result.message }));
        return;
      }
      setSecrets((current) => ({ ...current, [id]: result.secret }));
    });
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border-default">
      <table className="w-full border-collapse text-body">
        <thead className="bg-subtle">
          <tr>
            <Th>URL</Th>
            <Th>Events</Th>
            <Th>Created</Th>
            <th className="h-header-row px-5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {webhooks.map((webhook) => {
            const secret = secrets[webhook.id];
            const error = errors[webhook.id];
            const isExpanded = secret !== undefined || error !== undefined;
            const rowPanelId = `${panelId}-${webhook.id}`;

            return (
              <Fragment key={webhook.id}>
                <tr className="dispatch-transition border-b border-border-subtle last:border-b-0 hover:bg-surface">
                  <td className="h-row px-5 align-middle font-mono text-mono text-text-primary">
                    <Link
                      href={`/dashboard/webhooks/${webhook.id}`}
                      className="dispatch-transition rounded-xs text-text-primary outline-none hover:text-text-secondary focus-visible:shadow-focus"
                    >
                      {webhook.url}
                    </Link>
                  </td>
                  <td className="h-row px-5 align-middle text-text-secondary">
                    {webhook.events.map((event) => eventLabels[event]).join(', ')}
                  </td>
                  <td className="h-row px-5 align-middle text-text-muted">
                    <time
                      dateTime={webhook.createdAt.toISOString()}
                      title={formatUtc(webhook.createdAt)}
                    >
                      {formatRelative(webhook.createdAt, now)}
                    </time>
                  </td>
                  <td className="h-row px-5 align-middle">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(webhook.id, isExpanded)}
                        disabled={pendingId === webhook.id}
                        aria-expanded={isExpanded}
                        aria-controls={isExpanded ? rowPanelId : undefined}
                        className={smallButton}
                      >
                        {isExpanded ? 'Hide secret' : 'Show secret'}
                      </button>
                      <DeleteWebhookButton id={webhook.id} url={webhook.url} />
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr id={rowPanelId} className="border-b border-border-subtle last:border-b-0">
                    <td colSpan={4} className="bg-surface px-5 py-4">
                      {secret !== undefined ? (
                        <div className="flex flex-col gap-2">
                          <CopyField value={secret} label={`signing secret for ${webhook.url}`} />
                          <p className="text-caption text-text-muted">
                            Dispatch signs every request with this secret. You can show it again any
                            time.
                          </p>
                        </div>
                      ) : (
                        <p className="text-caption text-danger-fg">{error}</p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
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

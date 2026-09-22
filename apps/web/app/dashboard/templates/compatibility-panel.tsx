'use client';

import { checkCompatibility } from '@dispatch/compat';
import { useEffect, useMemo, useState } from 'react';
import { groupClients, summariseFindings } from './compatibility-summary';

// a check reparses every style in the body, so it waits for a pause in typing instead of running per keystroke
const CHECK_DELAY = 200;

export function CompatibilityPanel({ html }: { html: string }) {
  const [checkedHtml, setCheckedHtml] = useState(html);

  useEffect(() => {
    const timer = setTimeout(() => setCheckedHtml(html), CHECK_DELAY);
    return () => clearTimeout(timer);
  }, [html]);

  // every field in the editor re-renders this, and only a settled html change is worth reparsing
  const { findings, snapshot } = useMemo(() => checkCompatibility(checkedHtml), [checkedHtml]);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-meta font-medium text-text-secondary">Compatibility</h2>

      {findings.length === 0 ? (
        <p className="text-caption text-text-muted">
          No properties flagged against caniemail data from {snapshot.lastUpdateDate.slice(0, 10)}.
        </p>
      ) : (
        <details className="group rounded-md border border-warning-edge bg-warning-tint">
          <summary className="dispatch-transition flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-3 py-2.5 text-caption text-warning-fg outline-none focus-visible:shadow-focus [&::-webkit-details-marker]:hidden">
            <span>{summariseFindings(findings)}</span>
            <span className="shrink-0 group-open:hidden">Show</span>
            <span className="hidden shrink-0 group-open:inline">Hide</span>
          </summary>
          <ul className="flex flex-col divide-y divide-warning-edge border-t border-warning-edge">
            {findings.map((finding) => {
              const unsupported = finding.clients.filter(
                (client) => client.level === 'unsupported',
              );
              const partial = finding.clients.filter((client) => client.level === 'partial');

              return (
                <li
                  key={`${finding.slug}|${finding.trigger.property}|${finding.trigger.value}|${finding.trigger.source}`}
                  className="flex flex-col gap-1.5 px-3 py-2.5"
                >
                  <code className="wrap-anywhere font-mono text-mono text-text-primary">
                    {finding.trigger.property}: {finding.trigger.value}
                  </code>
                  {unsupported.length > 0 && (
                    <p className="text-caption text-text-secondary">
                      Not supported: {groupClients(unsupported)}
                    </p>
                  )}
                  {partial.length > 0 && (
                    <p className="text-caption text-text-secondary">
                      Partially supported: {groupClients(partial)}
                    </p>
                  )}
                  <a
                    href={finding.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-max rounded-xs text-caption text-text-primary outline-none hover:underline focus-visible:shadow-focus"
                  >
                    {finding.feature} on caniemail
                  </a>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </section>
  );
}

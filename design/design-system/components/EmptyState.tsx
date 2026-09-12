import * as React from 'react';

/**
 * One line of what's missing, one action. No illustration, ever.
 * See foundations/imagery.md - this is the most frequently violated rule in the system.
 */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <h3 className="text-h3 text-text-primary">{title}</h3>
      {body && <p className="max-w-[380px] text-body text-text-secondary">{body}</p>}
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}

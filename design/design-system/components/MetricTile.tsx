import * as React from 'react';
import { cn } from './cn';

/**
 * Overline label, tabular value, delta. The delta is the only place colour
 * appears — and only when the direction actually carries meaning.
 */
export function MetricTile({
  label,
  value,
  delta,
  direction = 'neutral',
  footnote,
}: {
  label: string;
  value: string;
  delta?: string;
  direction?: 'up' | 'down' | 'neutral';
  footnote?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border-default bg-surface p-5 shadow-ring">
      <span className="text-overline uppercase tracking-[0.06em] text-text-muted">{label}</span>
      <span className="text-display-s tabular-nums text-text-primary">{value}</span>
      {(delta || footnote) && (
        <div className="flex items-baseline gap-2">
          {delta && (
            <span
              className={cn(
                'text-caption font-medium tabular-nums',
                direction === 'up' && 'text-success-fg',
                direction === 'down' && 'text-danger-fg',
                direction === 'neutral' && 'text-text-muted',
              )}
            >
              {delta}
            </span>
          )}
          {footnote && <span className="text-caption text-text-muted">{footnote}</span>}
        </div>
      )}
    </div>
  );
}

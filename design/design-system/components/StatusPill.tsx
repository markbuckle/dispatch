import * as React from 'react';
import { cn } from './cn';

/** Fixed vocabulary - see foundations/vocabulary.md. Do not paraphrase these labels. */
export type Status =
  | 'Queued' | 'Sent' | 'Delivered' | 'Bounced' | 'Deferred'
  | 'Complained' | 'Suppressed' | 'Opened' | 'Clicked' | 'Canceled' | 'Failed';

/**
 * Solid fill, bright foreground, no dot - measured off the product in dark mode.
 * The WORD carries the meaning, which is what satisfies the "never colour alone"
 * rule; the dot was belt-and-braces and read as noise at twelve rows deep.
 * Never render this with the label hidden or abbreviated.
 */
const tone: Record<Status, string> = {
  Delivered:  'bg-success-bg text-success-fg',
  Queued:     'bg-warning-bg text-warning-fg',
  Deferred:   'bg-warning-bg text-warning-fg',
  Bounced:    'bg-danger-bg text-danger-fg',
  Complained: 'bg-danger-bg text-danger-fg',
  Failed:     'bg-danger-bg text-danger-fg',
  Opened:     'bg-info-bg text-info-fg',
  Clicked:    'bg-info-bg text-info-fg',
  Sent:       'bg-neutral-bg text-neutral-fg',
  Suppressed: 'bg-neutral-bg text-neutral-fg',
  Canceled:   'bg-off-bg text-off-fg',
};

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-pill w-max items-center justify-self-start rounded-sm px-2.5',
        'text-pill whitespace-nowrap',
        tone[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

/**
 * Tinted 34px leading tile that pairs with a pill in a table row - the status
 * colour at 7% behind a monoline glyph, so the row reads at a glance.
 */
export function StatusTile({ status, children }: { status: Status; children: React.ReactNode }) {
  const tint: Record<string, string> = {
    Delivered: 'bg-success-tint border-success-edge text-success-fg',
    Queued: 'bg-warning-tint border-warning-edge text-warning-fg',
    Deferred: 'bg-warning-tint border-warning-edge text-warning-fg',
    Bounced: 'bg-danger-tint border-danger-edge text-danger-fg',
    Complained: 'bg-danger-tint border-danger-edge text-danger-fg',
    Failed: 'bg-danger-tint border-danger-edge text-danger-fg',
    Opened: 'bg-info-tint border-info-edge text-info-fg',
    Clicked: 'bg-info-tint border-info-edge text-info-fg',
    Sent: 'bg-white/[0.03] border-border-strong text-neutral-fg',
    Suppressed: 'bg-white/[0.03] border-border-strong text-neutral-fg',
    Canceled: 'bg-white/[0.02] border-border-default text-off-fg',
  };
  return (
    <span className={cn('flex size-[34px] shrink-0 items-center justify-center rounded-md border', tint[status])}>
      {children}
    </span>
  );
}

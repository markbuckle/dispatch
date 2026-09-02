import * as React from 'react';
import { cn } from './cn';

/**
 * Row geometry, as built:
 *   h-row (60px) · text-body (16px) · px-5 · border-t border-border-subtle
 * Header row is 48px on bg-subtle. Corrected three times: 40px/14px came from a
 * light-mode capture, 56px/15px from the dark measurement, 60px/16px from
 * matching the rebuilt screens against the reference.
 */
export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-hidden rounded-lg border border-border-default">
      <table className={cn('w-full border-collapse text-body', className)} {...props} />
    </div>
  );
}

export function Thead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-subtle', className)} {...props} />;
}

export function Th({
  className,
  numeric,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <th
      scope="col"
      className={cn(
        'h-header-row whitespace-nowrap px-5 text-meta font-medium text-text-secondary',
        numeric ? 'text-right' : 'text-left',
        className,
      )}
      {...props}
    />
  );
}

export function Tr({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-border-subtle transition-colors duration-fast ease-out last:border-b-0 hover:bg-surface',
        className,
      )}
      {...props}
    />
  );
}

export function Td({
  className,
  numeric,
  muted,
  mono,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean; muted?: boolean; mono?: boolean }) {
  return (
    <td
      className={cn(
        'h-row px-5 align-middle',
        // Tabular numerals: proportional digits make a column of numbers unscannable.
        numeric && 'text-right tabular-nums',
        muted ? 'text-text-muted' : 'text-text-primary',
        mono && 'font-mono text-mono',
        className,
      )}
      {...props}
    />
  );
}

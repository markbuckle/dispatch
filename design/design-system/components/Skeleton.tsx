import * as React from 'react';
import { cn } from './cn';

/** Opacity pulse only - never a shimmer sweep or a gradient. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn('rounded-sm bg-hover animate-[dispatch-pulse_1200ms_ease-in-out_infinite]', className)}
      {...props}
    />
  );
}

/** Matches Table's 40px row geometry so the swap to real data doesn't shift layout. */
export function TableSkeleton({ rows = 8, cols = 4 }: { rows?: number; cols?: number }) {
  const widths = ['w-40', 'w-20', 'w-56', 'w-12'];
  return (
    <div className="overflow-hidden rounded-lg border border-border-default">
      <div className="h-control bg-subtle" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex h-10 items-center gap-3 border-b border-border-subtle px-3 last:border-b-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn('h-3.5', widths[c % widths.length])} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* Add to tokens.css or your global stylesheet:
@keyframes dispatch-pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
*/

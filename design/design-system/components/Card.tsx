import * as React from 'react';
import { cn } from './cn';

/** Level 1 elevation: surface bg, border-default, 4% inner highlight. No drop shadow. */
export function Card({
  className,
  compact,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { compact?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border-default bg-surface shadow-ring',
        compact ? 'p-4' : 'p-5',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-baseline justify-between gap-4 border-b border-border-subtle px-5 py-4', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-h3 text-text-primary', className)} {...props} />;
}

export function CardMeta({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('whitespace-nowrap font-mono text-[11.5px] text-text-muted', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-t border-border-subtle px-5 py-3.5 text-caption text-text-muted', className)} {...props} />;
}

import * as React from 'react';
import * as RTabs from '@radix-ui/react-tabs';
import { cn } from './cn';

export function Tabs({ className, ...props }: RTabs.TabsProps) {
  return <RTabs.Root className={cn('flex flex-col gap-5', className)} {...props} />;
}

/** Underline, not a pill. A pill tab bar reads as marketing chrome in a dense product. */
export function TabsList({ className, ...props }: RTabs.TabsListProps) {
  return <RTabs.List className={cn('flex gap-4 border-b border-border-subtle', className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: RTabs.TabsTriggerProps) {
  return (
    <RTabs.Trigger
      className={cn(
        'relative -mb-px h-control border-b border-transparent px-0.5 text-body font-medium text-text-muted outline-none',
        'transition-colors duration-fast ease-out',
        'hover:text-text-secondary',
        'focus-visible:shadow-focus focus-visible:rounded-sm',
        'data-[state=active]:border-text-primary data-[state=active]:text-text-primary',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: RTabs.TabsContentProps) {
  return <RTabs.Content className={cn('outline-none', className)} {...props} />;
}

/** Segmented control - for switching a view, not navigating. */
export function Segmented({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex h-control items-center gap-0.5 rounded-md border border-border-default bg-subtle p-0.5', className)}
    >
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'h-7 rounded-sm px-2.5 text-caption font-medium outline-none transition-colors duration-fast ease-out',
            'focus-visible:shadow-focus',
            value === o.value ? 'bg-hover text-text-primary' : 'text-text-muted hover:text-text-secondary',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

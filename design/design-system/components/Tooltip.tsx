import * as React from 'react';
import * as RTooltip from '@radix-ui/react-tooltip';
import { cn } from './cn';

/** 400ms open delay, opacity only, 120ms. A tooltip that slides is a distraction. */
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <RTooltip.Provider delayDuration={400} skipDelayDuration={200}>{children}</RTooltip.Provider>;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  shortcut,
}: {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  shortcut?: string;
}) {
  return (
    <RTooltip.Root>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content
          side={side}
          sideOffset={6}
          className={cn(
            'z-50 flex items-center gap-2 rounded-md border border-border-strong bg-subtle px-2 py-1.5',
            'text-caption text-text-primary shadow-overlay',
            'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0',
            'duration-fast ease-out',
          )}
        >
          {content}
          {shortcut && <span className="font-mono text-[11px] text-text-placeholder">{shortcut}</span>}
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  );
}

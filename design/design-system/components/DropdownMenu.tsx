import * as React from 'react';
import * as RMenu from '@radix-ui/react-dropdown-menu';
import { cn } from './cn';

export const DropdownMenu = RMenu.Root;
export const DropdownMenuTrigger = RMenu.Trigger;

export function DropdownMenuContent({ className, sideOffset = 4, ...props }: RMenu.DropdownMenuContentProps) {
  return (
    <RMenu.Portal>
      <RMenu.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[180px] overflow-hidden rounded-lg border border-border-strong bg-subtle p-1 shadow-overlay',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
          'duration-overlay ease-standard',
          className,
        )}
        {...props}
      />
    </RMenu.Portal>
  );
}

export function DropdownMenuItem({
  className,
  destructive,
  ...props
}: RMenu.DropdownMenuItemProps & { destructive?: boolean }) {
  return (
    <RMenu.Item
      className={cn(
        'flex h-[34px] cursor-default select-none items-center gap-2 rounded-md px-2.5 text-body outline-none',
        destructive
          ? 'text-danger-fg data-[highlighted]:bg-danger-bg'
          : 'text-text-secondary data-[highlighted]:bg-hover data-[highlighted]:text-text-primary',
        'data-[disabled]:pointer-events-none data-[disabled]:text-text-placeholder',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }: RMenu.DropdownMenuSeparatorProps) {
  return <RMenu.Separator className={cn('-mx-1 my-1 h-px bg-border-subtle', className)} {...props} />;
}

export function DropdownMenuLabel({ className, ...props }: RMenu.DropdownMenuLabelProps) {
  return (
    <RMenu.Label
      className={cn('px-2.5 py-1.5 text-overline uppercase tracking-[0.06em] text-text-muted', className)}
      {...props}
    />
  );
}

export function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('ml-auto font-mono text-[11.5px] text-text-placeholder', className)} {...props} />;
}

import * as React from 'react';
import * as RDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from './cn';

export const Dialog = RDialog.Root;
export const DialogTrigger = RDialog.Trigger;
export const DialogClose = RDialog.Close;

export function DialogContent({
  className,
  children,
  ...props
}: RDialog.DialogContentProps) {
  return (
    <RDialog.Portal>
      <RDialog.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-black/60',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-overlay ease-standard',
        )}
      />
      <RDialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-40px)] max-w-dialog -translate-x-1/2 -translate-y-1/2',
          'overflow-hidden rounded-lg border border-border-strong bg-subtle shadow-overlay',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98]',
          'duration-overlay ease-standard outline-none',
          className,
        )}
        {...props}
      >
        {children}
        <RDialog.Close
          className="absolute right-3.5 top-3.5 rounded-sm p-1 text-text-muted outline-none transition-colors duration-fast ease-out hover:bg-hover hover:text-text-primary focus-visible:shadow-focus"
          aria-label="Close"
        >
          <X size={16} strokeWidth={2.25} absoluteStrokeWidth />
        </RDialog.Close>
      </RDialog.Content>
    </RDialog.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 border-b border-border-subtle px-5 py-4 pr-12', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: RDialog.DialogTitleProps) {
  return <RDialog.Title className={cn('text-h3 text-text-primary', className)} {...props} />;
}

/** Be blunt about consequences. "This key stops working immediately." */
export function DialogDescription({ className, ...props }: RDialog.DialogDescriptionProps) {
  return <RDialog.Description className={cn('text-body text-text-secondary', className)} {...props} />;
}

export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-5', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 border-t border-border-subtle bg-surface px-5 py-4', className)}
      {...props}
    />
  );
}

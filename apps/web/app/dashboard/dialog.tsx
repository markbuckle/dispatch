'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import type { HTMLAttributes, ReactNode } from 'react';

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export function DialogContent({
  children,
  size = 'default',
  onInteractOutside,
}: {
  children: ReactNode;
  size?: 'default' | 'wide';
  onInteractOutside?: RadixDialog.DialogContentProps['onInteractOutside'];
}) {
  // capped to the viewport so a tall dialog scrolls its body instead of losing its title and actions
  const bounds = `max-h-[calc(100dvh-40px)] w-[calc(100vw-40px)] ${size === 'wide' ? 'max-w-dialog-wide' : 'max-w-dialog'}`;

  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="dispatch-scrim-enter fixed inset-0 z-50 bg-scrim" />
      <RadixDialog.Content
        onInteractOutside={onInteractOutside}
        className={`dispatch-dialog-enter fixed top-1/2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border-strong bg-subtle shadow-overlay outline-none ${bounds}`}
      >
        {children}
        <RadixDialog.Close
          aria-label="Close"
          className="dispatch-transition absolute top-3.5 right-3.5 rounded-sm p-1 text-text-muted outline-none hover:bg-hover hover:text-text-primary focus-visible:shadow-focus"
        >
          <CloseIcon />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogHeader(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className="flex shrink-0 flex-col gap-1.5 border-b border-border-subtle px-5 py-4 pr-12"
      {...props}
    />
  );
}

export function DialogTitle(props: RadixDialog.DialogTitleProps) {
  return <RadixDialog.Title className="text-h3 text-text-primary" {...props} />;
}

export function DialogDescription(props: RadixDialog.DialogDescriptionProps) {
  return <RadixDialog.Description className="text-body text-text-secondary" {...props} />;
}

export function DialogBody(props: HTMLAttributes<HTMLDivElement>) {
  return <div className="min-h-0 overflow-y-auto px-5 py-5" {...props} />;
}

export function DialogFooter(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className="flex shrink-0 items-center justify-end gap-2 border-t border-border-subtle bg-surface px-5 py-4"
      {...props}
    />
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M9 9 L23 23 M23 9 L9 23" />
    </svg>
  );
}

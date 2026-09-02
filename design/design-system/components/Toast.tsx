import * as React from 'react';
import * as RToast from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from './cn';

export const ToastProvider = RToast.Provider;

export function ToastViewport({ className, ...props }: RToast.ToastViewportProps) {
  return (
    <RToast.Viewport
      className={cn('fixed bottom-0 right-0 z-50 flex w-[380px] max-w-[100vw] flex-col gap-2 p-5 outline-none', className)}
      {...props}
    />
  );
}

/** No coloured shadow, no glow. Tone shows in the left-edge border only. */
export function Toast({
  title,
  description,
  tone = 'neutral',
  action,
  className,
  ...props
}: RToast.ToastProps & {
  title: string;
  description?: string;
  tone?: 'neutral' | 'success' | 'danger';
  action?: React.ReactNode;
}) {
  return (
    <RToast.Root
      className={cn(
        'flex items-start gap-3 rounded-lg border bg-subtle p-3.5 shadow-overlay',
        tone === 'success' && 'border-success-edge',
        tone === 'danger' && 'border-danger-edge',
        tone === 'neutral' && 'border-border-strong',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=open]:slide-in-from-bottom-2 data-[state=open]:fade-in-0',
        'data-[state=closed]:fade-out-0 data-[swipe=end]:animate-out',
        'data-[state=open]:duration-overlay data-[state=closed]:duration-fast ease-standard',
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 flex-col gap-1">
        <RToast.Title className="text-body font-medium text-text-primary">{title}</RToast.Title>
        {description && (
          <RToast.Description className="text-caption text-text-secondary">{description}</RToast.Description>
        )}
      </div>
      {action && <RToast.Action altText="Action" asChild>{action}</RToast.Action>}
      <RToast.Close
        aria-label="Dismiss"
        className="shrink-0 rounded-sm p-0.5 text-text-muted outline-none transition-colors duration-fast ease-out hover:bg-hover hover:text-text-primary focus-visible:shadow-focus"
      >
        <X size={14} strokeWidth={2.25} absoluteStrokeWidth />
      </RToast.Close>
    </RToast.Root>
  );
}

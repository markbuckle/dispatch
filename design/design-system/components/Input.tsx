import * as React from 'react';
import { cn } from './cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Error text. Presence switches the field to the danger treatment. */
  error?: string;
  hint?: string;
  mono?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, mono, className, id, ...props }, ref) => {
    const fieldId = id ?? React.useId();
    return (
      <div className="flex flex-col gap-[7px]">
        {label && (
          <label
            htmlFor={fieldId}
            className={cn('text-caption font-medium', props.disabled ? 'text-text-placeholder' : 'text-text-secondary')}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${fieldId}-msg` : undefined}
          className={cn(
            // Fields sit on canvas, not surface, so they read as recessed against a card.
            'h-control-lg px-3.5 rounded-md bg-surface text-body text-text-primary',
            'border transition-[border-color,box-shadow] duration-fast ease-out outline-none',
            'placeholder:text-text-placeholder',
            error
              ? 'border-[rgba(255,149,146,0.55)] focus:border-danger-fg focus:shadow-[0_0_0_3px_rgba(255,149,146,0.18)]'
              : 'border-border-default hover:border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,144,255,0.22)]',
            'disabled:cursor-not-allowed disabled:bg-off-bg disabled:border-border-subtle disabled:text-text-placeholder',
            mono && 'font-mono text-[13px]',
            className,
          )}
          {...props}
        />
        {(error || hint) && (
          <span id={`${fieldId}-msg`} className={cn('text-caption', error ? 'text-danger-fg' : 'text-text-muted')}>
            {error ?? hint}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

/** One-time-reveal key field. Copy confirmation is a label swap, no animation. */
export function CopyField({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div
      className={cn(
        'flex h-control-lg items-center gap-2 rounded-md border border-border-default bg-surface pl-3.5 pr-1',
        className,
      )}
    >
      <span className="flex-1 truncate font-mono text-[13px] text-text-secondary">{value}</span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
        className="h-6 shrink-0 rounded-sm bg-hover px-[9px] text-caption font-medium text-text-secondary outline-none transition-colors duration-fast ease-out hover:bg-border-default hover:text-text-primary focus-visible:shadow-focus"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

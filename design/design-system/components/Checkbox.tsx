import * as React from 'react';
import * as RCheckbox from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { cn } from './cn';

/** 16px box, 4px radius — one step down from the 6px controls it sits beside. */
export function Checkbox({
  label,
  description,
  className,
  ...props
}: RCheckbox.CheckboxProps & { label?: string; description?: string }) {
  const id = props.id ?? React.useId();
  return (
    <div className="flex items-start gap-2.5">
      <RCheckbox.Root
        id={id}
        className={cn(
          'mt-px flex size-4 shrink-0 items-center justify-center rounded-sm border bg-canvas outline-none',
          'border-border-default transition-[background-color,border-color,box-shadow] duration-fast ease-out',
          'hover:border-border-strong focus-visible:shadow-focus',
          'data-[state=checked]:border-text-primary data-[state=checked]:bg-text-primary',
          'data-[state=indeterminate]:border-text-primary data-[state=indeterminate]:bg-text-primary',
          'disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-off-bg',
          className,
        )}
        {...props}
      >
        <RCheckbox.Indicator className="text-text-inverse">
          {props.checked === 'indeterminate' ? (
            <Minus size={11} strokeWidth={3} absoluteStrokeWidth />
          ) : (
            <Check size={11} strokeWidth={3} absoluteStrokeWidth />
          )}
        </RCheckbox.Indicator>
      </RCheckbox.Root>
      {(label || description) && (
        <label htmlFor={id} className="flex cursor-pointer flex-col gap-0.5">
          {label && <span className="text-body text-text-primary">{label}</span>}
          {description && <span className="text-caption text-text-muted">{description}</span>}
        </label>
      )}
    </div>
  );
}

import * as React from 'react';
import * as RSwitch from '@radix-ui/react-switch';
import { cn } from './cn';

/**
 * The one place full-pill radius is allowed outside avatars — a switch that
 * isn't a track-and-thumb reads as a checkbox.
 */
export function Switch({
  label,
  description,
  className,
  ...props
}: RSwitch.SwitchProps & { label?: string; description?: string }) {
  const id = props.id ?? React.useId();
  return (
    <div className="flex items-start justify-between gap-4">
      {(label || description) && (
        <label htmlFor={id} className="flex cursor-pointer flex-col gap-0.5">
          {label && <span className="text-body text-text-primary">{label}</span>}
          {description && <span className="text-caption text-text-muted">{description}</span>}
        </label>
      )}
      <RSwitch.Root
        id={id}
        className={cn(
          'relative h-[25px] w-11 shrink-0 rounded-full border border-border-default bg-subtle outline-none',
          'transition-[background-color,border-color,box-shadow] duration-fast ease-out',
          'hover:border-border-strong focus-visible:shadow-focus',
          'data-[state=checked]:border-text-primary data-[state=checked]:bg-text-primary',
          'disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-off-bg',
          className,
        )}
        {...props}
      >
        <RSwitch.Thumb
          className={cn(
            'block size-[12px] translate-x-[2px] rounded-full bg-text-muted',
            'transition-[transform,background-color] duration-fast ease-out',
            'data-[state=checked]:translate-x-[16px] data-[state=checked]:bg-canvas',
          )}
        />
      </RSwitch.Root>
    </div>
  );
}

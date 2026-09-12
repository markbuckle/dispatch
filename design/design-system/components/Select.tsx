import * as React from 'react';
import * as RSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from './cn';

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  label,
  disabled,
  className,
}: {
  options: SelectOption[];
  value?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-[7px]">
      {label && <span className="text-caption font-medium text-text-secondary">{label}</span>}
      <RSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RSelect.Trigger
          className={cn(
            'inline-flex h-control items-center justify-between gap-2 rounded-md border border-border-default bg-canvas px-2.5',
            'text-body text-text-primary outline-none',
            'transition-[border-color,box-shadow] duration-fast ease-out',
            'hover:border-border-strong focus-visible:shadow-focus',
            'data-[placeholder]:text-text-placeholder',
            'disabled:cursor-not-allowed disabled:bg-off-bg disabled:border-border-subtle disabled:text-text-placeholder',
            className,
          )}
        >
          <RSelect.Value placeholder={placeholder} />
          <RSelect.Icon className="text-text-muted">
            <ChevronDown size={16} strokeWidth={2.25} absoluteStrokeWidth />
          </RSelect.Icon>
        </RSelect.Trigger>

        <RSelect.Portal>
          {/* Level 2 elevation. 200ms standard easing - Radix's own default, so no override needed. */}
          <RSelect.Content
            position="popper"
            sideOffset={4}
            className={cn(
              'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg',
              'border border-border-strong bg-subtle shadow-overlay',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
              'duration-overlay ease-standard',
            )}
          >
            <RSelect.Viewport className="p-1">
              {options.map((o) => (
                <RSelect.Item
                  key={o.value}
                  value={o.value}
                  className={cn(
                    'relative flex h-[34px] cursor-default select-none items-center rounded-md pl-2.5 pr-7',
                    'text-body text-text-secondary outline-none',
                    'data-[highlighted]:bg-hover data-[highlighted]:text-text-primary',
                    'data-[state=checked]:text-text-primary',
                    'data-[disabled]:pointer-events-none data-[disabled]:text-text-placeholder',
                  )}
                >
                  <RSelect.ItemText>{o.label}</RSelect.ItemText>
                  <RSelect.ItemIndicator className="absolute right-2.5 text-text-primary">
                    <Check size={14} strokeWidth={2.25} absoluteStrokeWidth />
                  </RSelect.ItemIndicator>
                </RSelect.Item>
              ))}
            </RSelect.Viewport>
          </RSelect.Content>
        </RSelect.Portal>
      </RSelect.Root>
    </div>
  );
}

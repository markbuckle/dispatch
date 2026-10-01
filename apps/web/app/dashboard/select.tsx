'use client';

import * as RadixSelect from '@radix-ui/react-select';
import { selectTrigger } from './field-styles';

export type SelectOption = { value: string; label: string };

// design/design-system/components/Select.tsx, on the dashboard's own field styles and icons
export function Select({
  label,
  value,
  options,
  onValueChange,
  className = '',
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  className?: string;
}) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger aria-label={label} className={`${selectTrigger} ${className}`}>
        <RadixSelect.Value />
        <RadixSelect.Icon className="text-text-muted">
          <ChevronDownIcon />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="dispatch-menu-enter z-50 min-w-[var(--radix-select-trigger-width)] rounded-lg border border-border-strong bg-subtle shadow-overlay"
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="dispatch-transition relative flex h-control-sm cursor-default select-none items-center rounded-md pr-8 pl-2.5 text-body text-text-secondary outline-none data-[highlighted]:bg-hover data-[state=checked]:text-text-primary data-[highlighted]:text-text-primary"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="absolute right-2.5 text-text-primary">
                  <CheckIcon />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden
    >
      <path d="M10 13 L16 19 L22 13" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 16.5 L13.5 22 L24 10.5" />
    </svg>
  );
}

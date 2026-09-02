import * as React from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'base' | 'lg';

const variants: Record<Variant, string> = {
  // Primary inverts to a light fill: weight over colour, so the palette stays free to mean something.
  primary:
    'bg-text-primary text-text-inverse hover:bg-white active:bg-[#C8CACD] ' +
    'disabled:bg-border-default disabled:text-text-muted',
  secondary:
    'bg-subtle text-text-primary border border-border-default ' +
    'hover:bg-hover hover:border-border-strong active:bg-hover ' +
    'disabled:bg-off-bg disabled:border-border-subtle disabled:text-text-placeholder',
  ghost:
    'bg-transparent text-text-secondary hover:bg-subtle hover:text-text-primary active:bg-hover ' +
    'disabled:bg-transparent disabled:text-text-placeholder',
  danger:
    'bg-danger-tint text-danger-fg border border-danger-edge ' +
    'hover:bg-[rgba(255,149,146,0.14)] active:bg-[rgba(255,149,146,0.20)] ' +
    'disabled:bg-[rgba(255,149,146,0.04)] disabled:border-[rgba(255,149,146,0.10)] disabled:text-[rgba(255,149,146,0.4)]',
};

const sizes: Record<Size, string> = {
  sm: 'h-[34px] px-3.5 text-meta font-medium gap-1.5 rounded-chip',
  base: 'h-control px-4 text-body font-medium gap-2 rounded-md',
  lg: 'h-11 px-5 text-body font-medium gap-2 rounded-md',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Rendered at 16px. Lucide at strokeWidth 2.25. */
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'base', loading, icon, disabled, className, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap',
        'transition-[color,background-color,border-color,box-shadow] duration-fast ease-out',
        'outline-none focus-visible:shadow-focus',
        'disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

function Spinner() {
  return (
    <span
      aria-hidden
      className="size-[11px] shrink-0 rounded-full border-[1.5px] border-current/25 border-t-current animate-[spin_640ms_linear_infinite]"
    />
  );
}

// Heights and radii come from components/README.md: 42px controls, 34px small, 9px radius on small
const base =
  'dispatch-transition inline-flex items-center justify-center whitespace-nowrap outline-none focus-visible:shadow-focus disabled:cursor-not-allowed';

export const primaryButton = `${base} h-control rounded-md px-4 text-body font-medium bg-text-primary text-text-inverse hover:bg-white active:bg-[#C8CACD] disabled:bg-border-default disabled:text-text-muted`;

export const secondaryButton = `${base} h-control rounded-md px-4 text-body font-medium border border-border-default bg-subtle text-text-primary hover:border-border-strong hover:bg-hover disabled:border-border-subtle disabled:text-text-placeholder`;

export const dangerButton = `${base} h-control rounded-md px-4 text-body font-medium border border-danger-edge bg-danger-tint text-danger-fg hover:bg-danger-hover active:bg-danger-active disabled:border-border-subtle disabled:bg-transparent disabled:text-text-muted`;

export const smallButton = `${base} h-control-sm rounded-chip px-3.5 text-meta font-medium border border-border-default bg-subtle text-text-primary hover:border-border-strong hover:bg-hover disabled:border-border-subtle disabled:text-text-placeholder`;

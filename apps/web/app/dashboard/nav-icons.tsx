import type { SVGProps } from 'react';

// The nav set: 32-unit grid, drawn once in design/design-system/logo/icons/*.svg.
// Rendered at 20px, so stroke steps up to 2.5 per foundations/iconography.md's stroke-by-size table.
function NavIconBase({
  label,
  children,
  ...props
}: { label: string; children: React.ReactNode } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={label}
      {...props}
    >
      {children}
    </svg>
  );
}

export function EmailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <NavIconBase label="Emails" {...props}>
      <rect x="4" y="7" width="24" height="18" rx="2.5" />
      <path d="M6 10 L16 18 L26 10" strokeLinejoin="miter" />
    </NavIconBase>
  );
}

export function TemplateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <NavIconBase label="Templates" {...props}>
      <rect x="4" y="5" width="24" height="22" rx="2.5" />
      <path d="M4 12.5 H28" />
    </NavIconBase>
  );
}

export function ChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <NavIconBase label="Metrics" {...props}>
      <path d="M7 26 V17" />
      <path d="M16 26 V8" />
      <path d="M25 26 V13" />
    </NavIconBase>
  );
}

export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <NavIconBase label="Domains" {...props}>
      <circle cx="16" cy="16" r="12" />
      <path d="M16 4 C11.5 8 11.5 24 16 28 C20.5 24 20.5 8 16 4" />
      <path d="M4 16 H28" />
    </NavIconBase>
  );
}

export function ListIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <NavIconBase label="Logs" {...props}>
      <circle cx="6" cy="9.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="6" cy="16" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="6" cy="22.5" r="1.4" fill="currentColor" stroke="none" />
      <path d="M11.5 9.5 H27" />
      <path d="M11.5 16 H27" />
      <path d="M11.5 22.5 H27" />
    </NavIconBase>
  );
}

export function KeyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <NavIconBase label="API keys" {...props}>
      <circle cx="10" cy="10" r="5.5" />
      <path d="M14 14 L26 26" strokeLinecap="butt" />
      <path d="M20 20 L17 23" />
      <path d="M23 23 L20 26" />
    </NavIconBase>
  );
}

export function WebhookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <NavIconBase label="Webhooks" {...props}>
      <circle cx="7" cy="9" r="3.25" />
      <circle cx="25" cy="23" r="3.25" />
      <path d="M9.5 11.5 L22.5 20.5" strokeLinecap="butt" />
    </NavIconBase>
  );
}

export function GearIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <NavIconBase label="Settings" {...props}>
      <circle cx="16" cy="16" r="7" />
      <path d="M16 4 V7.5" />
      <path d="M16 24.5 V28" />
      <path d="M26.4 10 L23.4 11.75" />
      <path d="M8.6 20.25 L5.6 22" />
      <path d="M26.4 22 L23.4 20.25" />
      <path d="M8.6 11.75 L5.6 10" />
    </NavIconBase>
  );
}

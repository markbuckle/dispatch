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
      <path className="dispatch-icon-flap" d="M6 10 L16 18 L26 10" strokeLinejoin="miter" />
    </NavIconBase>
  );
}

export function TemplateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <NavIconBase label="Templates" {...props}>
      <g className="dispatch-icon-drum-out">
        <rect x="4" y="5" width="24" height="22" rx="2.5" />
        <path d="M4 12.5 H28" />
      </g>
      {/* the next face on the drum, hidden at rest */}
      <g className="dispatch-icon-drum-in">
        <rect x="4" y="5" width="24" height="22" rx="2.5" />
        <path d="M4 12.5 H28" />
      </g>
    </NavIconBase>
  );
}

export function ChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <NavIconBase label="Metrics" {...props}>
      <path className="dispatch-icon-bar" d="M7 26 V17" />
      <path className="dispatch-icon-bar" d="M16 26 V8" />
      <path className="dispatch-icon-bar" d="M25 26 V13" />
    </NavIconBase>
  );
}

export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <NavIconBase label="Domains" {...props}>
      <circle cx="16" cy="16" r="12" />
      <path className="dispatch-icon-spin" d="M16 4 C11.5 8 11.5 24 16 28 C20.5 24 20.5 8 16 4" />
      <path d="M4 16 H28" />
    </NavIconBase>
  );
}

export function ListIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <NavIconBase label="Logs" {...props}>
      <g className="dispatch-icon-row">
        <circle cx="6" cy="9.5" r="1.4" fill="currentColor" stroke="none" />
        <path d="M11.5 9.5 H27" />
      </g>
      <g className="dispatch-icon-row">
        <circle cx="6" cy="16" r="1.4" fill="currentColor" stroke="none" />
        <path d="M11.5 16 H27" />
      </g>
      <g className="dispatch-icon-row">
        <circle cx="6" cy="22.5" r="1.4" fill="currentColor" stroke="none" />
        <path d="M11.5 22.5 H27" />
      </g>
      {/* the same rows 26 units lower, below the icon's edge until the feed scrolls them in */}
      <g className="dispatch-icon-row">
        <circle cx="6" cy="35.5" r="1.4" fill="currentColor" stroke="none" />
        <path d="M11.5 35.5 H27" />
      </g>
      <g className="dispatch-icon-row">
        <circle cx="6" cy="42" r="1.4" fill="currentColor" stroke="none" />
        <path d="M11.5 42 H27" />
      </g>
      <g className="dispatch-icon-row">
        <circle cx="6" cy="48.5" r="1.4" fill="currentColor" stroke="none" />
        <path d="M11.5 48.5 H27" />
      </g>
    </NavIconBase>
  );
}

export function KeyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <NavIconBase label="API keys" {...props}>
      <g className="dispatch-icon-turn">
        <circle cx="10" cy="10" r="5.5" />
        <path d="M14 14 L26 26" strokeLinecap="butt" />
        <path d="M20 20 L17 23" />
        <path d="M23 23 L20 26" />
      </g>
    </NavIconBase>
  );
}

export function WebhookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <NavIconBase label="Webhooks" {...props}>
      {/* one hook drawn three times, 120 degrees apart: each wraps its node and throws a line into the next one's gap */}
      <g className="dispatch-icon-whirl">
        <path
          className="dispatch-icon-hook"
          pathLength={1}
          d="M21 9 A5 5 0 1 0 13.5 13.33 L9.07 21"
        />
        <path
          className="dispatch-icon-hook dispatch-icon-hook-third"
          pathLength={1}
          d="M20.43 25.33 A5 5 0 1 0 20.43 16.67 L16 9"
        />
        <path
          className="dispatch-icon-hook dispatch-icon-hook-second"
          pathLength={1}
          d="M6.57 16.67 A5 5 0 1 0 14.07 21 L22.93 21"
        />
      </g>
    </NavIconBase>
  );
}

export function GearIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <NavIconBase label="Settings" {...props}>
      <g className="dispatch-icon-tick">
        <circle cx="16" cy="16" r="7" />
        {/* every spoke runs from the hub outward, so shortening its dash pulls it in toward the hub */}
        <path className="dispatch-icon-spoke" pathLength={1} d="M16 7.5 V4" />
        <path className="dispatch-icon-spoke" pathLength={1} d="M16 24.5 V28" />
        <path className="dispatch-icon-spoke" pathLength={1} d="M23.4 11.75 L26.4 10" />
        <path className="dispatch-icon-spoke" pathLength={1} d="M8.6 20.25 L5.6 22" />
        <path className="dispatch-icon-spoke" pathLength={1} d="M23.4 20.25 L26.4 22" />
        <path className="dispatch-icon-spoke" pathLength={1} d="M8.6 11.75 L5.6 10" />
      </g>
    </NavIconBase>
  );
}

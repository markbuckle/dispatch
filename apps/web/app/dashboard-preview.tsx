import type { EmailStatus } from '@dispatch/db';
import { useId } from 'react';
import { emailStatusLabel, emailStatusTone } from './dashboard/emails/email-status';
import { EmailStatusIcon } from './dashboard/emails/email-status-icon';
import {
  ChartIcon,
  EmailIcon,
  GearIcon,
  GlobeIcon,
  KeyIcon,
  ListIcon,
  TemplateIcon,
  WebhookIcon,
} from './dashboard/nav-icons';
import type { StatusTone } from './dashboard/status-tone';
import { monogramPath } from './logo';

// Drawn in the dashboard's own px, so every size below is the token the real page uses and the whole thing scales as one
const VIEW_WIDTH = 1440;
const VIEW_HEIGHT = 900;
const SIDEBAR_WIDTH = 252;
const TOP_BAR_HEIGHT = 60;
const NAV_ITEM_HEIGHT = 44;
const ROW_HEIGHT = 60;
const HEADER_ROW_HEIGHT = 48;
const PILL_HEIGHT = 28;
const CONTENT_LEFT = SIDEBAR_WIDTH + 24;
const CONTENT_RIGHT = VIEW_WIDTH - 24;
const FILTERS_TOP = 149;
const TABLE_TOP = 209;
const SELECT_WIDTH = 240;

const columns = { to: CONTENT_LEFT + 20, status: 820, subject: 960, created: 1330 };

const navItems = [
  { label: 'Emails', Icon: EmailIcon },
  { label: 'Templates', Icon: TemplateIcon },
  { label: 'Metrics', Icon: ChartIcon },
  { label: 'Domains', Icon: GlobeIcon },
  { label: 'Logs', Icon: ListIcon },
  { label: 'API keys', Icon: KeyIcon },
  { label: 'Webhooks', Icon: WebhookIcon },
  { label: 'Settings', Icon: GearIcon },
];

const rows: { to: string; status: EmailStatus; subject: string; created: string }[] = [
  { to: 'alex@example.com', status: 'queued', subject: 'Your receipt #2042', created: '<1m' },
  { to: 'priya@example.org', status: 'delivered', subject: 'Reset your password', created: '2m' },
  { to: 'dev@example.net', status: 'sent', subject: 'Your weekly usage report', created: '9m' },
  {
    to: 'old-inbox@example.com',
    status: 'bounced',
    subject: 'Welcome to the beta',
    created: '12m',
  },
  { to: 'sam@example.com', status: 'delivered', subject: 'Confirm your email', created: '18m' },
  {
    to: 'ops@example.org',
    status: 'delivery_delayed',
    subject: 'Invoice INV-0193 is ready',
    created: '27m',
  },
  { to: 'taylor@example.net', status: 'delivered', subject: 'Your receipt #2041', created: '41m' },
  {
    to: 'promo@example.com',
    status: 'complained',
    subject: 'Your trial ends in 3 days',
    created: '1h',
  },
  {
    to: 'jordan@example.org',
    status: 'delivered',
    subject: 'New sign in from Toronto',
    created: '2h',
  },
  { to: 'kim@example.com', status: 'delivered', subject: 'Your receipt #2040', created: '3h' },
  { to: 'lee@example.net', status: 'delivered', subject: 'Your export is ready', created: '5h' },
];

// SVG text cannot size a rect to itself, so each pill is measured once at 14.5px Inter 500 and the label centres in it
const pillWidths: Record<EmailStatus, number> = {
  queued: 72,
  sent: 54,
  failed: 62,
  delivered: 86,
  bounced: 80,
  complained: 102,
  delivery_delayed: 82,
};

const pillFills: Record<StatusTone, { background: string; label: string }> = {
  success: { background: 'fill-success-bg', label: 'fill-success-fg' },
  warning: { background: 'fill-warning-bg', label: 'fill-warning-fg' },
  danger: { background: 'fill-danger-bg', label: 'fill-danger-fg' },
  neutral: { background: 'fill-neutral-bg', label: 'fill-neutral-fg' },
  off: { background: 'fill-off-bg', label: 'fill-off-fg' },
};

// A picture of the Emails page rather than a screenshot, so it stays sharp at any width and follows the tokens
export function DashboardPreview({ className = '' }: { className?: string }) {
  const id = useId();

  return (
    <div className={`dispatch-preview-fade ${className}`}>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="The Dispatch dashboard's Emails page, listing recent sends with their delivery status"
      >
        <defs>
          <clipPath id={`${id}-frame`}>
            <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} rx="16" />
          </clipPath>
          {/* lit from above like the page behind it, so the frame reads as raised without a shadow */}
          <linearGradient
            id={`${id}-edge`}
            x1="0"
            y1="0"
            x2="0"
            y2={VIEW_HEIGHT}
            gradientUnits="userSpaceOnUse"
          >
            <stop style={{ stopColor: 'var(--dispatch-border-strong)' }} />
            <stop offset="0.5" style={{ stopColor: 'var(--dispatch-border-subtle)' }} />
          </linearGradient>
          <linearGradient id={`${id}-tile`} x1="0" y1="0" x2="0" y2="1">
            <stop style={{ stopColor: 'var(--dispatch-hover)' }} />
            <stop offset="1" style={{ stopColor: 'var(--dispatch-canvas)' }} />
          </linearGradient>
        </defs>

        <g clipPath={`url(#${id}-frame)`} className="text-body">
          <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} className="fill-canvas" />

          <Sidebar tileFill={`url(#${id}-tile)`} />

          <line
            x1={SIDEBAR_WIDTH}
            y1={TOP_BAR_HEIGHT}
            x2={VIEW_WIDTH}
            y2={TOP_BAR_HEIGHT}
            className="stroke-border-subtle"
          />

          <text
            x={CONTENT_LEFT}
            y={TOP_BAR_HEIGHT + 45}
            dominantBaseline="central"
            className="fill-text-primary font-display text-h1"
          >
            Emails
          </text>

          <Filters />
          <Table />
        </g>

        <rect
          x="0.5"
          y="0.5"
          width={VIEW_WIDTH - 1}
          height={VIEW_HEIGHT - 1}
          rx="15.5"
          fill="none"
          stroke={`url(#${id}-edge)`}
        />
      </svg>
    </div>
  );
}

function Sidebar({ tileFill }: { tileFill: string }) {
  const navTop = 68;

  return (
    <g>
      <line
        x1={SIDEBAR_WIDTH}
        y1="0"
        x2={SIDEBAR_WIDTH}
        y2={VIEW_HEIGHT}
        className="stroke-border-subtle"
      />

      <rect
        x="24.5"
        y="20.5"
        width="27"
        height="27"
        rx="8"
        fill={tileFill}
        className="stroke-border-strong"
      />
      <svg x="31" y="26.5" width="13" height="14" viewBox="3.539 4 240 255" aria-hidden>
        <path d={monogramPath} className="fill-text-primary" />
      </svg>
      <text
        x="62"
        y="34"
        dominantBaseline="central"
        className="fill-text-primary font-medium text-body"
      >
        Dispatch
      </text>
      <Chevron x={216} y={26} />

      {navItems.map(({ label, Icon }, index) => {
        const top = navTop + index * (NAV_ITEM_HEIGHT + 4);
        const isActive = index === 0;
        return (
          <g key={label}>
            {isActive && (
              <rect
                x="12.5"
                y={top + 0.5}
                width={SIDEBAR_WIDTH - 25}
                height={NAV_ITEM_HEIGHT - 1}
                rx="11"
                className="fill-hover stroke-border-default"
              />
            )}
            <Icon
              x={24}
              y={top + 12}
              className={isActive ? 'text-text-primary' : 'text-text-secondary'}
            />
            <text
              x="52"
              y={top + NAV_ITEM_HEIGHT / 2}
              dominantBaseline="central"
              className={isActive ? 'fill-text-primary' : 'fill-text-secondary'}
            >
              {label}
            </text>
          </g>
        );
      })}

      <circle
        cx="36"
        cy={VIEW_HEIGHT - 34}
        r="12"
        className="fill-neutral-bg stroke-border-default"
      />
      <text
        x="36"
        y={VIEW_HEIGHT - 34}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-text-primary text-caption"
      >
        Y
      </text>
      <text
        x="58"
        y={VIEW_HEIGHT - 34}
        dominantBaseline="central"
        className="fill-text-secondary text-meta"
      >
        you@example.com
      </text>
    </g>
  );
}

function Filters() {
  const searchWidth = CONTENT_RIGHT - CONTENT_LEFT - 2 * (SELECT_WIDTH + 12);
  const selects = ['All statuses', 'Last 15 days'];
  const middle = FILTERS_TOP + 22;

  return (
    <g>
      <rect
        x={CONTENT_LEFT + 0.5}
        y={FILTERS_TOP + 0.5}
        width={searchWidth - 1}
        height="43"
        rx="11"
        className="fill-surface stroke-border-default"
      />
      <svg
        x={CONTENT_LEFT + 14}
        y={middle - 8}
        width="16"
        height="16"
        viewBox="0 0 32 32"
        fill="none"
        strokeWidth="2.75"
        strokeLinecap="round"
        className="stroke-text-muted"
        aria-hidden
      >
        <circle cx="14" cy="14" r="8" />
        <path d="M20 20 L26 26" />
      </svg>
      <text
        x={CONTENT_LEFT + 40}
        y={middle}
        dominantBaseline="central"
        className="fill-text-placeholder"
      >
        Filter emails
      </text>

      {selects.map((label, index) => {
        const left = CONTENT_LEFT + searchWidth + 12 + index * (SELECT_WIDTH + 12);
        return (
          <g key={label}>
            <rect
              x={left + 0.5}
              y={FILTERS_TOP + 0.5}
              width={SELECT_WIDTH - 1}
              height="43"
              rx="11"
              className="fill-surface stroke-border-default"
            />
            <text x={left + 14} y={middle} dominantBaseline="central" className="fill-text-primary">
              {label}
            </text>
            <Chevron x={left + SELECT_WIDTH - 30} y={middle - 8} />
          </g>
        );
      })}
    </g>
  );
}

function Table() {
  const width = CONTENT_RIGHT - CONTENT_LEFT;
  const headers = [
    { label: 'To', x: columns.to },
    { label: 'Status', x: columns.status },
    { label: 'Subject', x: columns.subject },
    { label: 'Created', x: columns.created },
  ];
  const bodyTop = TABLE_TOP + HEADER_ROW_HEIGHT;

  return (
    <g>
      <rect
        x={CONTENT_LEFT + 0.5}
        y={TABLE_TOP + 0.5}
        width={width - 1}
        height={VIEW_HEIGHT}
        rx="12"
        className="fill-canvas stroke-border-default"
      />
      <path
        d={`M${CONTENT_LEFT + 1} ${bodyTop} V${TABLE_TOP + 12} a11 11 0 0 1 11 -11 H${CONTENT_RIGHT - 12} a11 11 0 0 1 11 11 V${bodyTop} Z`}
        className="fill-subtle"
      />
      {headers.map((header) => (
        <text
          key={header.label}
          x={header.x}
          y={TABLE_TOP + HEADER_ROW_HEIGHT / 2}
          dominantBaseline="central"
          className="fill-text-secondary font-medium text-meta"
        >
          {header.label}
        </text>
      ))}

      {rows.map((row, index) => {
        const top = bodyTop + index * ROW_HEIGHT;
        const middle = top + ROW_HEIGHT / 2;
        const pill = pillFills[emailStatusTone(row.status)];
        const pillWidth = pillWidths[row.status];
        return (
          <g key={row.to}>
            {index > 0 && (
              <line
                x1={CONTENT_LEFT + 1}
                y1={top}
                x2={CONTENT_RIGHT - 1}
                y2={top}
                className="stroke-border-subtle"
              />
            )}
            {/* the tile sizes itself with CSS, which an svg nested in another ignores, so this viewport sets its 32px */}
            <svg x={columns.to} y={middle - 16} width="32" height="32" aria-hidden>
              <EmailStatusIcon status={row.status} />
            </svg>
            <text
              x={columns.to + 44}
              y={middle}
              dominantBaseline="central"
              className="fill-text-primary"
            >
              {row.to}
            </text>
            <rect
              x={columns.status}
              y={middle - PILL_HEIGHT / 2}
              width={pillWidth}
              height={PILL_HEIGHT}
              rx="8"
              className={pill.background}
            />
            <text
              x={columns.status + pillWidth / 2}
              y={middle}
              textAnchor="middle"
              dominantBaseline="central"
              className={`${pill.label} text-pill`}
            >
              {emailStatusLabel(row.status)}
            </text>
            <text
              x={columns.subject}
              y={middle}
              dominantBaseline="central"
              className="fill-text-primary"
            >
              {row.subject}
            </text>
            <text
              x={columns.created}
              y={middle}
              dominantBaseline="central"
              className="fill-text-muted"
            >
              {row.created}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Chevron({ x, y }: { x: number; y: number }) {
  return (
    <svg
      x={x}
      y={y}
      width="16"
      height="16"
      viewBox="0 0 32 32"
      fill="none"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="stroke-text-muted"
      aria-hidden
    >
      <path d="M10 13 L16 19 L22 13" />
    </svg>
  );
}

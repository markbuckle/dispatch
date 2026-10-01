import type { EmailStatus } from '@dispatch/db';
import { useId } from 'react';
import { emailStatusTone } from './email-status';

// the pill beside it names the status, so this repeats its tone and is hidden from a screen reader
export function EmailStatusIcon({ status }: { status: EmailStatus }) {
  // every row draws its own gradients, so their ids cannot collide across the table
  const id = useId();

  return (
    <svg
      viewBox="0 0 598 598"
      fill="none"
      className={`dispatch-status-icon-${emailStatusTone(status)} size-8 shrink-0`}
      aria-hidden
    >
      <defs>
        <radialGradient
          id={`${id}-glow`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(298.5 298.5) rotate(90) scale(254.5)"
        >
          <stop className="dispatch-status-icon-core" />
          <stop offset="1" className="dispatch-status-icon-rim" />
        </radialGradient>
        <radialGradient
          id={`${id}-shade`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(298.5 298.5) rotate(90) scale(254.5)"
        >
          <stop className="dispatch-status-icon-haze" />
          <stop offset="0.8" className="dispatch-status-icon-shade" />
        </radialGradient>
        <linearGradient
          id={`${id}-body`}
          x1="298.5"
          y1="180"
          x2="298.5"
          y2="417"
          gradientUnits="userSpaceOnUse"
        >
          <EnvelopeStops />
        </linearGradient>
        <linearGradient
          id={`${id}-flap`}
          x1="298.5"
          y1="202"
          x2="298.5"
          y2="287"
          gradientUnits="userSpaceOnUse"
        >
          <EnvelopeStops />
        </linearGradient>
      </defs>
      <rect
        x="7.5"
        y="7.5"
        width="583"
        height="583"
        rx="167.5"
        strokeWidth="15"
        className="dispatch-status-icon-frame"
      />
      <rect
        x="44"
        y="44"
        width="509"
        height="509"
        rx="147"
        fill={`url(#${id}-glow)`}
        fillOpacity="0.55"
      />
      <rect
        x="44"
        y="44"
        width="509"
        height="509"
        rx="147"
        fill={`url(#${id}-shade)`}
        fillOpacity="0.55"
      />
      <rect
        x="158"
        y="195"
        width="281"
        height="207"
        rx="30"
        stroke={`url(#${id}-body)`}
        strokeWidth="30"
      />
      <path
        d="M173 202.572C194.253 233.72 281.035 289.698 301.1 286.899C321.166 284.1 395.407 236.986 424 202"
        stroke={`url(#${id}-flap)`}
        strokeWidth="30"
      />
    </svg>
  );
}

function EnvelopeStops() {
  return (
    <>
      <stop className="dispatch-status-icon-ink" />
      <stop offset="0.5" className="dispatch-status-icon-ink-mid" />
      <stop offset="1" className="dispatch-status-icon-ink-end" />
    </>
  );
}

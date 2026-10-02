import type { EmailStatus } from '@dispatch/db';
import { InkStops, StatusTile } from '../status-tile';
import { emailStatusTone } from './email-status';

// the envelope is drawn for the tile rather than taken from the sidebar, per logo/icons/dispatch-email-sent.svg
export function EmailStatusIcon({ status }: { status: EmailStatus }) {
  return (
    <StatusTile tone={emailStatusTone(status)}>
      {(id) => (
        <>
          <defs>
            <linearGradient
              id={`${id}-body`}
              x1="298.5"
              y1="180"
              x2="298.5"
              y2="417"
              gradientUnits="userSpaceOnUse"
            >
              <InkStops />
            </linearGradient>
            <linearGradient
              id={`${id}-flap`}
              x1="298.5"
              y1="202"
              x2="298.5"
              y2="287"
              gradientUnits="userSpaceOnUse"
            >
              <InkStops />
            </linearGradient>
          </defs>
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
        </>
      )}
    </StatusTile>
  );
}

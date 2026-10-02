import { Fragment, type ReactNode, useId } from 'react';
import type { StatusTone } from './status-tone';

// the source draws five lines a side at 5 units, which vanish at 32px, so this keeps three at quarters and widens them to about a pixel
const GRID_LINES = [171.25, 298.5, 425.75];

// a sidebar glyph's 24-unit drawing area scaled to sit where the envelope does in the 598-unit tile
const GLYPH_SCALE = 10.5;

// the envelope's stroke in tile units, so every glyph draws at the same weight
const INK_WIDTH = 30;

// the pill or label beside it names the state, so this repeats its tone and is hidden from a screen reader
export function StatusTile({
  tone,
  children,
}: {
  tone: StatusTone;
  children: (id: string) => ReactNode;
}) {
  // every row draws its own gradients, so their ids cannot collide across the table
  const id = useId();

  return (
    <svg
      viewBox="0 0 598 598"
      fill="none"
      className={`dispatch-status-icon-${tone} size-8 shrink-0`}
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
        <radialGradient
          id={`${id}-fade`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(298.5 298.5) rotate(90) scale(254.5)"
        >
          {/* faint behind the glyph, full in the band around it, gone by the tile's edge */}
          <stop offset="0.35" stopOpacity="0.15" />
          <stop offset="0.65" stopOpacity="1" />
          <stop offset="0.85" stopOpacity="1" />
          <stop offset="1" stopOpacity="0" />
        </radialGradient>
        {/* an alpha mask reads only opacity, so the fade needs no colour of its own */}
        <mask id={`${id}-grid`} style={{ maskType: 'alpha' }}>
          <rect x="44" y="44" width="509" height="509" fill={`url(#${id}-fade)`} />
        </mask>
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
      <g mask={`url(#${id}-grid)`} strokeWidth="19" className="dispatch-status-icon-grid">
        {GRID_LINES.map((position) => (
          <Fragment key={position}>
            <line x1={position} y1="44" x2={position} y2="553" />
            <line x1="44" y1={position} x2="553" y2={position} />
          </Fragment>
        ))}
      </g>
      <rect
        x="44"
        y="44"
        width="509"
        height="509"
        rx="147"
        fill={`url(#${id}-shade)`}
        fillOpacity="0.55"
      />
      {children(id)}
    </svg>
  );
}

export function InkStops() {
  return (
    <>
      <stop className="dispatch-status-icon-ink" />
      <stop offset="0.5" className="dispatch-status-icon-ink-mid" />
      <stop offset="1" className="dispatch-status-icon-ink-end" />
    </>
  );
}

// draws a 32-unit sidebar glyph inside the tile, at the envelope's line weight, so the nav and the table read as one set
export function TileGlyph({ id, children }: { id: string; children: ReactNode }) {
  return (
    <>
      <defs>
        {/* in the glyph's own units, because a bounding-box gradient has no height to span on a horizontal line */}
        <linearGradient
          id={`${id}-ink`}
          x1="16"
          y1="4"
          x2="16"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <InkStops />
        </linearGradient>
      </defs>
      <g
        transform={`translate(298.5 298.5) scale(${GLYPH_SCALE}) translate(-16 -16)`}
        stroke={`url(#${id}-ink)`}
        strokeWidth={INK_WIDTH / GLYPH_SCALE}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </g>
    </>
  );
}

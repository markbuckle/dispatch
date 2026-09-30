'use client';

import { type PointerEvent, useId, useState } from 'react';
import { Wordmark, WordmarkShapes, wordmarkViewBox } from './logo';

// In drawing units, not px: an SVG filter cannot read a CSS token, so these live here beside the markup
const innerGlowWidth = 26;
const innerGlowBlur = 15;
const hotspotWidth = 6;
const hotspotBlur = 5;

// The spotlight follows the cursor through a style property, so a mouse move never re-renders
function moveSpotlight(event: PointerEvent<HTMLDivElement>) {
  const bounds = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--spotlight-x', `${event.clientX - bounds.left}px`);
  event.currentTarget.style.setProperty('--spotlight-y', `${event.clientY - bounds.top}px`);
}

export function FooterWordmark() {
  const [isLit, setIsLit] = useState(false);
  const insideLettersId = useId();
  const innerGlowBlurId = useId();
  const hotspotBlurId = useId();

  return (
    <div aria-hidden="true" className="px-5 pt-24 lg:px-8">
      {/* 244 of the drawing's 323 units, so the footer rule cuts through the lowercase letters */}
      <div
        className="relative aspect-1513/244 overflow-hidden"
        onPointerEnter={(event) => {
          // a tap has no hover to follow, so touch leaves the wordmark flat
          if (event.pointerType !== 'mouse') return;
          moveSpotlight(event);
          setIsLit(true);
        }}
        onPointerMove={(event) => {
          if (event.pointerType === 'mouse') moveSpotlight(event);
        }}
        onPointerLeave={() => setIsLit(false)}
      >
        <Wordmark className="w-full text-subtle" />
        <div
          className={`dispatch-transition-spotlight pointer-events-none absolute inset-0 ${
            isLit ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <svg
            aria-hidden="true"
            viewBox={wordmarkViewBox}
            className="dispatch-spotlight absolute inset-x-0 top-0 h-auto w-full"
          >
            <defs>
              <clipPath id={insideLettersId}>
                <WordmarkShapes />
              </clipPath>
              <filter id={innerGlowBlurId}>
                <feGaussianBlur stdDeviation={innerGlowBlur} />
              </filter>
              <filter id={hotspotBlurId}>
                <feGaussianBlur stdDeviation={hotspotBlur} />
              </filter>
            </defs>
            {/* blurred first, then clipped, so the band only lights the inside of each edge */}
            <g clipPath={`url(#${insideLettersId})`}>
              <g
                className="dispatch-spotlight-inner"
                filter={`url(#${innerGlowBlurId})`}
                strokeWidth={innerGlowWidth}
              >
                <WordmarkShapes />
              </g>
            </g>
            <g className="dispatch-spotlight-edge">
              <WordmarkShapes />
            </g>
          </svg>
          {/* its own svg, because a mask on a group inside one is unreliable in Safari */}
          <svg
            aria-hidden="true"
            viewBox={wordmarkViewBox}
            className="dispatch-spotlight-hotspot absolute inset-x-0 top-0 h-auto w-full"
          >
            {/* clipped like the inner glow, so the light never spills outside a letter */}
            <g clipPath={`url(#${insideLettersId})`}>
              <g filter={`url(#${hotspotBlurId})`} strokeWidth={hotspotWidth}>
                <WordmarkShapes />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useThree } from '@react-three/fiber';
import { type RefObject, useEffect } from 'react';
import type { LoopClock } from './hero-scene';
import { LOOP_SECONDS } from './timeline';

declare global {
  interface Window {
    renderHeroFrame?: (time: number) => Promise<void>;
    heroLoopSeconds?: number;
  }
}

// Renders exactly the moment asked for, so a capture never depends on how fast the machine happens to draw
export function CaptureDriver({ clock }: { clock: RefObject<LoopClock> }) {
  const advance = useThree((state) => state.advance);

  useEffect(() => {
    window.heroLoopSeconds = LOOP_SECONDS;
    window.renderHeroFrame = async (time: number) => {
      clock.current.time = time;
      clock.current.isPlaying = false;
      advance(performance.now());
      // the caller reads the canvas next, so wait until the browser has presented this frame
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    };
    return () => {
      window.renderHeroFrame = undefined;
      window.heroLoopSeconds = undefined;
    };
  }, [advance, clock]);

  return null;
}

'use client';

import { useRef } from 'react';
import { HeroScene, type LoopClock } from '../../hero-scene/hero-scene';

// The render script sets the size, so the video's pixel dimensions live in one place
export function CaptureStage({ size }: { size: number }) {
  const clock = useRef<LoopClock>({ time: 0, isPlaying: false });
  return (
    <div style={{ width: size, height: size }}>
      <HeroScene clock={clock} isCapture />
    </div>
  );
}

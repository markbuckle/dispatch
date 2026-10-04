'use client';

import { type ChangeEvent, useCallback, useRef, useState } from 'react';
import { smallButton } from '../../dashboard/button-styles';
import { HeroScene, type LoopClock } from '../../hero-scene/hero-scene';
import { LOOP_SECONDS } from '../../hero-scene/timeline';

export function LoopPreview() {
  const clock = useRef<LoopClock>({ time: 0, isPlaying: true });
  const [isPlaying, setIsPlaying] = useState(true);
  const slider = useRef<HTMLInputElement>(null);
  const readout = useRef<HTMLSpanElement>(null);

  // written straight to the DOM every frame, because a state update 60 times a second would re-render the page with it
  const showTime = useCallback((time: number) => {
    if (slider.current) slider.current.value = String(time);
    if (readout.current) readout.current.textContent = `${time.toFixed(2)}s`;
  }, []);

  function togglePlaying() {
    clock.current.isPlaying = !clock.current.isPlaying;
    setIsPlaying(clock.current.isPlaying);
  }

  function scrub(event: ChangeEvent<HTMLInputElement>) {
    clock.current.time = Number(event.target.value);
    clock.current.isPlaying = false;
    setIsPlaying(false);
  }

  return (
    <main className="flex h-screen flex-col bg-canvas">
      <div className="flex items-center gap-4 border-border-subtle border-b px-5 py-3">
        <button type="button" onClick={togglePlaying} className={`${smallButton} w-20`}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <input
          ref={slider}
          type="range"
          min={0}
          max={LOOP_SECONDS}
          step={0.01}
          defaultValue={0}
          onChange={scrub}
          aria-label="Loop time"
          className="flex-1 accent-text-primary"
        />
        <span
          ref={readout}
          className="w-16 text-right font-mono text-mono text-text-secondary tabular-nums"
        >
          0.00s
        </span>
      </div>
      <div className="flex-1">
        <HeroScene clock={clock} onTick={showTime} />
      </div>
    </main>
  );
}

'use client';

import { useControls } from 'leva';
import { type ChangeEvent, useCallback, useRef, useState } from 'react';
import { smallButton } from '../../dashboard/button-styles';
import { HeroScene, type LoopClock } from '../../hero-scene/hero-scene';
import { DEFAULT_PAPER } from '../../hero-scene/paper-material';
import { LOOP_SECONDS } from '../../hero-scene/timeline';

// The intensity the paper defaults were picked under, so the preview opens on the look they were tuned for
const DEFAULT_STUDIO_INTENSITY = 0.15;

export function LoopPreview() {
  const clock = useRef<LoopClock>({ time: 0, isPlaying: true });
  const [isPlaying, setIsPlaying] = useState(true);
  const slider = useRef<HTMLInputElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const [textureMilliseconds, setTextureMilliseconds] = useState<number>();

  // leva lives only in this dev route, so the shipped scene takes plain props and never imports it
  const paper = useControls('Paper', {
    roughness: { value: DEFAULT_PAPER.roughness, min: 0, max: 1, step: 0.01 },
    sheen: { value: DEFAULT_PAPER.sheen, min: 0, max: 1, step: 0.01 },
    sheenRoughness: { value: DEFAULT_PAPER.sheenRoughness, min: 0, max: 1, step: 0.01 },
    normalStrength: { value: DEFAULT_PAPER.normalStrength, min: 0, max: 1, step: 0.01 },
    edgeLift: { value: DEFAULT_PAPER.edgeLift, min: 0, max: 1, step: 0.01 },
    patternContrast: { value: DEFAULT_PAPER.patternContrast, min: 0, max: 1, step: 0.01 },
    patternPitch: { value: DEFAULT_PAPER.patternPitch, min: 0.1, max: 0.8, step: 0.01 },
  });
  const studio = useControls('Studio light', {
    enabled: true,
    intensity: { value: DEFAULT_STUDIO_INTENSITY, min: 0, max: 2, step: 0.05 },
  });

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
        <span className="w-32 font-mono text-mono text-text-muted tabular-nums">
          {textureMilliseconds === undefined ? '' : `textures ${textureMilliseconds.toFixed(1)}ms`}
        </span>
      </div>
      <div className="flex-1">
        <HeroScene
          clock={clock}
          onTick={showTime}
          paper={paper}
          studioIntensity={studio.enabled ? studio.intensity : undefined}
          onTexturesGenerated={setTextureMilliseconds}
        />
      </div>
    </main>
  );
}

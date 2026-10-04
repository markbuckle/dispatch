'use client';

import { useControls } from 'leva';
import { type ChangeEvent, useCallback, useRef, useState } from 'react';
import { smallButton } from '../../dashboard/button-styles';
import { DEFAULT_EFFECTS } from './effects';
import { HeroScene, type LoopClock } from './hero-scene';
import { DEFAULT_LIGHTING } from './lighting';
import { DEFAULT_PAPER } from './paper-material';
import { LOOP_SECONDS } from './timeline';

export function LoopPreview() {
  const clock = useRef<LoopClock>({ time: 0, isPlaying: true });
  const [isPlaying, setIsPlaying] = useState(true);
  const slider = useRef<HTMLInputElement>(null);
  const readout = useRef<HTMLSpanElement>(null);

  // leva lives only in this dev route, so the shipped scene takes plain props and never imports it
  const paper = useControls('Paper', {
    roughness: { value: DEFAULT_PAPER.roughness, min: 0, max: 1, step: 0.01 },
    sheen: { value: DEFAULT_PAPER.sheen, min: 0, max: 1, step: 0.01 },
    sheenRoughness: { value: DEFAULT_PAPER.sheenRoughness, min: 0.3, max: 1, step: 0.01 },
    normalStrength: { value: DEFAULT_PAPER.normalStrength, min: 0, max: 1, step: 0.01 },
    specularAntialiasing: {
      value: DEFAULT_PAPER.specularAntialiasing,
      min: 0,
      max: 1,
      step: 0.01,
    },
    contactShading: { value: DEFAULT_PAPER.contactShading, min: 0, max: 1, step: 0.01 },
    borderRoughness: { value: DEFAULT_PAPER.borderRoughness, min: 0.05, max: 1, step: 0.01 },
    frameShade: { value: DEFAULT_PAPER.frameShade, min: 0, max: 1, step: 0.01 },
    grooveShade: { value: DEFAULT_PAPER.grooveShade, min: 0, max: 1, step: 0.01 },
  });
  const lighting = useControls('Lights', {
    key: { value: DEFAULT_LIGHTING.key, min: 0, max: 5, step: 0.05 },
    rimFill: { value: DEFAULT_LIGHTING.rimFill, min: 0, max: 5, step: 0.05 },
    environment: { value: DEFAULT_LIGHTING.environment, min: 0, max: 3, step: 0.05 },
  });
  const bloom = useControls('Bloom', {
    bloomThreshold: { value: DEFAULT_EFFECTS.bloomThreshold, min: 0, max: 2, step: 0.01 },
    bloomSmoothing: { value: DEFAULT_EFFECTS.bloomSmoothing, min: 0, max: 1, step: 0.01 },
    bloomIntensity: { value: DEFAULT_EFFECTS.bloomIntensity, min: 0, max: 3, step: 0.01 },
    bloomRadius: { value: DEFAULT_EFFECTS.bloomRadius, min: 0, max: 1, step: 0.01 },
  });
  const output = useControls('Output', {
    exposure: { value: DEFAULT_EFFECTS.exposure, min: 0.3, max: 2, step: 0.01 },
    multisampling: DEFAULT_EFFECTS.multisampling,
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
      </div>
      <div className="flex-1">
        <HeroScene
          clock={clock}
          onTick={showTime}
          paper={paper}
          lighting={lighting}
          effects={{ ...bloom, exposure: output.exposure, multisampling: output.multisampling }}
        />
      </div>
    </main>
  );
}

'use client';

import { useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useEffect } from 'react';
import { HalfFloatType } from 'three';

export type EffectSettings = {
  exposure: number;
  bloomThreshold: number;
  bloomSmoothing: number;
  bloomIntensity: number;
  bloomRadius: number;
  multisampling: boolean;
};

export const DEFAULT_EFFECTS: EffectSettings = {
  exposure: 1.15,
  bloomThreshold: 0.32,
  bloomSmoothing: 0.16,
  bloomIntensity: 1.33,
  bloomRadius: 0.49,
  multisampling: true,
};

// The composer's buffers lose the canvas's own antialiasing, so the bevels need it back from multisampling
const MULTISAMPLES = 4;
// Bloom is a soft blur, so half resolution looks the same and costs a quarter
const BLOOM_RESOLUTION = 0.5;

// Tone mapping reads the renderer's exposure, which is also what the fog colour is solved against
function Exposure({ exposure }: { exposure: number }) {
  const renderer = useThree((state) => state.gl);
  useEffect(() => {
    renderer.toneMappingExposure = exposure;
  }, [renderer, exposure]);
  return null;
}

// Bloom runs on the half-float scene before tone mapping, so it only finds highlights genuinely brighter than white
export function SceneEffects({ settings }: { settings: EffectSettings }) {
  return (
    <>
      <Exposure exposure={settings.exposure} />
      <EffectComposer
        multisampling={settings.multisampling ? MULTISAMPLES : 0}
        frameBufferType={HalfFloatType}
      >
        <Bloom
          mipmapBlur
          luminanceThreshold={settings.bloomThreshold}
          luminanceSmoothing={settings.bloomSmoothing}
          intensity={settings.bloomIntensity}
          radius={settings.bloomRadius}
          resolutionScale={BLOOM_RESOLUTION}
        />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      </EffectComposer>
    </>
  );
}

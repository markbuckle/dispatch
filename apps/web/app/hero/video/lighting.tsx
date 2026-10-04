'use client';

import type { Color } from 'three';
import { PanelEnvironment } from './panel-environment';

export type LightingSettings = {
  key: number;
  rim: number;
  rimFill: number;
  environment: number;
};

export const DEFAULT_LIGHTING: LightingSettings = {
  key: 2.1,
  rim: 0,
  rimFill: 0.25,
  environment: 1.9,
};

// Low-key, as on the Resend cube: a dim key from the upper left for the faces, and light from behind for every edge
export function SceneLighting({
  settings,
  lightColor,
}: {
  settings: LightingSettings;
  lightColor: Color;
}) {
  return (
    <>
      <directionalLight position={[-6, 8, 6]} intensity={settings.key} color={lightColor} />
      <directionalLight position={[5, 4, -8]} intensity={settings.rim} color={lightColor} />
      <directionalLight position={[-6, -2, -6]} intensity={settings.rimFill} color={lightColor} />
      <PanelEnvironment lightColor={lightColor} intensity={settings.environment} />
    </>
  );
}

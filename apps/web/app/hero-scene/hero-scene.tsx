'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { type RefObject, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Color, type Group, type Mesh, SRGBColorSpace } from 'three';
import { DEFAULT_EFFECTS, type EffectSettings, SceneEffects } from './effects';
import { setFolds } from './fold-material';
import { FrameTimer, type FrameTimingSource } from './frame-timer';
import { DEFAULT_LIGHTING, type LightingSettings, SceneLighting } from './lighting';
import {
  applyPaperSettings,
  createPaperMaterial,
  DEFAULT_PAPER,
  type PaperColors,
  type PaperSettings,
} from './paper-material';
import { createPaperTextures } from './paper-textures';
import { createSheetGeometry } from './sheet-geometry';
import { CAMERA_FOV, CAMERA_POSITION, FOG_FAR, FOG_NEAR } from './stage';
import { LOOP_SECONDS, sampleTimeline } from './timeline';
import { inverseNeutralToneMap } from './tone-mapping';

export type LoopClock = { time: number; isPlaying: boolean };

// Read at runtime so the scene never carries its own copy of a token
const PAPER_TOKENS = {
  paper: '--dispatch-paper',
  inside: '--dispatch-paper-inside',
  edge: '--dispatch-paper-edge',
  sheen: '--dispatch-paper-sheen',
  border: '--dispatch-paper-border',
} as const;
const BACKGROUND_TOKEN = '--dispatch-canvas';
const LIGHT_TOKEN = '--dispatch-text-primary';

// Tokens are written in sRGB and three lights in linear, so a token used as-is would render a shade off
function readTokenColor(name: string): Color {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color().setStyle(value, SRGBColorSpace);
}

type SheetProps = {
  colors: PaperColors;
  paper: PaperSettings;
  clock: RefObject<LoopClock>;
  onTick?: (time: number) => void;
  onTexturesGenerated?: (milliseconds: number) => void;
};

function Sheet({ colors, paper, clock, onTick, onTexturesGenerated }: SheetProps) {
  const renderer = useThree((state) => state.gl);
  const geometry = useMemo(() => createSheetGeometry(), []);
  const textures = useMemo(
    () => createPaperTextures(renderer.capabilities.getMaxAnisotropy()),
    [renderer],
  );
  // built once with the defaults; live settings are applied below, so a slider never recompiles the shader
  const { material, foldUniforms, paperUniforms } = useMemo(
    () => createPaperMaterial(colors, textures, DEFAULT_PAPER),
    [colors, textures],
  );
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);

  useLayoutEffect(() => {
    applyPaperSettings(material, paperUniforms, paper);
  }, [material, paperUniforms, paper]);

  useEffect(() => {
    onTexturesGenerated?.(textures.generationMilliseconds);
  }, [textures, onTexturesGenerated]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(
    () => () => {
      textures.fibre.dispose();
      textures.pattern.dispose();
    },
    [textures],
  );

  useFrame((_, delta) => {
    const loop = clock.current;
    if (loop.isPlaying) loop.time = (loop.time + delta) % LOOP_SECONDS;

    const state = sampleTimeline(loop.time);
    setFolds(foldUniforms, state.folds);
    group.current?.position.set(...state.position);
    group.current?.quaternion.set(...state.quaternion);

    // the mesh is shifted so the timeline's pivot sits on the group's origin, which is the point the group turns about
    const [x, y, z] = state.pivot;
    mesh.current?.position.set(-x, -y, -z);

    onTick?.(loop.time);
  });

  // the flat geometry's bounds say nothing about where the shader folds it to, so culling by them would drop the plane
  return (
    <group ref={group}>
      <mesh ref={mesh} geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

// Canvas pixels beyond this buy little on a soft, dark object and cost every postprocessing pass
const MAX_PIXEL_RATIO = 1.5;
// Alpha stays available for the transparent comparison; the composer multisamples its own buffers, so canvas antialiasing would only cost memory
const CANVAS_OPTIONS = { alpha: true, antialias: false };

type HeroSceneProps = {
  clock?: RefObject<LoopClock>;
  onTick?: (time: number) => void;
  paper?: PaperSettings;
  lighting?: LightingSettings;
  effects?: EffectSettings;
  // opaque by default: on a transparent canvas bloom blurs alpha too and darkens a ring of page around the plane
  isOpaque?: boolean;
  onTexturesGenerated?: (milliseconds: number) => void;
  onFrameTiming?: (milliseconds: number, source: FrameTimingSource) => void;
};

export function HeroScene({
  clock,
  onTick,
  paper = DEFAULT_PAPER,
  lighting = DEFAULT_LIGHTING,
  effects = DEFAULT_EFFECTS,
  isOpaque = true,
  onTexturesGenerated,
  onFrameTiming,
}: HeroSceneProps) {
  const ownClock = useRef<LoopClock>({ time: 0, isPlaying: true });
  // the server has no stylesheet to read, so the scene waits for the first client render
  const [colors, setColors] = useState<{ paper: PaperColors; page: Color; light: Color }>();

  useEffect(() => {
    setColors({
      paper: {
        paper: readTokenColor(PAPER_TOKENS.paper),
        inside: readTokenColor(PAPER_TOKENS.inside),
        edge: readTokenColor(PAPER_TOKENS.edge),
        sheen: readTokenColor(PAPER_TOKENS.sheen),
        border: readTokenColor(PAPER_TOKENS.border),
      },
      page: readTokenColor(BACKGROUND_TOKEN),
      light: readTokenColor(LIGHT_TOKEN),
    });
  }, []);

  // tone mapping runs after the fog, so the fog has to be the colour that tone maps back onto the page, not the page itself
  const fogColor = useMemo(() => {
    if (!colors) return undefined;
    const [r, g, b] = inverseNeutralToneMap(
      [colors.page.r, colors.page.g, colors.page.b],
      effects.exposure,
    );
    return new Color(r, g, b);
  }, [colors, effects.exposure]);

  return (
    // flat leaves the renderer untoned, because the effect chain tone maps once at the end
    <Canvas
      flat
      camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV }}
      dpr={[1, MAX_PIXEL_RATIO]}
      gl={CANVAS_OPTIONS}
    >
      {colors && fogColor && (
        <>
          <fog attach="fog" args={[fogColor, FOG_NEAR, FOG_FAR]} />
          {isOpaque && <color attach="background" args={[fogColor]} />}
          <SceneLighting settings={lighting} lightColor={colors.light} />
          <Sheet
            colors={colors.paper}
            paper={paper}
            clock={clock ?? ownClock}
            onTick={onTick}
            onTexturesGenerated={onTexturesGenerated}
          />
          <SceneEffects settings={effects} />
          {onFrameTiming && <FrameTimer onTiming={onFrameTiming} />}
        </>
      )}
    </Canvas>
  );
}

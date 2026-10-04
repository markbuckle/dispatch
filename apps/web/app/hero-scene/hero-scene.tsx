'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { type RefObject, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Color, type Group, type Mesh, SRGBColorSpace } from 'three';
import { setFolds } from './fold-material';
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
import { StudioEnvironment } from './studio-environment';
import { LOOP_SECONDS, sampleTimeline } from './timeline';

export type LoopClock = { time: number; isPlaying: boolean };

// Read at runtime so the scene never carries its own copy of a token
const PAPER_TOKENS = {
  paper: '--dispatch-paper',
  inside: '--dispatch-paper-inside',
  edge: '--dispatch-paper-edge',
  sheen: '--dispatch-paper-sheen',
} as const;
const BACKGROUND_TOKEN = '--dispatch-canvas';

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

type HeroSceneProps = {
  clock?: RefObject<LoopClock>;
  onTick?: (time: number) => void;
  paper?: PaperSettings;
  // set, the studio replaces the placeholder lights rather than adding to them, so materials are judged under one rig
  studioIntensity?: number;
  onTexturesGenerated?: (milliseconds: number) => void;
};

export function HeroScene({
  clock,
  onTick,
  paper = DEFAULT_PAPER,
  studioIntensity,
  onTexturesGenerated,
}: HeroSceneProps) {
  const ownClock = useRef<LoopClock>({ time: 0, isPlaying: true });
  // the server has no stylesheet to read, so the scene waits for the first client render
  const [colors, setColors] = useState<{ paper: PaperColors; background: Color }>();

  useEffect(() => {
    setColors({
      paper: {
        paper: readTokenColor(PAPER_TOKENS.paper),
        inside: readTokenColor(PAPER_TOKENS.inside),
        edge: readTokenColor(PAPER_TOKENS.edge),
        sheen: readTokenColor(PAPER_TOKENS.sheen),
      },
      background: readTokenColor(BACKGROUND_TOKEN),
    });
  }, []);

  return (
    // flat turns tone mapping off, which would otherwise shift the fog's far colour away from the page and leave an outline
    <Canvas
      flat
      camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
    >
      {colors && (
        <>
          <fog attach="fog" args={[colors.background, FOG_NEAR, FOG_FAR]} />
          {studioIntensity === undefined ? (
            <>
              <ambientLight intensity={0.9} />
              <directionalLight position={[-3, 5, 9]} intensity={2.4} />
            </>
          ) : (
            <StudioEnvironment intensity={studioIntensity} />
          )}
          <Sheet
            colors={colors.paper}
            paper={paper}
            clock={clock ?? ownClock}
            onTick={onTick}
            onTexturesGenerated={onTexturesGenerated}
          />
        </>
      )}
    </Canvas>
  );
}

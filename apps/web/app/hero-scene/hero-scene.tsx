'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { Color, type Group, type Mesh, SRGBColorSpace } from 'three';
import { createFoldMaterial, setFolds } from './fold-material';
import { createSheetGeometry } from './sheet-geometry';
import { CAMERA_FOV, CAMERA_POSITION, FOG_FAR, FOG_NEAR } from './stage';
import { LOOP_SECONDS, sampleTimeline } from './timeline';

export type LoopClock = { time: number; isPlaying: boolean };

// Stand-in until the real material lands; both are read at runtime so the scene never carries its own copy of a token
const SHEET_TOKEN = '--dispatch-border-strong';
const BACKGROUND_TOKEN = '--dispatch-canvas';

// Tokens are written in sRGB and three lights in linear, so a token used as-is would render a shade off
function readTokenColor(name: string): Color {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color().setStyle(value, SRGBColorSpace);
}

type SheetProps = {
  color: Color;
  clock: RefObject<LoopClock>;
  onTick?: (time: number) => void;
};

function Sheet({ color, clock, onTick }: SheetProps) {
  const geometry = useMemo(() => createSheetGeometry(), []);
  const { material, uniforms } = useMemo(() => createFoldMaterial(color), [color]);
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    const loop = clock.current;
    if (loop.isPlaying) loop.time = (loop.time + delta) % LOOP_SECONDS;

    const state = sampleTimeline(loop.time);
    setFolds(uniforms, state.folds);
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
};

export function HeroScene({ clock, onTick }: HeroSceneProps) {
  const ownClock = useRef<LoopClock>({ time: 0, isPlaying: true });
  // the server has no stylesheet to read, so the scene waits for the first client render
  const [colors, setColors] = useState<{ sheet: Color; background: Color }>();

  useEffect(() => {
    setColors({ sheet: readTokenColor(SHEET_TOKEN), background: readTokenColor(BACKGROUND_TOKEN) });
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
          <ambientLight intensity={0.9} />
          <directionalLight position={[-3, 5, 9]} intensity={2.4} />
          <Sheet color={colors.sheet} clock={clock ?? ownClock} onTick={onTick} />
        </>
      )}
    </Canvas>
  );
}

'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Softens the reflections three builds from the room, which is all this needs to be: a neutral studio, not a scene
const ROOM_BLUR = 0.04;

// A procedural studio three ships with, for judging materials with no HDR to download; preview only until step 4 decides
export function StudioEnvironment({ intensity }: { intensity: number }) {
  const renderer = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const generator = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const target = generator.fromScene(room, ROOM_BLUR);
    scene.environment = target.texture;

    return () => {
      scene.environment = null;
      target.dispose();
      room.dispose();
      generator.dispose();
    };
  }, [renderer, scene]);

  useEffect(() => {
    scene.environmentIntensity = intensity;
  }, [scene, intensity]);

  return null;
}

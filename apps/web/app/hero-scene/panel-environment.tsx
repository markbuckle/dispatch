'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import {
  type Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  type Vector3Tuple,
} from 'three';

// Enough that a face toward the camera sits just above the page colour once the tone curve's toe has crushed the darks
const FRONT_FILL_BRIGHTNESS = 1;

type Panel = { position: Vector3Tuple; width: number; height: number; brightness: number };

// A soft box for the faces, two strips behind for the rims and a faint floor; on a black void only what turns toward a panel lights
const panels: Panel[] = [
  { position: [-6, 7, 6], width: 5, height: 3, brightness: 3 },
  { position: [6, 3, -7], width: 0.8, height: 8, brightness: 8 },
  { position: [-7, -1, -6], width: 0.8, height: 6, brightness: 4 },
  { position: [0, -8, 0], width: 12, height: 12, brightness: 0.1 },
  // a broad, dim card behind the camera, which faces turned toward the viewer reflect as a soft satin lift off pure black
  { position: [0, 2, 12], width: 16, height: 10, brightness: FRONT_FILL_BRIGHTNESS },
];

// Softens the reflections just enough that a strip reads as a light, not a hard-edged rectangle
const PANEL_BLUR = 0.02;

function panelScene(lightColor: Color): Scene {
  const scene = new Scene();
  for (const { position, width, height, brightness } of panels) {
    const panel = new Mesh(
      new PlaneGeometry(width, height),
      // above 1 on purpose: the reflection map is HDR, so a panel can be brighter than white
      new MeshBasicMaterial({
        color: lightColor.clone().multiplyScalar(brightness),
        side: DoubleSide,
      }),
    );
    panel.position.set(...position);
    panel.lookAt(0, 0, 0);
    scene.add(panel);
  }
  return scene;
}

// Built once into a reflection map, so the panels cost one render at mount and nothing per frame
export function PanelEnvironment({
  lightColor,
  intensity,
}: {
  lightColor: Color;
  intensity: number;
}) {
  const renderer = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const generator = new PMREMGenerator(renderer);
    const panels = panelScene(lightColor);
    const target = generator.fromScene(panels, PANEL_BLUR);
    scene.environment = target.texture;

    return () => {
      scene.environment = null;
      target.dispose();
      generator.dispose();
      panels.traverse((object) => {
        if (object instanceof Mesh) {
          object.geometry.dispose();
          if (object.material instanceof MeshBasicMaterial) object.material.dispose();
        }
      });
    };
  }, [renderer, scene, lightColor]);

  useEffect(() => {
    scene.environmentIntensity = intensity;
  }, [scene, intensity]);

  return null;
}

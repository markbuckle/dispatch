import { Quaternion, Vector3, type Vector3Tuple } from 'three';
import { describe, expect, it } from 'vitest';
import { type Folds, foldPoint } from './folds';
import {
  ENVELOPE_FACE_ON,
  ENVELOPE_FOLDS,
  ENVELOPE_PIVOT,
  PLANE_FOLDS,
  PLANE_PIVOT,
  PLANE_TOP_QUATERNION,
} from './poses';
import { outlineSamples } from './sheet-geometry';
import { CAMERA_FOV, CAMERA_POSITION, FOG_FAR } from './stage';
import {
  FLAP_START,
  FOLD_END,
  LOOP_SECONDS,
  OPEN_END,
  RETURN_END,
  RETURN_START,
  type SceneState,
  sampleTimeline,
  TAKE_OFF,
  TOP_TURN_END,
  UNTURN_START,
} from './timeline';

const STEP = 0.001;

function largestDifference(a: readonly number[], b: readonly number[]): number {
  return Math.max(...a.map((value, index) => Math.abs(value - (b[index] ?? Number.NaN))));
}

function foldValues(folds: Folds): number[] {
  return [folds.flap, folds.keel, folds.wing];
}

function distance(a: Vector3Tuple, b: Vector3Tuple): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

// q and -q are the same rotation, so this compares the turn between two frames rather than their raw components
function rotationBetween(a: readonly number[], b: readonly number[]): number {
  const dot = Math.abs(a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0));
  return 2 * Math.acos(Math.min(dot, 1));
}

// The folded outline's farthest reach from the point it turns about, which is what has to fit in frame
function reach(state: SceneState): number {
  return Math.max(
    ...outlineSamples.map((point) => distance(foldPoint(point, state.folds), state.pivot)),
  );
}

function isHidden(state: SceneState): boolean {
  return distance(state.position, CAMERA_POSITION) - reach(state) > FOG_FAR;
}

function expectPose(
  state: SceneState,
  folds: Folds,
  quaternion: Quaternion,
  pivot: Vector3Tuple,
): void {
  expect(largestDifference(foldValues(state.folds), foldValues(folds))).toBeLessThan(1e-9);
  expect(rotationBetween(state.quaternion, quaternion.toArray())).toBeLessThan(1e-6);
  expect(distance(state.position, [0, 0, 0])).toBeLessThan(1e-9);
  expect(distance(state.pivot, pivot)).toBeLessThan(1e-9);
}

describe('hero timeline', () => {
  it('ends on exactly the frame it starts on', () => {
    const first = sampleTimeline(0);
    const last = sampleTimeline(LOOP_SECONDS);

    expect(largestDifference(foldValues(last.folds), foldValues(first.folds))).toBeLessThan(1e-9);
    expect(rotationBetween(last.quaternion, first.quaternion)).toBeLessThan(1e-6);
    expect(distance(last.position, first.position)).toBeLessThan(1e-9);
    expect(distance(last.pivot, first.pivot)).toBeLessThan(1e-9);
  });

  // Asserted once per measure at the end, because an assertion every millisecond of the loop outlasts the test's time limit
  it('never jumps between frames a millisecond apart, except at the cut it makes while hidden', () => {
    const worst = { position: 0, pivot: 0, folds: 0, rotation: 0 };
    let isCutHidden = true;
    let previous = sampleTimeline(0);
    for (let time = STEP; time <= LOOP_SECONDS; time += STEP) {
      const current = sampleTimeline(time);

      if (time - STEP < RETURN_START && time >= RETURN_START) {
        isCutHidden = isCutHidden && isHidden(previous) && isHidden(current);
      } else {
        worst.position = Math.max(worst.position, distance(current.position, previous.position));
        worst.pivot = Math.max(worst.pivot, distance(current.pivot, previous.pivot));
        worst.folds = Math.max(
          worst.folds,
          largestDifference(foldValues(current.folds), foldValues(previous.folds)),
        );
        worst.rotation = Math.max(
          worst.rotation,
          rotationBetween(current.quaternion, previous.quaternion),
        );
      }

      previous = current;
    }

    expect(isCutHidden).toBe(true);
    // the fastest moment is the end of the take-off, at about 0.08 units a millisecond
    expect(worst.position).toBeLessThan(0.12);
    expect(worst.pivot).toBeLessThan(0.01);
    expect(worst.folds).toBeLessThan(0.02);
    expect(worst.rotation).toBeLessThan(0.03);
  });

  // Faster than this, a turn reads as a snap rather than a paper plane changing its mind
  it('never turns faster than 150 degrees a second', () => {
    const limit = (150 * Math.PI) / 180;
    let worst = { speed: 0, where: 'nowhere' };
    let previous = sampleTimeline(0);
    for (let time = STEP; time <= LOOP_SECONDS; time += STEP) {
      const current = sampleTimeline(time);
      const isCut = time - STEP < RETURN_START && time >= RETURN_START;
      if (!isCut) {
        const speed = rotationBetween(current.quaternion, previous.quaternion) / STEP;
        if (speed > worst.speed) worst = { speed, where: `at ${time.toFixed(3)}s` };
      }
      previous = current;
    }
    expect(worst.speed, worst.where).toBeLessThan(limit);
  });

  // A loop that ends partway through a frame repeats or drops that frame at every pass, which shows as a stutter at the seam
  it('lasts a whole number of frames at 30 and 60 frames a second', () => {
    for (const framesPerSecond of [30, 60]) {
      const frames = LOOP_SECONDS * framesPerSecond;
      expect(Math.abs(frames - Math.round(frames)), `at ${framesPerSecond}fps`).toBeLessThan(1e-9);
    }
  });

  it('starts and ends each phase on its exact pose', () => {
    expectPose(sampleTimeline(0), ENVELOPE_FOLDS, ENVELOPE_FACE_ON, ENVELOPE_PIVOT);
    // the turn is still finishing as the flap starts, so only the shape and the pivot are pinned here
    const flapStart = sampleTimeline(FLAP_START);
    expect(largestDifference(foldValues(flapStart.folds), foldValues(ENVELOPE_FOLDS))).toBeLessThan(
      1e-9,
    );
    expect(distance(flapStart.pivot, ENVELOPE_PIVOT)).toBeLessThan(1e-9);
    expect(sampleTimeline(OPEN_END).folds.flap).toBeLessThan(1e-9);
    expect(sampleTimeline(OPEN_END).folds.keel).toBeLessThan(1e-9);
    // the turn to the top view is already under way as the fold finishes, so only the shape and the pivot are pinned
    const foldEnd = sampleTimeline(FOLD_END);
    expect(largestDifference(foldValues(foldEnd.folds), foldValues(PLANE_FOLDS))).toBeLessThan(
      1e-9,
    );
    expect(distance(foldEnd.pivot, PLANE_PIVOT)).toBeLessThan(1e-9);
    expectPose(sampleTimeline(TOP_TURN_END), PLANE_FOLDS, PLANE_TOP_QUATERNION, PLANE_PIVOT);
    expectPose(sampleTimeline(TAKE_OFF), PLANE_FOLDS, PLANE_TOP_QUATERNION, PLANE_PIVOT);
    expectPose(sampleTimeline(RETURN_END), PLANE_FOLDS, PLANE_TOP_QUATERNION, PLANE_PIVOT);
    expectPose(sampleTimeline(UNTURN_START), PLANE_FOLDS, PLANE_TOP_QUATERNION, PLANE_PIVOT);
    expectPose(sampleTimeline(LOOP_SECONDS), ENVELOPE_FOLDS, ENVELOPE_FACE_ON, ENVELOPE_PIVOT);
  });

  // Flying into depth only avoids clipping if the plane fades out before reaching an edge, even in a square canvas
  it('keeps every visible frame inside a square canvas', () => {
    const halfAngle = Math.tan((CAMERA_FOV * Math.PI) / 360);
    const [cameraX, cameraY, cameraZ] = CAMERA_POSITION;
    const rotation = new Quaternion();
    const world = new Vector3();
    let worst = { use: 0, where: 'nowhere' };

    // one assertion at the end, because an assertion per point costs far more than the projection it checks
    for (let time = 0; time <= LOOP_SECONDS; time += 0.01) {
      const state = sampleTimeline(time);
      if (isHidden(state)) continue;

      rotation.set(...state.quaternion);
      for (const point of outlineSamples) {
        const [x, y, z] = foldPoint(point, state.folds);
        world
          .set(x - state.pivot[0], y - state.pivot[1], z - state.pivot[2])
          .applyQuaternion(rotation)
          .add({ x: state.position[0], y: state.position[1], z: state.position[2] });
        const halfFrame = (cameraZ - world.z) * halfAngle;
        const horizontal = Math.abs(world.x - cameraX) / halfFrame;
        const vertical = Math.abs(world.y - cameraY) / halfFrame;
        if (horizontal > worst.use) worst = { use: horizontal, where: `x at ${time.toFixed(2)}s` };
        if (vertical > worst.use) worst = { use: vertical, where: `y at ${time.toFixed(2)}s` };
      }
    }

    expect(worst.use, worst.where).toBeLessThan(1);
  });
});

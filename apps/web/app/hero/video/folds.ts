import type { Vector3Tuple } from 'three';
import {
  CREASE_BAND,
  FLAP_HINGE_Z,
  KEEL_HINGE_Z,
  WING_CREASE_AXIS_X,
  WING_CREASE_AXIS_Y,
  WING_CREASE_TOP_Y,
  WING_HINGE_Z,
} from './sheet-layout';

export type Folds = {
  // 0 stands open above the body, PI lies closed across its front
  flap: number;
  // each half's turn about the centre crease, PI / 2 stands both halves upright as the keel
  keel: number;
  // each wing's turn back out from the top of its keel face
  wing: number;
};

// 0 on the fixed side of a crease, 1 on the side that turns, and smooth between so the fold rounds instead of kinking
export function creaseRamp(distancePastCrease: number): number {
  const t = Math.min(Math.max((distancePastCrease + CREASE_BAND) / (2 * CREASE_BAND), 0), 1);
  return t * t * (3 - 2 * t);
}

// Rodrigues' rotation; every crease lies flat in the sheet, so its axis never has a z component
function turnAbout(
  [x, y, z]: Vector3Tuple,
  axisX: number,
  axisY: number,
  angle: number,
): Vector3Tuple {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const along = (axisX * x + axisY * y) * (1 - cos);
  return [
    x * cos + axisY * z * sin + axisX * along,
    y * cos - axisX * z * sin + axisY * along,
    z * cos + (axisX * y - axisY * x) * sin,
  ];
}

function turnAboutLine(
  point: Vector3Tuple,
  through: Vector3Tuple,
  axisX: number,
  axisY: number,
  angle: number,
): Vector3Tuple {
  const [x, y, z] = turnAbout(
    [point[0] - through[0], point[1] - through[1], point[2] - through[2]],
    axisX,
    axisY,
    angle,
  );
  return [x + through[0], y + through[1], z + through[2]];
}

// The shader's foldSheet mirrors this line for line; positions only here, because only the centre and the tests read it
export function foldPoint(rest: Vector3Tuple, folds: Folds): Vector3Tuple {
  const [x, y] = rest;
  const side = x < 0 ? -1 : 1;
  const wingAxisX = side * WING_CREASE_AXIS_X;

  // every ramp reads the flat sheet, so a point belongs to the same panel however far the creases before it have turned
  const flapAngle = folds.flap * creaseRamp(y);
  const pastWingCrease = side * (x * WING_CREASE_AXIS_Y - (y - WING_CREASE_TOP_Y) * wingAxisX);
  const wingAngle = side * folds.wing * creaseRamp(pastWingCrease);
  // signed across the centre crease rather than ramped from one side, so both halves turn and meet without a step
  const keelAngle = -folds.keel * (2 * creaseRamp(x) - 1);

  let point = turnAboutLine(rest, [0, 0, FLAP_HINGE_Z], 1, 0, flapAngle);
  point = turnAboutLine(
    point,
    [0, WING_CREASE_TOP_Y, WING_HINGE_Z],
    wingAxisX,
    WING_CREASE_AXIS_Y,
    wingAngle,
  );
  return turnAboutLine(point, [0, 0, KEEL_HINGE_Z], 0, 1, keelAngle);
}

export function centreOf(points: readonly Vector3Tuple[], folds: Folds): Vector3Tuple {
  const sum: Vector3Tuple = [0, 0, 0];
  for (const point of points) {
    const [x, y, z] = foldPoint(point, folds);
    sum[0] += x;
    sum[1] += y;
    sum[2] += z;
  }
  return [sum[0] / points.length, sum[1] / points.length, sum[2] / points.length];
}

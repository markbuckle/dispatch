import { CubicBezierCurve3, Matrix4, Quaternion, Vector3 } from 'three';
import { PLANE_UPRIGHT } from './poses';

// Bank per unit of curvature, so a turn of radius 10 rolls about 23 degrees
const BANK_PER_CURVATURE = 4;
const MAX_BANK = (35 * Math.PI) / 180;
// Distance along the curve, as a fraction of it, either side of a point when measuring how sharply it turns there
const CURVATURE_STEP = 0.002;

const worldUp = new Vector3(0, 1, 0);
const forwardAxis = new Vector3(1, 0, 0);
const rightAxis = new Vector3(0, 0, 1);

// Searched for, not drawn: the gentlest turning that fits a square frame, leaving just off the nose and climbing away right
export const outboundPath = new CubicBezierCurve3(
  new Vector3(0, 0, 0),
  new Vector3(0.83, 0.22, 0.02),
  new Vector3(1.62, 0.45, -4.04),
  new Vector3(21.39, 15.78, -60.27),
);

// Searched the same way: sweeps in from deep on the left and finishes on a straight run along the nose into the top view
export const inboundPath = new CubicBezierCurve3(
  new Vector3(-14.83, 2.73, -42.62),
  new Vector3(-1.95, -0.6, -0.67),
  new Vector3(-0.75, -0.2, -0.3),
  new Vector3(0, 0, 0),
);

// The plane's rotation at a fraction of the way along a path, by distance rather than by the curve's own parameter
export function flightAttitude(
  path: CubicBezierCurve3,
  distanceFraction: number,
  { pitch, roll, bankWeight }: { pitch: number; roll: number; bankWeight: number },
): Quaternion {
  const forward = path.getTangentAt(distanceFraction);
  const right = new Vector3().crossVectors(forward, worldUp).normalize();
  const up = new Vector3().crossVectors(right, forward);
  const heading = new Quaternion().setFromRotationMatrix(
    new Matrix4().makeBasis(forward, up, right),
  );

  const before = Math.max(distanceFraction - CURVATURE_STEP, 0);
  const after = Math.min(distanceFraction + CURVATURE_STEP, 1);
  const turn = path
    .getTangentAt(after)
    .sub(path.getTangentAt(before))
    .divideScalar((after - before) * path.getLength());
  // a positive roll lowers the right wing, so a turn toward the right banks into it
  const fullBank = Math.min(Math.max(BANK_PER_CURVATURE * turn.dot(right), -MAX_BANK), MAX_BANK);
  // a thrown plane leaves the hand level and only leans into the turn as it gets going, and levels again to land
  const bank = fullBank * bankWeight;

  // pitch turns about the right wing's axis, so a positive pitch lifts the nose
  return heading
    .multiply(new Quaternion().setFromAxisAngle(forwardAxis, bank + roll))
    .multiply(new Quaternion().setFromAxisAngle(rightAxis, pitch))
    .multiply(PLANE_UPRIGHT);
}

import { Euler, Matrix4, Quaternion, Vector3, type Vector3Tuple } from 'three';
import { centreOf, type Folds } from './folds';
import { outlineSamples } from './sheet-geometry';
import { BODY_HEIGHT } from './sheet-layout';

// Paper never lies perfectly flat once folded, and a little splay lets light into the keel
const KEEL_SPLAY = 0.08;
const WING_DIHEDRAL = (6 * Math.PI) / 180;

export const ENVELOPE_FOLDS: Folds = { flap: Math.PI, keel: 0, wing: 0 };

export const PLANE_FOLDS: Folds = {
  flap: 0,
  keel: Math.PI / 2 - KEEL_SPLAY,
  // one dihedral short of undoing the keel's turn, so each wing settles slightly above level
  wing: Math.PI / 2 - KEEL_SPLAY - WING_DIHEDRAL,
};

// Square to the camera, so the opening frame reads as a flat icon before it turns into depth
export const ENVELOPE_FACE_ON = new Quaternion();

// Turned off face-on so the bevels and the closed flap's edges catch the light, which a square-on envelope never does
export const ENVELOPE_QUATERNION = new Quaternion().setFromEuler(
  new Euler(-0.2, -0.38, 0.04, 'YXZ'),
);

// The folded sheet points its nose along +y with the wings above the keel on +z; this makes nose +x, up +y, right +z
export const PLANE_UPRIGHT = new Quaternion().setFromRotationMatrix(
  new Matrix4().makeBasis(new Vector3(0, 0, 1), new Vector3(1, 0, 0), new Vector3(0, 1, 0)),
);

// Nose toward the viewer's right, top tipped slightly away, a three quarter view from below and in front that shows the keel
const planeView = new Quaternion().setFromEuler(new Euler(-0.28, -0.7, 0.08, 'ZXY'));

export const PLANE_QUATERNION = planeView.clone().multiply(PLANE_UPRIGHT);

// Sampled from the previous timeline at 6.26s, partway through its turn toward an aerial view, which went too far
export const PLANE_TOP_QUATERNION = new Quaternion(
  0.24826384553564254,
  0.5834680521424064,
  0.5644138329288724,
  -0.5285519088297193,
);

// The closed envelope turns about its body's middle, so face-on it sits dead centre however the flap is folded over it
export const ENVELOPE_PIVOT: Vector3Tuple = [0, -BODY_HEIGHT / 2, 0];

export const PLANE_PIVOT: Vector3Tuple = centreOf(outlineSamples, PLANE_FOLDS);

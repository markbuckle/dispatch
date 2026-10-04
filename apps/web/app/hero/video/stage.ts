import type { Vector3Tuple } from 'three';

export const CAMERA_POSITION: Vector3Tuple = [0, 0, 17];
export const CAMERA_FOV = 35;

// Fog starts behind the resting object so it never dims at rest, and is total once the plane is a few lengths away
export const FOG_NEAR = 21;
export const FOG_FAR = 47;

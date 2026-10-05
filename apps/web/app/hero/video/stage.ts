import type { Vector3Tuple } from 'three';

export const CAMERA_POSITION: Vector3Tuple = [0, 0, 17];
// As tight as the plane's widest pass allows: the loop's worst frame stays inside FRAME_SAFE_USE of the half frame
export const CAMERA_FOV = 34;
// The share of the half frame the plane may reach, leaving a band at every edge it never enters
export const FRAME_SAFE_USE = 0.95;

// Fog starts behind the resting object so it never dims at rest, and is total once the plane is a few lengths away
export const FOG_NEAR = 21;
export const FOG_FAR = 47;

import {
  type CubicBezierCurve3,
  Euler,
  Quaternion,
  type QuaternionTuple,
  type Vector3Tuple,
} from 'three';
import { flightAttitude, inboundPath, outboundPath } from './flight-paths';
import type { Folds } from './folds';
import { loopNoise } from './loop-noise';
import {
  ENVELOPE_FACE_ON,
  ENVELOPE_FOLDS,
  ENVELOPE_PIVOT,
  ENVELOPE_QUATERNION,
  PLANE_FOLDS,
  PLANE_PIVOT,
  PLANE_QUATERNION,
  PLANE_TOP_QUATERNION,
} from './poses';

export const LOOP_SECONDS = 13.7;

const FACE_ON_END = 1.5;
// The flap starts lifting while the turn is still easing out, so motion carries straight through instead of stopping
export const FLAP_START = 2.2;
const TURN_END = 2.5;
export const OPEN_END = 3.2;
const WING_FOLD_START = 3.6;
const CENTRE_FOLD_END = 4.1;
export const FOLD_END = 4.5;
// The turn to the top view starts while the wings are still settling, for the same reason the flap overlaps the turn
const TOP_TURN_START = 4.25;
export const TOP_TURN_END = 5;
export const TAKE_OFF = 5.5;
const FLY_END = 8;
export const RETURN_START = 8.25;
export const RETURN_END = 10.5;
export const UNTURN_START = 11;

// The return half replays everything from face-on to the top view backwards at one steady speed, 3.5 seconds into 2.7
const REVERSE_SPEED = (TOP_TURN_END - FACE_ON_END) / (LOOP_SECONDS - UNTURN_START);
// The top view is tilted off level flight, so each flight eases out of and back into it over a full second rather than snapping
const FLIGHT_BLEND_SECONDS = 1;

const FLUTTER_ANGLE = 0.18;
// Flutter around two cycles a second, the float a slow drift
const FLUTTER_CYCLES = 30;
const FLOAT_CYCLES = 4;
const FLOAT_HEIGHT = 0.12;
const FLOAT_DRIFT = 0.05;
const WOBBLE_ANGLE = 0.03;
// A thrown plane's nose lifts as it climbs away, and a landing one flares as it slows
const TAKE_OFF_PITCH = (5 * Math.PI) / 180;
const FLARE_PITCH = (8 * Math.PI) / 180;
// Paper never flies dead steady, so roll and pitch wander a little, most at speed and not at all at rest
const FLIGHT_WOBBLE_ROLL = (4 * Math.PI) / 180;
const FLIGHT_WOBBLE_PITCH = (2 * Math.PI) / 180;
const FLIGHT_WOBBLE_CYCLES = 20;
// The holds hover rather than float: the same motion at a third of the size, so the plane looks alive but poised
const HOVER_SCALE = 0.35;

export type SceneState = {
  folds: Folds;
  position: Vector3Tuple;
  quaternion: QuaternionTuple;
  // the point in the flat sheet the object turns about, eased from the envelope's body to the plane's middle
  pivot: Vector3Tuple;
};

function progress(time: number, start: number, end: number): number {
  return Math.min(Math.max((time - start) / (end - start), 0), 1);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

// A quick start and a long soft finish, the way paper swings once it moves and then settles against its crease
function settle(t: number): number {
  return easeInOutCubic(t ** 0.7);
}

// Harder off the line than a cubic, so take-off reads as a throw rather than a motor spinning up
function easeInQuad(t: number): number {
  return t * t;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function smoothstep(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function lerp(from: Vector3Tuple, to: Vector3Tuple, t: number): Vector3Tuple {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  ];
}

function slerp(from: Quaternion, to: Quaternion, t: number): Quaternion {
  return new Quaternion().slerpQuaternions(from, to, t);
}

function toTuple(quaternion: Quaternion): QuaternionTuple {
  return [quaternion.x, quaternion.y, quaternion.z, quaternion.w];
}

// The turn from the envelope's three-quarter angle to the plane's, applied on top of whatever the envelope is doing
const reshapeRotation = PLANE_QUATERNION.clone().multiply(ENVELOPE_QUATERNION.clone().invert());
// The turn from the plane's three-quarter angle to the top view, applied on top of the fold as it finishes
const topRotation = PLANE_TOP_QUATERNION.clone().multiply(PLANE_QUATERNION.clone().invert());

function noiseAt(time: number, cycles: number, channel: number): number {
  return Math.min(Math.max(loopNoise(time, LOOP_SECONDS, cycles, channel), -1), 1);
}

// Zero with zero slope at both ends of a span, so motion faded by it starts and stops without a jolt
function fadeWindow(time: number, start: number, end: number): number {
  return Math.sin(Math.PI * progress(time, start, end)) ** 2;
}

// The noise float on top of a pose: a drift and a slight wobble, scaled to nothing at the edges of its window
function float(state: SceneState, time: number, strength: number): SceneState {
  const wobble = new Quaternion().setFromEuler(
    new Euler(
      WOBBLE_ANGLE * strength * noiseAt(time, FLOAT_CYCLES, 3),
      WOBBLE_ANGLE * strength * noiseAt(time, FLOAT_CYCLES, 4),
      0,
    ),
  );
  return {
    ...state,
    position: [
      state.position[0] + FLOAT_DRIFT * strength * noiseAt(time, FLOAT_CYCLES, 1),
      state.position[1] + FLOAT_HEIGHT * strength * noiseAt(time, FLOAT_CYCLES, 2),
      state.position[2],
    ],
    quaternion: toTuple(new Quaternion(...state.quaternion).multiply(wobble)),
  };
}

// Everything from face-on to the finished fold, on the forward clock; the unfold reads this same function backwards
function formation(time: number): SceneState {
  // whole-object turns use the flatter smoothstep, because a steep middle spins the object faster than it reads as natural
  const turn = smoothstep(progress(time, FACE_ON_END, TURN_END));
  const open = settle(progress(time, FLAP_START, OPEN_END));
  const centre = settle(progress(time, OPEN_END, CENTRE_FOLD_END));
  const wings = settle(progress(time, WING_FOLD_START, FOLD_END));
  const reshape = smoothstep(progress(time, FLAP_START, FOLD_END));

  // the reshape's turn is layered on top of the face-on turn rather than queued after it, so the two overlap without a stop
  const faceOnTurn = slerp(ENVELOPE_FACE_ON, ENVELOPE_QUATERNION, turn);
  const reshapeTurn = slerp(new Quaternion(), reshapeRotation, reshape);

  return {
    folds: {
      flap: ENVELOPE_FOLDS.flap + (PLANE_FOLDS.flap - ENVELOPE_FOLDS.flap) * open,
      keel: PLANE_FOLDS.keel * centre,
      wing: PLANE_FOLDS.wing * wings,
    },
    position: [0, 0, 0],
    quaternion: toTuple(reshapeTurn.multiply(faceOnTurn)),
    pivot: lerp(ENVELOPE_PIVOT, PLANE_PIVOT, reshape),
  };
}

// The fold with the turn to the top view layered over its last stretch; the return half reads this backwards
function shaping(time: number): SceneState {
  const pose = formation(time);
  const turn = smoothstep(progress(time, TOP_TURN_START, TOP_TURN_END));
  const toTop = slerp(new Quaternion(), topRotation, turn);
  return { ...pose, quaternion: toTuple(toTop.multiply(new Quaternion(...pose.quaternion))) };
}

type FlightMotion = { blend: number; pitch: number; wobble: number };

function flight(
  path: CubicBezierCurve3,
  distanceFraction: number,
  time: number,
  { blend, pitch, wobble }: FlightMotion,
): SceneState {
  const attitude = flightAttitude(path, distanceFraction, {
    pitch: pitch + FLIGHT_WOBBLE_PITCH * wobble * noiseAt(time, FLIGHT_WOBBLE_CYCLES, 6),
    roll: FLIGHT_WOBBLE_ROLL * wobble * noiseAt(time, FLIGHT_WOBBLE_CYCLES, 5),
    bankWeight: smoothstep(blend),
  });
  return {
    folds: { ...PLANE_FOLDS },
    position: path.getPointAt(distanceFraction).toArray(),
    quaternion: toTuple(slerp(PLANE_TOP_QUATERNION, attitude, smoothstep(blend))),
    pivot: PLANE_PIVOT,
  };
}

function rest(time: number): SceneState {
  // the ruffle spans the face-on rest and most of the turn, and has died away by the time the flap starts to open
  const window = fadeWindow(time, 0, FLAP_START);
  const flutter = FLUTTER_ANGLE * window * (0.5 + 0.5 * noiseAt(time, FLUTTER_CYCLES, 0));
  const pose = formation(time);
  return float(
    // the flutter only ever lifts the flap, because a closed flap has the body behind it
    { ...pose, folds: { ...pose.folds, flap: pose.folds.flap - flutter } },
    time,
    window,
  );
}

function hover(time: number, start: number, end: number): SceneState {
  return float(shaping(TOP_TURN_END), time, HOVER_SCALE * fadeWindow(time, start, end));
}

// No state and no clock of its own: the same time always gives the same frame, which is what makes scrubbing and testing work
export function sampleTimeline(time: number): SceneState {
  // the end of the loop is sampled as itself rather than wrapped to 0, so the seam can be compared
  const loopTime =
    time >= 0 && time <= LOOP_SECONDS
      ? time
      : ((time % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;

  if (loopTime < FLAP_START) return rest(loopTime);
  if (loopTime < TOP_TURN_END) return shaping(loopTime);
  if (loopTime < TAKE_OFF) return hover(loopTime, TOP_TURN_END, TAKE_OFF);
  if (loopTime < FLY_END) {
    const out = progress(loopTime, TAKE_OFF, FLY_END);
    return flight(outboundPath, easeInQuad(out), loopTime, {
      blend: (loopTime - TAKE_OFF) / FLIGHT_BLEND_SECONDS,
      pitch: TAKE_OFF_PITCH * smoothstep(out / 0.35),
      // the throw's speed grows in step with how far through the take-off it is
      wobble: out,
    });
  }
  // the beat off screen holds the plane at the far end of the way out, deep in the fog
  if (loopTime < RETURN_START) {
    return flight(outboundPath, 1, loopTime, { blend: 1, pitch: TAKE_OFF_PITCH, wobble: 1 });
  }
  if (loopTime < RETURN_END) {
    const back = progress(loopTime, RETURN_START, RETURN_END);
    return flight(inboundPath, easeOutCubic(back), loopTime, {
      blend: (RETURN_END - loopTime) / FLIGHT_BLEND_SECONDS,
      // the flare rises through the slow last half and is gone again by touchdown
      pitch: FLARE_PITCH * fadeWindow(back, 0.5, 1),
      wobble: (1 - back) ** 2,
    });
  }
  if (loopTime < UNTURN_START) return hover(loopTime, RETURN_END, UNTURN_START);
  // the return half mirrors the forward half, without the ruffle, so it lands still and face-on exactly where the loop began
  return shaping(TOP_TURN_END - (loopTime - UNTURN_START) * REVERSE_SPEED);
}

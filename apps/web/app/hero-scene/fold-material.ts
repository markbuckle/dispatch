import type { WebGLProgramParametersWithUniforms } from 'three';
import type { Folds } from './folds';
import {
  CREASE_BAND,
  FLAP_HINGE_Z,
  KEEL_HINGE_Z,
  WING_CREASE_AXIS_X,
  WING_CREASE_AXIS_Y,
  WING_CREASE_TOP_Y,
  WING_HINGE_Z,
} from './sheet-layout';

// GLSL has no integer-to-float promotion, so a whole number has to be written with its decimal point
function float(value: number): string {
  return value.toFixed(8);
}

// Mirrors foldPoint in folds.ts line for line, and also turns each normal by the same rotations so the rounded creases light correctly
const foldChunk = `
uniform float uFlap;
uniform float uKeel;
uniform float uWing;

float creaseRamp( float distancePastCrease ) {
  float t = clamp( ( distancePastCrease + ${float(CREASE_BAND)} ) / ${float(2 * CREASE_BAND)}, 0.0, 1.0 );
  return t * t * ( 3.0 - 2.0 * t );
}

vec3 turnAbout( vec3 v, vec3 axis, float angle ) {
  float c = cos( angle );
  float s = sin( angle );
  return v * c + cross( axis, v ) * s + axis * dot( axis, v ) * ( 1.0 - c );
}

void foldSheet( inout vec3 p, inout vec3 n ) {
  float side = p.x < 0.0 ? -1.0 : 1.0;
  vec3 wingAxis = vec3( side * ${float(WING_CREASE_AXIS_X)}, ${float(WING_CREASE_AXIS_Y)}, 0.0 );

  float flapAngle = uFlap * creaseRamp( p.y );
  float pastWingCrease = side * ( p.x * wingAxis.y - ( p.y - ${float(WING_CREASE_TOP_Y)} ) * wingAxis.x );
  float wingAngle = side * uWing * creaseRamp( pastWingCrease );
  float keelAngle = -uKeel * ( 2.0 * creaseRamp( p.x ) - 1.0 );

  vec3 flapHinge = vec3( 0.0, 0.0, ${float(FLAP_HINGE_Z)} );
  p = flapHinge + turnAbout( p - flapHinge, vec3( 1.0, 0.0, 0.0 ), flapAngle );
  n = turnAbout( n, vec3( 1.0, 0.0, 0.0 ), flapAngle );

  vec3 wingHinge = vec3( 0.0, ${float(WING_CREASE_TOP_Y)}, ${float(WING_HINGE_Z)} );
  p = wingHinge + turnAbout( p - wingHinge, wingAxis, wingAngle );
  n = turnAbout( n, wingAxis, wingAngle );

  vec3 keelHinge = vec3( 0.0, 0.0, ${float(KEEL_HINGE_Z)} );
  p = keelHinge + turnAbout( p - keelHinge, vec3( 0.0, 1.0, 0.0 ), keelAngle );
  n = turnAbout( n, vec3( 0.0, 1.0, 0.0 ), keelAngle );
}
`;

export type FoldUniforms = {
  uFlap: { value: number };
  uKeel: { value: number };
  uWing: { value: number };
};

export function createFoldUniforms(): FoldUniforms {
  return { uFlap: { value: 0 }, uKeel: { value: 0 }, uWing: { value: 0 } };
}

export function setFolds(uniforms: FoldUniforms, folds: Folds): void {
  uniforms.uFlap.value = folds.flap;
  uniforms.uKeel.value = folds.keel;
  uniforms.uWing.value = folds.wing;
}

// The flat sheet's position and normal, which say which side, which panel and whether a fragment sits on the rounded edge
export const sheetVaryings = `varying vec2 vSheetPosition;
varying vec3 vRestNormal;`;

// The flat sheet never leaves the GPU; each frame sends three angles instead of rewriting every vertex on the CPU
export function injectFold(
  shader: WebGLProgramParametersWithUniforms,
  uniforms: FoldUniforms,
): void {
  Object.assign(shader.uniforms, uniforms);
  shader.vertexShader = shader.vertexShader
    .replace(
      '#include <common>',
      `#include <common>
${sheetVaryings}
${foldChunk}`,
    )
    // three computes the normal before the position, so both are folded here and the position is handed on below
    .replace(
      '#include <beginnormal_vertex>',
      [
        'vSheetPosition = position.xy;',
        'vRestNormal = normal;',
        'vec3 objectNormal = vec3( normal );',
        'vec3 foldedPosition = vec3( position );',
        'foldSheet( foldedPosition, objectNormal );',
      ].join('\n'),
    )
    .replace('#include <begin_vertex>', 'vec3 transformed = foldedPosition;');
}

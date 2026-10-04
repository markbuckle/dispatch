import { type Color, MeshPhysicalMaterial, ShaderChunk, type Texture, Vector2 } from 'three';
import { createFoldUniforms, type FoldUniforms, injectFold, sheetVaryings } from './fold-material';
import { PATTERN_GLYPHS_PER_TILE, type PaperTextures } from './paper-textures';
import { FLAP_HEIGHT, SHEET_WIDTH } from './sheet-layout';

export type PaperColors = { paper: Color; inside: Color; edge: Color; sheen: Color };

export type PaperSettings = {
  roughness: number;
  sheen: number;
  sheenRoughness: number;
  normalStrength: number;
  // how much lighter the rounded edges read, as a paler colour and a faint glow in the edge colour
  edgeLift: number;
  // how strongly each @ mark shows, as a lighter colour and a glossier finish than the card around it
  patternContrast: number;
  // sheet units between neighbouring @ marks
  patternPitch: number;
  // how much the grain's normal variance between neighbouring pixels roughens the mirror; 0 turns it off
  specularAntialiasing: number;
  // how dark the body gets just outside the closed flap's edges
  contactShading: number;
};

// Picked by eye in the preview under the step 4 lights and bloom
export const DEFAULT_PAPER: PaperSettings = {
  roughness: 0.35,
  sheen: 0.24,
  sheenRoughness: 0.5,
  normalStrength: 0.24,
  edgeLift: 0.49,
  patternContrast: 0,
  patternPitch: 0.1,
  specularAntialiasing: 0,
  contactShading: 0.45,
};

// How much of the card's roughness an @ mark keeps at full contrast
const INK_ROUGHNESS = 0.35;
// Kaplanyan's cap on the roughness the anti-aliasing can add, so a fold never turns fully matte
const SPECULAR_ANTIALIASING_CAP = 0.18;
// Below this three's sheen spikes far past white wherever an edge is seen edge-on against a light, and bloom turns it into discs
const SHEEN_ROUGHNESS_FLOOR = 0.3;
// No pixel leaves the material brighter than this many times white, so any future spike blooms as a glint, not a disc
const HIGHLIGHT_CAP = 4;
// How far past the closed flap's edge the contact shading reaches, in sheet units
const CONTACT_WIDTH = 0.18;
// Turns how far past the flap's slanted edge a point sits, in the edge's own proportions, into sheet units
const FLAP_EDGE_SCALE = 1 / Math.hypot(2 / SHEET_WIDTH, 1 / FLAP_HEIGHT);
// Fibre tiles across the sheet's width, about one and a half sheet units each
const FIBRE_REPEAT = 4;
// The grain fades out over these distances from the camera, where mipmaps alone would still let it crawl
const GRAIN_FADE_START = 22;
const GRAIN_FADE_END = 40;

type PaperUniforms = {
  uPaper: { value: Color };
  uPaperInside: { value: Color };
  uPaperEdge: { value: Color };
  uEdgeLift: { value: number };
  uPatternContrast: { value: number };
  uPatternTile: { value: number };
  uPattern: { value: Texture };
  uSpecularAntialiasing: { value: number };
  uContactShading: { value: number };
};

// The flap's inner face is the only inside surface a single sheet shows, so the tint lives on the front face above the hinge
const paperColorChunk = `
float isFront = step( 0.0, vRestNormal.z );
float edge = clamp( ( 1.0 - abs( vRestNormal.z ) ) * 5.0, 0.0, 1.0 );
float isInside = isFront * step( 0.0, vSheetPosition.y ) * ( 1.0 - edge );
float inkMark = texture2D( uPattern, vSheetPosition / uPatternTile ).r * uPatternContrast * isInside;
vec3 paperColor = mix( uPaper, uPaperInside, isInside );
paperColor = mix( paperColor, uPaperEdge, inkMark );
diffuseColor.rgb = mix( paperColor, uPaperEdge, edge * uEdgeLift );

float flapClosed = smoothstep( 0.8 * PI, PI, uFlap );
float pastFlapEdge = ( abs( vSheetPosition.x ) / ${(SHEET_WIDTH / 2).toFixed(4)} - vSheetPosition.y / ${FLAP_HEIGHT.toFixed(4)} - 1.0 ) * ${FLAP_EDGE_SCALE.toFixed(4)};
float underClosedFlap = isFront * step( vSheetPosition.y, 0.0 ) * ( 1.0 - edge ) * step( 0.0, pastFlapEdge );
float contactShade = uContactShading * flapClosed * underClosedFlap * ( 1.0 - smoothstep( 0.0, ${CONTACT_WIDTH.toFixed(4)}, pastFlapEdge ) );
`;

// Printed ink is glossier than the card under it, which is what makes the tint readable where the paper catches the light
const inkGlossChunk = `
roughnessFactor = mix( roughnessFactor, roughnessFactor * ${INK_ROUGHNESS.toFixed(2)}, inkMark );
`;

// Halfway round the bevel the satin faces away from camera and light alike, so only a faint glow can lift it whatever the lighting
const edgeGlowChunk = `
totalEmissiveRadiance += uPaperEdge * edge * uEdgeLift;
`;

// Where the grain bends the normal faster than a pixel can resolve, a mirror sparkles, so roughness rises to cover the spread
const specularAntialiasingChunk = `
vec3 normalChangeX = dFdx( normal );
vec3 normalChangeY = dFdy( normal );
float normalVariance = uSpecularAntialiasing * ( dot( normalChangeX, normalChangeX ) + dot( normalChangeY, normalChangeY ) );
roughnessFactor = sqrt( clamp( roughnessFactor * roughnessFactor + min( 2.0 * normalVariance, ${SPECULAR_ANTIALIASING_CAP.toFixed(2)} ), 0.0, 1.0 ) );
`;

// Light struggles into the gap under the closed flap's edge, and the cap keeps any stray spike from blooming into a disc
const finishingChunk = `
outgoingLight *= 1.0 - contactShade;
outgoingLight = min( outgoingLight, vec3( ${HIGHLIGHT_CAP.toFixed(1)} ) );
`;

const paperUniformsChunk = `
uniform float uFlap;
uniform vec3 uPaper;
uniform vec3 uPaperInside;
uniform vec3 uPaperEdge;
uniform float uEdgeLift;
uniform float uPatternContrast;
uniform float uPatternTile;
uniform sampler2D uPattern;
uniform float uSpecularAntialiasing;
uniform float uContactShading;
`;

const grainFade = `( 1.0 - smoothstep( ${GRAIN_FADE_START.toFixed(1)}, ${GRAIN_FADE_END.toFixed(1)}, length( vViewPosition ) ) )`;
const normalScaleLine = 'mapN.xy *= normalScale;';
if (!ShaderChunk.normal_fragment_maps.includes(normalScaleLine)) {
  throw new Error('three changed its normal map chunk, so the grain fade has nothing to attach to');
}
const fadingNormalMaps = ShaderChunk.normal_fragment_maps.replace(
  normalScaleLine,
  `mapN.xy *= normalScale * ${grainFade};`,
);

export function applyPaperSettings(
  material: MeshPhysicalMaterial,
  uniforms: PaperUniforms,
  settings: PaperSettings,
): void {
  material.roughness = settings.roughness;
  material.sheen = settings.sheen;
  material.sheenRoughness = Math.max(settings.sheenRoughness, SHEEN_ROUGHNESS_FLOOR);
  material.normalScale.set(settings.normalStrength, settings.normalStrength);
  uniforms.uEdgeLift.value = settings.edgeLift;
  uniforms.uPatternContrast.value = settings.patternContrast;
  uniforms.uPatternTile.value = settings.patternPitch * PATTERN_GLYPHS_PER_TILE;
  uniforms.uSpecularAntialiasing.value = settings.specularAntialiasing;
  uniforms.uContactShading.value = settings.contactShading;
}

// Satin card: a physical material for its sheen, which lights folds and edges seen at a glance while faces toward the camera stay dark
export function createPaperMaterial(
  colors: PaperColors,
  textures: PaperTextures,
  settings: PaperSettings,
): { material: MeshPhysicalMaterial; foldUniforms: FoldUniforms; paperUniforms: PaperUniforms } {
  textures.fibre.repeat.set(FIBRE_REPEAT, FIBRE_REPEAT);

  const material = new MeshPhysicalMaterial({
    color: colors.paper,
    metalness: 0,
    sheenColor: colors.sheen,
    normalMap: textures.fibre,
    normalScale: new Vector2(),
  });
  const foldUniforms = createFoldUniforms();
  const paperUniforms: PaperUniforms = {
    uPaper: { value: colors.paper },
    uPaperInside: { value: colors.inside },
    uPaperEdge: { value: colors.edge },
    uEdgeLift: { value: 0 },
    uPatternContrast: { value: 0 },
    uPatternTile: { value: 1 },
    uPattern: { value: textures.pattern },
    uSpecularAntialiasing: { value: 0 },
    uContactShading: { value: 0 },
  };
  applyPaperSettings(material, paperUniforms, settings);

  material.onBeforeCompile = (shader) => {
    injectFold(shader, foldUniforms);
    Object.assign(shader.uniforms, paperUniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${sheetVaryings}\n${paperUniformsChunk}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n${paperColorChunk}`)
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>\n${inkGlossChunk}`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>\n${edgeGlowChunk}`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        `${fadingNormalMaps}
${specularAntialiasingChunk}`,
      )
      .replace(
        '#include <opaque_fragment>',
        `${finishingChunk}
#include <opaque_fragment>`,
      );
  };

  return { material, foldUniforms, paperUniforms };
}

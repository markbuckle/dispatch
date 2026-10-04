import { type Color, MeshPhysicalMaterial, ShaderChunk, type Texture, Vector2 } from 'three';
import { createFoldUniforms, type FoldUniforms, injectFold, sheetVaryings } from './fold-material';
import { PATTERN_GLYPHS_PER_TILE, type PaperTextures } from './paper-textures';

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
};

// Picked by eye in the preview under the studio light at 0.15; step 4's lighting may still move them
export const DEFAULT_PAPER: PaperSettings = {
  roughness: 0,
  sheen: 0.24,
  sheenRoughness: 0,
  normalStrength: 0.24,
  edgeLift: 0.49,
  patternContrast: 1,
  patternPitch: 0.1,
};

// How much of the card's roughness an @ mark keeps at full contrast
const INK_ROUGHNESS = 0.35;
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
`;

// Printed ink is glossier than the card under it, which is what makes the tint readable where the paper catches the light
const inkGlossChunk = `
roughnessFactor = mix( roughnessFactor, roughnessFactor * ${INK_ROUGHNESS.toFixed(2)}, inkMark );
`;

// Halfway round the bevel the satin faces away from camera and light alike, so only a faint glow can lift it whatever the lighting
const edgeGlowChunk = `
totalEmissiveRadiance += uPaperEdge * edge * uEdgeLift;
`;

const paperUniformsChunk = `
uniform vec3 uPaper;
uniform vec3 uPaperInside;
uniform vec3 uPaperEdge;
uniform float uEdgeLift;
uniform float uPatternContrast;
uniform float uPatternTile;
uniform sampler2D uPattern;
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
  material.sheenRoughness = settings.sheenRoughness;
  material.normalScale.set(settings.normalStrength, settings.normalStrength);
  uniforms.uEdgeLift.value = settings.edgeLift;
  uniforms.uPatternContrast.value = settings.patternContrast;
  uniforms.uPatternTile.value = settings.patternPitch * PATTERN_GLYPHS_PER_TILE;
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
      .replace('#include <normal_fragment_maps>', fadingNormalMaps);
  };

  return { material, foldUniforms, paperUniforms };
}

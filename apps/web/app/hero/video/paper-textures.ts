import { CanvasTexture, RepeatWrapping } from 'three';

// Small on purpose: the grain is a whisper and mipmaps average it away with distance, so more texels buy nothing
const FIBRE_SIZE = 256;
const FIBRE_COUNT = 1400;
// How steeply a height step tilts the normal; the material's normal scale does the real tuning
const FIBRE_RELIEF = 2.5;

export type PaperTextures = { fibre: CanvasTexture };

// A fixed seed, so every visitor gets the same sheet and a screenshot can be compared with the last one
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function drawingSurface(size: number): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('2d canvas is unavailable');
  return context;
}

// The canvas values below are heights and masks, not colours, so they do not come from tokens
function fibreNormals(): HTMLCanvasElement {
  const context = drawingSurface(FIBRE_SIZE);
  const random = seededRandom(11);
  context.fillStyle = 'rgb(128, 128, 128)';
  context.fillRect(0, 0, FIBRE_SIZE, FIBRE_SIZE);
  context.lineWidth = 1;

  for (let fibre = 0; fibre < FIBRE_COUNT; fibre++) {
    const x = random() * FIBRE_SIZE;
    const y = random() * FIBRE_SIZE;
    const angle = random() * Math.PI;
    const length = 6 + random() * 22;
    const raised = random() < 0.5;
    context.strokeStyle = raised
      ? `rgba(255, 255, 255, ${0.05 + random() * 0.08})`
      : `rgba(0, 0, 0, ${0.05 + random() * 0.08})`;
    const dx = (Math.cos(angle) * length) / 2;
    const dy = (Math.sin(angle) * length) / 2;
    // drawn once per neighbouring tile as well, so a fibre crossing an edge carries on into the next repeat
    for (const offsetX of [-FIBRE_SIZE, 0, FIBRE_SIZE]) {
      for (const offsetY of [-FIBRE_SIZE, 0, FIBRE_SIZE]) {
        context.beginPath();
        context.moveTo(x + offsetX - dx, y + offsetY - dy);
        context.lineTo(x + offsetX + dx, y + offsetY + dy);
        context.stroke();
      }
    }
  }

  const heights = context.getImageData(0, 0, FIBRE_SIZE, FIBRE_SIZE).data;
  const heightAt = (x: number, y: number) => {
    const wrappedX = (x + FIBRE_SIZE) % FIBRE_SIZE;
    const wrappedY = (y + FIBRE_SIZE) % FIBRE_SIZE;
    return (heights[(wrappedY * FIBRE_SIZE + wrappedX) * 4] ?? 128) / 255;
  };

  const normals = context.createImageData(FIBRE_SIZE, FIBRE_SIZE);
  for (let y = 0; y < FIBRE_SIZE; y++) {
    for (let x = 0; x < FIBRE_SIZE; x++) {
      const slopeX = (heightAt(x + 1, y) - heightAt(x - 1, y)) * FIBRE_RELIEF;
      // canvas rows run down and texture v runs up, so the y slope flips
      const slopeY = (heightAt(x, y - 1) - heightAt(x, y + 1)) * FIBRE_RELIEF;
      const length = Math.hypot(slopeX, slopeY, 1);
      const index = (y * FIBRE_SIZE + x) * 4;
      normals.data[index] = ((-slopeX / length) * 0.5 + 0.5) * 255;
      normals.data[index + 1] = ((-slopeY / length) * 0.5 + 0.5) * 255;
      normals.data[index + 2] = ((1 / length) * 0.5 + 0.5) * 255;
      normals.data[index + 3] = 255;
    }
  }
  context.putImageData(normals, 0, 0);
  return context.canvas;
}

function asRepeatingTexture(canvas: HTMLCanvasElement, anisotropy: number): CanvasTexture {
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  // mipmaps are on by default; anisotropy keeps the grain from smearing or crawling on a sheet seen edge-on or far away
  texture.anisotropy = anisotropy;
  return texture;
}

// Generated once per mount, in the browser, because the grain is drawn on a canvas
export function createPaperTextures(anisotropy: number): PaperTextures {
  return { fibre: asRepeatingTexture(fibreNormals(), anisotropy) };
}

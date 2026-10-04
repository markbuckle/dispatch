// A fixed shuffle, so every visitor sees the same ruffle and a test can pin it
const permutation = (() => {
  const values = Array.from({ length: 256 }, (_, index) => index);
  let seed = 7;
  for (let index = values.length - 1; index > 0; index--) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const swap = seed % (index + 1);
    [values[index], values[swap]] = [values[swap] ?? 0, values[index] ?? 0];
  }
  return [...values, ...values];
})();

function hash(index: number): number {
  return permutation[index] ?? 0;
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function gradient(hashValue: number, x: number, y: number): number {
  const u = hashValue & 4 ? y : x;
  const v = hashValue & 4 ? x : y;
  return (hashValue & 1 ? -u : u) + (hashValue & 2 ? -v : v);
}

// Perlin gradient noise, roughly -1 to 1
function noise(x: number, y: number): number {
  const cellX = Math.floor(x);
  const cellY = Math.floor(y);
  const fractionX = x - cellX;
  const fractionY = y - cellY;
  const wrappedX = cellX & 255;
  const wrappedY = cellY & 255;

  const corner = (offsetX: number, offsetY: number) =>
    gradient(
      hash(hash(wrappedX + offsetX) + wrappedY + offsetY),
      fractionX - offsetX,
      fractionY - offsetY,
    );

  const blendX = fade(fractionX);
  const bottom = corner(0, 0) + blendX * (corner(1, 0) - corner(0, 0));
  const top = corner(0, 1) + blendX * (corner(1, 1) - corner(0, 1));
  return bottom + fade(fractionY) * (top - bottom);
}

// Walks a circle through the noise field, so the value at the end of the loop is the value at its start
export function loopNoise(
  time: number,
  loopSeconds: number,
  cyclesPerLoop: number,
  channel: number,
): number {
  const angle = (time / loopSeconds) * 2 * Math.PI;
  const radius = cyclesPerLoop / (2 * Math.PI);
  return noise(
    radius * Math.cos(angle) + channel * 17.31,
    radius * Math.sin(angle) + channel * 31.77,
  );
}

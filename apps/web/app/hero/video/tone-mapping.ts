export type LinearColor = [number, number, number];

// Khronos PBR Neutral exactly as three ships it and postprocessing runs it, so a test can check the solved fog colour
const START_COMPRESSION = 0.8 - 0.04;
const DESATURATION = 0.15;
const TOE_END = 0.08;
const TOE_OFFSET = 0.04;

export function neutralToneMap(input: LinearColor, exposure: number): LinearColor {
  let color = input.map((channel) => channel * exposure);
  const x = Math.min(...color);
  const offset = x < TOE_END ? x - 6.25 * x * x : TOE_OFFSET;
  color = color.map((channel) => channel - offset);

  const peak = Math.max(...color);
  if (peak < START_COMPRESSION) return [color[0] ?? 0, color[1] ?? 0, color[2] ?? 0];

  const d = 1 - START_COMPRESSION;
  const newPeak = 1 - (d * d) / (peak + d - START_COMPRESSION);
  color = color.map((channel) => (channel * newPeak) / peak);
  const g = 1 - 1 / (DESATURATION * (peak - newPeak) + 1);
  const mixed = color.map((channel) => channel + (newPeak - channel) * g);
  return [mixed[0] ?? 0, mixed[1] ?? 0, mixed[2] ?? 0];
}

// Below the compression knee the curve only subtracts an offset set by the darkest channel, so it inverts exactly
export function inverseNeutralToneMap(target: LinearColor, exposure: number): LinearColor {
  const darkest = Math.min(...target);
  if (Math.max(...target) >= START_COMPRESSION) {
    throw new Error('the colour is above the tone curve knee, where it no longer inverts exactly');
  }

  // in the toe the darkest channel comes out as 6.25x², and above it every channel comes out 0.04 lower
  const inToe = darkest < 6.25 * TOE_END * TOE_END;
  const x = inToe ? Math.sqrt(darkest / 6.25) : darkest + TOE_OFFSET;
  const offset = inToe ? x - 6.25 * x * x : TOE_OFFSET;
  return [
    (target[0] + offset) / exposure,
    (target[1] + offset) / exposure,
    (target[2] + offset) / exposure,
  ];
}

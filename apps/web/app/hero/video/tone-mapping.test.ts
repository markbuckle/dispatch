import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Color, SRGBColorSpace } from 'three';
import { describe, expect, it } from 'vitest';
import { inverseNeutralToneMap, type LinearColor, neutralToneMap } from './tone-mapping';

// Read from the token file itself, so a change to the page colour is checked without editing this test
function canvasToken(): string {
  const tokens = readFileSync(
    join(import.meta.dirname, '../../../../../design/design-system/tokens/tokens.css'),
    'utf8',
  );
  const match = tokens.match(/--dispatch-canvas:\s*(#[0-9A-Fa-f]{6})/);
  if (!match?.[1]) throw new Error('--dispatch-canvas is missing from tokens.css');
  return match[1];
}

function linear(hex: string): LinearColor {
  const color = new Color().setStyle(hex, SRGBColorSpace);
  return [color.r, color.g, color.b];
}

describe('tone mapping', () => {
  const page = canvasToken();

  it.each([0.7, 1, 1.4])(
    'solves a fog colour that lands on the page colour at exposure %s',
    (exposure) => {
      const fog = inverseNeutralToneMap(linear(page), exposure);
      const [r, g, b] = neutralToneMap(fog, exposure);
      const [pageR, pageG, pageB] = linear(page);

      expect(Math.max(Math.abs(r - pageR), Math.abs(g - pageG), Math.abs(b - pageB))).toBeLessThan(
        1e-9,
      );
      // the screen shows 8-bit sRGB, so that is where an outline would or would not appear
      expect(`#${new Color(r, g, b).getHexString(SRGBColorSpace)}`.toUpperCase()).toBe(
        page.toUpperCase(),
      );
    },
  );

  it('leaves a fully transparent pixel at zero, so the empty canvas never shows as a box', () => {
    expect(neutralToneMap([0, 0, 0], 1)).toEqual([0, 0, 0]);
  });
});

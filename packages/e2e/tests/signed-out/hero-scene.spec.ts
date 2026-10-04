import { expect, type Page, test } from '@playwright/test';

// Between the plane vanishing into the fog and its return, so the whole canvas should be empty page
const HIDDEN_BEAT = '8.1';
// The rest of the loop has the envelope on screen, but a corner is still always empty page
const CORNER_SIZE = 12;

type Region = { x: number; y: number; width: number; height: number };
type Mismatch = { count: number; worst: number };

// Leva and Next's dev badge sit over the canvas in development and are not part of what a visitor sees
async function hideDevelopmentOverlays(page: Page): Promise<void> {
  await page.addStyleTag({
    content: '#leva__root, nextjs-portal { display: none !important; }',
  });
}

async function scrubTo(page: Page, time: string): Promise<void> {
  await page.getByLabel('Loop time').fill(time);
  // the readout is written in the same frame callback that applies the time, so once it shows the time that frame is drawing
  await expect(page.getByText(`${Number(time).toFixed(2)}s`, { exact: true })).toBeVisible();
  // two more animation frames, so the effect chain has finished the scrubbed frame rather than the one before it
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

// Decoded in the browser, so the suite needs no image library of its own
async function mismatchesAgainstPage(page: Page, regions: Region[]): Promise<Mismatch> {
  const png = await page.locator('canvas').screenshot();
  return page.evaluate(
    async ({ base64, regions }) => {
      const background = getComputedStyle(document.querySelector('main') ?? document.body)
        .backgroundColor.match(/\d+/g)
        ?.map(Number);
      if (!background || background.length < 3)
        throw new Error('the page has no background colour');

      const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
      const bitmap = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('2d canvas is unavailable');
      context.drawImage(bitmap, 0, 0);

      let count = 0;
      let worst = 0;
      for (const region of regions.length > 0
        ? regions
        : [{ x: 0, y: 0, width: bitmap.width, height: bitmap.height }]) {
        const x = region.x < 0 ? bitmap.width + region.x : region.x;
        const y = region.y < 0 ? bitmap.height + region.y : region.y;
        const { data } = context.getImageData(x, y, region.width, region.height);
        for (let index = 0; index < data.length; index += 4) {
          const difference = Math.max(
            Math.abs((data[index] ?? 0) - (background[0] ?? 0)),
            Math.abs((data[index + 1] ?? 0) - (background[1] ?? 0)),
            Math.abs((data[index + 2] ?? 0) - (background[2] ?? 0)),
          );
          if (difference > 0) count++;
          worst = Math.max(worst, difference);
        }
      }
      return { count, worst };
    },
    { base64: png.toString('base64'), regions },
  );
}

// Dev-only route, so this skips on preview deploys until step 5 retargets it at the landing page hero
test.describe('hero scene canvas', () => {
  test.beforeEach(async ({ page }) => {
    // the first visit compiles three and the effect chain, well past the default test timeout
    test.setTimeout(180_000);
    const response = await page.goto('/dev/hero-scene');
    test.skip(response?.status() === 404, 'the hero preview route only exists in development');
    await expect(page.locator('canvas')).toBeVisible();
    await hideDevelopmentOverlays(page);
  });

  test('the hidden plane fades into exactly the page colour', async ({ page }) => {
    await scrubTo(page, HIDDEN_BEAT);
    expect(await mismatchesAgainstPage(page, [])).toEqual({ count: 0, worst: 0 });
  });

  test('the canvas corners are exactly the page colour, so it never shows as a box', async ({
    page,
  }) => {
    const corners: Region[] = [
      { x: 0, y: 0, width: CORNER_SIZE, height: CORNER_SIZE },
      { x: -CORNER_SIZE, y: 0, width: CORNER_SIZE, height: CORNER_SIZE },
      { x: 0, y: -CORNER_SIZE, width: CORNER_SIZE, height: CORNER_SIZE },
      { x: -CORNER_SIZE, y: -CORNER_SIZE, width: CORNER_SIZE, height: CORNER_SIZE },
    ];
    for (const time of ['0', '5.2']) {
      await scrubTo(page, time);
      expect(await mismatchesAgainstPage(page, corners), `corners at ${time}s`).toEqual({
        count: 0,
        worst: 0,
      });
    }
  });
});

import { expect, type Page, test } from '@playwright/test';

// A band this wide all round the video, and its own corners, must be page and nothing else
const RING = 24;
const CORNER = 12;

type Region = { x: number; y: number; width: number; height: number };
type Mismatch = { count: number; worst: number };

// Decoded in the browser, so the suite needs no image library of its own
async function mismatchesAgainstPage(
  page: Page,
  clip: Region,
  regions: Region[],
): Promise<Mismatch> {
  const png = await page.screenshot({ clip });
  return page.evaluate(
    async ({ base64, regions }) => {
      const background = getComputedStyle(document.body).backgroundColor.match(/\d+/g)?.map(Number);
      if (!background || background.length < 3)
        throw new Error('the page has no background colour');

      const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
      const bitmap = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('2d canvas is unavailable');
      context.drawImage(bitmap, 0, 0);
      const lastRow = Math.max(...regions.map((region) => region.y + region.height));
      if (bitmap.height < lastRow)
        throw new Error('the screenshot is shorter than the area it was asked for');

      let count = 0;
      let worst = 0;
      for (const region of regions) {
        const { data } = context.getImageData(region.x, region.y, region.width, region.height);
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

// Runs on every preview deploy once the hero-video flag is on; while it is off the old hero has no video to check
test('the hero video blends into the page with no visible box', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('video[aria-hidden="true"]');
  test.skip((await video.count()) === 0, 'the hero-video flag is off');

  // Next's development badge sits at the corner of the viewport and is not part of the page a visitor sees
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
  // centred, so the ring below the video is inside the viewport too; a screenshot never captures past the viewport's edge
  await video.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  // checked while it plays, because that is what a visitor sees and the poster alone could hide a decoding problem
  await page.waitForFunction(
    () => {
      const element = document.querySelector('video');
      return element !== null && element.readyState >= 2 && element.currentTime > 0.5;
    },
    undefined,
    { timeout: 30_000 },
  );

  const box = await video.boundingBox();
  if (!box) throw new Error('the hero video has no layout box');
  const clip = {
    x: Math.round(box.x) - RING,
    y: Math.round(box.y) - RING,
    width: Math.round(box.width) + 2 * RING,
    height: Math.round(box.height) + 2 * RING,
  };
  const inner = { x: RING, y: RING, width: clip.width - 2 * RING, height: clip.height - 2 * RING };
  const regions: Region[] = [
    { x: 0, y: 0, width: clip.width, height: RING },
    { x: 0, y: clip.height - RING, width: clip.width, height: RING },
    { x: 0, y: RING, width: RING, height: inner.height },
    { x: clip.width - RING, y: RING, width: RING, height: inner.height },
    { x: inner.x, y: inner.y, width: CORNER, height: CORNER },
    { x: inner.x + inner.width - CORNER, y: inner.y, width: CORNER, height: CORNER },
    { x: inner.x, y: inner.y + inner.height - CORNER, width: CORNER, height: CORNER },
    {
      x: inner.x + inner.width - CORNER,
      y: inner.y + inner.height - CORNER,
      width: CORNER,
      height: CORNER,
    },
  ];

  expect(await mismatchesAgainstPage(page, clip, regions)).toEqual({ count: 0, worst: 0 });
});

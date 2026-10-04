import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

// Twice the largest size the hero shows the video at, so it stays sharp on a retina screen
const SIZE = 1120;
const RENDER_FPS = 60;
// 30fps was tried and dropped: halving the frames doubled the jump between them in the fast turns, visibly stepping
const OUTPUT_FPS = [60];
const BASE_URL = process.env.HERO_BASE_URL ?? 'http://localhost:3000';
const FFMPEG = process.env.FFMPEG_PATH ?? 'ffmpeg';

const repository = join(import.meta.dirname, '../../..');
const framesDirectory = join(repository, 'apps/web/.hero-frames');
const outputDirectory = join(repository, 'apps/web/public/hero');

function report(line: string): void {
  process.stdout.write(`${line}\n`);
}

function ffmpeg(args: string[]): void {
  const result = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: 'inherit',
  });
  if (result.status !== 0) throw new Error(`ffmpeg failed: ${args.join(' ')}`);
}

async function renderFrames(): Promise<number> {
  rmSync(framesDirectory, { recursive: true, force: true });
  mkdirSync(framesDirectory, { recursive: true });

  // the real GPU through ANGLE where the machine has one, which is many times faster than software rendering
  const browser = await chromium.launch({
    args: ['--use-angle=d3d11', '--enable-gpu-rasterization'],
  });
  const page = await browser.newPage({
    viewport: { width: SIZE, height: SIZE },
    deviceScaleFactor: 1,
  });
  await page.goto(`${BASE_URL}/hero/video?capture=${SIZE}`, { timeout: 180_000 });
  await page.waitForFunction(() => typeof window.renderHeroFrame === 'function', undefined, {
    timeout: 180_000,
  });
  // Next's development badge sits over the canvas corner and is not part of the scene
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });

  const loopSeconds = await page.evaluate(() => window.heroLoopSeconds ?? 0);
  // frame N would repeat frame 0, and a duplicated frame stutters at the loop point
  const frameCount = Math.round(loopSeconds * RENDER_FPS);
  const canvas = page.locator('canvas');
  const started = performance.now();

  for (let frame = 0; frame < frameCount; frame++) {
    await page.evaluate((time) => window.renderHeroFrame?.(time), frame / RENDER_FPS);
    await canvas.screenshot({
      path: join(framesDirectory, `${String(frame).padStart(4, '0')}.png`),
    });
    if (frame % 60 === 0) {
      const elapsed = (performance.now() - started) / 1000;
      report(`frame ${frame} of ${frameCount}, ${elapsed.toFixed(0)}s`);
    }
  }

  await browser.close();
  return frameCount;
}

function encode(frameCount: number): void {
  mkdirSync(outputDirectory, { recursive: true });
  const input = ['-framerate', String(RENDER_FPS), '-i', join(framesDirectory, '%04d.png')];
  // BT.709 at limited range, tagged, so browsers decode the black background to exactly zero
  const colour = [
    '-colorspace',
    'bt709',
    '-color_primaries',
    'bt709',
    '-color_trc',
    'bt709',
    '-color_range',
    'tv',
  ];
  // tagged on the frames themselves, because the encoder takes colour metadata from the frames over its own options
  const toVideo =
    'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv';

  for (const fps of OUTPUT_FPS) {
    const keep = RENDER_FPS / fps;
    const frames = frameCount / keep;
    const filter = `select='not(mod(n\\,${keep}))',setpts=N/${fps}/TB,${toVideo}`;
    // one keyframe, on frame 0, so the loop restarts cleanly and the rest of the file spends its bits on motion
    const keyframes = ['-g', String(frames), '-keyint_min', String(frames)];

    ffmpeg([
      ...input,
      '-vf',
      filter,
      '-r',
      String(fps),
      '-an',
      '-c:v',
      'libsvtav1',
      '-preset',
      '5',
      // lower than SVT's default, because the paper grain smooths away first and the file stays well under budget
      '-crf',
      '30',
      ...keyframes,
      ...colour,
      '-movflags',
      '+faststart',
      join(outputDirectory, `hero-loop-${fps}.av1.mp4`),
    ]);
    ffmpeg([
      ...input,
      '-vf',
      filter,
      '-r',
      String(fps),
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-crf',
      '22',
      '-profile:v',
      'high',
      ...keyframes,
      ...colour,
      '-movflags',
      '+faststart',
      join(outputDirectory, `hero-loop-${fps}.h264.mp4`),
    ]);
  }

  // frame 0 is the face-on envelope the loop opens on, so the poster and the first frame match exactly
  ffmpeg([
    '-i',
    join(framesDirectory, '0000.png'),
    '-c:v',
    'libwebp',
    '-quality',
    '85',
    join(outputDirectory, 'hero-poster.webp'),
  ]);
}

// --encode-only reuses the frames from the last render, for tuning the encode without waiting on the capture again
const frameCount = process.argv.includes('--encode-only')
  ? readdirSync(framesDirectory).filter((name) => name.endsWith('.png')).length
  : await renderFrames();
encode(frameCount);
for (const name of [
  ...OUTPUT_FPS.flatMap((fps) => [`hero-loop-${fps}.av1.mp4`, `hero-loop-${fps}.h264.mp4`]),
  'hero-poster.webp',
]) {
  report(`${name}: ${(statSync(join(outputDirectory, name)).size / 1024).toFixed(0)} KB`);
}

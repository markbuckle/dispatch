import { notFound } from 'next/navigation';
import { CaptureStage } from './capture-stage';
import { LoopPreview } from './loop-preview';

type PreviewProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function HeroScenePreviewPage({ searchParams }: PreviewProps) {
  // previews share production's url space, and an unfinished scene is a workbench, not a page anyone should land on
  if (process.env.NODE_ENV !== 'development') notFound();

  // ?capture=<pixels> is the render script's view: no controls, a fixed square canvas, frames drawn on request
  const { capture } = await searchParams;
  const captureSize = typeof capture === 'string' ? Number.parseInt(capture, 10) : Number.NaN;
  if (Number.isInteger(captureSize) && captureSize > 0) return <CaptureStage size={captureSize} />;

  return <LoopPreview />;
}

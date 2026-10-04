import { notFound } from 'next/navigation';
import { LoopPreview } from './loop-preview';

export default function HeroScenePreviewPage() {
  // previews share production's url space, and an unfinished scene is a workbench, not a page anyone should land on
  if (process.env.NODE_ENV !== 'development') notFound();

  return <LoopPreview />;
}

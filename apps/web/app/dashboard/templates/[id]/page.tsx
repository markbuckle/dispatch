import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { COMPATIBILITY_CHECKER, isFeatureEnabled } from '../../../../lib/flags/is-feature-enabled';
import { getTemplate } from '../actions';
import { TemplateEditor } from '../template-editor';

// cached so generateMetadata and the page read the row once between them
const readTemplate = cache(async (id: string) => getTemplate(id));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const template = await readTemplate(id);

  return { title: template ? `${template.name} - Dispatch` : 'Template - Dispatch' };
}

export default async function TemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // both wait on the network, so neither should queue behind the other
  const [template, isCompatibilityCheckerEnabled] = await Promise.all([
    readTemplate(id),
    isFeatureEnabled(COMPATIBILITY_CHECKER),
  ]);
  if (!template) notFound();

  return (
    <TemplateEditor
      template={template}
      isCompatibilityCheckerEnabled={isCompatibilityCheckerEnabled}
    />
  );
}

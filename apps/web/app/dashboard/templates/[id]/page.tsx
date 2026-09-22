import { notFound } from 'next/navigation';
import { COMPATIBILITY_CHECKER, isFeatureEnabled } from '../../../../lib/flags/is-feature-enabled';
import { getTemplate } from '../actions';
import { TemplateEditor } from '../template-editor';

export default async function TemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // both wait on the network, so neither should queue behind the other
  const [template, isCompatibilityCheckerEnabled] = await Promise.all([
    getTemplate(id),
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

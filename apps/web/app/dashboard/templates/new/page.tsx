import type { Metadata } from 'next';
import { COMPATIBILITY_CHECKER, isFeatureEnabled } from '../../../../lib/flags/is-feature-enabled';
import { TemplateEditor } from '../template-editor';

export const metadata: Metadata = {
  title: 'New template - Dispatch',
};

export default async function NewTemplatePage() {
  const isCompatibilityCheckerEnabled = await isFeatureEnabled(COMPATIBILITY_CHECKER);

  return <TemplateEditor isCompatibilityCheckerEnabled={isCompatibilityCheckerEnabled} />;
}

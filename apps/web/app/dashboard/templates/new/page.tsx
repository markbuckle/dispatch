import { COMPATIBILITY_CHECKER, isFeatureEnabled } from '../../../../lib/flags/is-feature-enabled';
import { TemplateEditor } from '../template-editor';

export default async function NewTemplatePage() {
  const isCompatibilityCheckerEnabled = await isFeatureEnabled(COMPATIBILITY_CHECKER);

  return <TemplateEditor isCompatibilityCheckerEnabled={isCompatibilityCheckerEnabled} />;
}

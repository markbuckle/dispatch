import { featureBySlug, snapshotInfo } from './caniemail';
import { extractDeclarations } from './extract-declarations';
import { FEATURE_CHECKS } from './features';
import type { CompatFinding, CompatResult } from './types';

// resolved once, so a slug that drifts from the vendored snapshot fails on import rather than on a template
const CHECKS = FEATURE_CHECKS.map((check) => ({
  matches: check.matches,
  feature: featureBySlug(check.slug),
  // a feature every client has caught up on has nothing left to warn about
})).filter(({ feature }) => feature.clients.length > 0);

export function checkCompatibility(html: string): CompatResult {
  const findings: CompatFinding[] = [];
  const seen = new Set<string>();

  for (const declaration of extractDeclarations(html)) {
    for (const { matches, feature } of CHECKS) {
      if (!matches(declaration)) continue;

      // one mistake repeated down a template is still one thing to fix
      const key = `${feature.slug}|${declaration.property}|${declaration.value}|${declaration.source}`;
      if (seen.has(key)) continue;
      seen.add(key);

      findings.push({
        feature: feature.title,
        slug: feature.slug,
        url: feature.url,
        trigger: {
          property: declaration.property,
          value: declaration.value,
          source: declaration.source,
        },
        clients: feature.clients,
        severity: feature.severity,
        supportScore: feature.supportScore,
      });
    }
  }

  findings.sort(
    (a, b) =>
      Number(a.severity === 'partial') - Number(b.severity === 'partial') ||
      a.supportScore - b.supportScore ||
      a.trigger.property.localeCompare(b.trigger.property) ||
      a.trigger.value.localeCompare(b.trigger.value),
  );

  return { findings, snapshot: snapshotInfo };
}

import snapshot from './data/caniemail.json';
import type { ClientSupport, SnapshotInfo, SupportLevel } from './types';

type VendoredClient = {
  family: string;
  platform: string;
  version: string;
  level: string;
  note: string | null;
};

type Vendored = {
  source: { api_version: string; last_update_date: string; retrieved_at: string };
  features: {
    slug: string;
    title: string;
    url: string;
    support_score: number;
    clients: VendoredClient[];
  }[];
};

export type Feature = {
  slug: string;
  title: string;
  url: string;
  clients: ClientSupport[];
  severity: SupportLevel;
  supportScore: number;
};

const vendored: Vendored = snapshot;

function toClientSupport(client: VendoredClient): ClientSupport {
  const level: SupportLevel = client.level === 'partial' ? 'partial' : 'unsupported';

  return {
    family: client.family,
    platform: client.platform,
    version: client.version,
    level,
    ...(client.note !== null && { note: client.note }),
  };
}

const bySlug = new Map<string, Feature>(
  vendored.features.map((feature) => {
    const clients = feature.clients.map(toClientSupport);

    return [
      feature.slug,
      {
        slug: feature.slug,
        title: feature.title,
        url: feature.url,
        clients,
        severity: clients.some((client) => client.level === 'unsupported')
          ? 'unsupported'
          : 'partial',
        supportScore: feature.support_score,
      },
    ];
  }),
);

export function featureBySlug(slug: string): Feature {
  const feature = bySlug.get(slug);
  // a check names a slug the vendoring script pinned, so a miss means the two drifted apart
  if (!feature) throw new Error(`no vendored caniemail data for ${slug}`);
  return feature;
}

export const snapshotInfo: SnapshotInfo = {
  apiVersion: vendored.source.api_version,
  lastUpdateDate: vendored.source.last_update_date,
  retrievedAt: vendored.source.retrieved_at,
};

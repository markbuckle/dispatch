export type SupportLevel = 'unsupported' | 'partial';

export type DeclarationSource = 'style-attribute' | 'style-element';

export type ClientSupport = {
  family: string;
  platform: string;
  version: string;
  level: SupportLevel;
  note?: string;
};

export type CompatTrigger = {
  property: string;
  value: string;
  source: DeclarationSource;
};

export type CompatFinding = {
  feature: string;
  slug: string;
  url: string;
  trigger: CompatTrigger;
  clients: ClientSupport[];
  severity: SupportLevel;
  supportScore: number;
};

export type SnapshotInfo = {
  apiVersion: string;
  lastUpdateDate: string;
  retrievedAt: string;
};

export type CompatResult = {
  findings: CompatFinding[];
  snapshot: SnapshotInfo;
};

import type { ExtractedDeclaration } from './extract-declarations';

export type FeatureCheck = {
  slug: string;
  matches: (declaration: ExtractedDeclaration) => boolean;
};

// caniemail files inline-flex under css-display-flex, its note 2 records the clients that take one but not the other
const FLEX_VALUES = new Set(['flex', 'inline-flex']);
const GRID_VALUES = new Set(['grid', 'inline-grid']);

export const FEATURE_CHECKS: FeatureCheck[] = [
  {
    slug: 'css-display-flex',
    matches: ({ property, value }) =>
      property.toLowerCase() === 'display' && FLEX_VALUES.has(value.toLowerCase()),
  },
  {
    slug: 'css-display-grid',
    matches: ({ property, value }) =>
      property.toLowerCase() === 'display' && GRID_VALUES.has(value.toLowerCase()),
  },
  {
    // caniemail's note 1 separates reading a variable from declaring one, and Gmail does only the first
    slug: 'css-variables',
    matches: ({ property, usesVar }) => usesVar || property.startsWith('--'),
  },
  {
    // static is the initial value, so it can only appear as a deliberate opt out
    slug: 'css-position',
    matches: ({ property, value }) =>
      property.toLowerCase() === 'position' && value.toLowerCase() !== 'static',
  },
];

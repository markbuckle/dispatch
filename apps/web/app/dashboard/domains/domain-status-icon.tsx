import type { Domain } from '@dispatch/db';
import { StatusTile, TileGlyph } from '../status-tile';
import { domainStatusTone } from './domain-status-pill';

// logo/icons/globe.svg, the sidebar's Domains glyph
export function DomainStatusIcon({ status }: { status: Domain['status'] }) {
  return (
    <StatusTile tone={domainStatusTone(status)}>
      {(id) => (
        <TileGlyph id={id}>
          <circle cx="16" cy="16" r="12" />
          <path d="M16 4 C11.5 8 11.5 24 16 28 C20.5 24 20.5 8 16 4" />
          <path d="M4 16 H28" />
        </TileGlyph>
      )}
    </StatusTile>
  );
}

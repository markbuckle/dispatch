import { StatusTile, TileGlyph } from '../status-tile';

// logo/icons/key.svg, the sidebar's API keys glyph; the row's "Revoked" label says in words what the dimmed tile shows
export function ApiKeyIcon({ isRevoked }: { isRevoked: boolean }) {
  return (
    <StatusTile tone={isRevoked ? 'off' : 'success'}>
      {(id) => (
        <TileGlyph id={id}>
          <circle cx="10" cy="10" r="5.5" />
          <path d="M14 14 L26 26" strokeLinecap="butt" />
          <path d="M20 20 L17 23" />
          <path d="M23 23 L20 26" />
        </TileGlyph>
      )}
    </StatusTile>
  );
}

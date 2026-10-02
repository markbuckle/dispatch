import { StatusTile, TileGlyph } from '../status-tile';
import { statusCodeTone } from './status-pill';

// logo/icons/list.svg, the sidebar's Logs glyph
export function LogStatusIcon({ status }: { status: number }) {
  return (
    <StatusTile tone={statusCodeTone(status)}>
      {(id) => (
        <TileGlyph id={id}>
          <circle cx="6" cy="9.5" r="1.4" fill={`url(#${id}-ink)`} stroke="none" />
          <circle cx="6" cy="16" r="1.4" fill={`url(#${id}-ink)`} stroke="none" />
          <circle cx="6" cy="22.5" r="1.4" fill={`url(#${id}-ink)`} stroke="none" />
          <path d="M11.5 9.5 H27" />
          <path d="M11.5 16 H27" />
          <path d="M11.5 22.5 H27" />
        </TileGlyph>
      )}
    </StatusTile>
  );
}

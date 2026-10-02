import { StatusTile, TileGlyph } from '../status-tile';

// logo/icons/webhook.svg, the sidebar's Webhooks glyph; nothing disables a webhook yet, so every row is active
export function WebhookIcon() {
  return (
    <StatusTile tone="success">
      {(id) => (
        <TileGlyph id={id}>
          <path d="M21 9 A5 5 0 1 0 13.5 13.33 L9.07 21" />
          <path d="M20.43 25.33 A5 5 0 1 0 20.43 16.67 L16 9" />
          <path d="M6.57 16.67 A5 5 0 1 0 14.07 21 L22.93 21" />
        </TileGlyph>
      )}
    </StatusTile>
  );
}

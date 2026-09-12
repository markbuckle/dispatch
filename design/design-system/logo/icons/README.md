# Nav glyphs

Nine icons, the sidebar set. Drawn on the same 32-unit grid and 2.25 stroke as the logo mark, so the chrome and the brand are one drawing system.

| File | Nav item | Construction |
|---|---|---|
| `envelope.svg` | Emails | Rounded rect + a single mitred V for the flap. Not a sealed diamond. |
| `template.svg` | Templates | Rounded rect + one horizontal division at 1/3 height. |
| `chart.svg` | Analytics | Three verticals of different heights on a shared baseline. No axes. |
| `globe.svg` | Domains | Circle + one vertical ellipse + one horizontal chord. Three strokes. |
| `list.svg` | Logs | Three horizontals, each with a leading 1.4r dot. |
| `key.svg` | API keys | Circle + shaft with two perpendicular teeth. Teeth are not angled. |
| `webhook.svg` | Webhooks | Two nodes joined by an angled line - the mark's vocabulary, doubled. |
| `gear.svg` | Settings | Circle + six radial ticks. **Not** a toothed cog outline. |
| `avatar.svg` | Account | Circle + an open shoulder arc. |

## Usage

`stroke="currentColor"`, so they inherit. Default in the sidebar is `text-secondary`; an active item goes `text-primary` with a `subtle` row background - **the icon never changes to an accent colour.**

```tsx
<svg viewBox="0 0 32 32" width={18} height={18} fill="none"
     stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
  {/* paste the paths */}
</svg>
```

## Stroke by size

| Rendered | Stroke |
|---|---|
| 24px+ | 2.25 |
| 20px | 2.5 |
| 16px and below | 2.75 |

Thicken as it shrinks - a 2.25 stroke at 16px renders at 1.125 device px and goes mushy. Check every glyph at 16px before accepting it.

## Everything else

Chevrons, close, plus, search, external-link, copy, filter, calendar, sort: **Lucide** at `strokeWidth={2.25}` with `absoluteStrokeWidth`. Don't mix in a second library.

## Never

Filled variants · duotone · a filled icon for an active state · a semantic colour on a nav icon · emoji · an icon where a word would be clearer

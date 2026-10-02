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

## Status tiles

`dispatch-email-sent.svg` is not a nav glyph. It is the source drawing for the status tile that leads a dashboard table row, at 32px, and the one icon that glows: a framed tile, a radial fill and an envelope, drawn on a 598-unit grid.

The file is the green source. The product never uses its hex values: `apps/web/app/dashboard/status-tile.tsx` redraws the tile with every stop on a `.dispatch-status-icon-*` class from `tokens/tokens.css`, tinted by the same tone as the row's pill - success, warning, danger, neutral or off, per `foundations/vocabulary.md`. A green tile beside a Bounced pill would contradict it.

| Table | Glyph | Tone follows |
|---|---|---|
| Emails | the source's own envelope | email status |
| Domains | `globe.svg` | domain status |
| Logs | `list.svg` | status code class |
| API keys | `key.svg` | active or revoked |
| Webhooks | `webhook.svg` | always success, since nothing disables a webhook yet; disabling would bring a visible label with its tone |

A sidebar glyph is scaled into the tile at the envelope's 30-unit stroke, so the nav and the tables read as one set, and takes the envelope's light-to-tinted ink.

The source's grid is redrawn rather than copied. Its five lines a side at 5 units render a quarter of a pixel wide at 32px and disappear, so the product draws three a side at the quarters, 19 units wide - about a pixel. They sit at 17% rather than the source's 20%, because a pixel-wide line at 20% reads as a hard grid rather than a texture. A radial mask keeps them faint behind the glyph and at full strength in the band around it, fading out to nothing just inside the tile's edge.

## Everything else

Chevrons, close, plus, search, external-link, copy, filter, calendar, sort: **Lucide** at `strokeWidth={2.25}` with `absoluteStrokeWidth`. Don't mix in a second library.

## Never

Filled variants · duotone · a filled icon for an active state · a semantic colour on a nav icon · emoji · an icon where a word would be clearer

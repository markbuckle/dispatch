# Iconography

Monoline. One continuous logic, shared with the logo mark.

## The rule

Icons are drawn on a **32-unit grid** with a **2.25 stroke**, round caps, mitred joins where a point is intended. No fills. No two-tone. No filled-and-outlined pairs for active states - an active nav item changes its *colour and background*, not its icon.

| Property | Value |
|---|---|
| Grid | 32 × 32 |
| Stroke | 2.25 at 24px+, 2.5 at 20px, 2.75 at 16px |
| Caps | round |
| Joins | round, except a deliberate point (mitre) |
| Fill | none |
| Colour | `currentColor` |

**Stroke thickens as the icon shrinks.** A 2.25 stroke at 16px renders at 1.125 device px and goes grey and mushy. This is the opposite of what most systems do and it's why the set stays crisp in a 56px collapsed sidebar.

## Sizes by context

| Context | Size |
|---|---|
| Inline with 12px caption | 14px |
| Inline with 16px body | 17px |
| Button icon (42px button) | 18px |
| Sidebar nav icon | **21px** |
| Table row leading tile | 18px in a 38px tile |
| Table row action | 16px |
| Empty state | 24px, `text-muted` |
| Metric tile | 16px |
| Marketing feature | 24px |

18px is the default in product chrome - extracted: the reference renders its nav icons at 18px.

## The nav set

Nine glyphs, in sidebar order. Each is drawn from the same vocabulary: a container plus one gesture.

| Glyph | Construction |
|---|---|
| Envelope | Rounded rect, plus a single V for the flap. Not a sealed diamond. |
| Template | Rounded rect with one horizontal division at 1/3. |
| Chart | Three vertical strokes of different heights on a shared baseline. No axes. |
| Globe | Circle, one vertical ellipse, one horizontal chord. Three strokes, no more. |
| List | Three horizontal strokes, each with a 3-unit leading dot. |
| Key | Circle plus a shaft with two teeth. Teeth are perpendicular, not angled. |
| Webhook | Two nodes joined by an angled line - the mark's node vocabulary, doubled. |
| Gear | Circle plus six radial ticks. **Not** a toothed cog outline. |
| Avatar | Circle plus a shoulder arc. Open at the bottom. |

All nine are drawn: `../logo/icons/`. Each uses `stroke="currentColor"` so it inherits. Check any new glyph at 16px before accepting it.

## Colour

- Default `currentColor`, which means they inherit `text-secondary` in the sidebar and `text-muted` in metadata.
- Active nav item: icon goes `text-primary`, the row gets a `subtle` background. The icon does not change colour to the accent.
- **Never a semantic colour on a nav or action icon.** Semantic colour means status; an icon in the chrome has no status.
- Status icons inside a pill inherit the pill's `fg`.

## The library question

Dispatch draws its own nine nav glyphs so they share the logo's line. For everything else - chevrons, close, plus, search, external-link, copy, filter, calendar, sort arrows - use **Lucide**, set to `strokeWidth={2.25}` and `absoluteStrokeWidth`. Lucide's default 2 is slightly light next to the custom set.

Do not mix a second library. Do not use Heroicons, Feather, Phosphor, or Material alongside Lucide.

## What we never use

- Emoji, on any surface. Not in the product, not in marketing, not in email.
- Filled icon variants.
- Two-tone or duotone icons.
- Coloured icon chips with a wash background (that's a marketing-template pattern, and Dispatch doesn't use it).
- Icons purely as decoration. Every icon labels something or is a control.
- An icon where a word would be clearer. In a dense table, the word wins.

## Divergence from the reference

Extracted: the reference's nav icons are **filled paths, no stroke, on a 400 × 400 viewBox, rendered at 18px**. Dispatch's monoline direction is a genuine departure specified by the brief - it's what ties the icon set to the mark. Only the 18px render size carries over.

## Custom-icon fallback order

1. An existing Dispatch glyph.
2. Lucide at 2.25 stroke.
3. Compose from two Dispatch primitives (a container plus a gesture).
4. Use a word instead.
5. Draw a new one - and add it to this file with its construction note.

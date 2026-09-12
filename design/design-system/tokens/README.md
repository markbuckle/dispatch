# tokens/

Three files, one source of truth.

| File | Use |
|---|---|
| `tokens.json` | W3C design-tokens schema. Feed to Style Dictionary, Figma sync, or any generator. |
| `tokens.css` | **The one you import.** CSS custom properties + a Tailwind v4 `@theme` block + base styles. |
| `tailwind.preset.js` | Tailwind v3 fallback. Skip it on v4. |

## Tailwind v4 (what Dispatch uses)

```css
/* app/globals.css */
@import "tailwindcss";
@import "../design-system/tokens/tokens.css";
```

That registers every token as a utility: `bg-surface`, `text-text-muted`, `border-border-subtle`, `rounded-sm`, `text-h1`, `shadow-overlay`, `duration-fast`, `ease-standard`.

## Theming

Dark is the default on `:root`. Light mode is an override:

```html
<html data-theme="light">
```

Never invert by hand. Never hardcode a hex in a component - if you need a value that isn't here, the system is missing a token, so add it here first.

## Naming

Semantic, never by hue. `--dispatch-border-subtle`, not `--dispatch-slate-3`. The raw `slate-1..12` ramp is exposed for the rare case where you need a specific step, but reach for the semantic name first.

This mirrors what the reference codebase already ships (`border-subtle`, `text-placeholder`, `bg-accent`), so the names should feel native to the engineers consuming them.

## A caution on the dark values

Every dark hex here is **Radix Slate applied by inference** - the authenticated dashboard was captured in light mode. Geometry, radius, motion and spacing are measured; the dark surface colours are not. See `../PROVENANCE.md`.

## Fonts

`Commit Mono` is free (SIL OFL) but not on Google Fonts - download from commitmono.com and self-host, or the stack falls through to Geist Mono. Geist, Inter and Instrument Serif are all on Google Fonts.

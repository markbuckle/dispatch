# Web

Two modes, and they don't mix: **marketing** (air, display type, 96px sections) and **product** (density, 14px, 24px gaps).

## Marketing page structure

```
Nav                64px tall, sticky, canvas bg, .dispatch-rule on scroll
Hero               128px top / 96px bottom padding
Proof              customer logos or one number band, 64px
Feature sections   96px apart, alternating layout, max 4
Code sample        one, real, copyable
Pricing preview    or a link to /pricing
Final CTA          96px band, one action
Footer             .dispatch-rule + .dispatch-glow, then 64px top padding
```

Max 4 feature sections. If there's a fifth, it belongs on its own page.

## Nav

- **64px tall** (`--height-nav-marketing`), `canvas` background, sticky.
- **No rule until scrolled.** At `scrollY === 0` the bottom rule is at `opacity: 0`; past that it fades to `opacity: 1` over 200ms. Use `.dispatch-rule` on a full-bleed 1px element, not a `border-bottom`, so it spans the viewport rather than the container.
- Left: horizontal lockup at 132px.
- Centre or left-adjacent: Product, Docs, Pricing, Changelog, Blog. `body` size, `text-secondary`, `text-primary` on hover. Nav links drop below the `md` breakpoint before the auth actions do.
- Right: "Log in" as a ghost, "Sign up" as `.dispatch-cta` at 12px radius, `12px 8px` padding.
- Mobile: full-screen overlay, not a slide-out drawer. `canvas` background, 20px gutters.

The scroll state is the only thing on the header that needs the client. Keep it in its own small client component so the header itself stays a server component.

## Hero

- **`display-2xl` at 116px in Instrument Serif with `.dispatch-display-gradient`**, one line if possible, two maximum. Sentence case. See `foundations/typography.md`.
- Subcopy `body` `text-secondary`, max 2 lines, max 680px. 24px below the title.
- Two buttons, 40px below the subcopy, 12px apart:
  - Primary "Get an API key": `.dispatch-cta`, `radius-2xl` (16px), `16px 16px` padding.
  - Secondary "Read the docs": ghost, no fill and no border, `text-secondary` to `text-primary` on hover. It must not carry a border, or the two read as equal weight and neither is primary.
- Below: a real code sample or a tight crop of the log table. **Not a hero image, not an illustration, not a floating dashboard mockup at an angle.**
- **No animation above the fold.**

**Neither button is a light fill at rest.** The primary sits dark and inverts to `#EDEEF0` on hover. Weight and border carry the hierarchy instead of fill, which keeps the palette free to mean something.

## Feature sections

Alternate between three layouts so the page has rhythm:

1. **Split** - copy left (max 480px), product screenshot right, 48px gap.
2. **Stacked centred** - overline, `display-m`, one line of body, then a full-width table or code block.
3. **Three-up cards** - `h3` + two lines each, 24px gap, `radius-lg` (12px) is the ceiling.

Every section: `overline` (12px, uppercase, `text-muted`) → 12px → `display-m` → 16px → `body-lg` → 40px → content.

## Pricing page

- Numbers at `display-s`, tabular.
- Three tiers maximum. If enterprise needs a fourth, it's a row below, not a card.
- **Show the number.** "Contact sales" where a price should be is the single most distrusted pattern with this audience.
- Comparison table: `border-subtle` cell dividers, 40px rows, checkmarks as Lucide `Check` at 16px in `text-primary` - not green.

## Docs

- Three columns: 240px nav, fluid content at max 680px, 200px on-page TOC.
- `body` 16px for prose here, not 14px - docs are read, not scanned.
- Code blocks with a language tab bar and a copy button.
- Every endpoint: method + path in mono, then params table, then a real request and response.

## Footer

Opens with a full-bleed `.dispatch-glow` at 160px, then `.dispatch-rule` on top of it. **Glow first in the DOM, rule second** - reversed, the glow eats the middle of the line. Both sit outside the 1200px container.

**Four columns** for a full site: Product · Developers · Company · Legal. `caption` headers in `text-muted`, `body` links in `text-secondary`. Lockup bottom-left, status-page link with a live `success-fg` dot, copyright in `caption` `text-muted`.

**One row** is the right call while the site is small: mark at 20px, three links, the status dot, copyright pushed right. Move to four columns when there is more than one page per column to put in them.

## Product screens

| | |
|---|---|
| Sidebar | 240px expanded / 56px collapsed, `surface` bg, 1px right border |
| Top bar | 48px, `canvas`, bottom hairline, breadcrumb left, search + avatar right |
| Page header | `h1` + one line of `body` `text-muted`, primary action right-aligned |
| Content gutter | 24px |
| Between blocks | 24px |
| Table | full-width, 40px rows |

**Never** put marketing spacing in the product. A dashboard with 96px section gaps looks broken.

## Responsive

| Breakpoint | Behaviour |
|---|---|
| < 480 | Single column, 20px gutters, sidebar becomes a bottom sheet, tables become stacked cards |
| 480–600 | Single column, 24px gutters |
| 600–767 | Two-up cards, sidebar collapses to 56px |
| 767–1024 | Sidebar expanded, tables scroll horizontally |
| > 1024 | Full layout, 1200px max marketing |

**Tables on mobile:** never squeeze columns. Either scroll horizontally with the first column pinned, or restructure each row into a card with the status pill top-right.

## Accessibility

- Focus ring on everything interactive. Never `outline: none` without `focus-visible:shadow-focus`.
- Skip-to-content link, first in the DOM.
- 44px minimum touch target on mobile, even where the visual control is 32px - pad the hit area.
- One `h1` per page, heading levels never skipped.
- `prefers-reduced-motion` honoured globally.
- Status communicated by word, never colour alone.

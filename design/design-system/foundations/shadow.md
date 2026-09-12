# Elevation

**Dark UIs read depth through edges, not shadows.** A drop shadow on a near-black surface is invisible; the only thing that communicates lift is a brighter border and a hairline of inner highlight.

## The scale

| Token | Value | Use |
|---|---|---|
| `none` | `none` | **The default.** Everything, unless listed below. |
| `ring` | `inset 0 0 0 1px rgba(255,255,255,0.03)` | Cards, panels. Pairs with `border-default`. |
| `overlay` | `0 8px 24px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)` | Dropdowns, dialogs, popovers, toasts. **The only permitted drop shadow.** |
| `focus` | `0 0 0 2px var(--canvas), 0 0 0 4px #0090FF` | Focus ring on any interactive element |

## The three elevation levels

| Level | Recipe |
|---|---|
| **0 - flat** | On `canvas` `#08080A`. `border-subtle` hairline if it needs a boundary at all. |
| **1 - card** | `surface` `#0E0E10` bg, `border-default` `#1F2023`, `shadow-ring`. The border stepping up is what does the lifting - the fills are only 6 points apart. |
| **2 - overlay** | `raised` `#131315` bg, `border-strong` `#26262A`, `shadow-overlay`. Reserved for things that float above the page. |

Because the five surface fills sit within 6 points of lightness of each other, **the border is doing nearly all the work.** If a card looks flat, step the border up - don't reach for a lighter fill or a shadow.

There is no level 3.

## Rules

1. **Default is `none`.** If you're adding a shadow, justify it.
2. **Hover changes the border, not the shadow.** `border-default` → `border-strong`, or `surface` → `hover`. Never animate a shadow on hover.
3. **`overlay` only for things that actually overlay.** A card is not an overlay. A table is not an overlay.
4. **No coloured shadows.** No green glow on a success toast, no red on an error dialog.
5. **No inner shadows** beyond the 4% `ring` highlight. No inset bevels on inputs, no pressed-in fields.
6. **No glow, no bloom, no ambient light.** If the design needs the eye pulled somewhere, use contrast or position.

## Why

Extracted: the most common `box-shadow` across the reference is

```
0 0 0 1px rgba(24, 25, 28, 0.88)
```

- sixty occurrences, and it's a **1px ring, not a shadow**. Only ten elements on the page carried a real drop shadow (`0 1px 3px rgba(0,0,0,.1)`), and one carried an inset white highlight. On the authenticated product pages the box-shadow census came back **empty**.

Depth in this category is an edge. Build it that way.

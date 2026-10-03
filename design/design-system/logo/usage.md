# Logo usage

## Inventory

| File | What it is | Use it for |
|---|---|---|
| `mark.svg` | Symbol only, `#EDEEF0` | App chrome, sidebar, favicon source, anywhere the name is already present |
| `mark-inverse.svg` | Symbol only, `#08080A` | On a light fill or a light-mode surface |
| `wordmark.svg` | "Dispatch" only, drawn as outlines | **The site default.** Marketing header, legal pages, 404 |
| `lockup-horizontal.svg` | Symbol + wordmark, side by side | Email footer, deck title slide, docs |
| `lockup-stacked.svg` | Symbol above wordmark | Square or portrait spaces - social avatars, sponsor slides, merch |
| `favicon.svg` | Symbol on a rounded near-black tile | Browser tab, PWA icon, app switcher |
| `monogram-tile.svg` | The wordmark's D, cut out and set on a raised 64px tile | Auth pages, above the page title |

## The concept

One continuous gesture, three ideas:

- **Directional.** A clear start and a clear end. Point A to point B, never a closed or ambiguous shape.
- **Decisive.** It terminates in a sharp, mitred point. It does not trail off or curl.
- **Immediate.** The line is taut. No slack, no ornament, no taper.

A node sits at rest on the left - the item before it moves. A short line under slight tension connects it to a chevron point on the right - the moment of release.

## Construction - read this before redrawing

- **Grid:** 32 × 32. Optical centre at `y = 16`. Ink spans `x = 3.25` to `x = 25.5`.
- **Node:** open circle, `cx 6.5 cy 16 r 3.25`, round cap. **It is not filled.** At small sizes the temptation is to fill it - don't; the openness is what makes it read as an object at rest rather than a bullet.
- **Shaft:** flat horizontal from `x 11` to `x 25.5`. Butt caps, no taper, no curve.
- **Terminus:** `M19.5 10.5 L25.5 16 L19.5 21.5`, `stroke-linejoin: miter`. The mitre is load-bearing - `round` or `bevel` kills the whole idea.
- **Stroke:** 2.25 at 24px and above. 2.5 at 20px. 2.75 at 16px and below. Thicken as it shrinks; never thin it.

### Simplifying choices - do not add these back

The mark has **no** arrowhead fill, **no** motion trail, **no** speed lines, **no** second node, **no** enclosing circle or square (except the favicon tile), and **no** gradient. If a future version appears to be missing something, it isn't. Three elements: circle, line, chevron.

## Clear space

Equal to the diameter of the node (8 units on the 32 grid) on all sides. For the lockups, use the cap height of the "D" - whichever is larger.

## Minimum sizes

| | Web | Print |
|---|---|---|
| Horizontal lockup | 120px wide | 30mm |
| Stacked lockup | 72px wide | 20mm |
| Mark | 16px | 5mm |
| Favicon | 16px | - |

The mark is drawn to survive 16px. Below that, don't scale it - use a solid `#EDEEF0` square with the chevron alone if you truly need a 12px mark.

## Colour variants

| Background | Mark |
|---|---|
| `#08080A` canvas | `#EDEEF0` |
| `#111113` surface | `#EDEEF0` |
| Light `#FFFFFF` | `#08080A` |
| A photograph | `#EDEEF0` over a 40% black scrim - never straight onto the image |
| One-colour print, fax, embroidery | Single solid stroke, weight 2.75, no tonal variation |

The mark is **never** in a semantic colour. Not green for "delivered", not red for an error state. Those colours mean something specific and the logo is not a status.

## What not to do

- Don't stretch, squash, or rotate it.
- Don't fill the node.
- Don't round or bevel the chevron join.
- Don't recolour it outside the table above.
- Don't add a shadow, gradient, or bevel.
- Don't place it on a busy background without a scrim.
- Don't reconstruct it from memory - use these files.
- Don't set the lockup text in anything but Geist Medium at -0.03em, and don't retype the wordmark - use `wordmark.svg`.
- Don't write it as "DISPATCH" or "dispatch". It is **Dispatch**: one word, capital D.

## Per-surface examples

| Surface | Which file | Size |
|---|---|---|
| Marketing header | `wordmark.svg` | 112px wide |
| Landing page, above the footer | `wordmark.svg` in `subtle`, cropped at 244 of 323 units by the footer rule | Full viewport width, inside the page gutter |
| Dashboard sidebar, expanded | `lockup-horizontal.svg` | 108px wide |
| Dashboard sidebar, collapsed | `mark.svg` | 20px |
| Auth pages | `monogram-tile.svg`, as `Monogram` in `apps/web/app/logo.tsx` | 48px tile, D 24px wide |
| Legal and 404 pages | `wordmark.svg` | 132px wide |
| Transactional email header | `lockup-horizontal.svg` as a 2× PNG | 120px wide |
| Deck title slide | `lockup-horizontal.svg` | 240px wide |
| Deck body slides | `mark.svg`, bottom-left, 40% opacity | 18px |
| OG image | `lockup-horizontal.svg` | 180px wide |
| Social avatar | `lockup-stacked.svg` on `#08080A` | 400 × 400 |

## Rasterising

The lockups use live `<text>` so the tracking stays editable; `wordmark.svg` is already outlines. Before any raster export or print handoff, **convert text to outlines** - otherwise a machine without Geist installed silently substitutes a system sans and the tracking collapses.

# Logo usage

## Inventory

| File | What it is | Use it for |
|---|---|---|
| `mark.svg` | Symbol only, `#EDEEF0` | App chrome, sidebar, favicon source, anywhere the name is already present |
| `mark-inverse.svg` | Symbol only, `#08080A` | On a light fill or a light-mode surface |
| `wordmark.svg` | "Dispatch" only | Tight horizontal spaces where the symbol would be under 16px |
| `lockup-horizontal.svg` | Symbol + wordmark, side by side | **The default.** Site header, email footer, deck title slide, docs. |
| `lockup-stacked.svg` | Symbol above wordmark | Square or portrait spaces — social avatars, sponsor slides, merch |
| `favicon.svg` | Symbol on a rounded near-black tile | Browser tab, PWA icon, app switcher |

## The concept

One continuous gesture, three ideas:

- **Directional.** A clear start and a clear end. Point A to point B, never a closed or ambiguous shape.
- **Decisive.** It terminates in a sharp, mitred point. It does not trail off or curl.
- **Immediate.** The line is taut. No slack, no ornament, no taper.

A node sits at rest on the left — the item before it moves. A short line under slight tension connects it to a chevron point on the right — the moment of release.

## Construction — read this before redrawing

- **Grid:** 32 × 32. Optical centre at `y = 16`. Ink spans `x = 3.25` to `x = 25.5`.
- **Node:** open circle, `cx 6.5 cy 16 r 3.25`, round cap. **It is not filled.** At small sizes the temptation is to fill it — don't; the openness is what makes it read as an object at rest rather than a bullet.
- **Shaft:** flat horizontal from `x 11` to `x 25.5`. Butt caps, no taper, no curve.
- **Terminus:** `M19.5 10.5 L25.5 16 L19.5 21.5`, `stroke-linejoin: miter`. The mitre is load-bearing — `round` or `bevel` kills the whole idea.
- **Stroke:** 2.25 at 24px and above. 2.5 at 20px. 2.75 at 16px and below. Thicken as it shrinks; never thin it.

### Simplifying choices — do not add these back

The mark has **no** arrowhead fill, **no** motion trail, **no** speed lines, **no** second node, **no** enclosing circle or square (except the favicon tile), and **no** gradient. If a future version appears to be missing something, it isn't. Three elements: circle, line, chevron.

## Clear space

Equal to the diameter of the node (8 units on the 32 grid) on all sides. For the lockups, use the cap height of the "D" — whichever is larger.

## Minimum sizes

| | Web | Print |
|---|---|---|
| Horizontal lockup | 120px wide | 30mm |
| Stacked lockup | 72px wide | 20mm |
| Mark | 16px | 5mm |
| Favicon | 16px | — |

The mark is drawn to survive 16px. Below that, don't scale it — use a solid `#EDEEF0` square with the chevron alone if you truly need a 12px mark.

## Colour variants

| Background | Mark |
|---|---|
| `#08080A` canvas | `#EDEEF0` |
| `#111113` surface | `#EDEEF0` |
| Light `#FFFFFF` | `#08080A` |
| A photograph | `#EDEEF0` over a 40% black scrim — never straight onto the image |
| One-colour print, fax, embroidery | Single solid stroke, weight 2.75, no tonal variation |

The mark is **never** in a semantic colour. Not green for "delivered", not red for an error state. Those colours mean something specific and the logo is not a status.

## What not to do

- Don't stretch, squash, or rotate it.
- Don't fill the node.
- Don't round or bevel the chevron join.
- Don't recolour it outside the table above.
- Don't add a shadow, glow, gradient, outline, or bevel.
- Don't animate the mark. (The one exception: a loading state may fade the node at 120ms — no travelling, no drawing-on.)
- Don't place it on a busy background without a scrim.
- Don't reconstruct it from memory — use these files.
- Don't set the wordmark in anything but Geist Medium at -0.03em.
- Don't write it as "DISPATCH" or "dispatch". It is **Dispatch**: one word, capital D.

## Per-surface examples

| Surface | Which file | Size |
|---|---|---|
| Marketing header | `lockup-horizontal.svg` | 132px wide |
| Dashboard sidebar, expanded | `lockup-horizontal.svg` | 108px wide |
| Dashboard sidebar, collapsed | `mark.svg` | 20px |
| Auth card | `lockup-stacked.svg` | 88px wide |
| Transactional email header | `lockup-horizontal.svg` as a 2× PNG | 120px wide |
| Deck title slide | `lockup-horizontal.svg` | 240px wide |
| Deck body slides | `mark.svg`, bottom-left, 40% opacity | 18px |
| OG image | `lockup-horizontal.svg` | 180px wide |
| Social avatar | `lockup-stacked.svg` on `#08080A` | 400 × 400 |

## Rasterising

The wordmark and lockups use live `<text>` so the tracking stays editable. Before any raster export or print handoff, **convert text to outlines** — otherwise a machine without Geist installed silently substitutes a system sans and the tracking collapses.

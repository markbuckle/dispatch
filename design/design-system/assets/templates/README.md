# assets/templates/

| File | Use |
|---|---|
| `marp-theme.css` | Marp deck theme. 1920×1080, dark, all type ≥24px. Classes: `section`, `statement`, `number`, `two-up`, `full-bleed`, `title`. |
| `og-image.svg` | 1200×630 social card. Swap the two text nodes. |

## Decks

```bash
marp deck.md --theme design-system/assets/templates/marp-theme.css -o deck.pdf
```

```markdown
---
marp: true
theme: dispatch
paginate: true
---
<!-- _class: title -->
# Email that arrives.
Delivery observability for developers

---
<!-- _class: section -->
# 01 - The problem

---
<!-- _class: number -->
# 71%
of marketing email breaks in Outlook 2016
```

See `../../applications/presentations.md` for the slide-type system.

## OG images

Edit the two text nodes in `og-image.svg`, then **outline the text before rasterising** - a machine without Geist installed silently substitutes a system sans and the tracking collapses.

```bash
# with resvg, after outlining
resvg --width 1200 og-image.svg og-image.png
```

Headline: max 2 lines. Blog posts use the post title at `display-m` with no subcopy.

## Patterns

`../patterns/grid.svg` - 32px dot grid, max 40% opacity, never behind body copy.
`../patterns/hairline.svg` - 1200px section rule, fades at both ends.

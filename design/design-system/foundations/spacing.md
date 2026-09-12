# Spacing

**4px base.** Every gap, pad and margin is a multiple of 4.

## The scale

| Token | Value | Typical use |
|---|---|---|
| `0` | 0 | Flush |
| `1` | 4px | Icon-to-label, dot-to-text inside a pill |
| `2` | 8px | **Product default.** Gap between controls in a row. |
| `3` | 12px | Table cell padding, button horizontal padding |
| `4` | 16px | Card padding on compact surfaces, form field gap |
| `5` | 20px | Card padding, dialog padding |
| `6` | 24px | **The dominant step.** Gap between related blocks. |
| `8` | 32px | Gap between unrelated blocks in a product page |
| `10` | 40px | Table row height, button height on marketing |
| `12` | 48px | Page header to content |
| `16` | 64px | Small marketing section |
| `20` | 80px | Marketing section |
| `24` | 96px | **Marketing section default.** |
| `32` | 128px | Hero top and bottom |

Extracted counts back this up: 24px was the most-used value on both marketing pages (118 and 97 uses), 96px the section rhythm (14 and 23). In the product, gaps tighten to 8px (24 uses) and 4px (17).

## Two densities

**Product** - 8px between controls, 12px cell padding, 20px card padding, 24px between blocks. The user is scanning; every 4px you add is a row they can't see.

**Marketing** - 24px within a block, 96px between sections, 128px around the hero. Here the air is the point.

Never mix the two on one surface. A dashboard with 96px section gaps looks broken; a landing page with 8px gaps looks like a spreadsheet.

## Section rhythm - marketing

```
overline           12px caption, text-muted
  ↓ 12px
h2                 display-m
  ↓ 16px
body               body-lg, text-secondary, max 680px
  ↓ 40px
content            cards / table / image
  ↓ 96px
next section
```

## Grid and containers

| | |
|---|---|
| Marketing max width | 1200px |
| Reading max width | 680px |
| Dialog | 520px |
| Dashboard content | fluid, 24px page gutter |
| Gutter, mobile | 20px |
| Gutter, desktop | 32px |
| Columns | 12, 24px gap |
| Sidebar | 240px expanded, 56px collapsed |
| Top bar | 48px |

Breakpoints: `480 · 600 · 767 · 1024 · 1280`. The first three are extracted from the reference; the last two are conventional and added.

## Internal padding

Measured off the product in dark mode. These are the numbers, not approximations.

| Element | Padding | Height |
|---|---|---|
| Button, product | `0 16px` | **42px** |
| Button, marketing hero | `16px 16px` | **44px**, from padding not a fixed height |
| Button, marketing header | `12px 8px` | **36px**, from padding not a fixed height |
| Button, small | `0 13px` | 34px |
| Icon button | - | 42px square |
| Input, select | `0 16px` | **44px** |
| Textarea | `12px 16px` | auto, min 80px |
| Table cell | `0 20px` | row **60px** |
| Table header cell | `0 20px` | **48px** |
| Sidebar nav item | `0 12px` | **44px** |
| Workspace switcher | `0 10px` | 46px |
| Top bar, product | `0 30px` | **60px** |
| Header, marketing | `0 20px` mobile / `0 32px` desktop | **64px** |
| Dense table row (records, issues) | `0 20px` | 52px |
| Card | `20px` | - |
| Card, compact | `16px 18px` | - |
| Dialog | `20px`, header/footer `15px 20px` | - |
| Status pill | `0 10px` | **26px** |
| Leading status tile | - | 34px square |
| Sidebar nav item | `0 12px` | **40px** |
| Workspace switcher | `0 8px` | 42px |
| Dropdown item | `0 12px` | 34px |
| Tab | `0 16px` | 38px |
| Toast | `14px 16px` | - |
| Status pill | `0 11px` | **28px** |
| Tooltip | `7px 10px` | - |

### Frame geometry

| | |
|---|---|
| Sidebar | **252px** expanded, 56px collapsed |
| Top bar | **56px** |
| Page gutter | 28px |
| Page title to content | 24px |

The product is **airier than the marketing pages implied.** An earlier draft of this file built product density off the pricing page - 32px controls, 40px rows, 24px gutters. The real product runs 38–40px controls and 56px rows. Dense still, but not cramped.

## One known drift

The built product screens set their page-level section gap to **26px**, which is not on the 4px grid and is not a token. It is build drift, not a system value - the correct token is `6` (24px). Anything new uses 24px; the screens should be corrected to match rather than the scale widened to accommodate them.

## Four rules

1. **Group with space before you group with a line.** A hairline is a last resort for when spacing alone leaves the grouping ambiguous. The reference's own tables prove this works - one 1px bottom border per row and nothing else.
2. **Vertical rhythm beats horizontal symmetry.** Consistent vertical steps matter more than perfectly centred columns.
3. **Related things get 8px; unrelated things get 24px.** If you can't decide which, the hierarchy isn't resolved yet.
4. **Never a value off the scale.** No 15px, no 18px, no 30px. If something needs 18px, it needs 16 or 20.

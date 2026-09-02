# Infographics and diagrams

Diagrams are drawn with the system's own primitives — surfaces, hairlines, monoline icons, mono labels. **There is no separate illustration style**, and inventing one is the failure mode here.

## Canvas sizes

| Use | Size |
|---|---|
| In a marketing page | 1200 × auto, transparent or `canvas` |
| Standalone / social | 1200 × 1200 |
| In a deck | 1728 × 800 (fits 1920 with margins) |
| In docs | 680 × auto |
| Print / poster | 300dpi, tokens scaled ×3 |

## Building blocks

| Element | Spec |
|---|---|
| Node / box | `surface` bg, `border-default`, `radius-md`, 16px padding |
| Emphasised node | `subtle` bg, `border-strong` |
| Connector | 1px `border-strong`, straight or one 90° turn. Never a curve, never a bezier. |
| Arrowhead | The mark's chevron: 6px, mitred, `border-strong` |
| Label on a connector | `caption` `text-muted`, on a `canvas` chip so it doesn't collide with the line |
| Node label | `body` 14px `text-primary` |
| Node sublabel | `caption` `text-muted` |
| Group boundary | 1px dashed `border-subtle`, `radius-lg`, label top-left in `overline` |
| Sequence number | Mono 12px in a 20px `subtle` circle |

Connectors reuse the logo's vocabulary deliberately: a node, a taut line, a sharp point. The diagrams and the mark are the same drawing system.

## Flow diagram — the canonical one

```
  POST /emails          Queue              Send            Delivered
  ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
  │ your app │ ──▸  │ dispatch │ ──▸  │   MTA    │ ──▸  │  inbox   │
  └──────────┘      └──────────┘      └──────────┘      └──────────┘
                          │                 │
                          │                 └──▸ ┌──────────┐
                          │                      │ bounced  │  danger-fg
                          │                      └──────────┘
                          └──▸ webhook
```

Left to right for a process. Top to bottom for a hierarchy. Never radial, never circular, never an infinity loop.

## Charts

| Type | When |
|---|---|
| Line | A value over time |
| Bar | Comparing categories |
| Horizontal bar | Comparing categories with long labels |
| Stacked bar | Composition over time — max 4 segments |
| Sparkline | A trend inside a table row or metric tile |
| Table | **Usually the right answer.** If there are fewer than 8 data points, a table beats a chart. |

**Never:** pie, doughnut, radar, gauge, treemap, word cloud, 3D anything, dual-axis.

Series colours in order: `info-fg #70B8FF`, `success-fg #3DD68C`, `warning-fg #FFCA16`, `danger-fg #FF9592`. A single-series chart uses `text-secondary`, not a colour — one series needs no colour coding.

- Gridlines: horizontal only, `border-subtle`, and only if exact values matter.
- Axis labels: `caption` `text-muted`, tabular.
- Direct labels beat legends wherever they fit.
- Y-axis starts at zero for bars. Always.
- Annotate the interesting point rather than expecting the reader to find it.

## Comparison tables

The most-used graphic in this brand, and the most persuasive for this audience.

- `Th` in `caption` `text-muted`, 32px tall.
- 40px rows, `border-subtle` dividers.
- Dispatch's column gets `subtle` bg. **Not a coloured highlight, not a "recommended" badge.**
- Checkmarks: Lucide `Check` 16px in `text-primary`. Absences: an en dash in `text-muted`. **Never a green tick and a red cross** — it reads as a sales asset.
- Every claim about a competitor must be verifiable and dated. Put the date in a footnote.

## Titles

The title is the conclusion, not the subject.

- ✅ "Bounce rate fell 3.3 points after DMARC was fixed"
- ❌ "Bounce rate over time"

## Never

Isometric anything · a drop shadow · a gradient fill · an icon inside a coloured circle · hand-drawn arrows · a funnel diagram · concentric circles labelled with buzzwords · a world map with glowing arcs (we have four regions; list them) · clip art · a chart with more than 4 series

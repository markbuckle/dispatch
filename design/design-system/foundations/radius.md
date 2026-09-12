# Radius

Modest, but not tight. Nothing bubbly, nothing severe.

| Token | Value | Applies to |
|---|---|---|
| `none` | 0 | Table cells, full-bleed sections, code block interiors, the logo |
| `xs` | 4px | Checkbox, a chip nested inside a 9px parent |
| `sm` | **8px** | Status pills, event chips, `kbd` badges, inline code |
| `chip` | **9px** | Small buttons, copy buttons, avatar squares |
| `md` | **11px** | Inputs, selects, tabs, sidebar nav items, icon buttons, leading tiles |
| `lg` | **12px** | Cards, tables, panels, alert banners, dialogs, popovers, the header call to action |
| `2xl` | **16px** | The marketing hero call to action. Nothing else. |
| `full` | 9999px | Avatars, status dots, the spinner, the switch track. Nothing else. |

**This table was out of sync with `tokens/tokens.css` and has been corrected to match it.** It previously listed `sm` 7, `md` 9, `lg` 10 and a separate `xl` 12, none of which were the values the build actually shipped. `tokens.css` is the source of truth; `tokens.json` and `tailwind.preset.js` now mirror it.

## The three rules

1. **Product controls are 9px.** Buttons, inputs, selects, nav items. Containers go one step up to 12px.
2. **Full-pill is for avatars and dots.** Not buttons, not status pills, not tabs, not tags. Resend rounds its buttons to a pill; we do not, and that is deliberate.
3. **Marketing calls to action are rounder than product controls.** 16px in the hero, 12px in the header. The hero button is physically larger, so it carries the rounder corner without looking bubbly; the same 16px on a 36px header button does not.

## Nesting

An inner element steps **down** one token from its parent: a 9px input inside a 10px card, a 7px pill inside a 9px control, a 4px chip inside a 7px pill. Never equal, never larger - a child matching its parent's radius produces a visible mismatch where the two corners meet.

## What we measured, and the two corrections

This scale has been revised twice, both times by better evidence.

**First pass** used the *marketing* pages: 16px buttons (61–68 uses) and full-pill (191–198 uses). Rejected as too soft for a dense table.

**Second pass** used the authenticated product's declared variables - `--radius-sm .25rem`, `--radius-md .375rem`, `--radius-lg .5rem` (4/6/8) - and adopted 4/6/8/12.

**Third pass** measured the product *rendered in dark mode*, which is what actually ships: **7px ×17, 9px ×22, 10px ×5**. The declared Tailwind variables weren't the ones the components use - most controls carry an explicit arbitrary value. So the scale is now 4 / 7 / 9 / 10 / 12.

The lesson worth keeping: **declared tokens and rendered values diverge.** Measure the rendered page.

## Exceptions

- **Avatar** - `full`, always. Square avatars read as logos.
- **Workspace switcher avatar** - 7px rounded square. It's a workspace, not a person.
- **Status dot** - `full`, 5px.
- **The logo** - no radius, ever. The favicon tile is 6px; the mark itself is untouched.
- **Images on a surface** - `lg`. Full-bleed images get `none`.
- **Charts and sparklines** - `none`. Clipping a chart's corners loses data.

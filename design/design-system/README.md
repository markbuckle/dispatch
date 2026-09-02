# Dispatch — Design System

**Email API for developers.** Dark-mode first. Every token maps to Radix Colors and Tailwind v4.

```
design-system/
├── README.md                  ← you are here
├── CLAUDE.md                  ← LLMs read this FIRST
├── BRAND-SUMMARY.md
├── PROVENANCE.md              ← what is measured vs inferred
├── DECISIONS.md               ← the reasoning behind the values
├── foundations/
│   ├── brand.md  voice.md  vocabulary.md
│   ├── color.md  typography.md  spacing.md  radius.md  shadow.md  motion.md
│   └── iconography.md  imagery.md
├── tokens/
│   ├── tokens.json            W3C design tokens
│   ├── tokens.css             CSS custom properties + Tailwind v4 @theme
│   └── tailwind.preset.js     v3 fallback preset
├── logo/
│   ├── mark.svg  mark-inverse.svg  wordmark.svg
│   ├── lockup-horizontal.svg  lockup-stacked.svg  favicon.svg
│   └── usage.md
├── components/                React + Tailwind starters
├── voice/
│   ├── examples.md  homepage-copy.md
├── applications/
│   ├── web.md  presentations.md  email.md
│   ├── social-linkedin.md  social-instagram.md
│   ├── infographics.md  ads.md
└── assets/
    ├── patterns/              grid.svg  hairline.svg
    └── templates/             marp-theme.css  og-image.svg  README.md
```

## Quick start

| I'm building… | Read |
|---|---|
| A dashboard screen | `CLAUDE.md` → `tokens/tokens.css` → `foundations/color.md` → `components/` |
| A landing page | `applications/web.md` → `voice/homepage-copy.md` |
| Anything with the logo | `logo/usage.md` — read the construction notes before redrawing |
| Changing a token | `DECISIONS.md` first — several values look wrong in isolation and are deliberate |
| Copy of any kind | `foundations/voice.md` → `foundations/vocabulary.md` → `voice/examples.md` |
| A deck | `applications/presentations.md` (Marp theme included) |
| A transactional email | `applications/email.md` |

## The system in eight lines

1. **Dark first.** `#08080A` canvas, `#111113` surfaces. Light mode is a mirror, not the default.
2. **Monochrome base.** Colour appears only to carry meaning — status, log level, validation. There is no brand accent.
3. **Borders, not shadows.** Depth on dark reads through edge contrast. `box-shadow` is for overlays only.
4. **Weight over colour.** The primary action is a light fill on near-black. Emphasis comes from weight and contrast.
5. **Space over dividers.** Group with spacing first; add a hairline only when spacing alone is ambiguous.
6. **14px is the product baseline.** 12px captions. Marketing display starts at 28px.
7. **Radii stay modest.** 4 / 6 / 8 / 12. Full is for avatars only. Nothing is bubbly.
8. **Motion is functional.** 120ms for hover and colour, 200ms for overlays. No bounce, no spring, no decoration.

## Density is the point

The user is technical, impatient, and reading a table of delivery statuses at 11pm. When a decision is between "more air" and "more rows visible", pick more rows. Whitespace is not a virtue here — legibility is.

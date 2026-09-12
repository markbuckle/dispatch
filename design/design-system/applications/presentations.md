# Presentations

1920 × 1080. Dark. **Minimum text size 24px** - and that's a floor, not a target.

## Slide types

| Type | Recipe |
|---|---|
| **Title** | Lockup at 240px, `display-xl` title, one line of `display-s` `text-secondary` subtitle, date in `caption` bottom-left |
| **Section break** | `display-l` centred on `surface` bg (the one background change permitted), section number in mono top-left |
| **Statement** | One sentence at `display-l`, max 12 words, centred, nothing else on the slide |
| **Number** | One figure at 200px tabular, label at `display-s` below, source in `caption` |
| **Bullets** | `display-m` title, max 4 bullets at 32px, 32px apart, no icons |
| **Two-up** | Title, then two 880px columns with a 48px gap |
| **Table** | Max 6 rows, 5 columns. 48px rows, 28px text. |
| **Chart** | One chart, one message. Title states the takeaway, not the metric. |
| **Screenshot** | Full-bleed or on `surface` with `border-default`. 2× resolution minimum. |
| **Code** | Max 12 lines at 28px mono. If it needs more, it needs a different slide. |
| **Closer** | `display-l` one line, contact in `body-lg`, lockup |

## Type on slides

| Element | Size |
|---|---|
| Title slide headline | 96px |
| Section break | 72px |
| Slide title | 56px |
| Statement | 64px |
| Body / bullets | 32px |
| Table cell | 28px |
| Caption / source | 24px |
| Big number | 200px |

Geist for anything 48px and up, Inter below that. Nothing under 24px, ever - including footnotes and sources.

## Layout

- **Margins:** 96px left and right, 80px top, 96px bottom.
- **Baseline grid:** 12 columns, 48px gutters.
- **One idea per slide.** If the title needs "and", it's two slides.
- **Slide numbers:** `caption` `text-muted`, bottom-right. Not on the title slide.
- **Mark:** `mark.svg` at 18px, 40% opacity, bottom-left on body slides. Not on title or section breaks.

## Colour on slides

Backgrounds: `canvas` `#08080A` for body slides, `surface` `#111113` for section breaks. **Two backgrounds for the whole deck, maximum.**

Colour appears only in: chart series, status pills in a screenshot, one number that needs emphasis. A slide title is never coloured.

## Charts

- One message per chart. The title is the conclusion: "Bounce rate fell 3.3 points after DMARC" - not "Bounce rate over time".
- Series colours from the semantic set, in order: `info-fg`, `success-fg`, `warning-fg`, `danger-fg`. Beyond four series, reconsider the chart.
- No gridlines unless reading exact values matters. Then `border-subtle` only, horizontal only.
- Label data points directly. No legends where a direct label fits.
- No 3D, no shadows, no gradient fills, no doughnut charts.
- Axis labels 24px `text-muted`.

## What decks never contain

Stock photography · clip art · icon-per-bullet · animated transitions between slides · build-in animation per bullet · "Thank you" slide with nothing on it · an agenda slide for a deck under 10 slides · a slide that's a wall of text read aloud · company logo on every slide at full opacity · drop shadows on anything

## Marp theme

`../assets/templates/marp-theme.css` is included. Author in Markdown:

```markdown
---
marp: true
theme: dispatch
paginate: true
---

# Email that arrives.
Delivery observability for developers

---
<!-- _class: section -->
# 01 - The problem

---
## 71% of marketing email breaks in Outlook 2016

We checked 40,000 sends. Most failures were one CSS property.
```

Classes available: `section`, `statement`, `number`, `two-up`, `full-bleed`.

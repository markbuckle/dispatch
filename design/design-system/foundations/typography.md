# Typography

Four faces, each with one job. **Inter does almost all the work.**

| Face | Job | Notes |
|---|---|---|
| **Inter** | The entire product UI, and marketing body copy | Extracted: every button, link and caption on the reference resolves to Inter |
| **Geist** | Marketing display and the wordmark | Display sizes only — never below 24px |
| **Commit Mono** | API keys, IDs, code, DNS records, HTML in the compatibility checker | Free (SIL OFL), self-hosted. Falls back to Geist Mono. |
| **Instrument Serif** | The marketing hero title, and nothing else | Once per page, or not at all. The product never uses it. One weight only, 400. |

## The scale

| Token | Size | Weight | Line height | Tracking | Face |
|---|---|---|---|---|---|
| `display-2xl` | **116px** | **400** | 1.00 | -0.02em | Instrument Serif |
| `display-xl` | 76px | 500 | 1.00 | -0.02em | Geist |
| `display-l` | 56px | 500 | 1.05 | -0.03em | Geist |
| `display-m` | 36px | 500 | 1.10 | -0.025em | Geist |
| `display-s` | 28px | 500 | 1.15 | -0.02em | Geist |
| `h1` | **36px** | 600 | 1.15 | -0.032em | Geist |
| `h2` | 24px | 600 | 1.25 | -0.02em | Inter |
| `h3` | 20px | 600 | 1.30 | -0.015em | Inter |
| `h4` | 16px | 600 | 1.40 | -0.005em | Inter |
| `body` | **16px** | 400 | 1.50 | 0 | Inter |
| `meta` | **15px** | 400 | 1.50 | 0 | Inter |
| `mono` | 13.5px | 450 | 1.50 | 0 | Commit Mono |
| `pill` | 14.5px | 500 | 1.30 | 0 | Inter |
| `micro` | 11px | 500 | 1.20 | +0.02em | Inter / Commit Mono |
| `caption` | 12px | 500 | 1.35 | +0.02em | Inter |
| `overline` | 12px | 500 | 1.35 | +0.06em, uppercase | Inter |

## 16px is the product baseline

**Corrected.** The light-mode capture measured 14px dominant, and this file said so — including the claim that no 13px tier existed. Measuring the product **rendered in dark mode** gave a different answer: **15px** is the most-used content size, with **13px** carrying mono metadata and dense secondary rows, and the page title at **32px**, not 24px.

So the product scale is: page title **36** · card title 17 · body and table cells **16** · table headers and secondary metadata **15** · mono **13.5** · captions and overlines 12.

**Corrected twice.** The light-mode capture measured 14px dominant; the dark-mode measurement gave 15px; matching the rebuilt screens against the reference moved it to 16px with a distinct 15px metadata tier. Each correction went the same direction, which is the tell: a dark theme at a larger optical size needs more, not less.

Two lessons kept from the correction:

1. **A theme change moves the type scale**, not just the colours. The dark build is a point larger throughout.
2. **The claim "there is no 13px tier" was an over-read** of one capture. There is one, at 13.5px, and it is where mono lives.

## Tracking flips with size

This is the single most important typographic behaviour in the system, and it's extracted, not invented.

- **Display sizes get negative tracking.** Up to -0.03em. At large sizes the default spacing looks loose and amateur. The reference runs -0.05em at 56px.
- **Small UI text gets slightly positive tracking.** +0.02em at 12px. Tight tracking at small sizes on a dark background closes up the counters and legibility drops. The reference runs +0.3px at 12px and +0.35px at 14px.
- **15–16px body sits at zero.** Inter is already optically spaced for this range.

## Rules

0. **`micro` is not a reading size.** 11px is for avatar initials, `kbd` glyphs and provenance badges — a glyph or two inside a shaped container, never a sentence. If a user has to read it, the floor is `caption` at 12px.
1. **Sentence case for every headline.** No Title Case. ALL CAPS only in the `overline` token, three words maximum.
2. **Three sizes per screen, maximum.** A dashboard screen is typically `h1` + `body` + `caption`. If you need a fourth, you probably need a different layout.
3. **Line length 60–80 characters** for body copy. `--container-reading: 680px` at 16px lands in that band.
4. **Weights: 400, 500, 600.** 400 body, 500 UI labels and captions, 600 headings. **700 is not in the system** — on a dark canvas, 600 already reads heavier than it would on white.
4b. **Never let the browser synthesise a weight.** `display-2xl` is declared at 400 because Instrument Serif ships nothing heavier. Asking for 500 or 600 makes the engine fake it, which thickens the hairlines along with the stems and destroys the stroke contrast that is the whole reason for the face. If a display title needs more weight, it needs a different face, not a bolder number.
5. **No italics in the product UI.** Instrument Serif italic is allowed for a single marketing pull quote.
6. **No text shadow. Ever.**
7. **Tabular numerals for anything in a column.** `font-variant-numeric: tabular-nums` on timestamps, counts, durations, status codes, byte sizes. Proportional digits make a column of numbers unscannable.
8. **Mono for anything a developer would copy.** Keys, IDs, DNS records, headers, paths, status codes, durations. If they'd paste it into a terminal, it's mono.

## Pairings

| Context | Pairing |
|---|---|
| Marketing hero | `display-2xl` Instrument Serif + `.dispatch-display-gradient`, then `body` Inter `text-secondary` |
| Marketing section | `overline` + `display-m` + `body-lg` |
| Product page header | `h1` + `body` muted |
| Card | `h3` + `body` secondary |
| Table | `caption` header + `body` cell + `caption` muted metadata |
| Metric tile | `caption` overline label + `display-s` tabular value + `caption` delta |
| Empty state | `h3` + `body` secondary, one line each |
| Code block | `mono` on `canvas`, `mono-sm` for line numbers in `text-muted` |
| Slide title | `display-l` Geist |
| Slide body | `h2` or `body-lg` — never below 24px on a 1920×1080 slide |

## The marketing hero title

One per page, and only on marketing. The recipe:

```html
<h1 class="dispatch-display-gradient font-serif text-display-2xl">Email for developers</h1>
```

- `display-2xl` is 116px / 1.00 / -0.02em / 400, set in Instrument Serif.
- `.dispatch-display-gradient` runs `text-primary` down to `text-secondary`, holding solid to 45% so the top half stays bright. Defined in `tokens/tokens.css`.
- The element stays a real `h1`. The gradient works by painting transparent text over a clipped background, so the text itself is still there for a screen reader and for select-and-copy.
- Sentence case, like every other heading. One line if it fits, two at the outside.

At 116px in a 1200px container this holds one line up to roughly 20 characters. Past that it wraps, which is fine - it is not a reason to shrink the token.

## Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Geist:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap">
```

Commit Mono is not on Google Fonts — build a custom instance at commitmono.com and self-host.

### Dispatch's Commit Mono build

| Setting | Value | Why |
|---|---|---|
| Weight | **450** | Light-on-dark thins the perceived stroke. 400 goes anaemic at 12–13px in `text-secondary`; 450 optically matches Inter 400 beside it. One weight only — mono is never bold in this system. |
| Letter spacing | **0%** | Tracking is a token (`mono` 0, `caption` +0.02em). Baking it into the font fights the scale. |
| Line height | **1** | Also a token — 1.5 for `mono`, 1.4 for `mono-sm`. A baked 1.5 breaks the 40px table row. |
| `ss01` ligatures | **OFF** | `!=` → a single glyph is fine in an editor, wrong in a product that renders API keys, DNS records and hashes. Never substitute glyphs in a string the user will copy. |
| `ss02` arrows | **OFF** | Same reason. |
| `ss03` smart case | **ON** | Centres punctuation between digits: `14:02:37`, `p99`, `1:1`. Directly improves our timestamps and ratios. |
| `ss04` symbol spacing | **OFF** | Adjusts advance width. Breaks column alignment. |
| `ss05` smart kerning | **OFF** | Kerning defeats the monospace grid — tabular columns stop lining up. |
| `cv03` square dots | **ALT** | Round dots at 12px on `#08080A` disappear. Square dots also sit with the geometric icon set. |
| `cv05` standard @ | **ALT** | This is an email product. `@` appears in nearly every table row; the default's compact form is less recognisable at 13px. |
| `cv07` dotted 0 | **ALT** | The highest-value choice in the list. `0` vs `O` in `dsp_live_8Kq2vR7nWxT4mJhB1cYzA0`. Dotted over slashed — a slash at 12px reads as a strikethrough. |
| `cv10` alt l | **ALT** | Tailed `l`, so `l`/`1`/`I` are three distinct shapes. |
| All other `cv*` | **DEF** | Double-storey `a` and `g` are more legible than the single-storey alts. We never set mono italic. |

The built font lives at `../assets/fonts/CommitMono-dispatch.woff2` — the **variable** instance, so one file covers the whole axis and `font-weight: 450` resolves natively.

```css
@font-face {
  font-family: "Commit Mono";
  src: url("/fonts/CommitMono-dispatch.woff2") format("woff2-variations");
  font-weight: 200 700;
  font-display: swap;
}

.font-mono, code, pre, [class*="font-mono"] {
  font-weight: 450;
  font-feature-settings: "ss03", "cv03", "cv05", "cv07", "cv10";
}
```

Two things that will bite:

1. **Declare `font-weight: 200 700`, not `450`.** It's a variable file; pinning the descriptor to a single value makes some engines synthesise instead of interpolating.
2. **Set the features in CSS anyway.** The customiser bakes them into the default, but an explicit `font-feature-settings` survives a fallback to the stock face and documents intent in the codebase.

The 43 static `.otf` files in the download are for your OS and editor — install `450-Regular` locally so your terminal matches the product. The web only needs the one `.woff2`.

The reference product ships `--font-mono: "commitMono", ui-monospace, SFMono-Regular, Menlo, …` — extracted, so this is the same face they use.

Self-host Inter and Geist too in production. `display=swap` on a dark canvas causes a visible reflow that reads as jank.

## When not to use Geist

Anywhere under 24px. Geist's tight display tracking and narrow apertures make it worse than Inter at UI sizes. If a heading needs to be 20px, it's `h2` in Inter — not shrunken Geist.

## The licensed faces we couldn't use

The reference sets display type in **Domaine** with **ABC Favorit** secondary, both self-hosted and both commercially licensed. Geist replaces them: comparable optical weight at 56px, an actual mono companion, and free.

# Colour

Dark first. The base is monochrome. **Colour appears only to carry meaning.**

That last sentence is the whole system. If you are reaching for a colour and it isn't communicating a delivery state, a log level, or a validation result, the answer is a neutral.

## Provenance

The dark palette below is **measured** from the authenticated product in dark mode. Earlier drafts of this file inferred it from Radix Slate; those values were close in structure but wrong in detail - the real product runs a **near-neutral, slightly warm-black ramp**, not Radix's cool-tinted Slate. The measured values replaced the inferred ones. Light mode is still inferred.

## No brand hue - a deliberate departure

Most systems have a primary brand colour. Dispatch doesn't. Reasons:

1. A dashboard whose chrome is green cannot then use green to mean "delivered".
2. Emphasis is available for free through weight and contrast on a dark canvas.
3. Restraint is the brand. A tool that doesn't decorate itself reads as confident.

Blue `#0090FF` is the **focus ring** and the **info state**. It is not a brand colour. Never use it as a hero fill, a gradient stop, an icon tint, or a decorative accent.

## Surfaces - five steps

| Token | Value | Role |
|---|---|---|
| `canvas` | `#08080A` | Page floor **and the sidebar** - they are the same colour, separated by a hairline |
| `surface` | `#0E0E10` | Cards, panels, timeline containers |
| `subtle` | `#131315` | Table headers, leading tiles, code-block chrome |
| `hover` | `#16161A` | Hover state, and the active nav item |

Note how little separates them: 6 points of lightness across four steps. Depth here is carried by **borders**, not by surface contrast. Trying to read the hierarchy from fills alone will produce a flat-looking screen.

## Borders - four steps

| Token | Value | Role |
|---|---|---|
| `border-subtle` | `#1F2023` | Card, table and panel outlines; row dividers |
| `border-default` | `#26262A` | Inputs, buttons, avatars, chips |
| `border-strong` | `#3D3D43` | Hovered control edge, dotted underlines |

Three border steps, not four. An earlier draft carried a `#17171A` step below `border-subtle`; in practice it was indistinguishable from the surface it sat on and every use of it collapsed into `#1F2023`. Control fills likewise collapsed from a separate `#101012` into `surface` - a fourth surface step that nothing needed.

## Text - five steps, with a hard floor

| Token | Value | Contrast on `canvas` | Role |
|---|---|---|---|
| `text-primary` | `#EDEEF0` | 15.8:1 | Headings, primary values |
| `text-secondary` | `#B0B4BA` | 8.9:1 | Body copy, table cells |
| `text-tertiary` | `#9A9DA3` | 6.6:1 | Table headers, inactive nav items |
| `text-muted` | `#777B84` | **4.7:1** | Timestamps, footnotes, placeholders |
| `text-placeholder` | `#696E77` | 3.9:1 | **Non-text only** - line numbers, disabled glyphs, row action dots |

**`text-muted` at `#777B84` is the floor for anything a user has to read.** It clears 4.5:1 with almost nothing to spare. A tempting darker grey like `#6E7278` measures 4.14:1 on canvas and 3.99:1 on `surface` - both fail, and both look better in isolation, which is exactly the trap. Do not introduce a step between `muted` and `placeholder` for text.

**Text is never pure `#FFFFFF`.** `#EDEEF0` is an off-white eggshell. Pure white on near-black produces halation - the text appears to vibrate at small sizes.

## Semantics - solid fill, bright foreground

Four tokens per meaning: a **solid** background, a bright foreground, plus a 7% **tint** and a 22–24% **edge** for the leading tile that pairs with a pill in a table row.

| Meaning | bg | fg | Contrast |
|---|---|---|---|
| success · delivered | `#0B2E20` | `#3ECF8E` | 7.4:1 |
| warning · queued, deferred | `#33270A` | `#FFCA16` | 9.6:1 |
| danger · bounced, complained, failed | `#3A1618` | `#FF9592` | 7.2:1 |
| info · opened, clicked | `#0D2740` | `#70B8FF` | 7.0:1 |
| neutral · sent, suppressed | `#1E1E22` | `#C0C4CA` | 9.1:1 |
| off · canceled | `#1A1A1E` | `#8C9096` | 4.8:1 |

**Solid, not translucent.** An earlier draft used a 10% alpha wash with a 1px border. The measured product uses an opaque deep fill with no border, and it's the better call - twelve translucent pills in a column pick up whatever is behind them and the row starts to look striped.

## No dot

Status pills carry **the word only**. No leading dot.

The "never encode meaning in colour alone" requirement is satisfied by the word - `Delivered` and `Bounced` are unambiguous to a reader with any colour vision. The dot was belt-and-braces, and at twelve rows deep it read as noise. **The word is mandatory**; never abbreviate, never truncate, never replace a pill with a bare coloured dot or an icon.

## Where colour goes

**Yes:** status pills, the leading status tile, log levels, validation messages, the focus ring, chart series, diff highlighting in the compatibility checker.

**No:** headings, buttons (except danger), nav icons, links inside the product chrome, section backgrounds, the logo, hover fills, ordinary card borders, empty states, illustration of any kind. The one exception is the marketing rule and glow below, which are neutral, not hue.

## Gradients, on marketing only

Three sanctioned gradients, all defined as classes in `tokens/tokens.css` so nobody hand-rolls stops. Every stop is a token. **None of them appear in the product.**

| Class | What it is | Stops |
|---|---|---|
| `.dispatch-display-gradient` | The hero title | `text-primary` to 45%, then to `text-secondary` at 100%, top to bottom |
| `.dispatch-rule` | Section rule, replaces a flat 1px border | transparent, `border-subtle` 6-34%, `text-muted` at 50%, `border-subtle` 66-94%, transparent |
| `.dispatch-glow` | Sits under a rule | radial ellipse 55% x 100% from 50% 0%, `hover` to transparent at 70% |

Notes that will bite:

1. **The rule is full-bleed, the content is not.** Put the rule on an element that spans the viewport, not inside the 1200px container, or it stops short of the edges.
2. **The glow paints first.** If the glow element comes after the rule in the DOM it covers the middle of the line, and because the glow is most opaque at its centre you get a rule that looks bright at both ends and dead in the middle. Glow first, rule second.
3. **The rule peaks at `text-muted`.** That is a text-ramp token doing edge duty, because the border ramp stops at `border-strong` `#3D3D43`, which is too dark to read as a highlight against `canvas`. If the border ramp ever gains a brighter step, the rule should move to it.
4. **The stops are percentages of the element.** The lit section scales with viewport width and does not track the content column.

## Never encode meaning in colour alone

Roughly 8% of male users have a red/green deficiency, and delivered-vs-bounced is exactly the pair that fails. The word is the signal, not decoration.

## Light mode

A mirrored set on Radix Slate light, shipped for users who ask. **Still inferred, not measured.** Design dark first, then verify the mirror. Semantic foregrounds shift to the Radix light 11 steps (`#218358`, `#AB6400`, `#CE2C31`, `#0D74CE`) because the dark foregrounds fail contrast on white.

## Scrollbars

Dark UIs must declare `color-scheme: dark`, or the native scrollbar track paints light grey and becomes the brightest object on the page. `tokens.css` handles this plus a token-matched thumb. Any new full-page design needs it too.

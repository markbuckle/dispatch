# Decisions

The judgment calls behind the token values, and why they went the way they did. The values themselves are in `tokens/`; this is the reasoning, kept so a future change can argue with the argument rather than guess at it.

## 1. Evidence beat inference, twice

The dark palette started as **Radix Slate dark**, inferred by matching a light-theme extraction against the published Radix ramps. Steps 7 and 9 were near-exact, so the inference looked sound.

It was wrong in four ways, and measuring the product rendered in dark mode corrected all four:

| | Inferred | Measured |
|---|---|---|
| Neutral ramp | Radix Slate, cool-tinted | Near-neutral warm black |
| Radii | 4 / 6 / 8 / 12 | **7 / 9 / 10 / 12** |
| Body type | 14px, no 13px tier | **15px, with a 13px mono tier** |
| Page title | 24px | **32px** |
| Status pill | 10% wash + 1px border + dot | **Solid fill, no border, no dot** |
| Geometry | 32px controls, 40px rows | **38–40px controls, 56px rows** |

A **third** pass - matching the rebuilt screens against the reference - moved type once more: body 15px → **16px** with a distinct 15px metadata tier, page titles 32px → **36px**, and radii 7/9/10 → **8/9/11/12**. Every correction went the same direction, which is the tell: a dark theme at a larger optical size needs more, not less. It also retired two tokens that measurement had suggested but building disproved - a `panel #101012` surface step and a `border-subtle #17171A` step, each indistinguishable in place from its neighbour. **Four surfaces, three borders.**

The landing hero also moved from Geist to **Instrument Serif**, matching the reference's serif display treatment. Geist stays for product page titles and metric values.

Two lessons are worth more than the values:

**Declared tokens and rendered values diverge.** The product *declares* `--radius-sm/md/lg` = 4/6/8. Its components render 7/9/10 through arbitrary per-component values. Reading the token file would have shipped the wrong scale with high confidence.

**A theme change moves the whole system, not just the colours.** The dark build is a point larger in type and a step larger in radius throughout. An extraction of the light theme is not a colour-only subset of the dark one.

When the two disagreed, **the deliverables were re-derived from the corrected tokens** rather than left to drift apart. Three rounds of this were spent chasing off-scale literals one property at a time; what finally worked was grepping the source for every value not in the token set, instead of inspecting the render.

## 2. Contrast: the floor is a real floor

`text-muted` was darkened to `#6E7278` during the restyle because it looked better in isolation. It measured **4.14:1 on canvas and 3.99:1 on surface** - failing 4.5:1 - across 62 elements carrying 15px content: table timestamps, metric footnotes, the search placeholder, the breadcrumb root, every timeline time.

Reverted to `#777B84` (4.7:1). Two further failures found in the same audit and fixed: a `#52595B` badge at 2.75:1, and a `#3D3D43` breadcrumb separator at 1.86:1 - the latter a *border* token being used as text.

The rule now written into `foundations/color.md`: **`text-muted` is the darkest step permitted for anything a user reads.** `text-placeholder` `#696E77` exists but is non-text only. The trap is that each darker step looks more refined on its own and fails only in aggregate.

Related: `micro` (11px) was added as a real token for avatar initials and `kbd` glyphs, with an explicit rule that it is a **label size, not a reading size** - anything readable floors at `caption` 12px.

## 3. The status dot was removed on purpose

The original spec put a coloured dot beside every status word, justified on red/green colour-deficiency grounds. The measured product uses the word alone.

Dropped the dot, because **the word is what satisfies the requirement.** `Delivered` and `Bounced` are unambiguous to any reader regardless of colour vision; the dot was belt-and-braces, and at twelve rows deep it read as noise. What is now mandatory instead: the label is **never** abbreviated, truncated, or replaced by a bare coloured dot or icon.

The pill fill also went from a 10% alpha wash to an opaque deep fill. Translucent pills pick up whatever sits behind them, and a column of twelve starts to look striped.

## 4. Provider logos are a stated exception

`foundations/iconography.md` mandates monoline, 32-grid, 2.25-stroke, no fills. The GitHub mark and Google's four-colour G on the auth screens break all of that.

They are **trademarks, not iconography.** A monoline Google G would be both incorrect usage and less trustworthy - OAuth buttons work because the provider is instantly recognisable. This is the one place filled, full-colour, externally-owned marks are correct.

## 5. No invented numbers

The voice rules require every claim to carry a number or a name. Applied honestly, that constrains what can be built:

- A **free-tier figure** ("3,000 emails a month") was written into the sign-up subcopy, then **cut** - the real number doesn't exist yet, and a fabricated one is worse than silence in a system whose credibility is numeric.
- **Pricing and a closing CTA band** were left off the landing page for the same reason, despite `applications/web.md` specifying both.

The principle: the every-claim-gets-a-number rule cuts both ways. It is not a licence to invent numbers to fill a section - it is a reason to omit the section.

## 6. Gradients: one carve-out, everything else holds

`foundations/imagery.md` bans gradients and `foundations/shadow.md` restricts `box-shadow` to overlays. Both were broken in exactly one place - the **auth background**, the only full-bleed marketing-grade moment in the product, where a flat field reads as unfinished.

Everywhere else the ban held, including where it was tempting:

- The **workspace and user avatars** initially used a purple-to-magenta gradient lifted from a reference capture. Swapped for `#1E1E22` with a `#26262A` border and the initial in `text-primary` - which is what the no-gradients rule already required, and is more on-brand.

Depth in the product is carried by **borders**, not fills or shadows: the five surface steps sit within six points of lightness of each other, so a card that looks flat needs a stronger border, never a lighter fill.

## 7. Motion: neither input won outright

The brief specified 120–180ms ease-out. The product measured 200ms with `cubic-bezier(.4,0,.2,1)`, and Radix overlays at `.2s ease-in-out`.

Split by **the surface area of the thing moving**, not by importance:

- **120ms ease-out** for hover, colour, border, focus - small state changes need to land under ~150ms to feel instant, and a 200ms hover on a table row being scanned reads as lag.
- **200ms standard** for dropdowns, dialogs, toasts - a large surface moving in 120ms has too few frames to parse and reads as a glitch.

A practical benefit decided it: Radix Primitives keep their default 200ms, so nobody overrides the library to hit the spec.

## 8. The mark is original

Three primitives, from the brief, and nothing sampled from any reference brand: an **open circle** (the node at rest - never filled), a **butt-capped horizontal** (the taut line - no taper, no curve), and a **mitred chevron** (the sharp terminus - `stroke-linejoin: miter` is load-bearing; `round` or `bevel` kills the idea).

The nine nav glyphs are drawn on the same 32-grid at the same stroke, so the product chrome and the brand are one drawing system. The auth "Home" control is the mark **run backwards** - chevron, line, node - a return stated in the brand's own vocabulary rather than a generic back arrow.

One counter-intuitive rule: **stroke thickens as the glyph shrinks** - 2.25 at display, 2.5 at 20px, 2.75 at 16px. The opposite of most icon sets, and the reason the set survives a 56px collapsed sidebar.

## 9. What is still inferred

Recorded in `PROVENANCE.md`, repeated here because it is the most likely source of a future wrong assumption:

- **Light mode** is inferred from Radix Slate light. Never measured.
- **Input, checkbox, radio and select** specifications were designed from the brief; the sampled pages carried no form fields.
- **Motion** has a measured product baseline but the split above is a judgment call, not an observation.

## 10. Open items

- **The auth background gradient from §6 has no token.** That entry documents the exception; nobody ever added the actual class or token to `tokens/tokens.css`, so there was nothing to build against. `/login` and `/signup` (`apps/web/app/login`, `apps/web/app/signup`) shipped flat - `canvas` background, borders carrying hierarchy - rather than inventing a recipe. Measure the real gradient and add it to `tokens.css` as a fourth `.dispatch-*` class, then apply it here.

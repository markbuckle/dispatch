# Provenance — extracted vs inferred

Every value in this system falls into one of three buckets. Check here before treating a token as settled.

## Sources

| Source | URL | Method | Date |
|---|---|---|---|
| Marketing — pricing | `resend.com/pricing?product=marketing` | `extract-design-system` (dembrandt + Playwright Chromium) | 2026-08-30 19:57Z |
| Marketing — home | `resend.com/home` | same | 2026-08-30 20:15Z |
| Auth | login page | same | 2026-08-30 |
| Product — emails, logs, domains, webhooks | authenticated product UI | computed-CSS sampling | 2026-08-30 |

## A — Extracted and adopted

### The dark palette — measured, 2026-08-31

Automated extraction repeatedly resolved the light theme (`--canvas: #eee`). The values below were sampled directly from the product rendered in dark mode, and they **replaced the Radix Slate inference** that earlier drafts used.

| What | Value |
|---|---|
| Surfaces | canvas `#08080A` · surface `#0E0E10` · subtle `#131315` · hover `#16161A` |
| Borders | subtle `#1F2023` · default `#26262A` · strong `#3D3D43` |
| Text | `#EDEEF0` · `#B0B4BA` · `#9A9DA3` · `#777B84` · `#696E77` |
| Success | `#0B2E20` bg / `#3ECF8E` fg |
| Radius | 7 / 9 / 10 dominant |
| Type | 15px body, 13px mono, 32px page title |
| Geometry | 252px sidebar · 56px top bar · 40px nav item · 56px table row · 46px header row · 38–40px controls · 26px pill |
| Pills | solid opaque fill, no border, **no dot** |

**What this corrected:** the neutral ramp is near-neutral warm-black, not Radix's cool Slate; radii are a step larger than the declared Tailwind variables; the type scale is a point larger in dark mode than the light capture showed; and status pills are solid rather than a 10% wash.

**The methodological lesson:** declared design tokens and rendered values diverge. Captures of the *declared* `--radius-*` variables said 4/6/8; the rendered components use 7/9/10 via arbitrary values. Measure the rendered page in the theme you are actually building, not the declared token file.

### Earlier findings, still standing

| Value | Evidence |
|---|---|
| Neutral ramp = Radix Slate | Reference greys `#434a4d` / `#6e7679` vs Slate dark 7 `#43484e` / 9 `#696e77` — near-exact across steps 1–9 |
| Off-white primary text | `#f0f0f0`, 1434 uses. Never `#fff` for body text. |
| Radius 4 / 6 / 8 / 12 | Product declares `--radius-sm .25rem`, `--radius-md .375rem`, `--radius-lg .5rem`; 12px dominant on cards |
| Semantic foregrounds | `#0090ff`, `#ff9592`, `#ffca16` — Radix Blue/Red/Yellow 9 and 11, unmodified |
| Depth as a 1px ring | Most common box-shadow, 60 uses: `0 0 0 1px rgba(24,25,28,.88)`. Only 10 elements had real drop shadows. |
| Hairlines at low alpha | `rgba(214,235,253,0.19)` on 195 table cells — cool-white at 14–19%, not solid grey |
| 4px spacing grid, 24px dominant | 118 uses on pricing, 97 on home. Product gaps: 8px (24), 4px (17). |
| 14px product baseline | Font-size census: 14px 846–959 uses, 16px ~300, 12px ~80. **No 13px tier exists.** |
| Table row spec | Real class: `border-subtle h-10 border-b pr-3 pl-2 text-sm md:px-3 py-3` → 40px row, 14px, 12px pad, 1px bottom border |
| Tracking behaviour | -0.05em at 56px, +0.02em at 12px |
| Inter as the UI face | Every extracted button/link/caption context |
| Semantic token naming | They ship `border-subtle`, `text-placeholder`, `bg-accent`, `canvas` |
| Tailwind v4 + Radix Primitives | `--tw-*` v4 theme vars; `data-radix-*` attributes present |
| Breakpoints 480 / 600 / 767 | Detected across pages |

## B — Extracted and deliberately rejected

| Value | Reference | Dispatch | Why |
|---|---|---|---|
| Marketing radii | 16px buttons (61–68 uses), pill (191–198) | 4/6/8/12 | Soft corners blur a dense table. Their *product* already agrees with us. |
| Brand accent | Green `#43fea4`, 572 uses | none | Brief: colour carries meaning only |
| Primary button | Dark grey fill | Light `#EDEEF0` fill | Weight over colour |
| Focus ring | `0 4px 12px rgba(0,0,0,.1)` | 2px offset ring in `#0090FF` | Theirs is invisible on a dark canvas — an accessibility gap |
| Hover fill | `rgba(255,255,255,0.28)` shared across variants | Steps through the neutral ramp | 28% white is too hot at product density |
| Button hover transform | `scaleX(1.1)`, `scale(1.05)` | none | Brief forbids decorative motion |
| Icon style | Filled paths, 400×400 viewBox, 18px | Monoline, 32 grid, 2.25 stroke | Brief specifies monoline |
| Display typefaces | Domaine, ABC Favorit | Geist | Both licensed and self-hosted — unavailable to us |
| Canvas | `#000` | `#08080A` | So a true-black element still reads as an element |

## C — Inferred, not extracted

Treat these as open.

| Value | Status |
|---|---|
| ~~Dark-mode surfaces~~ | ✅ **Closed.** Measured from the product rendered in dark mode, after automated extraction repeatedly resolved the light theme. See bucket A. |
| Motion tokens | Product runs 200ms / `cubic-bezier(.4,0,.2,1)` (28 uses), 150ms (3), 300ms (2). Brief asked for 120–180ms ease-out. **Resolved as a split:** 120ms ease-out for hover/colour/focus, 200ms for overlays and Radix transitions. |
| Input, checkbox, radio, select specs | `inputs: { text: [], checkbox: [], radio: [], select: [] }` on the marketing pages; the product pages were too sparse to sample meaningfully. Designed from the brief. |
| Status pill / badge styling | `badges: []` everywhere. Designed from the brief. |
| Voice and copy rules | Not extractable. From the brief and the product's own docs tone. |
| Light-mode mirror | Radix Slate light, applied by inference. Never measured. |
| Third type correction | Body 15px → 16px, page titles 32px → 36px, radii 7/9/10 → 8/9/11/12, and two token steps retired (`panel`, a fourth border). These came from matching the rebuilt screens against the reference **by eye**, not from a fresh capture — judgment against a reference, not measurement. Verified applied: the 36px title and -0.032em tracking are what all nine built screens actually render, and tokens now agree. |

## Method notes

- **Computed-CSS extraction was chosen over brand-inference tooling.** Scrapers that emit a "branding" summary *infer* palette and type from page content; a computed-CSS extractor drives a real browser and returns resolved custom properties, per-element `getComputedStyle` values, and usage counts. Building a token set needs measured values, not an inference — that distinction is what surfaced the Radix Slate ramp, the 1px-ring-not-shadow elevation model, and the declared-vs-rendered radius conflict.
- **No brand-inference data was used in this system.** A Firecrawl pass was attempted and never produced output (the connector exposed search only; the CLI needs repeated `--format` flags rather than a comma-separated list). It would have been useful for marketing copy and a full-page screenshot, never for tokens — so nothing was lost.
- Automated CSS extractors write to a fixed output directory and **overwrite on every run** — scope each target separately or values silently merge.
- A summariser pass can drop what the raw pass found (`palette: []`, `radius: []`). Trust the raw output.
- **A theme toggle is not guaranteed to survive automated capture.** Every automated attempt here resolved the light theme; the dark values had to be measured from the product rendered in dark mode. If a system is dark-first, verify which theme your capture actually recorded before trusting a single value.
- Marketing pages and product pages are **different design systems** in the same brand. Radii, density and type scale all diverged here. Sample the surface you are actually building.

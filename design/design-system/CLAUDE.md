# CLAUDE.md — read this before generating anything for Dispatch

Dispatch is an **email API for developers**. The audience is technical, impatient, and often debugging. Every surface should feel like a slick well-made tool just like Resend (https://resend.com/home)

## 1. Load order

1. This file.
2. `tokens/tokens.css` — the actual values, **measured from the product in dark mode**. Never invent a colour, size, radius, or duration that isn't here. If you need one, add it here first.
3. `BRAND-SUMMARY.md` — one-page positioning.
4. `foundations/color.md` + `foundations/typography.md` — the two that constrain every layout.
5. The relevant `applications/*.md` for the surface you're building.
6. `foundations/voice.md` + `foundations/vocabulary.md` before writing a single word of copy.
7. `components/` for React starters.
8. `PROVENANCE.md` if you need to know how much confidence a value carries.

## 2. Non-negotiables, in Dispatch terms

1. **No brand accent colour.** The base is monochrome. Blue `#0090FF` is the focus ring and the info state — it is not a brand colour and must never appear as decoration, a gradient, or a hero fill.
2. **One UI typeface: Inter.** Geist for product display and the wordmark. Commit Mono for anything a developer would copy. Instrument Serif is the marketing hero face, once per page at `display-2xl`, or not at all.
3. **Dark is the canvas.** `#08080A`. Light mode exists as a mirrored token set for users who ask; never design light-first.
4. **Sentence case everywhere.** No Title Case. ALL CAPS only in a ≤3-word overline at 12px with +0.06em tracking.
5. **No hype vocabulary.** Banned: revolutionary, game-changing, 10x, cutting-edge, supercharge, unleash, leverage, transform, synergy, seamless, robust, blazing-fast, AI-powered as a bare adjective.
6. **Second person, short sentences.** Name the developer's world — request, payload, webhook, bounce, DKIM record, status code — not ours (platform, solution, ecosystem).
7. **Gradients and glows are allowed on marketing surfaces, in three specific forms.** The display-title gradient, the section rule, and the section glow, all defined as classes in `tokens/tokens.css` (`.dispatch-display-gradient`, `.dispatch-rule`, `.dispatch-glow`). Use those classes rather than hand-rolling stops, and take every colour from a token. **Product surfaces stay flat** - a dashboard gets borders, not gradients. Still banned everywhere: glassmorphism, 3D, neumorphism, and illustration.
8. **Borders over shadows.** `box-shadow` is permitted on dropdowns, dialogs and toasts. Nowhere else. The five surface fills sit within 6 points of each other, so the border carries the hierarchy.

8b. **Declare `color-scheme: dark`.** Without it the native scrollbar paints light grey and becomes the brightest thing on screen. `tokens.css` handles it; any standalone page needs it too.
9. **Motion: 120ms / 200ms only.** ease-out for the first, `cubic-bezier(.4,0,.2,1)` for the second. No bounce, spring, parallax, scroll-jacking, or entrance animation that delays reading.
10. **Every claim gets a number or a name.** "Fast" is banned. "p50 under 200ms" is required. "Trusted by teams" is banned; name a customer or drop the claim.

## 3. Defaults when the brief is ambiguous

| Question | Default |
|---|---|
| Background | `#08080A` (dark). Marketing sections may use `#0E0E10` for one band, max. |
| Body size | **16px product**, 16px marketing |
| Page title, product | **36px** Geist 600, -0.032em |
| Hero title, marketing | **116px** Instrument Serif 400, -0.02em, `.dispatch-display-gradient` |
| Table row height | **60px**, 20px cell padding, 16px text, 48px header row |
| Heading case | Sentence case |
| Primary CTA, product | Light fill `#EDEEF0` on near-black, 9px radius, **42px** tall |
| Primary CTA, marketing | `.dispatch-cta` - `hover` fill, 2px `border-default`, inverts to `#EDEEF0` on hover. 16px radius hero, 12px header |
| Section spacing | 96px marketing, 24px product |
| Card radius | **12px**. Dialog 12px. Button/input/nav 9px. Marketing CTA 16px. |
| Sidebar | 252px, `canvas` bg, active item `#16161A` + `#26262A` border, 40px tall, 20px icons |
| Status pill | Solid fill, no border, no dot, 26px tall, 7px radius, 13.5px |
| Max content width | 1200px marketing, 680px reading, fluid dashboard |
| Marketing header | **64px**, sticky, `canvas`, no rule until scrolled |
| Icon | Monoline, 32-unit grid, 2.25 stroke, 18px rendered |
| Slide aspect | 16:9, 1920×1080 |
| Email width | 600px |
| Carousel | 1080×1350 (4:5) |
| Empty state | One line of what's missing, one action. No illustration. |

## 4. Asset-type cheat sheet

| The user says | Read |
|---|---|
| landing page, homepage, marketing site | `applications/web.md` |
| dashboard, screen, table, product UI | `foundations/color.md` + `components/` + the density note in `README.md` |
| deck, slides, presentation, all-hands | `applications/presentations.md` |
| transactional email, receipt, verification | `applications/email.md` |
| LinkedIn post, carousel | `applications/social-linkedin.md` |
| Instagram | `applications/social-instagram.md` (rarely relevant — this is a dev tool) |
| ad, paid, sponsored | `applications/ads.md` |
| diagram, chart, comparison | `applications/infographics.md` |
| logo, favicon, app icon | `logo/usage.md` |

## 5. Quality bar — ask before delivering

1. Did I use a value that isn't in `tokens/tokens.css`? If yes, remove it or justify it.
2. Is there any colour on screen that isn't carrying meaning? If yes, delete it.
3. Would a developer scanning this at 11pm find the one number they came for in under three seconds?
4. Did I hand-roll a gradient instead of using the three `.dispatch-*` classes, or put one on a product surface? Did I add a shadow or illustration out of habit?
5. Is every claim attached to a number or a name?
6. Is the primary action obvious without colour doing the work?
7. Could I remove an element and lose nothing? Then remove it.

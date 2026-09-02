# Motion

Fast and functional. Motion exists to show a relationship — where a thing came from, what it belongs to — and nothing else.

## Duration tokens

| Token | Value | Easing | Applies to |
|---|---|---|---|
| `fast` | **120ms** | `cubic-bezier(0,0,0.2,1)` (ease-out) | Hover, colour, background, border, focus ring, checkbox tick, small icon rotation |
| `overlay` | **200ms** | `cubic-bezier(0.4,0,0.2,1)` (standard) | Dropdowns, dialogs, popovers, toasts, tooltips, tabs, accordion, every Radix transition |
| `slow` | **300ms** | `cubic-bezier(0.4,0,0.2,1)` | Full-height sheets and side panels only |

Two tokens do 95% of the work. **Pick by the surface area of the thing that's moving**, not by how important it feels.

### Why the split

Extracted from the authenticated product: **200ms on 28 elements**, 150ms on 3, 300ms on 2, easing `cubic-bezier(.4,0,.2,1)`, with Radix overlays at `.2s ease-in-out`. The brief asked for 120–180ms ease-out.

Both are right about different things. Small state changes need to land under ~150ms to feel instant — a 200ms hover on a table row you're scanning at speed reads as lag. But a large surface moving in 120ms doesn't have enough frames to parse and reads as a glitch rather than a movement. So: 120ms for colour and small state, 200ms for anything with real area.

The practical benefit is that Radix Primitives keep their default 200ms, so nobody has to override the library to hit the spec.

## Standard animations

| Interaction | Spec |
|---|---|
| Button hover | `background-color` + `border-color`, 120ms ease-out. **No transform.** |
| Button press | `background-color` step to the active token, 120ms. No scale. |
| Input focus | `border-color` + `box-shadow` ring, 120ms ease-out |
| Table row hover | `background-color` to `hover`, 120ms |
| Dropdown / select open | `opacity 0→1`, `translateY(-4px)→0`, 200ms standard |
| Dialog open | `opacity 0→1`, `scale(0.98)→1`, 200ms standard. Overlay fades `opacity 0→1` at 200ms. |
| Toast enter | `opacity 0→1`, `translateY(8px)→0`, 200ms. Exit: reverse at 120ms. |
| Tooltip | `opacity` only, 120ms, 400ms open delay |
| Tabs | Indicator `transform`, 200ms standard |
| Accordion | `height`, 200ms standard |
| Skeleton | `opacity` pulse 0.5↔1, 1200ms ease-in-out, infinite |
| Spinner | `rotate` 360°, 640ms linear, infinite |
| Row expand (logs) | `height`, 200ms standard |
| Copy confirmation | Label swap, no animation. 1400ms then revert. |

## We do not do

- Bounce, spring, overshoot, elastic, or any easing that goes past its endpoint
- Scale or translate on button hover — the reference does `scaleX(1.1)` and `scale(1.05)`; we rejected both
- Parallax, of any kind
- Scroll-jacking or scroll-driven pinning
- Looping hero video or animated backgrounds
- Entrance animations that delay reading — no fade-up on body copy, no staggered paragraph reveals
- Typewriter effects, text shimmer, gradient sweeps
- Confetti, celebration, or any animation on success
- Animating the logo mark
- Animation on data. A chart draws instantly. A number that changes, changes.
- Anything over 300ms

## Marketing exceptions

The landing page may use exactly two:

1. **Scroll reveal** — `opacity 0→1` + `translateY(8px)→0`, 200ms, triggered once at 20% visibility. Never on the hero, never on anything above the fold.
2. **Quiet marquee** for a customer logo band — constant linear speed, no easing, pauses on hover.

Not permitted anywhere: spotlight-follow-cursor, magic border, tilt-on-hover, number count-up on scroll.

## Reduced motion

Non-negotiable. Already in `tokens.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Nothing in the product depends on motion to be understood — the skeleton pulse and the spinner are the only animated affordances, and both have a static readable state.

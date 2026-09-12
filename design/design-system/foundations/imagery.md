# Imagery

Dispatch's primary imagery is **its own interface**. That's not a fallback position - for a developer tool, a real screenshot of a real dense table is more persuasive than any photograph.

## The hierarchy

1. **Product UI.** A real screen, real data, dark mode, at true resolution. Cropped tight to the thing being discussed.
2. **Code.** A real request or response, syntax-highlighted, in Commit Mono. Short enough to read in three seconds.
3. **Diagram.** A flow drawn with the system's own primitives - surfaces, hairlines, monoline icons, semantic status colours. No illustration style, no isometric.
4. **Photography.** Only for the team, careers, and about pages. Real people at real desks.
5. **Nothing.** A section with strong type and no image is better than a section with a stock image.

## Product screenshots

- Dark mode, always.
- Real data - plausible domains, plausible message IDs, plausible timestamps. Never `lorem ipsum`, never `example@example.com` repeated eight times, never `Foo Bar`.
- Never fabricate a metric that flatters. If the screenshot shows a 99.2% delivery rate, that number must be real or clearly labelled as an example.
- Crop tight. A full 1920px dashboard shrunk into a 600px column communicates nothing.
- 2× resolution minimum. A soft screenshot of a crisp UI is self-defeating.
- On a surface: `border-default`, `radius-md`, no shadow.
- Full-bleed: no border, no radius.
- **No browser chrome mockup, no floating perspective, no device tilt, no reflection.**

## Photography - team and careers only

**What we shoot:** engineers at actual desks, actual screens, actual mess. Whiteboards mid-argument. The office as it is.

**How:** available light, no flash. Shallow depth of field is fine. Candid, mid-action, looking at the work rather than the lens.

**Treatment:** minimal. Slight desaturation to sit with the palette. No colour grade toward teal-orange, no vignette, no grain overlay, no duotone.

**Never:**
- Stock photography of any kind
- "Diverse team gathered around a laptop, laughing"
- Anyone pointing at a monitor
- Handshakes, or a suit
- AI-generated humans
- A photo of an office that isn't ours

## Illustration - we don't

No illustration system. No mascot. No spot illustrations for empty states.

**Categorically never:** glowing orbs, neural network meshes, wireframe globes, circuit-board motifs, floating 3D geometry, isometric city scenes, Memphis shapes, corporate-Memphis blob people, hand-drawn arrows, robots, anything that says "AI" visually.

An empty state gets one line of text and one action. That's the whole design.

## OG and social images - 1200 × 630

```
┌──────────────────────────────────────────┐
│  ◦──▸ Dispatch                    (48px) │   canvas #08080A
│                                          │
│  Email that arrives.                     │   display-l Geist, text-primary
│                                          │
│  Transactional and marketing email       │   body-lg, text-secondary
│  with delivery you can debug.            │   max 2 lines
│                                          │
│                          [1px hairline]  │
└──────────────────────────────────────────┘
```

- 80px padding all sides.
- Headline never more than two lines.
- No product screenshot in an OG image - it's unreadable at feed size.
- Blog posts: same layout, post title in `display-m`, no subcopy.

## Patterns and backgrounds

Two, both nearly invisible:

- `assets/patterns/grid.svg` - 32px dot grid, `border-subtle`, for a hero or an empty canvas. Maximum 40% opacity.
- `assets/patterns/hairline.svg` - a single 1px rule for section boundaries where 96px of space isn't enough of a signal.

**Never:** animated backgrounds, particles, aurora or mesh gradients, noise overlays, starfields, blurred colour blobs, anything that moves behind text.

## Fallback order when there's no image

1. A code sample.
2. A tight crop of one UI element - a single status pill, one table row, one DNS record.
3. A number set in `display-m` with a caption.
4. A pull quote in Instrument Serif.
5. Nothing. Let the type carry it.

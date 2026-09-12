# Brand

## Mission

Make email infrastructure something a developer can see into. Every message, every bounce, every DNS record, every client that breaks your HTML - visible, named, and debuggable.

## Vision

That "we don't know why that email didn't arrive" stops being a sentence anyone has to say.

## Why Dispatch exists

Email is the least interesting part of shipping a product and the most likely to fail quietly. A password reset that never lands doesn't throw an error - it produces a support ticket three days later. The incumbents solved sending and left observability as an upsell.

Dispatch treats the send as the easy half. The product is the part after: where did it go, what happened to it, and which of your twenty target clients is going to mangle the markup.

## Positioning statement

For developers shipping products that depend on email, Dispatch is an email API with delivery observability built into the primary surface rather than buried in a log export - so that when something fails, the answer is on screen instead of in a support queue.

## Target audience

**Primary:** the engineer who owns email at a startup or scale-up. Usually not their main job. Full-stack, ships weekly, reads docs before marketing pages, evaluates by getting a test send working in under ten minutes.

**Secondary:** the platform or infrastructure engineer at a larger company, evaluating a migration off a legacy provider. Cares about dedicated IPs, DMARC posture, regional sending, and whether the API will still behave at 10M/month.

**Tertiary:** the technical founder who is currently the whole engineering team.

## The audience insight

They are technical, impatient, and reading a dense table of delivery statuses at 11pm because something is broken.

That single sentence drives more design decisions in this system than anything else. It's why density beats whitespace, why 16px is the baseline, why every status carries a word as well as a colour, why motion is 120ms, and why nothing on any screen exists for decoration.

## What they distrust

- Marketing pages with no code on them
- "Contact sales" where a price should be
- A dashboard that looks like a consumer app
- Claims without numbers
- Anything that implies they don't already understand SPF

## Values

**Show the work.** Surface the status code, the timestamp, the retry count. The user is capable of interpreting raw information and resents having it smoothed over.

**Remove, then remove again.** If an element doesn't earn its place, delete it. A screen with four things on it is better than a screen with nine.

**Slightly ahead, never trendy.** The product should feel like it was built a year from now, not like it was built to match this year's dribbble.

**Restraint builds trust.** A tool that doesn't shout about itself reads as confident. Decoration reads as compensation.

**Say the specific thing.** "Your DKIM record is missing" beats "a configuration issue was detected."

## Archetype

**The Craftsman.** Makes tools for other builders. Precise, unhurried, quietly proud of the joinery. Explains rather than persuades.

## Anti-archetype

**The Hype Machine.** Gradient hero, floating 3D render, "supercharge your email delivery", a testimonial carousel where the documentation should be, and a pricing page that says "let's talk".

If a design decision would look at home on that site, it's wrong for this one.

## The three principles

Every decision in this system traces back to one of these:

1. **Simple.** Navigate complexity, remove friction. If an element doesn't earn its place, delete it.
2. **Modern.** Slightly ahead of the present, never trendy.
3. **Memorable.** Restraint that builds trust, not decoration that begs for attention.

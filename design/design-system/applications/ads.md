# Ads

The audience is technical and ad-averse. Every ad should read like a fact, not a pitch.

## Where we advertise

Sponsorships in developer newsletters and podcasts, conference programmes, Stack Overflow, Reddit's programming subreddits, and retargeting to docs visitors. **Not** Facebook, Instagram feed, or TikTok.

## Sizes

| Format | Size |
|---|---|
| Leaderboard | 728 × 90 |
| Medium rectangle | 300 × 250 |
| Half page | 300 × 600 |
| Large mobile banner | 320 × 100 |
| Newsletter sponsor | 600 × 200 |
| LinkedIn single image | 1200 × 627 |
| Podcast episode art | 1400 × 1400 |

## The formula

```
[the mark]  [one specific claim]  [dispatch.com]
```

That's it. Three elements. Everything else is subtraction.

## Medium rectangle — 300 × 250

```
canvas #08080A, 24px padding, 1px border-subtle
┌────────────────────────────┐
│  ◦──▸ Dispatch      (20px) │
│                            │
│  Know why                  │  28px Geist, text-primary
│  it bounced.               │
│                            │
│  Delivery observability    │  14px text-secondary
│  for developers.           │
│                            │
│  dispatch.com       (13px) │  caption text-muted
└────────────────────────────┘
```

## Newsletter sponsor — 600 × 200 or text-only

Text-only usually outperforms an image in developer newsletters. Format:

> **Dispatch — email that arrives.** Transactional and marketing email over one HTTP endpoint, with the full delivery timeline for every send: queue, retries, the receiving server's actual response. p50 under 200ms, 3,000 emails a month free. **dispatch.com**

Under 50 words. One bold lead-in, one specific mechanism, one number, one link.

## Copy rules

- **One claim per ad.** Two claims means neither lands.
- **A number wherever possible.** "p50 under 200ms" beats "fast".
- **No urgency manufacturing.** No "limited time", no countdown, no "act now".
- **No competitor names** in paid copy. Comparison pages are fine; ads aren't.
- **CTA is concrete:** "Get an API key", "Read the docs", "See the pricing". Never "Learn more".

## Headlines that work

- Know why it bounced.
- Email that arrives.
- Your provider said "accepted". Then what?
- 23 email clients. Checked before you send.
- 3,000 emails a month, free.

## Headlines that don't

- The modern email platform
- Supercharge your email delivery
- Email, reimagined
- Trusted by thousands of developers
- The future of email is here

## Constraints

- Dark, always. `canvas` background with a `border-subtle` edge so the ad has a boundary on a light host page.
- Max two type sizes per ad.
- Mark always present, never larger than 24px in a banner.
- No animation in display ads. A static ad in this category reads as more trustworthy, and animated ads get blocked anyway.
- **No stock photography, no illustration, no gradient, no product screenshot** (unreadable at these sizes).
- Legible at 50% scale — check it.

## Podcast read

Written for the host to read aloud, in their voice, 30 seconds:

> This episode is sponsored by Dispatch. Dispatch is an email API — you POST to one endpoint and it sends. The difference is what happens after: you get the whole delivery timeline for every message. Not just "we accepted your request", but what the receiving server actually said, every retry, and whether it landed. There's also a compatibility checker that tests your HTML against 23 email clients before you send, so you find out Outlook breaks your layout from us and not from a customer. First 3,000 emails a month are free, no card. dispatch.com.

Rules: no script the host has to perform, no superlatives, one number, one URL, under 100 words.

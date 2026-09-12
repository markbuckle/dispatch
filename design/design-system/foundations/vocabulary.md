# Vocabulary

## Words we use

**About us:** built, ships, handles, retries, verifies, surfaces, logs, exposes, returns. We are "Dispatch" or "we" - never "the platform", never "the Dispatch team" in product copy.

**About the user:** you, your domain, your send, your endpoint, your template, your key, your workspace.

**About the work:** send, deliver, bounce, queue, retry, verify, authenticate, render, validate, inspect, debug, trace.

**About outcomes:** arrives, lands in the inbox, verified, delivered, bounced, suppressed, opened, clicked, failed.

## The developer's nouns

Use these. They are what the audience already calls things.

*request · response · payload · endpoint · webhook · retry · status code · latency · p50 · p99 · rate limit · idempotency key · API key · scope · permission · bounce · hard bounce · soft bounce · complaint · suppression list · DKIM · SPF · DMARC · DNS record · TXT record · MX · reputation · dedicated IP · warm-up · template · variable · client · render · MIME · plain-text part · deliverability*

## Words we avoid

**Corporate abstraction:** solution, offering, capability, platform (as a self-description), ecosystem, journey, experience (as a noun), stack (as a verb), unlock, empower, enable (when "let" works), utilise, leverage.

**Hype:** revolutionary, game-changing, 10x, cutting-edge, supercharge, unleash, transform, synergy, seamless, robust, blazing-fast, lightning-fast, effortless, magical, delightful, beautiful (about our own UI), powerful, comprehensive, holistic.

**Vague technical:** enterprise-grade, battle-tested, world-class, best-in-class, next-generation, purpose-built, industry-leading, mission-critical, bulletproof, rock-solid.

**Softeners that insult:** simply, just, easily, obviously, of course, all you need to do is.

**AI slop:** AI-powered (bare), intelligent, smart (meaning "conditional"), leveraging AI, powered by machine learning.

## Verbs we like

send · deliver · retry · verify · queue · surface · expose · return · render · inspect · trace · log · flag · suppress · warm · route · sign

## Verbs we avoid

empower · unlock · elevate · streamline · optimise (unless quantified) · revolutionise · disrupt · reimagine · supercharge

## Numbers we like

The brand's credibility is numeric. Preferred shapes:

- **Latency:** "p50 under 200ms", "p99 at 1.4s"
- **Volume:** "12M emails a month", not "millions of emails"
- **Time to first send:** "a test send in under 4 minutes"
- **Retry behaviour:** "retries for 72 hours, exponential backoff"
- **Coverage:** "23 client/version combinations checked"
- **Regions:** "4 sending regions"
- **Rates:** "99.2% delivered", always with the denominator available

**Never:** "millions of", "thousands of teams", "industry-leading uptime", "significantly faster", "up to X" without the typical case.

Every claim gets a number or a name. "Trusted by fast-growing teams" is banned. Name a company or delete the sentence.

## Headline recipe

```
[concrete noun from their world] + [verb of consequence]
```

Test: could a competitor put their logo on this headline? If yes, rewrite it.

**Works:** "Email that arrives." · "Know why it bounced." · "Every send, traceable." · "See which client breaks your HTML."

**Fails:** "The modern email platform." · "Email, reimagined." · "Delivery you can trust." · "Supercharge your email."

## Status vocabulary - fixed

These strings appear in the product and must not be paraphrased.

| State | Label | Semantic |
|---|---|---|
| Accepted, not yet sent | `Queued` | warning |
| Handed to the receiving server | `Sent` | neutral |
| Confirmed at the destination | `Delivered` | success |
| Permanently rejected | `Bounced` | danger |
| Temporarily rejected, will retry | `Deferred` | warning |
| Recipient marked as spam | `Complained` | danger |
| Blocked by the suppression list | `Suppressed` | neutral |
| Opened by the recipient | `Opened` | info |
| A link was clicked | `Clicked` | info |
| Cancelled before sending | `Canceled` | disabled |
| Send failed inside Dispatch | `Failed` | danger |

Note: `Canceled`, one L - US spelling, consistent with the API.

# Voice

Dispatch sounds like a good colleague explaining a system — someone who knows it deeply, respects your time, and doesn't perform.

## Seven rules

1. **Specific over generic.** Name the thing. "Your SPF record lists two `include` mechanisms" not "there's a configuration problem." If you can't be specific, you don't understand the situation well enough to write about it yet.

2. **Second person singular.** "You", "your domain", "your webhook". Never "users", never "customers", never "one".

3. **Short sentences.** Average under 15 words. One idea per sentence. A comma splice is usually two sentences.

4. **Name their world, not ours.** Their nouns: *request, payload, endpoint, bounce, hard bounce, webhook, retry, DKIM record, status code, latency, template, client*. Not ours: *platform, solution, ecosystem, offering, capability, journey*.

5. **No AI jargon, no infrastructure poetry.** Banned: *AI-powered* (as a bare adjective), *intelligent*, *smart* (when it means "has an if-statement"), *battle-tested*, *enterprise-grade*, *world-class*, *best-in-class*, *next-generation*, *purpose-built*, *first-class* (as a synonym for good).

6. **No hype.** Banned everywhere: *revolutionary, game-changing, 10x, cutting-edge, supercharge, unleash, leverage, transform, synergy, seamless, robust, blazing-fast, effortless, magical, delightful*.

7. **Promise specifics, not outcomes.** "Retries for 72 hours with exponential backoff" not "reliable delivery you can count on." The specific claim is the more impressive one anyway.

## The three-second test

Someone lands on any Dispatch surface. In three seconds they should feel:

> *These people have read the RFCs. This will not waste my time.*

If a surface instead produces *"what does this actually do?"* or *"who is this for?"*, the copy has failed regardless of how well it's written.

## Tone by context

| Context | Register |
|---|---|
| Homepage hero | Plain and confident. One claim, no adjectives. |
| Feature page | Explanatory. Lead with the mechanism, not the benefit. |
| Pricing | Flat and factual. Numbers, limits, no persuasion. |
| Docs | Imperative and terse. "Send a POST to /emails." |
| Empty state | Helpful, one line. What's missing and the one action. |
| Error message | Direct, specific, blameless. Name the field and the fix. |
| Validation | Terse. "Enter a full address, including the domain." |
| Success confirmation | Almost silent. "Copied." "Domain verified." No exclamation marks. |
| Destructive confirmation | Blunt about consequences. "This key stops working immediately." |
| Transactional email | Neutral, functional, one action. Sounds like the system, not a person. |
| Marketing email | Sounds like one engineer writing to another. First person singular is allowed. |
| Changelog | Factual, past tense, one line per change. |
| Status page | Clinical. Times, scope, impact. No apology theatre. |
| Careers | Warmer. First person plural. Specific about the work. |
| Sales / enterprise | Same voice, more numbers. Never a different personality. |

## Grammar and house style

- **Sentence case** for every heading, button, label, nav item, and table header.
- **Oxford comma:** yes.
- **Em dashes:** avoid. Use a comma, a colon, or a full stop.
- **Exclamation marks:** never in the product. Once a year in marketing, maybe.
- **Contractions:** yes. "Don't", "won't", "you'll". Formality reads as distance.
- **Numerals:** always digits. "3 retries", not "three retries".
- **Units:** no space before ms, s, KB, MB. "200ms", "1.4s", "12KB".
- **Percentages:** digit + %. "99.2%".
- **Time:** relative in tables ("2m", "11m", "1h", "6d"), absolute on hover and in detail views (ISO 8601, UTC).
- **Code, keys, IDs, headers, paths, status codes:** always in mono. Never in quotes.
- **Product nouns are lowercase** in prose: "create an api key", "add a domain" — except at the start of a sentence.
- **"Email" is a mass noun.** "Send email", "email volume". "Emails" only when counting discrete messages: "42 emails delivered".
- **Never "simply", "just", "obviously", "of course".** They tell the reader that their confusion is their fault.
- **No "please".** "Enter your domain" not "Please enter your domain."
- **Buttons are verbs.** "Send test email", "Add domain", "Revoke key". Not "Submit", not "OK".

## When there's nothing specific to say

Say less. A section with one true sentence beats a section with four hedged ones. If a feature genuinely has no distinguishing mechanism, describe what it does in the plainest possible terms and move on — don't reach for adjectives to fill the space.

And if you find yourself writing a paragraph to justify a feature's existence, the feature might be the problem, not the copy.

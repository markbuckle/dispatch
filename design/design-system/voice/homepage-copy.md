# Homepage copy — drop-in variants

## Hero variants

### 1 — Specific pain
> # Email that arrives.
> Transactional and marketing email over a clean HTTP API, with delivery you can actually debug. p50 under 200ms.
>
> [Get an API key] [Read the docs]

### 2 — Positioning
> # Email infrastructure you can debug.
> Every send traced from queue to inbox. See the status code, the retry, the client that broke your HTML.
>
> [Get an API key] [Read the docs]

### 3 — Audience-specific
> # For the person on your team who owns email.
> It's probably not their main job. Dispatch makes it a small one: one endpoint to send, one screen to see what happened.
>
> [Get an API key] [Read the docs]

### 4 — Direct challenge
> # Know why it bounced.
> Most email APIs tell you they accepted your request. Dispatch tells you what happened next.
>
> [Get an API key] [Read the docs]

## "Why Dispatch" bullets

### Variant A — mechanism-led
- **Send in one request.** `POST /emails` with a from, a to, and HTML. SDKs for 11 languages.
- **Trace every send.** Queue, sent, delivered, opened, bounced — with timestamps and the receiving server's response.
- **Catch broken HTML before you send.** 23 client and version combinations checked, with the offending property and line number.

### Variant B — problem-led
- **"It says delivered but they didn't get it."** Dispatch shows the receiving server's actual response, not just our acceptance.
- **"It looks fine in Gmail."** The compatibility checker tells you which of your 23 target clients will break, and on which line.
- **"Which key is that?"** Scoped keys, last-used timestamps, one-time reveal, instant revocation.

### Variant C — numbers-led
- **p50 under 200ms** from request to hand-off, across 4 sending regions.
- **72 hours of retries** with exponential backoff and per-ISP throttling.
- **23 client/version combinations** checked against your HTML on every save.

## How it works — three steps

> ### Three steps
>
> **1. Add your domain.** Paste three DNS records. Dispatch verifies DKIM, SPF and DMARC and tells you which one is wrong if verification fails.
>
> **2. Send a request.** One `POST` with a from, a to, and your HTML. Or import a template and pass variables.
>
> **3. Watch it land.** Every send appears in the log with its full delivery timeline. Webhooks fire on delivered, opened, bounced and complained.

## Pricing top-of-page

> # Pricing
> $0 for the first 3,000 emails a month. $20 per 50,000 after that. Dedicated IPs from $30.
>
> No seat pricing. No annual commitment. No sales call to see a number.

## Final CTA band

### Variant A
> ## Send your first email in four minutes.
> [Get an API key]

### Variant B
> ## Email reimagined? No. Email, explained.
> [Get an API key] [Read the docs]

### Variant C
> ## Your first 3,000 emails a month are free.
> No card, no call.
> [Get an API key]

## Internal page mini-heroes

**/features/compatibility**
> # See which client breaks your HTML.
> 23 client and version combinations, checked on every save. Property, affected clients, line number.

**/features/webhooks**
> # Know the moment it happens.
> Delivered, opened, clicked, bounced, complained. Signed payloads, 72 hours of retries, full attempt log.

**/features/domains**
> # DKIM, SPF, DMARC — verified, not assumed.
> Copy three records. Dispatch checks them continuously and tells you when one drifts.

**/features/logs**
> # Every request, kept.
> Method, path, status, duration. Expand any row for the full request and response body.

**/enterprise**
> # At 10M a month, the questions change.
> Dedicated IPs with managed warm-up, regional routing, SSO, a signed DPA, and an engineer who knows your setup.

**/docs**
> # Start with a POST.
> One endpoint, eleven SDKs, and a test mode that never sends a real email.

## About page opener

### Variant A
> We build email infrastructure. Before this, most of us were the person on our team who owned email and didn't especially want to.
>
> That job is mostly waiting: waiting to find out whether the password reset arrived, whether the DNS change propagated, whether the new template renders in Outlook. The information exists — it's just usually somewhere you can't see it. We moved it to the front.

### Variant B
> Dispatch started as an internal tool. We were sending about 400,000 emails a month through a provider that told us it had accepted every one of them, which was true and completely useless the week our bounce rate tripled.
>
> So we built the screen we wanted: every send, every retry, every receiving server's actual response. This is that, with an API in front of it.

## Boilerplate

**One sentence**
> Dispatch is an email API for developers, with delivery observability built into the primary surface.

**Two sentences**
> Dispatch is an email API for developers: transactional and marketing email over a clean HTTP interface. Every send is traceable from queue to inbox, and an HTML compatibility checker flags what will break in which client before you send.

**Paragraph — press and footer**
> Dispatch is an email API for developers. It handles transactional and marketing email over a clean HTTP interface, with SDKs for eleven languages and four sending regions. Unlike providers that report only their own acceptance of a request, Dispatch surfaces the full delivery timeline — queue, send, receiving-server response, retries, opens and bounces — alongside a compatibility checker that tests HTML against 23 email client and version combinations. Dispatch is based in San Francisco.

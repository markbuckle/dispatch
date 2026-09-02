# Voice — do and don't

Every pair below is the same message written twice.

## Homepage headline

- ✅ **Email that arrives.**
- ❌ The modern email platform for developers
- ❌ Supercharge your transactional email
- ❌ Email infrastructure, reimagined

## Homepage subcopy

- ✅ **Transactional and marketing email over a clean HTTP API, with delivery you can actually debug. p50 under 200ms.**
- ❌ Dispatch is a powerful, developer-first email platform that empowers teams to deliver seamless email experiences at scale.

## Section overline

- ✅ **Compatibility**
- ❌ INTRODUCING OUR REVOLUTIONARY NEW FEATURE

## Feature card

- ✅ **Client compatibility**
  Check your HTML against 23 client and version combinations before you send. See the property, the clients that break on it, and the line number.
- ❌ **Powerful Compatibility Engine**
  Our cutting-edge engine leverages advanced analysis to ensure your emails render beautifully everywhere.

## Primary CTA

- ✅ **Get an API key** · **Send a test email** · **Read the docs**
- ❌ Get Started Free! · Start Your Journey · Unlock Dispatch

## Pricing headline

- ✅ **$0 for the first 3,000 emails a month. $20 per 50,000 after that.**
- ❌ Flexible pricing that scales with your business

## Case study opener

- ✅ **Harborline moved 2.4M monthly sends off SendGrid in an afternoon. Their bounce rate dropped from 4.1% to 0.8% once DMARC was fixed.**
- ❌ Learn how Harborline transformed their email strategy and unlocked new growth with Dispatch.

## Email subject line

- ✅ **Your DKIM record is missing** · **API key created** · **3 domains need attention**
- ❌ 🚀 Important Update About Your Account!

## Email opening line

- ✅ **Your domain `harborline.co` failed verification. The DKIM TXT record isn't resolving.**
- ❌ Hi there! We hope this email finds you well. We wanted to reach out about something important.

## LinkedIn post opener

- ✅ **We checked 40,000 marketing emails against Outlook 2016. 71% had at least one property that silently fails.**
- ❌ Excited to share some thoughts on the future of email! 🧵

## Instagram caption opener

- ✅ **Twenty-three email clients. Four of them still don't support flexbox.**
- ❌ ✨ Email marketing has never been easier! Swipe to learn more 👉

## Error message

- ✅ **This key was revoked on 12 March. Create a new one to keep sending.**
- ❌ Oops! Something went wrong. Please try again later.

## Validation message

- ✅ **Enter a full address, including the domain.**
- ❌ Invalid input!

## Empty state

- ✅ **No emails yet.** Your first send will show up here.
  [Send a test email]
- ❌ **Nothing to see here!** 🎉 Looks like you haven't sent any emails yet. Get started by creating your first campaign and watch the magic happen!

## Destructive confirmation

- ✅ **Revoke `dsp_live_8Kq2…A0`?** Anything using this key stops sending immediately. This can't be undone.
  [Cancel] [Revoke key]
- ❌ **Are you sure?** This action cannot be undone. Please confirm you want to proceed.

## One-time key reveal

- ✅ **Copy your key now. This is the only time it will be shown.**
- ❌ Success! Your brand new API key is ready to go. Make sure to keep it somewhere safe!

## 404

- ✅ **No page at this address.** [Back to dashboard] [Docs]
- ❌ Uh oh! Looks like you're lost in space 🚀

## About page opener

- ✅ **We build email infrastructure. Before this, most of us were the person on our team who owned email and didn't want to.**
- ❌ Founded in 2024, Dispatch is on a mission to revolutionise the way the world sends email.

## Hiring post

- ✅ **Backend engineer, delivery. You'll own the retry pipeline: 72-hour windows, exponential backoff, per-ISP throttling. Rust and Postgres. Remote, EU hours.**
- ❌ Join our rocketship! We're looking for passionate, driven individuals to help us disrupt the email space.

## Status page

- ✅ **Elevated bounce rates in eu-west-1, 14:02–14:37 UTC. 2.1% of sends affected. Cause: an upstream MX timeout. Retries succeeded.**
- ❌ We experienced a brief service disruption. We sincerely apologise for any inconvenience this may have caused!

## Anti-pattern checklist

Before shipping any copy, confirm none of these are present:

- [ ] A word from the banned list in `vocabulary.md`
- [ ] Title Case in a heading
- [ ] An exclamation mark in the product
- [ ] An emoji
- [ ] A claim without a number or a name
- [ ] "Simply", "just", "easily", "please"
- [ ] A sentence over 25 words
- [ ] An em dash
- [ ] "We're excited to" / "We're thrilled to"
- [ ] A benefit stated without its mechanism
- [ ] Apology theatre in an error or status message
- [ ] The word "seamless"

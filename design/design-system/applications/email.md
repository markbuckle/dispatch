# Email

Dispatch sends email for a living. Ours has to be exemplary - and it has to survive the clients our own compatibility checker flags.

## Constraints, non-negotiable

- **600px** content width.
- **Tables for layout.** No flexbox, no grid, no float. Outlook 2016 and Windows Mail still don't support them.
- **Inline every style.** `<style>` in the head is stripped by several clients; keep it only as a progressive enhancement for media queries.
- **No web fonts.** They fail in Outlook, Gmail app, and Yahoo. Stack: `-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. Mono: `Menlo, Consolas, monospace`.
- **Images with explicit width and height**, plus `alt`. Assume they're blocked.
- **Nothing critical in an image.** Not the CTA, not the code, not the key.
- **Plain-text part always.** Not optional.
- **No background-image on a container.** VML fallback isn't worth the complexity.
- **No SVG.** PNG at 2×.
- Total under 100KB where possible - Gmail clips at 102KB.

## Dark mode

Most clients now respect `prefers-color-scheme`, but Outlook desktop inverts colours unpredictably. So:

**Build transactional email light**, with dark-mode overrides layered on. Inverse of the rest of the system, and the one place that's correct - an inverted transactional email in a light inbox reads as a phishing attempt.

```html
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
```

```css
@media (prefers-color-scheme: dark) {
  .body    { background: #08080A !important; }
  .surface { background: #111113 !important; }
  .text    { color: #EDEEF0 !important; }
  .muted   { color: #B0B4BA !important; }
  .border  { border-color: #2E3135 !important; }
}
```

Light-mode palette: `#FFFFFF` body, `#FCFCFD` surface, `#1C2024` text, `#60646C` muted, `#E8E8EC` border.

## Transactional template

```
600px, centred on #F9F9FB
┌────────────────────────────────────────┐
│  ◦──▸ Dispatch          120px, 32px pad│
├────────────────────────────────────────┤
│                                        │
│  Your domain failed verification       │  20px, 600, #1C2024
│                                        │
│  The DKIM TXT record for               │  15px/1.6, #60646C
│  harborline.co isn't resolving.        │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ resend._domainkey.harborline.co  │  │  mono 13px, #F0F0F3 bg
│  └──────────────────────────────────┘  │
│                                        │
│  [ Check your DNS records ]            │  40px, #1C2024 bg, white text
│                                        │
│  If you didn't change your DNS, this   │  13px, #80838D
│  may be a propagation delay. We'll     │
│  recheck for 72 hours.                 │
│                                        │
├────────────────────────────────────────┤
│  Dispatch · Docs · Status              │  13px, #80838D
│  Sent to ops@harborline.co             │
│  Unsubscribe (marketing only)          │
└────────────────────────────────────────┘
```

- 32px padding all sides, 24px on mobile.
- One primary action. A second is a text link, not a button.
- Buttons as a table cell with `bgcolor` + padding, never a styled `<a>` alone - Outlook ignores padding on inline elements.
- Subject line under 50 characters, no emoji, no "Re:" trickery.
- Preheader text: 90 characters, hidden div, actually useful. Never "View this email in your browser".

## Marketing email

Same constraints, warmer voice. First person singular is allowed - it should read like one engineer writing to another.

- No hero image. Lead with a sentence.
- Max 3 sections.
- One CTA, repeated at most twice.
- Unsubscribe in the footer at 13px, `#80838D`, actually legible. Never white-on-white or 8px.
- List-Unsubscribe header, always.

## Testing matrix

Before any send: Gmail web · Gmail iOS · Gmail Android · Apple Mail macOS · Apple Mail iOS · Outlook 2016 Windows · Outlook 365 web · Outlook iOS · Yahoo web · Proton web. Each in light and dark. That's the same matrix the compatibility checker runs.

## Never

Emoji in a subject line · countdown timers · embedded video · web fonts · `!important` spam to force a layout · fake personalisation ("Hey {{first_name|there}}") · a dark-mode-only design · text in an image · more than one primary CTA · "This email was sent to you because…" as the only explanation

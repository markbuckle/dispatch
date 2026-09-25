import { API_BASE_URL } from '../lib/api-url';
import { HeaderBorder } from './header-border';
import { Lockup, Mark } from './logo';

const request = `curl -X POST ${API_BASE_URL}/v1/emails \\
  -H "Authorization: Bearer $DISPATCH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "receipts@yourdomain.com",
    "to": "someone@example.com",
    "subject": "Your receipt",
    "html": "<p>Thanks for your order.</p>"
  }'`;

const events = [
  {
    at: '14:02:37.104',
    iso: '2026-09-06T14:02:37.104Z',
    name: 'queued',
    detail: 'eml_2n4x8kqf',
  },
  {
    at: '14:02:37.298',
    iso: '2026-09-06T14:02:37.298Z',
    name: 'sent',
    detail: 'mx1.example.com',
  },
  {
    at: '14:02:39.611',
    iso: '2026-09-06T14:02:39.611Z',
    name: 'delivered',
    detail: '250 2.0.0 OK',
  },
];

const navLink = 'dispatch-transition text-body text-text-secondary hover:text-text-primary';
const footerLink = 'dispatch-transition text-meta text-text-secondary hover:text-text-primary';
const overline = 'text-overline text-text-muted uppercase';

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-chip bg-text-primary px-4 py-2 text-meta text-text-inverse focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-3"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-10 bg-canvas">
        <nav className="relative mx-auto flex h-16 max-w-marketing items-center px-5 lg:px-8">
          <a href="/" aria-label="Dispatch home">
            <Lockup />
          </a>
          <a
            href="#features"
            className={`-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 hidden md:block ${navLink}`}
          >
            Features
          </a>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/login"
              className="dispatch-transition flex h-control-sm items-center whitespace-nowrap rounded-chip px-3 text-body text-text-secondary hover:bg-subtle hover:text-text-primary"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="dispatch-transition dispatch-cta flex items-center whitespace-nowrap rounded-lg px-3 py-1 text-body font-medium"
            >
              Sign up
            </a>
          </div>
        </nav>
        <HeaderBorder />
      </header>

      <main id="main">
        <section className="mx-auto max-w-marketing px-5 pt-32 pb-24 lg:px-8">
          <h1 className="dispatch-display-gradient font-serif text-display-2xl">
            Email for developers
          </h1>
          <p className="mt-6 max-w-reading text-body text-text-secondary">
            The best way to reach humans instead of spam folders other than Resend.<br></br> A
            portfolio project to deliver emails like the pros.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="/signup"
              className="dispatch-transition dispatch-cta flex items-center rounded-2xl px-4 py-2 text-body font-medium"
            >
              Get an API key
            </a>
            <a
              href="/docs"
              className="dispatch-transition flex h-control-lg items-center rounded-chip px-5 text-body font-medium text-text-secondary hover:bg-subtle hover:text-text-primary"
            >
              Read the docs
            </a>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-surface">
              <div
                className={`flex h-12 shrink-0 items-center border-border-subtle border-b bg-subtle px-5 ${overline}`}
              >
                Request
              </div>
              <pre className="flex-1 overflow-x-auto px-5 py-5 font-mono text-mono text-text-secondary">
                {request}
              </pre>
              <div className="flex h-12 shrink-0 items-center gap-3 border-border-subtle border-t px-5">
                <span className={overline}>Response</span>
                <code className="font-mono text-mono text-text-primary tabular-nums">202</code>
                <code className="truncate font-mono text-mono text-text-secondary">
                  {'{"id": "eml_2n4x8kqf", "status": "queued"}'}
                </code>
              </div>
            </div>

            <div className="flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-surface">
              <div className="flex h-12 shrink-0 items-center justify-between border-border-subtle border-b bg-subtle px-5">
                <span className={overline}>Delivery timeline</span>
                <span className="flex h-pill items-center rounded-chip bg-success-bg px-3 text-pill text-success-fg">
                  Delivered
                </span>
              </div>
              <ol className="flex flex-1 flex-col justify-center gap-8 overflow-x-auto px-5 py-5">
                {events.map((event) => (
                  <li key={event.iso} className="flex items-baseline gap-5">
                    <time
                      dateTime={event.iso}
                      className="font-mono text-mono text-text-muted tabular-nums"
                    >
                      {event.at}
                    </time>
                    <span className="w-20 shrink-0 text-meta text-text-primary">{event.name}</span>
                    <code className="font-mono text-mono text-text-secondary">{event.detail}</code>
                  </li>
                ))}
              </ol>
              <div className="flex h-12 shrink-0 items-center gap-3 border-border-subtle border-t px-5">
                <span className={overline}>Webhook</span>
                <code className="font-mono text-mono text-text-secondary">
                  POST /hooks/dispatch
                </code>
                <code className="ml-auto font-mono text-mono text-text-primary tabular-nums">
                  200
                </code>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative">
        <span aria-hidden="true" className="dispatch-glow absolute inset-x-0 top-0 h-40" />
        <span aria-hidden="true" className="dispatch-rule absolute inset-x-0 top-0 h-px" />
        <div className="relative mx-auto flex max-w-marketing flex-wrap items-center gap-x-8 gap-y-4 px-5 pt-16 pb-16 lg:px-8">
          <Mark />
          <div className="flex items-center gap-6">
            <a href="/docs" className={footerLink}>
              Docs
            </a>
            <a href="/changelog" className={footerLink}>
              Changelog
            </a>
            <a href="/privacy" className={footerLink}>
              Privacy
            </a>
          </div>
          <a href="/status" className={`flex items-center gap-2 ${footerLink}`}>
            <span className="size-2 rounded-full bg-success-fg" aria-hidden="true" />
            All systems operational
          </a>
          <span className="ml-auto text-caption text-text-muted">© 2026 Dispatch</span>
        </div>
      </footer>
    </>
  );
}

const request = `curl -X POST https://api.dispatch.dev/v1/emails \
  -H "Authorization: Bearer $DISPATCH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "you@yourdomain.com",
    "to": "someone@example.com",
    "subject": "Your receipt",
    "html": "<p>Thanks for your order.</p>"
  }'`;

const response = `{
  "id": "eml_2n4x8kqf",
  "status": "queued"
}`;

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
        <nav className="mx-auto flex h-12 max-w-marketing items-center gap-8 px-6">
          <span className="font-mono text-meta text-text-primary">dispatch</span>
          <ul className="hidden items-center gap-6 lg:flex">
            <li>
              <a href="/docs" className="text-body text-text-secondary hover:text-text-primary">
                Docs
              </a>
            </li>
            <li>
              <a href="/pricing" className="text-body text-text-secondary hover:text-text-primary">
                Pricing
              </a>
            </li>
            <li>
              <a
                href="/changelog"
                className="text-body text-text-secondary hover:text-text-primary"
              >
                Changelog
              </a>
            </li>
          </ul>
          <div className="ml-auto flex items-center gap-3">
            <a
              href="/sign-in"
              className="flex h-10 items-center rounded-chip px-3 text-body text-text-secondary hover:text-text-primary"
            >
              Sign in
            </a>
            <a
              href="/sign-up"
              className="flex h-10 items-center rounded-chip bg-text-primary px-4 text-body font-medium text-text-inverse"
            >
              Get an API key
            </a>
          </div>
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-marketing px-6">
        <section className="pt-32 pb-24">
          <h1 className="max-w-reading text-display-l text-text-primary">
            Send email from your code.
          </h1>
          <p className="mt-6 max-w-reading text-body text-text-secondary">
            One POST to send. Dispatch returns <code className="text-text-primary">202</code> with
            an id, queues the send, and posts every delivery event to your webhook.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="/sign-up"
              className="flex h-control-lg items-center rounded-chip bg-text-primary px-5 text-body font-medium text-text-inverse"
            >
              Get an API key
            </a>
            <a
              href="/docs"
              className="flex h-control-lg items-center rounded-chip border border-border-default px-5 text-body text-text-secondary hover:text-text-primary"
            >
              Read the docs
            </a>
          </div>

          <div className="mt-16 overflow-hidden rounded-lg border border-border-subtle bg-surface">
            <div className="flex h-12 items-center border-border-subtle border-b px-5">
              <span className="text-overline text-text-muted uppercase">Request</span>
            </div>
            <pre className="overflow-x-auto px-5 py-5 font-mono text-mono text-text-secondary">
              {request}
            </pre>
            <div className="flex h-12 items-center gap-3 border-border-subtle border-t border-b px-5">
              <span className="text-overline text-text-muted uppercase">Response</span>
              <span className="font-mono text-mono text-success-fg">202 Accepted</span>
            </div>
            <pre className="overflow-x-auto px-5 py-5 font-mono text-mono text-text-secondary">
              {response}
            </pre>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-marketing px-6 pt-16 pb-10">
        <div className="flex flex-wrap items-center gap-4 border-border-subtle border-t pt-6">
          <span className="font-mono text-meta text-text-primary">dispatch</span>
          <a href="/status" className="flex items-center gap-2 text-caption text-text-secondary">
            <span className="size-2 rounded-full bg-success-fg" aria-hidden="true" />
            All systems operational
          </a>
          <span className="ml-auto text-caption text-text-muted">Dispatch 2026</span>
        </div>
      </footer>
    </>
  );
}

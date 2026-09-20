'use client';

import { useState } from 'react';

export function EmailHtml({ html }: { html: string }) {
  const [showsSource, setShowsSource] = useState(false);

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center justify-between gap-4">
        <h2 className="text-meta font-medium text-text-secondary">HTML</h2>
        <button
          type="button"
          onClick={() => setShowsSource(!showsSource)}
          className="dispatch-transition h-7 shrink-0 rounded-sm bg-hover px-2.5 text-caption font-medium text-text-secondary outline-none hover:bg-border-default hover:text-text-primary focus-visible:shadow-focus"
        >
          {showsSource ? 'Preview' : 'Source'}
        </button>
      </header>
      {showsSource ? (
        <pre className="overflow-x-auto rounded-lg border border-border-default bg-subtle p-4 font-mono text-mono text-text-secondary">
          {html}
        </pre>
      ) : (
        <div className="flex justify-center rounded-lg border border-border-default bg-subtle p-6">
          <iframe
            title="Email preview"
            srcDoc={html}
            // no allow-scripts: the body came from a public api and runs in the dashboard's own origin otherwise
            sandbox=""
            className="h-[480px] w-full max-w-email rounded-sm bg-preview-paper"
          />
        </div>
      )}
    </section>
  );
}

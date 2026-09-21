'use client';

import {
  renderTemplate,
  type TemplateContent,
  templateVariableNames,
} from '@dispatch/core/templates';
import { useEffect, useId, useState } from 'react';
import { fieldLabel, smallInputField } from '../field-styles';

// srcDoc reparses the document on every keystroke, and the sandbox denies the only other way to write into it
const PREVIEW_DELAY = 200;

export function TemplatePreview({ template }: { template: TemplateContent }) {
  const baseId = useId();
  const [samples, setSamples] = useState<Record<string, string>>({});

  const names = templateVariableNames(template);
  // an emptied box means not filled in yet, while the engine counts a supplied empty string as a real value
  const supplied = Object.fromEntries(Object.entries(samples).filter(([, value]) => value !== ''));
  const result = renderTemplate(template, supplied);
  const renderedHtml = result.ok ? result.rendered.html : null;
  const [previewHtml, setPreviewHtml] = useState(renderedHtml);

  useEffect(() => {
    const timer = setTimeout(() => setPreviewHtml(renderedHtml), PREVIEW_DELAY);
    return () => clearTimeout(timer);
  }, [renderedHtml]);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-meta font-medium text-text-secondary">Preview</h2>

      {names.length > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-border-default p-4">
          <p className={fieldLabel}>Sample values</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {names.map((name) => (
              <div key={name} className="flex min-w-0 flex-col gap-1.5">
                <label
                  htmlFor={`${baseId}-${name}`}
                  className="truncate font-mono text-mono text-text-secondary"
                >
                  {name}
                </label>
                <input
                  id={`${baseId}-${name}`}
                  value={samples[name] ?? ''}
                  onChange={(event) => setSamples({ ...samples, [name]: event.target.value })}
                  autoComplete="off"
                  spellCheck={false}
                  className={smallInputField}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {template.html.trim() === '' ? (
        <p className="rounded-lg border border-border-default p-4 text-body text-text-muted">
          Nothing to preview yet. Add an html body.
        </p>
      ) : result.ok ? (
        <div className="flex flex-col gap-3">
          <p className="truncate text-body text-text-primary">{result.rendered.subject}</p>
          <div className="flex justify-center rounded-lg border border-border-default bg-subtle p-6">
            <iframe
              title="Template preview"
              srcDoc={previewHtml ?? ''}
              // no allow-scripts: one policy for rendering arbitrary html anywhere in the dashboard
              sandbox=""
              className="h-[480px] w-full max-w-email rounded-sm bg-preview-paper"
            />
          </div>
          {result.rendered.text && (
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border-default bg-subtle p-4 font-mono text-mono text-text-secondary">
              {result.rendered.text}
            </pre>
          )}
        </div>
      ) : (
        <p className="rounded-lg border border-border-default p-4 text-body text-text-secondary">
          Fill in a sample value for{' '}
          <span className="font-mono text-mono text-text-primary">{result.missing.join(', ')}</span>{' '}
          to see this render.
        </p>
      )}
    </section>
  );
}

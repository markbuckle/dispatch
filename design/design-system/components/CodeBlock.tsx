import * as React from 'react';
import { cn } from './cn';

/**
 * Mono for anything a developer would copy. Line numbers in text-muted,
 * no radius on the interior, copy button in the header.
 */
export function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers,
  className,
}: {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const lines = code.replace(/\n$/, '').split('\n');

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border-default bg-canvas', className)}>
      <div className="flex items-center justify-between gap-4 border-b border-border-subtle bg-subtle px-3 py-2">
        <span className="truncate font-mono text-[11.5px] text-text-muted">{filename ?? language ?? 'shell'}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}
          className="h-6 shrink-0 rounded-sm px-2 text-caption font-medium text-text-muted outline-none transition-colors duration-fast ease-out hover:bg-hover hover:text-text-primary focus-visible:shadow-focus"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[13px] leading-relaxed text-text-secondary">
        <code>
          {lines.map((line, i) => (
            <span key={i} className="grid grid-cols-[auto_1fr] gap-3">
              {showLineNumbers && (
                <span className="select-none text-right tabular-nums text-text-placeholder">{i + 1}</span>
              )}
              <span>{line || ' '}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

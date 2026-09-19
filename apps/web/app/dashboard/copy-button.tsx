'use client';

import { useState } from 'react';

// Copy confirmation is a label swap held for 1400ms, per foundations/motion.md
export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [hasCopied, setHasCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="dispatch-transition h-7 shrink-0 rounded-sm bg-hover px-2.5 text-caption font-medium text-text-secondary outline-none hover:bg-border-default hover:text-text-primary focus-visible:shadow-focus"
    >
      {hasCopied ? 'Copied' : 'Copy'}
      {label && <span className="sr-only"> {label}</span>}
    </button>
  );
}

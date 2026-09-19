'use client';

import { useState, useTransition } from 'react';
import { smallButton } from '../button-styles';
import { checkDomainStatus } from './actions';

export function CheckDomainButton({ id }: { id: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheck() {
    setError(null);

    startTransition(async () => {
      try {
        const result = await checkDomainStatus(id);
        if (result.status === 'rejected') setError(result.message);
      } catch {
        setError("The check didn't complete. Try again.");
      }
    });
  }

  return (
    <>
      {error && <span className="text-caption text-danger-fg">{error}</span>}
      <button type="button" onClick={handleCheck} disabled={isPending} className={smallButton}>
        {isPending ? 'Checking' : 'Check now'}
      </button>
    </>
  );
}

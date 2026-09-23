'use client';

import { useState, useTransition } from 'react';
import { smallButton } from '../../button-styles';
import { replayDelivery } from '../actions';

export function ReplayDeliveryButton({ id }: { id: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleReplay() {
    startTransition(async () => {
      const result = await replayDelivery(id);
      setError(result.status === 'rejected' ? result.message : null);
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-meta text-danger-fg">{error}</span>}
      <button type="button" onClick={handleReplay} disabled={isPending} className={smallButton}>
        {isPending ? 'Queueing' : 'Replay'}
      </button>
    </div>
  );
}

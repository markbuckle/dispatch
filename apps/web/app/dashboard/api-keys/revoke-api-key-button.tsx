'use client';

import { useState, useTransition } from 'react';
import { dangerButton, secondaryButton, smallButton } from '../button-styles';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../dialog';
import { revokeApiKey } from './actions';

export function RevokeApiKeyButton({ id, keyPrefix }: { id: string; keyPrefix: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) setError(null);
  }

  function handleRevoke() {
    startTransition(async () => {
      const result = await revokeApiKey(id);
      if (result.status === 'rejected') {
        setError(result.message);
        return;
      }
      setIsOpen(false);
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <button type="button" onClick={() => setIsOpen(true)} className={smallButton}>
        Revoke
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Revoke <span className="font-mono text-mono">{keyPrefix}…</span>?
          </DialogTitle>
          <DialogDescription>
            Anything using this key stops sending immediately. This can't be undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <DialogBody>
            <p className="text-caption text-danger-fg">{error}</p>
          </DialogBody>
        )}
        <DialogFooter>
          <DialogClose className={secondaryButton}>Cancel</DialogClose>
          <button
            type="button"
            onClick={handleRevoke}
            disabled={isPending}
            className={dangerButton}
          >
            {isPending ? 'Revoking' : 'Revoke key'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

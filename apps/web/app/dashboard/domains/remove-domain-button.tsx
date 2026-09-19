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
import { removeDomain } from './actions';

export function RemoveDomainButton({ id, name }: { id: string; name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) setError(null);
  }

  function handleRemove() {
    setError(null);

    startTransition(async () => {
      try {
        const result = await removeDomain(id);
        if (result.status === 'rejected') {
          setError(result.message);
          return;
        }
        setIsOpen(false);
      } catch {
        setError("The domain wasn't removed. Try again.");
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <button type="button" onClick={() => setIsOpen(true)} className={smallButton}>
        Remove
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove {name}?</DialogTitle>
          <DialogDescription>
            Dispatch deletes its SES identity. Adding it again issues new DKIM records, so the ones
            in your DNS stop matching.
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
            onClick={handleRemove}
            disabled={isPending}
            className={dangerButton}
          >
            {isPending ? 'Removing' : 'Remove domain'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

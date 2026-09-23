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
import { deleteWebhook } from './actions';

export function DeleteWebhookButton({ id, url }: { id: string; url: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) setError(null);
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteWebhook(id);
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
        Delete
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this endpoint?</DialogTitle>
          <DialogDescription>
            Dispatch stops sending to <span className="font-mono text-mono">{url}</span>. Its
            delivery history goes with it.
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
            onClick={handleDelete}
            disabled={isPending}
            className={dangerButton}
          >
            {isPending ? 'Deleting' : 'Delete endpoint'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

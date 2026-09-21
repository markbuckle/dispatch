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
import { removeTemplate } from './actions';

export function DeleteTemplateButton({ id, name }: { id: string; name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) setError(null);
  }

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      try {
        const result = await removeTemplate(id);
        if (result.status === 'rejected') {
          setError(result.message);
          return;
        }
        setIsOpen(false);
      } catch {
        setError("The template wasn't deleted. Try again.");
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <button type="button" onClick={() => setIsOpen(true)} className={smallButton}>
        Delete
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {name}?</DialogTitle>
          <DialogDescription>
            The subject and both bodies go with it. This can't be undone.
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
            {isPending ? 'Deleting' : 'Delete template'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

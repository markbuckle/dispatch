'use client';

import { useId, useState, useTransition } from 'react';
import { dangerButton, secondaryButton } from '../button-styles';
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
import { fieldLabel, inputField } from '../field-styles';
import { deleteAccount } from './actions';

export function DeleteAccountDialog({ email }: { email: string }) {
  const confirmationId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setConfirmation('');
      setError(null);
    }
  }

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      try {
        const result = await deleteAccount();
        setError(result.message);
      } catch {
        setError("Your account wasn't deleted. Try again.");
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <button type="button" onClick={() => setIsOpen(true)} className={`${dangerButton} w-max`}>
        Delete account
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            Every domain, API key, template and email goes with it. Dispatch cannot bring any of it
            back.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-[7px]">
            <label htmlFor={confirmationId} className={fieldLabel}>
              Type {email} to confirm
            </label>
            <input
              id={confirmationId}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              className={inputField}
            />
            {error && <p className="text-caption text-danger-fg">{error}</p>}
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose className={secondaryButton}>Cancel</DialogClose>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending || confirmation !== email}
            className={dangerButton}
          >
            {isPending ? 'Deleting' : 'Delete account'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

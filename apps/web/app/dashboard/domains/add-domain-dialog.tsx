'use client';

import type { Domain } from '@dispatch/db';
import { type FormEvent, useId, useState, useTransition } from 'react';
import { primaryButton, secondaryButton } from '../button-styles';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog';
import { createDomain } from './actions';
import { DnsRecords } from './dns-records';

export function AddDomainDialog() {
  const nameId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [addedDomain, setAddedDomain] = useState<Domain | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setName('');
      setAddedDomain(null);
      setError(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await createDomain({ name });
        if (result.status === 'rejected') {
          setError(result.message);
          return;
        }
        setAddedDomain(result.domain);
      } catch {
        setError("Dispatch couldn't add that domain. Try again.");
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger className={primaryButton}>Add domain</DialogTrigger>
      <DialogContent size={addedDomain ? 'wide' : 'default'}>
        {addedDomain ? (
          <>
            <DialogHeader>
              <DialogTitle>Add these records to your DNS</DialogTitle>
              <DialogDescription>
                Add each one as a CNAME record. SES verifies {addedDomain.name} once it finds all 3.
                You can open them again from DNS records in the domains table.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <DnsRecords
                name={addedDomain.name}
                dkimTokens={addedDomain.dkimTokens}
                dkimHostedZone={addedDomain.dkimHostedZone}
              />
            </DialogBody>
            <DialogFooter>
              <DialogClose className={primaryButton}>Done</DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add domain</DialogTitle>
              <DialogDescription>
                Dispatch creates 3 DKIM records for you to add at your DNS provider.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className="flex flex-col gap-[7px]">
                <label htmlFor={nameId} className="text-caption font-medium text-text-secondary">
                  Domain
                </label>
                <input
                  id={nameId}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="mail.harborline.co"
                  autoComplete="off"
                  spellCheck={false}
                  className="dispatch-transition h-control-lg rounded-md border border-border-default bg-surface px-3.5 text-body text-text-primary outline-none placeholder:text-text-placeholder hover:border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,144,255,0.22)]"
                />
                {error && <p className="text-caption text-danger-fg">{error}</p>}
              </div>
            </DialogBody>
            <DialogFooter>
              <DialogClose className={secondaryButton}>Cancel</DialogClose>
              <button
                type="submit"
                disabled={isPending || name.trim() === ''}
                className={primaryButton}
              >
                {isPending ? 'Adding' : 'Add domain'}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

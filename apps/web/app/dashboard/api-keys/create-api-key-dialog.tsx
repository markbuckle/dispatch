'use client';

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
import { createApiKey } from './actions';
import { type ApiKeyPermission, permissionLabels, permissionOptions } from './permissions';

export function CreateApiKeyDialog() {
  const nameId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [permission, setPermission] = useState<ApiKeyPermission | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    // closing is the only exit from the reveal, so this is where the raw key stops existing
    if (!open) {
      setName('');
      setPermission(null);
      setCreatedKey(null);
      setError(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!permission) return;

    startTransition(async () => {
      const result = await createApiKey({ name, permission });
      if (result.status === 'rejected') {
        setError(result.message);
        return;
      }
      setCreatedKey(result.key);
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger className={primaryButton}>Create API key</DialogTrigger>
      <DialogContent
        onInteractOutside={(event) => {
          // a stray click outside would be the last chance anyone has to copy the key
          if (createdKey) event.preventDefault();
        }}
      >
        {createdKey ? (
          <>
            <DialogHeader>
              <DialogTitle>API key created</DialogTitle>
              <DialogDescription>
                Copy your key now. This is the only time it will be shown.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className="flex flex-col gap-3">
                <CopyField value={createdKey} />
                <p className="rounded-md border border-warning-edge bg-warning-tint px-3 py-2.5 text-caption text-warning-fg">
                  Dispatch stores a hash of this key, not the key itself. If you lose it, create
                  another one.
                </p>
              </div>
            </DialogBody>
            <DialogFooter>
              <DialogClose className={primaryButton}>Done</DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>
                The key is shown once, when it is created, and never again.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-[7px]">
                  <label htmlFor={nameId} className="text-caption font-medium text-text-secondary">
                    Name
                  </label>
                  <input
                    id={nameId}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Production server"
                    maxLength={40}
                    autoComplete="off"
                    className="dispatch-transition h-control-lg rounded-md border border-border-default bg-surface px-3.5 text-body text-text-primary outline-none placeholder:text-text-placeholder hover:border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,144,255,0.22)]"
                  />
                </div>

                <fieldset className="flex flex-col gap-2">
                  <legend className="pb-[7px] text-caption font-medium text-text-secondary">
                    Permission
                  </legend>
                  {permissionOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`dispatch-transition flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-3 has-[:focus-visible]:shadow-focus ${
                        permission === option.value
                          ? 'border-border-strong bg-hover'
                          : 'border-border-default bg-canvas hover:border-border-strong'
                      }`}
                    >
                      <input
                        type="radio"
                        name="permission"
                        value={option.value}
                        checked={permission === option.value}
                        onChange={() => setPermission(option.value)}
                        className="sr-only"
                      />
                      <span className="flex flex-1 flex-col gap-1">
                        <span className="text-body text-text-primary">
                          {permissionLabels[option.value]}
                        </span>
                        <span className="text-caption text-text-muted">{option.description}</span>
                      </span>
                      {permission === option.value && <CheckIcon />}
                    </label>
                  ))}
                </fieldset>

                {error && <p className="text-caption text-danger-fg">{error}</p>}
              </div>
            </DialogBody>
            <DialogFooter>
              <DialogClose className={secondaryButton}>Cancel</DialogClose>
              <button
                type="submit"
                disabled={isPending || name.trim() === '' || permission === null}
                className={primaryButton}
              >
                {isPending ? 'Creating' : 'Create key'}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Copy confirmation is a label swap held for 1400ms, per foundations/motion.md
function CopyField({ value }: { value: string }) {
  const [hasCopied, setHasCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 1400);
  }

  return (
    <div className="flex h-control-lg items-center gap-2 rounded-md border border-border-default bg-surface pr-1 pl-3.5">
      <span className="flex-1 truncate font-mono text-mono text-text-secondary">{value}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="dispatch-transition h-7 shrink-0 rounded-sm bg-hover px-2.5 text-caption font-medium text-text-secondary outline-none hover:bg-border-default hover:text-text-primary focus-visible:shadow-focus"
      >
        {hasCopied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-text-primary"
      aria-hidden
    >
      <path d="M7 17 L13 23 L25 9" />
    </svg>
  );
}

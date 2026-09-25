'use client';

import { type FormEvent, useId, useState, useTransition } from 'react';
import { primaryButton } from '../button-styles';
import { fieldLabel, inputField } from '../field-styles';
import { updateEmail } from './actions';

export function EmailForm({ email }: { email: string }) {
  const emailId = useId();
  const [address, setAddress] = useState(email);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSentTo(null);

    startTransition(async () => {
      try {
        const result = await updateEmail({ email: address });
        if (result.status === 'rejected') {
          setError(result.message);
          return;
        }
        setSentTo(address.trim());
      } catch {
        setError("That address wasn't submitted. Try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[7px]">
      <label htmlFor={emailId} className={fieldLabel}>
        Email address
      </label>
      <div className="flex items-center gap-2">
        <input
          id={emailId}
          type="email"
          value={address}
          onChange={(event) => {
            setAddress(event.target.value);
            setSentTo(null);
          }}
          autoComplete="email"
          className={`${inputField} max-w-dialog flex-1`}
        />
        <button
          type="submit"
          disabled={isPending || address.trim() === '' || address.trim() === email}
          className={primaryButton}
        >
          {isPending ? 'Sending' : 'Update email'}
        </button>
      </div>
      {error && <p className="text-caption text-danger-fg">{error}</p>}
      {sentTo && (
        <p className="text-caption text-text-muted">
          Check {sentTo} for a confirmation link. The address changes when you follow it.
        </p>
      )}
    </form>
  );
}

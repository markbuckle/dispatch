'use client';

import { type FormEvent, useId, useState, useTransition } from 'react';
import { primaryButton } from '../button-styles';
import { fieldLabel, inputField } from '../field-styles';
import { updateDisplayName } from './actions';

export function DisplayNameForm({ displayName }: { displayName: string | null }) {
  const nameId = useId();
  const [name, setName] = useState(displayName ?? '');
  const [error, setError] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setHasSaved(false);

    startTransition(async () => {
      try {
        const result = await updateDisplayName({ name });
        if (result.status === 'rejected') {
          setError(result.message);
          return;
        }
        setHasSaved(true);
      } catch {
        setError("Your name wasn't saved. Try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[7px]">
      <label htmlFor={nameId} className={fieldLabel}>
        Display name
      </label>
      <div className="flex items-center gap-2">
        <input
          id={nameId}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setHasSaved(false);
          }}
          placeholder="Ada Lovelace"
          maxLength={80}
          autoComplete="name"
          className={`${inputField} max-w-dialog flex-1`}
        />
        <button type="submit" disabled={isPending || name.trim() === ''} className={primaryButton}>
          {isPending ? 'Saving' : 'Save'}
        </button>
      </div>
      {error && <p className="text-caption text-danger-fg">{error}</p>}
      {hasSaved && <p className="text-caption text-text-muted">Saved.</p>}
    </form>
  );
}

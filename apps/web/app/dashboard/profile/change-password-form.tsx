'use client';

import { type FormEvent, useId, useState, useTransition } from 'react';
import { primaryButton, secondaryButton } from '../button-styles';
import { fieldLabel, inputField } from '../field-styles';
import { changePassword } from './actions';

export function ChangePasswordForm() {
  const passwordId = useId();
  const confirmPasswordId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasChanged, setHasChanged] = useState(false);
  const [isPending, startTransition] = useTransition();

  function close() {
    setIsOpen(false);
    setPassword('');
    setConfirmPassword('');
    setError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await changePassword({ password, confirmPassword });
        if (result.status === 'rejected') {
          setError(result.message);
          return;
        }
        close();
        setHasChanged(true);
      } catch {
        setError("Your password wasn't changed. Try again.");
      }
    });
  }

  if (!isOpen) {
    return (
      <div className="flex flex-col gap-[7px]">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setHasChanged(false);
          }}
          className={`${primaryButton} w-max`}
        >
          Change password
        </button>
        {hasChanged && <p className="text-caption text-text-muted">Password changed.</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-dialog flex-col gap-5">
      <div className="flex flex-col gap-[7px]">
        <label htmlFor={passwordId} className={fieldLabel}>
          New password
        </label>
        <input
          id={passwordId}
          type="password"
          minLength={12}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputField}
        />
        <span className="text-caption text-text-muted">At least 12 characters.</span>
      </div>

      <div className="flex flex-col gap-[7px]">
        <label htmlFor={confirmPasswordId} className={fieldLabel}>
          Confirm password
        </label>
        <input
          id={confirmPasswordId}
          type="password"
          minLength={12}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className={inputField}
        />
      </div>

      {error && <p className="text-caption text-danger-fg">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending || password === '' || confirmPassword === ''}
          className={primaryButton}
        >
          {isPending ? 'Saving' : 'Save new password'}
        </button>
        <button type="button" onClick={close} disabled={isPending} className={secondaryButton}>
          Cancel
        </button>
      </div>
    </form>
  );
}

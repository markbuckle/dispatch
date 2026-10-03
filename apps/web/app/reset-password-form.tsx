'use client';

import Link from 'next/link';
import { type FormEvent, useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';
import { AuthShell } from './auth-shell';
import { PasswordInput } from './password-input';

export function ResetPasswordForm() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setReady(true);
    });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
    } else {
      window.location.href = '/login';
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle={ready && !hasSession ? 'This link is invalid or has expired.' : undefined}
    >
      {!ready ? null : !hasSession ? (
        <p className="text-center text-caption text-text-secondary">
          <Link href="/forgot-password" className="text-text-primary hover:underline">
            Request a new link
          </Link>
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-[7px]">
            <label htmlFor="password" className="text-caption font-medium text-text-secondary">
              New password
            </label>
            <PasswordInput
              id="password"
              required
              minLength={12}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <span className="text-caption text-text-muted">At least 12 characters.</span>
          </div>

          <div className="flex flex-col gap-[7px]">
            <label
              htmlFor="confirmPassword"
              className="text-caption font-medium text-text-secondary"
            >
              Confirm password
            </label>
            <PasswordInput
              id="confirmPassword"
              required
              minLength={12}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          {error && <p className="text-caption text-danger-fg">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="dispatch-transition flex h-control items-center justify-center rounded-md bg-text-primary text-body font-medium text-text-inverse outline-none hover:bg-white focus-visible:shadow-focus active:bg-[#C8CACD] disabled:cursor-not-allowed disabled:bg-border-default disabled:text-text-muted"
          >
            {submitting ? 'Saving' : 'Save new password'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

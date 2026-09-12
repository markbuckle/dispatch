'use client';

import Link from 'next/link';
import { type FormEvent, useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';
import { AuthShell } from './auth-shell';

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
    <AuthShell>
      <div className="rounded-lg border border-border-default bg-surface p-6 shadow-ring">
        <h1 className="text-h3 text-text-primary">Set a new password</h1>

        {!ready ? null : !hasSession ? (
          <>
            <p className="mt-1.5 text-caption text-text-secondary">
              This link is invalid or has expired.
            </p>
            <p className="mt-5 text-center text-caption text-text-secondary">
              <Link href="/forgot-password" className="text-text-primary hover:underline">
                Request a new link
              </Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="password" className="text-caption font-medium text-text-secondary">
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="dispatch-transition h-control-lg rounded-md border border-border-default bg-surface px-3.5 text-body text-text-primary outline-none placeholder:text-text-placeholder hover:border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,144,255,0.22)]"
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
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="dispatch-transition h-control-lg rounded-md border border-border-default bg-surface px-3.5 text-body text-text-primary outline-none placeholder:text-text-placeholder hover:border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,144,255,0.22)]"
              />
            </div>

            {error && <p className="text-caption text-danger-fg">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="dispatch-transition flex h-control items-center justify-center rounded-md bg-text-primary text-body font-medium text-text-inverse outline-none hover:bg-white focus-visible:shadow-focus active:bg-[#C8CACD] disabled:cursor-not-allowed disabled:bg-border-default disabled:text-text-muted"
            >
              {submitting ? 'Saving...' : 'Save new password'}
            </button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}

'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { createClient } from '../lib/supabase/client';
import { AuthShell } from './auth-shell';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    if (resetError) {
      setError(resetError.message);
      setSubmitting(false);
    } else {
      setSent(true);
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="rounded-lg border border-border-default bg-surface p-6 shadow-ring">
        <h1 className="text-h3 text-text-primary">Forgot password</h1>
        <p className="mt-1.5 text-caption text-text-secondary">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {sent ? (
          <p className="mt-5 text-caption text-success-fg">
            If an account exists for that email, we&apos;ve sent a reset link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="email" className="text-caption font-medium text-text-secondary">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="dispatch-transition h-control-lg rounded-md border border-border-default bg-surface px-3.5 text-body text-text-primary outline-none placeholder:text-text-placeholder hover:border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,144,255,0.22)]"
              />
            </div>

            {error && <p className="text-caption text-danger-fg">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="dispatch-transition flex h-control items-center justify-center rounded-md bg-text-primary text-body font-medium text-text-inverse outline-none hover:bg-white focus-visible:shadow-focus active:bg-[#C8CACD] disabled:cursor-not-allowed disabled:bg-border-default disabled:text-text-muted"
            >
              {submitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-caption text-text-secondary">
          <Link href="/login" className="text-text-primary hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

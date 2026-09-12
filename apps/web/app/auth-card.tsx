'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { createClient } from '../lib/supabase/client';
import { AuthShell } from './auth-shell';

type Mode = 'login' | 'signup';

export function AuthCard({ mode }: { mode: Mode }) {
  const isSignup = mode === 'signup';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<'google' | 'github' | null>(null);

  async function handleOAuth(provider: 'google' | 'github') {
    setError(null);
    setOauthProvider(provider);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setError(oauthError.message);
      setOauthProvider(null);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    const supabase = createClient();

    if (isSignup) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (signUpError) {
        setError(signUpError.message);
        setSubmitting(false);
      } else if (data.user && data.user.identities?.length === 0) {
        // Supabase returns a 200 with an empty identities array for an email that's
        // already registered, and sends no email - an anti-enumeration measure, not a bug
        setError('An account with this email already exists. Try logging in instead.');
        setSubmitting(false);
      } else if (!data.session) {
        setNotice('Check your email to confirm your account.');
        setSubmitting(false);
      } else {
        window.location.href = '/';
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setSubmitting(false);
      } else {
        window.location.href = '/';
      }
    }
  }

  const disabled = submitting || oauthProvider !== null;

  return (
    <AuthShell>
      <div className="mb-4 flex h-control w-full items-center gap-0.5 rounded-md border border-border-default bg-subtle p-0.5">
        <Link
          href="/login"
          className={`dispatch-transition flex h-7 flex-1 items-center justify-center rounded-sm text-caption font-medium ${
            isSignup ? 'text-text-muted hover:text-text-secondary' : 'bg-hover text-text-primary'
          }`}
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className={`dispatch-transition flex h-7 flex-1 items-center justify-center rounded-sm text-caption font-medium ${
            isSignup ? 'bg-hover text-text-primary' : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          Sign up
        </Link>
      </div>

      <div className="rounded-lg border border-border-default bg-surface p-6 shadow-ring">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={disabled}
            className="dispatch-transition flex h-control items-center justify-center gap-2.5 rounded-md border border-border-default bg-subtle text-body font-medium text-text-primary outline-none hover:border-border-strong hover:bg-hover focus-visible:shadow-focus disabled:cursor-not-allowed disabled:text-text-placeholder"
          >
            <GoogleLogo />
            {isSignup ? 'Sign up with Google' : 'Continue with Google'}
          </button>
          <button
            type="button"
            onClick={() => handleOAuth('github')}
            disabled={disabled}
            className="dispatch-transition flex h-control items-center justify-center gap-2.5 rounded-md border border-border-default bg-subtle text-body font-medium text-text-primary outline-none hover:border-border-strong hover:bg-hover focus-visible:shadow-focus disabled:cursor-not-allowed disabled:text-text-placeholder"
          >
            <GitHubLogo />
            {isSignup ? 'Sign up with GitHub' : 'Continue with GitHub'}
          </button>
        </div>

        <div aria-hidden="true" className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border-subtle" />
          <span className="text-caption text-text-muted">or</span>
          <span className="h-px flex-1 bg-border-subtle" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-[7px]">
            <div className="flex items-baseline justify-between">
              <label htmlFor="password" className="text-caption font-medium text-text-secondary">
                Password
              </label>
              {!isSignup && (
                <a
                  href="/forgot-password"
                  className="dispatch-transition text-caption text-text-muted hover:text-text-primary"
                >
                  Forgot password?
                </a>
              )}
            </div>
            <input
              id="password"
              type="password"
              required
              minLength={isSignup ? 12 : undefined}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="dispatch-transition h-control-lg rounded-md border border-border-default bg-surface px-3.5 text-body text-text-primary outline-none placeholder:text-text-placeholder hover:border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,144,255,0.22)]"
            />
            {isSignup && (
              <span className="text-caption text-text-muted">At least 12 characters.</span>
            )}
          </div>

          {error && <p className="text-caption text-danger-fg">{error}</p>}
          {notice && <p className="text-caption text-success-fg">{notice}</p>}

          <button
            type="submit"
            disabled={disabled}
            className="dispatch-transition flex h-control items-center justify-center rounded-md bg-text-primary text-body font-medium text-text-inverse outline-none hover:bg-white focus-visible:shadow-focus active:bg-[#C8CACD] disabled:cursor-not-allowed disabled:bg-border-default disabled:text-text-muted"
          >
            {submitting
              ? isSignup
                ? 'Creating account...'
                : 'Logging in...'
              : isSignup
                ? 'Create account'
                : 'Log in'}
          </button>
        </form>

        {isSignup && (
          <p className="mt-5 text-caption text-text-muted">
            By signing up, you agree to the{' '}
            <a
              href="/terms"
              className="dispatch-transition text-text-secondary hover:text-text-primary"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              className="dispatch-transition text-text-secondary hover:text-text-primary"
            >
              Privacy Policy
            </a>
            .
          </p>
        )}

        <p className="mt-5 text-center text-caption text-text-secondary">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <Link href="/login" className="text-text-primary hover:underline">
                Log in
              </Link>
            </>
          ) : (
            <>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-text-primary hover:underline">
                Sign up
              </Link>
            </>
          )}
        </p>
      </div>
    </AuthShell>
  );
}

// Trademark, not iconography - DECISIONS.md #4. Filled, full-colour, unmodified.
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.5 14.5 0 0 1-.76-4.59c0-1.59.27-3.13.76-4.59l-7.98-6.19A24 24 0 0 0 0 24c0 3.87.92 7.53 2.56 10.78z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.91-2.14 15.89-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

// Trademark, not iconography - DECISIONS.md #4. Single-colour mark, currentColor for dark surfaces.
function GitHubLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

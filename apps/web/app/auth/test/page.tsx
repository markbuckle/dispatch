'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

export default function AuthTestPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function signIn(provider: 'google' | 'github') {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setEmail(null);
  }

  return (
    <div>
      <button type="button" onClick={() => signIn('google')}>
        Sign in with Google
      </button>
      <button type="button" onClick={() => signIn('github')}>
        Sign in with GitHub
      </button>
      {email && (
        <p>
          Signed in as: {email}{' '}
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </p>
      )}
    </div>
  );
}

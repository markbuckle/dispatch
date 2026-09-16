import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

// Pinned at the bottom so who's signed in stays visible from every dashboard route
export async function ProfileRow() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function signOut() {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <form action={signOut} className="flex items-center gap-2 rounded-md px-3 py-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border-default bg-neutral-bg text-meta text-text-primary">
        {user?.email?.charAt(0).toUpperCase()}
      </span>
      <span className="flex-1 truncate text-meta text-text-secondary">{user?.email}</span>
      <button
        type="submit"
        className="dispatch-transition shrink-0 rounded-chip px-2 py-1 text-caption text-text-muted hover:bg-subtle hover:text-text-primary"
      >
        Sign out
      </button>
    </form>
  );
}

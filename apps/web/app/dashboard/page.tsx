import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

export default async function DashboardPage() {
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
    <div>
      <p>Signed in as {user?.email}</p>
      <form action={signOut}>
        <button type="submit">Sign out</button>
      </form>
    </div>
  );
}

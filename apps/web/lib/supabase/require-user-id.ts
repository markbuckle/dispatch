import { createClient } from './server';

// middleware guards the page, but an action is its own endpoint and has to establish the user itself
export async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  return user.id;
}

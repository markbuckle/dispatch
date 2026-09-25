import { createClient } from '../../lib/supabase/server';
import { readDisplayName } from './profile/display-name';
import { ProfileMenu } from './profile-menu';

// Pinned at the top so who's signed in stays visible from every dashboard route
export async function ProfileButton() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return <ProfileMenu displayName={readDisplayName(user.user_metadata)} email={user.email ?? ''} />;
}

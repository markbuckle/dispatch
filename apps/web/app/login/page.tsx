import type { Metadata } from 'next';
import { AuthCard, type AuthNotice } from '../auth-card';

export const metadata: Metadata = {
  title: 'Log in - Dispatch',
};

function readNotice(params: { deleted?: string; error?: string }): AuthNotice | undefined {
  if (params.deleted === '1') return { tone: 'neutral', text: 'Your account has been deleted.' };
  if (params.error === 'auth_callback_failed') {
    return { tone: 'danger', text: "That sign-in link didn't work. Try again." };
  }
  return undefined;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  return <AuthCard mode="login" notice={readNotice(await searchParams)} />;
}

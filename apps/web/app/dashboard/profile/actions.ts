'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUserId } from '../../../lib/supabase/require-user-id';
import { createClient } from '../../../lib/supabase/server';
import { readDisplayName } from './display-name';

// the sidebar row shows the same name and is rendered by the dashboard layout, not by this page
const DASHBOARD_PATH = '/dashboard';

const displayNameSchema = z.object({
  name: z.string().trim().min(1, 'Enter a display name.').max(80, 'Use 80 characters or fewer.'),
});

const emailSchema = z.object({
  email: z.string().trim().pipe(z.email('Enter a valid email address.')),
});

const passwordSchema = z
  .object({
    password: z.string().min(12, 'Use at least 12 characters.'),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    error: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type DisplayNameInput = z.input<typeof displayNameSchema>;

export type EmailInput = z.input<typeof emailSchema>;

export type PasswordInput = z.input<typeof passwordSchema>;

export type Profile = { email: string; displayName: string | null };

type Rejected = { status: 'rejected'; message: string };

export type UpdateDisplayNameResult = { status: 'saved' } | Rejected;

export type ChangePasswordResult = { status: 'changed' } | Rejected;

export type UpdateEmailResult = { status: 'sent' } | Rejected;

export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  return { email: user.email ?? '', displayName: readDisplayName(user.user_metadata) };
}

export async function updateDisplayName(input: DisplayNameInput): Promise<UpdateDisplayNameResult> {
  await requireUserId();
  const parsed = displayNameSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'rejected', message: parsed.error.issues[0]?.message ?? 'Check the form.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { full_name: parsed.data.name } });
  if (error) {
    return { status: 'rejected', message: error.message };
  }
  revalidatePath(DASHBOARD_PATH, 'layout');

  return { status: 'saved' };
}

export async function updateEmail(input: EmailInput): Promise<UpdateEmailResult> {
  await requireUserId();
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'rejected', message: parsed.error.issues[0]?.message ?? 'Check the form.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email: parsed.data.email });
  if (error) {
    return { status: 'rejected', message: error.message };
  }

  // the address does not change until the link in that email is followed, so nothing here is stale yet
  return { status: 'sent' };
}

export async function changePassword(input: PasswordInput): Promise<ChangePasswordResult> {
  await requireUserId();
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'rejected', message: parsed.error.issues[0]?.message ?? 'Check the form.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { status: 'rejected', message: error.message };
  }

  return { status: 'changed' };
}

export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

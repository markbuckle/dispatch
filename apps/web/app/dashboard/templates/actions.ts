'use server';

import {
  deleteTemplateForUser,
  findTemplateForUser,
  insertTemplate,
  listTemplatesForUser,
  type Template,
  updateTemplateForUser,
} from '@dispatch/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUserId } from '../../../lib/supabase/require-user-id';

const TEMPLATES_PATH = '/dashboard/templates';

const templateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter a name for this template.')
    .max(60, 'Use 60 characters or fewer.'),
  subject: z.string().trim().min(1, 'Enter a subject.'),
  html: z.string().trim().min(1, 'Enter an html body.'),
  // an empty field means no plain text alternative, which the column stores as null rather than an empty body
  text: z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : value)),
});

export type TemplateInput = z.input<typeof templateSchema>;

type Rejected = { status: 'rejected'; message: string };

export type SaveTemplateResult = { status: 'saved'; template: Template } | Rejected;

export type RemoveTemplateResult = { status: 'removed' } | Rejected;

const MISSING_TEMPLATE: Rejected = {
  status: 'rejected',
  message: 'That template no longer exists.',
};

export async function listTemplates(): Promise<Template[]> {
  return listTemplatesForUser(await requireUserId());
}

export async function getTemplate(id: string): Promise<Template | undefined> {
  // Postgres rejects a malformed uuid rather than returning nothing, so the id is checked first
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return undefined;

  return findTemplateForUser(parsed.data, await requireUserId());
}

export async function createTemplate(input: TemplateInput): Promise<SaveTemplateResult> {
  const userId = await requireUserId();
  const parsed = templateSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'rejected', message: parsed.error.issues[0]?.message ?? 'Check the form.' };
  }

  const template = await insertTemplate({ userId, ...parsed.data });
  revalidatePath(TEMPLATES_PATH);

  return { status: 'saved', template };
}

export async function updateTemplate(
  id: string,
  input: TemplateInput,
): Promise<SaveTemplateResult> {
  const userId = await requireUserId();
  const parsedId = z.uuid().safeParse(id);
  if (!parsedId.success) return MISSING_TEMPLATE;

  const parsed = templateSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'rejected', message: parsed.error.issues[0]?.message ?? 'Check the form.' };
  }

  const template = await updateTemplateForUser(parsedId.data, userId, parsed.data);
  if (!template) return MISSING_TEMPLATE;
  revalidatePath(TEMPLATES_PATH);
  revalidatePath(`${TEMPLATES_PATH}/${template.id}`);

  return { status: 'saved', template };
}

export async function removeTemplate(id: string): Promise<RemoveTemplateResult> {
  const userId = await requireUserId();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return MISSING_TEMPLATE;

  if (!(await deleteTemplateForUser(parsed.data, userId))) return MISSING_TEMPLATE;
  revalidatePath(TEMPLATES_PATH);

  return { status: 'removed' };
}

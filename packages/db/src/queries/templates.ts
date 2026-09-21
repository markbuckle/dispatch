import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '../client';
import { type NewTemplate, type Template, templates } from '../schema/templates';

// the table's one time column is Last updated, so the order matches what it shows
export async function listTemplatesForUser(userId: string): Promise<Template[]> {
  return getDb()
    .select()
    .from(templates)
    .where(eq(templates.userId, userId))
    .orderBy(desc(templates.updatedAt));
}

// the owner is part of every match, so a guessed id from another account finds nothing
export async function findTemplateForUser(
  id: string,
  userId: string,
): Promise<Template | undefined> {
  const [template] = await getDb()
    .select()
    .from(templates)
    .where(and(eq(templates.id, id), eq(templates.userId, userId)));

  return template;
}

export async function insertTemplate(values: NewTemplate): Promise<Template> {
  const [template] = await getDb().insert(templates).values(values).returning();
  if (!template) throw new Error(`Insert returned no row for ${values.name}`);

  return template;
}

export type TemplateEdit = Pick<NewTemplate, 'name' | 'subject' | 'html' | 'text'>;

// updatedAt moves through the schema's $onUpdate, so an edit cannot leave it stale
export async function updateTemplateForUser(
  id: string,
  userId: string,
  values: TemplateEdit,
): Promise<Template | undefined> {
  const [template] = await getDb()
    .update(templates)
    .set(values)
    .where(and(eq(templates.id, id), eq(templates.userId, userId)))
    .returning();

  return template;
}

export async function deleteTemplateForUser(id: string, userId: string): Promise<boolean> {
  const deleted = await getDb()
    .delete(templates)
    .where(and(eq(templates.id, id), eq(templates.userId, userId)))
    .returning({ id: templates.id });

  return deleted.length > 0;
}

import type { Template, TemplateSummary } from '@dispatch/db';
import { z } from 'zod';
import { apiListSchema } from './list';

export const apiTemplateSummarySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  subject: z.string(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const apiTemplateSchema = z.object({
  object: z.literal('template'),
  ...apiTemplateSummarySchema.shape,
  html: z.string(),
  text: z.string().nullable(),
});

export const apiTemplateListSchema = apiListSchema(apiTemplateSummarySchema);

export type ApiTemplateSummary = z.infer<typeof apiTemplateSummarySchema>;
export type ApiTemplate = z.infer<typeof apiTemplateSchema>;

export function toApiTemplateSummary(template: TemplateSummary): ApiTemplateSummary {
  return {
    id: template.id,
    name: template.name,
    subject: template.subject,
    created_at: template.createdAt.toISOString(),
    updated_at: template.updatedAt.toISOString(),
  };
}

export function toApiTemplate(template: Template): ApiTemplate {
  return {
    object: 'template',
    ...toApiTemplateSummary(template),
    html: template.html,
    text: template.text,
  };
}

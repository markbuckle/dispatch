import { type Email, type EmailSummary, emailStatus } from '@dispatch/db';
import { z } from 'zod';
import { emailRangeValues } from '../email/ranges';
import { apiListSchema } from './list';

const statuses = emailStatus.enumValues;

// refused rather than defaulted as the dashboard does, because a caller should hear that its filter was not applied
export const emailFiltersQuerySchema = z.object({
  status: z.enum(statuses, { error: `Use one of ${statuses.join(', ')} for status.` }).optional(),
  range: z
    .enum(emailRangeValues, { error: `Use one of ${emailRangeValues.join(', ')} for range.` })
    .optional(),
});

export const apiEmailSummarySchema = z.object({
  id: z.uuid(),
  from: z.string(),
  to: z.array(z.string()),
  subject: z.string(),
  // not Resend's last_event: email-status-rank.ts keeps this from moving backwards, where last_event is whichever event arrived last
  status: z.enum(statuses),
  created_at: z.iso.datetime(),
});

export const apiEmailSchema = z.object({
  object: z.literal('email'),
  ...apiEmailSummarySchema.shape,
  html: z.string().nullable(),
  text: z.string().nullable(),
  // only a send that never left carries one, so null on every status but failed
  error: z.string().nullable(),
  sent_at: z.iso.datetime().nullable(),
});

export const apiEmailListSchema = apiListSchema(apiEmailSummarySchema);

export type ApiEmailSummary = z.infer<typeof apiEmailSummarySchema>;
export type ApiEmail = z.infer<typeof apiEmailSchema>;

export function toApiEmailSummary(email: EmailSummary): ApiEmailSummary {
  return {
    id: email.id,
    from: email.from,
    to: email.to,
    subject: email.subject,
    status: email.status,
    created_at: email.createdAt.toISOString(),
  };
}

export function toApiEmail(email: Email): ApiEmail {
  return {
    object: 'email',
    ...toApiEmailSummary(email),
    html: email.html,
    text: email.text,
    error: email.error,
    sent_at: email.sentAt?.toISOString() ?? null,
  };
}

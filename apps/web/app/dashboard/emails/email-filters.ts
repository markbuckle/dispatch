import { emailStatus } from '@dispatch/db';
import { z } from 'zod';
import { dateRangeValues, defaultDateRange } from './date-ranges';

// a hand-edited or stale url falls back to the default view rather than an error page
export const emailFiltersSchema = z.object({
  status: z.enum(emailStatus.enumValues).optional().catch(undefined),
  range: z.enum(dateRangeValues).catch(defaultDateRange),
});

export type EmailFilters = z.infer<typeof emailFiltersSchema>;

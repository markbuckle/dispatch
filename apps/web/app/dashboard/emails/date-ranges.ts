import { type EmailRange, emailRangeDays, emailRangeValues } from '@dispatch/core/email-ranges';

// the api filters on the same windows, so which ones exist and how long each runs come from the list both read
export { emailRangeValues as dateRangeValues };

export type DateRange = EmailRange;

// keyed by the shared type, so a window added for the api fails this build until it has a label
export const dateRanges: Record<DateRange, { label: string; days: number }> = {
  '7d': { label: 'Last 7 days', days: emailRangeDays['7d'] },
  '15d': { label: 'Last 15 days', days: emailRangeDays['15d'] },
  '30d': { label: 'Last 30 days', days: emailRangeDays['30d'] },
};

export const defaultDateRange: DateRange = '15d';

export const dateRangeValues = ['7d', '15d', '30d'] as const;

export type DateRange = (typeof dateRangeValues)[number];

export const dateRanges: Record<DateRange, { label: string; days: number }> = {
  '7d': { label: 'Last 7 days', days: 7 },
  '15d': { label: 'Last 15 days', days: 15 },
  '30d': { label: 'Last 30 days', days: 30 },
};

export const defaultDateRange: DateRange = '15d';

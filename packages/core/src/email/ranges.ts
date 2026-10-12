// no imports, because the dashboard's filter bar reads this in the browser
export const emailRangeValues = ['7d', '15d', '30d'] as const;

export type EmailRange = (typeof emailRangeValues)[number];

export const emailRangeDays: Record<EmailRange, number> = {
  '7d': 7,
  '15d': 15,
  '30d': 30,
};

const DAY_MS = 86_400_000;

export function emailRangeStart(range: EmailRange, now: number): Date {
  return new Date(now - emailRangeDays[range] * DAY_MS);
}

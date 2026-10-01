'use client';

import type { EmailStatus, EmailSummary } from '@dispatch/db';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EmptyState } from '../empty-state';
import { inputField } from '../field-styles';
import { Select, type SelectOption } from '../select';
import { type DateRange, dateRanges, dateRangeValues, defaultDateRange } from './date-ranges';
import { emailStatusLabel } from './email-status';
import { EmailsTable } from './emails-table';

// Radix Select reserves the empty string for clearing, so no status filter needs a value of its own
const ALL_STATUSES = 'all';

const rangeOptions: SelectOption[] = dateRangeValues.map((value) => ({
  value,
  label: dateRanges[value].label,
}));

export function EmailsView({
  emails,
  now,
  status,
  range,
  statuses,
}: {
  emails: EmailSummary[];
  now: number;
  status: EmailStatus | undefined;
  range: DateRange;
  statuses: readonly EmailStatus[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const statusOptions: SelectOption[] = [
    { value: ALL_STATUSES, label: 'All statuses' },
    ...statuses.map((value) => ({ value, label: emailStatusLabel(value) })),
  ];

  // the server filters status and range so the 100-row cap applies after them, not before
  function navigate(next: { status: string; range: string }) {
    const params = new URLSearchParams();
    if (next.status !== ALL_STATUSES) params.set('status', next.status);
    if (next.range !== defaultDateRange) params.set('range', next.range);
    const search = params.toString();

    router.replace(search ? `/dashboard/emails?${search}` : '/dashboard/emails', { scroll: false });
  }

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? emails.filter(
        (email) =>
          email.subject.toLowerCase().includes(needle) ||
          email.to.some((recipient) => recipient.toLowerCase().includes(needle)),
      )
    : emails;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter emails"
            aria-label="Filter emails"
            autoComplete="off"
            className={`${inputField} w-full pl-10`}
          />
        </div>
        <Select
          label="Status"
          value={status ?? ALL_STATUSES}
          options={statusOptions}
          onValueChange={(value) => navigate({ status: value, range })}
          className="w-60"
        />
        <Select
          label="Date range"
          value={range}
          options={rangeOptions}
          onValueChange={(value) => navigate({ status: status ?? ALL_STATUSES, range: value })}
          className="w-60"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-border-default">
        {visible.length > 0 ? (
          <EmailsTable emails={visible} now={now} />
        ) : emails.length > 0 ? (
          <EmptyState
            title={`No email matches "${query.trim()}"`}
            body="The filter checks the recipient and subject of the emails in this status and date range."
          />
        ) : (
          <EmptyState {...filteredEmptyState(status, range)} />
        )}
      </div>
    </div>
  );
}

// names the filters in force, so an empty list reads as filtered rather than as lost data
function filteredEmptyState(status: EmailStatus | undefined, range: DateRange) {
  const period = dateRanges[range].label.toLowerCase();
  const widest = range === dateRangeValues[dateRangeValues.length - 1];

  if (status) {
    return {
      title: `No email with status ${emailStatusLabel(status)} in the ${period}`,
      body: widest
        ? 'Clear the status filter to see the rest.'
        : 'Clear the status filter or widen the date range to see the rest.',
    };
  }

  return {
    title: `No email in the ${period}`,
    body: widest
      ? `This list reaches back ${dateRanges[range].days} days.`
      : 'Widen the date range to see older email.',
  };
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-muted"
      aria-hidden
    >
      <circle cx="14" cy="14" r="8" />
      <path d="M20 20 L26 26" />
    </svg>
  );
}

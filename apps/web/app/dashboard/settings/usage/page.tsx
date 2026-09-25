import type { ReactNode } from 'react';
import { getUsage } from './actions';

export default async function UsagePage() {
  const usage = await getUsage();

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <h2 className="text-meta font-medium text-text-secondary">This month</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Figure label="Emails sent">{usage.emailsThisMonth.toLocaleString()}</Figure>
          <Figure label="API requests">{usage.requestsThisMonth.toLocaleString()}</Figure>
          <Figure label="API requests today">{usage.requestsToday.toLocaleString()}</Figure>
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-meta font-medium text-text-secondary">Limits</h2>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border-default p-5">
          <p className="text-body text-text-primary">10 requests per 10 seconds</p>
          <p className="text-caption text-text-muted">
            Counted per API key, not per account, so one integration cannot starve the others. Over
            the limit, POST /v1/emails returns 429 with a Retry-After header. There is no monthly
            cap.
          </p>
        </div>
      </section>
    </div>
  );
}

function Figure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border-default p-5">
      <dt className="text-caption text-text-muted">{label}</dt>
      <dd className="font-display text-h2 text-text-primary">{children}</dd>
    </div>
  );
}

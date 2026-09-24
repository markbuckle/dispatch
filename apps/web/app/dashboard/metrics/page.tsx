import { EmptyState } from '../empty-state';
import { type EmailEventType, eventLabels } from '../event-labels';
import { getMetrics } from './actions';
import { MetricCard } from './metric-card';

// the order a send moves through, so the cards read left to right as the lifecycle does
const ORDER: EmailEventType[] = ['sent', 'delivered', 'bounced', 'complained', 'delivery_delayed'];

// bounced and complained share a tone, which only works because each card is its own chart
const TONES: Record<EmailEventType, string> = {
  sent: 'stroke-neutral-fg',
  delivered: 'stroke-success-fg',
  bounced: 'stroke-danger-fg',
  complained: 'stroke-danger-fg',
  delivery_delayed: 'stroke-warning-fg',
};

// a day with no events returns no row, so the axis is built here rather than read from the results
function windowDays(days: number): string[] {
  const now = new Date();
  return Array.from({ length: days }, (_, index) => {
    const day = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1 - index)),
    );
    return day.toISOString().slice(0, 10);
  });
}

export default async function MetricsPage() {
  const { days, totals, daily } = await getMetrics();

  if (totals.length === 0) {
    return (
      <EmptyState
        title="No metrics yet"
        body="Send an email and its delivery, bounces and complaints show up here."
      />
    );
  }

  const axis = windowDays(days);
  const totalByType = new Map(totals.map((row) => [row.type, row.count]));
  const countsByType = new Map(daily.map((row) => [`${row.type}:${row.day}`, row.count]));
  const sent = totalByType.get('sent') ?? 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-h1 text-text-primary">Metrics</h1>
        <p className="text-meta text-text-secondary">Last {days} days</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {ORDER.map((type) => {
          const total = totalByType.get(type) ?? 0;
          // a rate against nothing is not a rate, and vocabulary.md asks for the denominator either way
          const share =
            sent > 0 && (type === 'delivered' || type === 'bounced')
              ? `${((total / sent) * 100).toFixed(1)}% of sent`
              : undefined;

          return (
            <MetricCard
              key={type}
              label={eventLabels[type]}
              total={total}
              share={share}
              counts={axis.map((day) => countsByType.get(`${type}:${day}`) ?? 0)}
              tone={TONES[type]}
            />
          );
        })}
      </div>
    </div>
  );
}

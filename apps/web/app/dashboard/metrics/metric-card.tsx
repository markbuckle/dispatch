import { Sparkline } from './sparkline';

export function MetricCard({
  label,
  total,
  share,
  counts,
  tone,
}: {
  label: string;
  total: number;
  share?: string;
  counts: number[];
  tone: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-default p-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-meta text-text-secondary">{label}</span>
        {share && <span className="text-caption text-text-muted">{share}</span>}
      </div>
      <span className="font-display text-display-s text-text-primary tabular-nums">
        {total.toLocaleString('en-GB')}
      </span>
      <Sparkline counts={counts} tone={tone} label={`${label} per day over the last 30 days`} />
    </div>
  );
}

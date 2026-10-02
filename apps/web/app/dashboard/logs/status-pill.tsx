import { pillTones, type StatusTone } from '../status-tone';

// a status code carries its own meaning, so the tone follows the class rather than a per-code map
export function statusCodeTone(status: number): StatusTone {
  if (status >= 500) return 'danger';
  if (status >= 400) return 'warning';
  if (status >= 200 && status < 300) return 'success';

  return 'neutral';
}

export function StatusPill({ status }: { status: number }) {
  return (
    <span
      className={`inline-flex h-pill w-max items-center whitespace-nowrap rounded-sm px-2.5 text-pill tabular-nums ${pillTones[statusCodeTone(status)]}`}
    >
      {status}
    </span>
  );
}

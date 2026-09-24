// a status code carries its own meaning, so the tone follows the class rather than a per-code map
function toneFor(status: number): string {
  if (status >= 500) return 'bg-danger-bg text-danger-fg';
  if (status >= 400) return 'bg-warning-bg text-warning-fg';
  if (status >= 200 && status < 300) return 'bg-success-bg text-success-fg';

  return 'bg-neutral-bg text-neutral-fg';
}

export function StatusPill({ status }: { status: number }) {
  return (
    <span
      className={`inline-flex h-pill w-max items-center whitespace-nowrap rounded-sm px-2.5 text-pill tabular-nums ${toneFor(status)}`}
    >
      {status}
    </span>
  );
}

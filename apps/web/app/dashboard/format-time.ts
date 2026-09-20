// relative in tables, absolute UTC on hover, per foundations/voice.md
export function formatRelative(value: Date, now: number): string {
  const minutes = Math.floor((now - value.getTime()) / 60_000);
  if (minutes < 1) return '<1m';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function formatUtc(value: Date): string {
  return value.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

import { CopyButton } from './copy-button';

// label names the value for a screen reader, because a page can hold several identical Copy buttons
export function CopyField({ value, label }: { value: string; label?: string }) {
  return (
    <div className="flex h-control-lg items-center gap-2 rounded-md border border-border-default bg-surface pr-1 pl-3.5">
      <span className="flex-1 truncate font-mono text-mono text-text-secondary">{value}</span>
      <CopyButton value={value} label={label} />
    </div>
  );
}

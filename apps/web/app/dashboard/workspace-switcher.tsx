// Static: one workspace exists and there is nothing to switch between yet
export function WorkspaceSwitcher() {
  return (
    <div className="flex h-control items-center gap-2 rounded-md px-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-chip border border-border-default bg-neutral-bg text-caption text-text-primary">
        P
      </span>
      <span className="truncate text-body text-text-primary">Personal</span>
    </div>
  );
}

// Not wired to real search yet - there is no data anywhere to search across
export function TopBar() {
  return (
    <header className="flex h-top-bar shrink-0 items-center border-b border-border-subtle bg-canvas px-6">
      <input
        type="search"
        placeholder="Search everything"
        className="h-control-lg w-full max-w-dialog rounded-md border border-border-default bg-surface px-3.5 text-body text-text-primary outline-none placeholder:text-text-placeholder focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,144,255,0.22)]"
      />
    </header>
  );
}

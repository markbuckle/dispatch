// Widths vary per row so the placeholder reads as data rather than as a grid
const ROWS: [string, string][] = [
  ['w-48', 'w-64'],
  ['w-56', 'w-52'],
  ['w-40', 'w-72'],
  ['w-52', 'w-60'],
  ['w-44', 'w-56'],
  ['w-60', 'w-44'],
];

// Shaped like the table pages, which is six of the eight routes under this boundary
export default function DashboardLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-6 p-6">
      <header>
        <Bar className="h-10 w-40" />
      </header>
      <div className="overflow-hidden rounded-lg border border-border-default">
        <div className="h-header-row border-b border-border-subtle bg-subtle" />
        {ROWS.map(([first, second]) => (
          <div
            key={`${first}-${second}`}
            className="flex h-row items-center gap-5 border-b border-border-subtle px-5 last:border-b-0"
          >
            <Bar className={`h-3.5 ${first}`} />
            <Bar className={`h-3.5 ${second}`} />
            <Bar className="h-pill w-20 shrink-0 rounded-sm" />
            <Bar className="h-3.5 w-12 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar({ className }: { className: string }) {
  return <div aria-hidden className={`dispatch-skeleton rounded-xs bg-hover ${className}`} />;
}

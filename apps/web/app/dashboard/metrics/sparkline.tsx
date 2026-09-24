// drawn in a fixed coordinate space and stretched by CSS, so the card decides the width
const VIEW_WIDTH = 120;
const VIEW_HEIGHT = 32;

// leaves room for the stroke, which would otherwise be clipped in half at the extremes
const PADDING = 2;

function toPath(counts: number[]): string {
  // a flat line at the floor rather than a divide by zero, which is what a quiet month looks like
  const peak = Math.max(1, ...counts);
  const step = counts.length > 1 ? (VIEW_WIDTH - PADDING * 2) / (counts.length - 1) : 0;

  return counts
    .map((count, index) => {
      const x = PADDING + index * step;
      const y = VIEW_HEIGHT - PADDING - (count / peak) * (VIEW_HEIGHT - PADDING * 2);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export function Sparkline({
  counts,
  tone,
  label,
}: {
  counts: number[];
  tone: string;
  label: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="none"
      className="h-8 w-full"
      role="img"
      aria-label={label}
    >
      <path
        d={toPath(counts)}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        // the stretch above is uneven, and without this the stroke would thicken with it
        vectorEffect="non-scaling-stroke"
        className={tone}
      />
    </svg>
  );
}

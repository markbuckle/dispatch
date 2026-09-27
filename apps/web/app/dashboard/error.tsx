'use client';

import { useRouter } from 'next/navigation';
import { primaryButton } from './button-styles';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border-default px-6 py-16 text-center">
        <h1 className="text-h3 text-text-primary">This page didn&apos;t load.</h1>
        <p className="max-w-[380px] text-body text-text-secondary">
          The data behind it came back with an error. Nothing you have saved is affected.
        </p>
        {error.digest && (
          <p className="text-caption text-text-muted">
            Reference <span className="font-mono text-mono">{error.digest}</span>
          </p>
        )}
        <div className="pt-1">
          <button
            type="button"
            // refresh re-runs the server render; reset on its own replays the payload that already failed
            onClick={() => {
              router.refresh();
              reset();
            }}
            className={primaryButton}
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

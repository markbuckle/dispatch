'use client';

import { useEffect, useState } from 'react';
import { recheckPendingDomains } from './actions';

// DKIM propagation runs in minutes to hours, so a shorter tick costs SES calls and buys nothing
const INTERVAL_MS = 30_000;

// counted in checks rather than wall time, so a tab left hidden is not spending the budget
const MAX_CHECKS = 40;

// derived, so changing either constant above cannot leave the copy claiming a duration it no longer runs for
const GIVE_UP_MINUTES = Math.round((INTERVAL_MS * MAX_CHECKS) / 60_000);

export function DomainsPoller() {
  const [hasStopped, setHasStopped] = useState(false);

  useEffect(() => {
    if (hasStopped) return;
    let checks = 0;

    const timer = setInterval(async () => {
      // a background tab would otherwise keep calling SES for a page nobody is reading
      if (document.visibilityState !== 'visible') return;

      if (checks >= MAX_CHECKS) {
        setHasStopped(true);
        return;
      }
      checks += 1;

      // a check that fails leaves the row as it was, and the next tick tries again
      await recheckPendingDomains().catch(() => {});
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [hasStopped]);

  if (!hasStopped) return null;

  return (
    <p className="text-caption text-text-muted">
      Stopped checking after {GIVE_UP_MINUTES} minutes. Refresh to resume.
    </p>
  );
}

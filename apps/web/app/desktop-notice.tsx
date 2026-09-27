'use client';

import { useEffect, useState } from 'react';
import { primaryButton } from './dashboard/button-styles';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dashboard/dialog';

// Below --breakpoint-lg the 252px sidebar takes a third of the screen before a table starts.
// A width query, not a device check, so a narrow desktop window is told the same thing.
const NARROW_VIEWPORT = '(width < 767px)';

// On the auth pages the notice predicts; in the dashboard it describes what is already on screen
const copy = {
  auth: {
    body: 'Its tables run to 6 columns, and the sidebar takes 252px before they start. A phone shows you the sidebar and little else. Signing in works fine either way.',
    action: 'Continue anyway',
  },
  dashboard: {
    body: 'Its tables run to 6 columns, and the sidebar takes 252px of what you have. Each table scrolls sideways, so a row is still readable one part at a time.',
    action: 'Close',
  },
} as const;

// Storage is unavailable in some private browsing modes, and a notice is not worth throwing over
function readDismissed(key: string): boolean {
  try {
    return window.sessionStorage.getItem(key) === 'dismissed';
  } catch {
    return false;
  }
}

function writeDismissed(key: string): void {
  try {
    window.sessionStorage.setItem(key, 'dismissed');
  } catch {}
}

export function DesktopNotice({ surface }: { surface: keyof typeof copy }) {
  // the server has no viewport, so both renders start closed and the query is read after mount
  const [isNarrow, setIsNarrow] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  // keyed per surface, so dismissing the prediction on the way in does not swallow the description
  const dismissedKey = `dispatch:desktop-notice:${surface}`;

  useEffect(() => {
    if (readDismissed(dismissedKey)) {
      setIsDismissed(true);
      return;
    }

    const query = window.matchMedia(NARROW_VIEWPORT);
    setIsNarrow(query.matches);

    const handleChange = (event: MediaQueryListEvent) => setIsNarrow(event.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, [dismissedKey]);

  function handleOpenChange(open: boolean) {
    if (open) return;
    setIsDismissed(true);
    writeDismissed(dismissedKey);
  }

  return (
    // a media query opens this rather than a trigger, so closing it returns focus to the body:
    // there is no originating control to go back to, which is expected here and not a bug
    <Dialog open={isNarrow && !isDismissed} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>The dashboard needs a wider screen</DialogTitle>
          <DialogDescription>{copy[surface].body}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button type="button" onClick={() => handleOpenChange(false)} className={primaryButton}>
            {copy[surface].action}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

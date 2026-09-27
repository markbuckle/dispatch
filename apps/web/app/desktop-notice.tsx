'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { primaryButton } from './dashboard/button-styles';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './dashboard/dialog';

// Below --breakpoint-lg the 252px sidebar takes a third of the screen before a table starts.
// A width query, not a device check, so a narrow desktop window is told the same thing.
const NARROW_VIEWPORT = '(width < 767px)';

// On the auth pages the notice predicts; in the dashboard it describes what is already on screen
const copy = {
  auth: 'The dashboard puts your emails, domains, and delivery logs side by side - a desktop-class experience that needs the room only a laptop or larger screen can give. Head over to your computer and open this page there to sign in and run Dispatch.',
  dashboard:
    'The dashboard puts your emails, domains, and delivery logs side by side - a desktop-class experience that needs the room only a laptop or larger screen can give. Head over to your computer and open this page there to run Dispatch.',
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
        {/* the two sanctioned marketing devices, reused so the lighting is not hand-rolled */}
        <span aria-hidden="true" className="dispatch-glow absolute inset-x-0 top-0 h-32" />
        <span aria-hidden="true" className="dispatch-rule absolute inset-x-0 top-0 h-px" />
        <div className="relative flex flex-col items-center gap-4 px-6 py-9 text-center">
          <span className="text-overline text-text-secondary uppercase">Best on desktop</span>
          <DialogTitle className="font-serif text-display-s-serif text-text-primary">
            Dispatch&apos;s dashboard is built for your laptop only
          </DialogTitle>
          <DialogDescription className="text-body text-text-secondary">
            {copy[surface]}
          </DialogDescription>
          {/* the close control still dismisses in place, so this is the way out and not the only way on */}
          <Link href="/" className={`${primaryButton} mt-2`}>
            Got it
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

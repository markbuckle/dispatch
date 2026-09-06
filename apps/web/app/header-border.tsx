'use client';

import { useEffect, useState } from 'react';

// The only thing on the header that needs the client, so the header itself stays a server component
export function HeaderBorder() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <span
      aria-hidden="true"
      className={`dispatch-transition-overlay absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-border-default to-transparent ${
        isScrolled ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}

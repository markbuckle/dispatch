import Link from 'next/link';
import type { ReactNode } from 'react';
import { Monogram } from './logo';

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="dispatch-auth-backdrop relative min-h-screen overflow-hidden px-5 py-8">
      <span aria-hidden="true" className="dispatch-auth-arcs absolute inset-0" />
      <Link
        href="/"
        className="dispatch-transition absolute top-5 left-5 flex items-center gap-1 text-body font-medium text-text-secondary hover:text-text-primary sm:top-12 sm:left-12"
      >
        <ChevronLeftIcon />
        Home
      </Link>
      {/* top aligned rather than centred, because the arcs are drawn from the monogram's fixed position */}
      <div className="relative mx-auto flex w-full max-w-dialog flex-col items-center">
        <Monogram />
        <h1 className="mt-6 text-center font-display text-display-s text-text-primary">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-body text-text-secondary">{subtitle}</p>}
        <div className="mt-8 w-full">{children}</div>
      </div>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 7L11 16L20 25" />
    </svg>
  );
}

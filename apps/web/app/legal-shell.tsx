import Link from 'next/link';
import type { ReactNode } from 'react';
import { AuthHome } from './logo';

export const legalText = 'text-body text-text-secondary';

export const legalList = `list-disc space-y-2 pl-5 ${legalText}`;

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-canvas px-5 py-16">
      <div className="flex w-full max-w-reading flex-col gap-10">
        <Link href="/" aria-label="Dispatch home" className="w-max rounded-xs">
          <AuthHome />
        </Link>
        <header className="flex flex-col gap-2">
          <h1 className="font-display text-h1 text-text-primary">{title}</h1>
          <p className="text-caption text-text-muted">Last updated {updated}</p>
        </header>
        {children}
      </div>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-h3 text-text-primary">{heading}</h2>
      {children}
    </section>
  );
}

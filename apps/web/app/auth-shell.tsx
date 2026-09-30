import Link from 'next/link';
import type { ReactNode } from 'react';
import { Wordmark } from './logo';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-canvas px-5 py-16">
      <Link href="/" aria-label="Dispatch home">
        <Wordmark />
      </Link>
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}

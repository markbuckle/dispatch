import type { Metadata } from 'next';
import Link from 'next/link';
import { primaryButton, secondaryButton } from './dashboard/button-styles';
import { Lockup } from './logo';

export const metadata: Metadata = {
  title: 'No page at this address - Dispatch',
};

// Sits above the dashboard layout, so it is also what a signed-out visitor gets from a stale link
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-canvas px-5 py-16">
      <Lockup />
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-h3 text-text-primary">No page at this address.</h1>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link href="/dashboard" className={primaryButton}>
            Back to dashboard
          </Link>
          <Link href="/" className={secondaryButton}>
            Dispatch home
          </Link>
        </div>
      </div>
    </div>
  );
}

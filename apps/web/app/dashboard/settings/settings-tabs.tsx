'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard/settings/usage', label: 'Usage' },
  { href: '/dashboard/settings/api', label: 'API' },
];

// Needs usePathname for the active pill, the same reason SidebarNav is the one client piece of the shell
export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {tabs.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? 'page' : undefined}
          className={
            pathname === href
              ? 'flex h-control-sm items-center rounded-chip bg-hover px-3.5 text-meta font-medium text-text-primary'
              : 'dispatch-transition flex h-control-sm items-center rounded-chip px-3.5 text-meta font-medium text-text-muted hover:text-text-secondary'
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

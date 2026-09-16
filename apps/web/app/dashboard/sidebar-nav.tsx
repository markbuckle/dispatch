'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartIcon,
  EmailIcon,
  GearIcon,
  GlobeIcon,
  KeyIcon,
  ListIcon,
  TemplateIcon,
  WebhookIcon,
} from './nav-icons';

const items = [
  { href: '/dashboard/emails', label: 'Emails', Icon: EmailIcon },
  { href: '/dashboard/templates', label: 'Templates', Icon: TemplateIcon },
  { href: '/dashboard/metrics', label: 'Metrics', Icon: ChartIcon },
  { href: '/dashboard/domains', label: 'Domains', Icon: GlobeIcon },
  { href: '/dashboard/logs', label: 'Logs', Icon: ListIcon },
  { href: '/dashboard/api-keys', label: 'API keys', Icon: KeyIcon },
  { href: '/dashboard/webhooks', label: 'Webhooks', Icon: WebhookIcon },
  { href: '/dashboard/settings', label: 'Settings', Icon: GearIcon },
];

// Needs usePathname for the active row, so this is the one client piece of the shell
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {items.map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={
                isActive
                  ? 'flex h-nav-item items-center gap-2 rounded-md border border-border-default bg-hover px-3 text-body text-text-primary'
                  : 'dispatch-transition flex h-nav-item items-center gap-2 rounded-md border border-transparent px-3 text-body text-text-secondary hover:bg-subtle hover:text-text-primary'
              }
            >
              <Icon />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

'use client';

import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';
import { signOut } from './profile/actions';

const menuItem =
  'dispatch-transition flex h-control-sm w-full cursor-default items-center rounded-md px-2.5 text-body text-text-secondary outline-none select-none data-[highlighted]:bg-hover data-[highlighted]:text-text-primary';

export function ProfileMenu({ displayName, email }: { displayName: string | null; email: string }) {
  const label = displayName ?? email;

  return (
    <RadixMenu.Root>
      <RadixMenu.Trigger className="dispatch-transition flex h-control w-full items-center gap-2 rounded-md border border-transparent px-3 text-left outline-none hover:border-border-default hover:bg-hover focus-visible:shadow-focus data-[state=open]:border-border-default data-[state=open]:bg-hover">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-chip border border-border-default bg-neutral-bg text-caption text-text-primary">
          {label.charAt(0).toUpperCase()}
        </span>
        <span className="flex-1 truncate text-body text-text-primary">{label}</span>
        <ChevronDownIcon />
      </RadixMenu.Trigger>
      <RadixMenu.Portal>
        <RadixMenu.Content
          align="start"
          sideOffset={4}
          className="dispatch-menu-enter z-50 min-w-menu rounded-lg border border-border-strong bg-subtle p-1 shadow-overlay"
        >
          {/* the trigger already shows the email until a name is set, and repeating it there would say nothing */}
          {displayName && (
            <RadixMenu.Label className="truncate px-2.5 py-1.5 text-caption text-text-muted">
              {email}
            </RadixMenu.Label>
          )}
          <RadixMenu.Item asChild>
            <Link href="/dashboard/profile" className={menuItem}>
              Profile
            </Link>
          </RadixMenu.Item>
          <RadixMenu.Separator className="-mx-1 my-1 h-px bg-border-subtle" />
          <form action={signOut}>
            {/* closing on select unmounts the form before the browser submits it, so the menu waits for the redirect */}
            <RadixMenu.Item asChild onSelect={(event) => event.preventDefault()}>
              <button type="submit" className={menuItem}>
                Sign out
              </button>
            </RadixMenu.Item>
          </form>
        </RadixMenu.Content>
      </RadixMenu.Portal>
    </RadixMenu.Root>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-text-muted"
      aria-hidden
    >
      <path d="M10 13 L16 19 L22 13" />
    </svg>
  );
}

import type { ReactNode } from 'react';
import { ProfileButton } from './profile-button';
import { SidebarNav } from './sidebar-nav';
import { TopBar } from './top-bar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-canvas">
      <aside className="flex w-sidebar shrink-0 flex-col border-r border-border-subtle">
        <div className="p-3">
          <ProfileButton />
        </div>
        <nav className="flex-1 overflow-y-auto px-3">
          <SidebarNav />
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

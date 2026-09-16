import type { ReactNode } from 'react';
import { ProfileRow } from './profile-row';
import { SidebarNav } from './sidebar-nav';
import { TopBar } from './top-bar';
import { WorkspaceSwitcher } from './workspace-switcher';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-canvas">
      <aside className="flex w-sidebar shrink-0 flex-col border-r border-border-subtle">
        <div className="p-3">
          <WorkspaceSwitcher />
        </div>
        <nav className="flex-1 overflow-y-auto px-3">
          <SidebarNav />
        </nav>
        <div className="border-t border-border-subtle p-3">
          <ProfileRow />
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

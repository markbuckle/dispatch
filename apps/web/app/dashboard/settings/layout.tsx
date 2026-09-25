import type { ReactNode } from 'react';
import { SettingsTabs } from './settings-tabs';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-h1 text-text-primary">Settings</h1>
        <SettingsTabs />
      </header>
      {children}
    </div>
  );
}

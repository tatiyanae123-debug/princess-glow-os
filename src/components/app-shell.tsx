'use client';

import { Sidebar } from '@/components/ui/sidebar';
import { TopNav } from '@/components/ui/top-nav';
import { GlowProvider } from '@/lib/context/glow-provider';
import { QuickAdd } from '@/components/quick-add/quick-add';
import { SystemRoomContext } from '@/components/system-room-context';
import { SystemExpansionDock } from '@/components/system-expansion-dock';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <GlowProvider>
      <div className="min-h-screen text-[var(--glow-text)]">
        <div className="mx-auto flex min-h-screen w-full max-w-[1880px] flex-col lg:flex-row">
          <div className="w-full lg:sticky lg:top-0 lg:h-screen lg:w-[244px] lg:shrink-0">
            <Sidebar />
          </div>
          <div className="min-w-0 flex-1">
            <div className="px-3 pt-3 sm:px-5 sm:pt-5 lg:px-7 lg:pt-5">
              <TopNav />
            </div>
            <main className="min-h-[calc(100vh-72px)] px-3 pb-8 pt-3 sm:px-5 lg:px-7 lg:pb-10">
              <SystemRoomContext />
              {children}
              <SystemExpansionDock />
            </main>
          </div>
        </div>
      </div>
      <QuickAdd />
    </GlowProvider>
  );
}

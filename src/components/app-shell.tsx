'use client';

import { Sidebar } from '@/components/ui/sidebar';
import { TopNav } from '@/components/ui/top-nav';
import { GlowProvider } from '@/lib/context/glow-provider';
import { QuickAdd } from '@/components/quick-add/quick-add';
import { SystemRoomContext } from '@/components/system-room-context';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <GlowProvider>
      <div className="min-h-screen transition-colors" style={{ background: 'radial-gradient(circle at 15% 10%, rgba(231,199,181,.38), transparent 28%), radial-gradient(circle at 82% 0%, rgba(250,243,235,.9), transparent 32%), var(--glow-bg)', color: 'var(--glow-text)' }}>
        <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col lg:flex-row">
          <div className="w-full lg:sticky lg:top-0 lg:h-screen lg:w-[244px] lg:shrink-0"><Sidebar /></div>
          <div className="min-w-0 flex-1">
            <div className="px-3 pt-3 sm:px-5 sm:pt-5 lg:px-6 lg:pt-5"><TopNav /></div>
            <main className="min-h-[calc(100vh-72px)] px-3 pb-6 pt-3 sm:px-5 lg:px-6 lg:pb-8"><SystemRoomContext />{children}</main>
          </div>
        </div>
      </div>
      <QuickAdd />
    </GlowProvider>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/ui/sidebar';
import { TopNav } from '@/components/ui/top-nav';
import { GlowProvider } from '@/lib/context/glow-provider';
import { QuickAdd } from '@/components/quick-add/quick-add';
import { EditorialRoomBanner } from '@/components/editorial-room-banner';
import { SystemRoomContext } from '@/components/system-room-context';
import { SystemExpansionDock } from '@/components/system-expansion-dock';
import { DeepWorkspaceCanvas } from '@/components/deep-workspace-canvas';

function roomFor(pathname: string) {
  if (pathname.startsWith('/beauty/lab')) return 'beauty-lab';
  if (pathname.startsWith('/finance/brain')) return 'financial-brain';
  if (pathname.startsWith('/calendar')) return 'calendar';
  if (pathname.startsWith('/tasks')) return 'tasks';
  if (pathname.startsWith('/planning') || pathname.startsWith('/tomorrow')) return 'planning';
  if (pathname.startsWith('/today')) return 'dashboard';
  if (pathname.startsWith('/habits')) return 'habits';
  if (pathname.startsWith('/fitness')) return 'fitness';
  if (pathname.startsWith('/beauty')) return 'beauty';
  if (pathname.startsWith('/hair')) return 'hair';
  if (pathname.startsWith('/wellness')) return 'wellness';
  if (pathname.startsWith('/maintenance')) return 'wellness';
  if (pathname.startsWith('/finance')) return 'finance';
  if (pathname.startsWith('/projects')) return 'projects';
  if (pathname.startsWith('/brain') || pathname.startsWith('/inbox') || pathname.startsWith('/intake') || pathname.startsWith('/rules')) return 'brain';
  if (pathname.startsWith('/concierge')) return 'concierge';
  if (pathname.startsWith('/observations')) return 'observations';
  if (pathname.startsWith('/memory')) return 'memory';
  if (pathname.startsWith('/timeline')) return 'timeline';
  if (pathname.startsWith('/briefings')) return 'briefings';
  if (pathname.startsWith('/closet')) return 'closet';
  if (pathname.startsWith('/world')) return 'world';
  if (pathname.startsWith('/home')) return 'home';
  if (pathname.startsWith('/notes') || pathname.startsWith('/resources')) return 'notes';
  if (pathname.startsWith('/connections')) return 'connections';
  if (pathname.startsWith('/gmail')) return 'gmail';
  if (pathname.startsWith('/import')) return 'import';
  if (pathname.startsWith('/settings')) return 'settings';
  return 'dashboard';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const room = roomFor(pathname);

  return (
    <GlowProvider>
      <div className="room-canvas min-h-screen transition-colors" data-room={room}>
        <div className="mx-auto flex min-h-screen w-full max-w-[1880px] flex-col lg:flex-row">
          <div className="w-full lg:sticky lg:top-0 lg:h-screen lg:w-[244px] lg:shrink-0">
            <Sidebar />
          </div>
          <div className="min-w-0 flex-1">
            <div className="px-3 pt-2 sm:px-5 sm:pt-3 lg:px-7 lg:pt-4">
              <TopNav />
            </div>
            <main className="glow-editorial-page min-h-[calc(100vh-60px)] px-3 pb-8 pt-2 sm:px-5 lg:px-7 lg:pb-10">
              <EditorialRoomBanner />
              <SystemRoomContext />
              <DeepWorkspaceCanvas />
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

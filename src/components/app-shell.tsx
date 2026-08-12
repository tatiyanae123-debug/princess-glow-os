'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/ui/sidebar';
import { EditorialSidebar } from '@/components/ui/editorial-sidebar';
import { TopNav } from '@/components/ui/top-nav';
import { EditorialTopNav } from '@/components/ui/editorial-top-nav';
import { GlowProvider } from '@/lib/context/glow-provider';
import { QuickAdd } from '@/components/quick-add/quick-add';
import { UniversalCaptureDock } from '@/components/universal-capture-dock';
import { ReferenceRoomInteractions } from '@/components/reference-room-interactions';
import { GlowVoiceCommand } from '@/components/voice/glow-voice-command';
import { GlobalImageEditor } from '@/components/media/global-image-editor';
import { isEditorialRoute } from '@/lib/editorial-routes';

function roomFor(pathname: string) {
  if (pathname.startsWith('/beauty-lab') || pathname.startsWith('/beauty/lab')) return 'beauty-lab';
  if (pathname.startsWith('/finance/brain')) return 'financial-brain';
  if (pathname.startsWith('/calendar')) return 'calendar';
  if (pathname.startsWith('/reminders')) return 'reminders';
  if (pathname.startsWith('/tasks')) return 'tasks';
  if (pathname.startsWith('/planning') || pathname.startsWith('/tomorrow')) return 'planning';
  if (pathname.startsWith('/routines')) return 'routines';
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/today')) return 'dashboard';
  if (pathname.startsWith('/habits')) return 'habits';
  if (pathname.startsWith('/fitness')) return 'fitness';
  if (pathname.startsWith('/food')) return 'food';
  if (pathname.startsWith('/beauty')) return 'beauty';
  if (pathname.startsWith('/hair')) return 'hair';
  if (pathname.startsWith('/wellness') || pathname.startsWith('/maintenance')) return 'wellness';
  if (pathname.startsWith('/finance')) return 'finance';
  if (pathname.startsWith('/projects')) return 'projects';
  if (pathname.startsWith('/brain') || pathname.startsWith('/inbox') || pathname.startsWith('/intake') || pathname.startsWith('/rules')) return 'brain';
  if (pathname.startsWith('/concierge')) return 'concierge';
  if (pathname.startsWith('/observations')) return 'observations';
  if (pathname.startsWith('/memory')) return 'memory';
  if (pathname.startsWith('/timeline')) return 'timeline';
  if (pathname.startsWith('/briefings')) return 'briefings';
  if (pathname.startsWith('/closet')) return 'closet';
  if (pathname.startsWith('/world') || pathname.startsWith('/life-world')) return 'world';
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
  const editorial = isEditorialRoute(pathname);

  return (
    <GlowProvider>
      <div className={editorial ? 'room-canvas editorial-shell min-h-screen transition-colors' : 'room-canvas min-h-screen transition-colors'} data-room={room}>
        {editorial ? (
          <div className="editorial-shell-inner">
            <div className="editorial-sidebar-wrap"><EditorialSidebar /></div>
            <div className="editorial-content">
              <EditorialTopNav />
              <main className="editorial-main">{children}</main>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex min-h-screen w-full max-w-[1920px] flex-col lg:flex-row">
            <div className="w-full lg:sticky lg:top-0 lg:h-screen lg:w-[258px] lg:shrink-0"><Sidebar /></div>
            <div className="min-w-0 flex-1">
              <main className="min-h-screen px-3 pb-28 pt-4 sm:px-5 lg:px-7 lg:pt-7">
                <div className="mx-auto w-full max-w-[1560px]">
                  <TopNav />
                  {children}
                </div>
              </main>
            </div>
          </div>
        )}
      </div>
      <ReferenceRoomInteractions />
      <GlowVoiceCommand />
      <GlobalImageEditor />
      <QuickAdd />
      <UniversalCaptureDock />
    </GlowProvider>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/ui/sidebar';
import { GlowProvider } from '@/lib/context/glow-provider';
import { QuickAdd } from '@/components/quick-add/quick-add';
import { UniversalCaptureDock } from '@/components/universal-capture-dock';
import { ReferenceRoomWorkspace } from '@/components/reference-room-workspace';
import { GlowVoiceCommand } from '@/components/voice/glow-voice-command';
import { GlobalImageEditor } from '@/components/media/global-image-editor';

function roomFor(pathname: string) {
  if (pathname.startsWith('/beauty/lab')) return 'beauty-lab';
  if (pathname.startsWith('/finance/brain')) return 'financial-brain';
  if (pathname.startsWith('/calendar')) return 'calendar';
  if (pathname.startsWith('/reminders')) return 'reminders';
  if (pathname.startsWith('/tasks')) return 'tasks';
  if (pathname.startsWith('/planning') || pathname.startsWith('/tomorrow')) return 'planning';
  if (pathname.startsWith('/routines')) return 'routines';
  if (pathname.startsWith('/today')) return 'dashboard';
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
        <div className="mx-auto flex min-h-screen w-full max-w-[1920px] flex-col lg:flex-row">
          <div className="w-full lg:sticky lg:top-0 lg:h-screen lg:w-[258px] lg:shrink-0">
            <Sidebar />
          </div>
          <div className="min-w-0 flex-1">
            <main className="min-h-screen px-3 pb-28 pt-4 sm:px-5 lg:px-7 lg:pt-7">
              <div className="mx-auto w-full max-w-[1560px]">
                <ReferenceRoomWorkspace />

                <details className="legacy-capability-vault mt-6">
                  <summary>Advanced tools & preserved legacy capabilities</summary>
                  <div className="legacy-capability-vault__content">{children}</div>
                </details>
              </div>
            </main>
          </div>
        </div>
      </div>
      <GlowVoiceCommand />
      <GlobalImageEditor />
      <QuickAdd />
      <UniversalCaptureDock />
    </GlowProvider>
  );
}

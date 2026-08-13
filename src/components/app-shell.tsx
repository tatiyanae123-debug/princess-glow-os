'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Sidebar } from '@/components/ui/sidebar';
import { GlowProvider } from '@/lib/context/glow-provider';
import { QuickAdd } from '@/components/quick-add/quick-add';
import { ReferenceRoomInteractions } from '@/components/reference-room-interactions';
import { GlowVoiceCommand } from '@/components/voice/glow-voice-command';
import { GlobalHeader } from '@/components/global-header';
import { GlowActionButton } from '@/components/glow-action-button';
import { UniversalCaptureDock } from '@/components/universal-capture-dock';
import { UpgradeDock } from '@/components/upgrade-dock';

function roomFor(pathname: string) {
  if (pathname.startsWith('/beauty/lab')) return 'beauty-lab';
  if (pathname.startsWith('/finance/brain')) return 'financial-brain';
  if (pathname.startsWith('/calendar')) return 'calendar';
  if (pathname.startsWith('/reminders')) return 'reminders';
  if (pathname.startsWith('/tasks')) return 'tasks';
  if (pathname.startsWith('/planning') || pathname.startsWith('/tomorrow')) return 'planning';
  if (pathname.startsWith('/routines')) return 'routines';
  if (pathname.startsWith('/today') || pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/habits')) return 'habits';
  if (pathname.startsWith('/fitness')) return 'fitness';
  if (pathname.startsWith('/food')) return 'food';
  if (pathname.startsWith('/beauty')) return 'beauty';
  if (pathname.startsWith('/hair')) return 'hair';
  if (pathname.startsWith('/wellness') || pathname.startsWith('/maintenance')) return 'wellness';
  if (pathname.startsWith('/finance')) return 'finance';
  if (pathname.startsWith('/goals')) return 'goals';
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
  if (pathname.startsWith('/work')) return 'work';
  if (pathname.startsWith('/graph')) return 'graph';
  if (pathname.startsWith('/notices')) return 'notices';
  if (pathname.startsWith('/all-rooms')) return 'all-rooms';
  if (pathname.startsWith('/notes') || pathname.startsWith('/resources')) return 'notes';
  if (pathname.startsWith('/connections')) return 'connections';
  if (pathname.startsWith('/gmail')) return 'gmail';
  if (pathname.startsWith('/import')) return 'import';
  if (pathname.startsWith('/settings')) return 'settings';
  return 'dashboard';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const room = roomFor(pathname);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    const sync = () => setFocus(new URLSearchParams(window.location.search).get('focus') === '1');
    sync();
    window.addEventListener('popstate', sync);
    document.addEventListener('glow:focus-changed', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      document.removeEventListener('glow:focus-changed', sync);
    };
  }, [pathname]);

  function exitFocus() {
    const params = new URLSearchParams(window.location.search);
    params.delete('focus');
    router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    setFocus(false);
  }

  return (
    <GlowProvider>
      <div className="room-canvas min-h-screen bg-[#FDFAF8] text-[#2B2420]" data-room={room} data-focus-mode={focus ? 'true' : 'false'}>
        <div className="mx-auto flex min-h-screen w-full max-w-[1920px] flex-col lg:flex-row">
          {!focus ? <div className="w-full lg:sticky lg:top-0 lg:h-screen lg:w-[236px] lg:shrink-0"><Sidebar /></div> : null}
          <div className="min-w-0 flex-1 bg-[#FDFAF8]">
            {!focus ? <GlobalHeader /> : null}
            <main className={focus ? 'min-h-screen px-4 py-8 sm:px-7 lg:px-10' : 'min-h-screen px-4 pb-20 pt-5 sm:px-7 lg:px-10 lg:pt-7'}>
              <div key={pathname} className="glow-route-stage mx-auto w-full max-w-[1500px]">{children}{!focus?<UpgradeDock/>:null}</div>
            </main>
          </div>
        </div>
      </div>
      {focus ? <button type="button" onClick={exitFocus} className="fixed right-5 top-5 z-[100] inline-flex h-10 items-center gap-2 rounded-full border border-[#E6E6E6] bg-white px-4 text-[13px] font-medium text-[#444448] shadow-sm"><X size={15}/>Exit Focus</button> : null}
      {!focus ? <><ReferenceRoomInteractions /><GlowVoiceCommand /><QuickAdd /><UniversalCaptureDock /><GlowActionButton /></> : null}
    </GlowProvider>
  );
}

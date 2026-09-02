'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Sidebar } from '@/components/ui/sidebar';
import { GlowProvider } from '@/lib/context/glow-provider';
import { QuickAdd } from '@/components/quick-add/quick-add';
import { ReferenceRoomWorkspace } from '@/components/reference-room-workspace';
import { ReferenceRoomInteractions } from '@/components/reference-room-interactions';
import { GlowVoiceCommand } from '@/components/voice/glow-voice-command';
import { DataConnectionVault } from '@/components/data-connection-vault';
import { GlobalHeader } from '@/components/global-header';
import { GlowActionButton } from '@/components/glow-action-button';
import { GlowWorldNav } from '@/components/today/glow-world-nav';
import { roomExperienceFor } from '@/lib/glow-world/room-experience';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const experience = roomExperienceFor(pathname);
  const isImmersiveToday = pathname === '/dashboard' || pathname === '/today/morning' || pathname === '/today/flow' || pathname === '/today/evening' || (process.env.NODE_ENV === 'development' && pathname === '/dev/today-preview');
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

  const worldData = {
    'data-room': experience.room,
    'data-world': experience.world,
    'data-climate': experience.climate,
    'data-physics': experience.physics,
    'data-intelligence': experience.intelligence,
    'data-completion-behavior': experience.completion,
  } as const;

  if (isImmersiveToday && !focus) {
    return <GlowProvider>
      <div {...worldData} className="min-h-screen bg-[#f4efe9] text-[#2f2824]" data-primary-question={experience.primaryQuestion}>{children}</div>
      <GlowWorldNav immersive />
      <GlowVoiceCommand />
      <QuickAdd />
    </GlowProvider>;
  }

  return (
    <GlowProvider>
      <div className="glow-world-shell room-canvas min-h-screen text-[#1C1C1E]" {...worldData} data-focus-mode={focus ? 'true' : 'false'}>
        <div className="glow-world-atmosphere" aria-hidden="true" />
        <div className="mx-auto flex min-h-screen w-full max-w-[1920px] flex-col lg:flex-row">
          {!focus ? <div className="glow-world-nav-wrap w-full lg:sticky lg:top-0 lg:h-screen lg:w-[176px] lg:shrink-0"><Sidebar /></div> : null}
          <div className="glow-room-body min-w-0 flex-1">
            {!focus ? <GlobalHeader /> : null}
            <main className={focus ? 'glow-room-stage min-h-screen px-4 py-8 sm:px-7 lg:px-10' : 'glow-room-stage min-h-screen px-4 pb-20 pt-3 sm:px-5 lg:px-6 lg:pt-4'} data-primary-question={experience.primaryQuestion}>
              <div className="mx-auto w-full max-w-[1500px]">
                <ReferenceRoomWorkspace />
                {!focus ? <DataConnectionVault>{children}</DataConnectionVault> : null}
              </div>
            </main>
          </div>
        </div>
      </div>
      {focus ? <button type="button" onClick={exitFocus} className="fixed right-5 top-5 z-[100] inline-flex h-10 items-center gap-2 rounded-full border border-[#E6E6E6] bg-white px-4 text-[13px] font-medium text-[#444448] shadow-sm"><X size={15}/>Exit Focus</button> : null}
      {!focus ? <><ReferenceRoomInteractions /><GlowVoiceCommand /><QuickAdd /><GlowActionButton /><GlowWorldNav /></> : null}
    </GlowProvider>
  );
}

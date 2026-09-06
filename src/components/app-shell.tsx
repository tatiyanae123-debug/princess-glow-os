'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { GlowProvider } from '@/lib/context/glow-provider';
import { roomExperienceFor } from '@/lib/glow-world/room-experience';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const experience = roomExperienceFor(pathname);
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

  return (
    <GlowProvider>
      <div
        className="glow-world-shell room-canvas min-h-screen text-[#1C1C1E]"
        {...worldData}
        data-focus-mode={focus ? 'true' : 'false'}
        data-enclosure={focus ? 'protected' : 'structured'}
      >
        <div className="glow-world-atmosphere" aria-hidden="true" />
        <div className="glow-world-caustic" aria-hidden="true" />
        <div className="glow-world-depth-plane glow-world-depth-plane-far" aria-hidden="true" />
        <div className="glow-world-depth-plane glow-world-depth-plane-near" aria-hidden="true" />
        <div className="glow-world-frame mx-auto min-h-screen w-full max-w-[1920px]">
          <div className="glow-room-body min-w-0">
            <main className="glow-room-stage min-h-screen px-4 sm:px-5 lg:px-6" data-primary-question={experience.primaryQuestion}>
              <div className="glow-room-content mx-auto w-full max-w-[1500px]">{children}</div>
            </main>
          </div>
        </div>
      </div>
      {focus ? (
        <button type="button" onClick={exitFocus} className="glow-focus-exit fixed z-[80] inline-flex h-10 items-center gap-2 px-4 text-[13px] font-medium">
          <X size={15}/>Exit Focus
        </button>
      ) : null}
    </GlowProvider>
  );
}

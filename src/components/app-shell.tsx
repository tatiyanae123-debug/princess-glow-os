'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { GlowProvider } from '@/lib/context/glow-provider';
import { roomExperienceFor } from '@/lib/glow-world/room-experience';
import { pageContractViolations, pageManifestChainFor, pageManifestFor } from '@/lib/glow-world/page-manifest';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const experience = roomExperienceFor(pathname);
  const manifest = useMemo(() => pageManifestFor(pathname), [pathname]);
  const manifestChain = useMemo(() => pageManifestChainFor(pathname), [pathname]);
  const violations = useMemo(() => pageContractViolations(pathname), [pathname]);
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

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.glowPageRegistered = manifest ? 'true' : 'false';
    root.dataset.glowPageId = manifest?.id ?? 'unregistered';
    root.dataset.glowPageLevel = manifest?.level ?? 'unknown';
    root.dataset.glowExperienceFamily = manifest?.family ?? 'legacy-unregistered';
    root.dataset.glowDesignFamily = manifest?.designFamily ?? 'legacy-unregistered';
    root.dataset.glowLocationDepth = String(manifestChain.length);
    root.dataset.glowContractState = violations.length ? 'violation' : 'valid';

    document.dispatchEvent(new CustomEvent('glow:location-context', {
      detail: {
        pathname,
        page: manifest,
        ancestry: manifestChain,
        violations,
      },
    }));

    if (violations.length) {
      document.dispatchEvent(new CustomEvent('glow:architecture-regression', {
        detail: { pathname, violations },
      }));
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Glow OS page contract]', pathname, violations);
      }
    }
  }, [manifest, manifestChain, pathname, violations]);

  function exitFocus() {
    const params = new URLSearchParams(window.location.search);
    params.delete('focus');
    router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    setFocus(false);
  }

  const worldData = {
    'data-room': experience.room,
    'data-world': manifest?.world ?? experience.world,
    'data-climate': experience.climate,
    'data-physics': experience.physics,
    'data-intelligence': experience.intelligence,
    'data-completion-behavior': experience.completion,
    'data-page-id': manifest?.id ?? 'unregistered',
    'data-page-level': manifest?.level ?? 'unknown',
    'data-experience-family': manifest?.family ?? 'legacy-unregistered',
    'data-design-family': manifest?.designFamily ?? 'legacy-unregistered',
    'data-page-contract': violations.length ? 'violation' : 'valid',
  } as const;

  return (
    <GlowProvider>
      <div className="glow-world-shell room-canvas min-h-screen text-[#1C1C1E]" {...worldData} data-focus-mode={focus ? 'true' : 'false'}>
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

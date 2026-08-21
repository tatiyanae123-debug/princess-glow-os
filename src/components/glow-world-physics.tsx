'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getGlowVisualConfig } from '@/lib/glow-visual-migration';

const INTELLIGENCE_EVENTS = ['glow:intelligence', 'glow:command-complete', 'glow:action-complete'] as const;

export function GlowWorldPhysics() {
  const pathname = usePathname();

  useEffect(() => {
    const { climate, version } = getGlowVisualConfig(pathname);
    document.documentElement.dataset.glowWorld = 'liquid-crystal';
    document.body.dataset.glowZone = climate;
    document.body.dataset.glowVisualVersion = version;
    document.body.classList.remove('glow-route-condense');
    void document.body.offsetWidth;
    document.body.classList.add('glow-route-condense');
    const timer = window.setTimeout(() => document.body.classList.remove('glow-route-condense'), 520);

    return () => {
      window.clearTimeout(timer);
      delete document.body.dataset.glowZone;
      delete document.body.dataset.glowVisualVersion;
      document.body.classList.remove('glow-route-condense');
    };
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const field = document.querySelector('.glow-effects-overlay__ripples') as HTMLElement | null;

    const ripple = (event: PointerEvent) => {
      if (!field) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest('button, a, [role="button"], input, textarea, select, [data-glow-interactive]');
      if (!interactive) return;

      const wave = document.createElement('span');
      wave.className = 'glow-touch-ripple';
      wave.style.left = `${event.clientX}px`;
      wave.style.top = `${event.clientY}px`;
      field.appendChild(wave);
      window.setTimeout(() => wave.remove(), 850);
    };

    let auroraTimer: number | undefined;
    const intelligence = () => {
      root.classList.remove('glow-intelligence-awake');
      void root.offsetWidth;
      root.classList.add('glow-intelligence-awake');
      if (auroraTimer) window.clearTimeout(auroraTimer);
      auroraTimer = window.setTimeout(() => root.classList.remove('glow-intelligence-awake'), 1450);
    };

    document.addEventListener('pointerdown', ripple, { passive: true });
    INTELLIGENCE_EVENTS.forEach((name) => document.addEventListener(name, intelligence));

    return () => {
      document.removeEventListener('pointerdown', ripple);
      INTELLIGENCE_EVENTS.forEach((name) => document.removeEventListener(name, intelligence));
      if (auroraTimer) window.clearTimeout(auroraTimer);
    };
  }, []);

  return (
    <>
      <div className="glow-world-physics" aria-hidden="true">
        <div className="glow-world-physics__depth" />
        <div className="glow-world-physics__caustics" />
        <div className="glow-world-physics__aurora" />
        <div className="glow-world-physics__grain" />
      </div>
      <div className="glow-effects-overlay" aria-hidden="true">
        <div className="glow-effects-overlay__ripples" />
      </div>
    </>
  );
}

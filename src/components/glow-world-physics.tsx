'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ZONES: Array<[RegExp, string]> = [
  [/^\/(today|briefings?)/, 'dawn'],
  [/^\/(calendar|planning|tasks|reminders|goals|projects|routines|habits)/, 'time'],
  [/^\/(fitness|wellness|body)/, 'vital'],
  [/^\/(beauty|beauty-lab|makeup|skincare|hair|closet)/, 'pearl'],
  [/^\/(finance|financial-brain|money)/, 'emerald'],
  [/^\/(brain|memory|timeline|observations|graph|connections|notices|concierge)/, 'violet'],
  [/^\/(create|capture|creative|notes|inbox|gmail|import)/, 'opal'],
  [/^\/(home|world)/, 'earth'],
  [/^\/work/, 'slate'],
];

function zoneFor(pathname: string) {
  return ZONES.find(([pattern]) => pattern.test(pathname))?.[1] ?? 'dawn';
}

export function GlowWorldPhysics() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.dataset.glowWorld = 'liquid-crystal';
    document.body.dataset.glowZone = zoneFor(pathname);
    return () => {
      delete document.body.dataset.glowZone;
    };
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;

    const ripple = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest('button, a, [role="button"], input, textarea, select, [data-glow-interactive]') as HTMLElement | null;
      if (!interactive) return;

      const rect = interactive.getBoundingClientRect();
      const wave = document.createElement('span');
      wave.className = 'glow-touch-ripple';
      wave.style.setProperty('--ripple-x', `${event.clientX - rect.left}px`);
      wave.style.setProperty('--ripple-y', `${event.clientY - rect.top}px`);
      interactive.classList.add('glow-ripple-host');
      interactive.appendChild(wave);
      window.setTimeout(() => wave.remove(), 850);
    };

    const intelligence = () => {
      root.classList.remove('glow-intelligence-awake');
      void root.offsetWidth;
      root.classList.add('glow-intelligence-awake');
      window.setTimeout(() => root.classList.remove('glow-intelligence-awake'), 1450);
    };

    document.addEventListener('pointerdown', ripple, { passive: true });
    window.addEventListener('glow:intelligence', intelligence as EventListener);

    return () => {
      document.removeEventListener('pointerdown', ripple);
      window.removeEventListener('glow:intelligence', intelligence as EventListener);
    };
  }, []);

  return (
    <div className="glow-world-physics" aria-hidden="true">
      <div className="glow-world-physics__depth" />
      <div className="glow-world-physics__caustics" />
      <div className="glow-world-physics__aurora" />
      <div className="glow-world-physics__grain" />
    </div>
  );
}

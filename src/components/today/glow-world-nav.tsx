'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Brain, CalendarDays, Feather, Flower2, Sparkles, SunMedium } from 'lucide-react';
import { cn } from '@/lib/utils';

const worlds = [
  { label: 'Today', href: '/dashboard', icon: SunMedium, matches: ['/dashboard', '/today'] },
  { label: 'Plan', href: '/planning', icon: CalendarDays, matches: ['/planning', '/calendar', '/tasks', '/routines', '/habits'] },
  { label: 'Life', href: '/world', icon: Flower2, matches: ['/world', '/wellness', '/fitness', '/food', '/beauty', '/hair', '/finance', '/goals', '/projects'] },
  { label: 'Brain', href: '/brain', icon: Brain, matches: ['/brain', '/briefings', '/memory', '/timeline', '/observations', '/search'] },
  { label: 'Create', href: '/intake', icon: Feather, matches: ['/intake', '/notes'] },
] as const;

export function GlowWorldNav({ immersive = false }: { immersive?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    window.localStorage.setItem('glow:last-route', pathname);
    const world = worlds.find((item) => item.matches.some((path) => pathname === path || pathname.startsWith(`${path}/`)));
    if (world) window.localStorage.setItem(`glow:last:${world.label.toLowerCase()}`, pathname);
  }, [pathname]);

  function move(href: string, label: string) {
    const remembered = window.localStorage.getItem(`glow:last:${label.toLowerCase()}`);
    const destination = remembered && remembered.startsWith(href === '/dashboard' ? '/today' : href) ? remembered : href;
    const navigate = () => router.push(destination);
    if ('startViewTransition' in document) {
      (document as Document & { startViewTransition: (callback: () => void) => void }).startViewTransition(navigate);
    } else {
      navigate();
    }
  }

  return <nav className={cn('glow-world-dock', immersive && 'glow-world-dock--immersive')} aria-label="Glow worlds">
    {worlds.map(({ label, href, icon: Icon, matches }) => {
      const active = matches.some((path) => pathname === path || pathname.startsWith(`${path}/`));
      const isCreate = label === 'Create';
      return <button key={label} type="button" aria-current={active ? 'page' : undefined} className={cn('glow-world-dock__item', active && 'is-active')} onClick={() => {
        if (isCreate) {
          document.dispatchEvent(new CustomEvent('glow:quick-add'));
          return;
        }
        move(href, label);
      }}>
        <span className="glow-world-dock__halo">{active ? <Sparkles aria-hidden="true" /> : null}<Icon aria-hidden="true" /></span>
        <span>{label}</span>
      </button>;
    })}
  </nav>;
}

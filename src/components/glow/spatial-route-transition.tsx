'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function SpatialRouteTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const busy = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const clear = window.setTimeout(() => {
      busy.current = false;
      document.documentElement.removeAttribute('data-glow-transition');
    }, 260);
    return () => window.clearTimeout(clear);
  }, [pathname]);

  useEffect(() => {
    const move = (destination: string) => {
      if (!destination || busy.current) return;
      const url = new URL(destination, window.location.href);
      if (url.origin !== window.location.origin) {
        window.location.href = url.href;
        return;
      }
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const next = `${url.pathname}${url.search}${url.hash}`;
      if (current === next) return;
      busy.current = true;
      document.documentElement.setAttribute('data-glow-transition', 'moving');
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => router.push(next), 170);
      window.setTimeout(() => {
        if (!busy.current) return;
        busy.current = false;
        document.documentElement.removeAttribute('data-glow-transition');
      }, 1100);
    };

    const onGlowNavigate = (event: Event) => {
      const detail = (event as CustomEvent<{ path?: string }>).detail;
      if (detail?.path) move(detail.path);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest('a[href]') as HTMLAnchorElement | null : null;
      if (!target || target.hasAttribute('download') || target.dataset.noGlowTransition === 'true') return;
      if (target.target && target.target !== '_self') return;
      const url = new URL(target.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith('/api/')) return;
      const sameDocumentHash = url.pathname === window.location.pathname && url.search === window.location.search && url.hash;
      if (sameDocumentHash) return;
      event.preventDefault();
      move(url.href);
    };

    document.addEventListener('glow:navigate', onGlowNavigate as EventListener);
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('glow:navigate', onGlowNavigate as EventListener);
      document.removeEventListener('click', onClick, true);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [router]);

  return <div className="glow-spatial-transition-field" aria-hidden="true"><span/><i/><b/></div>;
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Universal Home guarantee for Glow OS.
 *
 * Every current and future page inherits this component from the root layout.
 * If a room already exposes its own visible /home link (normally the Glow OS
 * wordmark), this fallback stays out of the way. If the room does not expose
 * one, Glow OS appears automatically as a small fixed Home anchor.
 *
 * This keeps the product rule simple and permanent:
 * Glow OS = Home.
 */
export function GlobalHomeControl() {
  const pathname = usePathname();
  const [hasLocalHomeAnchor, setHasLocalHomeAnchor] = useState(true);

  useEffect(() => {
    if (pathname === '/' || pathname === '/home' || pathname === '/sign-in') {
      setHasLocalHomeAnchor(true);
      return;
    }

    const update = () => {
      const localAnchors = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[data-glow-home-anchor="true"], a[href="/home"]',
        ),
      ).filter((node) => !node.hasAttribute('data-global-glow-home-control'));

      const hasVisibleAnchor = localAnchors.some((node) => {
        const style = window.getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity || '1') > 0 &&
          rect.width > 0 &&
          rect.height > 0
        );
      });

      setHasLocalHomeAnchor(hasVisibleAnchor);
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href', 'class', 'style', 'hidden', 'aria-hidden'],
    });

    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [pathname]);

  if (
    pathname === '/' ||
    pathname === '/home' ||
    pathname === '/sign-in' ||
    hasLocalHomeAnchor
  ) {
    return null;
  }

  return (
    <Link
      href="/home"
      aria-label="Glow OS Home"
      data-global-glow-home-control="true"
      className="fixed left-[max(14px,env(safe-area-inset-left))] top-[max(14px,env(safe-area-inset-top))] z-[1000] inline-flex min-h-11 items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3.5 py-2.5 text-[13px] font-medium tracking-[-0.01em] text-neutral-800 shadow-[0_14px_45px_rgba(70,60,70,0.12),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-2xl transition duration-200 hover:-translate-y-0.5 hover:bg-white/88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/35"
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 rounded-full border border-white/90 bg-[radial-gradient(circle_at_30%_24%,_#fff_0%,_#fff_20%,_#eee8ff_43%,_#f7e7dd_67%,_rgba(255,255,255,0.62)_100%)] shadow-[0_5px_16px_rgba(126,111,148,0.20),inset_0_1px_3px_rgba(255,255,255,0.95)]"
      />
      <span>Glow OS</span>
    </Link>
  );
}

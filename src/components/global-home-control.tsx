'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Permanent Glow OS Home anchor for routes that do not own a stronger local
 * navigation authority.
 *
 * The control is always available but does not permanently occupy the page.
 * It fades and recedes after a short idle period, then returns when the user
 * moves toward the upper-left edge, scrolls upward, or tabs into navigation.
 */
export function GlobalHomeControl() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const lastScrollY = useRef(0);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const scheduleHide = useCallback((delay = 1900) => {
    clearHideTimer();
    hideTimer.current = window.setTimeout(() => setVisible(false), delay);
  }, [clearHideTimer]);

  const reveal = useCallback((delay = 1900) => {
    setVisible(true);
    scheduleHide(delay);
  }, [scheduleHide]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handlePointerMove = (event: PointerEvent) => {
      if (event.clientY <= 72 && event.clientX <= 210) reveal(2200);
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch && touch.clientY <= 58 && touch.clientX <= 180) reveal(2300);
    };

    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Tab') reveal(2800);
    };

    const handleScroll = () => {
      const nextY = window.scrollY;
      if (nextY < lastScrollY.current - 4 || nextY < 12) {
        reveal(1500);
      } else if (nextY > lastScrollY.current + 8) {
        setVisible(false);
        clearHideTimer();
      }
      lastScrollY.current = nextY;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('keydown', handleKeyboard);
    window.addEventListener('scroll', handleScroll, { passive: true });
    reveal(2500);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('keydown', handleKeyboard);
      window.removeEventListener('scroll', handleScroll);
      clearHideTimer();
    };
  }, [clearHideTimer, reveal]);

  if (pathname === '/' || pathname === '/home' || pathname === '/sign-in' || pathname === '/today') {
    return null;
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed left-0 top-0 z-[30001] h-[22px] w-[170px]"
        onPointerEnter={() => reveal(2300)}
        onPointerDown={() => reveal(2300)}
      />

      <Link
        href="/home"
        aria-label="Glow OS Home"
        data-global-glow-home-control="true"
        data-navigation-visibility={visible ? 'visible' : 'receded'}
        onPointerEnter={() => {
          clearHideTimer();
          setVisible(true);
        }}
        onPointerLeave={() => scheduleHide(1100)}
        onFocus={() => {
          clearHideTimer();
          setVisible(true);
        }}
        onBlur={() => scheduleHide(1200)}
        className={`fixed left-[max(10px,env(safe-area-inset-left))] top-[max(8px,env(safe-area-inset-top))] z-[30000] inline-flex min-h-9 items-center gap-2 rounded-full border border-white/45 bg-white/28 px-3 py-2 text-[12px] font-semibold tracking-[-0.01em] text-neutral-800 shadow-[0_8px_28px_rgba(70,60,70,0.06),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl transition-[transform,opacity,background-color,box-shadow] duration-500 ease-[cubic-bezier(.22,.8,.22,1)] hover:bg-white/48 hover:shadow-[0_10px_30px_rgba(70,60,70,0.08),inset_0_1px_0_rgba(255,255,255,0.82)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/25 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-[calc(100%+18px)] opacity-0 pointer-events-none'}`}
      >
        <span
          aria-hidden="true"
          className="h-4.5 w-4.5 rounded-full border border-white/85 bg-[radial-gradient(circle_at_30%_24%,_#fff_0%,_#fff_20%,_#eee8ff_43%,_#f7e7dd_67%,_rgba(255,255,255,0.52)_100%)] shadow-[0_4px_12px_rgba(126,111,148,0.14),inset_0_1px_3px_rgba(255,255,255,0.82)]"
        />
        <span>Glow OS</span>
      </Link>
    </>
  );
}

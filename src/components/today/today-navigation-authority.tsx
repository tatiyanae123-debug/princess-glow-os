'use client';

import { Focus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type TodayRoom =
  | 'morning'
  | 'what-now'
  | 'focus'
  | 'people'
  | 'places'
  | 'resources'
  | 'journey'
  | 'meeting'
  | 'next-up'
  | 'later'
  | 'tonight'
  | 'tomorrow'
  | 'replan';

const directRoomMap: Record<string, TodayRoom> = {
  today: 'what-now',
  focus: 'focus',
  people: 'people',
  places: 'places',
  resources: 'resources',
  journey: 'journey',
  journeys: 'journey',
};

function currentRoom(): TodayRoom {
  if (typeof window === 'undefined') return 'what-now';
  const value = new URL(window.location.href).searchParams.get('room') as TodayRoom | null;
  return value ?? (new Date().getHours() < 12 ? 'morning' : 'what-now');
}

function hardGo(room: TodayRoom) {
  const url = new URL(window.location.href);
  url.pathname = '/today';
  url.searchParams.set('room', room);
  url.hash = '';
  window.location.assign(url.toString());
}

export function TodayNavigationAuthority() {
  const [room, setRoom] = useState<TodayRoom>('what-now');
  const [navVisible, setNavVisible] = useState(true);
  const hideTimer = useRef<number | null>(null);
  const scrollPositions = useRef(new WeakMap<EventTarget, number>());

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const scheduleHide = useCallback((delay = 1900) => {
    clearHideTimer();
    hideTimer.current = window.setTimeout(() => setNavVisible(false), delay);
  }, [clearHideTimer]);

  const revealNavigation = useCallback((delay = 1900) => {
    setNavVisible(true);
    scheduleHide(delay);
  }, [scheduleHide]);

  const openGlow = useCallback(() => {
    revealNavigation(2800);
    document.dispatchEvent(new CustomEvent('glow:open'));
  }, [revealNavigation]);

  useEffect(() => {
    setRoom(currentRoom());

    const resetAllScrollers = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.querySelectorAll<HTMLElement>('[class*="overlay"], [class*="stage"], main').forEach((node) => {
        if (node.scrollHeight > node.clientHeight) node.scrollTop = 0;
      });
    };
    resetAllScrollers();

    const handleLegacyNavigation = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLElement>('[aria-label="Connected context"] a, [aria-label="Connected context"] button, [aria-label="Today world navigation"] a, [aria-label="Today world navigation"] button');
      if (!button) return;
      const label = (button.textContent ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
      const matchedKey = Object.keys(directRoomMap).find((key) => label === key || label.startsWith(`${key} `));
      if (!matchedKey) return;
      event.preventDefault();
      event.stopPropagation();
      hardGo(directRoomMap[matchedKey]);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.clientY <= 92) revealNavigation(2100);
    };
    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch && touch.clientY <= 52) revealNavigation(2300);
    };
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Tab' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) revealNavigation(3000);
    };
    const handleAnyScroll = (event: Event) => {
      const target = event.target === document ? document.scrollingElement : event.target;
      if (!(target instanceof Element)) return;
      const next = target.scrollTop;
      const previous = scrollPositions.current.get(target) ?? next;
      if (next < previous - 4 || next < 16) revealNavigation(1700);
      else if (next > previous + 8) {
        setNavVisible(false);
        clearHideTimer();
      }
      scrollPositions.current.set(target, next);
    };

    document.addEventListener('click', handleLegacyNavigation, true);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('keydown', handleKeyboard);
    document.addEventListener('scroll', handleAnyScroll, true);
    revealNavigation(2800);

    return () => {
      document.removeEventListener('click', handleLegacyNavigation, true);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('keydown', handleKeyboard);
      document.removeEventListener('scroll', handleAnyScroll, true);
      clearHideTimer();
    };
  }, [clearHideTimer, revealNavigation]);

  useEffect(() => scheduleHide(1900), [scheduleHide]);

  const focusActive = room === 'focus';
  const roomLabel = useMemo(() => {
    if (room === 'what-now') return 'Now';
    if (room === 'morning') return 'Morning';
    if (room === 'tomorrow') return 'Tomorrow';
    return room.charAt(0).toUpperCase() + room.slice(1).replace('-', ' ');
  }, [room]);

  const navigationState = navVisible
    ? 'translate-y-0 opacity-100'
    : '-translate-y-[calc(100%+22px)] opacity-0 pointer-events-none';

  return (
    <>
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60001] h-[18px]" onPointerEnter={() => revealNavigation(2400)} onPointerDown={() => revealNavigation(2400)} />
      <span aria-hidden="true" className={`pointer-events-none fixed left-1/2 top-[max(2px,env(safe-area-inset-top))] z-[60000] h-[3px] w-10 -translate-x-1/2 rounded-full bg-white/75 shadow-[0_0_12px_rgba(255,255,255,0.75)] transition-opacity duration-500 ${navVisible ? 'opacity-0' : 'opacity-35'}`} />

      <nav
        aria-label="Glow OS primary navigation"
        data-glow-navigation-authority="true"
        data-navigation-visibility={navVisible ? 'visible' : 'receded'}
        onPointerEnter={() => { clearHideTimer(); setNavVisible(true); }}
        onPointerLeave={() => scheduleHide(1200)}
        onFocusCapture={() => { clearHideTimer(); setNavVisible(true); }}
        onBlurCapture={() => scheduleHide(1400)}
        className={`fixed left-1/2 top-[max(7px,env(safe-area-inset-top))] z-[60000] grid h-[48px] w-[min(980px,calc(100vw-24px))] -translate-x-1/2 grid-cols-[1fr_auto_1fr] items-center rounded-[20px] border border-white/45 bg-[rgba(249,246,242,0.30)] px-4 shadow-[0_8px_28px_rgba(80,67,72,0.05),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl backdrop-saturate-125 transition-[transform,opacity,background-color,box-shadow] duration-500 ease-[cubic-bezier(.22,.8,.22,1)] hover:bg-[rgba(249,246,242,0.48)] ${navigationState}`}
      >
        <a href="/home" aria-label="Glow OS Home" className="justify-self-start text-[12px] font-semibold tracking-[-0.02em] text-neutral-900 no-underline">Glow OS</a>

        <a href="/today?room=what-now" aria-label="Go to Today" className="inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-[11px] font-medium text-neutral-700 no-underline transition hover:bg-white/32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/25">
          <span className="h-3.5 w-3.5 rounded-full border border-white/85 bg-[radial-gradient(circle_at_30%_24%,#fff_0%,#fff_22%,#eee8ff_45%,#f7e7dd_72%)] shadow-[0_3px_10px_rgba(126,111,148,0.12)]" aria-hidden="true" />
          Today
          {focusActive ? <span className="ml-1 hidden items-center gap-1 rounded-full border border-white/55 bg-white/25 px-2 py-1 text-[9px] text-neutral-600 sm:inline-flex"><Focus size={10} strokeWidth={1.5} /> Focus active</span> : null}
        </a>

        <button type="button" aria-label={`Ask Glow from ${roomLabel}`} onClick={openGlow} className="inline-flex min-h-9 items-center gap-2 justify-self-end rounded-full border-0 bg-transparent px-2 text-[11px] font-medium text-neutral-800">
          <span className="h-6 w-6 rounded-[48%_52%_57%_43%/45%_42%_58%_55%] border border-white/82 bg-[radial-gradient(circle_at_32%_24%,#fff_0%,#fff_18%,#ececff_46%,#f8e5d4_76%)] shadow-[inset_3px_3px_8px_rgba(255,255,255,0.72),0_4px_12px_rgba(94,83,90,0.10)]" aria-hidden="true" />
          Ask Glow
        </button>
      </nav>
    </>
  );
}

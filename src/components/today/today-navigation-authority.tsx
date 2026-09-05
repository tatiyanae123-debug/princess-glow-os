'use client';

import { Focus, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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

/**
 * The single navigation authority for every Today environment.
 *
 * This component intentionally sits above every room, overlay, reference
 * surface, and internal scroller. Room content may scroll underneath it, but
 * the three primary anchors never disappear:
 *
 * Glow OS = Home
 * Today = What Now
 * Ask Glow = anywhere
 *
 * It also captures older contextual navigation controls and routes them with a
 * full browser navigation so a visible button can never become a frozen UI
 * decoration on iPad Safari.
 */
export function TodayNavigationAuthority() {
  const [room, setRoom] = useState<TodayRoom>('what-now');
  const [askOpen, setAskOpen] = useState(false);

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
      if (!target) return;

      const button = target.closest<HTMLElement>(
        '[aria-label="Connected context"] button, [aria-label="Today world navigation"] button',
      );
      if (!button) return;

      const label = (button.textContent ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
      const matchedKey = Object.keys(directRoomMap).find((key) => label === key || label.startsWith(`${key} `));
      if (!matchedKey) return;

      event.preventDefault();
      event.stopPropagation();
      hardGo(directRoomMap[matchedKey]);
    };

    document.addEventListener('click', handleLegacyNavigation, true);
    return () => document.removeEventListener('click', handleLegacyNavigation, true);
  }, []);

  const focusActive = room === 'focus';
  const roomLabel = useMemo(() => {
    if (room === 'what-now') return 'Now';
    if (room === 'morning') return 'Morning';
    if (room === 'tomorrow') return 'Tomorrow';
    if (room === 'tonight') return 'Tonight';
    return room.charAt(0).toUpperCase() + room.slice(1).replace('-', ' ');
  }, [room]);

  return (
    <>
      <nav
        aria-label="Glow OS primary navigation"
        data-glow-navigation-authority="true"
        className="fixed left-1/2 top-[max(10px,env(safe-area-inset-top))] z-[60000] grid h-[62px] w-[min(1480px,calc(100vw-20px))] -translate-x-1/2 grid-cols-[1fr_auto_1fr] items-center rounded-[24px] border border-white/85 bg-[rgba(249,246,242,0.90)] px-5 shadow-[0_14px_50px_rgba(80,67,72,0.13),inset_0_1px_0_rgba(255,255,255,0.98)] backdrop-blur-2xl"
      >
        <a
          href="/home"
          aria-label="Glow OS Home"
          className="justify-self-start text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 no-underline"
        >
          Glow OS
        </a>

        <a
          href="/today?room=what-now"
          aria-label="Go to Today"
          className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-[12px] font-medium text-neutral-700 no-underline transition hover:bg-white/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/30"
        >
          <span className="h-4 w-4 rounded-full border border-white/95 bg-[radial-gradient(circle_at_30%_24%,#fff_0%,#fff_22%,#eee8ff_45%,#f7e7dd_72%)] shadow-[0_4px_12px_rgba(126,111,148,0.16)]" aria-hidden="true" />
          Today
          {focusActive ? (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/45 px-2 py-1 text-[10px] text-neutral-600">
              <Focus size={11} strokeWidth={1.5} /> Focus active
            </span>
          ) : null}
        </a>

        <button
          type="button"
          aria-expanded={askOpen}
          onClick={() => setAskOpen((value) => !value)}
          className="inline-flex min-h-10 items-center gap-2 justify-self-end rounded-full border-0 bg-transparent px-2 text-[12px] font-medium text-neutral-800"
        >
          <span className="h-7 w-7 rounded-[48%_52%_57%_43%/45%_42%_58%_55%] border border-white/95 bg-[radial-gradient(circle_at_32%_24%,#fff_0%,#fff_18%,#ececff_46%,#f8e5d4_76%)] shadow-[inset_4px_4px_10px_rgba(255,255,255,0.85),0_6px_16px_rgba(94,83,90,0.14)]" aria-hidden="true" />
          Ask Glow
        </button>
      </nav>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-[max(10px,env(safe-area-inset-top))] z-[59999] h-[76px] w-[min(1490px,calc(100vw-8px))] -translate-x-1/2 bg-gradient-to-b from-[rgba(247,243,239,0.58)] to-transparent"
      />

      {askOpen ? (
        <aside
          role="dialog"
          aria-label="Ask Glow"
          className="fixed right-[max(16px,env(safe-area-inset-right))] top-[max(82px,calc(env(safe-area-inset-top)+82px))] z-[60010] w-[min(380px,calc(100vw-32px))] rounded-[24px] border border-white/85 bg-[rgba(249,246,243,0.94)] p-4 shadow-[0_24px_72px_rgba(85,74,82,0.18),inset_0_1px_0_white] backdrop-blur-3xl"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <strong className="block text-[13px] text-neutral-900">Glow</strong>
              <span className="text-[11px] text-neutral-500">You do not need to know which page owns it.</span>
            </div>
            <button type="button" onClick={() => setAskOpen(false)} aria-label="Close Ask Glow" className="h-8 w-8 rounded-full border border-white/80 bg-white/45 text-neutral-700">×</button>
          </div>
          <p className="mt-3 text-[12px] leading-5 text-neutral-600">Tell Glow what you want to do, find, continue, or open.</p>
          <div className="mt-3 grid gap-2">
            <a href="/today?room=what-now" className="rounded-full border border-white/80 bg-white/45 px-3 py-2 text-center text-[12px] font-medium text-neutral-700 no-underline">What should I do now?</a>
            <a href="/today?room=tomorrow" className="rounded-full border border-white/80 bg-white/45 px-3 py-2 text-center text-[12px] font-medium text-neutral-700 no-underline">Show tomorrow</a>
            <a href="/today?room=replan" className="rounded-full border border-white/80 bg-white/45 px-3 py-2 text-center text-[12px] font-medium text-neutral-700 no-underline">Replan my day</a>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-neutral-500"><Sparkles size={11} /> Current context: {roomLabel}</div>
        </aside>
      ) : null}
    </>
  );
}

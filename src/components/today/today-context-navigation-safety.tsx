'use client';

import { FileText, Focus, MapPin, Route, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

type ContextRoom = 'focus' | 'people' | 'places' | 'resources' | 'journey';

const items: Array<{ room: ContextRoom; label: string; icon: React.ReactNode }> = [
  { room: 'focus', label: 'Focus', icon: <Focus size={16} strokeWidth={1.45} /> },
  { room: 'people', label: 'People', icon: <Users size={16} strokeWidth={1.45} /> },
  { room: 'places', label: 'Places', icon: <MapPin size={16} strokeWidth={1.45} /> },
  { room: 'resources', label: 'Resources', icon: <FileText size={16} strokeWidth={1.45} /> },
  { room: 'journey', label: 'Journey', icon: <Route size={16} strokeWidth={1.45} /> },
];

function getRoom(): ContextRoom | null {
  if (typeof window === 'undefined') return null;
  const value = new URL(window.location.href).searchParams.get('room');
  return value === 'focus' || value === 'people' || value === 'places' || value === 'resources' || value === 'journey'
    ? value
    : null;
}

function hardGo(room: string) {
  const url = new URL(window.location.href);
  url.pathname = '/today';
  url.searchParams.set('room', room);
  url.hash = '';
  window.location.assign(url.toString());
}

/**
 * Reliability safety layer for the contextual Today rooms.
 *
 * These controls intentionally use a full browser navigation instead of the
 * in-memory room switch. That makes them dependable in iPad Safari, preview
 * deployments, and any future room implementation. The visual Glow Current
 * transition can remain sophisticated elsewhere, but a visible control may
 * never be frozen.
 */
export function TodayContextNavigationSafety() {
  const [room, setRoom] = useState<ContextRoom | null>(null);

  useEffect(() => {
    setRoom(getRoom());

    // A newly opened contextual room must start at its visible top.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.querySelectorAll<HTMLElement>('div[class*="overlay"]').forEach((node) => {
      node.scrollTop = 0;
      node.scrollLeft = 0;
    });
  }, []);

  if (!room) return null;

  return (
    <nav
      aria-label="Connected Today rooms"
      className="fixed bottom-[max(14px,env(safe-area-inset-bottom))] left-1/2 z-[25000] flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full border border-white/85 bg-white/80 p-1.5 shadow-[0_18px_55px_rgba(75,63,70,0.16),inset_0_1px_0_rgba(255,255,255,0.98)] backdrop-blur-2xl"
    >
      <button
        type="button"
        onClick={() => hardGo('what-now')}
        className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3 text-[12px] font-medium text-neutral-700 transition hover:bg-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/30"
      >
        <span className="h-4 w-4 rounded-full border border-white bg-[radial-gradient(circle_at_30%_25%,#fff_0%,#eee8ff_45%,#f6e5d8_75%)] shadow-sm" aria-hidden="true" />
        Today
      </button>

      {items.map((item) => (
        <button
          key={item.room}
          type="button"
          aria-current={room === item.room ? 'page' : undefined}
          onClick={() => hardGo(item.room)}
          className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/30 ${
            room === item.room
              ? 'border border-white bg-white/72 font-semibold text-neutral-900 shadow-[0_6px_18px_rgba(80,67,72,0.08)]'
              : 'font-medium text-neutral-600 hover:bg-white/58'
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

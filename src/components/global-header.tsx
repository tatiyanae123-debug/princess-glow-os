'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, CalendarDays, MessageCircle, Plus, Search, Sun, UserRound } from 'lucide-react';

export function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [now, setNow] = useState<Date | null>(null);
  const isTasks = pathname.startsWith('/tasks');
  const createModule = isTasks ? 'task' : undefined;

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const dateLabel = useMemo(() => {
    if (!now) return '';
    return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(now);
  }, [now]);

  function openCreate() {
    document.dispatchEvent(new CustomEvent('glow:quick-add', { detail: createModule ? { module: createModule } : {} }));
  }

  function openVoiceOrSearch() {
    document.dispatchEvent(new CustomEvent('glow:voice-open'));
    router.push('/search');
  }

  return (
    <header className="glow-command-bar sticky top-0 z-40 flex h-[68px] w-full max-w-full min-w-0 items-center gap-2 overflow-x-clip border-b border-[#EEE5E0] bg-[#FDFAF8]/92 px-4 backdrop-blur-2xl sm:h-[64px] sm:gap-3 sm:px-7 lg:px-10">
      <button
        type="button"
        onClick={openVoiceOrSearch}
        className="glow-command-search flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#ECE2DD] bg-white/90 px-3.5 text-left text-[12.5px] text-[#978D87] shadow-[0_8px_24px_rgba(73,51,42,.04)] transition hover:border-[#DDCEC7] sm:h-10 sm:max-w-[520px] sm:px-4"
        aria-label="Ask Glow anything"
      >
        <Search size={15} className="shrink-0 text-[#B2A8A2]" />
        <span className="min-w-0 truncate">Ask Glow anything...</span>
        <span className="ml-auto hidden text-[10px] tracking-[.08em] text-[#B9AFAA] md:inline">⌘K</span>
      </button>

      <div className="ml-auto hidden min-w-0 items-center gap-3 border-r border-[#E9DED8] pr-4 text-[#716862] xl:flex">
        <Sun size={16} strokeWidth={1.5} className="text-[#D3A15F]" />
        <div className="leading-tight">
          <p className="text-[10px] font-medium text-[#5F5752]">{dateLabel || 'Today'}</p>
          <p className="mt-0.5 text-[9px] text-[#A39993]">Glow OS</p>
        </div>
      </div>

      <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-1.5">
        <button type="button" onClick={openCreate} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#C55C73] text-white shadow-[0_8px_22px_rgba(197,92,115,.22)] transition hover:bg-[#B95168]" aria-label="Add anything">
          <Plus size={18} strokeWidth={1.8} />
        </button>
        <button type="button" onClick={() => router.push('/calendar')} className="hidden h-10 w-10 items-center justify-center rounded-full text-[#80756F] transition hover:bg-white sm:inline-flex" aria-label="Open calendar">
          <CalendarDays size={17} strokeWidth={1.5} />
        </button>
        <button type="button" onClick={() => router.push('/concierge')} className="hidden h-10 w-10 items-center justify-center rounded-full text-[#80756F] transition hover:bg-white md:inline-flex" aria-label="Open Glow Concierge">
          <MessageCircle size={17} strokeWidth={1.5} />
        </button>
        <button type="button" onClick={() => router.push('/notices')} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#80756F] transition hover:bg-white" aria-label="Open notices">
          <Bell size={17} strokeWidth={1.5} />
        </button>
        <button type="button" onClick={() => router.push('/settings?section=profile')} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E8DCD6] bg-[#F2E3DD] text-[#805B54] transition hover:opacity-85" aria-label="Open profile">
          <UserRound size={14} />
        </button>
      </div>
    </header>
  );
}

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
    const update = () => setNow(new Date());
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const date = useMemo(() => {
    if (!now) return { weekday: '', date: '' };
    return {
      weekday: new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(now),
      date: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(now),
    };
  }, [now]);

  function openCreate() {
    document.dispatchEvent(new CustomEvent('glow:quick-add', { detail: createModule ? { module: createModule } : {} }));
  }

  function openSearch() {
    document.dispatchEvent(new CustomEvent('glow:search-open'));
  }

  return (
    <header className="sticky top-0 z-40 flex h-[58px] w-full max-w-full min-w-0 items-center gap-2 overflow-x-clip border-b border-[#F0E7E5] bg-white/96 px-3 backdrop-blur-xl sm:h-[62px] sm:gap-3 sm:px-6 lg:h-[64px] lg:px-8">
      <button type="button" onClick={openSearch} className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#EEE6E3] bg-white px-3.5 text-left text-[12px] text-[#948B86] shadow-[0_1px_4px_rgba(67,47,38,.025)] transition hover:border-[#E4D7D4] hover:shadow-[0_7px_22px_rgba(67,47,38,.045)] active:scale-[.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D1D8] sm:h-10 sm:max-w-[520px] sm:px-4 sm:text-[12.5px]" aria-label="Ask Glow anything">
        <Search size={15} className="shrink-0 text-[#9F9690]" />
        <span className="min-w-0 flex-1 truncate">Ask Glow anything...</span>
        <span className="hidden text-[10px] font-medium text-[#AAA09A] sm:inline">⌘K</span>
      </button>

      <div className="ml-auto hidden items-center gap-3 border-r border-[#EEE7E3] pr-4 xl:flex">
        <Sun size={16} strokeWidth={1.45} className="text-[#D7A55F]" />
        <div className="min-w-[112px] leading-tight">
          <p className="text-[10px] font-medium text-[#5A534E]">{date.weekday || 'Today'}</p>
          <p className="mt-0.5 text-[9px] text-[#9C928C]">{date.date}</p>
        </div>
      </div>

      <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-1.5">
        <button type="button" onClick={openCreate} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C9657B] text-white shadow-[0_4px_12px_rgba(201,101,123,.14)] transition hover:bg-[#B9586E] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D1D8] focus-visible:ring-offset-2" aria-label="Add anything">
          <Plus size={16} strokeWidth={2} />
        </button>
        <button type="button" onClick={() => router.push('/calendar')} className="hidden h-9 w-9 items-center justify-center rounded-full text-[#817771] transition hover:bg-[#F7EEED] active:scale-[.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D1D8] sm:inline-flex" aria-label="Open calendar">
          <CalendarDays size={16} strokeWidth={1.5} />
        </button>
        <button type="button" onClick={() => router.push('/concierge')} className="hidden h-9 w-9 items-center justify-center rounded-full text-[#817771] transition hover:bg-[#F7EEED] active:scale-[.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D1D8] md:inline-flex" aria-label="Open concierge">
          <MessageCircle size={16} strokeWidth={1.5} />
        </button>
        <button type="button" onClick={() => router.push('/notices')} className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#817771] transition hover:bg-[#F7EEED] active:scale-[.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D1D8]" aria-label="Open notifications">
          <Bell size={16.5} strokeWidth={1.5} />
          <span className="absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#C95E78]" />
        </button>
        <button type="button" onClick={() => router.push('/settings?section=profile')} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FAE6E7] text-[#B85C70] transition hover:bg-[#F7D1D8] active:scale-[.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D1D8]" aria-label="Open profile">
          <UserRound size={14} />
        </button>
      </div>
    </header>
  );
}

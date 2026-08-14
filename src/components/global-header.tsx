'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronDown, Plus, Search, Sun, UserRound } from 'lucide-react';

export function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isTasks = pathname.startsWith('/tasks');
  const createLabel = isTasks ? 'New Task' : 'Create';
  const createModule = isTasks ? 'task' : undefined;

  function openCreate() {
    document.dispatchEvent(new CustomEvent('glow:quick-add', { detail: createModule ? { module: createModule } : {} }));
  }

  return (
    <header className="sticky top-0 z-40 flex h-[56px] w-full max-w-full min-w-0 items-center gap-2 overflow-x-clip border-b border-[#EEE9E6] bg-white/95 px-3 backdrop-blur-xl sm:h-[60px] sm:gap-3 sm:px-6 lg:h-[64px] lg:px-10">
      <button
        type="button"
        onClick={() => router.push('/search')}
        className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-[12px] border border-[#EEE9E6] bg-[#FCFBFA] px-3 text-left text-[12px] text-[#98908B] shadow-[0_1px_2px_rgba(60,40,30,.02)] transition hover:border-[#E5DDD9] sm:h-10 sm:max-w-[380px] sm:rounded-full sm:px-4 sm:text-[13px]"
        aria-label="Search Glow OS"
      >
        <Search size={15} className="shrink-0 text-[#AAA29D]" />
        <span className="min-w-0 truncate">Search Glow OS</span>
      </button>

      <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
        <button type="button" onClick={() => router.push('/settings?section=appearance')} className="hidden h-9 w-9 items-center justify-center rounded-full text-[#8A8078] transition hover:bg-[#FBF8F7] sm:inline-flex" aria-label="Appearance settings">
          <Sun size={16} strokeWidth={1.6} />
        </button>
        <button type="button" onClick={() => router.push('/notices')} className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#8A8078] transition hover:bg-[#FBF8F7]" aria-label="Open notifications">
          <Bell size={17} strokeWidth={1.6} />
        </button>
        <button type="button" onClick={() => router.push('/settings?section=profile')} className="hidden h-8 w-8 items-center justify-center rounded-full bg-[#FBE8EC] text-[#B96070] transition hover:opacity-85 sm:inline-flex" aria-label="Open profile">
          <UserRound size={14} />
        </button>
        <button type="button" onClick={openCreate} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-[12px] bg-[#C96F7F] px-3 text-[12px] font-medium text-white shadow-[0_4px_12px_rgba(201,111,127,.16)] transition hover:bg-[#B95F70] sm:rounded-full sm:px-3.5 sm:text-[12.5px]">
          <Plus size={15} strokeWidth={2} />
          <span className="hidden whitespace-nowrap xs:inline sm:inline">{createLabel}</span>
          <ChevronDown size={12} className="hidden opacity-75 sm:block" />
        </button>
      </div>
    </header>
  );
}

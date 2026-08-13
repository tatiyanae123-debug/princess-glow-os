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
    <header className="sticky top-0 z-40 flex h-[68px] w-full max-w-full min-w-0 items-center gap-2 overflow-x-clip border-b border-[#F1E7E3] bg-[#FDFAF8]/95 px-4 backdrop-blur-xl sm:h-[64px] sm:gap-3 sm:px-7 lg:px-10">
      <button
        type="button"
        onClick={() => router.push('/search')}
        className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#F1E7E3] bg-white px-3.5 text-left text-[13px] text-[#9A9088] shadow-[0_1px_3px_rgba(60,40,30,.03)] transition hover:border-[#E6D9D2] sm:h-10 sm:max-w-[420px] sm:px-4"
        aria-label="Search Glow OS"
      >
        <Search size={16} className="shrink-0 text-[#B5ACA5]" />
        <span className="min-w-0 truncate">Search Glow OS...</span>
      </button>

      <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => router.push('/settings?section=appearance')}
          className="hidden h-10 w-10 items-center justify-center rounded-full text-[#8A8078] transition hover:bg-white sm:inline-flex"
          aria-label="Appearance settings"
        >
          <Sun size={17} strokeWidth={1.6} />
        </button>
        <button
          type="button"
          onClick={() => router.push('/notices')}
          className="relative inline-flex h-10 w-9 shrink-0 items-center justify-center rounded-full text-[#8A8078] transition hover:bg-white sm:w-10"
          aria-label="Open notifications"
        >
          <Bell size={18} strokeWidth={1.6} />
        </button>
        <button
          type="button"
          onClick={() => router.push('/settings?section=profile')}
          className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#F1E0D9] text-[#8A5A56] transition hover:opacity-85 sm:inline-flex"
          aria-label="Open profile"
        >
          <UserRound size={15} />
        </button>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full bg-[#C9727E] px-3.5 text-[13px] font-medium text-white shadow-[0_6px_16px_rgba(201,114,126,.24)] transition hover:bg-[#BD6672] sm:h-10 sm:gap-1.5 sm:pl-4 sm:pr-3"
        >
          <Plus size={16} strokeWidth={2} />
          <span className="whitespace-nowrap">{createLabel}</span>
          <ChevronDown size={13} className="opacity-80" />
        </button>
      </div>
    </header>
  );
}

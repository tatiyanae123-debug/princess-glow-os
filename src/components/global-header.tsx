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
    <header className="glow-global-header sticky top-0 z-40 flex h-[64px] items-center justify-between gap-3 border-b border-[#F1E7E3] bg-[#FDFAF8]/95 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
      <button
        type="button"
        onClick={() => document.dispatchEvent(new Event('glow:voice-open'))}
        className="flex h-10 min-w-[200px] flex-1 max-w-[420px] items-center gap-2 rounded-full border border-[#F1E7E3] bg-white px-4 text-left text-[13px] text-[#9A9088] shadow-[0_1px_3px_rgba(60,40,30,.03)] transition hover:border-[#E6D9D2]"
        aria-label="Search Glow OS"
      >
        <Search size={15} className="shrink-0 text-[#B5ACA5]" />
        <span className="truncate">Search Glow OS...</span>
      </button>

      <div className="flex shrink-0 items-center gap-2">
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
          onClick={() => router.push('/inbox')}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#8A8078] transition hover:bg-white"
          aria-label="Open notifications"
        >
          <Bell size={17} strokeWidth={1.6} />
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
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#C9727E] pl-4 pr-3 text-[13px] font-medium text-white shadow-[0_6px_16px_rgba(201,114,126,.28)] transition hover:bg-[#BD6672]"
        >
          <Plus size={15} strokeWidth={2} />
          {createLabel}
          <ChevronDown size={13} className="opacity-80" />
        </button>
      </div>
    </header>
  );
}

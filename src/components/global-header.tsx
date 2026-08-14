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

  function openSearch() {
    document.dispatchEvent(new CustomEvent('glow:search-open'));
  }

  return (
    <header className="sticky top-0 z-40 flex h-[58px] w-full max-w-full min-w-0 items-center gap-2 overflow-x-clip border-b border-[#F0E7E5] bg-white/96 px-3 backdrop-blur-xl sm:h-[62px] sm:gap-3 sm:px-6 lg:h-[64px] lg:px-8">
      <button
        type="button"
        onClick={openSearch}
        className="mx-auto flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#EEE6E3] bg-white px-3.5 text-left text-[12px] text-[#948B86] shadow-[0_1px_4px_rgba(67,47,38,.025)] transition hover:border-[#E4D7D4] hover:shadow-[0_7px_22px_rgba(67,47,38,.045)] active:scale-[.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D1D8] sm:h-10 sm:max-w-[430px] sm:px-4 sm:text-[12.5px]"
        aria-label="Ask Glow anything"
      >
        <Search size={15} className="shrink-0 text-[#9F9690]" />
        <span className="min-w-0 flex-1 truncate">Ask Glow anything...</span>
        <span className="hidden text-[10px] font-medium text-[#AAA09A] sm:inline">⌘K</span>
      </button>

      <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1 sm:gap-1.5">
        <button type="button" onClick={() => router.push('/settings?section=appearance')} className="hidden h-9 w-9 items-center justify-center rounded-full text-[#817771] transition hover:bg-[#F7EEED] active:scale-[.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D1D8] sm:inline-flex" aria-label="Appearance settings">
          <Sun size={16} strokeWidth={1.5} />
        </button>
        <button type="button" onClick={() => router.push('/notices')} className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#817771] transition hover:bg-[#F7EEED] active:scale-[.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D1D8]" aria-label="Open notifications">
          <Bell size={16.5} strokeWidth={1.5} />
          <span className="absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#C95E78]" />
        </button>
        <button type="button" onClick={() => router.push('/settings?section=profile')} className="hidden h-8 w-8 items-center justify-center rounded-full bg-[#FAE6E7] text-[#B85C70] transition hover:bg-[#F7D1D8] active:scale-[.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D1D8] sm:inline-flex" aria-label="Open profile">
          <UserRound size={14} />
        </button>
        <button type="button" onClick={openCreate} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-[#C9657B] px-3 text-[12px] font-medium text-white shadow-[0_4px_12px_rgba(201,101,123,.14)] transition hover:bg-[#B9586E] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D1D8] focus-visible:ring-offset-2 sm:px-3.5 sm:text-[12.5px]">
          <Plus size={15} strokeWidth={2} />
          <span className="hidden whitespace-nowrap xs:inline sm:inline">{createLabel}</span>
          <ChevronDown size={12} className="hidden opacity-75 sm:block" />
        </button>
      </div>
    </header>
  );
}

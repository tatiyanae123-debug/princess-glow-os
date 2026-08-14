'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, Search, Sparkles, X } from 'lucide-react';

const RECENT_KEY = 'glow-os:recent-searches:v1';
const SUGGESTIONS = [
  'What am I forgetting this week?',
  'Show everything related to Terrain Design',
  'Find my notes about Terrain Design',
  'Show my highest priority tasks',
  'What is coming up on my calendar?',
];

function readRecent() {
  if (typeof window === 'undefined') return [] as string[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string').slice(0, 6) : [];
  } catch {
    return [] as string[];
  }
}

function writeRecent(query: string) {
  const next = [query, ...readRecent().filter((item) => item.toLowerCase() !== query.toLowerCase())].slice(0, 6);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

export function GlobalCommandSurface() {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  const origin = useMemo(() => pathname, [pathname]);

  useEffect(() => {
    setRecent(readRecent());
    const openSearch = () => setOpen(true);
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    const captureDashboardSearch = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest('button');
      if (!button) return;
      const text = button.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() ?? '';
      if (!text.includes('ask glow anything')) return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(true);
    };
    document.addEventListener('glow:search-open', openSearch);
    document.addEventListener('click', captureDashboardSearch, true);
    window.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('glow:search-open', openSearch);
      document.removeEventListener('click', captureDashboardSearch, true);
      window.removeEventListener('keydown', keydown);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function runSearch(raw: string) {
    const next = raw.trim();
    if (!next) return;
    setRecent(writeRecent(next));
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(next)}&from=${encodeURIComponent(origin)}`);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    runSearch(query);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[180] flex items-start justify-center bg-[#2d2521]/18 px-3 pt-[8vh] backdrop-blur-[6px] sm:px-6 sm:pt-[11vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Glow universal command search"
      onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}
    >
      <div className="w-full max-w-[760px] overflow-hidden rounded-[28px] border border-white/90 bg-white/96 shadow-[0_32px_90px_rgba(68,43,35,.18)] ring-1 ring-[#eadfdb]/70">
        <div className="flex items-center justify-between border-b border-[#f0e7e4] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-[#bd5d73]">
            <Sparkles size={15} />
            <span className="text-[10px] font-semibold uppercase tracking-[.15em]">Ask Your Life</span>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#776e69] transition hover:bg-[#f7eeed] active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D1D8]" aria-label="Close search">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 sm:p-6">
          <div className="flex min-h-[58px] items-center gap-3 rounded-[18px] border border-[#eadfdb] bg-white px-4 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_28px_rgba(74,48,40,.05)] focus-within:border-[#dfb7c0] focus-within:ring-4 focus-within:ring-[#fae6e7]/65">
            <Search size={18} className="shrink-0 text-[#ad9f98]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Glow or ask a natural-language question…"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-[#282320] outline-none placeholder:text-[#a89e98]"
            />
            <button type="submit" disabled={!query.trim()} className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#c45f76] px-3.5 text-[11px] font-medium text-white shadow-[0_5px_16px_rgba(196,95,118,.2)] transition hover:bg-[#b6536b] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40">
              Search <ArrowRight size={12} />
            </button>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <section>
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[.14em] text-[#998f89]">Suggested</p>
              <div className="space-y-1.5">
                {SUGGESTIONS.map((item) => (
                  <button key={item} type="button" onClick={() => runSearch(item)} className="flex min-h-10 w-full items-center justify-between rounded-[12px] px-3 text-left text-[11.5px] text-[#4b4541] transition hover:bg-[#fdf8f7] active:scale-[.995]">
                    <span>{item}</span><ArrowRight size={12} className="text-[#b9aea8]" />
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[.14em] text-[#998f89]">Recent</p>
              {recent.length ? (
                <div className="space-y-1.5">
                  {recent.map((item) => (
                    <button key={item} type="button" onClick={() => runSearch(item)} className="flex min-h-10 w-full items-center gap-2 rounded-[12px] px-3 text-left text-[11.5px] text-[#4b4541] transition hover:bg-[#fdf8f7] active:scale-[.995]">
                      <Search size={12} className="text-[#b9aea8]" /><span className="truncate">{item}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-[14px] border border-dashed border-[#eadfdb] bg-[#fffdfc] p-4 text-[11px] leading-5 text-[#9b918b]">Your recent searches will appear here.</div>
              )}
              <button type="button" onClick={() => { setOpen(false); router.push('/calendar'); }} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#eadfdb] bg-white px-3.5 text-[11px] font-medium text-[#6e655f] transition hover:bg-[#fdf8f7] active:scale-[.98]">
                <CalendarDays size={13} /> Open Calendar
              </button>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}

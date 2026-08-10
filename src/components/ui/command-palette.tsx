'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command, Search, X } from 'lucide-react';
import { navItems } from '@/lib/navigation';

const smartCommands = [
  { label: 'What should I do right now?', href: '/today', keywords: 'now next priority focus time energy' },
  { label: 'Make today lighter', href: '/today', keywords: 'low energy tired lighter sick mode' },
  { label: 'Prepare tomorrow', href: '/today', keywords: 'tomorrow plan prepare next day' },
  { label: 'Finish my day', href: '/today', keywords: 'night evening review finish today' },
  { label: 'Can I afford this?', href: '/finance/brain', keywords: 'money afford buy purchase finance spend' },
  { label: 'What beauty maintenance is due?', href: '/beauty/lab', keywords: 'beauty skincare expiration product maintenance' },
  { label: 'What is my next project action?', href: '/projects', keywords: 'project next action terrain design progress' },
  { label: 'Capture something', href: '/inbox', keywords: 'inbox note task brain dump idea capture' },
  { label: 'Teach Glow a rule', href: '/rules', keywords: 'rule preference never always schedule' },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    const routes = navItems.map((item) => ({ label: item.label, href: item.href, keywords: `${item.label} ${item.description}`.toLowerCase() }));
    const all = [...smartCommands, ...routes];
    if (!value) return all.slice(0, 10);
    return all.filter((item) => `${item.label} ${item.keywords}`.toLowerCase().includes(value)).slice(0, 10);
  }, [query]);

  const choose = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="hidden min-w-[220px] items-center gap-2 rounded-full border px-3 py-2 text-left text-sm transition sm:flex" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)', color: 'var(--glow-text-muted)' }}>
        <Search size={14} /><span className="flex-1">Search or ask Glow</span><Command size={12} />
      </button>
      <button type="button" aria-label="Search Glow OS" onClick={() => setOpen(true)} className="rounded-full border p-2.5 sm:hidden" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)', color: 'var(--glow-text-muted)' }}><Search size={15} /></button>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-stone-950/35 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
          <div className="w-full max-w-2xl overflow-hidden rounded-[26px] border border-white/70 bg-white shadow-[0_30px_100px_rgba(50,35,25,.28)]" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-stone-200 px-4 py-3"><Search size={17} className="text-rose-600"/><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Hair, Terrain, tomorrow, can I afford this..." className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"/><button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-stone-400 hover:bg-stone-100"><X size={15}/></button></div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length ? results.map((item) => <button key={`${item.href}-${item.label}`} type="button" onClick={() => choose(item.href)} className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-rose-50"><div><p className="text-sm font-medium text-stone-900">{item.label}</p><p className="mt-0.5 text-[10px] text-stone-400">{item.href}</p></div><span className="text-xs text-stone-300">↵</span></button>) : <p className="p-6 text-center text-xs text-stone-500">No direct match. Try a system, project, or action phrase.</p>}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

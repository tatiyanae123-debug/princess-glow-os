'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Crown, Menu, X } from 'lucide-react';
import { navItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useGlow } from '@/lib/context/glow-provider';
import { THEMES } from '@/lib/themes';
import { useState } from 'react';

const preferredOrder = [
  '/dashboard', '/today', '/brain', '/planning', '/world', '/inbox',
  '/tasks', '/calendar', '/habits', '/projects', '/beauty', '/fitness', '/finance',
  '/observations', '/rules', '/connections', '/notes', '/settings',
];

export function Sidebar() {
  const pathname = usePathname();
  const { themeId, setTheme, isCustomizing } = useGlow();
  const [mobileOpen, setMobileOpen] = useState(false);

  const ordered = [...navItems].sort((a, b) => {
    const ai = preferredOrder.indexOf(a.href);
    const bi = preferredOrder.indexOf(b.href);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const primaryHrefs = new Set(['/dashboard','/today','/brain','/planning','/world','/inbox']);

  return (
    <aside
      className="flex h-full w-full flex-col border-b p-4 sm:p-5 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-4 lg:py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(239,220,207,.98), rgba(246,234,225,.94))',
        borderColor: 'rgba(120,91,72,.12)',
      }}
    >
      <div className="flex items-center justify-between gap-3 lg:block">
        <div>
          <h2 className="text-3xl leading-none tracking-[-0.04em] text-stone-900" style={{ fontFamily: 'var(--glow-font-display)' }}>GLOW OS</h2>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-stone-600">Princess Command Center</p>
        </div>
        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="rounded-xl border border-stone-300/60 bg-white/40 p-2 text-stone-700 lg:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={cn('mt-5 min-h-0 flex-1 lg:flex lg:flex-col', mobileOpen ? 'block' : 'hidden lg:flex')}>
        <div className="mb-5 rounded-[28px] border border-white/50 bg-white/35 p-4 text-center shadow-[0_14px_35px_rgba(117,85,62,.08)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-stone-200 to-rose-100 text-2xl font-semibold text-stone-700 shadow-inner">TC</div>
          <p className="mt-3 text-lg text-stone-900" style={{ fontFamily: 'var(--glow-font-display)' }}>Tatiyana Curran</p>
          <p className="text-[10px] tracking-wide text-stone-600">Modern American Princess</p>
          <Crown className="mx-auto mt-2 text-amber-700/70" size={18} />
        </div>

        <nav aria-label="Glow OS navigation" className="min-h-0 space-y-1 overflow-y-auto pr-1">
          <p className="px-3 pb-1 text-[9px] font-bold uppercase tracking-[.2em] text-stone-500">Primary</p>
          {ordered.filter((item) => primaryHrefs.has(item.href)).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={cn('group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-all duration-200', active ? 'bg-rose-100/75 font-medium text-rose-900 shadow-[inset_0_0_0_1px_rgba(188,108,126,.08)]' : 'text-stone-700 hover:bg-white/35 hover:text-stone-950')}><Icon size={15} className="shrink-0" /><span className="truncate">{item.label}</span></Link>;
          })}
          <details className="pt-2" open={pathname !== '/dashboard' && pathname !== '/today' && pathname !== '/brain' && pathname !== '/planning' && pathname !== '/world' && pathname !== '/inbox'}>
            <summary className="cursor-pointer list-none px-3 py-2 text-[9px] font-bold uppercase tracking-[.2em] text-stone-500">All Systems</summary>
            <div className="space-y-1">
              {ordered.filter((item) => !primaryHrefs.has(item.href)).map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={cn('group flex min-h-9 items-center gap-3 rounded-xl px-3 py-2 text-[12px] transition-all duration-200', active ? 'bg-rose-100/75 font-medium text-rose-900' : 'text-stone-600 hover:bg-white/35 hover:text-stone-950')}><Icon size={14} className="shrink-0" /><span className="truncate">{item.label}</span></Link>;
              })}
            </div>
          </details>
        </nav>

        <div className="mt-5 rounded-2xl border border-white/50 bg-white/30 p-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-stone-500">Daily affirmation</p>
          <p className="mt-2 text-sm leading-5 text-stone-800" style={{ fontFamily: 'var(--glow-font-display)' }}>I&apos;m building the life I used to dream about.</p>
        </div>

        <div className="mt-3"><div className="grid grid-cols-4 gap-1.5">{THEMES.slice(0, 4).map((t) => <button key={t.id} type="button" title={t.name} onClick={() => setTheme(t.id)} disabled={isCustomizing} className={cn('h-5 rounded-full border border-white/60 transition', themeId === t.id ? 'ring-1 ring-stone-600' : 'opacity-65 hover:opacity-100')} style={{ background: t.tokens.accent }} aria-label={`Switch to ${t.name} theme`} />)}</div></div>
      </div>
    </aside>
  );
}

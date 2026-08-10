'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { getSystemRoom, getSystemRoomByKey } from '@/lib/intelligence/system-registry';

const accentClasses: Record<string, string> = {
  rose: 'from-rose-50/90 via-white/65 to-amber-50/50 text-rose-800',
  amber: 'from-amber-50/90 via-white/65 to-orange-50/45 text-amber-800',
  emerald: 'from-emerald-50/85 via-white/65 to-stone-50/55 text-emerald-800',
  sky: 'from-sky-50/85 via-white/65 to-indigo-50/45 text-sky-800',
  violet: 'from-violet-50/90 via-white/65 to-rose-50/45 text-violet-800',
  blue: 'from-blue-50/85 via-white/65 to-cyan-50/45 text-blue-800',
  slate: 'from-slate-100/80 via-white/65 to-stone-50/50 text-slate-800',
  stone: 'from-stone-100/85 via-white/65 to-amber-50/35 text-stone-800',
};

export function SystemRoomContext() {
  const pathname = usePathname();
  const room = getSystemRoom(pathname);
  if (!room || room.key === 'dashboard' || room.key === 'today') return null;
  const connected = room.connected.map(getSystemRoomByKey).filter(Boolean).slice(0, 5);
  return (
    <section className={`mb-4 overflow-hidden rounded-[22px] border border-white/70 bg-gradient-to-r ${accentClasses[room.accent] ?? accentClasses.stone} shadow-[0_12px_38px_rgba(110,83,63,.05)]`}>
      <div className="flex flex-col gap-4 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><Sparkles size={13} /><p className="text-[9px] font-bold uppercase tracking-[.2em]">{room.atmosphere}</p></div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1"><h2 className="text-xl text-stone-950" style={{ fontFamily: 'var(--glow-font-display)' }}>{room.label}</h2><p className="max-w-3xl text-[11px] leading-5 text-stone-600">{room.purpose}</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[8px] font-bold uppercase tracking-[.16em] text-stone-400">Connected to</span>
          {connected.map((item) => item ? <Link key={item.key} href={item.path} className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/55 px-2.5 py-1.5 text-[9px] font-medium text-stone-700 transition hover:bg-white">{item.label}<ArrowUpRight size={9} /></Link> : null)}
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto border-t border-white/70 px-5 py-2.5">{room.capabilities.map((capability) => <span key={capability} className="min-w-max rounded-full bg-white/45 px-2.5 py-1 text-[8px] font-medium text-stone-500">{capability}</span>)}</div>
    </section>
  );
}

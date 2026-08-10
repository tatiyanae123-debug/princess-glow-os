'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Network, Sparkles } from 'lucide-react';
import { getSystemRoom } from '@/lib/intelligence/system-registry';
import { ROOM_ACTIONS } from '@/lib/intelligence/room-actions';

export function SystemExpansionDock(){const pathname=usePathname();const room=getSystemRoom(pathname);if(!room||['dashboard','today'].includes(room.key))return null;const actions=ROOM_ACTIONS[room.key]??[];if(!actions.length)return null;return <section className="mt-6 overflow-hidden rounded-[24px] border border-stone-200/70 bg-white/55 shadow-[0_18px_55px_rgba(106,82,62,.05)] backdrop-blur-md"><div className="flex flex-col gap-2 border-b border-stone-200/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-stone-700"><Network size={14}/><p className="text-[9px] font-bold uppercase tracking-[.18em]">How {room.label} works with the rest of Glow</p></div><div className="flex items-center gap-1 text-[8px] uppercase tracking-[.14em] text-stone-400"><Sparkles size={10}/>one system, shared intelligence</div></div><div className="grid gap-px bg-stone-200/60 sm:grid-cols-2 xl:grid-cols-4">{actions.map(action=><Link key={action.label} href={action.href} className="group bg-white/80 p-4 transition hover:bg-rose-50/70"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-stone-900">{action.label}</p><ArrowRight size={11} className="text-stone-300 transition group-hover:translate-x-1 group-hover:text-rose-500"/></div><p className="mt-2 text-[9px] leading-4 text-stone-500">{action.note}</p></Link>)}</div></section>}

'use client';

import Link from 'next/link';
import {usePathname,useSearchParams} from 'next/navigation';
import {Focus,MoonStar,Sparkles} from 'lucide-react';
import {getWorldArchitecture} from '@/lib/world-architecture';

export function ArchitecturalWorldFrameV2({children}:{children:React.ReactNode}){
 const pathname=usePathname();
 const params=useSearchParams();
 const room=getWorldArchitecture(pathname);
 const ambient=params.get('ambient')==='1';
 const focusHref=`${pathname}?focus=1`;
 const ambientHref=ambient?pathname:`${pathname}?ambient=1`;
 if(ambient)return <div className="relative min-h-[72vh] overflow-hidden rounded-[28px] border border-[#EFE5E0] bg-[radial-gradient(circle_at_70%_20%,#F8E9EC_0%,transparent_34%),linear-gradient(145deg,#FFFCFA,#F8F3F0)] p-6 sm:p-10"><div className="mx-auto flex min-h-[60vh] max-w-[760px] flex-col items-center justify-center text-center"><p className="text-[9px] font-semibold uppercase tracking-[.18em] text-[#A96C72]">Ambient</p><h1 className="glow-display mt-3 text-[44px] leading-none text-[#2B2420] sm:text-[60px]">{room.title}</h1><p className="mt-5 max-w-[520px] text-[12px] leading-5 text-[#887D76]">{room.insight}</p><div className="mt-8 flex flex-wrap justify-center gap-2"><Link href={pathname} className="rounded-full bg-[#2B2420] px-4 py-2.5 text-[11px] text-white">Return to page</Link><Link href="/today" className="rounded-full border border-[#E7DDD8] bg-white px-4 py-2.5 text-[11px]">Today</Link><Link href="/calendar" className="rounded-full border border-[#E7DDD8] bg-white px-4 py-2.5 text-[11px]">Calendar</Link></div></div></div>;
 return <div className="relative" data-world={room.world}><div aria-hidden="true" className="pointer-events-none absolute -inset-x-6 -top-8 h-48 overflow-hidden opacity-60"><div className="absolute right-[8%] top-0 h-32 w-48 rounded-full bg-[#F7E9EC] blur-3xl"/><div className="absolute left-[10%] top-10 h-28 w-40 rounded-full bg-[#F4EFE8] blur-3xl"/></div><div className="relative mb-4 flex min-h-9 flex-wrap items-center justify-between gap-2 border-b border-[#F1E7E3] pb-3"><div className="flex min-w-0 items-center gap-2"><Sparkles size={12} className="text-[#C9727E]"/><p className="truncate text-[9px] font-semibold uppercase tracking-[.16em] text-[#9A9088]">{room.eyebrow}</p></div><div className="flex items-center gap-1.5"><Link href={focusHref} className="inline-flex items-center gap-1.5 rounded-full border border-[#EEE3DE] bg-white/80 px-3 py-1.5 text-[9.5px] text-[#756B65] transition hover:bg-white"><Focus size={11}/>Focus</Link><Link href={ambientHref} className="inline-flex items-center gap-1.5 rounded-full border border-[#EEE3DE] bg-white/80 px-3 py-1.5 text-[9.5px] text-[#756B65] transition hover:bg-white"><MoonStar size={11}/>Ambient</Link></div></div><div className="relative">{children}</div></div>
}

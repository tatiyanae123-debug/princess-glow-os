'use client';

import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Focus, Plus, Search, Sparkles } from 'lucide-react';
import { blueprintForPath } from '@/lib/glow-page-blueprints';

function dispatch(name:string){ document.dispatchEvent(new Event(name)); }

export function PageIntelligenceLayer(){
  const pathname=usePathname();
  const router=useRouter();
  const page=blueprintForPath(pathname);
  if(!page || pathname.startsWith('/dashboard')) return null;

  return <section aria-label={`${page.title} intelligence overview`} className="relative mb-6 overflow-hidden rounded-[28px] border border-[#ddd8ce] bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,.98),transparent_42%),linear-gradient(145deg,rgba(252,251,247,.98),rgba(244,242,236,.96))] shadow-[0_18px_64px_rgba(61,55,48,.07)]" data-glow-material="living-pearl">
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-[9%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(189,177,157,.7),transparent)]"/>
    <div className="grid gap-5 px-5 py-5 sm:px-6 md:grid-cols-[1.05fr_1.95fr] md:items-center md:px-7">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[#8b7e6d]"><Sparkles size={12}/><span className="text-[9px] font-semibold uppercase tracking-[.19em]">Glow Intelligence</span></div>
        <h2 className="mt-2 font-serif text-[23px] leading-tight text-[#35312d] sm:text-[27px]">{page.question}</h2>
        <p className="mt-2 max-w-[540px] text-[11px] leading-5 text-[#756e66] sm:text-[12px]">{page.purpose}</p>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-3">
        <QuietCell label="Right now" text={page.rightNow} emphasis/>
        <QuietCell label="Overview" text={page.overview}/>
        <QuietCell label="Explore" text={page.explore}/>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2 border-t border-[#e6e1d8] bg-white/52 px-5 py-3 sm:px-6 md:px-7">
      <button type="button" onClick={()=>router.push(`/intake?from=${encodeURIComponent(pathname)}`)} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#49443f] px-3.5 text-[10.5px] font-medium text-white shadow-[0_7px_22px_rgba(60,55,49,.12)]"><Plus size={13}/>Add to Glow</button>
      <button type="button" onClick={()=>dispatch('glow:search-open')} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#ddd7ce] bg-white/82 px-3.5 text-[10.5px] font-medium text-[#625b53]"><Search size={13}/>Search this life</button>
      <button type="button" onClick={()=>router.push('/create/source-library')} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#ddd7ce] bg-white/72 px-3.5 text-[10.5px] font-medium text-[#625b53]"><BookOpen size={13}/>Sources</button>
      <button type="button" onClick={()=>router.push(`${pathname}${pathname.includes('?')?'&':'?'}focus=1`)} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#ddd7ce] bg-white/72 px-3.5 text-[10.5px] font-medium text-[#625b53]"><Focus size={13}/>Focus mode</button>
      <span className="ml-auto hidden text-[9px] tracking-[.02em] text-[#9b9389] md:block">Information condenses into structure. Nothing is silently adopted.</span>
    </div>
  </section>;
}

function QuietCell({label,text,emphasis=false}:{label:string;text:string;emphasis?:boolean}){
 return <div className={`rounded-[18px] border px-3.5 py-3.5 ${emphasis?'border-[#d8d0c3] bg-white/82 shadow-[0_10px_30px_rgba(67,58,49,.04)]':'border-[#e2ddd4] bg-white/58'}`}>
   <span className={`text-[8.5px] font-semibold uppercase tracking-[.15em] ${emphasis?'text-[#82725f]':'text-[#918980]'}`}>{label}</span>
   <p className="mt-1.5 text-[11px] leading-[1.5] text-[#4f4943]">{text}</p>
 </div>
}

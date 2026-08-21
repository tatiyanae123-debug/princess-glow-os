'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Focus, Plus, Search, Sparkles } from 'lucide-react';
import { blueprintForPath } from '@/lib/glow-page-blueprints';

function dispatch(name:string){ document.dispatchEvent(new Event(name)); }

export function PageIntelligenceLayer(){
  const pathname=usePathname();
  const router=useRouter();
  const page=blueprintForPath(pathname);
  if(!page || pathname.startsWith('/dashboard')) return null;

  return <section aria-label={`${page.title} intelligence overview`} className="mb-5 overflow-hidden rounded-[26px] border border-[#eee4e1] bg-[linear-gradient(135deg,rgba(255,255,255,.98),rgba(252,246,245,.94))] shadow-[0_12px_42px_rgba(84,57,49,.055)]">
    <div className="grid gap-4 px-4 py-4 sm:px-5 md:grid-cols-[1.05fr_1.95fr] md:items-center md:px-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[#bd5d73]"><Sparkles size={13}/><span className="text-[9px] font-semibold uppercase tracking-[.16em]">Glow Intelligence</span></div>
        <h2 className="mt-1.5 font-serif text-[22px] leading-tight text-[#292320] sm:text-[25px]">{page.question}</h2>
        <p className="mt-1 max-w-[520px] text-[11px] leading-5 text-[#837873] sm:text-[12px]">{page.purpose}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-[17px] border border-[#f0e6e3] bg-white/88 px-3.5 py-3"><span className="text-[8.5px] font-semibold uppercase tracking-[.14em] text-[#b35c70]">Right now</span><p className="mt-1 text-[11px] leading-[1.45] text-[#4d4541]">{page.rightNow}</p></div>
        <div className="rounded-[17px] border border-[#f0e6e3] bg-white/72 px-3.5 py-3"><span className="text-[8.5px] font-semibold uppercase tracking-[.14em] text-[#8c817b]">Overview</span><p className="mt-1 text-[11px] leading-[1.45] text-[#4d4541]">{page.overview}</p></div>
        <div className="rounded-[17px] border border-[#f0e6e3] bg-white/58 px-3.5 py-3"><span className="text-[8.5px] font-semibold uppercase tracking-[.14em] text-[#8c817b]">Explore</span><p className="mt-1 text-[11px] leading-[1.45] text-[#4d4541]">{page.explore}</p></div>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2 border-t border-[#f1e8e5] bg-white/62 px-4 py-2.5 sm:px-5 md:px-6">
      <button type="button" onClick={()=>router.push(`/intake?from=${encodeURIComponent(pathname)}`)} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#c35f76] px-3.5 text-[10.5px] font-medium text-white shadow-[0_6px_18px_rgba(195,95,118,.18)]"><Plus size={13}/>Add to Glow</button>
      <button type="button" onClick={()=>dispatch('glow:search-open')} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#eadfdb] bg-white px-3.5 text-[10.5px] font-medium text-[#5d5550]"><Search size={13}/>Search this life</button>
      <button type="button" onClick={()=>router.push(`${pathname}${pathname.includes('?')?'&':'?'}focus=1`)} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#eadfdb] bg-white px-3.5 text-[10.5px] font-medium text-[#5d5550]"><Focus size={13}/>Focus mode</button>
      <span className="ml-auto hidden text-[9px] text-[#aaa09a] md:block">Add once → Glow routes it where it belongs</span>
    </div>
  </section>;
}

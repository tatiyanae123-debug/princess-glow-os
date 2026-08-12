'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Mic2, Plus, Search, UserRound } from 'lucide-react';

const PAGE_NAMES: Array<[string,string]> = [
  ['/beauty/lab','Beauty Lab'],['/finance/brain','Financial Brain'],['/dashboard','Today'],['/today','Today'],['/tasks','Tasks'],['/calendar','Calendar'],['/planning','Planning'],['/routines','Routines'],['/habits','Habits'],['/reminders','Reminders'],['/fitness','Fitness'],['/wellness','Wellness'],['/food','Food & Nutrition'],['/beauty','Beauty'],['/hair','Hair'],['/finance','Finance'],['/goals','Goals'],['/projects','Projects'],['/brain','Glow'],['/concierge','Glow'],['/briefings','Glow'],['/observations','Glow'],['/memory','Glow'],['/timeline','Glow'],['/inbox','Glow'],['/intake','Glow'],['/rules','Glow'],['/notes','Notes'],['/closet','Closet'],['/gmail','Gmail'],['/resources','Resources'],['/connections','Connections'],['/import','Import'],['/settings','Settings'],['/home','Home'],['/world','Life World']
];

function pageName(pathname:string){
  return PAGE_NAMES.find(([path])=>pathname===path||pathname.startsWith(`${path}/`))?.[1]??'Glow OS';
}

export function GlobalHeader(){
  const pathname=usePathname();
  const router=useRouter();
  const name=pageName(pathname);
  return <header className="glow-global-header sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#ECECEC] bg-white/94 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-[.16em] text-[#9A9A9F]">Glow OS</p>
      <p className="truncate text-[14px] font-semibold text-[#1C1C1E]">{name}</p>
    </div>
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={()=>document.dispatchEvent(new Event('glow:voice-open'))} className="glow-header-action" aria-label="Search Glow"><Search size={17}/></button>
      <button type="button" onClick={()=>document.dispatchEvent(new Event('glow:voice-open'))} className="glow-header-action" aria-label="Speak to Glow"><Mic2 size={17}/></button>
      <button type="button" onClick={()=>document.dispatchEvent(new CustomEvent('glow:quick-add'))} className="glow-header-action" aria-label="Create new"><Plus size={18}/></button>
      <button type="button" onClick={()=>router.push('/settings?section=profile')} className="glow-header-action" aria-label="Open profile"><UserRound size={17}/></button>
    </div>
  </header>;
}

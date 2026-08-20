'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, BrainCircuit, BriefcaseBusiness, CalendarDays, CheckSquare2, CircleDollarSign, FolderKanban, Home, NotebookTabs, Palette, Search, Settings, Sparkles, Target, UserRoundSearch, WandSparkles } from 'lucide-react';

const groups = [
  { label: '', items: [
    ['Home','/dashboard',Home],['Dashboard','/today',Sparkles],['Calendar','/calendar',CalendarDays],['Tasks','/tasks',CheckSquare2],
  ]},
  { label: 'WORK + CREATE', items: [
    ['Projects','/projects',FolderKanban],['Creative Studio','/creative-studio',Palette],['Career & Work','/work',BriefcaseBusiness],['Applications','/work/applications',NotebookTabs],['Interviews','/work/interviews',UserRoundSearch],['Terrain Design','/projects/terrain-design',WandSparkles],
  ]},
  { label: 'MIND', items: [['Brain','/brain',BrainCircuit],['Goals','/goals',Target]] },
  { label: 'MONEY', items: [['Finance','/finance/overview',CircleDollarSign]] },
  { label: 'MORE', items: [['Notes','/notes',NotebookTabs],['Settings','/settings',Settings]] },
] as const;

function active(pathname:string, href:string){
  if(href==='/projects') return pathname==='/projects' || pathname.startsWith('/projects/deep-dive');
  if(href==='/work') return pathname==='/work';
  return pathname===href || pathname.startsWith(`${href}/`);
}

export function Batch6Sidebar(){
  const pathname=usePathname();
  return <aside className="flex h-full min-h-screen w-[202px] flex-col border-r border-[#ece6e1] bg-[#fffdfb] px-[13px] pb-[15px] pt-[16px] text-[#2b2623]">
    <Link href="/dashboard" className="flex h-[38px] shrink-0 items-center gap-[9px] px-[6px] text-[#2a2522]"><Sparkles size={14} strokeWidth={1.35} className="text-[#8d5260]"/><span className="font-serif text-[12px] font-semibold tracking-[.08em]">GLOW OS</span></Link>
    <nav className="mt-[9px] min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]">{groups.map((group)=><div className="mb-[11px]" key={group.label||'main'}>{group.label?<p className="mb-[4px] px-[7px] text-[7px] font-semibold tracking-[.13em] text-[#8b837d]">{group.label}</p>:null}<div className="space-y-[2px]">{group.items.map(([label,href,Icon])=>{const on=active(pathname,href);return <Link href={href} key={href} className={`flex min-h-[29px] items-center gap-[8px] rounded-[7px] px-[8px] text-[9px] transition ${on?'bg-[#f3e3e3] font-medium text-[#754552]':'text-[#49413c] hover:bg-[#f8f3ef]'}`}><Icon size={12} strokeWidth={1.4} className={on?'text-[#85505d]':'text-[#605852]'}/><span className="truncate">{label}</span></Link>})}</div></div>)}</nav>
    <div className="shrink-0 border-t border-[#eee8e3] pt-[9px]"><Link href="/settings?section=profile" className="flex items-center gap-[8px] rounded-[9px] px-[5px] py-[7px] hover:bg-[#f8f3ef]"><span className="flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[linear-gradient(145deg,#ead2cf,#f7e8e5)] font-serif text-[11px] text-[#70434d]">T</span><span className="min-w-0"><strong className="block text-[8.5px] font-medium">Tatiyana</strong><small className="mt-[1px] block text-[6.8px] text-[#8d5260]">View Profile</small></span></Link><div className="mt-[7px] flex items-center justify-between border-t border-[#eee8e3] px-[5px] pt-[7px]"><button type="button" onClick={()=>document.dispatchEvent(new CustomEvent('glow:search-open'))} aria-label="Search" className="grid h-7 w-7 place-items-center rounded-full hover:bg-[#f8f3ef]"><Search size={13}/></button><Link href="/notices" aria-label="Notifications" className="grid h-7 w-7 place-items-center rounded-full hover:bg-[#f8f3ef]"><Bell size={13}/></Link><Link href="/settings" aria-label="Settings" className="grid h-7 w-7 place-items-center rounded-full hover:bg-[#f8f3ef]"><Settings size={13}/></Link></div></div>
  </aside>;
}

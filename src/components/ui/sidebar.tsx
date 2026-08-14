'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit, BriefcaseBusiness, ChevronDown, CircleEllipsis, CircleDot, HeartPulse, Home as HomeIcon,
  Menu, Sparkles, WalletCards, WandSparkles, X, type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

type World = { label:string; href:string; icon:LucideIcon; paths:string[] };

const WORLDS: World[] = [
  {label:'Today',href:'/today',icon:CircleDot,paths:['/dashboard','/today','/briefings','/tomorrow']},
  {label:'Life',href:'/calendar',icon:Sparkles,paths:['/calendar','/tasks','/planning','/reminders','/routines','/habits','/timeline','/goals']},
  {label:'Mind',href:'/brain',icon:BrainCircuit,paths:['/brain','/memory','/observations','/graph','/notes','/resources','/rules']},
  {label:'Wellness',href:'/wellness',icon:HeartPulse,paths:['/wellness','/fitness','/food','/maintenance']},
  {label:'Beauty',href:'/beauty',icon:WandSparkles,paths:['/beauty','/beauty/lab','/skincare','/makeup','/hair','/closet']},
  {label:'Money',href:'/finance/brain',icon:WalletCards,paths:['/finance','/finance/brain']},
  {label:'Work + Create',href:'/work',icon:BriefcaseBusiness,paths:['/work','/projects','/creative-studio','/concierge']},
  {label:'Home',href:'/home',icon:HomeIcon,paths:['/home','/all-rooms','/world','/life-world']},
];

const UTILITIES = [
  ['Gmail','/gmail'],['Import','/import'],['Notices','/notices'],['Connections','/connections'],['Settings','/settings'],
] as const;

const LABELS: Record<string,string> = {
  '/dashboard':'Dashboard','/today':'Today','/briefings':'Briefings','/tomorrow':'Tomorrow','/calendar':'Calendar','/tasks':'Tasks','/planning':'Planning','/reminders':'Reminders','/routines':'Routines','/habits':'Habits','/timeline':'Timeline','/goals':'Goals','/brain':'Brain','/memory':'Memory','/observations':'Observations','/graph':'Graph','/notes':'Notes','/resources':'Resources','/rules':'Personal Rules','/wellness':'Wellness','/fitness':'Fitness','/food':'Food','/maintenance':'Medications','/beauty':'Beauty','/beauty/lab':'Beauty Lab','/skincare':'Skincare','/makeup':'Makeup','/hair':'Hair','/closet':'Closet','/finance':'Finance','/finance/brain':'Financial Brain','/work':'Work','/projects':'Projects','/creative-studio':'Creative Studio','/concierge':'Concierge','/home':'Home','/all-rooms':'All Rooms','/world':'Glow World','/life-world':'Life World',
};

function isActive(pathname:string,path:string){return pathname===path||pathname.startsWith(`${path}/`)}

export function Sidebar(){
  const pathname=usePathname();
  const [mobileOpen,setMobileOpen]=useState(false);
  const activeWorld=useMemo(()=>WORLDS.find(w=>w.paths.some(p=>isActive(pathname,p)))?.label??null,[pathname]);
  const [openWorld,setOpenWorld]=useState<string|null>(activeWorld);

  return <aside className="flex h-full w-full flex-col border-b border-[#EEE5E0] bg-[rgba(255,253,251,.94)] px-4 py-4 backdrop-blur-xl lg:min-h-screen lg:w-[236px] lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
    <div className="flex items-center justify-between px-1">
      <Link href="/today" className="flex items-center gap-2.5 text-[#2B2420]" onClick={()=>setMobileOpen(false)}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F0DDDA] bg-[#FBE8E9] text-[#B76672]"><Sparkles size={15}/></span>
        <span><span className="glow-display block text-[21px] leading-none">Glow OS</span><span className="mt-1 block text-[8px] font-semibold uppercase tracking-[.18em] text-[#A99D95]">Personal digital world</span></span>
      </Link>
      <button type="button" onClick={()=>setMobileOpen(v=>!v)} className="rounded-full p-2 text-[#756D68] hover:bg-[#F7F1EE] lg:hidden" aria-label={mobileOpen?'Close navigation':'Open navigation'}>{mobileOpen?<X size={18}/>:<Menu size={18}/>}</button>
    </div>

    <div className={cn('mt-7 min-h-0 flex-1 overflow-y-auto pb-4',mobileOpen?'block':'hidden lg:block')}>
      <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[.18em] text-[#B2A69E]">Worlds</p>
      <nav aria-label="Glow OS worlds" className="space-y-1">
        {WORLDS.map(world=>{const Icon=world.icon;const active=world.label===activeWorld;const open=openWorld===world.label;return <div key={world.label} className={cn('rounded-[14px]',active?'bg-[#FBF1EF]':'')}>
          <div className="flex items-center">
            <Link href={world.href} onClick={()=>setMobileOpen(false)} className={cn('flex min-h-[45px] min-w-0 flex-1 items-center gap-3 rounded-[14px] px-3 text-[13px] font-medium transition',active?'text-[#A65361]':'text-[#4E4742] hover:bg-[#F8F3F0]')}>
              <Icon size={16} strokeWidth={1.6}/><span>{world.label}</span>
            </Link>
            <button type="button" onClick={()=>setOpenWorld(open?null:world.label)} className="mr-1 flex h-10 w-9 items-center justify-center rounded-[10px] text-[#92877F] hover:bg-white/70" aria-label={`${open?'Collapse':'Expand'} ${world.label}`} aria-expanded={open}><ChevronDown size={13} className={cn('transition-transform',open&&'rotate-180')}/></button>
          </div>
          {open?<div className="pb-2 pl-10 pr-2">{world.paths.map(path=><Link key={path} href={path} onClick={()=>setMobileOpen(false)} className={cn('flex min-h-[34px] items-center rounded-[9px] px-2.5 text-[11px] transition',isActive(pathname,path)?'bg-white font-medium text-[#A65361]':'text-[#81766F] hover:bg-white/70 hover:text-[#413A36]')}>{LABELS[path]??path}</Link>)}</div>:null}
        </div>})}
      </nav>

      <div className="my-5 h-px bg-[#EEE5E0]"/>
      <Link href="/all-rooms" onClick={()=>setMobileOpen(false)} className="flex min-h-[42px] items-center gap-3 rounded-[12px] px-3 text-[12px] font-medium text-[#655D58] hover:bg-[#F8F3F0]"><CircleEllipsis size={15}/>All Rooms</Link>
      <p className="mb-2 mt-4 px-3 text-[9px] font-semibold uppercase tracking-[.18em] text-[#B2A69E]">Utilities</p>
      <div className="space-y-0.5">{UTILITIES.map(([label,href])=><Link key={href} href={href} onClick={()=>setMobileOpen(false)} className={cn('flex min-h-[36px] items-center rounded-[10px] px-3 text-[11.5px]',isActive(pathname,href)?'bg-[#FBF1EF] font-medium text-[#A65361]':'text-[#7D746E] hover:bg-[#F8F3F0]')}>{label}</Link>)}</div>
    </div>

    <div className="hidden border-t border-[#EEE5E0] px-2 pt-4 lg:block"><p className="text-[10px] leading-4 text-[#A0958E]">Spaces → objects → relationships → timeline.</p></div>
  </aside>;
}

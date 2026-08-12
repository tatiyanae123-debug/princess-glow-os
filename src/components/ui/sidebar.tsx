'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, CircleEllipsis, Menu, Sparkles, X } from 'lucide-react';
import { navItems, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

const PRIMARY = [
  {label:'Today',href:'/dashboard'},
  {label:'Plan',href:'/planning'},
  {label:'Health & Care',href:'/wellness'},
  {label:'Money & Growth',href:'/finance'},
  {label:'Projects',href:'/projects'},
  {label:'Glow',href:'/brain'},
  {label:'Life World',href:'/world'},
];

const GROUPS:Array<{label:string;paths:string[]}>= [
  {label:'PLAN',paths:['/tasks','/calendar','/planning','/routines','/habits','/reminders','/today','/tomorrow']},
  {label:'HEALTH & CARE',paths:['/fitness','/wellness','/food','/beauty','/beauty/lab','/hair','/maintenance']},
  {label:'MONEY & GROWTH',paths:['/finance','/finance/brain','/goals']},
  {label:'GLOW',paths:['/brain','/concierge','/briefings','/observations','/inbox','/memory','/timeline','/intake','/rules']},
  {label:'LIBRARY & SYSTEM',paths:['/notes','/closet','/gmail','/resources','/connections','/import','/settings','/home']},
];

export function Sidebar(){
  const pathname=usePathname();
  const [mobileOpen,setMobileOpen]=useState(false);
  const [roomsOpen,setRoomsOpen]=useState(false);
  const byHref=useMemo(()=>new Map(navItems.map(item=>[item.href,item])),[]);

  const roomItem=(item:NavItem)=>{
    const Icon=item.icon;
    const active=pathname===item.href||pathname.startsWith(`${item.href}/`);
    return <Link key={item.href} href={item.href} onClick={()=>setMobileOpen(false)} className={cn('flex min-h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] transition',active?'bg-[#F8EFF1] font-medium text-[#8E5360]':'text-[#59595E] hover:bg-[#F7F7F7] hover:text-[#1C1C1E]')}><Icon size={16} strokeWidth={1.7}/><span>{item.label}</span></Link>;
  };

  return <aside className="flex h-full w-full flex-col border-b border-[#ECECEC] bg-white px-4 py-4 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
    <div className="flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2 text-[#1C1C1E]" onClick={()=>setMobileOpen(false)}><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1C1E] text-white"><Sparkles size={14}/></span><span className="text-[16px] font-semibold tracking-[-.02em]">Glow OS</span></Link>
      <button type="button" onClick={()=>setMobileOpen(value=>!value)} className="rounded-full p-2 text-[#6E6E73] hover:bg-[#F5F5F5] lg:hidden" aria-label={mobileOpen?'Close navigation':'Open navigation'}>{mobileOpen?<X size={19}/>:<Menu size={19}/>}</button>
    </div>

    <div className={cn('mt-6 min-h-0 flex-1',mobileOpen?'block':'hidden lg:block')}>
      <nav aria-label="Primary Glow OS navigation" className="space-y-1">
        {PRIMARY.map(item=>{
          const active=pathname===item.href||pathname.startsWith(`${item.href}/`);
          return <Link key={item.label} href={item.href} onClick={()=>setMobileOpen(false)} className={cn('flex min-h-11 items-center rounded-[10px] px-3 text-[14px] font-medium transition',active?'bg-[#F8EFF1] text-[#8E5360]':'text-[#343438] hover:bg-[#F7F7F7]')}>{item.label}</Link>;
        })}
      </nav>

      <div className="my-5 h-px bg-[#EFEFEF]"/>

      <button type="button" onClick={()=>setRoomsOpen(value=>!value)} className="flex min-h-11 w-full items-center justify-between rounded-[10px] px-3 text-left text-[13px] font-medium text-[#6E6E73] hover:bg-[#F7F7F7]" aria-expanded={roomsOpen}><span className="flex items-center gap-2"><CircleEllipsis size={16}/>All Rooms</span><ChevronDown size={15} className={cn('transition-transform',roomsOpen?'rotate-180':'')}/></button>

      {roomsOpen?<div className="mt-3 max-h-[58vh] space-y-5 overflow-y-auto pr-1">{GROUPS.map(group=><section key={group.label}><p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[.12em] text-[#A0A0A5]">{group.label}</p><div className="space-y-1">{group.paths.map(path=>byHref.get(path)).filter(Boolean).map(item=>roomItem(item as NavItem))}</div></section>)}</div>:null}
    </div>

    <div className="hidden border-t border-[#EFEFEF] pt-4 lg:block"><p className="text-[12px] leading-5 text-[#8A8A8F]">Power underneath. Simplicity on top.</p></div>
  </aside>;
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, CircleEllipsis, Menu, Sparkles, UserRound, X } from 'lucide-react';
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
  const isDashboard=pathname==='/dashboard'||pathname.startsWith('/dashboard/');

  if(isDashboard){
    return <aside className="reference-sidebar">
      <div>
        <Link href="/dashboard" className="reference-brand"><Sparkles/><span>GLOW OS</span></Link>
        <nav>{PRIMARY.map(item=>{const navItem=byHref.get(item.href);const Icon=navItem?.icon??Sparkles;const active=item.href==='/dashboard';return <Link key={item.href} href={item.href} className={active?'active':''}><Icon/><span>{item.label}</span></Link>;})}<hr/><Link href="/planning?allRooms=1"><CircleEllipsis/><span>All Rooms</span></Link></nav>
      </div>
      <Link href="/settings?section=profile" className="sidebar-profile"><div>T</div><span><strong>Tatiyana</strong><em>View Profile</em></span></Link>
    </aside>;
  }

  const roomItem=(item:NavItem)=>{
    const Icon=item.icon;
    const active=pathname===item.href||pathname.startsWith(`${item.href}/`);
    return <Link key={item.href} href={item.href} onClick={()=>setMobileOpen(false)} className={cn('flex min-h-9 items-center gap-2.5 rounded-[8px] px-2.5 text-[12px] transition',active?'bg-[#F8EFF1] font-medium text-[#9A5363]':'text-[#5D5D62] hover:bg-[#F8F8F8] hover:text-[#1C1C1E]')}><Icon size={14} strokeWidth={1.6}/><span>{item.label}</span></Link>;
  };

  return <aside className="flex h-full w-full flex-col border-b border-[#ECECEC] bg-white px-3 py-3 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-3 lg:py-5">
    <div className="flex items-center justify-between px-1">
      <Link href="/dashboard" className="flex items-center gap-2 text-[#1C1C1E]" onClick={()=>setMobileOpen(false)}><Sparkles size={14} strokeWidth={1.5}/><span className="font-serif text-[15px] tracking-[.04em]">GLOW OS</span></Link>
      <button type="button" onClick={()=>setMobileOpen(value=>!value)} className="rounded-full p-2 text-[#6E6E73] hover:bg-[#F5F5F5] lg:hidden" aria-label={mobileOpen?'Close navigation':'Open navigation'}>{mobileOpen?<X size={18}/>:<Menu size={18}/>}</button>
    </div>

    <div className={cn('mt-6 min-h-0 flex-1',mobileOpen?'block':'hidden lg:block')}>
      <nav aria-label="Primary Glow OS navigation" className="space-y-1">
        {PRIMARY.map(item=>{
          const active=pathname===item.href||pathname.startsWith(`${item.href}/`);
          const navItem=byHref.get(item.href);
          const Icon=navItem?.icon;
          return <Link key={item.label} href={item.href} onClick={()=>setMobileOpen(false)} className={cn('flex min-h-10 items-center gap-2.5 rounded-[8px] px-2.5 text-[12px] font-medium transition',active?'bg-[#F8EFF1] text-[#9A5363]':'text-[#343438] hover:bg-[#F8F8F8]')}>{Icon?<Icon size={14} strokeWidth={1.6}/>:<span className="h-3.5 w-3.5"/>}<span>{item.label}</span></Link>;
        })}
      </nav>

      <div className="my-4 h-px bg-[#F0F0F0]"/>

      <button type="button" onClick={()=>setRoomsOpen(value=>!value)} className="flex min-h-10 w-full items-center justify-between rounded-[8px] px-2.5 text-left text-[12px] font-medium text-[#66666B] hover:bg-[#F8F8F8]" aria-expanded={roomsOpen}><span className="flex items-center gap-2.5"><CircleEllipsis size={14}/>All Rooms</span><ChevronDown size={13} className={cn('transition-transform',roomsOpen?'rotate-180':'')}/></button>

      {roomsOpen?<div className="mt-3 max-h-[56vh] space-y-4 overflow-y-auto pr-1">{GROUPS.map(group=><section key={group.label}><p className="mb-1 px-2.5 text-[9px] font-semibold uppercase tracking-[.14em] text-[#A7A7AC]">{group.label}</p><div className="space-y-0.5">{group.paths.map(path=>byHref.get(path)).filter(Boolean).map(item=>roomItem(item as NavItem))}</div></section>)}</div>:null}
    </div>

    <Link href="/settings?section=profile" className="hidden items-center gap-2.5 border-t border-[#F0F0F0] px-1 pt-4 lg:flex"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F1EF] text-[#6D5A54]"><UserRound size={14}/></span><span className="min-w-0"><span className="block truncate text-[11px] font-medium text-[#333337]">Tatiyana</span><span className="block text-[9px] text-[#919196]">View Profile</span></span></Link>
  </aside>;
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, CircleEllipsis, Menu, Sparkles, UserRound, X } from 'lucide-react';
import { navItems, type NavItem } from '@/lib/navigation';
import { expandedNavigationGroups, groupContainsPath, navigationGroups, navigationPathIsActive } from '@/lib/navigation-groups';
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

export function Sidebar(){
  const pathname=usePathname();
  const [mobileOpen,setMobileOpen]=useState(false);
  const [roomsOpen,setRoomsOpen]=useState(()=>navigationGroups.some(group=>groupContainsPath(group,pathname)));
  const [expandedGroups,setExpandedGroups]=useState<Record<string,boolean>>(()=>expandedNavigationGroups(pathname));
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

  const closeMobile=()=>setMobileOpen(false);
  const roomItem=(item:NavItem)=>{
    const Icon=item.icon;
    const active=navigationPathIsActive(pathname,item.href);
    return <Link key={item.href} href={item.href} onClick={closeMobile} aria-current={active?'page':undefined} className={cn('flex min-h-10 items-center gap-2.5 rounded-[8px] px-2.5 text-[12px] transition sm:min-h-9',active?'bg-[#F8EFF1] font-medium text-[#9A5363]':'text-[#5D5D62] hover:bg-[#F8F8F8] hover:text-[#1C1C1E]')}><Icon size={14} strokeWidth={1.6}/><span>{item.label}</span></Link>;
  };

  return <aside className="flex h-full w-full flex-col border-b border-[#ECECEC] bg-white px-3 py-3 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-3 lg:py-5">
    <div className="flex items-center justify-between px-1">
      <Link href="/dashboard" className="flex items-center gap-2 text-[#1C1C1E]" onClick={closeMobile}><Sparkles size={14} strokeWidth={1.5}/><span className="font-serif text-[15px] tracking-[.04em]">GLOW OS</span></Link>
      <button type="button" onClick={()=>setMobileOpen(value=>!value)} className="rounded-full p-2 text-[#6E6E73] hover:bg-[#F5F5F5] lg:hidden" aria-label={mobileOpen?'Close navigation':'Open navigation'} aria-expanded={mobileOpen} aria-controls="glow-navigation-panel">{mobileOpen?<X size={18}/>:<Menu size={18}/>}</button>
    </div>

    <div id="glow-navigation-panel" className={cn('mt-4 min-h-0 flex-1 border-t border-[#F3F3F3] pt-3 sm:mt-5 lg:mt-6 lg:border-t-0 lg:pt-0',mobileOpen?'block':'hidden lg:block')}>
      <nav aria-label="Primary Glow OS navigation" className="space-y-1">
        {PRIMARY.map(item=>{
          const active=navigationPathIsActive(pathname,item.href);
          const navItem=byHref.get(item.href);
          const Icon=navItem?.icon;
          return <Link key={item.label} href={item.href} onClick={closeMobile} aria-current={active?'page':undefined} className={cn('flex min-h-11 items-center gap-2.5 rounded-[8px] px-2.5 text-[12px] font-medium transition sm:min-h-10',active?'bg-[#F8EFF1] text-[#9A5363]':'text-[#343438] hover:bg-[#F8F8F8]')}>{Icon?<Icon size={14} strokeWidth={1.6}/>:<span className="h-3.5 w-3.5"/>}<span>{item.label}</span></Link>;
        })}
      </nav>

      <div className="my-4 h-px bg-[#F0F0F0]"/>

      <button type="button" onClick={()=>setRoomsOpen(value=>!value)} className="flex min-h-11 w-full items-center justify-between rounded-[8px] px-2.5 text-left text-[12px] font-medium text-[#66666B] hover:bg-[#F8F8F8] sm:min-h-10" aria-expanded={roomsOpen} aria-controls="glow-room-groups"><span className="flex items-center gap-2.5"><CircleEllipsis size={14}/>All Rooms</span><ChevronDown size={13} className={cn('transition-transform',roomsOpen?'rotate-180':'')}/></button>

      {roomsOpen?<div id="glow-room-groups" className="mt-2 max-h-[62vh] space-y-1 overflow-y-auto pr-1 lg:max-h-[58vh]">{navigationGroups.map(group=>{
        const activeGroup=groupContainsPath(group,pathname);
        const expanded=expandedGroups[group.label]??activeGroup;
        const groupId=`nav-group-${group.label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
        return <section key={group.label} className="rounded-[8px]">
          <button type="button" onClick={()=>setExpandedGroups(current=>({...current,[group.label]:!expanded}))} aria-expanded={expanded} aria-controls={groupId} className={cn('flex min-h-10 w-full items-center justify-between rounded-[8px] px-2.5 text-left text-[9px] font-semibold uppercase tracking-[.14em] transition',activeGroup?'text-[#9A5363]':'text-[#929298] hover:bg-[#FAFAFA] hover:text-[#66666B]')}><span>{group.label}</span><ChevronDown size={12} className={cn('transition-transform',expanded?'rotate-180':'')}/></button>
          {expanded?<div id={groupId} className="space-y-0.5 pb-1">{group.paths.map(path=>byHref.get(path)).filter(Boolean).map(item=>roomItem(item as NavItem))}</div>:null}
        </section>;
      })}</div>:null}
    </div>

    <Link href="/settings?section=profile" className={cn('items-center gap-2.5 border-t border-[#F0F0F0] px-1 pt-4',mobileOpen?'flex':'hidden lg:flex')} onClick={closeMobile}><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F1EF] text-[#6D5A54]"><UserRound size={14}/></span><span className="min-w-0"><span className="block truncate text-[11px] font-medium text-[#333337]">Tatiyana</span><span className="block text-[9px] text-[#919196]">View Profile</span></span></Link>
  </aside>;
}

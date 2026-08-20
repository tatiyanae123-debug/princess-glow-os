'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Bell, BrainCircuit, BriefcaseBusiness, CalendarDays, CheckSquare2, CircleDollarSign,
  CircleDot, Grid2X2, Home, Menu, NotebookTabs, Plus, Search, Settings, Sparkles,
  Target, X, type LucideIcon,
} from 'lucide-react';

type Item={label:string;href:string;icon:LucideIcon};
type Group={label:string;items:Item[]};

const GROUPS:Group[]=[
  {label:'TODAY',items:[
    {label:'Home',href:'/dashboard',icon:Home},
    {label:'Dashboard',href:'/today',icon:Grid2X2},
    {label:'Briefings',href:'/briefings',icon:NotebookTabs},
    {label:'Debriefs',href:'/briefings/evening',icon:CircleDot},
  ]},
  {label:'LIFE',items:[
    {label:'Calendar',href:'/calendar',icon:CalendarDays},
    {label:'Tasks',href:'/tasks',icon:CheckSquare2},
    {label:'Reminders',href:'/reminders',icon:Bell},
    {label:'Timeline',href:'/timeline',icon:CircleDot},
    {label:'Goals',href:'/goals',icon:Target},
  ]},
  {label:'MIND',items:[
    {label:'Brain',href:'/brain',icon:BrainCircuit},
    {label:'Memory',href:'/memory',icon:NotebookTabs},
    {label:'Graph',href:'/graph',icon:CircleDot},
  ]},
  {label:'WORK + CREATE',items:[
    {label:'Career & Work',href:'/work',icon:BriefcaseBusiness},
    {label:'Projects',href:'/projects',icon:NotebookTabs},
    {label:'Creative Studio',href:'/creative-studio',icon:Sparkles},
  ]},
  {label:'MONEY',items:[
    {label:'Finance',href:'/finance',icon:CircleDollarSign},
    {label:'Financial Brain',href:'/finance/brain',icon:CircleDollarSign},
  ]},
  {label:'WORLD',items:[
    {label:'Home World',href:'/home',icon:Home},
    {label:'All Rooms',href:'/all-rooms',icon:Grid2X2},
  ]},
];

function active(pathname:string,href:string){
  if(href==='/dashboard') return pathname==='/dashboard';
  return pathname===href||pathname.startsWith(`${href}/`);
}

export function UniversalMobileNav(){
  const pathname=usePathname();
  const [open,setOpen]=useState(false);
  useEffect(()=>setOpen(false),[pathname]);
  useEffect(()=>{
    if(!open)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=previous};
  },[open]);
  function openSearch(){setOpen(false);document.dispatchEvent(new CustomEvent('glow:search-open'));}
  function quickAdd(){setOpen(false);document.dispatchEvent(new CustomEvent('glow:quick-add'));}
  return <>
    <div className="sticky top-0 z-[72] flex h-[54px] w-full items-center justify-between border-b border-[#eee8e5] bg-white/96 px-3.5 shadow-[0_3px_14px_rgba(62,43,36,.035)] backdrop-blur-xl xl:hidden">
      <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5 text-[#282421]"><Sparkles size={17} strokeWidth={1.4} className="text-[#c85f78]"/><span className="font-serif text-[16px] font-semibold tracking-[.08em]">GLOW OS</span></Link>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={openSearch} aria-label="Search Glow" className="flex h-9 w-9 items-center justify-center rounded-full text-[#5d5651] hover:bg-[#f8efee]"><Search size={16}/></button>
        <button type="button" onClick={()=>setOpen(true)} aria-label="Open navigation" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eee5e1] bg-white text-[#4c4541] shadow-sm hover:bg-[#f8efee]"><Menu size={18}/></button>
      </div>
    </div>
    {open?<button type="button" aria-label="Close navigation overlay" onClick={()=>setOpen(false)} className="fixed inset-0 z-[88] bg-black/20 backdrop-blur-[1px] xl:hidden"/>:null}
    <aside className={`fixed inset-y-0 left-0 z-[90] flex w-[min(88vw,390px)] flex-col border-r border-[#ebe6e3] bg-white text-[#282421] shadow-[20px_0_55px_rgba(53,38,31,.12)] transition-transform duration-200 xl:hidden ${open?'translate-x-0':'-translate-x-full'}`} aria-hidden={!open}>
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#eee8e5] px-5">
        <Link href="/dashboard" className="flex items-center gap-3"><Sparkles size={22} strokeWidth={1.35} className="text-[#c85f78]"/><span className="font-serif text-[22px] font-semibold tracking-[.09em]">GLOW OS</span></Link>
        <button type="button" onClick={()=>setOpen(false)} aria-label="Close navigation" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#f8efee]"><X size={19}/></button>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-5 py-5 [scrollbar-width:thin]">
        {GROUPS.map(group=><div key={group.label} className="mb-7"><p className="mb-2 px-3 text-[10px] font-semibold tracking-[.16em] text-[#817974]">{group.label}</p><div className="space-y-1">{group.items.map(({label,href,icon:Icon})=>{const on=active(pathname,href);return <Link key={href} href={href} className={`flex min-h-[46px] items-center gap-3 rounded-[16px] px-3 text-[15px] transition ${on?'bg-[#fae4e7] font-medium text-[#b85169]':'text-[#393431] hover:bg-[#f8efee]'}`}><Icon size={18} strokeWidth={1.45}/><span>{label}</span></Link>})}</div></div>)}
        <div className="mb-5 border-t border-[#eee8e5] pt-5">
          <Link href="/notes" className="flex min-h-[44px] items-center gap-3 rounded-[14px] px-3 text-[14px] text-[#393431] hover:bg-[#f8efee]"><NotebookTabs size={17}/>Notes</Link>
          <Link href="/settings" className="flex min-h-[44px] items-center gap-3 rounded-[14px] px-3 text-[14px] text-[#393431] hover:bg-[#f8efee]"><Settings size={17}/>Settings</Link>
        </div>
      </nav>
      <div className="shrink-0 border-t border-[#eee8e5] bg-white px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-4">
        <button type="button" onClick={quickAdd} className="flex h-[54px] w-full items-center justify-center gap-3 rounded-full bg-[#cd6b7e] px-5 text-[16px] font-medium text-white shadow-[0_9px_24px_rgba(190,85,107,.22)]"><Plus size={19}/>Add Anything <Sparkles size={15}/></button>
      </div>
    </aside>
  </>;
}

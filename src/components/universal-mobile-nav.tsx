'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft, Bell, BrainCircuit, CalendarDays, CheckSquare2, CircleDot, Crown,
  Dumbbell, FolderKanban, Goal, Grid2X2, Heart, Home, LockKeyhole, Music2,
  NotebookTabs, Search, Settings, Shirt, Sparkles, Upload, UserRound,
  Utensils, WalletCards, WandSparkles, X,
} from 'lucide-react';

type Item={label:string;href:string;icon:typeof Home;keywords?:string[]};
type World={label:string;href:string;icon:typeof Home;items:Item[]};

const WORLDS:World[]=[
 {label:'Today',href:'/today',icon:Sparkles,items:[
  {label:'Today',href:'/today',icon:Sparkles,keywords:['dashboard','home','overview']},
  {label:'Morning Brief',href:'/briefings/morning',icon:NotebookTabs,keywords:['morning','daily']},
  {label:'Evening Debrief',href:'/briefings/evening',icon:NotebookTabs,keywords:['night','review']},
 ]},
 {label:'Plan',href:'/planning',icon:CalendarDays,items:[
  {label:'Calendar',href:'/calendar',icon:CalendarDays,keywords:['schedule','week']},
  {label:'Tasks',href:'/tasks',icon:CheckSquare2,keywords:['todo','to do']},
  {label:'Reminders',href:'/reminders',icon:Bell},
  {label:'Planning',href:'/planning',icon:CalendarDays},
  {label:'Goals',href:'/goals',icon:Goal},
  {label:'Projects',href:'/projects',icon:FolderKanban},
  {label:'Routines',href:'/routines',icon:Sparkles},
  {label:'Habits',href:'/habits',icon:CheckSquare2},
 ]},
 {label:'Life',href:'/life',icon:Heart,items:[
  {label:'Wellness',href:'/wellness',icon:Heart},
  {label:'Fitness',href:'/fitness',icon:Dumbbell,keywords:['workout','training']},
  {label:'Food',href:'/food',icon:Utensils},
  {label:'Beauty',href:'/beauty',icon:Sparkles},
  {label:'Beauty Lab',href:'/beauty/lab',icon:WandSparkles},
  {label:'Hair',href:'/hair',icon:Sparkles},
  {label:'Closet',href:'/closet',icon:Shirt},
  {label:'Home',href:'/home',icon:Home},
  {label:'Finance',href:'/finance',icon:WalletCards},
  {label:'Work',href:'/work',icon:UserRound},
 ]},
 {label:'Brain',href:'/brain',icon:BrainCircuit,items:[
  {label:'Brain',href:'/brain',icon:BrainCircuit},
  {label:'Memory',href:'/memory',icon:NotebookTabs},
  {label:'Timeline',href:'/timeline',icon:CircleDot},
  {label:'Observations',href:'/observations',icon:CircleDot},
  {label:'Connections',href:'/connections',icon:UserRound},
  {label:'Concierge',href:'/concierge',icon:Sparkles},
  {label:'Second Brain',href:'/second-brain',icon:BrainCircuit},
 ]},
 {label:'Create',href:'/create',icon:Sparkles,items:[
  {label:'Create',href:'/create',icon:Sparkles},
  {label:'Creative Studio',href:'/creative-studio',icon:WandSparkles},
  {label:'Notes',href:'/notes',icon:NotebookTabs},
  {label:'Import',href:'/import',icon:Upload},
  {label:'Gmail',href:'/gmail',icon:Bell},
 ]},
 {label:'System',href:'/settings',icon:Settings,items:[
  {label:'Search',href:'/search',icon:Search},
  {label:'World',href:'/world',icon:Grid2X2},
  {label:'Travel',href:'/travel',icon:CalendarDays},
  {label:'Spotify',href:'/spotify',icon:Music2},
  {label:'Vault',href:'/vault',icon:LockKeyhole},
  {label:'Settings',href:'/settings',icon:Settings},
 ]},
];

const PRIMARY=WORLDS.slice(0,5);
const ALL=WORLDS.flatMap(w=>w.items.map(i=>({...i,world:w.label})));
function prettyPath(pathname:string){const hit=ALL.find(i=>pathname===i.href||pathname.startsWith(`${i.href}/`));return hit?.label??'Glow OS'}
function activeWorld(pathname:string){
 if(pathname.startsWith('/today')||pathname.startsWith('/dashboard')||pathname.startsWith('/briefings'))return'Today';
 if(['/calendar','/tasks','/reminders','/planning','/plan','/goals','/projects','/routines','/habits'].some(p=>pathname.startsWith(p)))return'Plan';
 if(['/life','/wellness','/fitness','/food','/beauty','/hair','/closet','/home','/finance','/money','/work','/travel'].some(p=>pathname.startsWith(p)))return'Life';
 if(['/brain','/memory','/timeline','/observations','/connections','/concierge','/second-brain','/graph','/notices'].some(p=>pathname.startsWith(p)))return'Brain';
 if(['/create','/creative-studio','/notes','/import','/gmail','/inbox','/capture'].some(p=>pathname.startsWith(p)))return'Create';
 return'Today';
}

export function UniversalMobileNav(){
 const pathname=usePathname();const router=useRouter();const[open,setOpen]=useState(false);const[world,setWorld]=useState<string|null>(null);const[query,setQuery]=useState('');const[mounted,setMounted]=useState(false);const[assistantOpen,setAssistantOpen]=useState(false);
 useEffect(()=>setMounted(true),[]);
 useEffect(()=>{setOpen(false);setWorld(null);setQuery('')},[pathname]);
 useEffect(()=>{if(!open)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old}},[open]);
 useEffect(()=>{const fn=()=>setOpen(true);document.addEventListener('glow:worlds-open',fn);return()=>document.removeEventListener('glow:worlds-open',fn)},[]);
 useEffect(()=>{const fn=(event:Event)=>setAssistantOpen(Boolean((event as CustomEvent<{open?:boolean}>).detail?.open));document.addEventListener('glow:conversation-state',fn);return()=>document.removeEventListener('glow:conversation-state',fn)},[]);
 const searchResults=useMemo(()=>{const q=query.trim().toLowerCase();if(!q)return[];return ALL.filter(i=>`${i.label} ${i.world} ${(i.keywords||[]).join(' ')}`.toLowerCase().includes(q)).slice(0,14)},[query]);
 const selected=WORLDS.find(w=>w.label===world)??null;
 const currentWorld=activeWorld(pathname);
 const go=(href:string)=>{setOpen(false);router.push(href)};
 const openGlow=()=>document.dispatchEvent(new CustomEvent('glow:open-conversation'));
 const openSearch=()=>document.dispatchEvent(new CustomEvent('glow:search-open'));
 const overlay=open&&mounted?createPortal(
  <div className="glow-world-switcher fixed inset-0 z-[2147483600] isolate overflow-y-auto text-white backdrop-blur-3xl">
   <div className="mx-auto min-h-full w-full max-w-[1180px] px-4 pb-32 pt-[max(18px,env(safe-area-inset-top))] sm:px-7 lg:px-10">
    <div className="flex items-center justify-between gap-3">
     <button onClick={()=>selected?setWorld(null):setOpen(false)} className="glow-crystal-control inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm">{selected?<ArrowLeft size={17}/>:<X size={17}/>}<span>{selected?'All worlds':'Close'}</span></button>
     <div className="text-center"><p className="text-[10px] font-semibold uppercase tracking-[.26em] text-white/55">Glow OS</p><p className="text-xl font-medium sm:text-2xl">{selected?selected.label:'Your World'}</p></div>
     <button onClick={openGlow} className="glow-crystal-control inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm"><Sparkles size={16}/>Ask Glow</button>
    </div>
    <div className="mx-auto mt-8 max-w-3xl"><p className="text-center text-3xl font-medium leading-tight sm:text-5xl">Where do you want to go?</p><div className="glow-crystal-control mt-5 flex items-center gap-3 rounded-[24px] px-4 py-3"><Search size={20} className="shrink-0 text-white/60"/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Glow…" className="min-w-0 flex-1 !border-0 !bg-transparent text-base text-white outline-none placeholder:text-white/40 sm:text-lg"/></div></div>
    {query?<section className="mx-auto mt-8 max-w-5xl"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{searchResults.map(({href,label,icon:Icon,world:w})=><button key={href} onClick={()=>go(href)} className="glow-crystal-card flex items-center gap-3 rounded-[24px] p-4 text-left"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"><Icon size={19}/></span><span><b className="block text-sm">{label}</b><span className="text-xs text-white/48">{w}</span></span></button>)}</div></section>:selected?<section className="mx-auto mt-10 max-w-5xl"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{selected.items.map(({href,label,icon:Icon})=><button key={href} onClick={()=>go(href)} className="glow-crystal-card rounded-[26px] p-5 text-left"><span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/10"><Icon size={21}/></span><p className="mt-5 text-xl font-medium">{label}</p><p className="mt-1 text-xs text-white/45">Open {label}</p></button>)}</div></section>:<section className="mx-auto mt-10 max-w-6xl"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{WORLDS.map(({label,icon:Icon,items})=><button key={label} onClick={()=>setWorld(label)} className={`glow-crystal-card min-h-[150px] rounded-[28px] p-5 text-left ${label===currentWorld?'glow-world-active':''}`}><span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/10"><Icon size={21}/></span><p className="mt-5 text-xl font-medium">{label}</p><p className="mt-1 text-[11px] text-white/45">{items.length} spaces</p></button>)}</div></section>}
   </div>
  </div>,document.body):null;
 return <>
  <header className="glow-reference-header sticky top-0 z-[2147483000] isolate w-full px-3 pt-[max(8px,env(safe-area-inset-top))] sm:px-5">
   <div className="mx-auto flex min-h-[58px] max-w-[1440px] items-center gap-2 rounded-[22px] px-3 sm:px-4">
    <button onClick={()=>setOpen(true)} className="flex min-w-0 items-center gap-2 rounded-full px-2 py-2 text-left text-white"><Crown size={18} className="text-[#f0b7ff]"/><span className="hidden text-sm font-semibold tracking-[.13em] sm:inline">GLOW OS</span><span className="hidden text-white/25 sm:inline">/</span><span className="truncate text-xs font-medium text-white/72 sm:text-sm">{prettyPath(pathname)}</span></button>
    <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 text-center lg:block"><p className="text-[13px] font-semibold tracking-[.04em] text-white">Liquid-Crystal Glow OS</p><p className="text-[9px] tracking-[.14em] text-white/38">ONE PHYSICS · MANY CLIMATES</p></div>
    <div className="ml-auto flex items-center gap-1.5"><span className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[10px] text-white/55 md:flex"><span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,255,199,.9)]"/>Glow Intelligence</span><button onClick={openSearch} aria-label="Search Glow" className="glow-crystal-control flex h-9 w-9 items-center justify-center rounded-full text-white"><Search size={16}/></button><button onClick={openGlow} className="glow-crystal-control inline-flex h-9 items-center gap-2 rounded-full px-3 text-[11px] font-medium text-white"><Sparkles size={14}/>Ask Glow</button><button onClick={()=>setOpen(true)} aria-label="Open all Glow rooms" className="glow-crystal-control flex h-9 w-9 items-center justify-center rounded-full text-white"><Grid2X2 size={15}/></button></div>
   </div>
  </header>
  {!assistantOpen?<nav aria-label="Primary Glow navigation" className="glow-reference-bottom-nav fixed bottom-[max(10px,env(safe-area-inset-bottom))] left-1/2 z-[2147482990] w-[min(94vw,560px)] -translate-x-1/2 px-2"><div className="grid grid-cols-5 rounded-[24px] p-1.5">{PRIMARY.map(({label,href,icon:Icon})=>{const active=currentWorld===label;return <Link key={label} href={href} aria-current={active?'page':undefined} className={`glow-primary-nav-item flex min-h-12 flex-col items-center justify-center gap-1 rounded-[18px] text-[10px] ${active?'is-active':''}`}><Icon size={16}/><span>{label}</span></Link>})}</div></nav>:null}
  {overlay}
 </>;
}

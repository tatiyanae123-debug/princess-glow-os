'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft, Bell, BrainCircuit, CalendarDays, CheckSquare2, CircleDot, Dumbbell,
  FolderKanban, Goal, Grid2X2, Heart, Home, LockKeyhole, Menu, Mic2, Music2,
  NotebookTabs, Search, Settings, Shirt, Sparkles, TimerReset, Upload, UserRound,
  Utensils, WalletCards, WandSparkles, X,
} from 'lucide-react';

type Item={label:string;href:string;icon:typeof Home;keywords?:string[]};
type World={label:string;icon:typeof Home;items:Item[]};

const WORLDS:World[]=[
 {label:'Today',icon:Sparkles,items:[
  {label:'Dashboard',href:'/dashboard',icon:Grid2X2,keywords:['home','overview']},
  {label:'Calendar',href:'/calendar',icon:CalendarDays,keywords:['schedule','week']},
  {label:'Tasks',href:'/tasks',icon:CheckSquare2,keywords:['todo','to do']},
  {label:'Reminders',href:'/reminders',icon:Bell},
  {label:'Briefings',href:'/briefings/morning',icon:NotebookTabs,keywords:['morning','daily']},
 ]},
 {label:'Life',icon:Heart,items:[
  {label:'Routines',href:'/routines',icon:Sparkles,keywords:['reset','sunday','morning','night']},
  {label:'Habits',href:'/habits',icon:CheckSquare2},
  {label:'Wellness',href:'/wellness',icon:Heart},
  {label:'Food',href:'/food',icon:Utensils},
  {label:'Closet',href:'/closet',icon:Shirt},
  {label:'Travel',href:'/travel',icon:CalendarDays},
 ]},
 {label:'Brain',icon:BrainCircuit,items:[
  {label:'Second Brain',href:'/second-brain',icon:BrainCircuit},
  {label:'Notes',href:'/notes',icon:NotebookTabs,keywords:['upload','video','transcript']},
  {label:'Memory',href:'/memory',icon:NotebookTabs},
  {label:'Timeline',href:'/timeline',icon:CircleDot},
  {label:'Concierge',href:'/concierge',icon:Sparkles},
  {label:'Observations',href:'/observations',icon:CircleDot},
 ]},
 {label:'Beauty',icon:WandSparkles,items:[
  {label:'Beauty',href:'/beauty',icon:Sparkles},
  {label:'Beauty Lab',href:'/beauty/lab',icon:WandSparkles},
  {label:'Hair',href:'/hair',icon:Sparkles},
 ]},
 {label:'Fitness',icon:Dumbbell,items:[
  {label:'Fitness',href:'/fitness',icon:Dumbbell,keywords:['workout','training']},
  {label:'Workout Mode',href:'/workout-mode',icon:Dumbbell},
 ]},
 {label:'Create',icon:Sparkles,items:[
  {label:'Create',href:'/create',icon:Sparkles},
  {label:'Creative Studio',href:'/creative-studio',icon:WandSparkles},
  {label:'Projects',href:'/projects',icon:FolderKanban},
  {label:'Goals',href:'/goals',icon:Goal},
 ]},
 {label:'Money',icon:WalletCards,items:[
  {label:'Finance',href:'/finance',icon:WalletCards},
  {label:'Financial Brain',href:'/finance/brain',icon:BrainCircuit},
 ]},
 {label:'Home',icon:Home,items:[
  {label:'Home',href:'/home',icon:Home},
  {label:'Work',href:'/work',icon:UserRound},
  {label:'World',href:'/world',icon:Grid2X2},
  {label:'All Rooms',href:'/all-rooms',icon:Grid2X2},
 ]},
 {label:'System',icon:Settings,items:[
  {label:'Import',href:'/import',icon:Upload,keywords:['upload','files']},
  {label:'Connections',href:'/connections',icon:UserRound},
  {label:'Gmail',href:'/gmail',icon:Bell},
  {label:'Spotify',href:'/spotify',icon:Music2},
  {label:'Vault',href:'/vault',icon:LockKeyhole},
  {label:'Settings',href:'/settings',icon:Settings},
 ]},
];

const ALL=WORLDS.flatMap(w=>w.items.map(i=>({...i,world:w.label})));
const PINNED=['/notes','/dashboard','/routines','/fitness','/calendar','/beauty'];

function prettyPath(pathname:string){const hit=ALL.find(i=>pathname===i.href||pathname.startsWith(`${i.href}/`));return hit?.label??'Glow OS'}

export function UniversalMobileNav(){
 const pathname=usePathname();const router=useRouter();const[open,setOpen]=useState(false);const[world,setWorld]=useState<string|null>(null);const[query,setQuery]=useState('');const[mounted,setMounted]=useState(false);const[recent,setRecent]=useState<string[]>([]);
 useEffect(()=>setMounted(true),[]);
 useEffect(()=>{setOpen(false);setWorld(null);setQuery('');try{const current=pathname;const previous=JSON.parse(localStorage.getItem('glow-world-recent')||'[]') as string[];const next=[current,...previous.filter(x=>x!==current)].slice(0,6);localStorage.setItem('glow-world-recent',JSON.stringify(next));setRecent(next)}catch{}},[pathname]);
 useEffect(()=>{if(!open)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old}},[open]);
 useEffect(()=>{let startX=0;const down=(e:TouchEvent)=>{startX=e.touches[0]?.clientX??0};const up=(e:TouchEvent)=>{const end=e.changedTouches[0]?.clientX??0;if(!open&&startX<22&&end-startX>70)setOpen(true);if(open&&startX-end>90)setOpen(false)};window.addEventListener('touchstart',down,{passive:true});window.addEventListener('touchend',up,{passive:true});return()=>{window.removeEventListener('touchstart',down);window.removeEventListener('touchend',up)}},[open]);
 useEffect(()=>{const fn=()=>setOpen(true);document.addEventListener('glow:worlds-open',fn);return()=>document.removeEventListener('glow:worlds-open',fn)},[]);

 const searchResults=useMemo(()=>{const q=query.trim().toLowerCase();if(!q)return[];return ALL.filter(i=>`${i.label} ${i.world} ${(i.keywords||[]).join(' ')}`.toLowerCase().includes(q)).slice(0,12)},[query]);
 const recentItems=useMemo(()=>{const order=[...recent,...PINNED];const seen=new Set<string>();return order.map(h=>ALL.find(i=>h===i.href||h.startsWith(`${i.href}/`))).filter((x):x is (typeof ALL)[number]=>Boolean(x)&&!seen.has(x!.href)&&Boolean(seen.add(x!.href))).slice(0,6)},[recent]);
 const selected=WORLDS.find(w=>w.label===world)??null;
 const go=(href:string)=>{setOpen(false);router.push(href)};
 const openVoice=()=>document.dispatchEvent(new CustomEvent('glow:voice-open'));
 const openSearch=()=>document.dispatchEvent(new CustomEvent('glow:search-open'));

 const overlay=open&&mounted?createPortal(<div className="fixed inset-0 z-[2147483600] isolate overflow-y-auto bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.98),rgba(241,232,239,.97)_38%,rgba(226,218,232,.98)_100%)] text-[#282321] backdrop-blur-3xl">
  <div className="mx-auto min-h-full w-full max-w-[1500px] px-4 pb-32 pt-[max(18px,env(safe-area-inset-top))] sm:px-7 lg:px-10">
   <div className="flex items-center justify-between gap-3"><button onClick={()=>selected?setWorld(null):setOpen(false)} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 text-sm shadow-[0_10px_35px_rgba(68,48,61,.08)] backdrop-blur-xl">{selected?<ArrowLeft size={17}/>:<X size={17}/>}<span>{selected?'Your Worlds':'Close'}</span></button><div className="text-center"><p className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#9a7181]">Glow OS</p><p className="font-serif text-xl sm:text-2xl">{selected?selected.label:'World Switcher'}</p></div><button onClick={openVoice} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/70 shadow-[0_10px_35px_rgba(68,48,61,.08)]"><Mic2 size={18}/></button></div>

   <div className="mx-auto mt-8 max-w-3xl"><p className="text-center font-serif text-3xl leading-tight sm:text-5xl">Where do you want to go?</p><div className="mt-5 flex items-center gap-3 rounded-[24px] border border-white/90 bg-white/72 px-4 py-3 shadow-[0_20px_70px_rgba(69,46,61,.10)] backdrop-blur-2xl"><Search size={20} className="shrink-0 text-[#8c7781]"/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your world…" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#a69a9e] sm:text-lg"/></div></div>

   {query?<section className="mx-auto mt-8 max-w-4xl"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#897a80]">Results</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{searchResults.map(({href,label,icon:Icon,world:w})=><button key={href} onClick={()=>go(href)} className="flex items-center gap-3 rounded-[22px] border border-white/85 bg-white/68 p-4 text-left shadow-[0_12px_35px_rgba(69,46,61,.07)]"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5e6ed]"><Icon size={19}/></span><span><b className="block text-sm">{label}</b><span className="text-xs text-[#8e8186]">{w}</span></span></button>)}</div>{!searchResults.length?<p className="rounded-2xl bg-white/55 p-5 text-center text-sm text-[#81767b]">No room matched that yet. Try a page name like Notes, workout, Sunday reset, upload video, or Calendar.</p>:null}</section>:selected?<section className="mx-auto mt-10 max-w-5xl"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{selected.items.map(({href,label,icon:Icon})=><button key={href} onClick={()=>go(href)} className="group rounded-[28px] border border-white/90 bg-white/66 p-5 text-left shadow-[0_18px_55px_rgba(72,49,63,.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/88"><span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(145deg,#fff,#eadde6)] shadow-inner"><Icon size={21}/></span><p className="mt-5 font-serif text-2xl">{label}</p><p className="mt-1 text-xs text-[#8b7e84]">Open {label}</p></button>)}</div></section>:<>
    <section className="mx-auto mt-10 max-w-5xl"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#897a80]">Recent + pinned</p><div className="flex gap-3 overflow-x-auto pb-2">{recentItems.map(({href,label,icon:Icon})=><button key={href} onClick={()=>go(href)} className="min-w-[140px] rounded-[22px] border border-white/90 bg-white/64 p-4 text-left shadow-[0_12px_35px_rgba(69,46,61,.06)]"><Icon size={18}/><p className="mt-3 text-sm font-semibold">{label}</p></button>)}</div></section>
    <section className="mx-auto mt-9 max-w-6xl"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#897a80]">Your worlds</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{WORLDS.map(({label,icon:Icon,items})=><button key={label} onClick={()=>setWorld(label)} className="group min-h-[150px] rounded-[30px] border border-white/90 bg-white/62 p-5 text-left shadow-[0_20px_55px_rgba(69,46,61,.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/85"><span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(145deg,#fff,#eadde6)]"><Icon size={21}/></span><p className="mt-5 font-serif text-xl sm:text-2xl">{label}</p><p className="mt-1 text-[11px] text-[#91858a]">{items.length} spaces</p></button>)}</div></section>
   </>}
  </div>
 </div>,document.body):null;

 return <>
  <div className="sticky top-0 z-[2147483000] isolate w-full px-3 pt-[max(8px,env(safe-area-inset-top))] sm:px-5">
   <div className="mx-auto flex min-h-[54px] max-w-[1440px] items-center gap-2 rounded-[22px] border border-white/90 bg-white/78 px-3 shadow-[0_12px_40px_rgba(70,50,62,.10)] backdrop-blur-2xl sm:px-4">
    <button onClick={()=>setOpen(true)} className="flex min-w-0 items-center gap-2 rounded-full px-2 py-2 text-left"><Sparkles size={17} className="text-[#c55f79]"/><span className="hidden font-serif text-sm tracking-[.08em] sm:inline">GLOW OS</span><span className="text-[#d1c7cb]">/</span><span className="truncate text-xs font-medium text-[#635b5f] sm:text-sm">{prettyPath(pathname)}</span></button>
    <div className="ml-auto flex items-center gap-1"><button onClick={openSearch} aria-label="Search Glow" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#f5edf1]"><Search size={16}/></button><button onClick={openVoice} aria-label="Ask Glow" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#f5edf1]"><Mic2 size={16}/></button><button onClick={()=>setOpen(true)} aria-label="Open worlds" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#332f31] text-white"><Grid2X2 size={15}/></button></div>
   </div>
  </div>

  <div className="fixed bottom-[max(10px,env(safe-area-inset-bottom))] left-1/2 z-[2147482990] w-[min(94vw,520px)] -translate-x-1/2 px-2">
   <div className="grid grid-cols-4 rounded-[24px] border border-white/90 bg-white/82 p-1.5 shadow-[0_18px_60px_rgba(62,44,55,.16)] backdrop-blur-2xl">
    <Link href="/dashboard" className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-[18px] text-[10px] text-[#655d61]"><Home size={16}/>Home</Link>
    <button onClick={openVoice} className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-[18px] text-[10px] text-[#655d61]"><Sparkles size={16}/>Ask Glow</button>
    <button onClick={openSearch} className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-[18px] text-[10px] text-[#655d61]"><Search size={16}/>Search</button>
    <button onClick={()=>setOpen(true)} className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-[18px] bg-[#f2e5eb] text-[10px] font-semibold text-[#9b586b]"><Menu size={16}/>Worlds</button>
   </div>
  </div>
  {overlay}
 </>;
}

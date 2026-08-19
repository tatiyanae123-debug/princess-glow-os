'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell, BrainCircuit, BriefcaseBusiness, CalendarDays, CheckSquare2, ChevronDown, CircleDollarSign,
  CircleEllipsis, CircleDot, Dumbbell, FlaskConical, Grid2X2, Heart, HeartPulse, Home as HomeIcon,
  Menu, NotebookTabs, Pill, Search, Settings, Sparkles, Target, Utensils, WandSparkles, Waves,
  X, type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

type World = { label:string; href:string; icon:LucideIcon; paths:string[] };
const WORLDS: World[] = [
  {label:'Today',href:'/dashboard',icon:CircleDot,paths:['/dashboard','/today','/briefings','/tomorrow','/day-mode']},
  {label:'Life + Planning',href:'/calendar',icon:CalendarDays,paths:['/calendar','/tasks','/planning','/reminders','/routines','/habits','/timeline','/goals','/focus']},
  {label:'Mind',href:'/brain',icon:BrainCircuit,paths:['/brain','/memory','/observations','/graph','/notes','/resources','/rules','/knowledge','/inbox','/intake','/concierge']},
  {label:'Wellness',href:'/wellness',icon:HeartPulse,paths:['/wellness','/fitness','/food','/maintenance','/medications','/sleep','/symptoms','/workout-studio']},
  {label:'Beauty',href:'/beauty',icon:WandSparkles,paths:['/beauty','/beauty/lab','/skincare','/makeup','/hair','/closet']},
  {label:'Money + Goals',href:'/finance/brain',icon:CircleDollarSign,paths:['/finance','/finance/brain','/money','/spending','/subscriptions','/forecast','/transactions','/goals']},
  {label:'Work + Create',href:'/work',icon:BriefcaseBusiness,paths:['/work','/projects','/creative-studio','/applications','/interviews','/interview-prep']},
  {label:'Home + World',href:'/home',icon:HomeIcon,paths:['/home','/all-rooms','/world','/life-world','/travel','/ritual']},
];

const UTILITIES = [['Gmail','/gmail'],['Import','/import'],['Add Anything','/intake'],['Notices','/notices'],['Connections','/connections'],['Settings','/settings']] as const;

const LABELS: Record<string,string> = {
  '/dashboard':'Home','/today':'Today','/briefings':'Briefings','/tomorrow':'Tomorrow','/day-mode':'Day Mode','/calendar':'Calendar','/tasks':'Tasks','/planning':'Planning','/reminders':'Reminders','/routines':'Routines','/habits':'Habits','/timeline':'Timeline','/goals':'Goals','/focus':'Deep Focus','/brain':'Brain','/memory':'Memory','/observations':'Observations','/graph':'Graph','/notes':'Notes','/resources':'Resources','/rules':'Personal Rules','/knowledge':'Knowledge','/inbox':'Inbox','/intake':'Add Anything','/concierge':'Concierge','/wellness':'Wellness','/fitness':'Fitness','/food':'Food & Nutrition','/maintenance':'Medications','/medications':'Medications','/sleep':'Sleep','/symptoms':'Symptoms & Recovery','/workout-studio':'Workout Studio','/beauty':'Beauty OS','/beauty/lab':'Beauty Lab','/skincare':'Skincare','/makeup':'Makeup','/hair':'Hair Studio','/closet':'Closet','/finance':'Financial Overview','/finance/brain':'Financial Brain','/money':'Money','/spending':'Spending','/subscriptions':'Subscriptions','/forecast':'Forecast','/transactions':'Transactions','/work':'Career & Work','/projects':'Projects','/creative-studio':'Creative Studio','/applications':'Applications','/interviews':'Interviews','/interview-prep':'Interview Prep','/home':'Home','/all-rooms':'All Rooms','/world':'Life World','/life-world':'Life World','/travel':'Travel','/ritual':'Ritual',
};

const REFERENCE_GROUPS: {label:string;items:{label:string;href:string;icon:LucideIcon}[]}[] = [
  {label:'TODAY',items:[
    {label:'Home',href:'/dashboard',icon:HomeIcon},{label:'Dashboard',href:'/today',icon:Grid2X2},{label:'Briefings',href:'/briefings',icon:NotebookTabs},{label:'Evening Debrief',href:'/briefings/evening',icon:CircleDot},{label:'Day Mode',href:'/day-mode',icon:Sparkles},
  ]},
  {label:'LIFE',items:[
    {label:'Calendar',href:'/calendar',icon:CalendarDays},{label:'Tasks',href:'/tasks',icon:CheckSquare2},{label:'Planning',href:'/planning',icon:NotebookTabs},{label:'Reminders',href:'/reminders',icon:Bell},{label:'Routines',href:'/routines',icon:CircleDot},{label:'Habits',href:'/habits',icon:CheckSquare2},{label:'Timeline',href:'/timeline',icon:CircleDot},{label:'Goals',href:'/goals',icon:Target},
  ]},
  {label:'MIND',items:[
    {label:'Brain',href:'/brain',icon:BrainCircuit},{label:'Concierge',href:'/concierge',icon:Sparkles},{label:'Memory',href:'/memory',icon:NotebookTabs},{label:'Observations',href:'/observations',icon:NotebookTabs},{label:'Graph',href:'/graph',icon:Waves},{label:'Notes',href:'/notes',icon:NotebookTabs},
  ]},
  {label:'WELLNESS',items:[
    {label:'Wellness',href:'/wellness',icon:Heart},{label:'Fitness',href:'/fitness',icon:Dumbbell},{label:'Food & Nutrition',href:'/food',icon:Utensils},{label:'Medications',href:'/maintenance',icon:Pill},{label:'Sleep',href:'/sleep',icon:CircleDot},{label:'Symptoms & Recovery',href:'/symptoms',icon:HeartPulse},
  ]},
  {label:'BEAUTY',items:[
    {label:'Beauty OS',href:'/beauty',icon:WandSparkles},{label:'Beauty Lab',href:'/beauty/lab',icon:FlaskConical},{label:'Hair Studio',href:'/hair',icon:Sparkles},{label:'Closet',href:'/closet',icon:Grid2X2},
  ]},
  {label:'MONEY',items:[
    {label:'Financial Brain',href:'/finance/brain',icon:CircleDollarSign},{label:'Financial Overview',href:'/finance',icon:CircleDollarSign},{label:'Spending',href:'/spending',icon:CircleDollarSign},{label:'Subscriptions',href:'/subscriptions',icon:CircleDollarSign},{label:'Forecast',href:'/forecast',icon:CircleDollarSign},{label:'Transactions',href:'/transactions',icon:CircleDollarSign},
  ]},
  {label:'WORK + CREATE',items:[
    {label:'Career & Work',href:'/work',icon:BriefcaseBusiness},{label:'Applications',href:'/applications',icon:NotebookTabs},{label:'Interviews',href:'/interviews',icon:NotebookTabs},{label:'Interview Prep',href:'/interview-prep',icon:Sparkles},{label:'Projects',href:'/projects',icon:Target},{label:'Creative Studio',href:'/creative-studio',icon:Sparkles},
  ]},
  {label:'HOME + WORLD',items:[
    {label:'Home',href:'/home',icon:HomeIcon},{label:'All Rooms',href:'/all-rooms',icon:CircleEllipsis},{label:'Life World',href:'/world',icon:Waves},{label:'Travel',href:'/travel',icon:Waves},
  ]},
  {label:'TOOLS + SYSTEM',items:[
    {label:'Deep Focus',href:'/focus',icon:CircleDot},{label:'Workout Studio',href:'/workout-studio',icon:Dumbbell},{label:'Add Anything',href:'/intake',icon:Sparkles},{label:'Gmail',href:'/gmail',icon:NotebookTabs},{label:'Import',href:'/import',icon:Sparkles},{label:'Connections',href:'/connections',icon:Waves},{label:'Notices',href:'/notices',icon:Bell},{label:'Settings',href:'/settings',icon:Settings},
  ]},
];

function isActive(pathname:string,path:string){return pathname===path||pathname.startsWith(`${path}/`)}

function ReferenceSidebar(){
  const pathname=usePathname();
  function openSearch(){ document.dispatchEvent(new CustomEvent('glow:search-open')); }
  return (
    <aside className="flex h-full min-h-[100dvh] w-[238px] flex-col border-r border-[#ebe6e3] bg-white px-[14px] pb-[18px] pt-[17px] text-[#282421]">
      <Link href="/dashboard" className="flex h-[38px] shrink-0 items-center gap-[10px] px-[5px]"><Sparkles size={18} strokeWidth={1.35} className="text-[#c85f78]"/><span className="font-serif text-[16px] font-semibold tracking-[.09em]">GLOW OS</span></Link>
      <nav className="mt-[13px] min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
        {REFERENCE_GROUPS.map(group=><div key={group.label} className="mb-[11px]"><p className="mb-[4px] px-[8px] text-[9px] font-semibold tracking-[.13em] text-[#7f7772]">{group.label}</p><div className="space-y-[1px]">{group.items.map(({label,href,icon:Icon})=>{const active=(href==='/dashboard'&&pathname==='/dashboard')||isActive(pathname,href);return <Link key={`${group.label}-${href}-${label}`} href={href} className={cn('flex min-h-[31px] items-center gap-[10px] rounded-[10px] px-[9px] text-[11.5px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D1D8]',active?'bg-[#fae6e7] font-medium text-[#b65369]':'text-[#38332f] hover:bg-[#f7eeed]')}><Icon size={14.5} strokeWidth={1.5} className={active?'text-[#c55e74]':'text-[#48423e]'}/><span>{label}</span></Link>})}</div></div>)}
      </nav>
      <div className="shrink-0 border-t border-[#eee8e5] pt-[12px]">
        <Link href="/settings?section=profile" className="flex items-center gap-[10px] rounded-[12px] px-[6px] py-[7px] hover:bg-[#f7eeed]"><span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[linear-gradient(145deg,#f7d1d8,#fae6e7)] font-serif text-[13px] text-[#6f3f49]">T</span><span className="min-w-0 flex-1"><span className="block text-[11px] font-medium">Tatiyana</span><span className="mt-[1px] block text-[8px] text-[#c15f74]">View Profile</span></span><ChevronDown size={12} className="-rotate-90 text-[#6f6762]"/></Link>
        <div className="mt-[9px] flex items-center justify-between border-t border-[#eee8e5] px-[10px] pt-[11px] text-[#59514c]">
          <button type="button" onClick={openSearch} aria-label="Search Glow" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#f7eeed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D1D8]"><Search size={16}/></button>
          <Link href="/notices" aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#f7eeed]"><Bell size={16}/><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#c55e74]"/></Link>
          <Link href="/settings" aria-label="Settings" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#f7eeed]"><Settings size={16}/></Link>
        </div>
      </div>
    </aside>
  );
}

export function Sidebar({variant='default'}:{variant?:'default'|'dashboard-reference'}){
  const pathname=usePathname();
  const [mobileOpen,setMobileOpen]=useState(false);
  const activeWorld=useMemo(()=>WORLDS.find(w=>w.paths.some(p=>isActive(pathname,p)))?.label??null,[pathname]);
  const [openWorld,setOpenWorld]=useState<string|null>(activeWorld);
  if(variant==='dashboard-reference') return <ReferenceSidebar/>;
  return <aside className="flex h-full w-full flex-col border-b border-[#EEE9E6] bg-white/96 px-3 py-2.5 backdrop-blur-xl lg:min-h-screen lg:w-[220px] lg:border-b-0 lg:border-r lg:px-3.5 lg:py-5"><div className="flex min-h-[40px] items-center justify-between px-0.5 lg:min-h-0 lg:px-1"><Link href="/dashboard" className="flex min-w-0 items-center gap-2 text-[#2D2927]" onClick={()=>setMobileOpen(false)}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#F1DDE2] bg-[#FBE8EC] text-[#B85F70] lg:h-9 lg:w-9"><Sparkles size={14}/></span><span className="min-w-0"><span className="glow-display block truncate text-[18px] leading-none lg:text-[20px]">Glow OS</span><span className="mt-1 hidden text-[7.5px] font-semibold uppercase tracking-[.17em] text-[#A99D95] sm:block">Personal digital world</span></span></Link><button type="button" onClick={()=>setMobileOpen(v=>!v)} className="rounded-full p-2 text-[#756D68] hover:bg-[#FBF8F7] lg:hidden" aria-label={mobileOpen?'Close navigation':'Open navigation'}>{mobileOpen?<X size={18}/>:<Menu size={18}/>}</button></div><div className={cn('mt-3 min-h-0 flex-1 overflow-y-auto pb-4 lg:mt-6',mobileOpen?'block':'hidden lg:block')}><p className="mb-2 px-3 text-[8.5px] font-semibold uppercase tracking-[.18em] text-[#B2A69E]">Worlds</p><nav className="space-y-1">{WORLDS.map(world=>{const Icon=world.icon;const active=world.label===activeWorld;const open=openWorld===world.label;return <div key={world.label} className={cn('rounded-[12px]',active?'bg-[#FFF4F6]':'')}><div className="flex items-center"><Link href={world.href} onClick={()=>setMobileOpen(false)} className={cn('flex min-h-[42px] min-w-0 flex-1 items-center gap-3 rounded-[12px] px-3 text-[12.5px] font-medium',active?'text-[#B55F70]':'text-[#4E4742] hover:bg-[#FBF8F7]')}><Icon size={15}/><span>{world.label}</span></Link><button type="button" onClick={()=>setOpenWorld(open?null:world.label)} className="mr-1 flex h-9 w-8 items-center justify-center rounded-[9px] text-[#92877F]" aria-label={`${open?'Collapse':'Expand'} ${world.label}`}><ChevronDown size={13} className={cn(open&&'rotate-180')}/></button></div>{open?<div className="pb-2 pl-9 pr-2">{world.paths.map(path=><Link key={path} href={path} className={cn('flex min-h-[32px] items-center rounded-[8px] px-2.5 text-[10.5px]',isActive(pathname,path)?'bg-white font-medium text-[#B55F70]':'text-[#81766F] hover:bg-white')}>{LABELS[path]??path}</Link>)}</div>:null}</div>})}</nav><div className="my-4 h-px bg-[#EEE9E6]"/><Link href="/all-rooms" className="flex min-h-[40px] items-center gap-3 rounded-[11px] px-3 text-[11.5px] font-medium text-[#655D58]"><CircleEllipsis size={15}/>All Rooms</Link><p className="mb-2 mt-4 px-3 text-[8.5px] font-semibold uppercase tracking-[.18em] text-[#B2A69E]">Utilities</p><div>{UTILITIES.map(([label,href])=><Link key={href} href={href} className="flex min-h-[34px] items-center rounded-[9px] px-3 text-[11px] text-[#7D746E]">{label}</Link>)}</div></div></aside>;
}

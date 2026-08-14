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
  {label:'Today',href:'/today',icon:CircleDot,paths:['/dashboard','/today','/briefings','/tomorrow']},
  {label:'Life',href:'/calendar',icon:Sparkles,paths:['/calendar','/tasks','/planning','/reminders','/routines','/habits','/timeline','/goals']},
  {label:'Mind',href:'/brain',icon:BrainCircuit,paths:['/brain','/memory','/observations','/graph','/notes','/resources','/rules']},
  {label:'Wellness',href:'/wellness',icon:HeartPulse,paths:['/wellness','/fitness','/food','/maintenance']},
  {label:'Beauty',href:'/beauty',icon:WandSparkles,paths:['/beauty','/beauty/lab','/skincare','/makeup','/hair','/closet']},
  {label:'Money',href:'/finance/brain',icon:CircleDollarSign,paths:['/finance','/finance/brain']},
  {label:'Work + Create',href:'/work',icon:BriefcaseBusiness,paths:['/work','/projects','/creative-studio','/concierge']},
  {label:'Home',href:'/home',icon:HomeIcon,paths:['/home','/all-rooms','/world','/life-world']},
];

const UTILITIES = [
  ['Gmail','/gmail'],['Import','/import'],['Notices','/notices'],['Connections','/connections'],['Settings','/settings'],
] as const;

const LABELS: Record<string,string> = {
  '/dashboard':'Dashboard','/today':'Today','/briefings':'Briefings','/tomorrow':'Tomorrow','/calendar':'Calendar','/tasks':'Tasks','/planning':'Planning','/reminders':'Reminders','/routines':'Routines','/habits':'Habits','/timeline':'Timeline','/goals':'Goals','/brain':'Brain','/memory':'Memory','/observations':'Observations','/graph':'Graph','/notes':'Notes','/resources':'Resources','/rules':'Personal Rules','/wellness':'Wellness','/fitness':'Fitness','/food':'Food','/maintenance':'Medications','/beauty':'Beauty','/beauty/lab':'Beauty Lab','/skincare':'Skincare','/makeup':'Makeup','/hair':'Hair','/closet':'Closet','/finance':'Finance','/finance/brain':'Financial Brain','/work':'Work','/projects':'Projects','/creative-studio':'Creative Studio','/concierge':'Concierge','/home':'Home','/all-rooms':'All Rooms','/world':'Glow World','/life-world':'Life World',
};

const REFERENCE_GROUPS: { label: string; items: { label: string; href: string; icon: LucideIcon }[] }[] = [
  { label: 'TODAY', items: [
    { label: 'Home', href: '/dashboard', icon: HomeIcon },
    { label: 'Dashboard', href: '/today', icon: Grid2X2 },
    { label: 'Briefings', href: '/briefings', icon: NotebookTabs },
    { label: 'Debriefs', href: '/briefings/evening', icon: CircleDollarSign },
  ]},
  { label: 'LIFE', items: [
    { label: 'Calendar', href: '/calendar', icon: CalendarDays },
    { label: 'Tasks', href: '/tasks', icon: CheckSquare2 },
    { label: 'Reminders', href: '/reminders', icon: Bell },
    { label: 'Timeline', href: '/timeline', icon: CircleDot },
    { label: 'Goals', href: '/goals', icon: Target },
  ]},
  { label: 'MIND', items: [
    { label: 'Brain', href: '/brain', icon: BrainCircuit },
    { label: 'Memory', href: '/memory', icon: NotebookTabs },
    { label: 'Observations', href: '/observations', icon: NotebookTabs },
    { label: 'Graph', href: '/graph', icon: Waves },
  ]},
  { label: 'WELLNESS', items: [
    { label: 'Wellness', href: '/wellness', icon: Heart },
    { label: 'Fitness', href: '/fitness', icon: Dumbbell },
    { label: 'Food', href: '/food', icon: Utensils },
    { label: 'Medications', href: '/maintenance', icon: Pill },
  ]},
  { label: 'BEAUTY', items: [
    { label: 'Beauty', href: '/beauty', icon: WandSparkles },
    { label: 'Beauty Lab', href: '/beauty/lab', icon: FlaskConical },
    { label: 'Hair', href: '/hair', icon: Sparkles },
  ]},
];

function isActive(pathname:string,path:string){return pathname===path||pathname.startsWith(`${path}/`)}

function ReferenceSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 flex h-screen w-[238px] flex-col border-r border-[#EDE7E4] bg-white px-[14px] py-[18px] text-[#282421]">
      <Link href="/dashboard" className="flex h-[38px] items-center gap-[10px] px-[5px]">
        <Sparkles size={18} strokeWidth={1.4} className="text-[#C85F78]" />
        <span className="font-serif text-[16px] font-semibold tracking-[.1em]">GLOW OS</span>
      </Link>
      <nav className="mt-[16px] min-h-0 flex-1 overflow-y-auto pr-1">
        {REFERENCE_GROUPS.map((group) => (
          <div key={group.label} className="mb-[13px]">
            <p className="mb-[4px] px-[8px] text-[9px] font-semibold tracking-[.13em] text-[#7F7772]">{group.label}</p>
            <div className="space-y-[1px]">
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = isActive(pathname, href) || (href === '/dashboard' && pathname === '/dashboard');
                return (
                  <Link key={href} href={href} className={cn('flex h-[32px] items-center gap-[10px] rounded-[10px] px-[9px] text-[12px] transition-colors', active ? 'bg-[#FAE6E7] font-medium text-[#B65369]' : 'text-[#38332F] hover:bg-[#F7EEED]')}>
                    <Icon size={15} strokeWidth={1.55} className={active ? 'text-[#C55E74]' : 'text-[#48423E]'} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-[#EEE8E5] pt-[13px]">
        <Link href="/settings?section=profile" className="flex items-center gap-[10px] rounded-[12px] px-[6px] py-[8px] hover:bg-[#F7EEED]">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[linear-gradient(145deg,#F7D1D8,#FAE6E7)] font-serif text-[13px] text-[#6F3F49]">T</span>
          <span className="min-w-0 flex-1"><span className="block text-[11px] font-medium">Tatiyana</span><span className="mt-[1px] block text-[9px] text-[#C15F74]">View Profile</span></span>
          <ChevronDown size={12} className="-rotate-90 text-[#6F6762]" />
        </Link>
        <div className="mt-[10px] flex items-center justify-between border-t border-[#EEE8E5] px-[10px] pt-[12px] text-[#59514C]">
          <Link href="/search" aria-label="Search" className="rounded-full p-1.5 hover:bg-[#F7EEED]"><Search size={17} strokeWidth={1.5} /></Link>
          <Link href="/notices" aria-label="Notifications" className="relative rounded-full p-1.5 hover:bg-[#F7EEED]"><Bell size={17} strokeWidth={1.5} /><span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#C55E74]" /></Link>
          <Link href="/settings" aria-label="Settings" className="rounded-full p-1.5 hover:bg-[#F7EEED]"><Settings size={17} strokeWidth={1.5} /></Link>
        </div>
      </div>
    </aside>
  );
}

export function Sidebar({ variant = 'default' }: { variant?: 'default' | 'dashboard-reference' }){
  const pathname=usePathname();
  const [mobileOpen,setMobileOpen]=useState(false);
  const activeWorld=useMemo(()=>WORLDS.find(w=>w.paths.some(p=>isActive(pathname,p)))?.label??null,[pathname]);
  const [openWorld,setOpenWorld]=useState<string|null>(activeWorld);

  if (variant === 'dashboard-reference') return <ReferenceSidebar />;

  return <aside className="flex h-full w-full flex-col border-b border-[#EEE9E6] bg-white/96 px-3 py-2.5 backdrop-blur-xl lg:min-h-screen lg:w-[220px] lg:border-b-0 lg:border-r lg:px-3.5 lg:py-5">
    <div className="flex min-h-[40px] items-center justify-between px-0.5 lg:min-h-0 lg:px-1">
      <Link href="/today" className="flex min-w-0 items-center gap-2 text-[#2D2927]" onClick={()=>setMobileOpen(false)}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#F1DDE2] bg-[#FBE8EC] text-[#B85F70] lg:h-9 lg:w-9"><Sparkles size={14}/></span>
        <span className="min-w-0"><span className="glow-display block truncate text-[18px] leading-none lg:text-[20px]">Glow OS</span><span className="mt-1 hidden text-[7.5px] font-semibold uppercase tracking-[.17em] text-[#A99D95] sm:block lg:block">Personal digital world</span></span>
      </Link>
      <button type="button" onClick={()=>setMobileOpen(v=>!v)} className="rounded-full p-2 text-[#756D68] hover:bg-[#FBF8F7] lg:hidden" aria-label={mobileOpen?'Close navigation':'Open navigation'}>{mobileOpen?<X size={18}/>:<Menu size={18}/>}</button>
    </div>

    <div className={cn('mt-3 min-h-0 flex-1 overflow-y-auto pb-4 lg:mt-6',mobileOpen?'block':'hidden lg:block')}>
      <p className="mb-2 px-3 text-[8.5px] font-semibold uppercase tracking-[.18em] text-[#B2A69E]">Worlds</p>
      <nav aria-label="Glow OS worlds" className="space-y-1">
        {WORLDS.map(world=>{const Icon=world.icon;const active=world.label===activeWorld;const open=openWorld===world.label;return <div key={world.label} className={cn('rounded-[12px]',active?'bg-[#FFF4F6]':'')}>
          <div className="flex items-center">
            <Link href={world.href} onClick={()=>setMobileOpen(false)} className={cn('flex min-h-[42px] min-w-0 flex-1 items-center gap-3 rounded-[12px] px-3 text-[12.5px] font-medium transition',active?'text-[#B55F70]':'text-[#4E4742] hover:bg-[#FBF8F7]')}>
              <Icon size={15} strokeWidth={1.6}/><span>{world.label}</span>
            </Link>
            <button type="button" onClick={()=>setOpenWorld(open?null:world.label)} className="mr-1 flex h-9 w-8 items-center justify-center rounded-[9px] text-[#92877F] hover:bg-white" aria-label={`${open?'Collapse':'Expand'} ${world.label}`} aria-expanded={open}><ChevronDown size={13} className={cn('transition-transform',open&&'rotate-180')}/></button>
          </div>
          {open?<div className="pb-2 pl-9 pr-2">{world.paths.map(path=><Link key={path} href={path} onClick={()=>setMobileOpen(false)} className={cn('flex min-h-[32px] items-center rounded-[8px] px-2.5 text-[10.5px] transition',isActive(pathname,path)?'bg-white font-medium text-[#B55F70]':'text-[#81766F] hover:bg-white hover:text-[#413A36]')}>{LABELS[path]??path}</Link>)}</div>:null}
        </div>})}
      </nav>

      <div className="my-4 h-px bg-[#EEE9E6]"/>
      <Link href="/all-rooms" onClick={()=>setMobileOpen(false)} className="flex min-h-[40px] items-center gap-3 rounded-[11px] px-3 text-[11.5px] font-medium text-[#655D58] hover:bg-[#FBF8F7]"><CircleEllipsis size={15}/>All Rooms</Link>
      <p className="mb-2 mt-4 px-3 text-[8.5px] font-semibold uppercase tracking-[.18em] text-[#B2A69E]">Utilities</p>
      <div className="space-y-0.5">{UTILITIES.map(([label,href])=><Link key={href} href={href} onClick={()=>setMobileOpen(false)} className={cn('flex min-h-[34px] items-center rounded-[9px] px-3 text-[11px]',isActive(pathname,href)?'bg-[#FFF4F6] font-medium text-[#B55F70]':'text-[#7D746E] hover:bg-[#FBF8F7]')}>{label}</Link>)}</div>
    </div>

    <div className="hidden border-t border-[#EEE9E6] px-2 pt-4 lg:block"><p className="text-[9.5px] leading-4 text-[#A0958E]">Spaces → objects → relationships → timeline.</p></div>
  </aside>;
}

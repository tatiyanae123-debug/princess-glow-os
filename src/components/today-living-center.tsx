'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bell, Bookmark, Brain, CalendarDays, ChevronDown, ChevronRight, Heart,
  Moon, PawPrint, Plus, Search, Sparkles, Sun, WandSparkles
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type TaskLite = { id:string; title:string; priority:string; dueLabel?:string|null };
type EventLite = { id:string; title:string; timeLabel:string; location?:string|null };
type RoutineLite = { id:string; name:string; timeOfDay:string };

type Props = {
  tasks: TaskLite[];
  events: EventLite[];
  routines: RoutineLite[];
  energy: number | null;
  mood: number | null;
  sleepHours: number | null;
  glowMessage: string;
};

const nav = [
  {label:'Today',href:'/today',icon:Sparkles},
  {label:'Plan',href:'/planning',icon:CalendarDays},
  {label:'Life',href:'/world',icon:Heart},
  {label:'Brain',href:'/brain',icon:Brain},
  {label:'Create',href:'/create',icon:WandSparkles},
];

function Glass({children,className=''}:{children:React.ReactNode;className?:string}){
  return <section className={`rounded-[24px] border border-white/70 bg-[rgba(255,250,247,.58)] shadow-[0_18px_50px_rgba(132,105,95,.12),inset_0_1px_0_rgba(255,255,255,.95)] backdrop-blur-xl ${className}`}>{children}</section>;
}

export function TodayLivingCenter({tasks,events,routines,energy,mood,sleepHours,glowMessage}:Props){
  const [now,setNow]=useState(new Date());
  const [prioritiesOpen,setPrioritiesOpen]=useState(false);
  const [askOpen,setAskOpen]=useState(false);
  const [replanned,setReplanned]=useState(false);
  const [whatNow,setWhatNow]=useState('Start Focused Session');

  useEffect(()=>{
    const id=window.setInterval(()=>setNow(new Date()),1000);
    return ()=>window.clearInterval(id);
  },[]);

  const hour=now.getHours();
  const greeting=hour<12?'Good morning, beautiful.':hour<17?'Good afternoon, beautiful.':hour<21?'Good evening, beautiful.':'Good night, beautiful.';
  const dateLabel=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  const timeLabel=now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  const primary=tasks[0];
  const next=events[0];
  const later=events[1];
  const evening=events.find(e=>/pm/i.test(e.timeLabel)) ?? events[2];
  const capacity=Math.max(35,Math.min(96,energy?Math.round(energy*10):82));
  const focusMinutes=primary?.dueLabel?.match(/\d+/)?.[0] ?? '47';
  const leaveReady=next?.timeLabel ?? '2:15 PM';
  const sleepLabel=sleepHours!=null?`${sleepHours.toFixed(1)}h sleep`:'Sleep not logged';

  const capacityRows: Array<[string,number]> = useMemo(()=>[
    ['Mental',Math.max(45,Math.min(96,capacity+2))],
    ['Emotional',Math.max(40,Math.min(94,mood?Math.round(mood*10):70))],
    ['Physical',Math.max(42,Math.min(96,energy?Math.round(energy*10+8):90))],
    ['Energy',capacity],
  ],[capacity,mood,energy]);

  const scheduleRows: Array<[string,string,string,LucideIcon]> = [
    ['NEXT',next?.timeLabel ?? '12:00 PM',next?.title ?? 'Lunch + Call',Sun],
    ['LATER',later?.timeLabel ?? '2:30 PM',later?.title ?? 'Content Planning',Sun],
    ['TONIGHT',evening?.timeLabel ?? '7:00 PM',evening?.title ?? 'Wind Down',Moon],
  ];

  return <div className="relative min-h-screen overflow-hidden bg-[#eee8e6] text-[#2e2927] selection:bg-[#ead4d4]">
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_47%_42%,rgba(255,255,255,.96)_0,rgba(255,244,240,.72)_20%,rgba(226,220,226,.72)_46%,rgba(244,236,231,.9)_72%,#eee8e6_100%)]"/>
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-80 [background-image:linear-gradient(115deg,rgba(255,255,255,.65),transparent_22%,rgba(215,211,221,.42)_48%,transparent_76%,rgba(255,255,255,.65))]"/>
    <div aria-hidden className="pointer-events-none absolute -left-20 top-0 h-full w-[30%] bg-[linear-gradient(90deg,rgba(255,255,255,.85),rgba(255,255,255,.12))] blur-2xl"/>
    <div aria-hidden className="pointer-events-none absolute bottom-[-12%] left-0 right-0 h-[38%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.95),rgba(244,233,228,.4)_48%,transparent_72%)]"/>

    <header className="relative z-30 flex items-center justify-between px-5 pb-3 pt-5 sm:px-8 lg:px-12 lg:pt-7">
      <Link href="/today" className="text-[13px] font-semibold tracking-[.25em]">GLOW OS</Link>
      <div className="hidden text-[12px] font-medium tracking-[.22em] text-[#4b4340] md:block">TODAY · THE LIVING CENTER</div>
      <div className="flex gap-2">
        {[Search,Bookmark,Bell].map((Icon,i)=><button key={i} aria-label={i===0?'Search':i===1?'Saved':'Notifications'} className="grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-white/50 shadow-sm backdrop-blur-lg"><Icon size={17}/></button>)}
      </div>
    </header>

    <main className="relative z-10 mx-auto grid w-full max-w-[1560px] grid-cols-1 gap-5 px-4 pb-32 sm:px-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,.8fr)_minmax(0,1fr)] lg:gap-6 lg:px-10 xl:grid-cols-[1.08fr_.9fr_1.02fr]">
      <div className="space-y-4">
        <div className="px-2 pt-2 lg:pt-3">
          <h1 className="font-serif text-[31px] leading-tight tracking-[-.02em] sm:text-[36px]">{greeting} ♡</h1>
          <p className="mt-2 font-serif text-[16px] text-[#605652]">{dateLabel}</p>
        </div>

        <Glass className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div><div className="font-serif text-[58px] leading-none sm:text-[72px]">NOW</div><div className="mt-5 font-serif text-[23px] sm:text-[28px]">{primary?.title ?? 'A quiet open block'}</div><p className="mt-2 text-[13px] tracking-wide text-[#59504c]">{primary?'High Focus · Create with intention':'Open space · Choose gently'}</p></div>
            <div className="shrink-0 text-center"><div className="text-[13px] font-medium">{timeLabel}</div><div className="mt-5 grid h-24 w-24 place-items-center rounded-full border-[5px] border-[#d7c5bd] bg-white/45 shadow-[inset_0_0_22px_rgba(255,255,255,.9)]"><div><div className="font-serif text-[38px] leading-none">{focusMinutes}</div><div className="font-serif text-[14px]">min</div></div></div><div className="mt-3 text-[11px] text-[#6e625d]">Time remaining</div></div>
          </div>
          <p className="mt-9 font-serif text-[18px] italic text-[#a17d76]">This is your moment.</p>
        </Glass>

        <div className="space-y-2">
          {scheduleRows.map(([label,time,title,Icon])=><Link key={label} href="/calendar" className="flex items-center gap-4 rounded-[18px] border border-white/70 bg-white/50 px-5 py-4 shadow-[0_8px_26px_rgba(129,104,95,.08)] backdrop-blur-xl transition hover:bg-white/70"><Icon size={22} strokeWidth={1.3} className="text-[#947f77]"/><div className="min-w-0 flex-1"><div className="font-serif text-[15px] tracking-[.08em]">{label}</div><div className="mt-1 text-[11px] text-[#675d59]">{time}</div><div className="truncate font-serif text-[15px]">{title}</div></div><ChevronRight size={18} className="text-[#a88c82]"/></Link>)}
          <Link href="/tomorrow" className="flex items-center gap-4 rounded-[18px] border border-white/70 bg-white/50 px-5 py-4 shadow-[0_8px_26px_rgba(129,104,95,.08)] backdrop-blur-xl transition hover:bg-white/70"><Sun size={22} strokeWidth={1.3} className="text-[#a28573]"/><div className="flex-1"><div className="font-serif text-[15px] tracking-[.08em]">TOMORROW</div><div className="mt-1 text-[11px] text-[#675d59]">Preview</div><div className="font-serif text-[15px]">A good beginning</div></div><ChevronRight size={18} className="text-[#b28f6f]"/></Link>
        </div>
      </div>

      <div className="relative flex min-h-[610px] flex-col items-center justify-center py-6 lg:min-h-[790px] lg:py-0">
        <div aria-hidden className="absolute left-1/2 top-[9%] h-[62%] w-[120%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.98)_0%,rgba(255,218,211,.82)_14%,rgba(216,225,244,.58)_29%,rgba(255,255,255,.16)_54%,transparent_72%)] blur-xl"/>
        <div aria-hidden className="absolute left-1/2 top-[16%] h-[56%] w-[70%] -translate-x-1/2 [background:repeating-conic-gradient(from_0deg,rgba(255,255,255,.9)_0deg,rgba(255,210,198,.58)_1.2deg,transparent_2.5deg,transparent_7deg)] blur-[1px] opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_8%,transparent_68%)]"/>
        <div aria-hidden className="absolute left-1/2 top-[23%] h-[42%] w-[38%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(circle,white_0%,#fff7f3_20%,rgba(249,207,194,.88)_34%,rgba(200,219,240,.5)_49%,transparent_71%)] shadow-[0_0_80px_35px_rgba(255,241,232,.8),0_0_160px_55px_rgba(214,226,244,.45)]"/>
        <div aria-hidden className="absolute left-1/2 top-[39%] h-[88px] w-[88px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_35px_20px_white,0_0_90px_50px_rgba(255,210,195,.85),0_0_150px_80px_rgba(199,221,244,.55)]"/>
        <div aria-hidden className="absolute left-1/2 top-[2%] h-[70%] w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_18px_6px_rgba(255,255,255,.9)]"/>
        <div className="relative mt-auto pb-20 text-center lg:pb-28">
          <div className="font-serif text-[31px] italic text-[#a27e78]">I’m here.</div>
          <div className="mt-1 text-[11px] tracking-[.16em] text-[#655d59]">YOUR LIVING GLOW AURA ♡</div>
        </div>

        <div className="absolute bottom-0 left-1/2 grid w-[105%] -translate-x-1/2 grid-cols-2 gap-3 lg:w-[125%]">
          <Glass className="p-4"><div className="text-[10px] tracking-[.14em]">LEAVE-READY</div><div className="mt-1 text-[13px]">{leaveReady}</div><div className="mt-5 font-serif text-[25px]">3h 32m</div><div className="text-[11px] text-[#6a5e59]">Countdown</div></Glass>
          <Glass className="p-4"><div className="text-[10px] tracking-[.14em]">ONE-TAP REPLAN</div><p className="mt-2 text-[12px] text-[#625752]">Adjust your day in 30 seconds.</p><button onClick={()=>setReplanned(true)} className="mt-4 w-full rounded-[14px] border border-white bg-white/55 px-3 py-3 font-serif text-[14px] shadow-sm">{replanned?'Day softened ✓':'Replan My Day ✧'}</button></Glass>
        </div>
      </div>

      <div className="space-y-3 lg:pt-3">
        <Glass className="p-5"><div className="text-[11px] tracking-[.16em]">WHAT NOW? ♡</div><p className="mt-2 font-serif text-[15px]">What needs your Soft Power?</p><div className="relative mt-4"><select value={whatNow} onChange={e=>setWhatNow(e.target.value)} className="w-full appearance-none rounded-[13px] border border-white bg-white/55 px-4 py-3 pr-10 font-serif text-[15px] outline-none"><option>Start Focused Session</option><option>Open Next Task</option><option>Take 10-Minute Reset</option><option>Replan My Day</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" size={16}/></div></Glass>

        <Glass className="p-5"><div className="flex items-center justify-between"><div className="text-[11px] tracking-[.16em]">ENERGY & CAPACITY</div><div className="text-[9px] text-[#7b6f69]">{sleepLabel}</div></div><div className="mt-4 grid grid-cols-[112px_1fr] items-center gap-4"><div className="grid h-24 w-24 place-items-center rounded-full border-4 border-[#dbc8c0] bg-white/40"><div className="text-center"><div className="font-serif text-[34px] leading-none">{capacity}</div><div className="font-serif text-[12px]">Radiant</div></div></div><div className="space-y-3 border-l border-[#d9cfca] pl-5">{capacityRows.map(([label,value])=><div key={label} className="grid grid-cols-[58px_1fr_34px] items-center gap-2 text-[10px]"><span className="font-serif">{label}</span><div className="h-[5px] overflow-hidden rounded-full bg-[#ddd6d3]"><div className="h-full rounded-full bg-[#d8aaa7]" style={{width:`${value}%`}}/></div><span>{value}%</span></div>)}</div></div></Glass>

        <Glass className="p-5"><div className="flex items-center justify-between"><div className="text-[11px] tracking-[.16em]">TOP 3 PRIORITIES</div><button onClick={()=>setPrioritiesOpen(v=>!v)} className="text-[10px] underline underline-offset-2">{prioritiesOpen?'Close':'Why these?'}</button></div><div className="mt-4 space-y-1.5">{(tasks.length?tasks.slice(0,prioritiesOpen?6:3):[{id:'1',title:'Build your first priority',priority:'today'}]).map((task,i)=><Link key={task.id} href="/tasks" className="grid grid-cols-[24px_1fr_auto] items-center gap-2 rounded-[9px] border border-[#e3d9d5] bg-white/40 px-3 py-2.5"><span className="font-serif">{i+1}</span><span className="truncate font-serif text-[14px]">{task.title}</span><span className="rounded-md bg-[#eee6e3] px-2 py-1 text-[9px] text-[#756864]">{'dueLabel' in task && task.dueLabel ? task.dueLabel : task.priority}</span></Link>)}</div>{prioritiesOpen?<p className="mt-3 text-[10px] leading-4 text-[#766a65]">Glow ranks urgency, due-date pressure and your available capacity while keeping the top three visually quiet.</p>:null}</Glass>

        <div className="grid grid-cols-2 gap-3">
          <Glass className="p-4"><div className="flex items-start justify-between"><div><div className="text-[10px] tracking-[.14em]">APPOINTMENTS</div><div className="text-[10px] text-[#7a6f69]">{events.length} Today</div></div><Link href="/calendar" aria-label="Add appointment" className="grid h-8 w-8 place-items-center rounded-full border border-white bg-white/45"><Plus size={17}/></Link></div><div className="mt-3 space-y-2">{events.slice(0,2).map(e=><Link href="/calendar" key={e.id} className="grid grid-cols-[58px_1fr] gap-2 rounded-[8px] bg-white/40 px-2 py-2 text-[10px]"><span>{e.timeLabel}</span><span className="truncate font-serif text-[12px]">{e.title}</span></Link>)}</div></Glass>
          <Glass className="p-4"><div className="flex items-start justify-between"><div><div className="text-[10px] tracking-[.14em]">ROUTINES DUE NOW</div><div className="text-[10px] text-[#7a6f69]">{routines.length} Today</div></div><Link href="/routines" aria-label="Add routine" className="grid h-8 w-8 place-items-center rounded-full border border-white bg-white/45"><Plus size={17}/></Link></div><div className="mt-3 space-y-2">{routines.slice(0,3).map(r=><Link href="/routines" key={r.id} className="flex items-center justify-between rounded-[8px] bg-white/40 px-2 py-2 font-serif text-[11px]"><span className="truncate">{r.name}</span><span className="text-[9px] text-[#8a7770]">{r.timeOfDay}</span></Link>)}</div></Glass>
        </div>

        <Glass className="p-4"><div className="flex items-center gap-2"><PawPrint size={16}/><div className="font-serif text-[14px]">Saint is with you. ♡</div></div><div className="mt-3 rounded-[12px] bg-white/40 px-4 py-3"><div className="text-[10px] text-[#746963]">Today’s Walk:</div><div className="mt-1 flex items-center justify-between font-serif text-[14px]"><span>Sunset Trail</span><ChevronRight size={16}/></div></div></Glass>

        <div className="px-2 pt-1 text-[10px] leading-4 text-[#665c58]">{glowMessage}</div>
      </div>
    </main>

    <button onClick={()=>setAskOpen(true)} className="fixed bottom-5 left-5 z-50 flex h-14 items-center gap-3 rounded-[18px] border border-white/80 bg-white/60 px-7 font-serif text-[16px] shadow-[0_14px_40px_rgba(111,91,84,.16)] backdrop-blur-xl sm:left-8"><Sparkles size={18} className="text-[#b18c85]"/>Ask Glow</button>

    <nav className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-stretch rounded-[22px] border border-white/80 bg-[rgba(255,250,248,.72)] p-1.5 shadow-[0_15px_50px_rgba(105,87,80,.18)] backdrop-blur-2xl">
      {nav.map(({label,href,icon:Icon})=><Link key={label} href={href} className={`flex min-w-[62px] flex-col items-center gap-1 rounded-[17px] px-3 py-2 text-[10px] transition sm:min-w-[88px] ${label==='Today'?'bg-white/75 shadow-sm':'hover:bg-white/45'}`}><Icon size={19} strokeWidth={1.5}/><span className="font-serif text-[13px]">{label}</span></Link>)}
    </nav>

    {askOpen?<div role="dialog" aria-modal="true" className="fixed inset-0 z-[80] grid place-items-center bg-black/15 p-4 backdrop-blur-sm" onMouseDown={()=>setAskOpen(false)}><Glass className="w-full max-w-lg p-6"><div onMouseDown={e=>e.stopPropagation()}><div className="flex items-center justify-between"><div><div className="text-[10px] tracking-[.16em]">ASK GLOW</div><h2 className="mt-1 font-serif text-[28px]">I’m here.</h2></div><button onClick={()=>setAskOpen(false)} className="rounded-full bg-white/60 px-3 py-1.5 text-sm">Close</button></div><p className="mt-4 text-[13px] leading-6 text-[#655a55]">{glowMessage}</p><div className="mt-5 flex gap-2"><Link href="/brain" className="rounded-[12px] bg-[#463a35] px-4 py-3 text-[12px] text-white">Open Glow Brain</Link><Link href="/focus" className="rounded-[12px] border border-white bg-white/55 px-4 py-3 text-[12px]">Start Focus</Link></div></div></Glass></div>:null}
  </div>;
}

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BellRing, CalendarClock, CheckCircle2, CircleAlert, Clock3, ExternalLink, ListChecks, RefreshCw, Sparkles } from 'lucide-react';

type Reminder={id:string;title:string;notes:string|null;listName:string;dueAt:string|null;completed:boolean;lastSyncedAt:string;domain:string;destinations:string[];intent:string;urgency:string;nextAction:string};

type Props={reminders:Reminder[];connection:{status:string;lastImportedAt:string|null}|null};

const tabs=['Attention','Today','Upcoming','Unscheduled','Completed','Lists'];
const destinationPath:Record<string,string>={reminders:'/reminders',tasks:'/tasks',today:'/today',briefings:'/briefings',calendar:'/calendar',planning:'/planning',food:'/food',finance:'/finance','financial-brain':'/finance/brain',beauty:'/beauty','beauty-lab':'/beauty/lab',hair:'/hair',fitness:'/fitness',wellness:'/wellness',home:'/home',projects:'/projects',goals:'/goals'};

function dueLabel(value:string|null){if(!value)return 'No date';const date=new Date(value);return date.toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});}

export function RemindersRoom({reminders,connection}:Props){
  const [tab,setTab]=useState('Attention');
  const now=new Date();
  const today=now.toDateString();
  const visible=useMemo(()=>reminders.filter(reminder=>{
    if(tab==='Completed')return reminder.completed;
    if(reminder.completed)return false;
    if(tab==='Today')return reminder.dueAt?new Date(reminder.dueAt).toDateString()===today:false;
    if(tab==='Upcoming')return reminder.dueAt?new Date(reminder.dueAt)>now&&new Date(reminder.dueAt).toDateString()!==today:false;
    if(tab==='Unscheduled')return !reminder.dueAt;
    return true;
  }),[reminders,tab,today]);
  const overdue=reminders.filter(r=>!r.completed&&r.dueAt&&new Date(r.dueAt)<now&&new Date(r.dueAt).toDateString()!==today).length;
  const todayCount=reminders.filter(r=>!r.completed&&r.dueAt&&new Date(r.dueAt).toDateString()===today).length;
  const lists=Array.from(new Set(reminders.map(r=>r.listName)));

  return <div className="space-y-5">
    <section className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
      <div className="paper-card relative overflow-hidden p-5 sm:p-7">
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#f0d9dd]/70 blur-3xl"/>
        <div className="relative max-w-2xl"><div className="flex items-center gap-2 text-[#a76c76]"><BellRing size={15}/><p className="text-[8px] font-bold uppercase tracking-[.2em]">Apple Reminders · Attention Tray</p></div><h2 className="glow-display mt-2 text-[31px] leading-[1.05] text-[#443633]">Remember once. Let Glow understand the rest.</h2><p className="mt-3 max-w-xl text-[10px] leading-5 text-[#786861]">Apple Reminders stays your fast capture tool. Glow imports it safely, understands what each reminder is about, then lets that information influence Today, Tasks, Calendar, Food, Beauty, Hair, Finance, Projects, Home, Wellness and Briefings where relevant.</p><div className="mt-5 flex flex-wrap gap-2"><Link href="/connections" className="rounded-full bg-[#5d4548] px-4 py-2 text-[8px] font-semibold text-white">Manage Apple connection</Link><Link href="/today" className="rounded-full border border-[#dfceca] bg-white/65 px-4 py-2 text-[8px] text-[#6e5751]">See what matters now</Link></div></div>
      </div>
      <div className="paper-card p-5"><div className="flex items-center justify-between"><p className="glow-display text-[18px] text-[#4d403c]">Sync health</p><RefreshCw size={14} className="text-[#a7727a]"/></div><div className="mt-4 grid grid-cols-2 gap-2">{[['Status',connection?.status??'Not set up'],['Imported',String(reminders.length)],['Today',String(todayCount)],['Overdue',String(overdue)]].map(([a,b])=><div key={a} className="rounded-[12px] border border-[#eaded8] bg-white/55 p-3"><p className="text-[7px] uppercase tracking-[.14em] text-[#9a8580]">{a}</p><p className="glow-display mt-1 text-[15px] text-[#4e403c]">{b}</p></div>)}</div><p className="mt-4 text-[8px] leading-4 text-[#88736c]">{connection?.lastImportedAt?`Last import ${new Date(connection.lastImportedAt).toLocaleString()}`:'Open Connections to create the secure iPhone Shortcut bridge.'}</p></div>
    </section>

    <div className="flex gap-1.5 overflow-x-auto rounded-[14px] border border-[#e6dad4] bg-white/35 p-1.5">{tabs.map(item=><button type="button" key={item} onClick={()=>setTab(item)} className={`min-w-max rounded-[10px] px-3 py-2 text-[8px] font-semibold ${tab===item?'bg-[#edd2d6] text-[#684b50]':'text-[#7e716c] hover:bg-white/60'}`}>{item}</button>)}</div>

    {tab==='Lists'?<section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{lists.length?lists.map(list=><div key={list} className="paper-card p-4"><ListChecks size={15} className="text-[#aa737c]"/><p className="glow-display mt-3 text-[18px] text-[#4c3f3a]">{list}</p><p className="mt-2 text-[8px] text-[#8a7770]">{reminders.filter(r=>r.listName===list&&!r.completed).length} open · {reminders.filter(r=>r.listName===list&&r.completed).length} completed</p></div>):<Empty/>}</section>:<section className="space-y-2">{visible.length?visible.map(reminder=><article key={reminder.id} className="paper-card p-4 sm:p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-1 text-[7px] font-semibold uppercase tracking-[.12em] ${reminder.urgency==='overdue'?'bg-rose-100 text-rose-800':reminder.urgency==='today'?'bg-amber-100 text-amber-800':reminder.completed?'bg-emerald-100 text-emerald-800':'bg-[#eee8e4] text-[#776762]'}`}>{reminder.urgency}</span><span className="rounded-full bg-[#f2e7e8] px-2 py-1 text-[7px] text-[#8f626a]">{reminder.domain}</span><span className="text-[7px] text-[#a08c84]">{reminder.listName}</span></div><h3 className="glow-display mt-2 text-[20px] text-[#433632]">{reminder.title}</h3>{reminder.notes?<p className="mt-2 text-[9px] leading-4 text-[#75635d]">{reminder.notes}</p>:null}<div className="mt-3 flex items-center gap-2 text-[8px] text-[#8c7770]">{reminder.completed?<CheckCircle2 size={12} className="text-emerald-600"/>:reminder.urgency==='overdue'?<CircleAlert size={12} className="text-rose-600"/>:<Clock3 size={12}/>}<span>{dueLabel(reminder.dueAt)}</span></div></div><div className="w-full rounded-[14px] bg-[#f8efec] p-4 lg:w-[310px]"><div className="flex items-center gap-1.5 text-[#a46e77]"><Sparkles size={12}/><p className="text-[7px] font-bold uppercase tracking-[.15em]">Glow understood</p></div><p className="mt-2 text-[9px] leading-4 text-[#695751]">{reminder.nextAction}</p><div className="mt-3 flex flex-wrap gap-1.5">{reminder.destinations.filter(d=>d!=='reminders').slice(0,4).map(destination=><Link key={destination} href={destinationPath[destination]??'/brain'} className="rounded-full border border-[#e2cfcb] bg-white/70 px-2.5 py-1.5 text-[7px] text-[#76575d]">{destination} ↗</Link>)}</div></div></div></article>):<Empty/>}</section>}

    <section className="grid gap-3 md:grid-cols-3"><Link href="/briefings" className="paper-card p-4"><CalendarClock size={15} className="text-[#a7727a]"/><p className="glow-display mt-3 text-[17px]">Briefings</p><p className="mt-2 text-[8px] leading-4 text-[#817069]">Due and overdue reminders can be surfaced in the morning, evening and weekly review.</p></Link><Link href="/brain" className="paper-card p-4"><Sparkles size={15} className="text-[#8b789e]"/><p className="glow-display mt-3 text-[17px]">Reminder Intelligence</p><p className="mt-2 text-[8px] leading-4 text-[#817069]">Ask Glow what can wait, what belongs on the calendar, or what should become a project action.</p></Link><Link href="/connections" className="paper-card p-4"><ExternalLink size={15} className="text-[#738d93]"/><p className="glow-display mt-3 text-[17px]">iPhone Bridge</p><p className="mt-2 text-[8px] leading-4 text-[#817069]">The Apple source remains import-only. Glow never needs your Apple password or iCloud credentials.</p></Link></section>
  </div>;
}

function Empty(){return <div className="col-span-full rounded-[18px] border border-dashed border-[#ddcfca] bg-white/45 px-5 py-10 text-center"><BellRing className="mx-auto text-[#c59ba2]"/><p className="glow-display mt-3 text-[18px] text-[#5a4944]">Nothing here yet.</p><p className="mt-2 text-[8px] text-[#8b7770]">Sync Apple Reminders from your iPhone or add a reminder through Glow.</p></div>}

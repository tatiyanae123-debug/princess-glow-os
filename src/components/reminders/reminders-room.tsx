'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { BellRing, CalendarDays, CheckCircle2, Flag, ListChecks, RefreshCw, Sparkles } from 'lucide-react';

type Reminder={id:string;title:string;notes:string|null;listName:string;dueAt:string|null;completed:boolean;lastSyncedAt:string;domain:string;destinations:string[];intent:string;urgency:string;nextAction:string};
type Props={reminders:Reminder[];connection:{status:string;lastImportedAt:string|null}|null};

function dueLabel(value:string|null){if(!value)return'No date';return new Date(value).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}
function ReminderRow({reminder}:{reminder:Reminder}){return <div className="flex items-start gap-3 border-b border-[#F4ECE8] py-3 last:border-0"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9727E]"/><div className="min-w-0 flex-1"><p className="line-clamp-1 text-[11.5px] font-medium text-[#3A332E]">{reminder.title}</p><p className="mt-0.5 text-[9.5px] text-[#9A9088]">{reminder.listName} · {dueLabel(reminder.dueAt)}</p>{reminder.notes?<p className="mt-1 line-clamp-2 text-[9.5px] leading-4 text-[#A79D96]">{reminder.notes}</p>:null}</div></div>}

export function RemindersRoom({reminders,connection}:Props){
  const now=useMemo(()=>new Date(),[]);
  const today=now.toDateString();
  const open=reminders.filter(r=>!r.completed);
  const upcoming=open.filter(r=>r.dueAt&&new Date(r.dueAt)>now).slice(0,6);
  const dueToday=open.filter(r=>r.dueAt&&new Date(r.dueAt).toDateString()===today).slice(0,6);
  const completed=reminders.filter(r=>r.completed).slice(0,6);
  const flagged=open.filter(r=>r.urgency==='overdue'||r.urgency==='today').slice(0,6);
  const routine=open.filter(r=>r.domain==='wellness'||r.domain==='home'||r.domain==='beauty'||r.domain==='fitness').slice(0,6);
  const lists=Array.from(new Set(reminders.map(r=>r.listName)));
  const connectionLabel=!connection?'Not set up':connection.status==='connected'?'Connected':connection.status==='ready'?'Ready for Shortcut':'Attention needed';

  return <div className="space-y-5">
    <header><p className="glow-eyebrow text-[#C9727E]">Reminders</p><h1 className="glow-display mt-1 text-[42px] leading-[1.02] tracking-[-.025em] text-[#2B2420] sm:text-[54px] lg:text-[60px]">Reminders</h1><p className="mt-2 text-[13px] text-[#8A8078]">Stay organized. Stay inspired. Remember what matters.</p><p className="mt-2 max-w-2xl text-[10.5px] leading-4 text-[#A79D96]">Apple reminders shown here are read-only imported copies. Complete or edit the original reminder in Apple Reminders, then sync again.</p></header>

    <section className="grid gap-4 xl:grid-cols-3">
      <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center gap-2"><BellRing size={15} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Upcoming</h2></div><div className="mt-3">{upcoming.length?upcoming.map(r=><ReminderRow key={r.id} reminder={r}/>):<p className="py-5 text-[11px] text-[#9A9088]">Nothing upcoming.</p>}</div></div>
      <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><ListChecks size={15} className="text-[#9A7A3D]"/><h2 className="glow-display text-[18px]">Reminder Lists</h2></div><Link href="/connections#apple-reminders" className="text-[10px] text-[#C9727E]">Manage sync</Link></div><div className="mt-4 grid grid-cols-2 gap-2">{lists.length?lists.slice(0,8).map(list=><div key={list} className="rounded-[12px] bg-[#FDF8F6] px-3 py-2.5"><p className="text-[10.5px] font-medium text-[#4A4440]">{list}</p><p className="mt-1 text-[9px] text-[#9A9088]">{open.filter(r=>r.listName===list).length} open</p></div>):<p className="col-span-2 text-[11px] text-[#9A9088]">No lists imported yet.</p>}</div></div>
      <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center gap-2"><CalendarDays size={15} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Due Today</h2></div><div className="mt-3">{dueToday.length?dueToday.map(r=><ReminderRow key={r.id} reminder={r}/>):<p className="py-5 text-[11px] text-[#9A9088]">Nothing due today.</p>}</div></div>
    </section>

    <section className="grid gap-4 xl:grid-cols-3">
      <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#5A6E52]"/><h2 className="glow-display text-[18px]">Completed</h2></div><div className="mt-3">{completed.length?completed.map(r=><div key={r.id} className="flex items-start gap-3 border-b border-[#F4ECE8] py-3 last:border-0"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#5A6E52]"/><div><p className="text-[11.5px] text-[#4A4440]">{r.title}</p><p className="text-[9.5px] text-[#9A9088]">{r.listName}</p></div></div>):<p className="py-5 text-[11px] text-[#9A9088]">No completed reminders imported.</p>}</div></div>
      <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center gap-2"><Flag size={15} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Flagged</h2></div><div className="mt-3">{flagged.length?flagged.map(r=><ReminderRow key={r.id} reminder={r}/>):<p className="py-5 text-[11px] text-[#9A9088]">Nothing needs urgent attention.</p>}</div></div>
      <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center gap-2"><RefreshCw size={15} className="text-[#9A7A3D]"/><h2 className="glow-display text-[18px]">Routine Reminders</h2></div><div className="mt-3">{routine.length?routine.map(r=><ReminderRow key={r.id} reminder={r}/>):<p className="py-5 text-[11px] text-[#9A9088]">No routine reminders imported.</p>}</div></div>
    </section>

    <section className="grid gap-4 lg:grid-cols-3">
      <Link href="/connections#apple-reminders" className="rounded-[18px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center gap-2"><RefreshCw size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[17px]">Sync & Organization</h2></div><p className="mt-3 text-[11px] leading-4 text-[#8A8078]">Apple bridge: {connectionLabel}.</p><p className="mt-1 text-[10px] text-[#9A9088]">{connection?.lastImportedAt?`Last import ${new Date(connection.lastImportedAt).toLocaleString()}`:'Open Connections to set up sync.'}</p></Link>
      <Link href="/calendar" className="rounded-[18px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center gap-2"><CalendarDays size={14} className="text-[#9A7A3D]"/><h2 className="glow-display text-[17px]">Calendar View</h2></div><p className="mt-3 text-[11px] leading-4 text-[#8A8078]">See date-based reminders beside your real schedule and appointments.</p></Link>
      <div className="rounded-[18px] border border-[#F1E7E3] bg-[linear-gradient(145deg,#FFF,#FFF7F5)] p-5"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[17px]">Glow Insight</h2></div><p className="glow-display mt-3 text-[17px] italic leading-6 text-[#4A4440]">Glow currently sees {open.length} open and {reminders.filter(r=>r.completed).length} completed imported reminders.</p></div>
    </section>
  </div>;
}

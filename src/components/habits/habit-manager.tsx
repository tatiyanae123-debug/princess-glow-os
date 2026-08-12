'use client';

import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Check, Flower2, Flame, CalendarDays, Sparkles, Sprout, TreeDeciduous } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { HabitForm } from '@/components/habits/habit-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteHabitAction, logHabitAction } from '@/app/actions/habits';
import { buildHabitInsights, habitContextMessage } from '@/lib/habits/insights';
import type { Habit, HabitLog } from '@/lib/types';

type View = 'garden' | 'today' | 'history' | 'insights';

function growthStage(streak: number): { Icon: typeof Sprout; label: string } {
  if (streak >= 21) return { Icon: TreeDeciduous, label: 'Flourishing' };
  if (streak >= 7) return { Icon: Flower2, label: 'Blooming' };
  if (streak >= 1) return { Icon: Sprout, label: 'Sprouting' };
  return { Icon: Sprout, label: 'Planted' };
}

function todayKey(){return new Date().toISOString().slice(0,10);}

export function HabitManager({ initialHabits, initialLogs }: { initialHabits: Habit[]; initialLogs: HabitLog[] }) {
  const [habits,setHabits]=useState<Habit[]>(initialHabits);
  const [logs,setLogs]=useState<HabitLog[]>(initialLogs);
  const [view,setView]=useState<View>('garden');
  const [dialogHabit,setDialogHabit]=useState<Habit|'new'|null>(null);
  const [deleteTarget,setDeleteTarget]=useState<Habit|null>(null);
  const del=useServerAction((id:string)=>deleteHabitAction(id));
  const log=useServerAction(logHabitAction);
  const insights=useMemo(()=>buildHabitInsights(habits,logs),[habits,logs]);
  const loggedToday=useMemo(()=>new Set(logs.filter((item)=>item.loggedDate===todayKey()&&item.count>0).map((item)=>item.habitId)),[logs]);
  const handleSaved=(habit:Habit)=>{setHabits((current)=>{const exists=current.some((h)=>h.id===habit.id);return exists?current.map((h)=>(h.id===habit.id?habit:h)):[habit,...current];});setDialogHabit(null);};
  const handleDelete=()=>{if(!deleteTarget)return;del.run(deleteTarget.id,()=>{setHabits((current)=>current.filter((h)=>h.id!==deleteTarget.id));setLogs((current)=>current.filter((item)=>item.habitId!==deleteTarget.id));setDeleteTarget(null);});};
  const handleLogToday=(habit:Habit)=>{log.run({habitId:habit.id,loggedDate:todayKey(),count:1},(saved)=>setLogs((current)=>current.some((item)=>item.id===saved.id)?current:[saved,...current]));};

  const completed=habits.filter((habit)=>loggedToday.has(habit.id)).length;
  const percent=habits.length?Math.round((completed/habits.length)*100):0;
  const averageRate=habits.length?Math.round([...insights.values()].reduce((sum,item)=>sum+item.completionRate,0)/habits.length):0;
  const strongest=[...insights.values()].sort((a,b)=>b.currentStreak-a.currentStreak||b.completionRate-a.completionRate)[0];
  const strongestHabit=strongest?habits.find((habit)=>habit.id===strongest.habitId):null;

  return <div className="space-y-4">
    <div className="grid gap-3 md:grid-cols-[1.2fr_.8fr]">
      <Card className="relative overflow-hidden p-5"><Flower2 size={58} strokeWidth={.8} className="absolute right-4 top-2 text-[#83947b]/18"/><p className="glow-eyebrow">Ritual journal</p><p className="glow-display mt-2 text-[23px] text-[#3f493b]">{percent}% of today&apos;s rituals complete</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e7ece3]"><div className="h-full rounded-full bg-[#92a58a]" style={{width:`${percent}%`}}/></div><div className="mt-3 flex flex-wrap gap-3 text-[8px] text-[#74806f]"><span>{completed}/{habits.length} today</span><span>{averageRate}% 28-day average</span>{strongestHabit&&strongest?<span>{strongestHabit.name}: {strongest.currentStreak} day streak</span>:null}</div></Card>
      <Card className="bg-[linear-gradient(145deg,#edf1e8,#f7f1eb)] p-5"><p className="glow-display text-[16px] text-[#45503f]">Add one steady ritual.</p><p className="mt-2 text-[9px] leading-4 text-[#778071]">Make it small enough to repeat and meaningful enough to keep.</p><Button onClick={()=>setDialogHabit('new')} className="mt-4 flex items-center gap-1.5"><Plus size={12}/>Add habit</Button></Card>
    </div>

    <div className="flex flex-wrap gap-2">{([['garden','Garden',Flower2],['today','Today',Check],['history','History',CalendarDays],['insights','Insights',Sparkles]] as const).map(([key,label,Icon])=><Button key={key} type="button" variant={view===key?'primary':'secondary'} onClick={()=>setView(key)} className="flex items-center gap-1.5"><Icon size={12}/>{label}</Button>)}</div>

    {habits.length===0?<Card className="p-6 text-center"><p className="glow-display text-[18px] text-[#45503f]">Your ritual garden is ready.</p><p className="mx-auto mt-2 max-w-md text-[9px] leading-4 text-[#7f8a79]">Add one habit you want Glow OS to help protect. Your streaks, history and insights will grow from real check-ins.</p><Button onClick={()=>setDialogHabit('new')} className="mt-4"><Plus size={12}/>Add first habit</Button></Card>:null}

    {habits.length>0&&view==='garden'?<Card className="overflow-hidden p-6"><div className="flex items-end justify-between gap-4"><div><p className="glow-eyebrow">Personal growth garden</p><p className="glow-display mt-1 text-[21px] text-[#45503f]">Every check-in helps something grow.</p></div><p className="text-[8px] text-[#7b8575]">{completed}/{habits.length} tended today</p></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{habits.map((habit)=>{const insight=insights.get(habit.id)!;const stage=growthStage(insight.currentStreak);const isLogged=loggedToday.has(habit.id);return <div key={habit.id} className="flex flex-col items-center rounded-[18px] border border-[#e3e9dd] bg-[linear-gradient(175deg,#f7faf3,#eef2e6)] p-4 text-center"><stage.Icon size={30} strokeWidth={1.1} className={insight.currentStreak>0?'text-[#7c9271]':'text-[#c3cabc]'}/><p className="mt-3 truncate text-[10px] font-medium text-[#43503f] max-w-full">{habit.name}</p><p className="mt-1 text-[7px] uppercase tracking-[.12em] text-[#8a9684]">{stage.label} · {insight.currentStreak}d streak</p><Button type="button" variant={isLogged?'secondary':'primary'} className="mt-3 flex w-full items-center justify-center gap-1.5 py-1.5 text-[8px]" disabled={isLogged||log.isPending} onClick={()=>handleLogToday(habit)}><Check size={11}/>{isLogged?'Tended today':'Tend today'}</Button></div>;})}</div></Card>:null}

    {habits.length>0&&view==='today'?<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{habits.map((habit,index)=>{const isLogged=loggedToday.has(habit.id);const insight=insights.get(habit.id)!;return <Card key={habit.id} className={`relative overflow-hidden p-4 ${isLogged?'bg-[linear-gradient(145deg,#eef3ea,#fbf7f2)]':''}`}><div className="absolute right-3 top-3 flex gap-1"><button type="button" onClick={()=>setDialogHabit(habit)} aria-label="Edit habit" className="rounded-full p-1.5 text-[#7f8a79] hover:bg-white/60"><Pencil size={11}/></button><button type="button" onClick={()=>setDeleteTarget(habit)} aria-label="Delete habit" className="rounded-full p-1.5 text-[#7f8a79] hover:bg-white/60"><Trash2 size={11}/></button></div><p className="text-[7px] uppercase tracking-[.12em] text-[#8a9684]">Ritual {String(index+1).padStart(2,'0')}</p><p className="glow-display mt-2 pr-16 text-[16px] text-[#43503f]">{habit.name}</p><p className="mt-1 line-clamp-2 min-h-[32px] text-[8px] leading-4 text-[#7b8575]">{habit.description??`${habit.frequency} · target ${habit.targetCount}×`}</p><div className="mt-3 flex items-center gap-3 text-[8px] text-[#71806e]"><span className="flex items-center gap-1"><Flame size={11}/>{insight.currentStreak} day streak</span><span>{insight.completionRate}% / 28d</span></div><div className="mt-4 grid grid-cols-7 gap-1" aria-label={`${habit.name} last seven days`}>{insight.last7.map((done,day)=><span key={day} className={`mx-auto h-3 w-3 rounded-full border border-[#b9c4b3] ${done?'bg-[#9eaa96]':'bg-transparent'}`}/>)}</div><p className="mt-3 min-h-[30px] text-[8px] leading-4 text-[#788274]">{habitContextMessage(insight)}</p><Button type="button" variant={isLogged?'secondary':'primary'} className="mt-3 flex w-full items-center gap-1.5" disabled={isLogged||log.isPending} onClick={()=>handleLogToday(habit)}><Check size={12}/>{isLogged?'Logged today':'Log today'}</Button></Card>;})}</div>:null}

    {habits.length>0&&view==='history'?<Card className="p-5"><div className="flex items-end justify-between gap-4"><div><p className="glow-eyebrow">28-day history</p><p className="glow-display mt-1 text-[20px] text-[#45503f]">Your consistency heatmap</p></div><p className="text-[8px] text-[#7b8575]">Older → today</p></div><div className="mt-5 space-y-5">{habits.map((habit)=>{const insight=insights.get(habit.id)!;return <div key={habit.id}><div className="mb-2 flex items-center justify-between gap-3"><p className="text-[10px] font-medium text-[#4e5a49]">{habit.name}</p><p className="text-[8px] text-[#7b8575]">{insight.completedDays}/28 · best {insight.bestStreak} days</p></div><div className="grid grid-cols-14 gap-1 sm:grid-cols-28">{insight.last28.map((done,index)=><span key={index} title={done?'Completed':'Not completed'} className={`aspect-square min-h-3 rounded-[3px] border border-[#d6ddd1] ${done?'bg-[#97a78f]':'bg-[#f4f1eb]'}`}/>)}</div></div>;})}</div></Card>:null}

    {habits.length>0&&view==='insights'?<div className="grid gap-3 md:grid-cols-2">{habits.map((habit)=>{const insight=insights.get(habit.id)!;return <Card key={habit.id} className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="glow-eyebrow">Contextual insight</p><p className="glow-display mt-1 text-[18px] text-[#45503f]">{habit.name}</p></div><div className="rounded-full bg-[#edf1e8] px-3 py-1 text-[8px] text-[#687563]">{insight.completionRate}%</div></div><p className="mt-4 text-[9px] leading-5 text-[#707c6b]">{habitContextMessage(insight)}</p><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-[#f6f3ed] p-3"><p className="glow-display text-[18px] text-[#4b5847]">{insight.currentStreak}</p><p className="mt-1 text-[7px] uppercase tracking-[.12em] text-[#84907f]">Current streak</p></div><div className="rounded-xl bg-[#f6f3ed] p-3"><p className="glow-display text-[18px] text-[#4b5847]">{insight.bestStreak}</p><p className="mt-1 text-[7px] uppercase tracking-[.12em] text-[#84907f]">Best streak</p></div><div className="rounded-xl bg-[#f6f3ed] p-3"><p className="glow-display text-[18px] text-[#4b5847]">{insight.completedDays}</p><p className="mt-1 text-[7px] uppercase tracking-[.12em] text-[#84907f]">Days / 28</p></div></div></Card>;})}</div>:null}

    {log.error?<Card className="border border-red-200 p-3 text-[9px] text-red-700">{log.error}</Card>:null}
    <Dialog open={dialogHabit!==null} onClose={()=>setDialogHabit(null)} title={dialogHabit==='new'?'Add habit':'Edit habit'}><HabitForm habit={dialogHabit==='new'?null:dialogHabit} onSaved={handleSaved} onCancel={()=>setDialogHabit(null)}/></Dialog>
    <ConfirmDialog open={deleteTarget!==null} title="Delete this habit?" description={deleteTarget?`"${deleteTarget.name}" will be removed from your list.`:undefined} pending={del.isPending} onCancel={()=>setDeleteTarget(null)} onConfirm={handleDelete}/>
  </div>;
}

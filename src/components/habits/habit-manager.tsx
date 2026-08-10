'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, Flower2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { HabitForm } from '@/components/habits/habit-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteHabitAction, logHabitAction } from '@/app/actions/habits';
import type { Habit } from '@/lib/types';

function todayKey(){return new Date().toISOString().slice(0,10);}

export function HabitManager({ initialHabits }: { initialHabits: Habit[] }) {
  const [habits,setHabits]=useState<Habit[]>(initialHabits);
  const [dialogHabit,setDialogHabit]=useState<Habit|'new'|null>(null);
  const [deleteTarget,setDeleteTarget]=useState<Habit|null>(null);
  const [loggedToday,setLoggedToday]=useState<Set<string>>(new Set());
  const del=useServerAction((id:string)=>deleteHabitAction(id));
  const log=useServerAction(logHabitAction);
  const handleSaved=(habit:Habit)=>{setHabits((current)=>{const exists=current.some((h)=>h.id===habit.id);return exists?current.map((h)=>(h.id===habit.id?habit:h)):[habit,...current];});setDialogHabit(null);};
  const handleDelete=()=>{if(!deleteTarget)return;del.run(deleteTarget.id,()=>{setHabits((current)=>current.filter((h)=>h.id!==deleteTarget.id));setDeleteTarget(null);});};
  const handleLogToday=(habit:Habit)=>{log.run({habitId:habit.id,loggedDate:todayKey(),count:1},()=>setLoggedToday((current)=>new Set(current).add(habit.id)));};

  const completed=habits.filter((habit)=>loggedToday.has(habit.id)).length;
  const percent=habits.length?Math.round((completed/habits.length)*100):0;

  return <div className="space-y-4">
    <div className="grid gap-3 md:grid-cols-[1.2fr_.8fr]">
      <Card className="relative overflow-hidden p-5"><Flower2 size={58} strokeWidth={.8} className="absolute right-4 top-2 text-[#83947b]/18"/><p className="glow-eyebrow">Ritual journal</p><p className="glow-display mt-2 text-[23px] text-[#3f493b]">{percent}% of today&apos;s rituals complete</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e7ece3]"><div className="h-full rounded-full bg-[#92a58a]" style={{width:`${percent}%`}}/></div><p className="mt-2 text-[8px] text-[#74806f]">Consistency is a rhythm, not a punishment.</p></Card>
      <Card className="bg-[linear-gradient(145deg,#edf1e8,#f7f1eb)] p-5"><p className="glow-display text-[16px] text-[#45503f]">Add one steady ritual.</p><p className="mt-2 text-[9px] leading-4 text-[#778071]">Make it small enough to repeat and meaningful enough to keep.</p><Button onClick={()=>setDialogHabit('new')} className="mt-4 flex items-center gap-1.5"><Plus size={12}/>Add habit</Button></Card>
    </div>

    {habits.length===0?<Card><p className="py-8 text-center text-[10px] text-[#7f8a79]">No habits yet. Add the first ritual you want Glow OS to help protect.</p></Card>:<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{habits.map((habit,index)=>{const isLogged=loggedToday.has(habit.id);return <Card key={habit.id} className={`relative overflow-hidden p-4 ${isLogged?'bg-[linear-gradient(145deg,#eef3ea,#fbf7f2)]':''}`}><div className="absolute right-3 top-3 flex gap-1"><button type="button" onClick={()=>setDialogHabit(habit)} aria-label="Edit habit" className="rounded-full p-1.5 text-[#7f8a79] hover:bg-white/60"><Pencil size={11}/></button><button type="button" onClick={()=>setDeleteTarget(habit)} aria-label="Delete habit" className="rounded-full p-1.5 text-[#7f8a79] hover:bg-white/60"><Trash2 size={11}/></button></div><p className="text-[7px] uppercase tracking-[.12em] text-[#8a9684]">Ritual {String(index+1).padStart(2,'0')}</p><p className="glow-display mt-2 pr-16 text-[16px] text-[#43503f]">{habit.name}</p><p className="mt-1 line-clamp-2 min-h-[32px] text-[8px] leading-4 text-[#7b8575]">{habit.description??`${habit.frequency} · target ${habit.targetCount}×`}</p><div className="mt-4 grid grid-cols-7 gap-1">{Array.from({length:7}).map((_,day)=><span key={day} className={`mx-auto h-3 w-3 rounded-full border border-[#b9c4b3] ${day<index%7||isLogged?'bg-[#9eaa96]':'bg-transparent'}`}/>)}</div><Button type="button" variant={isLogged?'secondary':'primary'} className="mt-4 flex w-full items-center gap-1.5" disabled={isLogged||log.isPending} onClick={()=>handleLogToday(habit)}><Check size={12}/>{isLogged?'Logged today':'Log today'}</Button></Card>;})}</div>}

    <Dialog open={dialogHabit!==null} onClose={()=>setDialogHabit(null)} title={dialogHabit==='new'?'Add habit':'Edit habit'}><HabitForm habit={dialogHabit==='new'?null:dialogHabit} onSaved={handleSaved} onCancel={()=>setDialogHabit(null)}/></Dialog>
    <ConfirmDialog open={deleteTarget!==null} title="Delete this habit?" description={deleteTarget?`"${deleteTarget.name}" will be removed from your list.`:undefined} pending={del.isPending} onCancel={()=>setDeleteTarget(null)} onConfirm={handleDelete}/>
  </div>;
}

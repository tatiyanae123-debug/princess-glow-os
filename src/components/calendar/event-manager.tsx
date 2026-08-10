'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Sparkles, CalendarDays, Clock3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EventForm } from '@/components/calendar/event-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteCalendarEventAction, convertCalendarEventToTaskAction } from '@/app/actions/calendar-events';
import type { CalendarEvent } from '@/lib/types';

export function EventManager({ initialEvents }: { initialEvents: CalendarEvent[] }) {
  const [events,setEvents]=useState<CalendarEvent[]>(initialEvents);
  const [dialogEvent,setDialogEvent]=useState<CalendarEvent|'new'|null>(null);
  const [deleteTarget,setDeleteTarget]=useState<CalendarEvent|null>(null);
  const del=useServerAction((id:string)=>deleteCalendarEventAction(id));
  const convert=useServerAction(convertCalendarEventToTaskAction);

  function handleSaved(event:CalendarEvent){setEvents((current)=>{const exists=current.some((e)=>e.id===event.id);const next=exists?current.map((e)=>(e.id===event.id?event:e)):[event,...current];return [...next].sort((a,b)=>a.startAt.getTime()-b.startAt.getTime());});setDialogEvent(null);}
  function handleDelete(){if(!deleteTarget)return;del.run(deleteTarget.id,()=>{setEvents((current)=>current.filter((e)=>e.id!==deleteTarget.id));setDeleteTarget(null);});}

  const nextEvent=events[0]??null;
  return <div className="space-y-4">
    <div className="grid gap-3 md:grid-cols-[1.15fr_.85fr]">
      <Card className="relative overflow-hidden p-5"><CalendarDays size={54} strokeWidth={.8} className="absolute right-4 top-3 text-[#8d7894]/18"/><p className="glow-eyebrow">Planner wall</p><p className="glow-display mt-2 text-[23px] text-[#40343f]">{nextEvent?.title ?? 'A spacious week'}</p><p className="mt-2 text-[9px] leading-4 text-[#776b77]">{nextEvent ? `Next: ${nextEvent.startAt.toLocaleString('en',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}` : 'Your calendar is open enough to design around what matters.'}</p></Card>
      <Card className="bg-[linear-gradient(145deg,#ece5ef,#f7f0ed)] p-5"><p className="glow-display text-[16px] text-[#4d414c]">Shape the week.</p><p className="mt-2 text-[9px] leading-4 text-[#81747e]">Add commitments first, then protect the space around them.</p><Button onClick={()=>setDialogEvent('new')} className="mt-4 flex items-center gap-1.5"><Plus size={12}/>Add event</Button></Card>
    </div>

    {events.length===0?<Card><p className="py-8 text-center text-[10px] text-[#8d7d88]">No events yet. Add your first event to start shaping the week.</p></Card>:<Card className="p-0 overflow-hidden"><div className="grid gap-0 md:grid-cols-2 xl:grid-cols-3">{events.map((event,index)=><div key={event.id} className={`relative min-h-[168px] border-b border-r border-[#e9dfe7] p-4 ${index%3===0?'bg-[#f6e8ea]/60':index%3===1?'bg-[#eeeaf4]/55':'bg-[#f5eee8]/65'}`}>
      <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="glow-display truncate text-[15px] text-[#453944]">{event.title}</p><p className="mt-1 flex items-center gap-1 text-[8px] text-[#7d707a]"><Clock3 size={9}/>{event.allDay?event.startAt.toLocaleDateString('en',{month:'short',day:'numeric'}):event.startAt.toLocaleString('en',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</p></div><div className="flex gap-1">{event.editable?<button type="button" onClick={()=>setDialogEvent(event)} aria-label="Edit event" className="rounded-full p-1.5 text-[#8a7884] hover:bg-white/60"><Pencil size={11}/></button>:null}<button type="button" onClick={()=>setDeleteTarget(event)} aria-label="Delete event" className="rounded-full p-1.5 text-[#8a7884] hover:bg-white/60"><Trash2 size={11}/></button></div></div>
      {event.description?<p className="mt-3 line-clamp-2 text-[8px] leading-4 text-[#81757d]">{event.description}</p>:null}
      {event.location?<p className="mt-2 text-[8px] text-[#8f8089]">{event.location}</p>:null}
      <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center gap-2">{event.source==='google_calendar'?<span className="rounded-full bg-white/60 px-2 py-1 text-[7px] text-[#786878]">Google Calendar</span>:null}{event.source==='google_calendar'?<Button type="button" variant="secondary" disabled={convert.isPending} onClick={()=>convert.run({eventId:event.id})}>Convert to task</Button>:null}</div>
    </div>)}</div></Card>}

    <Card className="flex items-center gap-3 bg-[linear-gradient(90deg,#f5e9ed,#f7f1ec)]"><Sparkles size={17} className="text-[#8d7894]"/><div><p className="glow-display text-[13px] text-[#4b3f49]">Build around your commitments.</p><p className="mt-1 text-[8px] text-[#80747d]">Glow can use calendar events as anchors for tasks, routines, workouts and preparation time.</p></div></Card>

    <Dialog open={dialogEvent!==null} onClose={()=>setDialogEvent(null)} title={dialogEvent==='new'?'Add event':'Edit event'}><EventForm event={dialogEvent==='new'?null:dialogEvent} onSaved={handleSaved} onCancel={()=>setDialogEvent(null)}/></Dialog>
    <ConfirmDialog open={deleteTarget!==null} title="Delete this event?" description={deleteTarget?`"${deleteTarget.title}" will be removed.`:undefined} pending={del.isPending} onCancel={()=>setDeleteTarget(null)} onConfirm={handleDelete}/>
  </div>;
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Sparkles, Flower2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BeautyRoutineForm } from '@/components/beauty/beauty-routine-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteBeautyRoutineAction } from '@/app/actions/beauty-routines';
import type { BeautyRoutine } from '@/lib/types';

export function BeautyRoutineManager({ initialRoutines, selectedRoutineId }: { initialRoutines: BeautyRoutine[]; selectedRoutineId?: string }) {
  const [routines,setRoutines]=useState<BeautyRoutine[]>(initialRoutines);
  const [dialogRoutine,setDialogRoutine]=useState<BeautyRoutine|'new'|null>(null);
  const [deleteTarget,setDeleteTarget]=useState<BeautyRoutine|null>(null);
  const handledSelection=useRef<string|null>(null);
  const del=useServerAction((id:string)=>deleteBeautyRoutineAction(id));

  useEffect(()=>{
    if(!selectedRoutineId || handledSelection.current===selectedRoutineId) return;
    const selected=routines.find((routine)=>routine.id===selectedRoutineId);
    if(selected){
      handledSelection.current=selectedRoutineId;
      setDialogRoutine(selected);
    }
  },[selectedRoutineId,routines]);

  const handleSaved=(routine:BeautyRoutine)=>{setRoutines((current)=>{const exists=current.some((r)=>r.id===routine.id);return exists?current.map((r)=>(r.id===routine.id?routine:r)):[routine,...current];});setDialogRoutine(null);};
  const handleDelete=()=>{if(!deleteTarget)return;del.run(deleteTarget.id,()=>{setRoutines((current)=>current.filter((r)=>r.id!==deleteTarget.id));setDeleteTarget(null);});};
  const morning=routines.filter((r)=>r.timeOfDay==='morning').length;
  const evening=routines.filter((r)=>r.timeOfDay==='evening'||r.timeOfDay==='night').length;

  return <div className="space-y-4">
    {selectedRoutineId && !routines.some((routine)=>routine.id===selectedRoutineId) ? <div role="status" className="rounded-[12px] border border-[#F7D1D8] bg-[#F7EEED] px-4 py-3 text-[11px] text-[#7B535C]">That beauty routine is no longer available.</div> : null}
    <div className="grid gap-3 md:grid-cols-[1.3fr_.7fr]">
      <Card className="relative min-h-[190px] overflow-hidden bg-[linear-gradient(135deg,#F7EEED,#FAE6E7)]"><Flower2 size={72} strokeWidth={.7} className="absolute right-4 top-3 text-[#C9727E]/20"/><div className="relative max-w-[60%]"><p className="glow-eyebrow">Luxury vanity</p><h2 className="glow-display mt-2 text-[27px] leading-8 text-[#2B2420]">Care that feels like a ritual.</h2><p className="mt-3 text-[12px] leading-5 text-[#8A8078]">Keep the steps simple enough to use and beautiful enough that you want to return to them.</p></div></Card>
      <Card><p className="glow-display text-[16px] text-[#2B2420]">Routine cabinet</p><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-[12px] bg-[#FAE6E7] p-3 text-center"><p className="glow-display text-[22px] text-[#B15A68]">{morning}</p><p className="mt-1 text-[10px] uppercase tracking-[.08em] text-[#8A8078]">Morning</p></div><div className="rounded-[12px] bg-[#F7EEED] p-3 text-center"><p className="glow-display text-[22px] text-[#7C6B9C]">{evening}</p><p className="mt-1 text-[10px] uppercase tracking-[.08em] text-[#8A8078]">Evening</p></div></div><Button onClick={()=>setDialogRoutine('new')} className="mt-4 flex items-center gap-1.5"><Plus size={12}/>Add step</Button></Card>
    </div>

    {routines.length===0?<Card><p className="py-8 text-center text-[12px] text-[#8A8078]">No beauty routines yet. Add your first ritual step.</p></Card>:<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{routines.map((routine,index)=><Card key={routine.id} className="relative overflow-hidden p-0"><div className={`h-24 ${index%3===0?'bg-[linear-gradient(145deg,#F7D1D8,#FAE6E7)]':index%3===1?'bg-[linear-gradient(145deg,#FAE6E7,#F7EEED)]':'bg-[linear-gradient(145deg,#F7EEED,#F7D1D8)]'}`}><Sparkles size={25} className="ml-auto mr-4 pt-4 text-white/80"/></div><div className="p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-[10px] uppercase tracking-[.08em] text-[#B5ACA5]">Step {String(index+1).padStart(2,'0')}</p><p className="glow-display mt-1 text-[16px] text-[#2B2420]">{routine.name}</p></div><span className="rounded-full bg-[#FAE6E7] px-2.5 py-1 text-[10px] capitalize text-[#B15A68]">{routine.timeOfDay}</span></div>{routine.notes?<p className="mt-2 line-clamp-2 text-[11px] leading-4 text-[#8A8078]">{routine.notes}</p>:null}{routine.products&&routine.products.length>0?<p className="mt-2 text-[10.5px] text-[#B5ACA5]">{routine.products.join(' · ')}</p>:null}<div className="mt-4 flex justify-end gap-1"><button type="button" onClick={()=>setDialogRoutine(routine)} aria-label={`Edit ${routine.name}`} className="rounded-full p-1.5 text-[#8A8078] hover:bg-[#F7EEED]"><Pencil size={11}/></button><button type="button" onClick={()=>setDeleteTarget(routine)} aria-label={`Delete ${routine.name}`} className="rounded-full p-1.5 text-[#8A8078] hover:bg-[#F7EEED]"><Trash2 size={11}/></button></div></div></Card>)}</div>}

    <Dialog open={dialogRoutine!==null} onClose={()=>setDialogRoutine(null)} title={dialogRoutine==='new'?'Add beauty step':'Edit beauty step'}><BeautyRoutineForm routine={dialogRoutine==='new'?null:dialogRoutine} onSaved={handleSaved} onCancel={()=>setDialogRoutine(null)}/></Dialog>
    <ConfirmDialog open={deleteTarget!==null} title="Delete this step?" description={deleteTarget?`"${deleteTarget.name}" will be removed.`:undefined} pending={del.isPending} onCancel={()=>setDeleteTarget(null)} onConfirm={handleDelete}/>
  </div>;
}

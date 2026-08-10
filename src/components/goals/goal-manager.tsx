'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Star, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { GoalForm } from '@/components/goals/goal-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteGoalAction } from '@/app/actions/goals';
import type { Goal } from '@/lib/types';

export function GoalManager({ initialGoals }: { initialGoals: Goal[] }) {
  const [goals,setGoals]=useState<Goal[]>(initialGoals);
  const [dialogGoal,setDialogGoal]=useState<Goal|'new'|null>(null);
  const [deleteTarget,setDeleteTarget]=useState<Goal|null>(null);
  const del=useServerAction((id:string)=>deleteGoalAction(id));
  const handleSaved=(goal:Goal)=>{setGoals((current)=>{const exists=current.some((g)=>g.id===goal.id);return exists?current.map((g)=>(g.id===goal.id?goal:g)):[goal,...current];});setDialogGoal(null);};
  const handleDelete=()=>{if(!deleteTarget)return;del.run(deleteTarget.id,()=>{setGoals((current)=>current.filter((g)=>g.id!==deleteTarget.id));setDeleteTarget(null);});};
  const avg=goals.length?Math.round(goals.reduce((sum,goal)=>sum+goal.progress,0)/goals.length):0;
  const active=goals.filter((g)=>g.status!=='achieved'&&g.status!=='abandoned').length;

  return <div className="space-y-4">
    <div className="grid gap-3 md:grid-cols-[1.25fr_.75fr]"><Card className="relative overflow-hidden bg-[linear-gradient(145deg,#f5e7e5,#efe6dc)] p-5"><Star size={54} strokeWidth={.8} className="absolute right-5 top-3 text-[#aa7279]/18"/><p className="glow-eyebrow">Future-self wall</p><p className="glow-display mt-2 text-[25px] text-[#493936]">Keep the destination visible.</p><p className="mt-2 max-w-xl text-[9px] leading-4 text-[#7b6761]">Goals are not another task list. They are the direction that gives your projects and daily actions meaning.</p></Card><Card className="p-5"><div className="flex justify-between"><div><p className="text-[7px] uppercase tracking-[.12em] text-[#927d75]">Active</p><p className="glow-display mt-1 text-[25px] text-[#4b3d38]">{active}</p></div><div className="text-right"><p className="text-[7px] uppercase tracking-[.12em] text-[#927d75]">Avg. progress</p><p className="glow-display mt-1 text-[25px] text-[#4b3d38]">{avg}%</p></div></div><Button onClick={()=>setDialogGoal('new')} className="mt-4 flex items-center gap-1.5"><Plus size={12}/>Add goal</Button></Card></div>

    {goals.length===0?<Card><p className="py-8 text-center text-[9px] text-[#88756e]">No goals yet. Define one clear direction to begin.</p></Card>:<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{goals.map((goal,index)=><Card key={goal.id} className="relative overflow-hidden p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[7px] uppercase tracking-[.13em] text-[#a0877f]">Journey {String(index+1).padStart(2,'0')}</p><p className="glow-display mt-1 text-[16px] text-[#4b3b37]">{goal.title}</p></div><span className="rounded-full bg-[#f2e1e3] px-2 py-1 text-[7px] text-[#946069]">{goal.status.replace('_',' ')}</span></div>{goal.description?<p className="mt-2 line-clamp-2 min-h-[32px] text-[8px] leading-4 text-[#846f68]">{goal.description}</p>:<div className="min-h-[32px]"/>}<div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 rounded-full bg-[#eee3dc]"><div className="h-1.5 rounded-full bg-[linear-gradient(90deg,#c98a94,#c4a476)]" style={{width:`${goal.progress}%`}}/></div><span className="glow-display text-[12px] text-[#765e58]">{goal.progress}%</span></div><div className="mt-4 flex items-center justify-between"><span className="inline-flex items-center gap-1 text-[7px] text-[#9a8078]">next chapter <ArrowUpRight size={8}/></span><div className="flex gap-1"><button type="button" onClick={()=>setDialogGoal(goal)} aria-label="Edit goal" className="rounded-full p-1.5 text-[#8d7871] hover:bg-[#f4e8e4]"><Pencil size={11}/></button><button type="button" onClick={()=>setDeleteTarget(goal)} aria-label="Delete goal" className="rounded-full p-1.5 text-[#8d7871] hover:bg-[#f4e8e4]"><Trash2 size={11}/></button></div></div></Card>)}</div>}

    <Dialog open={dialogGoal!==null} onClose={()=>setDialogGoal(null)} title={dialogGoal==='new'?'Add goal':'Edit goal'}><GoalForm goal={dialogGoal==='new'?null:dialogGoal} onSaved={handleSaved} onCancel={()=>setDialogGoal(null)}/></Dialog>
    <ConfirmDialog open={deleteTarget!==null} title="Delete this goal?" description={deleteTarget?`"${deleteTarget.title}" will be removed.`:undefined} pending={del.isPending} onCancel={()=>setDeleteTarget(null)} onConfirm={handleDelete}/>
  </div>;
}

'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Star, CheckCircle2, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteTaskAction } from '@/app/actions/tasks';
import type { Task } from '@/lib/types';

export function TaskManager({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks,setTasks]=useState<Task[]>(initialTasks);
  const [dialogTask,setDialogTask]=useState<Task|'new'|null>(null);
  const [deleteTarget,setDeleteTarget]=useState<Task|null>(null);
  const del=useServerAction((id:string)=>deleteTaskAction(id));

  function handleSaved(task:Task){setTasks((current)=>{const exists=current.some((t)=>t.id===task.id);return exists?current.map((t)=>(t.id===task.id?task:t)):[task,...current];});setDialogTask(null);}
  function handleDelete(){if(!deleteTarget)return;del.run(deleteTarget.id,()=>{setTasks((current)=>current.filter((t)=>t.id!==deleteTarget.id));setDeleteTarget(null);});}

  const open=tasks.filter((task)=>task.status!=='done');
  const done=tasks.filter((task)=>task.status==='done');
  const urgent=open.filter((task)=>task.priority==='urgent'||task.priority==='high');

  return <div className="space-y-4">
    <div className="grid gap-3 md:grid-cols-[1.3fr_.7fr]">
      <Card className="relative overflow-hidden p-5"><Star size={42} strokeWidth={1} className="absolute right-5 top-4 text-[#c5848d]/20"/><p className="glow-eyebrow">Execution desk</p><p className="glow-display mt-2 text-[23px] text-[#3b302c]">{urgent[0]?.title ?? open[0]?.title ?? 'Your list is clear'}</p><p className="mt-2 max-w-xl text-[9px] leading-4 text-[#7d6a63]">{urgent.length ? `${urgent.length} high-priority item${urgent.length===1?'':'s'} deserve attention before the rest.` : open.length ? 'Choose one task and make the next action small enough to start.' : 'Use the quiet space for planning, recovery, or something creative.'}</p><div className="mt-4 flex gap-2"><span className="rounded-full bg-[#f2dcde] px-2.5 py-1 text-[8px] text-[#8e5d64]">{open.length} open</span><span className="rounded-full bg-[#e8eee4] px-2.5 py-1 text-[8px] text-[#667361]">{done.length} complete</span></div></Card>
      <Card className="flex flex-col justify-between bg-[linear-gradient(145deg,#f2e3dc,#ead2d4)] p-5"><div><p className="glow-display text-[16px] text-[#4b3b36]">Capture, then continue.</p><p className="mt-2 text-[9px] leading-4 text-[#7c6861]">New tasks should enter quickly without interrupting the rest of your day.</p></div><Button onClick={()=>setDialogTask('new')} className="mt-4 flex items-center gap-1.5 self-start"><Plus size={12}/>Add task</Button></Card>
    </div>

    <Card className="p-0 overflow-hidden">
      <div className="grid grid-cols-[24px_minmax(0,1fr)_auto] border-b border-[#e8dcd4] px-4 py-2 text-[7px] font-semibold uppercase tracking-[.13em] text-[#947f77]"><span/><span>Today&apos;s list</span><span>Priority</span></div>
      {tasks.length===0?<p className="py-10 text-center text-[10px] text-[#8b7770]">No tasks yet. Add your first task to begin.</p>:tasks.map((task,index)=><div key={task.id} className={`grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-2 border-b border-[#eee4de] px-4 py-3 last:border-0 ${index===0&&task.status!=='done'?'bg-[#f9eceb]/70':''}`}>
        {task.status==='done'?<CheckCircle2 size={14} className="text-[#7e9479]"/>:<Circle size={14} className="text-[#c7b5ad]"/>}
        <div className="min-w-0"><p className={`truncate text-[10px] font-medium ${task.status==='done'?'text-[#9c8d87] line-through':'text-[#4f413c]'}`}>{task.title}</p>{task.description?<p className="mt-0.5 truncate text-[8px] text-[#907d75]">{task.description}</p>:null}</div>
        <div className="flex items-center gap-1"><span className={`rounded-full px-2 py-1 text-[7px] ${task.status==='done'?'bg-[#e8eee4] text-[#65705f]':task.priority==='urgent'||task.priority==='high'?'bg-[#f2d9dc] text-[#9d5e68]':'bg-[#f0e9e3] text-[#76655e]'}`}>{task.status==='done'?'done':task.priority}</span><button type="button" onClick={()=>setDialogTask(task)} aria-label="Edit task" className="rounded-full p-1.5 text-[#8d7a73] hover:bg-[#f2e6e1]"><Pencil size={11}/></button><button type="button" onClick={()=>setDeleteTarget(task)} aria-label="Delete task" className="rounded-full p-1.5 text-[#8d7a73] hover:bg-[#f2e6e1]"><Trash2 size={11}/></button></div>
      </div>)}
    </Card>

    <Dialog open={dialogTask!==null} onClose={()=>setDialogTask(null)} title={dialogTask==='new'?'Add task':'Edit task'}><TaskForm task={dialogTask==='new'?null:dialogTask} onSaved={handleSaved} onCancel={()=>setDialogTask(null)}/></Dialog>
    <ConfirmDialog open={deleteTarget!==null} title="Delete this task?" description={deleteTarget?`"${deleteTarget.title}" will be removed from your list.`:undefined} pending={del.isPending} onCancel={()=>setDeleteTarget(null)} onConfirm={handleDelete}/>
  </div>;
}

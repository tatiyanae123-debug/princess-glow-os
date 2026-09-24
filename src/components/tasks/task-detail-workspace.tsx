'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock3, Sparkles } from 'lucide-react';
import { TaskForm } from '@/components/tasks/task-form';
import type { Task } from '@/lib/types';

function dueLabel(value: Date | null | undefined) {
  if (!value) return 'No due date';
  return value.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function TaskDetailWorkspace({ task }: { task: Task }) {
  const router = useRouter();

  return (
    <div className="grid gap-4 md:grid-cols-[1.15fr_.85fr]">
      <section className="editorial-surface p-4 sm:p-5">
        <button type="button" onClick={() => router.back()} className="mb-4 inline-flex items-center gap-1.5 text-[8px] text-[#887a72]">
          <ArrowLeft size={11} /> Back
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="glow-eyebrow">Canonical task</p>
            <h2 className="glow-display mt-2 text-[28px] leading-tight text-[#332c28]">{task.title}</h2>
          </div>
          <span className="rounded-full bg-white/56 px-3 py-1.5 text-[7px] capitalize text-[#776a63]">{task.status.replace('_', ' ')}</span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-[12px] bg-white/42 p-3"><p className="text-[6.5px] uppercase tracking-[.14em] text-[#9b8c84]">Priority</p><p className="mt-1 text-[9px] capitalize text-[#514740]">{task.priority}</p></div>
          <div className="rounded-[12px] bg-white/42 p-3"><p className="text-[6.5px] uppercase tracking-[.14em] text-[#9b8c84]">Due</p><p className="mt-1 text-[9px] text-[#514740]">{dueLabel(task.dueDate)}</p></div>
          <div className="rounded-[12px] bg-white/42 p-3"><p className="text-[6.5px] uppercase tracking-[.14em] text-[#9b8c84]">Source</p><p className="mt-1 truncate text-[9px] text-[#514740]">{task.source || 'Glow'}</p></div>
        </div>
        {task.description ? <p className="mt-4 whitespace-pre-wrap text-[9px] leading-5 text-[#73665f]">{task.description}</p> : <div className="mt-4 rounded-[12px] border border-dashed border-[#ddd1c9] p-3 text-[8px] italic text-[#9b8d84]">No notes are attached to this task.</div>}
      </section>

      <section className="editorial-surface p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2"><Sparkles size={13} className="text-[#8d7ea2]" /><div><p className="glow-eyebrow">Edit task</p><p className="glow-display text-[18px] text-[#443a35]">Change the real object</p></div></div>
        <TaskForm
          task={task}
          onSaved={() => {
            router.refresh();
          }}
          onCancel={() => router.back()}
        />
        <div className="mt-5 grid gap-2 text-[7px] text-[#8e8179]">
          <span className="flex items-center gap-2"><CheckCircle2 size={10}/>Changes persist to the canonical task.</span>
          <span className="flex items-center gap-2"><Clock3 size={10}/>Dashboard and connected projections update from this same object.</span>
        </div>
      </section>
    </div>
  );
}

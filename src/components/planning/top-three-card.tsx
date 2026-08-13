'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { updateTaskAction } from '@/app/actions/tasks';
import type { Task } from '@/lib/types';

const PRIORITY_RANK: Record<Task['priority'], number> = { urgent: 4, high: 3, medium: 2, low: 1 };
const PRIORITIES: Task['priority'][] = ['urgent', 'high', 'medium', 'low'];

function rankTasks(tasks: Task[]) {
  return [...tasks]
    .filter((task) => task.status !== 'done' && task.status !== 'cancelled')
    .sort((a, b) => {
      const rank = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
      if (rank !== 0) return rank;
      const aDue = a.dueDate ? a.dueDate.getTime() : Infinity;
      const bDue = b.dueDate ? b.dueDate.getTime() : Infinity;
      return aDue - bDue;
    });
}

/**
 * "Top Three" has no separate schema — it's derived live from task priority
 * and due date, and editing it means adjusting a task's priority right here,
 * so there's exactly one source of truth for what's most important today.
 */
export function TopThreeCard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [editing, setEditing] = useState(false);
  const update = useServerAction((payload: { id: string; data: { status?: Task['status']; priority?: Task['priority']; completedAt?: Date } }) =>
    updateTaskAction(payload.id, payload.data));
  const ranked = useMemo(() => rankTasks(tasks), [tasks]);
  const topThree = ranked.slice(0, 3);
  const rest = editing ? ranked.slice(3, 9) : [];

  function complete(task: Task) {
    setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, status: 'done', completedAt: new Date() } : item)));
    update.run({ id: task.id, data: { status: 'done', completedAt: new Date() } });
  }

  function setPriority(task: Task, priority: Task['priority']) {
    setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, priority } : item)));
    update.run({ id: task.id, data: { priority } });
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-[#F1E7E3] px-5 py-4">
        <div className="flex items-center gap-2"><Star size={14} className="text-[#9A7A3D]" /><h2 className="glow-display text-[19px] text-[#2B2420]">Top Three</h2></div>
        <button type="button" onClick={() => setEditing((value) => !value)} className="text-[10.5px] font-semibold uppercase tracking-[.08em] text-[#C9727E]">{editing ? 'Done editing' : 'Edit Top Three'}</button>
      </div>
      <div className="divide-y divide-[#F1E7E3]">
        {topThree.length === 0 ? (
          <p className="p-6 text-center text-[12px] text-[#8A8078]">No open tasks yet. Add tasks and the three most important will surface here automatically.</p>
        ) : topThree.map((task, index) => (
          <div key={task.id} className="flex items-center gap-3 px-5 py-4">
            <span className="glow-display text-[20px] text-[#9A7A3D]">{index + 1}</span>
            <button type="button" onClick={() => complete(task)} disabled={update.isPending} aria-label="Complete task" className="text-[#8A8078] disabled:opacity-50"><Circle size={15} className="text-[#D9CFC9]" /></button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-[#2B2420]">{task.title}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[.08em] text-[#B5ACA5]">{task.priority}{task.dueDate ? ` · due ${task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</p>
            </div>
            {editing ? (
              <select value={task.priority} onChange={(event) => setPriority(task, event.target.value as Task['priority'])} className="rounded-md border border-[#F1E7E3] px-2 py-1.5 text-[11px] text-[#4A4440]">
                {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
              </select>
            ) : null}
          </div>
        ))}
      </div>
      {editing && rest.length > 0 ? (
        <div className="border-t border-[#F1E7E3] bg-[#FDF8F6] px-5 py-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-[.08em] text-[#8A8078]">Promote something into the Top Three</p>
          <div className="mt-2 space-y-2">
            {rest.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-[12px] text-[#4A4440]">{task.title}</p>
                <button type="button" onClick={() => setPriority(task, 'urgent')} disabled={update.isPending} className="flex shrink-0 items-center gap-1 rounded-full border border-[#F1E7E3] bg-white px-2.5 py-1.5 text-[10.5px] font-medium text-[#4A4440] hover:bg-[#FBE4E8]"><CheckCircle2 size={9} />Make urgent</button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="border-t border-[#F1E7E3] px-5 py-3"><Link href="/tasks?view=now" className="text-[11px] font-medium text-[#C9727E]">Open Tasks →</Link></div>
    </Card>
  );
}

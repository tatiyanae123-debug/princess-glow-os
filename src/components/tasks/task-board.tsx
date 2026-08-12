'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Focus,
  Inbox as InboxIcon,
  Link2,
  Pencil,
  Play,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteTaskAction, updateTaskAction } from '@/app/actions/tasks';
import type { Task } from '@/lib/types';

type Bucket = 'Do First' | 'Do Today' | 'Can Wait' | 'Inbox' | 'Waiting On' | 'Someday';
const BUCKETS: Bucket[] = ['Do First', 'Do Today', 'Can Wait', 'Inbox', 'Waiting On', 'Someday'];

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}
function endOfToday() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}
function tomorrowAtNine() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date;
}

function bucketFor(task: Task, blocked: boolean): Bucket {
  if (blocked) return 'Waiting On';
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const today = startOfToday();
  const end = endOfToday();
  const overdueOrToday = dueDate ? dueDate <= end : false;
  if (task.priority === 'urgent' || (task.priority === 'high' && overdueOrToday)) return 'Do First';
  if (dueDate && dueDate >= today && dueDate <= end) return 'Do Today';
  if (dueDate && dueDate > end) return 'Can Wait';
  if (task.priority === 'low') return 'Someday';
  return 'Inbox';
}

function priorityTone(priority: Task['priority']) {
  if (priority === 'urgent') return 'bg-[#F6DCDE] text-[#A24450]';
  if (priority === 'high') return 'bg-[#F6E3D6] text-[#9A6A3D]';
  if (priority === 'medium') return 'bg-[#EFEAE0] text-[#7C7260]';
  return 'bg-[#E4EBDD] text-[#5A6E52]';
}

function dueLabel(date: Date | null) {
  if (!date) return null;
  const today = startOfToday();
  const value = new Date(date);
  if (value.toDateString() === today.toDateString()) return 'Today';
  const tomorrow = new Date(today.getTime() + 86400000);
  if (value.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TaskBoard({ initialTasks, blockedTaskIds }: { initialTasks: Task[]; blockedTaskIds: Record<string, string[]> }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogTask, setDialogTask] = useState<Task | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const del = useServerAction((id: string) => deleteTaskAction(id));
  const quickUpdate = useServerAction((payload: { id: string; data: Partial<Pick<Task, 'status' | 'priority' | 'dueDate' | 'completedAt'>> }) => updateTaskAction(payload.id, payload.data));

  function updateTask(task: Task, data: Partial<Pick<Task, 'status' | 'priority' | 'dueDate' | 'completedAt'>>) {
    quickUpdate.run({ id: task.id, data }, (saved) => {
      if (!saved) return;
      setTasks((current) => current.map((item) => (item.id === saved.id ? saved : item)));
    });
  }

  function handleSaved(task: Task) {
    setTasks((current) => {
      const exists = current.some((item) => item.id === task.id);
      return exists ? current.map((item) => (item.id === task.id ? task : item)) : [task, ...current];
    });
    setDialogTask(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setTasks((current) => current.filter((task) => task.id !== deleteTarget.id));
      if (selectedId === deleteTarget.id) setSelectedId(null);
      setDeleteTarget(null);
    });
  }

  const open = useMemo(() => tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled'), [tasks]);

  const grouped = useMemo(() => {
    const map = new Map<Bucket, Task[]>(BUCKETS.map((bucket) => [bucket, []]));
    for (const task of open) {
      const bucket = bucketFor(task, Boolean(blockedTaskIds[task.id]?.length));
      map.get(bucket)!.push(task);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity));
    }
    return map;
  }, [open, blockedTaskIds]);

  const selected = tasks.find((task) => task.id === selectedId) ?? null;
  const selectedBlockers = selected ? blockedTaskIds[selected.id] ?? [] : [];

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="grid gap-4 sm:grid-cols-2">
        {BUCKETS.map((bucket) => {
          const items = grouped.get(bucket) ?? [];
          return (
            <div key={bucket} className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
              <div className="flex items-center justify-between px-1 pb-2">
                <p className="text-[13px] font-medium text-[#2B2420]">{bucket}</p>
                <span className="rounded-full bg-[#F4ECE8] px-2 py-0.5 text-[10px] font-medium text-[#9A9088]">{items.length}</span>
              </div>
              <div className="space-y-1.5">
                {items.map((task) => {
                  const isSelected = task.id === selectedId;
                  const blockers = blockedTaskIds[task.id] ?? [];
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setSelectedId(task.id)}
                      className={`flex w-full items-start gap-2 rounded-[12px] border px-3 py-2.5 text-left transition ${isSelected ? 'border-[#C9727E] bg-[#FBE4E8]/50' : 'border-transparent bg-[#FDFAF8] hover:border-[#F1E7E3]'}`}
                    >
                      <Circle size={13} className="mt-0.5 shrink-0 text-[#C9BFB9]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-medium text-[#3A332E]">{task.title}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5">
                          {dueLabel(task.dueDate) ? <span className="text-[10px] text-[#9A9088]">{dueLabel(task.dueDate)}</span> : null}
                          {blockers.length ? <span className="inline-flex items-center gap-1 text-[10px] text-[#B08B4F]"><Link2 size={9} />{blockers[0]}</span> : null}
                        </span>
                      </span>
                    </button>
                  );
                })}
                <button type="button" onClick={() => setDialogTask('new')} className="flex w-full items-center gap-1.5 rounded-[12px] px-3 py-2 text-[12px] font-medium text-[#C9727E] hover:bg-[#FDFAF8]">
                  <Plus size={13} />Add task
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden xl:block">
        <div className="sticky top-[84px] rounded-[20px] border border-[#F1E7E3] bg-white p-5">
          {!selected ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <InboxIcon size={26} className="text-[#D8CDC8]" />
              <p className="mt-3 text-[13px] font-medium text-[#4A4440]">Select a task</p>
              <p className="mt-1 text-[11.5px] text-[#9A9088]">Its full detail, subtasks, and focus session will open here.</p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <button type="button" onClick={() => updateTask(selected, selected.status === 'done' ? { status: 'pending' } : { status: 'done', completedAt: new Date() })} disabled={quickUpdate.isPending} aria-label={selected.status === 'done' ? 'Reopen task' : 'Complete task'}>
                  {selected.status === 'done' ? <CheckCircle2 size={20} className="text-[#7E9479]" /> : <Circle size={20} className="text-[#D8CDC8]" />}
                </button>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setDialogTask(selected)} aria-label="Edit task" className="rounded-full p-2 text-[#8A8078] hover:bg-[#FDFAF8]"><Pencil size={14} /></button>
                  <button type="button" onClick={() => setDeleteTarget(selected)} aria-label="Delete task" className="rounded-full p-2 text-[#8A8078] hover:bg-[#FDFAF8]"><Trash2 size={14} /></button>
                  <button type="button" onClick={() => setSelectedId(null)} aria-label="Close detail" className="rounded-full p-2 text-[#8A8078] hover:bg-[#FDFAF8]"><X size={14} /></button>
                </div>
              </div>

              <h2 className={`glow-display mt-3 text-[20px] leading-tight text-[#2B2420] ${selected.status === 'done' ? 'line-through opacity-60' : ''}`}>{selected.title}</h2>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${priorityTone(selected.priority)}`}>{selected.priority} priority</span>
                {dueLabel(selected.dueDate) ? <span className="rounded-full bg-[#DDE7EE] px-2.5 py-1 text-[10px] font-medium text-[#4E6B82]">Due {dueLabel(selected.dueDate)}</span> : null}
                <span className="rounded-full bg-[#F1E8E4] px-2.5 py-1 text-[10px] font-medium capitalize text-[#8A5A56]">{selected.status.replace('_', ' ')}</span>
              </div>

              {selected.description ? <p className="mt-4 text-[12.5px] leading-5 text-[#6B6560]">{selected.description}</p> : null}

              {selectedBlockers.length ? (
                <div className="mt-4 rounded-[12px] bg-[#FBF3E4] p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-[#9A7A3D]"><Link2 size={11} />Waiting on</p>
                  <p className="mt-1 text-[11.5px] text-[#8A6E3D]">{selectedBlockers.join(', ')}</p>
                </div>
              ) : null}

              <div className="mt-5 space-y-2">
                <button type="button" onClick={() => updateTask(selected, { status: 'in_progress' })} disabled={quickUpdate.isPending || selected.status === 'in_progress'} className="flex w-full items-center justify-center gap-1.5 rounded-[12px] bg-[#4A4440] px-4 py-2.5 text-[12.5px] font-medium text-white disabled:opacity-50">
                  <Play size={13} />{selected.status === 'in_progress' ? 'In progress' : 'Start now'}
                </button>
                <Link href={`/focus?task=${encodeURIComponent(selected.id)}`} className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#C9727E] px-4 py-2.5 text-[12.5px] font-medium text-white">
                  <Focus size={13} />Start Focus Session
                </Link>
                {selected.status !== 'done' ? (
                  <button type="button" onClick={() => updateTask(selected, { dueDate: tomorrowAtNine() })} disabled={quickUpdate.isPending} className="flex w-full items-center justify-center gap-1.5 rounded-[12px] border border-[#F1E7E3] px-4 py-2.5 text-[12.5px] font-medium text-[#4A4440]">
                    <CalendarClock size={13} />Move to tomorrow
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      {quickUpdate.error ? <p className="text-[11px] text-[#A15F68] xl:col-span-2">{quickUpdate.error}</p> : null}
      {del.error ? <p className="text-[11px] text-[#A15F68] xl:col-span-2">{del.error}</p> : null}

      <Dialog open={dialogTask !== null} onClose={() => setDialogTask(null)} title={dialogTask === 'new' ? 'Add task' : 'Edit task'}>
        <TaskForm task={dialogTask === 'new' ? null : dialogTask} onSaved={handleSaved} onCancel={() => setDialogTask(null)} />
      </Dialog>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this task?"
        description={deleteTarget ? `"${deleteTarget.title}" will be removed from your list.` : undefined}
        pending={del.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

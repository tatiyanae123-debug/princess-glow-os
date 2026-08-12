'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  Focus,
  ListFilter,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Star,
  Trash2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteTaskAction, updateTaskAction } from '@/app/actions/tasks';
import type { Task } from '@/lib/types';

type TaskView = 'now' | 'upcoming' | 'all' | 'done';
type TaskStatus = Task['status'];
type TaskPriority = Task['priority'];

type QuickUpdate = {
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  completedAt?: Date;
};

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

function formatDueDate(date: Date | null) {
  if (!date) return 'Unscheduled';
  const today = startOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const value = new Date(date);
  if (value >= today && value <= endOfToday()) return 'Today';
  if (value >= tomorrow && value < new Date(tomorrow.getTime() + 86_400_000)) return 'Tomorrow';
  return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function estimateMinutes(task: Task) {
  const text = `${task.title} ${task.description ?? ''}`.toLowerCase();
  const explicit = text.match(/(?:^|\s)(\d{1,3})\s*(?:min|mins|minutes|m)(?:\s|$)/);
  if (explicit) return Math.max(5, Math.min(180, Number(explicit[1])));
  if (/email|call|reply|book|order|schedule|confirm/.test(text)) return 10;
  if (/clean|reset|workout|study|write|design|research|plan/.test(text)) return 30;
  return 20;
}

function priorityRank(priority: TaskPriority) {
  return { urgent: 4, high: 3, medium: 2, low: 1 }[priority];
}

const TASK_VIEWS = new Set<TaskView>(['now', 'upcoming', 'all', 'done']);

export function TaskManager({ initialTasks }: { initialTasks: Task[] }) {
  const searchParams = useSearchParams();
  const requestedView = searchParams.get('view');
  const initialView: TaskView = requestedView && TASK_VIEWS.has(requestedView as TaskView) ? (requestedView as TaskView) : 'now';
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [dialogTask, setDialogTask] = useState<Task | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [view, setView] = useState<TaskView>(initialView);
  const del = useServerAction((id: string) => deleteTaskAction(id));
  const quickUpdate = useServerAction((payload: { id: string; data: QuickUpdate }) =>
    updateTaskAction(payload.id, payload.data),
  );

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
      setDeleteTarget(null);
    });
  }

  function updateTask(task: Task, data: QuickUpdate) {
    quickUpdate.run({ id: task.id, data }, (saved) => {
      if (!saved) return;
      setTasks((current) => current.map((item) => (item.id === saved.id ? saved : item)));
    });
  }

  const open = useMemo(() => tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled'), [tasks]);
  const done = useMemo(() => tasks.filter((task) => task.status === 'done'), [tasks]);
  const urgent = useMemo(
    () => open.filter((task) => task.priority === 'urgent' || task.priority === 'high'),
    [open],
  );

  const visibleTasks = useMemo(() => {
    const now = new Date();
    const todayEnd = endOfToday();
    const sorted = [...tasks].sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (b.status === 'done' && a.status !== 'done') return -1;
      const priority = priorityRank(b.priority) - priorityRank(a.priority);
      if (priority !== 0) return priority;
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return aDue - bDue;
    });

    if (view === 'done') return sorted.filter((task) => task.status === 'done');
    if (view === 'all') return sorted;
    if (view === 'upcoming') {
      return sorted.filter((task) => task.status !== 'done' && task.dueDate && new Date(task.dueDate) > todayEnd);
    }
    return sorted.filter((task) => {
      if (task.status === 'done' || task.status === 'cancelled') return false;
      if (!task.dueDate) return task.priority === 'urgent' || task.priority === 'high' || task.status === 'in_progress';
      return new Date(task.dueDate) <= todayEnd || new Date(task.dueDate) < now;
    });
  }, [tasks, view]);

  const focusTask = [...open].sort((a, b) => {
    const statusBoost = Number(b.status === 'in_progress') - Number(a.status === 'in_progress');
    if (statusBoost !== 0) return statusBoost;
    const priority = priorityRank(b.priority) - priorityRank(a.priority);
    if (priority !== 0) return priority;
    const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    return aDue - bDue;
  })[0];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1.3fr_.7fr]">
        <Card className="relative overflow-hidden p-5">
          <Star size={42} strokeWidth={1} className="absolute right-5 top-4 text-[#c5848d]/20" />
          <p className="glow-eyebrow">Execution desk</p>
          <p className="glow-display mt-2 text-[23px] text-[#3b302c]">
            {focusTask?.title ?? 'Your list is clear'}
          </p>
          <p className="mt-2 max-w-xl text-[9px] leading-4 text-[#7d6a63]">
            {urgent.length
              ? `${urgent.length} high-priority item${urgent.length === 1 ? '' : 's'} deserve attention before the rest.`
              : open.length
                ? 'Choose one task and make the next action small enough to start.'
                : 'Use the quiet space for planning, recovery, or something creative.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#f2dcde] px-2.5 py-1 text-[8px] text-[#8e5d64]">{open.length} open</span>
            <span className="rounded-full bg-[#e8eee4] px-2.5 py-1 text-[8px] text-[#667361]">{done.length} complete</span>
            {focusTask ? (
              <span className="rounded-full bg-[#eee7f2] px-2.5 py-1 text-[8px] text-[#6d5d77]">
                ~{estimateMinutes(focusTask)} min suggested effort
              </span>
            ) : null}
          </div>
          {focusTask ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={() => updateTask(focusTask, { status: 'in_progress' })}
                disabled={quickUpdate.isPending}
                className="flex items-center gap-1.5"
              >
                <Play size={11} /> Start now
              </Button>
              <Link
                href={`/focus?task=${encodeURIComponent(focusTask.id)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#d8c7c0] px-3 py-2 text-[8px] font-semibold uppercase tracking-[.08em] text-[#6e5c55] hover:bg-[#f7efeb]"
              >
                <Focus size={11} /> Focus session
              </Link>
            </div>
          ) : null}
        </Card>

        <Card className="flex flex-col justify-between bg-[linear-gradient(145deg,#f2e3dc,#ead2d4)] p-5">
          <div>
            <p className="glow-display text-[16px] text-[#4b3b36]">Capture, then continue.</p>
            <p className="mt-2 text-[9px] leading-4 text-[#7c6861]">New tasks should enter quickly without interrupting the rest of your day.</p>
          </div>
          <Button onClick={() => setDialogTask('new')} className="mt-4 flex items-center gap-1.5 self-start">
            <Plus size={12} /> Add task
          </Button>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8dcd4] px-4 py-3">
          <div className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[.12em] text-[#7b6861]">
            <ListFilter size={12} /> Views
          </div>
          <div className="flex flex-wrap gap-1.5">
            {([
              ['now', 'Now'],
              ['upcoming', 'Upcoming'],
              ['all', 'All'],
              ['done', 'Done'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                className={`rounded-full px-2.5 py-1 text-[8px] transition ${
                  view === value ? 'bg-[#4f403a] text-white' : 'bg-[#f3ebe6] text-[#77645d] hover:bg-[#eadfd8]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[24px_minmax(0,1fr)_auto] border-b border-[#e8dcd4] px-4 py-2 text-[7px] font-semibold uppercase tracking-[.13em] text-[#947f77]">
          <span />
          <span>{view === 'now' ? 'Ready to execute' : view === 'upcoming' ? 'Coming next' : view === 'done' ? 'Completed' : 'Task library'}</span>
          <span>Actions</span>
        </div>

        {visibleTasks.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-[10px] font-medium text-[#685750]">Nothing is waiting in this view.</p>
            <p className="mt-1 text-[8px] text-[#907d75]">Add a task, switch views, or use the space for focused work.</p>
            <Button onClick={() => setDialogTask('new')} className="mt-4 inline-flex items-center gap-1.5">
              <Plus size={11} /> Add task
            </Button>
          </div>
        ) : (
          visibleTasks.map((task, index) => {
            const isDone = task.status === 'done';
            const estimate = estimateMinutes(task);
            return (
              <div
                key={task.id}
                className={`grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-2 border-b border-[#eee4de] px-4 py-3 last:border-0 ${
                  index === 0 && !isDone ? 'bg-[#f9eceb]/70' : ''
                }`}
              >
                <button
                  type="button"
                  aria-label={isDone ? 'Reopen task' : 'Complete task'}
                  disabled={quickUpdate.isPending}
                  onClick={() =>
                    updateTask(task, isDone ? { status: 'pending' } : { status: 'done', completedAt: new Date() })
                  }
                  className="text-[#8a746c] disabled:opacity-50"
                >
                  {isDone ? <CheckCircle2 size={14} className="text-[#7e9479]" /> : <Circle size={14} className="text-[#c7b5ad]" />}
                </button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className={`truncate text-[10px] font-medium ${isDone ? 'text-[#9c8d87] line-through' : 'text-[#4f413c]'}`}>{task.title}</p>
                    {task.status === 'in_progress' ? (
                      <span className="rounded-full bg-[#eee7f2] px-1.5 py-0.5 text-[6px] uppercase tracking-[.08em] text-[#675872]">in focus</span>
                    ) : null}
                  </div>
                  {task.description ? <p className="mt-0.5 truncate text-[8px] text-[#907d75]">{task.description}</p> : null}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[7px] text-[#8f7b73]">
                    <span className="inline-flex items-center gap-1"><CalendarClock size={9} /> {formatDueDate(task.dueDate)}</span>
                    <span className="inline-flex items-center gap-1"><Clock3 size={9} /> ~{estimate} min</span>
                    {task.source ? <span>{task.source.replaceAll('_', ' ')}</span> : null}
                  </div>
                </div>

                <div className="flex max-w-[210px] flex-wrap items-center justify-end gap-1">
                  <span className={`rounded-full px-2 py-1 text-[7px] ${
                    isDone
                      ? 'bg-[#e8eee4] text-[#65705f]'
                      : task.priority === 'urgent' || task.priority === 'high'
                        ? 'bg-[#f2d9dc] text-[#9d5e68]'
                        : 'bg-[#f0e9e3] text-[#76655e]'
                  }`}>{isDone ? 'done' : task.priority}</span>

                  {!isDone ? (
                    <button
                      type="button"
                      onClick={() => updateTask(task, { status: 'in_progress' })}
                      disabled={quickUpdate.isPending}
                      aria-label="Start task"
                      title="Start"
                      className="rounded-full p-1.5 text-[#8d7a73] hover:bg-[#f2e6e1] disabled:opacity-50"
                    ><Play size={11} /></button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateTask(task, { status: 'pending' })}
                      disabled={quickUpdate.isPending}
                      aria-label="Reopen task"
                      title="Reopen"
                      className="rounded-full p-1.5 text-[#8d7a73] hover:bg-[#f2e6e1] disabled:opacity-50"
                    ><RotateCcw size={11} /></button>
                  )}

                  {!isDone ? (
                    <button
                      type="button"
                      onClick={() => updateTask(task, { dueDate: tomorrowAtNine(), status: 'pending' })}
                      disabled={quickUpdate.isPending}
                      aria-label="Move task to tomorrow"
                      title="Move to tomorrow"
                      className="rounded-full p-1.5 text-[#8d7a73] hover:bg-[#f2e6e1] disabled:opacity-50"
                    ><CalendarClock size={11} /></button>
                  ) : null}

                  {!isDone ? (
                    <Link
                      href={`/focus?task=${encodeURIComponent(task.id)}`}
                      aria-label="Open focus session"
                      title="Focus"
                      className="rounded-full p-1.5 text-[#8d7a73] hover:bg-[#f2e6e1]"
                    ><Focus size={11} /></Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setDialogTask(task)}
                    aria-label="Edit task"
                    title="Edit"
                    className="rounded-full p-1.5 text-[#8d7a73] hover:bg-[#f2e6e1]"
                  ><Pencil size={11} /></button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(task)}
                    aria-label="Delete task"
                    title="Delete"
                    className="rounded-full p-1.5 text-[#8d7a73] hover:bg-[#f2e6e1]"
                  ><Trash2 size={11} /></button>
                </div>
              </div>
            );
          })
        )}
      </Card>

      {quickUpdate.error ? <p className="text-[9px] text-[#a15f68]">{quickUpdate.error}</p> : null}
      {del.error ? <p className="text-[9px] text-[#a15f68]">{del.error}</p> : null}

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

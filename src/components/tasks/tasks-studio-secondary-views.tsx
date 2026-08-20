'use client';

import { Columns3 } from 'lucide-react';
import type { Task } from '@/lib/types';
import { estimateTaskMinutes, sameTaskDay, TASK_PRIORITY_SCORE } from '@/components/tasks/tasks-studio-logic';

type Props = {
  view: 'Week' | 'Kanban' | 'Projects';
  tasks: Task[];
  openTasks: Task[];
  inbox: Task[];
  waiting: Task[];
  blockedTaskIds: Record<string, string[]>;
  now: Date;
  onOpenTask: (task: Task) => void;
  onNotice: (message: string) => void;
  onRebalance: () => void;
};

function group(task: Task) {
  const text = `${task.title} ${task.description ?? ''}`.toLowerCase();
  if (/glow|website|page|app|design/.test(text)) return 'Glow OS';
  if (/interview|job|career|resume|application|work/.test(text)) return 'Career';
  if (/beauty|hair|makeup|skin|shampoo/.test(text)) return 'Beauty';
  if (/grocery|meal|food|cook/.test(text)) return 'Food';
  if (/clean|laundry|closet|room|home/.test(text)) return 'Home';
  if (/workout|gym|fitness|run/.test(text)) return 'Fitness';
  return 'Life Admin';
}

function MiniTask({ task, onOpen }: { task: Task; onOpen: (task: Task) => void }) {
  return <button type="button" onClick={() => onOpen(task)} className="block w-full rounded-[16px] border border-[#ebe5dc] bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"><p className="break-words text-xs font-medium text-[#423c37]">{task.title}</p><p className="mt-1 text-[10px] text-[#91887f]">~{estimateTaskMinutes(task)}m estimate</p></button>;
}

export function TasksStudioSecondaryViews({ view, tasks, openTasks, inbox, waiting, blockedTaskIds, now, onOpenTask, onNotice, onRebalance }: Props) {
  if (view === 'Week') {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() + (d.getDay() === 0 ? -6 : 1 - d.getDay()) + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });
    const loads = days.map(day => openTasks.filter(task => task.dueDate && sameTaskDay(task.dueDate, day)).reduce((sum, task) => sum + estimateTaskMinutes(task), 0));
    const maxLoad = Math.max(...loads, 1);
    return <section className="rounded-[30px] border border-[#e9e3da] bg-white p-5 sm:p-7"><p className="text-[10px] uppercase tracking-[.14em] text-[#978e85]">Weekly workload map</p><div className="mt-5 grid gap-3 sm:grid-cols-7">{days.map((day, i) => <button key={day.toISOString()} type="button" onClick={() => onNotice(`${day.toLocaleDateString('en-US', { weekday: 'long' })}: ~${loads[i]} estimated task minutes.`)} className="rounded-[18px] bg-[#faf8f4] p-4 text-left"><p className="text-[10px] uppercase text-[#948b82]">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p><p className="mt-1 font-serif text-xl">{loads[i]}m</p><div className="mt-4 flex h-20 items-end rounded-full bg-[#eee8e1] p-1"><div className="w-full rounded-full bg-[#b0a79e]" style={{ height: `${Math.max(8, loads[i] / maxLoad * 100)}%` }} /></div></button>)}</div><p className="mt-4 text-[10px] text-[#91887f]">Workload uses Glow duration estimates for dated tasks only.</p><button type="button" onClick={onRebalance} className="mt-4 rounded-full bg-[#3e3934] px-4 py-2.5 text-xs text-white">Rebalance Tasks</button></section>;
  }

  if (view === 'Kanban') {
    const columns: Array<[string, Task[]]> = [
      ['Inbox', inbox],
      ['Ready', openTasks.filter(task => task.status === 'pending' && !blockedTaskIds[task.id]?.length && !inbox.some(item => item.id === task.id)).slice(0, 8)],
      ['Doing', openTasks.filter(task => task.status === 'in_progress')],
      ['Waiting', waiting],
      ['Done', tasks.filter(task => task.status === 'done').slice(0, 8)],
    ];
    return <section className="overflow-x-auto rounded-[30px] border border-[#e9e3da] bg-white p-5"><div className="grid min-w-[920px] grid-cols-5 gap-4">{columns.map(([name, items]) => <div key={name} className="rounded-[20px] bg-[#faf8f4] p-3"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#958c84]">{name}</p><div className="mt-3 space-y-2">{items.map(task => <MiniTask key={task.id} task={task} onOpen={onOpenTask} />)}{!items.length ? <p className="rounded-[14px] bg-white p-3 text-[10px] text-[#948b83]">Empty</p> : null}</div></div>)}</div><p className="mt-4 text-[10px] text-[#91887f]">Board reflects real states. Touch drag-and-drop stays off until accidental status writes can be prevented reliably on iPad and iPhone.</p></section>;
  }

  const groups = new Map<string, Task[]>();
  openTasks.forEach(task => groups.set(group(task), [...(groups.get(group(task)) ?? []), task]));
  const entries = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  return <section className="rounded-[30px] border border-[#e9e3da] bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.14em] text-[#978e85]">Larger context</p><h2 className="mt-1 font-serif text-3xl">Project-like groups</h2></div><Columns3 size={18} /></div><p className="mt-2 text-xs text-[#8b827a]">These groups are inferred from wording. The current task table does not yet store a native project relationship.</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{entries.map(([name, items]) => { const next = [...items].sort((a, b) => TASK_PRIORITY_SCORE[b.priority] - TASK_PRIORITY_SCORE[a.priority])[0]; return <div key={name} className="rounded-[22px] border border-[#ebe5dc] bg-[#fcfbf7] p-5"><p className="font-serif text-2xl">{name}</p><p className="mt-1 break-words text-xs text-[#91887f]">{items.length} active · next: {next?.title}</p><div className="mt-4 space-y-2">{items.slice(0, 3).map(task => <MiniTask key={task.id} task={task} onOpen={onOpenTask} />)}</div></div>; })}</div>{!entries.length ? <p className="mt-5 text-xs text-[#91887f]">No active task groups yet.</p> : null}</section>;
}

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Check, Clock3, MoreHorizontal, Paperclip, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteTaskAction, updateTaskAction } from '@/app/actions/tasks';
import type { Task } from '@/lib/types';

const tabs = ['Tasks', 'Planner', 'Inbox', 'Waiting On', 'Someday', 'Completed'] as const;
type Tab = typeof tabs[number];

function sameDay(date: Date | null, compare = new Date()) {
  return !!date && date.getFullYear() === compare.getFullYear() && date.getMonth() === compare.getMonth() && date.getDate() === compare.getDate();
}

function taskTime(task: Task) {
  if (!task.dueDate) return '';
  return task.dueDate.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
}

export function TaskManager({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<Tab>('Tasks');
  const [dialogTask, setDialogTask] = useState<Task | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const del = useServerAction((id: string) => deleteTaskAction(id));
  const update = useServerAction((input: { id: string; status: Task['status'] }) => updateTaskAction(input.id, { status: input.status }));

  const groups = useMemo(() => {
    const open = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled');
    const matches = (t: Task, term: string) => `${t.title} ${t.description || ''}`.toLowerCase().includes(term);
    return {
      first: open.filter(t => t.priority === 'urgent' || t.priority === 'high'),
      today: open.filter(t => sameDay(t.dueDate) && t.priority !== 'urgent' && t.priority !== 'high'),
      wait: open.filter(t => !sameDay(t.dueDate) && (t.priority === 'low' || t.priority === 'medium')).slice(0, 7),
      inbox: open.filter(t => matches(t, 'inbox') || (!t.dueDate && t.priority === 'medium')).slice(0, 5),
      waiting: open.filter(t => matches(t, 'waiting') || matches(t, 'follow up')).slice(0, 5),
      someday: open.filter(t => matches(t, 'someday') || (!t.dueDate && t.priority === 'low')).slice(0, 5),
    };
  }, [tasks]);
  const done = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const today = tasks.filter(t => sameDay(t.dueDate));

  function handleSaved(task: Task) {
    setTasks(current => current.some(t => t.id === task.id) ? current.map(t => t.id === task.id ? task : t) : [task, ...current]);
    setDialogTask(null);
  }
  function handleDelete() {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => { setTasks(current => current.filter(t => t.id !== deleteTarget.id)); setDeleteTarget(null); });
  }
  function toggle(task: Task) {
    const status = task.status === 'done' ? 'pending' : 'done';
    update.run({ id: task.id, status }, data => setTasks(current => current.map(t => t.id === task.id ? data as Task : t)));
  }

  const Paper = ({ title, tasks: items, kind = 'sheet' }: { title: string; tasks: Task[]; kind?: 'sheet' | 'tray' }) => (
    <article className={`planner-paper ${kind}`}>
      <h2>{title}</h2>
      <div className="paper-lines">
        {items.map(task => <div className="paper-task" key={task.id}>
          <button type="button" className={task.status === 'done' ? 'checked' : ''} onClick={() => toggle(task)} aria-label={`${task.status === 'done' ? 'Reopen' : 'Complete'} ${task.title}`}><Check /></button>
          <span onDoubleClick={() => setDialogTask(task)}>{task.title}</span><time>{taskTime(task)}</time>
          <button type="button" className="task-edit" onClick={() => setDialogTask(task)} aria-label={`Edit ${task.title}`}><Pencil /></button>
          <button type="button" className="task-edit" onClick={() => setDeleteTarget(task)} aria-label={`Delete ${task.title}`}><Trash2 /></button>
        </div>)}
        {!items.length && <p className="paper-empty">A clear space for what comes next.</p>}
      </div>
      <button type="button" className="paper-add" onClick={() => setDialogTask('new')}><Plus /> Add {kind === 'tray' ? 'item' : 'task'}</button>
    </article>
  );

  return <div className="editorial-page tasks-page">
    <header className="tasks-heading"><div><h1>Tasks &amp; Planner</h1><p>your life, organized beautifully. ♕</p></div><div className="tasks-tools"><button aria-label="Search"><Search /></button><button aria-label="Filter"><SlidersHorizontal /></button><button aria-label="More options"><MoreHorizontal /></button></div></header>
    <nav className="planner-tabs" aria-label="Task views">{tabs.map(tab => <button type="button" className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)} key={tab}>{tab}</button>)}</nav>
    <div className="tasks-layout">
      <div className="planner-column">
        <section className="planner-desk">
          <div className="desk-clip"><Paperclip /></div><div className="desk-pin" /><div className="desk-tape" /><div className="desk-pen" />
          <div className="paper-grid top"><Paper title="DO FIRST ★" tasks={groups.first} /><Paper title="DO TODAY ☀" tasks={groups.today} /><Paper title="CAN WAIT ☾" tasks={groups.wait} /></div>
          <div className="paper-grid bottom"><Paper title="▱ INBOX" tasks={groups.inbox} kind="tray" /><Paper title="⌛ WAITING ON" tasks={groups.waiting} kind="tray" /><Paper title="⌂ SOMEDAY" tasks={groups.someday} kind="tray" /></div>
        </section>
        <section className="intelligence-strip task-intelligence"><b><span>AI</span> TODAY’S INTELLIGENCE</b><p>{today.length ? `You have ${today.length} task${today.length === 1 ? '' : 's'} scheduled today. Review the plan before committing your open calendar time.` : 'You have no dated tasks today. Use the open space intentionally.'}</p><Link href="/planning">Fix My Day ✨</Link><Link className="secondary" href="/calendar">Review Calendar</Link></section>
      </div>
      <aside className="task-rail">
        <section><h2>TODAY OVERVIEW</h2><h3>{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>{today.slice(0, 6).map(t => <p className="timeline" key={t.id}><time>{taskTime(t) || 'Anytime'}</time><i />{t.title}</p>)}{!today.length && <small>No scheduled tasks today.</small>}</section>
        <section><h2>TASK PROGRESS</h2><div className="progress-layout"><div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}><b>{done}<small>of {tasks.length}</small></b></div><div><p><i className="green" />Completed <b>{done}</b></p><p><i />In Progress <b>{tasks.filter(t => t.status === 'in_progress').length}</b></p><p><i className="tan" />Remaining <b>{tasks.filter(t => t.status === 'pending').length}</b></p></div></div></section>
        <section className="focus-card"><h2>FOCUS TIMER</h2><div><Clock3 /><strong>25 min</strong></div><p>{groups.first[0]?.title || groups.today[0]?.title || 'Choose a focus task'}</p><Link href="/today">Start Focus</Link></section>
        <section className="affirmation"><span /><h2>DAILY AFFIRMATION</h2><p>Discipline today,<br />freedom tomorrow.</p><b>♡</b></section>
      </aside>
    </div>
    <Dialog open={dialogTask !== null} onClose={() => setDialogTask(null)} title={dialogTask === 'new' ? 'Add task' : 'Edit task'}><TaskForm task={dialogTask === 'new' ? null : dialogTask} onSaved={handleSaved} onCancel={() => setDialogTask(null)} /></Dialog>
    <ConfirmDialog open={deleteTarget !== null} title="Delete this task?" description={deleteTarget ? `“${deleteTarget.title}” will be removed from your planner.` : undefined} pending={del.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
  </div>;
}

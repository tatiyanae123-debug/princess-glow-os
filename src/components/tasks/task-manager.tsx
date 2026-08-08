'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteTaskAction } from '@/app/actions/tasks';
import type { Task } from '@/lib/types';

export function TaskManager({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [dialogTask, setDialogTask] = useState<Task | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const del = useServerAction((id: string) => deleteTaskAction(id));

  function handleSaved(task: Task) {
    setTasks((current) => {
      const exists = current.some((t) => t.id === task.id);
      return exists ? current.map((t) => (t.id === task.id ? task : t)) : [task, ...current];
    });
    setDialogTask(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setTasks((current) => current.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogTask('new')} className="flex items-center gap-1.5">
          <Plus size={14} /> Add task
        </Button>
      </div>
      <Card className="space-y-3">
        {tasks.length === 0 ? (
          <p className="py-4 text-center text-sm" style={{ color: 'var(--glow-text-muted)' }}>
            No tasks yet. Add your first task to get started.
          </p>
        ) : (
          tasks.map((task) => {
            const isAppleReminder = task.source === 'apple_reminders';
            return (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-[20px] border px-4 py-3"
                style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium" style={{ color: 'var(--glow-text)' }}>{task.title}</p>
                    {isAppleReminder && <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' }}>Apple Reminders</span>}
                  </div>
                  {task.description && <p className="truncate text-sm" style={{ color: 'var(--glow-text-muted)' }}>{task.description}</p>}
                  {isAppleReminder && task.sourceListName && <p className="text-xs" style={{ color: 'var(--glow-text-muted)' }}>List: {task.sourceListName}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-sm ${task.status === 'done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : task.priority === 'urgent' || task.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                    {task.status === 'done' ? 'Done' : task.priority}
                  </span>
                  {!isAppleReminder && (
                    <>
                      <button type="button" onClick={() => setDialogTask(task)} aria-label="Edit task" className="rounded-full p-2 transition hover:opacity-70" style={{ color: 'var(--glow-text-muted)' }}><Pencil size={14} /></button>
                      <button type="button" onClick={() => setDeleteTarget(task)} aria-label="Delete task" className="rounded-full p-2 transition hover:opacity-70" style={{ color: 'var(--glow-text-muted)' }}><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Card>

      <Dialog open={dialogTask !== null} onClose={() => setDialogTask(null)} title={dialogTask === 'new' ? 'Add task' : 'Edit task'}>
        <TaskForm task={dialogTask === 'new' ? null : dialogTask} onSaved={handleSaved} onCancel={() => setDialogTask(null)} />
      </Dialog>

      <ConfirmDialog open={deleteTarget !== null} title="Delete this task?" description={deleteTarget ? `"${deleteTarget.title}" will be removed from your list.` : undefined} pending={del.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { HabitForm } from '@/components/habits/habit-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteHabitAction, logHabitAction } from '@/app/actions/habits';
import type { Habit } from '@/lib/types';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function HabitManager({ initialHabits }: { initialHabits: Habit[] }) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [dialogHabit, setDialogHabit] = useState<Habit | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const [loggedToday, setLoggedToday] = useState<Set<string>>(new Set());
  const del = useServerAction((id: string) => deleteHabitAction(id));
  const log = useServerAction(logHabitAction);

  function handleSaved(habit: Habit) {
    setHabits((current) => {
      const exists = current.some((h) => h.id === habit.id);
      return exists ? current.map((h) => (h.id === habit.id ? habit : h)) : [habit, ...current];
    });
    setDialogHabit(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setHabits((current) => current.filter((h) => h.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  }

  function handleLogToday(habit: Habit) {
    log.run({ habitId: habit.id, loggedDate: todayKey(), count: 1 }, () => {
      setLoggedToday((current) => new Set(current).add(habit.id));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogHabit('new')} className="flex items-center gap-1.5">
          <Plus size={14} /> Add habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm" style={{ color: 'var(--glow-text-muted)' }}>
            No habits yet. Add your first habit to start tracking.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {habits.map((habit) => {
            const isLogged = loggedToday.has(habit.id);
            return (
              <Card key={habit.id} className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: 'var(--glow-text)' }}>
                      {habit.name}
                    </p>
                    <p className="truncate text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                      {habit.description ?? `${habit.frequency} · target ${habit.targetCount}×`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDialogHabit(habit)}
                      aria-label="Edit habit"
                      className="rounded-full p-1.5 transition hover:opacity-70"
                      style={{ color: 'var(--glow-text-muted)' }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(habit)}
                      aria-label="Delete habit"
                      className="rounded-full p-1.5 transition hover:opacity-70"
                      style={{ color: 'var(--glow-text-muted)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={isLogged ? 'secondary' : 'primary'}
                  className="flex w-full items-center justify-center gap-1.5"
                  disabled={isLogged || log.isPending}
                  onClick={() => handleLogToday(habit)}
                >
                  <Check size={14} />
                  {isLogged ? 'Logged today' : 'Log today'}
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={dialogHabit !== null}
        onClose={() => setDialogHabit(null)}
        title={dialogHabit === 'new' ? 'Add habit' : 'Edit habit'}
      >
        <HabitForm habit={dialogHabit === 'new' ? null : dialogHabit} onSaved={handleSaved} onCancel={() => setDialogHabit(null)} />
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this habit?"
        description={deleteTarget ? `"${deleteTarget.name}" will be removed from your list.` : undefined}
        pending={del.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

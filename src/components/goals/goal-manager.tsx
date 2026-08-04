'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { GoalForm } from '@/components/goals/goal-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteGoalAction } from '@/app/actions/goals';
import type { Goal } from '@/lib/types';

export function GoalManager({ initialGoals }: { initialGoals: Goal[] }) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [dialogGoal, setDialogGoal] = useState<Goal | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const del = useServerAction((id: string) => deleteGoalAction(id));

  function handleSaved(goal: Goal) {
    setGoals((current) => {
      const exists = current.some((g) => g.id === goal.id);
      return exists ? current.map((g) => (g.id === goal.id ? goal : g)) : [goal, ...current];
    });
    setDialogGoal(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setGoals((current) => current.filter((g) => g.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogGoal('new')} className="flex items-center gap-1.5">
          <Plus size={14} /> Add goal
        </Button>
      </div>
      {goals.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm" style={{ color: 'var(--glow-text-muted)' }}>
            No goals yet. Define one clear goal to get started.
          </p>
        </Card>
      ) : (
        <Card className="grid gap-3 md:grid-cols-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-[20px] border p-4"
              style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium" style={{ color: 'var(--glow-text)' }}>
                  {goal.title}
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{ background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' }}
                  >
                    {goal.status.replace('_', ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDialogGoal(goal)}
                    aria-label="Edit goal"
                    className="rounded-full p-1.5 transition hover:opacity-70"
                    style={{ color: 'var(--glow-text-muted)' }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(goal)}
                    aria-label="Delete goal"
                    className="rounded-full p-1.5 transition hover:opacity-70"
                    style={{ color: 'var(--glow-text-muted)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {goal.description && (
                <p className="mt-2 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                  {goal.description}
                </p>
              )}
              <div className="mt-3 h-1.5 rounded-full" style={{ background: 'var(--glow-surface)' }}>
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-rose-400 to-amber-400"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--glow-text-muted)' }}>
                {goal.progress}% complete
              </p>
            </div>
          ))}
        </Card>
      )}

      <Dialog open={dialogGoal !== null} onClose={() => setDialogGoal(null)} title={dialogGoal === 'new' ? 'Add goal' : 'Edit goal'}>
        <GoalForm goal={dialogGoal === 'new' ? null : dialogGoal} onSaved={handleSaved} onCancel={() => setDialogGoal(null)} />
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this goal?"
        description={deleteTarget ? `"${deleteTarget.title}" will be removed.` : undefined}
        pending={del.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

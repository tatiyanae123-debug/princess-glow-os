'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RoutineForm } from '@/components/routines/routine-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteRoutineAction } from '@/app/actions/routines';
import type { Routine } from '@/lib/types';

export function RoutineManager({ initialRoutines }: { initialRoutines: Routine[] }) {
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [dialogRoutine, setDialogRoutine] = useState<Routine | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Routine | null>(null);
  const del = useServerAction((id: string) => deleteRoutineAction(id));

  function handleSaved(routine: Routine) {
    setRoutines((current) => {
      const exists = current.some((r) => r.id === routine.id);
      return exists ? current.map((r) => (r.id === routine.id ? routine : r)) : [routine, ...current];
    });
    setDialogRoutine(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setRoutines((current) => current.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  }

  return (
    <div className="space-y-6">
      <section
        className="rounded-[28px] border p-6 shadow-sm"
        style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface)' }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em]" style={{ color: 'var(--glow-accent)' }}>
              Routines
            </p>
            <h2 className="mt-2 text-3xl font-semibold" style={{ color: 'var(--glow-text)' }}>
              Design repeatable rituals that feel effortless.
            </h2>
            <p className="mt-3" style={{ color: 'var(--glow-text-muted)' }}>
              Design repeatable rituals that feel elegant and easy to maintain.
            </p>
          </div>
          <Button onClick={() => setDialogRoutine('new')} className="flex shrink-0 items-center gap-1.5">
            <Plus size={14} /> Add routine
          </Button>
        </div>
      </section>

      {routines.length === 0 ? (
        <p className="py-4 text-center text-sm" style={{ color: 'var(--glow-text-muted)' }}>
          No routines yet. Add your first ritual to get started.
        </p>
      ) : (
        <section
          className="rounded-[28px] border p-6 shadow-sm"
          style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface)' }}
        >
          <div className="space-y-3">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
                style={{ background: 'var(--glow-surface-muted)' }}
              >
                <div className="min-w-0">
                  <p className="font-medium" style={{ color: 'var(--glow-text)' }}>
                    {routine.name}
                  </p>
                  {routine.description && (
                    <p className="mt-0.5 truncate text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                      {routine.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs capitalize"
                    style={{ background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' }}
                  >
                    {routine.timeOfDay}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDialogRoutine(routine)}
                    aria-label="Edit routine"
                    className="rounded-full p-1.5 transition hover:opacity-70"
                    style={{ color: 'var(--glow-text-muted)' }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(routine)}
                    aria-label="Delete routine"
                    className="rounded-full p-1.5 transition hover:opacity-70"
                    style={{ color: 'var(--glow-text-muted)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Dialog
        open={dialogRoutine !== null}
        onClose={() => setDialogRoutine(null)}
        title={dialogRoutine === 'new' ? 'Add routine' : 'Edit routine'}
      >
        <RoutineForm
          routine={dialogRoutine === 'new' ? null : dialogRoutine}
          onSaved={handleSaved}
          onCancel={() => setDialogRoutine(null)}
        />
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this routine?"
        description={deleteTarget ? `"${deleteTarget.name}" will be removed.` : undefined}
        pending={del.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

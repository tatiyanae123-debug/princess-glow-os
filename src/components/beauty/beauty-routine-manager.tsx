'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BeautyRoutineForm } from '@/components/beauty/beauty-routine-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteBeautyRoutineAction } from '@/app/actions/beauty-routines';
import type { BeautyRoutine } from '@/lib/types';

export function BeautyRoutineManager({ initialRoutines }: { initialRoutines: BeautyRoutine[] }) {
  const [routines, setRoutines] = useState<BeautyRoutine[]>(initialRoutines);
  const [dialogRoutine, setDialogRoutine] = useState<BeautyRoutine | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BeautyRoutine | null>(null);
  const del = useServerAction((id: string) => deleteBeautyRoutineAction(id));

  function handleSaved(routine: BeautyRoutine) {
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogRoutine('new')} className="flex items-center gap-1.5">
          <Plus size={14} /> Add step
        </Button>
      </div>
      <Card className="space-y-3">
        {routines.length === 0 ? (
          <p className="py-4 text-center text-sm" style={{ color: 'var(--glow-text-muted)' }}>
            No beauty routines yet. Add your first ritual step.
          </p>
        ) : (
          routines.map((routine) => (
            <div
              key={routine.id}
              className="rounded-[20px] border px-4 py-3"
              style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium" style={{ color: 'var(--glow-text)' }}>
                    {routine.name}
                  </p>
                  {routine.notes && (
                    <p className="mt-1 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                      {routine.notes}
                    </p>
                  )}
                  {routine.products && routine.products.length > 0 && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--glow-text-muted)' }}>
                      {routine.products.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs capitalize"
                    style={{ background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' }}
                  >
                    {routine.timeOfDay}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDialogRoutine(routine)}
                    aria-label="Edit beauty step"
                    className="rounded-full p-1.5 transition hover:opacity-70"
                    style={{ color: 'var(--glow-text-muted)' }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(routine)}
                    aria-label="Delete beauty step"
                    className="rounded-full p-1.5 transition hover:opacity-70"
                    style={{ color: 'var(--glow-text-muted)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </Card>

      <Dialog
        open={dialogRoutine !== null}
        onClose={() => setDialogRoutine(null)}
        title={dialogRoutine === 'new' ? 'Add beauty step' : 'Edit beauty step'}
      >
        <BeautyRoutineForm
          routine={dialogRoutine === 'new' ? null : dialogRoutine}
          onSaved={handleSaved}
          onCancel={() => setDialogRoutine(null)}
        />
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this step?"
        description={deleteTarget ? `"${deleteTarget.name}" will be removed.` : undefined}
        pending={del.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

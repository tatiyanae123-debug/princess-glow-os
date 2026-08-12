'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, GripVertical, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RoutineForm } from '@/components/routines/routine-form';
import { RoutineStepPlayer } from '@/components/routines/routine-step-player';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteRoutineAction, createRoutineStepAction, deleteRoutineStepAction } from '@/app/actions/routines';
import type { Routine, RoutineStep } from '@/lib/types';

export function RoutineManager({ initialRoutines, initialSteps }: { initialRoutines: Routine[]; initialSteps: RoutineStep[] }) {
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [steps, setSteps] = useState<RoutineStep[]>(initialSteps);
  const [dialogRoutine, setDialogRoutine] = useState<Routine | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Routine | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [playing, setPlaying] = useState<Routine | null>(null);
  const [newStepTitle, setNewStepTitle] = useState('');
  const del = useServerAction((id: string) => deleteRoutineAction(id));
  const addStep = useServerAction(createRoutineStepAction);
  const removeStep = useServerAction((id: string) => deleteRoutineStepAction(id));

  const stepsByRoutine = useMemo(() => {
    const map = new Map<string, RoutineStep[]>();
    for (const step of steps) {
      const list = map.get(step.routineId) ?? [];
      list.push(step);
      map.set(step.routineId, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.order - b.order);
    return map;
  }, [steps]);

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

  function handleAddStep(routine: Routine) {
    if (!newStepTitle.trim()) return;
    const order = (stepsByRoutine.get(routine.id)?.length ?? 0);
    addStep.run({ routineId: routine.id, title: newStepTitle.trim(), order }, (saved) => {
      setSteps((current) => [...current, saved]);
      setNewStepTitle('');
    });
  }

  function handleRemoveStep(step: RoutineStep) {
    removeStep.run(step.id, () => setSteps((current) => current.filter((item) => item.id !== step.id)));
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-3 rounded-[24px] border p-5" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface)' }}>
        <div>
          <p className="glow-eyebrow">Routine library</p>
          <h2 className="glow-display mt-1 text-[22px]" style={{ color: 'var(--glow-text)' }}>Design repeatable rituals that feel effortless.</h2>
          <p className="mt-2 text-[9px] leading-4" style={{ color: 'var(--glow-text-muted)' }}>Add steps to any routine to turn it into a guided, one-step-at-a-time ritual.</p>
        </div>
        <Button onClick={() => setDialogRoutine('new')} className="flex shrink-0 items-center gap-1.5"><Plus size={14} /> Add routine</Button>
      </section>

      {routines.length === 0 ? (
        <p className="py-4 text-center text-sm" style={{ color: 'var(--glow-text-muted)' }}>No routines yet. Add your first ritual to get started.</p>
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => {
            const routineSteps = stepsByRoutine.get(routine.id) ?? [];
            const isOpen = expanded === routine.id;
            return (
              <section key={routine.id} className="overflow-hidden rounded-[20px] border" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface)' }}>
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                  <button type="button" onClick={() => setExpanded(isOpen ? null : routine.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                    <ChevronDown size={14} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--glow-text-muted)' }} />
                    <div className="min-w-0">
                      <p className="truncate font-medium" style={{ color: 'var(--glow-text)' }}>{routine.name}</p>
                      <p className="text-[10px]" style={{ color: 'var(--glow-text-muted)' }}>{routineSteps.length} step{routineSteps.length === 1 ? '' : 's'} · {routine.timeOfDay}</p>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    <button type="button" onClick={() => setPlaying(routine)} className="flex items-center gap-1.5 rounded-full bg-[#322926] px-3 py-2 text-[9px] font-semibold text-white"><Play size={11} />Start ritual</button>
                    <button type="button" onClick={() => setDialogRoutine(routine)} aria-label="Edit routine" className="rounded-full p-1.5 transition hover:opacity-70" style={{ color: 'var(--glow-text-muted)' }}><Pencil size={13} /></button>
                    <button type="button" onClick={() => setDeleteTarget(routine)} aria-label="Delete routine" className="rounded-full p-1.5 transition hover:opacity-70" style={{ color: 'var(--glow-text-muted)' }}><Trash2 size={13} /></button>
                  </div>
                </div>

                {isOpen ? (
                  <div className="border-t px-4 py-4" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}>
                    {routineSteps.length === 0 ? (
                      <p className="text-[10px]" style={{ color: 'var(--glow-text-muted)' }}>No steps yet. Add the first step below.</p>
                    ) : (
                      <ol className="space-y-1.5">
                        {routineSteps.map((step, index) => (
                          <li key={step.id} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
                            <GripVertical size={12} className="shrink-0 text-[#c9bab3]" />
                            <span className="text-[9px] font-semibold text-[#a16c72]">{index + 1}</span>
                            <span className="min-w-0 flex-1 truncate text-[10px]" style={{ color: 'var(--glow-text)' }}>{step.title}</span>
                            {step.durationMinutes ? <span className="text-[8px] text-[#9c837b]">{step.durationMinutes}m</span> : null}
                            <button type="button" onClick={() => handleRemoveStep(step)} aria-label="Remove step" className="rounded-full p-1 text-[#a1897f] hover:bg-[#f4ece6]"><Trash2 size={11} /></button>
                          </li>
                        ))}
                      </ol>
                    )}
                    <form
                      onSubmit={(event) => { event.preventDefault(); handleAddStep(routine); }}
                      className="mt-3 flex gap-2"
                    >
                      <input
                        value={newStepTitle}
                        onChange={(event) => setNewStepTitle(event.target.value)}
                        placeholder="Add a step, e.g. Cleanse face"
                        className="min-w-0 flex-1 rounded-lg border border-[#e6d9d1] px-3 py-2 text-[10px]"
                      />
                      <button type="submit" disabled={addStep.isPending} className="rounded-lg bg-[#322926] px-3 py-2 text-[9px] font-semibold text-white disabled:opacity-50">Add step</button>
                    </form>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}

      <Dialog open={dialogRoutine !== null} onClose={() => setDialogRoutine(null)} title={dialogRoutine === 'new' ? 'Add routine' : 'Edit routine'}>
        <RoutineForm routine={dialogRoutine === 'new' ? null : dialogRoutine} onSaved={handleSaved} onCancel={() => setDialogRoutine(null)} />
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this routine?"
        description={deleteTarget ? `"${deleteTarget.name}" will be removed.` : undefined}
        pending={del.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {playing ? (
        <RoutineStepPlayer routine={playing} steps={stepsByRoutine.get(playing.id) ?? []} onClose={() => setPlaying(null)} />
      ) : null}
    </div>
  );
}
